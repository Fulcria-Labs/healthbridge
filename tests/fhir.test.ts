import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  getPatientName,
  getActiveConditions,
  getCurrentMedications,
  getAllergies,
  generatePatientSummary,
  createSyntheticPatient,
  type FHIRPatient,
  type FHIRCondition,
  type FHIRMedicationStatement,
  type FHIRAllergyIntolerance,
  type FHIRBundle,
} from '../src/utils/fhir';
import { getPatientSummary } from '../src/tools/patient-summary-tool';

describe('FHIR Utilities', () => {
  describe('calculateAge', () => {
    it('calculates age correctly', () => {
      const today = new Date();
      const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
      const age = calculateAge(tenYearsAgo.toISOString().split('T')[0]);
      expect(age).toBe(10);
    });

    it('handles birthday not yet passed this year', () => {
      const today = new Date();
      // Set birthday to next month
      const futureMonth = (today.getMonth() + 2) % 12;
      const birthYear = today.getFullYear() - 30;
      const birthday = `${birthYear}-${String(futureMonth + 1).padStart(2, '0')}-15`;
      const age = calculateAge(birthday);
      expect(age).toBe(29);
    });
  });

  describe('getPatientName', () => {
    it('returns full name from given and family', () => {
      const patient: FHIRPatient = {
        resourceType: 'Patient', id: '1',
        name: [{ family: 'Doe', given: ['John'] }],
      };
      expect(getPatientName(patient)).toBe('John Doe');
    });

    it('returns text name if available', () => {
      const patient: FHIRPatient = {
        resourceType: 'Patient', id: '1',
        name: [{ text: 'Dr. Jane Smith' }],
      };
      expect(getPatientName(patient)).toBe('Dr. Jane Smith');
    });

    it('returns Unknown for missing name', () => {
      const patient: FHIRPatient = { resourceType: 'Patient', id: '1' };
      expect(getPatientName(patient)).toBe('Unknown');
    });

    it('handles multiple given names', () => {
      const patient: FHIRPatient = {
        resourceType: 'Patient', id: '1',
        name: [{ family: 'Smith', given: ['John', 'A'] }],
      };
      expect(getPatientName(patient)).toBe('John A Smith');
    });
  });

  describe('getActiveConditions', () => {
    it('returns active conditions', () => {
      const conditions: FHIRCondition[] = [
        {
          resourceType: 'Condition', id: '1',
          code: { text: 'Hypertension' },
          clinicalStatus: { coding: [{ code: 'active' }] },
        },
        {
          resourceType: 'Condition', id: '2',
          code: { text: 'Resolved Pneumonia' },
          clinicalStatus: { coding: [{ code: 'resolved' }] },
        },
      ];
      const active = getActiveConditions(conditions);
      expect(active).toEqual(['Hypertension']);
    });

    it('includes conditions without status (assumed active)', () => {
      const conditions: FHIRCondition[] = [
        {
          resourceType: 'Condition', id: '1',
          code: { text: 'Diabetes' },
        },
      ];
      const active = getActiveConditions(conditions);
      expect(active).toEqual(['Diabetes']);
    });

    it('uses coding display if text unavailable', () => {
      const conditions: FHIRCondition[] = [
        {
          resourceType: 'Condition', id: '1',
          code: { coding: [{ display: 'Asthma' }] },
          clinicalStatus: { coding: [{ code: 'active' }] },
        },
      ];
      expect(getActiveConditions(conditions)).toEqual(['Asthma']);
    });
  });

  describe('getCurrentMedications', () => {
    it('returns active medications', () => {
      const meds: FHIRMedicationStatement[] = [
        {
          resourceType: 'MedicationStatement', id: '1',
          medicationCodeableConcept: { text: 'Metformin 500mg' },
          status: 'active',
          dosage: [{ text: '500mg twice daily' }],
        },
        {
          resourceType: 'MedicationStatement', id: '2',
          medicationCodeableConcept: { text: 'Amoxicillin' },
          status: 'completed',
        },
      ];
      const current = getCurrentMedications(meds);
      expect(current.length).toBe(1);
      expect(current[0].name).toBe('Metformin 500mg');
      expect(current[0].dosage).toBe('500mg twice daily');
    });

    it('includes intended medications', () => {
      const meds: FHIRMedicationStatement[] = [
        {
          resourceType: 'MedicationStatement', id: '1',
          medicationCodeableConcept: { text: 'Lisinopril' },
          status: 'intended',
        },
      ];
      expect(getCurrentMedications(meds).length).toBe(1);
    });
  });

  describe('getAllergies', () => {
    it('extracts allergy information', () => {
      const allergies: FHIRAllergyIntolerance[] = [
        {
          resourceType: 'AllergyIntolerance', id: '1',
          code: { text: 'Penicillin' },
          type: 'allergy',
          criticality: 'high',
          reaction: [{ manifestation: [{ text: 'Anaphylaxis' }], severity: 'severe' }],
        },
      ];
      const result = getAllergies(allergies);
      expect(result.length).toBe(1);
      expect(result[0].substance).toBe('Penicillin');
      expect(result[0].criticality).toBe('high');
      expect(result[0].reactions).toContain('Anaphylaxis');
    });
  });
});

describe('Synthetic Patient', () => {
  it('creates valid FHIR bundle', () => {
    const bundle = createSyntheticPatient();
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.entry!.length).toBeGreaterThan(0);
  });

  it('contains a patient resource', () => {
    const bundle = createSyntheticPatient();
    const patient = bundle.entry!.find(e => e.resource.resourceType === 'Patient');
    expect(patient).toBeDefined();
  });

  it('contains conditions', () => {
    const bundle = createSyntheticPatient();
    const conditions = bundle.entry!.filter(e => e.resource.resourceType === 'Condition');
    expect(conditions.length).toBeGreaterThan(0);
  });

  it('contains medications', () => {
    const bundle = createSyntheticPatient();
    const meds = bundle.entry!.filter(e => e.resource.resourceType === 'MedicationStatement');
    expect(meds.length).toBeGreaterThan(0);
  });

  it('contains allergies', () => {
    const bundle = createSyntheticPatient();
    const allergies = bundle.entry!.filter(e => e.resource.resourceType === 'AllergyIntolerance');
    expect(allergies.length).toBeGreaterThan(0);
  });

  it('contains observations', () => {
    const bundle = createSyntheticPatient();
    const obs = bundle.entry!.filter(e => e.resource.resourceType === 'Observation');
    expect(obs.length).toBeGreaterThan(0);
  });
});

describe('Patient Summary Generation', () => {
  it('generates summary from synthetic data', () => {
    const bundle = createSyntheticPatient();
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.name).toContain('John');
    expect(summary.patient.gender).toBe('male');
    expect(summary.conditions.length).toBeGreaterThan(0);
    expect(summary.medications.length).toBeGreaterThan(0);
    expect(summary.allergies.length).toBeGreaterThan(0);
  });

  it('calculates patient age', () => {
    const bundle = createSyntheticPatient();
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.age).not.toBeNull();
    expect(summary.patient.age!).toBeGreaterThan(60);
  });
});

describe('Patient Summary Tool', () => {
  it('returns summary with synthetic data', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    expect(result.dataSource).toContain('Synthetic');
    expect(result.patient.name).toContain('John');
    expect(result.clinicalNotes.length).toBeGreaterThan(0);
  });

  it('generates clinical notes for AF patient on warfarin', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    const afNote = result.clinicalNotes.find(n => n.includes('anticoagulation'));
    expect(afNote).toBeDefined();
  });

  it('flags high-criticality allergies', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    // Check that allergies are present in the output
    expect(result.allergies.length).toBeGreaterThan(0);
    expect(result.allergies.some(a => a.criticality === 'high')).toBe(true);
  });

  it('accepts custom FHIR bundle', () => {
    const customBundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'custom-001',
            name: [{ family: 'Custom', given: ['Patient'] }],
            gender: 'female',
            birthDate: '1990-01-01',
          },
        },
      ],
    };
    const result = getPatientSummary({ fhirBundle: customBundle });
    expect(result.dataSource).toBe('Provided FHIR Bundle');
    expect(result.patient.name).toBe('Patient Custom');
  });
});

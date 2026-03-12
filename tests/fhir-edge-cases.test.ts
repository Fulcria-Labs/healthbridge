import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  getPatientName,
  getActiveConditions,
  getCurrentMedications,
  getLatestObservation,
  getAllergies,
  generatePatientSummary,
  createSyntheticPatient,
  type FHIRBundle,
  type FHIRPatient,
  type FHIRCondition,
  type FHIRMedicationStatement,
  type FHIRObservation,
  type FHIRAllergyIntolerance,
} from '../src/utils/fhir';
import { getPatientSummary } from '../src/tools/patient-summary-tool';

/**
 * Edge cases for FHIR data transformation and patient summary generation.
 */

describe('calculateAge Edge Cases', () => {
  it('handles current year birthdate', () => {
    const age = calculateAge('2026-01-01');
    expect(age).toBeGreaterThanOrEqual(0);
    expect(age).toBeLessThanOrEqual(1);
  });

  it('handles very old birthdate', () => {
    const age = calculateAge('1920-06-15');
    expect(age).toBeGreaterThanOrEqual(105);
  });

  it('handles birthdate today results in age 0', () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const age = calculateAge(dateStr);
    expect(age).toBe(0);
  });

  it('handles February 29 birthdate in non-leap year', () => {
    // Born on Feb 29 in a leap year
    const age = calculateAge('2000-02-29');
    expect(age).toBeGreaterThanOrEqual(25);
  });

  it('handles end-of-year birthdate', () => {
    const age = calculateAge('1990-12-31');
    expect(age).toBeGreaterThanOrEqual(35);
  });
});

describe('getPatientName Edge Cases', () => {
  it('returns Unknown for empty name array', () => {
    const name = getPatientName({ resourceType: 'Patient', id: '1', name: [] });
    expect(name).toBe('Unknown');
  });

  it('returns Unknown for undefined name', () => {
    const name = getPatientName({ resourceType: 'Patient', id: '1' });
    expect(name).toBe('Unknown');
  });

  it('returns text name when provided', () => {
    const name = getPatientName({
      resourceType: 'Patient', id: '1',
      name: [{ text: 'Dr. John Smith III' }],
    });
    expect(name).toBe('Dr. John Smith III');
  });

  it('combines given and family names', () => {
    const name = getPatientName({
      resourceType: 'Patient', id: '1',
      name: [{ given: ['John'], family: 'Smith' }],
    });
    expect(name).toBe('John Smith');
  });

  it('handles multiple given names', () => {
    const name = getPatientName({
      resourceType: 'Patient', id: '1',
      name: [{ given: ['John', 'Michael'], family: 'Smith' }],
    });
    expect(name).toBe('John Michael Smith');
  });

  it('handles given name only', () => {
    const name = getPatientName({
      resourceType: 'Patient', id: '1',
      name: [{ given: ['John'] }],
    });
    expect(name).toBe('John');
  });

  it('handles family name only', () => {
    const name = getPatientName({
      resourceType: 'Patient', id: '1',
      name: [{ family: 'Smith' }],
    });
    expect(name).toBe('Smith');
  });

  it('returns Unknown for empty name object', () => {
    const name = getPatientName({
      resourceType: 'Patient', id: '1',
      name: [{}],
    });
    expect(name).toBe('Unknown');
  });
});

describe('getActiveConditions Edge Cases', () => {
  it('returns empty array for no conditions', () => {
    expect(getActiveConditions([])).toEqual([]);
  });

  it('includes active conditions', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', code: { text: 'Diabetes' }, clinicalStatus: { coding: [{ code: 'active' }] } },
    ];
    expect(getActiveConditions(conditions)).toContain('Diabetes');
  });

  it('includes recurrence conditions', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', code: { text: 'Cancer' }, clinicalStatus: { coding: [{ code: 'recurrence' }] } },
    ];
    expect(getActiveConditions(conditions)).toContain('Cancer');
  });

  it('excludes resolved conditions', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', code: { text: 'Flu' }, clinicalStatus: { coding: [{ code: 'resolved' }] } },
    ];
    expect(getActiveConditions(conditions)).toEqual([]);
  });

  it('excludes inactive conditions', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', code: { text: 'Old Injury' }, clinicalStatus: { coding: [{ code: 'inactive' }] } },
    ];
    expect(getActiveConditions(conditions)).toEqual([]);
  });

  it('includes conditions without status (assumed active)', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', code: { text: 'Hypertension' } },
    ];
    expect(getActiveConditions(conditions)).toContain('Hypertension');
  });

  it('falls back to coding display when text is missing', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', code: { coding: [{ display: 'Asthma' }] }, clinicalStatus: { coding: [{ code: 'active' }] } },
    ];
    expect(getActiveConditions(conditions)).toContain('Asthma');
  });

  it('returns "Unknown condition" when both text and coding are missing', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', code: {}, clinicalStatus: { coding: [{ code: 'active' }] } },
    ];
    expect(getActiveConditions(conditions)).toContain('Unknown condition');
  });
});

describe('getCurrentMedications Edge Cases', () => {
  it('returns empty array for no medications', () => {
    expect(getCurrentMedications([])).toEqual([]);
  });

  it('includes active medications', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { text: 'Metformin 500mg' }, status: 'active', dosage: [{ text: '500mg twice daily' }] },
    ];
    const result = getCurrentMedications(meds);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Metformin 500mg');
    expect(result[0].dosage).toBe('500mg twice daily');
  });

  it('includes intended medications', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { text: 'New Drug' }, status: 'intended' },
    ];
    expect(getCurrentMedications(meds).length).toBe(1);
  });

  it('includes medications without status', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { text: 'Unknown Status Med' } },
    ];
    expect(getCurrentMedications(meds).length).toBe(1);
  });

  it('excludes stopped medications', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { text: 'Old Drug' }, status: 'stopped' },
    ];
    expect(getCurrentMedications(meds)).toEqual([]);
  });

  it('excludes completed medications', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { text: 'Course Done' }, status: 'completed' },
    ];
    expect(getCurrentMedications(meds)).toEqual([]);
  });

  it('falls back to coding display for name', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { coding: [{ display: 'Coded Drug' }] }, status: 'active' },
    ];
    const result = getCurrentMedications(meds);
    expect(result[0].name).toBe('Coded Drug');
  });

  it('returns "Dosage not specified" when no dosage', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { text: 'Drug' }, status: 'active' },
    ];
    const result = getCurrentMedications(meds);
    expect(result[0].dosage).toBe('Dosage not specified');
  });
});

describe('getLatestObservation Edge Cases', () => {
  it('returns null for empty observations', () => {
    expect(getLatestObservation([], 'heart-rate')).toBeNull();
  });

  it('returns null for no matching observations', () => {
    const obs: FHIRObservation[] = [
      { resourceType: 'Observation', id: '1', code: { text: 'blood-pressure' }, valueQuantity: { value: 120 } },
    ];
    expect(getLatestObservation(obs, 'heart-rate')).toBeNull();
  });

  it('returns the most recent observation by date', () => {
    const obs: FHIRObservation[] = [
      { resourceType: 'Observation', id: '1', code: { text: 'heart-rate' }, valueQuantity: { value: 70 }, effectiveDateTime: '2026-01-01T10:00:00Z' },
      { resourceType: 'Observation', id: '2', code: { text: 'heart-rate' }, valueQuantity: { value: 85 }, effectiveDateTime: '2026-03-01T10:00:00Z' },
    ];
    const result = getLatestObservation(obs, 'heart-rate');
    expect(result).not.toBeNull();
    expect(result!.valueQuantity!.value).toBe(85);
  });

  it('matches by code display', () => {
    const obs: FHIRObservation[] = [
      { resourceType: 'Observation', id: '1', code: { coding: [{ display: 'Heart Rate' }] }, valueQuantity: { value: 75 } },
    ];
    const result = getLatestObservation(obs, 'Heart Rate');
    expect(result).not.toBeNull();
  });

  it('handles observation without effective date', () => {
    const obs: FHIRObservation[] = [
      { resourceType: 'Observation', id: '1', code: { text: 'heart-rate' }, valueQuantity: { value: 75 } },
    ];
    const result = getLatestObservation(obs, 'heart-rate');
    expect(result).not.toBeNull();
  });
});

describe('getAllergies Edge Cases', () => {
  it('returns empty array for no allergies', () => {
    expect(getAllergies([])).toEqual([]);
  });

  it('extracts allergy with all fields', () => {
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
    expect(result[0].type).toBe('allergy');
    expect(result[0].criticality).toBe('high');
    expect(result[0].reactions).toContain('Anaphylaxis');
  });

  it('handles allergy without type', () => {
    const allergies: FHIRAllergyIntolerance[] = [
      { resourceType: 'AllergyIntolerance', id: '1', code: { text: 'Shellfish' } },
    ];
    const result = getAllergies(allergies);
    expect(result[0].type).toBe('unknown');
  });

  it('handles allergy without criticality', () => {
    const allergies: FHIRAllergyIntolerance[] = [
      { resourceType: 'AllergyIntolerance', id: '1', code: { text: 'Pollen' } },
    ];
    const result = getAllergies(allergies);
    expect(result[0].criticality).toBe('unknown');
  });

  it('handles allergy without reactions', () => {
    const allergies: FHIRAllergyIntolerance[] = [
      { resourceType: 'AllergyIntolerance', id: '1', code: { text: 'Latex' } },
    ];
    const result = getAllergies(allergies);
    expect(result[0].reactions).toEqual([]);
  });

  it('handles multiple reactions', () => {
    const allergies: FHIRAllergyIntolerance[] = [
      {
        resourceType: 'AllergyIntolerance', id: '1',
        code: { text: 'Aspirin' },
        reaction: [
          { manifestation: [{ text: 'Hives' }, { text: 'Swelling' }] },
        ],
      },
    ];
    const result = getAllergies(allergies);
    expect(result[0].reactions.length).toBe(2);
    expect(result[0].reactions).toContain('Hives');
    expect(result[0].reactions).toContain('Swelling');
  });
});

describe('generatePatientSummary Edge Cases', () => {
  it('handles bundle with no entries', () => {
    const bundle: FHIRBundle = { resourceType: 'Bundle', type: 'collection', entry: [] };
    const result = generatePatientSummary(bundle);
    expect(result.patient.name).toBe('Unknown');
    expect(result.patient.age).toBeNull();
    expect(result.conditions).toEqual([]);
    expect(result.medications).toEqual([]);
    expect(result.allergies).toEqual([]);
  });

  it('handles bundle with undefined entries', () => {
    const bundle: FHIRBundle = { resourceType: 'Bundle', type: 'collection' };
    const result = generatePatientSummary(bundle);
    expect(result.patient.name).toBe('Unknown');
  });

  it('handles bundle with only patient resource', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [{ resource: { resourceType: 'Patient', id: '1', name: [{ family: 'Test' }], gender: 'male' } }],
    };
    const result = generatePatientSummary(bundle);
    expect(result.patient.name).toBe('Test');
    expect(result.patient.gender).toBe('male');
    expect(result.conditions).toEqual([]);
  });

  it('handles patient without birthdate', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [{ resource: { resourceType: 'Patient', id: '1', name: [{ family: 'NoBirth' }] } }],
    };
    const result = generatePatientSummary(bundle);
    expect(result.patient.age).toBeNull();
  });

  it('handles patient without gender', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [{ resource: { resourceType: 'Patient', id: '1' } }],
    };
    const result = generatePatientSummary(bundle);
    expect(result.patient.gender).toBe('unknown');
  });

  it('extracts vitals from observations', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [
        { resource: { resourceType: 'Patient', id: '1' } },
        {
          resource: {
            resourceType: 'Observation', id: 'obs-1',
            code: { text: 'heart-rate' },
            valueQuantity: { value: 72, unit: 'bpm' },
            effectiveDateTime: '2026-03-10T10:00:00Z',
          },
        },
      ],
    };
    const result = generatePatientSummary(bundle);
    expect(result.vitals['Heart Rate']).toBeDefined();
    expect(result.vitals['Heart Rate'].value).toBe(72);
  });
});

describe('getPatientSummary Tool Edge Cases', () => {
  it('synthetic data is consistent across calls', () => {
    const result1 = getPatientSummary({ useSyntheticData: true });
    const result2 = getPatientSummary({ useSyntheticData: true });
    expect(result1.patient.name).toBe(result2.patient.name);
    expect(result1.patient.gender).toBe(result2.patient.gender);
    expect(result1.conditions).toEqual(result2.conditions);
  });

  it('custom FHIR bundle overrides synthetic data', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [
        { resource: { resourceType: 'Patient', id: '1', name: [{ given: ['Custom'], family: 'Patient' }], gender: 'female', birthDate: '1990-01-01' } },
        { resource: { resourceType: 'Condition', id: 'c1', code: { text: 'Custom Condition' }, clinicalStatus: { coding: [{ code: 'active' }] } } },
      ],
    };
    const result = getPatientSummary({ fhirBundle: bundle });
    expect(result.patient.name).toBe('Custom Patient');
    expect(result.conditions).toContain('Custom Condition');
    expect(result.dataSource).toContain('Provided');
  });

  it('generates clinical notes for AF + warfarin', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    // Synthetic patient has AF + warfarin
    const afNote = result.clinicalNotes.find(n => n.includes('anticoagulation'));
    expect(afNote).toBeDefined();
  });

  it('generates clinical notes for diabetes + metformin', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    // Synthetic patient has diabetes + metformin
    const dmNote = result.clinicalNotes.find(n => n.includes('HbA1c'));
    expect(dmNote).toBeDefined();
  });

  it('generates clinical notes for hypertension', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    const htNote = result.clinicalNotes.find(n => n.includes('blood pressure'));
    expect(htNote).toBeDefined();
  });

  it('generates clinical notes for high-criticality allergies', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    const allergyNote = result.clinicalNotes.find(n => n.includes('High-criticality'));
    expect(allergyNote).toBeDefined();
  });

  it('no clinical notes for empty bundle', () => {
    const bundle: FHIRBundle = { resourceType: 'Bundle', type: 'collection', entry: [] };
    const result = getPatientSummary({ fhirBundle: bundle });
    expect(result.clinicalNotes.length).toBe(0);
  });
});

describe('Synthetic Patient Bundle Integrity', () => {
  it('has valid resourceType', () => {
    const bundle = createSyntheticPatient();
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
  });

  it('contains all required resource types', () => {
    const bundle = createSyntheticPatient();
    const types = new Set(bundle.entry?.map(e => e.resource.resourceType));
    expect(types.has('Patient')).toBeTruthy();
    expect(types.has('Condition')).toBeTruthy();
    expect(types.has('MedicationStatement')).toBeTruthy();
    expect(types.has('AllergyIntolerance')).toBeTruthy();
    expect(types.has('Observation')).toBeTruthy();
  });

  it('patient has valid birthdate format', () => {
    const bundle = createSyntheticPatient();
    const patient = bundle.entry?.find(e => e.resource.resourceType === 'Patient')?.resource as FHIRPatient;
    expect(patient.birthDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('conditions have clinical status', () => {
    const bundle = createSyntheticPatient();
    const conditions = bundle.entry?.filter(e => e.resource.resourceType === 'Condition')
      .map(e => e.resource as FHIRCondition) ?? [];
    for (const cond of conditions) {
      expect(cond.clinicalStatus?.coding?.[0]?.code).toBe('active');
    }
  });

  it('medications have status', () => {
    const bundle = createSyntheticPatient();
    const meds = bundle.entry?.filter(e => e.resource.resourceType === 'MedicationStatement')
      .map(e => e.resource as FHIRMedicationStatement) ?? [];
    for (const med of meds) {
      expect(med.status).toBe('active');
    }
  });
});

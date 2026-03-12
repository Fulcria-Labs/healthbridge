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
  type FHIRPatient,
  type FHIRCondition,
  type FHIRMedicationStatement,
  type FHIRObservation,
  type FHIRAllergyIntolerance,
  type FHIRBundle,
} from '../src/utils/fhir';
import { getPatientSummary } from '../src/tools/patient-summary-tool';

describe('calculateAge Edge Cases', () => {
  it('calculates age for newborn (born today)', () => {
    const today = new Date();
    const birthDate = today.toISOString().split('T')[0];
    const age = calculateAge(birthDate);
    expect(age).toBe(0);
  });

  it('calculates age for very old person', () => {
    const age = calculateAge('1920-01-01');
    expect(age).toBeGreaterThan(100);
  });

  it('handles same month, future day (birthday not yet passed)', () => {
    const today = new Date();
    const futureDay = today.getDate() + 5;
    if (futureDay <= 28) { // avoid month overflow
      const birthday = `${today.getFullYear() - 25}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(futureDay).padStart(2, '0')}`;
      const age = calculateAge(birthday);
      expect(age).toBe(24);
    }
  });

  it('handles same month, same day (birthday today)', () => {
    const today = new Date();
    const birthday = `${today.getFullYear() - 50}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const age = calculateAge(birthday);
    expect(age).toBe(50);
  });

  it('handles leap year birthday', () => {
    // Feb 29, 2000 - a leap year
    const age = calculateAge('2000-02-29');
    expect(age).toBeGreaterThanOrEqual(25);
  });
});

describe('getPatientName Edge Cases', () => {
  it('returns Unknown for empty name array', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1',
      name: [],
    };
    expect(getPatientName(patient)).toBe('Unknown');
  });

  it('handles name with only family', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1',
      name: [{ family: 'Smith' }],
    };
    expect(getPatientName(patient)).toBe('Smith');
  });

  it('handles name with only given', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1',
      name: [{ given: ['John'] }],
    };
    expect(getPatientName(patient)).toBe('John');
  });

  it('handles name with empty given array', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1',
      name: [{ family: 'Smith', given: [] }],
    };
    expect(getPatientName(patient)).toBe('Smith');
  });

  it('prefers text over constructed name', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1',
      name: [{ text: 'Dr. Smith', family: 'Smith', given: ['John'] }],
    };
    expect(getPatientName(patient)).toBe('Dr. Smith');
  });

  it('handles name with no text, family, or given (returns Unknown)', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1',
      name: [{ use: 'official' }],
    };
    expect(getPatientName(patient)).toBe('Unknown');
  });
});

describe('getActiveConditions Edge Cases', () => {
  it('returns empty array for empty input', () => {
    expect(getActiveConditions([])).toHaveLength(0);
  });

  it('includes recurrence status conditions', () => {
    const conditions: FHIRCondition[] = [
      {
        resourceType: 'Condition', id: '1',
        code: { text: 'Depression' },
        clinicalStatus: { coding: [{ code: 'recurrence' }] },
      },
    ];
    expect(getActiveConditions(conditions)).toEqual(['Depression']);
  });

  it('excludes inactive and remission conditions', () => {
    const conditions: FHIRCondition[] = [
      {
        resourceType: 'Condition', id: '1',
        code: { text: 'Cancer' },
        clinicalStatus: { coding: [{ code: 'inactive' }] },
      },
      {
        resourceType: 'Condition', id: '2',
        code: { text: 'Leukemia' },
        clinicalStatus: { coding: [{ code: 'remission' }] },
      },
    ];
    expect(getActiveConditions(conditions)).toHaveLength(0);
  });

  it('returns Unknown condition for missing code', () => {
    const conditions: FHIRCondition[] = [
      {
        resourceType: 'Condition', id: '1',
        clinicalStatus: { coding: [{ code: 'active' }] },
      },
    ];
    const result = getActiveConditions(conditions);
    expect(result).toEqual(['Unknown condition']);
  });

  it('handles condition with coding but no text', () => {
    const conditions: FHIRCondition[] = [
      {
        resourceType: 'Condition', id: '1',
        code: { coding: [{ display: 'COPD' }] },
        clinicalStatus: { coding: [{ code: 'active' }] },
      },
    ];
    expect(getActiveConditions(conditions)).toEqual(['COPD']);
  });

  it('handles condition with empty coding array', () => {
    const conditions: FHIRCondition[] = [
      {
        resourceType: 'Condition', id: '1',
        code: { coding: [] },
        clinicalStatus: { coding: [{ code: 'active' }] },
      },
    ];
    const result = getActiveConditions(conditions);
    expect(result).toEqual(['Unknown condition']);
  });
});

describe('getCurrentMedications Edge Cases', () => {
  it('returns empty array for empty input', () => {
    expect(getCurrentMedications([])).toHaveLength(0);
  });

  it('includes medications without status (assumed active)', () => {
    const meds: FHIRMedicationStatement[] = [
      {
        resourceType: 'MedicationStatement', id: '1',
        medicationCodeableConcept: { text: 'Aspirin 81mg' },
      },
    ];
    const result = getCurrentMedications(meds);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Aspirin 81mg');
    expect(result[0].dosage).toBe('Dosage not specified');
  });

  it('excludes stopped and completed medications', () => {
    const meds: FHIRMedicationStatement[] = [
      {
        resourceType: 'MedicationStatement', id: '1',
        medicationCodeableConcept: { text: 'Stopped Drug' },
        status: 'stopped',
      },
      {
        resourceType: 'MedicationStatement', id: '2',
        medicationCodeableConcept: { text: 'Completed Drug' },
        status: 'completed',
      },
    ];
    expect(getCurrentMedications(meds)).toHaveLength(0);
  });

  it('uses coding display when text is missing', () => {
    const meds: FHIRMedicationStatement[] = [
      {
        resourceType: 'MedicationStatement', id: '1',
        medicationCodeableConcept: { coding: [{ display: 'Metoprolol 50mg' }] },
        status: 'active',
      },
    ];
    const result = getCurrentMedications(meds);
    expect(result[0].name).toBe('Metoprolol 50mg');
  });

  it('returns Unknown for medication with no name', () => {
    const meds: FHIRMedicationStatement[] = [
      {
        resourceType: 'MedicationStatement', id: '1',
        status: 'active',
      },
    ];
    const result = getCurrentMedications(meds);
    expect(result[0].name).toBe('Unknown');
  });
});

describe('getLatestObservation (directly tested)', () => {
  it('returns null for empty observations array', () => {
    const result = getLatestObservation([], 'heart-rate');
    expect(result).toBeNull();
  });

  it('returns null when no observations match the code', () => {
    const observations: FHIRObservation[] = [
      {
        resourceType: 'Observation', id: '1',
        code: { text: 'blood-pressure', coding: [{ display: 'Blood Pressure' }] },
        valueQuantity: { value: 120, unit: 'mmHg' },
      },
    ];
    const result = getLatestObservation(observations, 'heart-rate');
    expect(result).toBeNull();
  });

  it('returns the latest observation by date', () => {
    const observations: FHIRObservation[] = [
      {
        resourceType: 'Observation', id: '1',
        code: { text: 'heart-rate' },
        valueQuantity: { value: 72, unit: 'bpm' },
        effectiveDateTime: '2026-01-01T10:00:00Z',
      },
      {
        resourceType: 'Observation', id: '2',
        code: { text: 'heart-rate' },
        valueQuantity: { value: 88, unit: 'bpm' },
        effectiveDateTime: '2026-03-01T10:00:00Z',
      },
      {
        resourceType: 'Observation', id: '3',
        code: { text: 'heart-rate' },
        valueQuantity: { value: 65, unit: 'bpm' },
        effectiveDateTime: '2026-02-01T10:00:00Z',
      },
    ];
    const result = getLatestObservation(observations, 'heart-rate');
    expect(result).not.toBeNull();
    expect(result!.valueQuantity!.value).toBe(88);
  });

  it('matches by coding code field', () => {
    const observations: FHIRObservation[] = [
      {
        resourceType: 'Observation', id: '1',
        code: { coding: [{ code: '8867-4', display: 'Heart rate' }] },
        valueQuantity: { value: 72, unit: 'bpm' },
      },
    ];
    const result = getLatestObservation(observations, '8867-4');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('1');
  });

  it('matches by coding display field (case-insensitive)', () => {
    const observations: FHIRObservation[] = [
      {
        resourceType: 'Observation', id: '1',
        code: { coding: [{ display: 'Blood Pressure' }] },
        valueQuantity: { value: 120, unit: 'mmHg' },
      },
    ];
    const result = getLatestObservation(observations, 'blood pressure');
    expect(result).not.toBeNull();
  });

  it('matches by text field (case-insensitive)', () => {
    const observations: FHIRObservation[] = [
      {
        resourceType: 'Observation', id: '1',
        code: { text: 'Body Temperature' },
        valueQuantity: { value: 37.0, unit: '°C' },
      },
    ];
    const result = getLatestObservation(observations, 'body temperature');
    expect(result).not.toBeNull();
  });

  it('handles observations without effectiveDateTime (sorted last)', () => {
    const observations: FHIRObservation[] = [
      {
        resourceType: 'Observation', id: '1',
        code: { text: 'heart-rate' },
        valueQuantity: { value: 72, unit: 'bpm' },
      },
      {
        resourceType: 'Observation', id: '2',
        code: { text: 'heart-rate' },
        valueQuantity: { value: 88, unit: 'bpm' },
        effectiveDateTime: '2026-03-01T10:00:00Z',
      },
    ];
    const result = getLatestObservation(observations, 'heart-rate');
    expect(result).not.toBeNull();
    expect(result!.valueQuantity!.value).toBe(88);
  });
});

describe('getAllergies Edge Cases', () => {
  it('returns empty array for empty input', () => {
    expect(getAllergies([])).toHaveLength(0);
  });

  it('handles allergy with no reactions', () => {
    const allergies: FHIRAllergyIntolerance[] = [
      {
        resourceType: 'AllergyIntolerance', id: '1',
        code: { text: 'Latex' },
        type: 'allergy',
        criticality: 'low',
      },
    ];
    const result = getAllergies(allergies);
    expect(result.length).toBe(1);
    expect(result[0].reactions).toHaveLength(0);
    expect(result[0].substance).toBe('Latex');
  });

  it('handles allergy with multiple reactions', () => {
    const allergies: FHIRAllergyIntolerance[] = [
      {
        resourceType: 'AllergyIntolerance', id: '1',
        code: { text: 'Peanuts' },
        type: 'allergy',
        criticality: 'high',
        reaction: [
          { manifestation: [{ text: 'Hives' }, { text: 'Swelling' }] },
          { manifestation: [{ text: 'Anaphylaxis' }] },
        ],
      },
    ];
    const result = getAllergies(allergies);
    expect(result[0].reactions.length).toBe(3);
    expect(result[0].reactions).toContain('Hives');
    expect(result[0].reactions).toContain('Swelling');
    expect(result[0].reactions).toContain('Anaphylaxis');
  });

  it('handles allergy with unknown substance', () => {
    const allergies: FHIRAllergyIntolerance[] = [
      {
        resourceType: 'AllergyIntolerance', id: '1',
      },
    ];
    const result = getAllergies(allergies);
    expect(result[0].substance).toBe('Unknown');
    expect(result[0].type).toBe('unknown');
    expect(result[0].criticality).toBe('unknown');
  });

  it('handles allergy with coding instead of text', () => {
    const allergies: FHIRAllergyIntolerance[] = [
      {
        resourceType: 'AllergyIntolerance', id: '1',
        code: { coding: [{ display: 'Shellfish' }] },
        type: 'intolerance',
        criticality: 'low',
      },
    ];
    const result = getAllergies(allergies);
    expect(result[0].substance).toBe('Shellfish');
    expect(result[0].type).toBe('intolerance');
  });

  it('handles reaction manifestation with coding instead of text', () => {
    const allergies: FHIRAllergyIntolerance[] = [
      {
        resourceType: 'AllergyIntolerance', id: '1',
        code: { text: 'Morphine' },
        reaction: [
          { manifestation: [{ coding: [{ display: 'Nausea' }] }] },
        ],
      },
    ];
    const result = getAllergies(allergies);
    expect(result[0].reactions).toContain('Nausea');
  });
});

describe('generatePatientSummary Edge Cases', () => {
  it('handles empty bundle', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'collection',
    };
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.name).toBe('Unknown');
    expect(summary.patient.age).toBeNull();
    expect(summary.patient.gender).toBe('unknown');
    expect(summary.conditions).toHaveLength(0);
    expect(summary.medications).toHaveLength(0);
    expect(summary.allergies).toHaveLength(0);
    expect(Object.keys(summary.vitals)).toHaveLength(0);
  });

  it('handles bundle with empty entry array', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [],
    };
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.name).toBe('Unknown');
  });

  it('handles bundle with only patient (no conditions/meds/allergies)', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient',
            id: 'test-001',
            name: [{ family: 'Test', given: ['Jane'] }],
            gender: 'female',
          },
        },
      ],
    };
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.name).toBe('Jane Test');
    expect(summary.patient.gender).toBe('female');
    expect(summary.patient.age).toBeNull();
    expect(summary.conditions).toHaveLength(0);
  });

  it('extracts vitals from observations', () => {
    const bundle = createSyntheticPatient();
    const summary = generatePatientSummary(bundle);
    expect(Object.keys(summary.vitals).length).toBeGreaterThanOrEqual(1);
    // Synthetic patient has heart rate and blood pressure
    expect(summary.vitals['Heart Rate']).toBeDefined();
    expect(summary.vitals['Blood Pressure']).toBeDefined();
  });
});

describe('Patient Summary Tool Extended', () => {
  it('generates clinical notes for diabetes patient', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    const dmNote = result.clinicalNotes.find(n => n.includes('HbA1c'));
    expect(dmNote).toBeDefined();
  });

  it('generates clinical notes for hypertension', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    const htNote = result.clinicalNotes.find(n => n.includes('blood pressure'));
    expect(htNote).toBeDefined();
  });

  it('lists active conditions from synthetic patient', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    expect(result.conditions.length).toBeGreaterThanOrEqual(3);
    expect(result.conditions.some(c => c.includes('Atrial Fibrillation'))).toBe(true);
    expect(result.conditions.some(c => c.includes('Hypertension'))).toBe(true);
    expect(result.conditions.some(c => c.includes('Diabetes'))).toBe(true);
  });

  it('lists medications from synthetic patient', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    expect(result.medications.length).toBeGreaterThanOrEqual(3);
    const medNames = result.medications.map(m => m.name.toLowerCase());
    expect(medNames.some(n => n.includes('warfarin'))).toBe(true);
    expect(medNames.some(n => n.includes('metformin'))).toBe(true);
    expect(medNames.some(n => n.includes('lisinopril'))).toBe(true);
  });

  it('custom bundle without AF/warfarin omits anticoag note', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient', id: 'test-001',
            name: [{ given: ['Test'], family: 'User' }],
            gender: 'male',
          },
        },
        {
          resource: {
            resourceType: 'Condition', id: 'c1',
            code: { text: 'Hypertension' },
            clinicalStatus: { coding: [{ code: 'active' }] },
          },
        },
        {
          resource: {
            resourceType: 'MedicationStatement', id: 'm1',
            medicationCodeableConcept: { text: 'Lisinopril 10mg' },
            status: 'active',
            dosage: [{ text: '10mg daily' }],
          },
        },
      ],
    };
    const result = getPatientSummary({ fhirBundle: bundle });
    const afNote = result.clinicalNotes.find(n => n.includes('anticoagulation'));
    expect(afNote).toBeUndefined();
    const htNote = result.clinicalNotes.find(n => n.includes('blood pressure'));
    expect(htNote).toBeDefined();
  });

  it('patient summary without allergies omits allergy notes', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        {
          resource: {
            resourceType: 'Patient', id: 'p1',
            name: [{ given: ['No'], family: 'Allergies' }],
          },
        },
      ],
    };
    const result = getPatientSummary({ fhirBundle: bundle });
    expect(result.allergies).toHaveLength(0);
    const allergyNote = result.clinicalNotes.find(n => n.includes('allerg'));
    expect(allergyNote).toBeUndefined();
  });

  it('custom bundle defaults to synthetic when no bundle provided and useSyntheticData is false', () => {
    // When useSyntheticData is not set and no bundle provided, it falls through to synthetic
    const result = getPatientSummary({});
    expect(result.dataSource).toContain('Synthetic');
  });
});

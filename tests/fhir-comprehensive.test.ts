import { describe, it, expect } from 'vitest';
import {
  calculateAge,
  getPatientName,
  getActiveConditions,
  getCurrentMedications,
  getAllergies,
  getLatestObservation,
  generatePatientSummary,
  createSyntheticPatient,
  type FHIRPatient,
  type FHIRCondition,
  type FHIRMedicationStatement,
  type FHIRAllergyIntolerance,
  type FHIRObservation,
  type FHIRBundle,
} from '../src/utils/fhir';
import { getPatientSummary } from '../src/tools/patient-summary-tool';

/**
 * Comprehensive FHIR tests covering data extraction, edge cases,
 * synthetic data generation, and patient summary tool.
 */

describe('calculateAge - Edge Cases', () => {
  it('calculates age for today birthday', () => {
    const today = new Date();
    const birthday = `${today.getFullYear() - 50}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const age = calculateAge(birthday);
    expect(age).toBe(50);
  });

  it('calculates age for yesterday birthday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const birthday = `${yesterday.getFullYear() - 25}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    const age = calculateAge(birthday);
    expect(age).toBe(25);
  });

  it('calculates age for very old patient', () => {
    const age = calculateAge('1920-01-01');
    expect(age).toBeGreaterThanOrEqual(105);
  });

  it('calculates age for infant', () => {
    const recent = new Date();
    recent.setMonth(recent.getMonth() - 6);
    const birthday = `${recent.getFullYear()}-${String(recent.getMonth() + 1).padStart(2, '0')}-${String(recent.getDate()).padStart(2, '0')}`;
    const age = calculateAge(birthday);
    expect(age).toBe(0);
  });

  it('handles leap year birthday', () => {
    const age = calculateAge('2000-02-29');
    expect(age).toBeGreaterThan(0);
  });
});

describe('getPatientName - Edge Cases', () => {
  it('empty name array', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1', name: [],
    };
    expect(getPatientName(patient)).toBe('Unknown');
  });

  it('name with only family', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1',
      name: [{ family: 'Smith' }],
    };
    expect(getPatientName(patient)).toBe('Smith');
  });

  it('name with only given', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1',
      name: [{ given: ['John'] }],
    };
    expect(getPatientName(patient)).toBe('John');
  });

  it('name with empty text', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1',
      name: [{ text: '' }],
    };
    // Empty text should fall through
    const name = getPatientName(patient);
    expect(name).toBeTruthy();
  });

  it('patient with no name property', () => {
    const patient: FHIRPatient = { resourceType: 'Patient', id: '1' };
    expect(getPatientName(patient)).toBe('Unknown');
  });

  it('patient with multiple name entries (uses first)', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1',
      name: [
        { family: 'Official', given: ['John'] },
        { family: 'Nickname', given: ['Johnny'] },
      ],
    };
    expect(getPatientName(patient)).toBe('John Official');
  });

  it('name with three given names', () => {
    const patient: FHIRPatient = {
      resourceType: 'Patient', id: '1',
      name: [{ family: 'Johnson', given: ['Mary', 'Jane', 'Elizabeth'] }],
    };
    expect(getPatientName(patient)).toBe('Mary Jane Elizabeth Johnson');
  });
});

describe('getActiveConditions - Edge Cases', () => {
  it('returns active conditions only', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', code: { text: 'Hypertension' }, clinicalStatus: { coding: [{ code: 'active' }] } },
      { resourceType: 'Condition', id: '2', code: { text: 'Resolved Cold' }, clinicalStatus: { coding: [{ code: 'resolved' }] } },
    ];
    const active = getActiveConditions(conditions);
    expect(active).toContain('Hypertension');
    expect(active).not.toContain('Resolved Cold');
  });

  it('includes recurrence status conditions', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', code: { text: 'UTI' }, clinicalStatus: { coding: [{ code: 'recurrence' }] } },
    ];
    const active = getActiveConditions(conditions);
    expect(active).toContain('UTI');
  });

  it('includes conditions with no status (assumes active)', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', code: { text: 'Diabetes' } },
    ];
    const active = getActiveConditions(conditions);
    expect(active).toContain('Diabetes');
  });

  it('empty conditions list', () => {
    const active = getActiveConditions([]);
    expect(active.length).toBe(0);
  });

  it('condition with coding display but no text', () => {
    const conditions: FHIRCondition[] = [
      {
        resourceType: 'Condition', id: '1',
        code: { coding: [{ display: 'Heart Failure' }] },
        clinicalStatus: { coding: [{ code: 'active' }] },
      },
    ];
    const active = getActiveConditions(conditions);
    expect(active).toContain('Heart Failure');
  });

  it('condition with no code at all', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', clinicalStatus: { coding: [{ code: 'active' }] } },
    ];
    const active = getActiveConditions(conditions);
    expect(active).toContain('Unknown condition');
  });

  it('excludes remission status', () => {
    const conditions: FHIRCondition[] = [
      { resourceType: 'Condition', id: '1', code: { text: 'Cancer' }, clinicalStatus: { coding: [{ code: 'remission' }] } },
    ];
    const active = getActiveConditions(conditions);
    expect(active.length).toBe(0);
  });
});

describe('getCurrentMedications - Edge Cases', () => {
  it('returns active medications', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { text: 'Warfarin 5mg' }, status: 'active', dosage: [{ text: '5mg daily' }] },
    ];
    const current = getCurrentMedications(meds);
    expect(current.length).toBe(1);
    expect(current[0].name).toBe('Warfarin 5mg');
    expect(current[0].dosage).toBe('5mg daily');
  });

  it('returns intended medications', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { text: 'New Drug' }, status: 'intended' },
    ];
    const current = getCurrentMedications(meds);
    expect(current.length).toBe(1);
  });

  it('includes medications with no status', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { text: 'Drug X' } },
    ];
    const current = getCurrentMedications(meds);
    expect(current.length).toBe(1);
  });

  it('excludes stopped medications', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { text: 'Old Drug' }, status: 'stopped' },
    ];
    const current = getCurrentMedications(meds);
    expect(current.length).toBe(0);
  });

  it('excludes completed medications', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', medicationCodeableConcept: { text: 'Antibiotics' }, status: 'completed' },
    ];
    const current = getCurrentMedications(meds);
    expect(current.length).toBe(0);
  });

  it('medication with no codeable concept', () => {
    const meds: FHIRMedicationStatement[] = [
      { resourceType: 'MedicationStatement', id: '1', status: 'active' },
    ];
    const current = getCurrentMedications(meds);
    expect(current.length).toBe(1);
    expect(current[0].name).toBe('Unknown');
  });

  it('medication with coding display but no text', () => {
    const meds: FHIRMedicationStatement[] = [
      {
        resourceType: 'MedicationStatement', id: '1', status: 'active',
        medicationCodeableConcept: { coding: [{ display: 'Metformin 500mg' }] },
      },
    ];
    const current = getCurrentMedications(meds);
    expect(current[0].name).toBe('Metformin 500mg');
  });

  it('medication without dosage text', () => {
    const meds: FHIRMedicationStatement[] = [
      {
        resourceType: 'MedicationStatement', id: '1', status: 'active',
        medicationCodeableConcept: { text: 'Lisinopril' },
      },
    ];
    const current = getCurrentMedications(meds);
    expect(current[0].dosage).toBe('Dosage not specified');
  });

  it('empty medications list', () => {
    const current = getCurrentMedications([]);
    expect(current.length).toBe(0);
  });
});

describe('getAllergies - Edge Cases', () => {
  it('extracts allergy with full details', () => {
    const allergies: FHIRAllergyIntolerance[] = [{
      resourceType: 'AllergyIntolerance', id: '1',
      code: { text: 'Penicillin' },
      type: 'allergy',
      criticality: 'high',
      reaction: [{ manifestation: [{ text: 'Anaphylaxis' }], severity: 'severe' }],
    }];
    const result = getAllergies(allergies);
    expect(result.length).toBe(1);
    expect(result[0].substance).toBe('Penicillin');
    expect(result[0].type).toBe('allergy');
    expect(result[0].criticality).toBe('high');
    expect(result[0].reactions).toContain('Anaphylaxis');
  });

  it('allergy with no code', () => {
    const allergies: FHIRAllergyIntolerance[] = [{
      resourceType: 'AllergyIntolerance', id: '1',
    }];
    const result = getAllergies(allergies);
    expect(result[0].substance).toBe('Unknown');
    expect(result[0].type).toBe('unknown');
    expect(result[0].criticality).toBe('unknown');
    expect(result[0].reactions.length).toBe(0);
  });

  it('allergy with multiple reactions', () => {
    const allergies: FHIRAllergyIntolerance[] = [{
      resourceType: 'AllergyIntolerance', id: '1',
      code: { text: 'Sulfa' },
      reaction: [
        { manifestation: [{ text: 'Rash' }] },
        { manifestation: [{ text: 'Hives' }] },
      ],
    }];
    const result = getAllergies(allergies);
    expect(result[0].reactions).toContain('Rash');
    expect(result[0].reactions).toContain('Hives');
  });

  it('allergy with coding display', () => {
    const allergies: FHIRAllergyIntolerance[] = [{
      resourceType: 'AllergyIntolerance', id: '1',
      code: { coding: [{ display: 'Aspirin' }] },
    }];
    const result = getAllergies(allergies);
    expect(result[0].substance).toBe('Aspirin');
  });

  it('empty allergies list', () => {
    const result = getAllergies([]);
    expect(result.length).toBe(0);
  });
});

describe('getLatestObservation - Edge Cases', () => {
  it('returns latest observation by date', () => {
    const observations: FHIRObservation[] = [
      {
        resourceType: 'Observation', id: '1',
        code: { text: 'heart-rate' },
        valueQuantity: { value: 70 },
        effectiveDateTime: '2026-01-01T10:00:00Z',
      },
      {
        resourceType: 'Observation', id: '2',
        code: { text: 'heart-rate' },
        valueQuantity: { value: 80 },
        effectiveDateTime: '2026-03-01T10:00:00Z',
      },
    ];
    const latest = getLatestObservation(observations, 'heart-rate');
    expect(latest).not.toBeNull();
    expect(latest!.valueQuantity!.value).toBe(80);
  });

  it('returns null for non-matching code', () => {
    const observations: FHIRObservation[] = [
      { resourceType: 'Observation', id: '1', code: { text: 'blood-pressure' }, valueQuantity: { value: 120 } },
    ];
    const result = getLatestObservation(observations, 'heart-rate');
    expect(result).toBeNull();
  });

  it('matches by coding display', () => {
    const observations: FHIRObservation[] = [
      {
        resourceType: 'Observation', id: '1',
        code: { coding: [{ display: 'Heart Rate' }] },
        valueQuantity: { value: 85 },
      },
    ];
    const result = getLatestObservation(observations, 'Heart Rate');
    expect(result).not.toBeNull();
  });

  it('matches by coding code', () => {
    const observations: FHIRObservation[] = [
      {
        resourceType: 'Observation', id: '1',
        code: { coding: [{ code: 'HR123' }] },
        valueQuantity: { value: 75 },
      },
    ];
    const result = getLatestObservation(observations, 'HR123');
    expect(result).not.toBeNull();
  });

  it('empty observations list', () => {
    const result = getLatestObservation([], 'heart-rate');
    expect(result).toBeNull();
  });

  it('observation without date sorts correctly', () => {
    const observations: FHIRObservation[] = [
      { resourceType: 'Observation', id: '1', code: { text: 'test' }, valueQuantity: { value: 10 } },
      { resourceType: 'Observation', id: '2', code: { text: 'test' }, valueQuantity: { value: 20 }, effectiveDateTime: '2026-01-01' },
    ];
    const result = getLatestObservation(observations, 'test');
    expect(result).not.toBeNull();
    expect(result!.valueQuantity!.value).toBe(20);
  });
});

describe('Synthetic Patient Generation', () => {
  it('creates valid FHIR bundle', () => {
    const bundle = createSyntheticPatient();
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.type).toBe('collection');
    expect(bundle.entry).toBeDefined();
    expect(bundle.entry!.length).toBeGreaterThan(0);
  });

  it('contains Patient resource', () => {
    const bundle = createSyntheticPatient();
    const patient = bundle.entry!.find(e => e.resource.resourceType === 'Patient');
    expect(patient).toBeDefined();
  });

  it('contains Condition resources', () => {
    const bundle = createSyntheticPatient();
    const conditions = bundle.entry!.filter(e => e.resource.resourceType === 'Condition');
    expect(conditions.length).toBeGreaterThan(0);
  });

  it('contains MedicationStatement resources', () => {
    const bundle = createSyntheticPatient();
    const meds = bundle.entry!.filter(e => e.resource.resourceType === 'MedicationStatement');
    expect(meds.length).toBeGreaterThan(0);
  });

  it('contains AllergyIntolerance resource', () => {
    const bundle = createSyntheticPatient();
    const allergies = bundle.entry!.filter(e => e.resource.resourceType === 'AllergyIntolerance');
    expect(allergies.length).toBeGreaterThan(0);
  });

  it('contains Observation resources', () => {
    const bundle = createSyntheticPatient();
    const obs = bundle.entry!.filter(e => e.resource.resourceType === 'Observation');
    expect(obs.length).toBeGreaterThan(0);
  });
});

describe('generatePatientSummary - Comprehensive', () => {
  it('generates summary from synthetic data', () => {
    const bundle = createSyntheticPatient();
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.name).toBeTruthy();
    expect(summary.patient.name).not.toBe('Unknown');
    expect(summary.patient.age).not.toBeNull();
    expect(summary.conditions.length).toBeGreaterThan(0);
    expect(summary.medications.length).toBeGreaterThan(0);
    expect(summary.allergies.length).toBeGreaterThan(0);
  });

  it('handles bundle with only Patient resource', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [{
        resource: { resourceType: 'Patient', id: '1', name: [{ family: 'Test', given: ['Patient'] }], gender: 'female', birthDate: '1990-01-01' },
      }],
    };
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.name).toBe('Patient Test');
    expect(summary.patient.gender).toBe('female');
    expect(summary.conditions.length).toBe(0);
    expect(summary.medications.length).toBe(0);
    expect(summary.allergies.length).toBe(0);
  });

  it('handles empty bundle', () => {
    const bundle: FHIRBundle = { resourceType: 'Bundle', type: 'collection', entry: [] };
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.name).toBe('Unknown');
    expect(summary.patient.age).toBeNull();
    expect(summary.patient.gender).toBe('unknown');
  });

  it('handles bundle with no entry property', () => {
    const bundle: FHIRBundle = { resourceType: 'Bundle', type: 'collection' };
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.name).toBe('Unknown');
  });

  it('extracts vitals from observations', () => {
    const bundle = createSyntheticPatient();
    const summary = generatePatientSummary(bundle);
    // Synthetic patient has heart rate and blood pressure observations
    expect(Object.keys(summary.vitals).length).toBeGreaterThan(0);
  });
});

describe('getPatientSummary Tool - Comprehensive', () => {
  it('returns synthetic data by default', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    expect(result.dataSource).toContain('Synthetic');
    expect(result.patient.name).toBeTruthy();
  });

  it('returns clinical notes', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    expect(result.clinicalNotes.length).toBeGreaterThan(0);
  });

  it('generates notes for anticoagulation', () => {
    // Synthetic patient has AFib + Warfarin
    const result = getPatientSummary({ useSyntheticData: true });
    const anticoagNote = result.clinicalNotes.find(n => n.includes('anticoagulation'));
    expect(anticoagNote).toBeDefined();
  });

  it('generates notes for diabetes management', () => {
    // Synthetic patient has diabetes + metformin
    const result = getPatientSummary({ useSyntheticData: true });
    const diabetesNote = result.clinicalNotes.find(n => n.includes('HbA1c'));
    expect(diabetesNote).toBeDefined();
  });

  it('generates notes for hypertension', () => {
    // Synthetic patient has hypertension
    const result = getPatientSummary({ useSyntheticData: true });
    const htNote = result.clinicalNotes.find(n => n.includes('blood pressure'));
    expect(htNote).toBeDefined();
  });

  it('generates notes for high-criticality allergies', () => {
    // Synthetic patient has high-criticality penicillin allergy
    const result = getPatientSummary({ useSyntheticData: true });
    const allergyNote = result.clinicalNotes.find(n => n.includes('allergies'));
    expect(allergyNote).toBeDefined();
  });

  it('uses provided FHIR bundle when given', () => {
    const customBundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [{
        resource: { resourceType: 'Patient', id: 'custom', name: [{ family: 'Custom', given: ['Patient'] }], gender: 'male' },
      }],
    };
    const result = getPatientSummary({ fhirBundle: customBundle });
    expect(result.dataSource).toContain('Provided');
    expect(result.patient.name).toBe('Patient Custom');
  });

  it('output has all required fields', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    expect(result).toHaveProperty('patient');
    expect(result).toHaveProperty('conditions');
    expect(result).toHaveProperty('medications');
    expect(result).toHaveProperty('allergies');
    expect(result).toHaveProperty('vitals');
    expect(result).toHaveProperty('clinicalNotes');
    expect(result).toHaveProperty('dataSource');
  });

  it('patient object has name, age, gender', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    expect(result.patient).toHaveProperty('name');
    expect(result.patient).toHaveProperty('age');
    expect(result.patient).toHaveProperty('gender');
  });

  it('medications have name and dosage', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    for (const med of result.medications) {
      expect(med).toHaveProperty('name');
      expect(med).toHaveProperty('dosage');
    }
  });

  it('allergies have substance, criticality, reactions', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    for (const allergy of result.allergies) {
      expect(allergy).toHaveProperty('substance');
      expect(allergy).toHaveProperty('criticality');
      expect(allergy).toHaveProperty('reactions');
    }
  });
});

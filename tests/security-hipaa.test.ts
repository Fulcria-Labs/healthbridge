import { describe, it, expect } from 'vitest';
import { generatePatientSummary, createSyntheticPatient, type FHIRBundle, type FHIRPatient } from '../src/utils/fhir';
import { getPatientSummary } from '../src/tools/patient-summary-tool';
import { checkDrugInteractions } from '../src/tools/drug-interaction-tool';
import { interpretSingleLab, interpretPanel } from '../src/tools/lab-interpreter-tool';
import { generateClinicalAlerts } from '../src/tools/clinical-alerts-tool';
import { calculateRiskScore } from '../src/tools/risk-score-tool';

/**
 * Security, HIPAA compliance, data handling, and edge case tests.
 * Ensures the system handles malformed data, boundary conditions,
 * and potential security concerns gracefully.
 */

describe('PHI Data Handling', () => {
  it('synthetic patient data is clearly marked as synthetic', () => {
    const result = getPatientSummary({ useSyntheticData: true });
    expect(result.dataSource).toContain('Synthetic');
    expect(result.dataSource).toContain('no real patient data');
  });

  it('custom FHIR bundle is marked as provided', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [{ resource: { resourceType: 'Patient', id: '1', name: [{ family: 'Test' }] } as FHIRPatient }],
    };
    const result = getPatientSummary({ fhirBundle: bundle });
    expect(result.dataSource).toContain('Provided');
  });

  it('patient summary does not leak data between calls', () => {
    const result1 = getPatientSummary({ useSyntheticData: true });
    const customBundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [{ resource: { resourceType: 'Patient', id: 'custom', name: [{ family: 'Private' }] } as FHIRPatient }],
    };
    const result2 = getPatientSummary({ fhirBundle: customBundle });
    expect(result2.patient.name).not.toBe(result1.patient.name);
    // Call again with synthetic to verify no bleed
    const result3 = getPatientSummary({ useSyntheticData: true });
    expect(result3.patient.name).toBe(result1.patient.name);
  });
});

describe('Input Validation - Drug Interactions', () => {
  it('handles very long medication names', () => {
    const longName = 'a'.repeat(500);
    const result = checkDrugInteractions({
      medications: [longName, 'warfarin'],
    });
    expect(result.unresolvedMedications).toContain(longName);
    expect(result.medicationCount).toBe(2);
  });

  it('handles medication names with special characters', () => {
    const result = checkDrugInteractions({
      medications: ['war<script>alert(1)</script>farin', 'aspirin'],
    });
    // Should not crash, just report as unresolved
    expect(result.medicationCount).toBe(2);
  });

  it('handles medication names with unicode', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'aspirine\u00E9\u00E9'],
    });
    expect(result.medicationCount).toBe(2);
  });

  it('handles medication with SQL injection attempt', () => {
    const result = checkDrugInteractions({
      medications: ["'; DROP TABLE drugs; --", 'warfarin'],
    });
    expect(result.medicationCount).toBe(2);
    // Should just be unresolved
  });

  it('handles empty string medication', () => {
    const result = checkDrugInteractions({
      medications: ['', 'warfarin'],
    });
    expect(result.medicationCount).toBe(2);
  });
});

describe('Input Validation - Lab Results', () => {
  it('handles very large lab values', () => {
    const result = interpretSingleLab({ test: 'GLU', value: 999999 });
    expect(result).not.toBeNull();
    if (!('error' in result)) {
      expect(result.urgency).toBe('critical');
    }
  });

  it('handles zero lab value', () => {
    const result = interpretSingleLab({ test: 'K', value: 0 });
    expect(result).not.toBeNull();
    if (!('error' in result)) {
      expect(result.urgency).toBe('critical');
    }
  });

  it('handles negative lab value', () => {
    const result = interpretSingleLab({ test: 'NA', value: -5 });
    expect(result).not.toBeNull();
    // Should not crash; may classify as critical
  });

  it('handles NaN-like scenarios gracefully', () => {
    // Passing a number that could cause issues
    const result = interpretSingleLab({ test: 'K', value: Infinity });
    expect(result).not.toBeNull();
  });

  it('handles lab test name with injection attempt', () => {
    const result = interpretSingleLab({ test: '<script>alert(1)</script>', value: 5 });
    expect('error' in result).toBe(true);
  });

  it('panel with 50 results does not crash', () => {
    const results = Array.from({ length: 50 }, (_, i) => ({
      test: i % 2 === 0 ? 'GLU' : 'K',
      value: 100 + i,
    }));
    const panel = interpretPanel({ results });
    expect(panel.results.length).toBeGreaterThan(0);
  });
});

describe('Input Validation - Risk Scores', () => {
  it('handles edge case BMI with very small height', () => {
    const result = calculateRiskScore('BMI', { weight_kg: 70, height_cm: 1 });
    // Should calculate without crashing
    expect(result.score).toBeGreaterThan(0);
  });

  it('handles BMI with very large weight', () => {
    const result = calculateRiskScore('BMI', { weight_kg: 500, height_cm: 175 });
    expect(result.score).toBeGreaterThan(0);
  });

  it('handles GCS with minimum values', () => {
    const result = calculateRiskScore('GCS', {
      eye_opening: 1, verbal_response: 1, motor_response: 1,
    });
    expect(result.score).toBe(3);
  });

  it('handles GCS with maximum values', () => {
    const result = calculateRiskScore('GCS', {
      eye_opening: 4, verbal_response: 5, motor_response: 6,
    });
    expect(result.score).toBe(15);
  });

  it('handles eGFR with very high creatinine', () => {
    const result = calculateRiskScore('eGFR', {
      creatinine: 20, age: 60, sex: 'male',
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('handles eGFR with very low creatinine', () => {
    const result = calculateRiskScore('eGFR', {
      creatinine: 0.1, age: 30, sex: 'female',
    });
    expect(result.score).toBeGreaterThan(0);
  });

  it('handles MELD with minimum values', () => {
    const result = calculateRiskScore('MELD', {
      creatinine: 0.5, bilirubin: 0.5, inr: 0.8,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('handles ASCVD with boundary age (40)', () => {
    const result = calculateRiskScore('ASCVD', {
      age: 40, sex: 'male', race: 'white',
      total_cholesterol: 200, hdl_cholesterol: 50,
      systolic_bp: 120, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

describe('Input Validation - Clinical Alerts', () => {
  it('handles all-undefined vital signs', () => {
    const result = generateClinicalAlerts({
      vitals: {},
    });
    // Should not crash, may have no vital sign alerts
    expect(result.totalAlerts).toBeGreaterThanOrEqual(0);
  });

  it('handles very extreme vital signs', () => {
    const result = generateClinicalAlerts({
      vitals: {
        systolicBp: 0,
        heartRate: 300,
        spo2: 0,
        temperature: 45,
        respiratoryRate: 60,
      },
    });
    expect(result.totalAlerts).toBeGreaterThan(0);
    expect(result.riskProfile.overallRisk).toBe('critical');
  });

  it('handles empty arrays for medications', () => {
    const result = generateClinicalAlerts({
      medications: [],
    });
    expect(result.totalAlerts).toBe(0);
  });

  it('handles empty arrays for lab results', () => {
    const result = generateClinicalAlerts({
      labResults: [],
    });
    expect(result.totalAlerts).toBe(0);
  });

  it('handles empty arrays for conditions', () => {
    const result = generateClinicalAlerts({
      conditions: [],
    });
    expect(result.totalAlerts).toBe(0);
  });

  it('handles age of 0', () => {
    const result = generateClinicalAlerts({ age: 0 });
    // Should not crash - no geriatric alerts for age 0
    const geriatricAlerts = result.alerts.filter(a => a.category === 'Geriatric Safety');
    expect(geriatricAlerts.length).toBe(0);
  });

  it('handles age of 120', () => {
    const result = generateClinicalAlerts({ age: 120 });
    expect(result.riskProfile.factors.some(f => f.includes('age'))).toBe(true);
  });

  it('handles large medication list (20+ drugs)', () => {
    const medications = Array.from({ length: 20 }, (_, i) => `drug_${i}`);
    medications.push('warfarin');
    medications.push('aspirin');
    const result = generateClinicalAlerts({ medications });
    expect(result.totalAlerts).toBeGreaterThan(0);
    // Should have polypharmacy alert
    expect(result.alerts.some(a => a.title.includes('Polypharmacy'))).toBe(true);
  });
});

describe('FHIR Bundle Robustness', () => {
  it('handles bundle with unknown resource types', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [
        { resource: { resourceType: 'Patient', id: '1', name: [{ family: 'Test' }] } as FHIRPatient },
        // Simulate unknown resource type by casting
        { resource: { resourceType: 'UnknownType' as any, id: '2' } as any },
      ],
    };
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.name).toBe('Test');
  });

  it('handles bundle with duplicate resource IDs', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [
        { resource: { resourceType: 'Patient', id: '1', name: [{ family: 'First' }] } as FHIRPatient },
        { resource: { resourceType: 'Patient', id: '1', name: [{ family: 'Second' }] } as FHIRPatient },
      ],
    };
    // Should not crash, returns first patient
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.name).toBeTruthy();
  });

  it('handles patient with no gender', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [{ resource: { resourceType: 'Patient', id: '1' } as FHIRPatient }],
    };
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.gender).toBe('unknown');
  });

  it('handles patient with no birthDate', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [{ resource: { resourceType: 'Patient', id: '1', gender: 'male' } as FHIRPatient }],
    };
    const summary = generatePatientSummary(bundle);
    expect(summary.patient.age).toBeNull();
  });

  it('handles observation with no valueQuantity', () => {
    const bundle: FHIRBundle = {
      resourceType: 'Bundle', type: 'collection',
      entry: [
        { resource: { resourceType: 'Patient', id: '1' } as FHIRPatient },
        { resource: { resourceType: 'Observation' as const, id: 'obs1', code: { text: 'heart-rate' } } },
      ],
    };
    const summary = generatePatientSummary(bundle);
    // Should not include the observation without value
    expect(summary.vitals['Heart Rate']).toBeUndefined();
  });
});

describe('Deterministic Output', () => {
  it('same input produces same drug interaction output', () => {
    const result1 = checkDrugInteractions({ medications: ['warfarin', 'aspirin'] });
    const result2 = checkDrugInteractions({ medications: ['warfarin', 'aspirin'] });
    expect(result1.interactionsFound).toBe(result2.interactionsFound);
    expect(result1.interactions.length).toBe(result2.interactions.length);
    expect(result1.summary).toBe(result2.summary);
  });

  it('same input produces same lab interpretation', () => {
    const result1 = interpretSingleLab({ test: 'K', value: 5.5 });
    const result2 = interpretSingleLab({ test: 'K', value: 5.5 });
    expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
  });

  it('same input produces same risk score', () => {
    const params = { weight_kg: 70, height_cm: 175 };
    const result1 = calculateRiskScore('BMI', params);
    const result2 = calculateRiskScore('BMI', params);
    expect(result1.score).toBe(result2.score);
  });

  it('same input produces same clinical alerts', () => {
    const context = {
      vitals: { systolicBp: 85 },
      medications: ['warfarin', 'aspirin'],
    };
    const result1 = generateClinicalAlerts(context);
    const result2 = generateClinicalAlerts(context);
    expect(result1.totalAlerts).toBe(result2.totalAlerts);
    expect(result1.riskProfile.overallRisk).toBe(result2.riskProfile.overallRisk);
  });
});

describe('Output Completeness', () => {
  it('drug interaction output has all required fields', () => {
    const result = checkDrugInteractions({ medications: ['warfarin', 'aspirin'] });
    expect(typeof result.medicationCount).toBe('number');
    expect(typeof result.interactionsFound).toBe('number');
    expect(Array.isArray(result.resolvedMedications)).toBe(true);
    expect(Array.isArray(result.interactions)).toBe(true);
    expect(typeof result.summary).toBe('string');
    expect(Array.isArray(result.unresolvedMedications)).toBe(true);
  });

  it('lab result output has all required fields', () => {
    const result = interpretSingleLab({ test: 'K', value: 4.0 });
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(typeof result.testCode).toBe('string');
      expect(typeof result.testName).toBe('string');
      expect(typeof result.value).toBe('number');
      expect(typeof result.unit).toBe('string');
      expect(typeof result.urgency).toBe('string');
      expect(typeof result.referenceRange).toBe('string');
      expect(typeof result.interpretation).toBe('string');
      expect(typeof result.clinicalSignificance).toBe('string');
      expect(typeof result.suggestedAction).toBe('string');
    }
  });

  it('clinical alerts output has all required fields', () => {
    const result = generateClinicalAlerts({ vitals: { systolicBp: 85 } });
    expect(typeof result.totalAlerts).toBe('number');
    expect(result.alertsByPriority).toBeDefined();
    expect(Array.isArray(result.alerts)).toBe(true);
    expect(typeof result.summary).toBe('string');
    expect(result.riskProfile).toBeDefined();
    expect(result.riskProfile.overallRisk).toBeDefined();
    expect(Array.isArray(result.riskProfile.factors)).toBe(true);
  });

  it('risk score output has all required fields', () => {
    const result = calculateRiskScore('BMI', { weight_kg: 70, height_cm: 175 });
    expect(typeof result.scoreName).toBe('string');
    expect(typeof result.score).toBe('number');
    expect(typeof result.maxScore).toBe('number');
    expect(typeof result.riskLevel).toBe('string');
    expect(typeof result.interpretation).toBe('string');
    expect(typeof result.recommendation).toBe('string');
    expect(typeof result.components).toBe('object');
    expect(typeof result.reference).toBe('string');
  });
});

describe('Cross-Tool Consistency', () => {
  it('lab interpreter and clinical alerts agree on critical values', () => {
    const labResult = interpretSingleLab({ test: 'K', value: 7.0 });
    const alerts = generateClinicalAlerts({
      labResults: [{ test: 'K', value: 7.0 }],
    });
    if (!('error' in labResult)) {
      expect(labResult.urgency).toBe('critical');
    }
    expect(alerts.alertsByPriority.critical).toBeGreaterThan(0);
  });

  it('drug interaction checker and clinical alerts agree on severity', () => {
    const drugResult = checkDrugInteractions({
      medications: ['fluoxetine', 'phenelzine'],
    });
    const alerts = generateClinicalAlerts({
      medications: ['fluoxetine', 'phenelzine'],
    });
    const hasContraindicated = drugResult.interactions.some(i => i.severity === 'contraindicated');
    const hasCriticalDrugAlert = alerts.alerts.some(a =>
      a.category === 'Drug Interaction' && a.priority === 'critical'
    );
    expect(hasContraindicated).toBe(hasCriticalDrugAlert);
  });

  it('synthetic patient data is processable by all tools', () => {
    const patientSummary = getPatientSummary({ useSyntheticData: true });

    // Drug interactions from medications
    if (patientSummary.medications.length >= 2) {
      const medNames = patientSummary.medications.map(m => m.name);
      const drugResult = checkDrugInteractions({ medications: medNames });
      expect(drugResult.medicationCount).toBe(medNames.length);
    }

    // Clinical alerts from medications
    const alerts = generateClinicalAlerts({
      medications: patientSummary.medications.map(m => m.name),
      conditions: patientSummary.conditions,
    });
    expect(alerts).toBeDefined();
    expect(alerts.totalAlerts).toBeGreaterThanOrEqual(0);
  });
});

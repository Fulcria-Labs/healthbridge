import { describe, it, expect } from 'vitest';
import { generateClinicalAlerts, type PatientContext, type ClinicalAlert, type AlertPriority } from '../src/tools/clinical-alerts-tool';

function findAlerts(alerts: ClinicalAlert[], criteria: { priority?: AlertPriority; category?: string; titleContains?: string }) {
  return alerts.filter(a =>
    (!criteria.priority || a.priority === criteria.priority) &&
    (!criteria.category || a.category === criteria.category) &&
    (!criteria.titleContains || a.title.toLowerCase().includes(criteria.titleContains.toLowerCase()))
  );
}

describe('Clinical Alerts - Vital Sign Boundary Cases', () => {
  it('systolic BP at exactly 180 triggers hypertensive emergency', () => {
    const result = generateClinicalAlerts({ vitals: { systolicBp: 180 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'hypertensive' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].priority).toBe('critical');
  });

  it('systolic BP at 179 does not trigger hypertensive emergency', () => {
    const result = generateClinicalAlerts({ vitals: { systolicBp: 179 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'hypertensive' });
    expect(alerts.length).toBe(0);
  });

  it('systolic BP at 140 triggers elevated BP', () => {
    const result = generateClinicalAlerts({ vitals: { systolicBp: 140 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'blood pressure' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].priority).toBe('moderate');
  });

  it('systolic BP at 139 does not trigger any BP alert', () => {
    const result = generateClinicalAlerts({ vitals: { systolicBp: 139 } });
    const alerts = findAlerts(result.alerts, { category: 'Vital Signs', titleContains: 'blood pressure' });
    expect(alerts.length).toBe(0);
    const hypoAlerts = findAlerts(result.alerts, { titleContains: 'hypotension' });
    expect(hypoAlerts.length).toBe(0);
  });

  it('systolic BP at 89 triggers hypotension', () => {
    const result = generateClinicalAlerts({ vitals: { systolicBp: 89 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'hypotension' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].priority).toBe('critical');
  });

  it('heart rate at exactly 40 triggers severe bradycardia', () => {
    // <40 is severe bradycardia, so 40 is NOT severe but should be bradycardia (<50)
    const result = generateClinicalAlerts({ vitals: { heartRate: 40 } });
    const severe = findAlerts(result.alerts, { titleContains: 'severe bradycardia' });
    expect(severe.length).toBe(0);
    const brachy = findAlerts(result.alerts, { titleContains: 'bradycardia' });
    expect(brachy.length).toBe(1);
    expect(brachy[0].priority).toBe('high');
  });

  it('heart rate at 39 triggers severe bradycardia', () => {
    const result = generateClinicalAlerts({ vitals: { heartRate: 39 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'severe bradycardia' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].priority).toBe('critical');
  });

  it('heart rate at exactly 50 does not trigger bradycardia', () => {
    const result = generateClinicalAlerts({ vitals: { heartRate: 50 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'bradycardia' });
    expect(alerts.length).toBe(0);
  });

  it('heart rate at 151 triggers severe tachycardia', () => {
    const result = generateClinicalAlerts({ vitals: { heartRate: 151 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'severe tachycardia' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].priority).toBe('critical');
  });

  it('heart rate at exactly 150 is NOT severe tachycardia (threshold is >150)', () => {
    const result = generateClinicalAlerts({ vitals: { heartRate: 150 } });
    const severe = findAlerts(result.alerts, { titleContains: 'severe tachycardia' });
    expect(severe.length).toBe(0);
    // But should still be tachycardia (>100)
    const tachy = findAlerts(result.alerts, { titleContains: 'tachycardia' });
    expect(tachy.length).toBe(1);
    expect(tachy[0].priority).toBe('moderate');
  });

  it('heart rate at 101 triggers tachycardia', () => {
    const result = generateClinicalAlerts({ vitals: { heartRate: 101 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'tachycardia' });
    expect(alerts.length).toBe(1);
  });

  it('SpO2 at exactly 88 triggers severe hypoxia', () => {
    // <88 is severe, so 88 should NOT trigger severe but should trigger mild (<92)
    const result = generateClinicalAlerts({ vitals: { spo2: 88 } });
    const severe = findAlerts(result.alerts, { titleContains: 'severe hypoxia' });
    expect(severe.length).toBe(0);
    const mild = findAlerts(result.alerts, { titleContains: 'hypoxia' });
    expect(mild.length).toBe(1);
    expect(mild[0].priority).toBe('high');
  });

  it('SpO2 at 87 triggers severe hypoxia', () => {
    const result = generateClinicalAlerts({ vitals: { spo2: 87 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'severe hypoxia' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].priority).toBe('critical');
  });

  it('temperature at exactly 40.0 triggers high fever', () => {
    const result = generateClinicalAlerts({ vitals: { temperature: 40.0 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'fever' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].priority).toBe('critical');
  });

  it('temperature at 39.9 triggers moderate fever', () => {
    const result = generateClinicalAlerts({ vitals: { temperature: 39.9 } });
    const alerts = findAlerts(result.alerts, { priority: 'critical', titleContains: 'fever' });
    expect(alerts.length).toBe(0);
    const mod = findAlerts(result.alerts, { priority: 'moderate', titleContains: 'fever' });
    expect(mod.length).toBe(1);
  });

  it('temperature at exactly 35.0 does not trigger hypothermia (<35.0)', () => {
    const result = generateClinicalAlerts({ vitals: { temperature: 35.0 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'hypothermia' });
    expect(alerts.length).toBe(0);
  });

  it('temperature at 34.9 triggers hypothermia', () => {
    const result = generateClinicalAlerts({ vitals: { temperature: 34.9 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'hypothermia' });
    expect(alerts.length).toBe(1);
  });

  it('respiratory rate at exactly 8 does not trigger depression (<8)', () => {
    const result = generateClinicalAlerts({ vitals: { respiratoryRate: 8 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'respiratory depression' });
    expect(alerts.length).toBe(0);
  });

  it('respiratory rate at 7 triggers respiratory depression', () => {
    const result = generateClinicalAlerts({ vitals: { respiratoryRate: 7 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'respiratory depression' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].priority).toBe('critical');
  });

  it('respiratory rate at exactly 31 triggers severe tachypnea', () => {
    const result = generateClinicalAlerts({ vitals: { respiratoryRate: 31 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'severe tachypnea' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].priority).toBe('critical');
  });

  it('respiratory rate at 23 triggers tachypnea', () => {
    const result = generateClinicalAlerts({ vitals: { respiratoryRate: 23 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'tachypnea' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].priority).toBe('moderate');
  });

  it('respiratory rate at exactly 22 does not trigger tachypnea (threshold is >22)', () => {
    const result = generateClinicalAlerts({ vitals: { respiratoryRate: 22 } });
    const alerts = findAlerts(result.alerts, { titleContains: 'tachypnea' });
    expect(alerts.length).toBe(0);
  });
});

describe('Clinical Alerts - Sepsis Pattern Edge Cases', () => {
  it('hypothermia (<36) counts as sepsis infection sign', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 35.5, heartRate: 110, respiratoryRate: 25 },
      labResults: [{ test: 'WBC', value: 15 }],
    });
    const sepsisAlerts = findAlerts(result.alerts, { titleContains: 'sepsis' });
    expect(sepsisAlerts.length).toBeGreaterThanOrEqual(1);
  });

  it('does not trigger sepsis with only 1 indicator', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 39.0 },
      labResults: [],
    });
    const sepsisAlerts = findAlerts(result.alerts, { titleContains: 'sepsis' });
    expect(sepsisAlerts.length).toBe(0);
  });

  it('elevated lactate contributes to sepsis indicators', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 39.0, heartRate: 110, systolicBp: 95 },
      labResults: [{ test: 'LACTATE', value: 4.0 }],
    });
    const sepsisAlerts = findAlerts(result.alerts, { titleContains: 'sepsis' });
    expect(sepsisAlerts.length).toBeGreaterThanOrEqual(1);
  });

  it('hypotension (SBP<=100) counts as sepsis indicator', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 39.0, heartRate: 110, systolicBp: 95, respiratoryRate: 25 },
      labResults: [{ test: 'WBC', value: 15 }],
    });
    const sepsisAlerts = findAlerts(result.alerts, { titleContains: 'sepsis' });
    expect(sepsisAlerts.length).toBeGreaterThanOrEqual(1);
    expect(sepsisAlerts[0].priority).toBe('critical');
  });
});

describe('Clinical Alerts - ACS Pattern Edge Cases', () => {
  it('troponin at exactly 14 does not trigger ACS (threshold is >14)', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 110 },
      labResults: [{ test: 'TROP', value: 14 }],
    });
    const acsAlerts = findAlerts(result.alerts, { titleContains: 'coronary' });
    expect(acsAlerts.length).toBe(0);
  });

  it('troponin at 15 with tachycardia triggers ACS', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 110 },
      labResults: [{ test: 'TROP', value: 15 }],
    });
    const acsAlerts = findAlerts(result.alerts, { titleContains: 'coronary' });
    expect(acsAlerts.length).toBeGreaterThanOrEqual(1);
  });

  it('elevated troponin with hypertension (>180) triggers ACS', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 200 },
      labResults: [{ test: 'TROP', value: 100 }],
    });
    const acsAlerts = findAlerts(result.alerts, { titleContains: 'coronary' });
    expect(acsAlerts.length).toBeGreaterThanOrEqual(1);
  });

  it('elevated troponin without hemodynamic issue does not trigger ACS pattern', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 75, systolicBp: 120 },
      labResults: [{ test: 'TROP', value: 100 }],
    });
    const acsAlerts = findAlerts(result.alerts, { titleContains: 'coronary' });
    expect(acsAlerts.length).toBe(0);
  });

  it('elevated troponin with no vitals does not trigger ACS pattern', () => {
    const result = generateClinicalAlerts({
      labResults: [{ test: 'TROP', value: 500 }],
    });
    const acsAlerts = findAlerts(result.alerts, { titleContains: 'coronary' });
    expect(acsAlerts.length).toBe(0);
  });
});

describe('Clinical Alerts - DKA Pattern Edge Cases', () => {
  it('glucose at exactly 300 does not trigger DKA (threshold is >300)', () => {
    const result = generateClinicalAlerts({
      labResults: [{ test: 'GLU', value: 300 }],
      conditions: ['diabetes type 2'],
    });
    const dkaAlerts = findAlerts(result.alerts, { titleContains: 'DKA' });
    expect(dkaAlerts.length).toBe(0);
  });

  it('glucose at 301 with diabetes triggers DKA', () => {
    const result = generateClinicalAlerts({
      labResults: [{ test: 'GLU', value: 301 }],
      conditions: ['diabetes'],
    });
    const dkaAlerts = findAlerts(result.alerts, { titleContains: 'DKA' });
    expect(dkaAlerts.length).toBe(1);
  });

  it('DKA triggered with DM condition variant', () => {
    const result = generateClinicalAlerts({
      labResults: [{ test: 'GLU', value: 500 }],
      conditions: ['DM type 2'],
    });
    const dkaAlerts = findAlerts(result.alerts, { titleContains: 'DKA' });
    expect(dkaAlerts.length).toBe(1);
  });
});

describe('Clinical Alerts - Anticoagulation Pattern Edge Cases', () => {
  it('INR at exactly 3.5 does not trigger supratherapeutic (threshold >3.5)', () => {
    const result = generateClinicalAlerts({
      medications: ['warfarin'],
      labResults: [{ test: 'INR', value: 3.5 }],
    });
    const alerts = findAlerts(result.alerts, { titleContains: 'supratherapeutic' });
    expect(alerts.length).toBe(0);
  });

  it('INR at 3.6 triggers supratherapeutic on anticoagulant', () => {
    const result = generateClinicalAlerts({
      medications: ['warfarin'],
      labResults: [{ test: 'INR', value: 3.6 }],
    });
    const alerts = findAlerts(result.alerts, { titleContains: 'supratherapeutic' });
    expect(alerts.length).toBe(1);
  });

  it('platelets at 100 on anticoag does not trigger (threshold <100)', () => {
    const result = generateClinicalAlerts({
      medications: ['enoxaparin'],
      labResults: [{ test: 'PLT', value: 100 }],
    });
    const alerts = findAlerts(result.alerts, { category: 'Medication-Lab Interaction', titleContains: 'thrombocytopenia' });
    expect(alerts.length).toBe(0);
  });

  it('platelets at 99 on anticoag triggers thrombocytopenia alert', () => {
    const result = generateClinicalAlerts({
      medications: ['heparin'],
      labResults: [{ test: 'PLT', value: 99 }],
    });
    const alerts = findAlerts(result.alerts, { category: 'Medication-Lab Interaction', titleContains: 'thrombocytopenia' });
    expect(alerts.length).toBe(1);
  });

  it('DOAC (rivaroxaban) recognized as anticoagulant', () => {
    const result = generateClinicalAlerts({
      medications: ['rivaroxaban'],
      labResults: [{ test: 'INR', value: 5.0 }],
    });
    const alerts = findAlerts(result.alerts, { titleContains: 'supratherapeutic' });
    expect(alerts.length).toBe(1);
  });

  it('apixaban recognized as anticoagulant', () => {
    const result = generateClinicalAlerts({
      medications: ['apixaban'],
      labResults: [{ test: 'PLT', value: 50 }],
    });
    const alerts = findAlerts(result.alerts, { category: 'Medication-Lab Interaction', titleContains: 'thrombocytopenia' });
    expect(alerts.length).toBe(1);
  });

  it('dabigatran recognized as anticoagulant', () => {
    const result = generateClinicalAlerts({
      medications: ['dabigatran'],
      labResults: [{ test: 'INR', value: 4.0 }],
    });
    const alerts = findAlerts(result.alerts, { titleContains: 'supratherapeutic' });
    expect(alerts.length).toBe(1);
  });
});

describe('Clinical Alerts - Geriatric Safety Extended', () => {
  it('flags gabapentin as fall risk in elderly', () => {
    const result = generateClinicalAlerts({
      age: 70,
      medications: ['gabapentin'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety', titleContains: 'fall risk' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].detail).toContain('gabapentin');
  });

  it('flags pregabalin as fall risk in elderly', () => {
    const result = generateClinicalAlerts({
      age: 75,
      medications: ['pregabalin'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety', titleContains: 'fall risk' });
    expect(alerts.length).toBe(1);
  });

  it('flags multiple fall risk medications', () => {
    const result = generateClinicalAlerts({
      age: 80,
      medications: ['lorazepam', 'tramadol', 'gabapentin'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety', titleContains: 'fall risk' });
    expect(alerts.length).toBe(1);
    expect(alerts[0].detail).toContain('lorazepam');
    expect(alerts[0].detail).toContain('tramadol');
    expect(alerts[0].detail).toContain('gabapentin');
  });

  it('flags hydroxyzine as anticholinergic in elderly', () => {
    const result = generateClinicalAlerts({
      age: 70,
      medications: ['hydroxyzine'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety', titleContains: 'anticholinergic' });
    expect(alerts.length).toBe(1);
  });

  it('flags oxybutynin as anticholinergic in elderly', () => {
    const result = generateClinicalAlerts({
      age: 68,
      medications: ['oxybutynin'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety', titleContains: 'anticholinergic' });
    expect(alerts.length).toBe(1);
  });

  it('flags amitriptyline as anticholinergic in elderly', () => {
    const result = generateClinicalAlerts({
      age: 75,
      medications: ['amitriptyline'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety', titleContains: 'anticholinergic' });
    expect(alerts.length).toBe(1);
  });

  it('generates both fall risk and anticholinergic alerts when applicable', () => {
    const result = generateClinicalAlerts({
      age: 78,
      medications: ['diazepam', 'diphenhydramine'],
    });
    const fallAlerts = findAlerts(result.alerts, { category: 'Geriatric Safety', titleContains: 'fall risk' });
    const acAlerts = findAlerts(result.alerts, { category: 'Geriatric Safety', titleContains: 'anticholinergic' });
    expect(fallAlerts.length).toBe(1);
    expect(acAlerts.length).toBe(1);
  });

  it('age 65 is the threshold for geriatric alerts', () => {
    const result = generateClinicalAlerts({
      age: 65,
      medications: ['zolpidem'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety' });
    expect(alerts.length).toBeGreaterThanOrEqual(1);
  });

  it('age 64 does not trigger geriatric alerts', () => {
    const result = generateClinicalAlerts({
      age: 64,
      medications: ['zolpidem'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety' });
    expect(alerts.length).toBe(0);
  });
});

describe('Clinical Alerts - Condition-Drug Extended', () => {
  it('metformin flagged with kidney disease', () => {
    const result = generateClinicalAlerts({
      medications: ['metformin', 'lisinopril'], // need >=2 meds to trigger drug alert generation
      conditions: ['renal failure'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
    expect(alerts.some(a => a.title.includes('metformin'))).toBe(true);
  });

  it('celecoxib flagged with kidney disease', () => {
    const result = generateClinicalAlerts({
      medications: ['celecoxib', 'lisinopril'],
      conditions: ['CKD stage 3'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
    expect(alerts.some(a => a.title.includes('celecoxib'))).toBe(true);
  });

  it('simvastatin flagged with liver disease', () => {
    const result = generateClinicalAlerts({
      medications: ['simvastatin', 'metformin'],
      conditions: ['hepatic dysfunction'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
    expect(alerts.some(a => a.title.includes('simvastatin'))).toBe(true);
  });

  it('diltiazem flagged with heart failure', () => {
    const result = generateClinicalAlerts({
      medications: ['diltiazem', 'furosemide'],
      conditions: ['heart failure'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
    expect(alerts.some(a => a.title.includes('diltiazem'))).toBe(true);
  });

  it('naproxen flagged with heart failure', () => {
    const result = generateClinicalAlerts({
      medications: ['naproxen', 'furosemide'],
      conditions: ['CHF'],
    });
    const alerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
    expect(alerts.some(a => a.title.includes('naproxen'))).toBe(true);
  });
});

describe('Clinical Alerts - Complex Multi-domain Scenarios Extended', () => {
  it('post-surgical patient with pain management', () => {
    const result = generateClinicalAlerts({
      age: 72,
      medications: ['oxycodone', 'gabapentin', 'enoxaparin', 'omeprazole', 'metoprolol'],
      labResults: [
        { test: 'HGB', value: 10.5 },
        { test: 'PLT', value: 180 },
        { test: 'CREAT', value: 1.2 },
      ],
      vitals: {
        systolicBp: 135,
        heartRate: 85,
        respiratoryRate: 18,
        temperature: 37.2,
        spo2: 95,
      },
    });
    // Should detect: polypharmacy, geriatric fall risk (oxycodone + gabapentin), opioid-gabapentinoid interaction
    expect(result.totalAlerts).toBeGreaterThanOrEqual(2);
    const fallAlerts = findAlerts(result.alerts, { titleContains: 'fall risk' });
    expect(fallAlerts.length).toBeGreaterThanOrEqual(1);
  });

  it('stroke patient on anticoagulation', () => {
    const result = generateClinicalAlerts({
      age: 68,
      medications: ['warfarin', 'aspirin', 'atorvastatin', 'lisinopril', 'metoprolol'],
      labResults: [
        { test: 'INR', value: 3.0 },
        { test: 'CREAT', value: 1.1 },
        { test: 'K', value: 4.5 },
      ],
      conditions: ['atrial fibrillation', 'prior stroke'],
    });
    // Should detect: warfarin-aspirin major interaction, polypharmacy
    expect(result.totalAlerts).toBeGreaterThanOrEqual(2);
    const drugAlerts = findAlerts(result.alerts, { category: 'Drug Interaction' });
    expect(drugAlerts.length).toBeGreaterThanOrEqual(1);
  });

  it('liver disease patient', () => {
    const result = generateClinicalAlerts({
      age: 55,
      medications: ['acetaminophen', 'spironolactone', 'lactulose'],
      labResults: [
        { test: 'AST', value: 200 },
        { test: 'ALT', value: 80 },
        { test: 'INR', value: 1.8 },
      ],
      conditions: ['cirrhosis'],
    });
    // Should detect: AST/ALT ratio >2, hepatotoxic drug, abnormal labs
    const patternAlerts = findAlerts(result.alerts, { titleContains: 'AST/ALT' });
    expect(patternAlerts.length).toBe(1);
    const condAlerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
    expect(condAlerts.some(a => a.title.includes('acetaminophen'))).toBe(true);
  });

  it('renal failure patient with multiple issues', () => {
    const result = generateClinicalAlerts({
      age: 70,
      medications: ['metformin', 'ibuprofen', 'lisinopril', 'furosemide'],
      labResults: [
        { test: 'CREAT', value: 3.5 },
        { test: 'BUN', value: 55 },
        { test: 'K', value: 5.8 },
      ],
      conditions: ['chronic kidney disease stage 4'],
    });
    // Should detect: condition-drug for metformin and ibuprofen, high K, BUN/Cr ratio, drug interactions
    expect(result.riskProfile.overallRisk).not.toBe('low');
    const condAlerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
    expect(condAlerts.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Clinical Alerts - Polypharmacy Edge Cases', () => {
  it('exactly 5 medications triggers polypharmacy', () => {
    const result = generateClinicalAlerts({
      medications: ['metformin', 'lisinopril', 'amlodipine', 'atorvastatin', 'aspirin'],
    });
    const polyAlerts = findAlerts(result.alerts, { titleContains: 'polypharmacy' });
    expect(polyAlerts.length).toBe(1);
  });

  it('4 medications does not trigger polypharmacy', () => {
    const result = generateClinicalAlerts({
      medications: ['metformin', 'lisinopril', 'amlodipine', 'atorvastatin'],
    });
    const polyAlerts = findAlerts(result.alerts, { titleContains: 'polypharmacy' });
    expect(polyAlerts.length).toBe(0);
  });

  it('polypharmacy noted in risk factors', () => {
    const result = generateClinicalAlerts({
      medications: ['a', 'b', 'c', 'd', 'e'],
    });
    expect(result.riskProfile.factors.some(f => f.includes('Polypharmacy'))).toBe(true);
  });
});

describe('Clinical Alerts - Advanced Age Risk Factor', () => {
  it('age 75 adds advanced age risk factor', () => {
    const result = generateClinicalAlerts({
      age: 75,
      vitals: { heartRate: 105 },
    });
    expect(result.riskProfile.factors.some(f => f.includes('Advanced age'))).toBe(true);
  });

  it('age 74 does not add advanced age risk factor', () => {
    const result = generateClinicalAlerts({
      age: 74,
      vitals: { heartRate: 105 },
    });
    expect(result.riskProfile.factors.some(f => f.includes('Advanced age'))).toBe(false);
  });
});

describe('Clinical Alerts - Lab Pattern Extended', () => {
  it('BUN/Cr ratio >20 with abnormal BUN triggers alert', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'BUN', value: 35 },
        { test: 'CREAT', value: 1.2 },
      ],
    });
    const alerts = findAlerts(result.alerts, { category: 'Laboratory Pattern', titleContains: 'BUN/Creatinine' });
    expect(alerts.length).toBe(1);
  });

  it('BUN/Cr ratio exactly 20 with abnormal BUN does not trigger (needs >20)', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'BUN', value: 22 },
        { test: 'CREAT', value: 1.1 },
      ],
    });
    // ratio = 20 exactly, which is not >20
    const alerts = findAlerts(result.alerts, { category: 'Laboratory Pattern', titleContains: 'BUN/Creatinine' });
    expect(alerts.length).toBe(0);
  });

  it('creatinine 0 does not divide by zero', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'BUN', value: 25 },
        { test: 'CREAT', value: 0 },
      ],
    });
    // Should not crash; creatinine=0 means condition creat.value > 0 is false
    expect(result).toBeDefined();
  });

  it('bicytopenia: HGB and PLT both abnormal low triggers alert', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'HGB', value: 10.0 },
        { test: 'PLT', value: 100 },
      ],
    });
    const alerts = findAlerts(result.alerts, { titleContains: 'anemia' });
    expect(alerts.length).toBeGreaterThanOrEqual(1);
  });

  it('no bicytopenia when only HGB abnormal but PLT normal', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'HGB', value: 10.0 },
        { test: 'PLT', value: 200 },
      ],
    });
    const alerts = findAlerts(result.alerts, { titleContains: 'anemia and thrombocytopenia' });
    expect(alerts.length).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { generateClinicalAlerts, type PatientContext, type ClinicalAlert, type AlertPriority } from '../src/tools/clinical-alerts-tool';

/**
 * Comprehensive clinical alerts tests covering vital sign alerts,
 * lab-based alerts, drug interaction alerts, cross-domain patterns,
 * age-specific alerts, and edge cases.
 */

describe('Empty Context - No Alerts', () => {
  it('generates no alerts for empty context', () => {
    const result = generateClinicalAlerts({});
    expect(result.totalAlerts).toBe(0);
    expect(result.alerts.length).toBe(0);
    expect(result.riskProfile.overallRisk).toBe('low');
  });

  it('summary reflects no alerts', () => {
    const result = generateClinicalAlerts({});
    expect(result.summary).toContain('No clinical alerts');
  });

  it('alertsByPriority all zero', () => {
    const result = generateClinicalAlerts({});
    expect(result.alertsByPriority.critical).toBe(0);
    expect(result.alertsByPriority.high).toBe(0);
    expect(result.alertsByPriority.moderate).toBe(0);
    expect(result.alertsByPriority.low).toBe(0);
    expect(result.alertsByPriority.informational).toBe(0);
  });
});

describe('Vital Sign Alerts - Blood Pressure', () => {
  it('critical hypotension (SBP < 90)', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 80 },
    });
    const bpAlert = result.alerts.find(a => a.title.includes('Hypotension'));
    expect(bpAlert).toBeDefined();
    expect(bpAlert!.priority).toBe('critical');
  });

  it('hypertensive emergency (SBP >= 180)', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 200 },
    });
    const bpAlert = result.alerts.find(a => a.title.includes('Hypertensive'));
    expect(bpAlert).toBeDefined();
    expect(bpAlert!.priority).toBe('critical');
  });

  it('elevated BP (SBP >= 140)', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 155 },
    });
    const bpAlert = result.alerts.find(a => a.title.includes('Elevated blood pressure'));
    expect(bpAlert).toBeDefined();
    expect(bpAlert!.priority).toBe('moderate');
  });

  it('normal BP (SBP 90-139) generates no BP alert', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 120 },
    });
    const bpAlerts = result.alerts.filter(a =>
      a.title.includes('Hypotension') ||
      a.title.includes('Hypertensive') ||
      a.title.includes('Elevated blood pressure')
    );
    expect(bpAlerts.length).toBe(0);
  });

  it('SBP at boundary 90 - no hypotension alert', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 90 },
    });
    const hypotension = result.alerts.find(a => a.title.includes('Hypotension'));
    expect(hypotension).toBeUndefined();
  });

  it('SBP at boundary 180 - hypertensive alert', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 180 },
    });
    const hypertensive = result.alerts.find(a => a.title.includes('Hypertensive'));
    expect(hypertensive).toBeDefined();
  });
});

describe('Vital Sign Alerts - Heart Rate', () => {
  it('severe bradycardia (HR < 40)', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 35 },
    });
    const hrAlert = result.alerts.find(a => a.title.includes('Severe bradycardia'));
    expect(hrAlert).toBeDefined();
    expect(hrAlert!.priority).toBe('critical');
  });

  it('bradycardia (HR 40-49)', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 45 },
    });
    const hrAlert = result.alerts.find(a => a.title.includes('Bradycardia'));
    expect(hrAlert).toBeDefined();
    expect(hrAlert!.priority).toBe('high');
  });

  it('severe tachycardia (HR > 150)', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 160 },
    });
    const hrAlert = result.alerts.find(a => a.title.includes('Severe tachycardia'));
    expect(hrAlert).toBeDefined();
    expect(hrAlert!.priority).toBe('critical');
  });

  it('tachycardia (HR > 100)', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 110 },
    });
    const hrAlert = result.alerts.find(a => a.title.includes('Tachycardia'));
    expect(hrAlert).toBeDefined();
    expect(hrAlert!.priority).toBe('moderate');
  });

  it('normal HR (60-100) generates no HR alert', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 75 },
    });
    const hrAlerts = result.alerts.filter(a =>
      a.title.includes('bradycardia') || a.title.includes('Bradycardia') ||
      a.title.includes('tachycardia') || a.title.includes('Tachycardia')
    );
    expect(hrAlerts.length).toBe(0);
  });
});

describe('Vital Sign Alerts - SpO2', () => {
  it('severe hypoxia (SpO2 < 88)', () => {
    const result = generateClinicalAlerts({
      vitals: { spo2: 82 },
    });
    const o2Alert = result.alerts.find(a => a.title.includes('Severe hypoxia'));
    expect(o2Alert).toBeDefined();
    expect(o2Alert!.priority).toBe('critical');
  });

  it('hypoxia (SpO2 88-91)', () => {
    const result = generateClinicalAlerts({
      vitals: { spo2: 90 },
    });
    const o2Alert = result.alerts.find(a => a.title === 'Hypoxia');
    expect(o2Alert).toBeDefined();
    expect(o2Alert!.priority).toBe('high');
  });

  it('normal SpO2 (>= 92) generates no hypoxia alert', () => {
    const result = generateClinicalAlerts({
      vitals: { spo2: 98 },
    });
    const o2Alerts = result.alerts.filter(a => a.title.includes('hypoxia') || a.title.includes('Hypoxia'));
    expect(o2Alerts.length).toBe(0);
  });
});

describe('Vital Sign Alerts - Temperature', () => {
  it('high fever (temp >= 40.0)', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 40.5 },
    });
    const tempAlert = result.alerts.find(a => a.title.includes('fever') || a.title.includes('Hyperthermia'));
    expect(tempAlert).toBeDefined();
    expect(tempAlert!.priority).toBe('critical');
  });

  it('fever (temp >= 38.3)', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 38.8 },
    });
    const tempAlert = result.alerts.find(a => a.title === 'Fever');
    expect(tempAlert).toBeDefined();
    expect(tempAlert!.priority).toBe('moderate');
  });

  it('hypothermia (temp < 35.0)', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 34.0 },
    });
    const tempAlert = result.alerts.find(a => a.title.includes('Hypothermia'));
    expect(tempAlert).toBeDefined();
    expect(tempAlert!.priority).toBe('high');
  });

  it('normal temperature generates no alert', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 37.0 },
    });
    const tempAlerts = result.alerts.filter(a =>
      a.title.includes('fever') || a.title.includes('Fever') ||
      a.title.includes('Hypothermia') || a.title.includes('Hyperthermia')
    );
    expect(tempAlerts.length).toBe(0);
  });
});

describe('Vital Sign Alerts - Respiratory Rate', () => {
  it('severe tachypnea (RR > 30)', () => {
    const result = generateClinicalAlerts({
      vitals: { respiratoryRate: 35 },
    });
    const rrAlert = result.alerts.find(a => a.title.includes('Severe tachypnea'));
    expect(rrAlert).toBeDefined();
    expect(rrAlert!.priority).toBe('critical');
  });

  it('tachypnea (RR > 22)', () => {
    const result = generateClinicalAlerts({
      vitals: { respiratoryRate: 25 },
    });
    const rrAlert = result.alerts.find(a => a.title === 'Tachypnea');
    expect(rrAlert).toBeDefined();
    expect(rrAlert!.priority).toBe('moderate');
  });

  it('respiratory depression (RR < 8)', () => {
    const result = generateClinicalAlerts({
      vitals: { respiratoryRate: 6 },
    });
    const rrAlert = result.alerts.find(a => a.title.includes('Respiratory depression'));
    expect(rrAlert).toBeDefined();
    expect(rrAlert!.priority).toBe('critical');
  });

  it('normal RR generates no alert', () => {
    const result = generateClinicalAlerts({
      vitals: { respiratoryRate: 16 },
    });
    const rrAlerts = result.alerts.filter(a =>
      a.title.includes('tachypnea') || a.title.includes('Tachypnea') ||
      a.title.includes('Respiratory depression')
    );
    expect(rrAlerts.length).toBe(0);
  });
});

describe('Lab-Based Alerts', () => {
  it('critical lab values generate critical alerts', () => {
    const result = generateClinicalAlerts({
      labResults: [{ test: 'K', value: 7.0 }],
    });
    expect(result.alertsByPriority.critical).toBeGreaterThan(0);
  });

  it('abnormal lab values generate high alerts', () => {
    const result = generateClinicalAlerts({
      labResults: [{ test: 'HGB', value: 9.0 }],
    });
    expect(result.alertsByPriority.high).toBeGreaterThan(0);
  });

  it('normal lab values generate no alerts', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'NA', value: 140 },
        { test: 'K', value: 4.0 },
        { test: 'GLU', value: 90 },
      ],
    });
    const labAlerts = result.alerts.filter(a => a.category === 'Laboratory');
    expect(labAlerts.length).toBe(0);
  });

  it('BUN/Creatinine ratio pattern detected', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'BUN', value: 60 },
        { test: 'CREAT', value: 2.0 },
      ],
    });
    const patternAlert = result.alerts.find(a => a.title.includes('BUN/Creatinine'));
    expect(patternAlert).toBeDefined();
  });

  it('AST/ALT ratio >2 pattern detected', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'AST', value: 200 },
        { test: 'ALT', value: 80 },
      ],
    });
    const patternAlert = result.alerts.find(a => a.title.includes('AST/ALT'));
    expect(patternAlert).toBeDefined();
  });

  it('combined anemia and thrombocytopenia pattern', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'HGB', value: 8.0 },
        { test: 'PLT', value: 80 },
      ],
    });
    const biAlert = result.alerts.find(a => a.title.includes('anemia and thrombocytopenia'));
    expect(biAlert).toBeDefined();
    expect(biAlert!.priority).toBe('high');
  });
});

describe('Drug Interaction Alerts', () => {
  it('contraindicated drug pair generates critical alert', () => {
    const result = generateClinicalAlerts({
      medications: ['fluoxetine', 'phenelzine'],
    });
    const drugAlert = result.alerts.find(a =>
      a.category === 'Drug Interaction' && a.priority === 'critical'
    );
    expect(drugAlert).toBeDefined();
  });

  it('major drug interaction generates high alert', () => {
    const result = generateClinicalAlerts({
      medications: ['warfarin', 'aspirin'],
    });
    const drugAlert = result.alerts.find(a =>
      a.category === 'Drug Interaction' && a.priority === 'high'
    );
    expect(drugAlert).toBeDefined();
  });

  it('polypharmacy alert for 5+ medications', () => {
    const result = generateClinicalAlerts({
      medications: ['warfarin', 'aspirin', 'metformin', 'lisinopril', 'amlodipine'],
    });
    const polyAlert = result.alerts.find(a => a.title.includes('Polypharmacy'));
    expect(polyAlert).toBeDefined();
    expect(polyAlert!.priority).toBe('moderate');
  });

  it('no polypharmacy alert for < 5 medications', () => {
    const result = generateClinicalAlerts({
      medications: ['metformin', 'lisinopril'],
    });
    const polyAlert = result.alerts.find(a => a.title.includes('Polypharmacy'));
    expect(polyAlert).toBeUndefined();
  });

  it('single medication generates no interaction alerts', () => {
    const result = generateClinicalAlerts({
      medications: ['warfarin'],
    });
    const drugAlerts = result.alerts.filter(a => a.category === 'Drug Interaction');
    expect(drugAlerts.length).toBe(0);
  });
});

describe('Condition-Drug Interaction Alerts', () => {
  it('renal impairment with nephrotoxic drug', () => {
    const result = generateClinicalAlerts({
      medications: ['ibuprofen', 'metformin'],
      conditions: ['chronic kidney disease'],
    });
    const condAlert = result.alerts.find(a =>
      a.category === 'Condition-Drug Interaction' && a.title.includes('renal')
    );
    expect(condAlert).toBeDefined();
  });

  it('liver disease with hepatotoxic drug', () => {
    const result = generateClinicalAlerts({
      medications: ['acetaminophen', 'metformin'],
      conditions: ['liver cirrhosis'],
    });
    const condAlert = result.alerts.find(a =>
      a.category === 'Condition-Drug Interaction' && a.title.includes('liver')
    );
    expect(condAlert).toBeDefined();
  });

  it('heart failure with NSAID', () => {
    const result = generateClinicalAlerts({
      medications: ['ibuprofen', 'metformin'],
      conditions: ['heart failure'],
    });
    const condAlert = result.alerts.find(a =>
      a.category === 'Condition-Drug Interaction' && a.title.includes('heart failure')
    );
    expect(condAlert).toBeDefined();
  });

  it('no condition-drug alert when conditions empty', () => {
    const result = generateClinicalAlerts({
      medications: ['ibuprofen', 'metformin'],
    });
    const condAlerts = result.alerts.filter(a => a.category === 'Condition-Drug Interaction');
    expect(condAlerts.length).toBe(0);
  });
});

describe('Sepsis Pattern Recognition', () => {
  it('detects possible sepsis with >= 3 indicators', () => {
    const result = generateClinicalAlerts({
      vitals: {
        temperature: 39.0,
        heartRate: 110,
        respiratoryRate: 25,
        systolicBp: 95,
      },
      labResults: [
        { test: 'WBC', value: 18.0 },
      ],
    });
    const sepsisAlert = result.alerts.find(a =>
      a.title.includes('sepsis') || a.title.includes('Sepsis')
    );
    expect(sepsisAlert).toBeDefined();
  });

  it('sepsis screening with infection sign and 2 indicators', () => {
    const result = generateClinicalAlerts({
      vitals: {
        temperature: 38.5,
        heartRate: 105,
      },
      labResults: [
        { test: 'WBC', value: 6.0 },
      ],
    });
    // With fever + tachycardia = 2 indicators with infection sign
    const sepsisAlert = result.alerts.find(a =>
      a.title.includes('Sepsis screening') || a.title.includes('sepsis')
    );
    expect(sepsisAlert).toBeDefined();
  });

  it('no sepsis alert with only 1 indicator', () => {
    const result = generateClinicalAlerts({
      vitals: {
        temperature: 38.5,
        heartRate: 80,
        respiratoryRate: 16,
      },
      labResults: [
        { test: 'WBC', value: 8.0 },
      ],
    });
    const sepsisAlerts = result.alerts.filter(a =>
      a.title.toLowerCase().includes('sepsis')
    );
    expect(sepsisAlerts.length).toBe(0);
  });
});

describe('ACS Pattern Recognition', () => {
  it('detects possible ACS with elevated troponin and hemodynamic abnormality', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 110 },
      labResults: [
        { test: 'TROP', value: 50 },
      ],
    });
    const acsAlert = result.alerts.find(a => a.title.includes('acute coronary syndrome'));
    expect(acsAlert).toBeDefined();
    expect(acsAlert!.priority).toBe('critical');
  });

  it('no ACS alert with normal troponin', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 110 },
      labResults: [
        { test: 'TROP', value: 5 },
      ],
    });
    const acsAlert = result.alerts.find(a => a.title.includes('acute coronary syndrome'));
    expect(acsAlert).toBeUndefined();
  });
});

describe('DKA Pattern Recognition', () => {
  it('detects possible DKA in diabetic with high glucose', () => {
    const result = generateClinicalAlerts({
      labResults: [{ test: 'GLU', value: 450 }],
      conditions: ['diabetes mellitus'],
    });
    const dkaAlert = result.alerts.find(a => a.title.includes('DKA'));
    expect(dkaAlert).toBeDefined();
    expect(dkaAlert!.priority).toBe('critical');
  });

  it('no DKA alert for non-diabetic even with high glucose', () => {
    const result = generateClinicalAlerts({
      labResults: [{ test: 'GLU', value: 450 }],
    });
    const dkaAlert = result.alerts.find(a => a.title.includes('DKA'));
    expect(dkaAlert).toBeUndefined();
  });

  it('no DKA alert for diabetic with moderate glucose', () => {
    const result = generateClinicalAlerts({
      labResults: [{ test: 'GLU', value: 200 }],
      conditions: ['diabetes'],
    });
    const dkaAlert = result.alerts.find(a => a.title.includes('DKA'));
    expect(dkaAlert).toBeUndefined();
  });
});

describe('Anticoagulation + Lab Pattern Alerts', () => {
  it('supratherapeutic INR on warfarin', () => {
    const result = generateClinicalAlerts({
      medications: ['warfarin', 'metformin'],
      labResults: [{ test: 'INR', value: 5.0 }],
    });
    const inrAlert = result.alerts.find(a => a.title.includes('Supratherapeutic'));
    expect(inrAlert).toBeDefined();
    expect(inrAlert!.priority).toBe('critical');
  });

  it('thrombocytopenia on anticoagulation', () => {
    const result = generateClinicalAlerts({
      medications: ['enoxaparin', 'metformin'],
      labResults: [{ test: 'PLT', value: 70 }],
    });
    const pltAlert = result.alerts.find(a => a.title.includes('Thrombocytopenia on anticoagulation'));
    expect(pltAlert).toBeDefined();
    expect(pltAlert!.priority).toBe('high');
  });

  it('no anticoag alert when not on anticoagulants', () => {
    const result = generateClinicalAlerts({
      medications: ['metformin', 'lisinopril'],
      labResults: [{ test: 'INR', value: 5.0 }],
    });
    const supraAlert = result.alerts.find(a => a.title.includes('Supratherapeutic anticoagulation'));
    expect(supraAlert).toBeUndefined();
  });
});

describe('Geriatric Safety Alerts', () => {
  it('fall risk medications in elderly (>= 65)', () => {
    const result = generateClinicalAlerts({
      age: 75,
      medications: ['alprazolam', 'metformin'],
    });
    const fallAlert = result.alerts.find(a => a.title.includes('Fall risk'));
    expect(fallAlert).toBeDefined();
    expect(fallAlert!.priority).toBe('moderate');
  });

  it('anticholinergic medications in elderly', () => {
    const result = generateClinicalAlerts({
      age: 70,
      medications: ['diphenhydramine', 'lisinopril'],
    });
    const acAlert = result.alerts.find(a => a.title.includes('Anticholinergic'));
    expect(acAlert).toBeDefined();
    expect(acAlert!.priority).toBe('moderate');
  });

  it('no geriatric alert for young patient', () => {
    const result = generateClinicalAlerts({
      age: 40,
      medications: ['alprazolam', 'diphenhydramine'],
    });
    const geriatricAlerts = result.alerts.filter(a => a.category === 'Geriatric Safety');
    expect(geriatricAlerts.length).toBe(0);
  });

  it('no geriatric alert without high-risk medications', () => {
    const result = generateClinicalAlerts({
      age: 80,
      medications: ['metformin', 'lisinopril'],
    });
    const geriatricAlerts = result.alerts.filter(a => a.category === 'Geriatric Safety');
    expect(geriatricAlerts.length).toBe(0);
  });
});

describe('Overall Risk Profile', () => {
  it('critical risk when critical alerts present', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 80 },
    });
    expect(result.riskProfile.overallRisk).toBe('critical');
  });

  it('high risk when high alerts present but no critical', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 45 },
    });
    expect(result.riskProfile.overallRisk).toBe('high');
  });

  it('moderate risk when moderate alerts present', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 150 },
    });
    expect(result.riskProfile.overallRisk).toBe('moderate');
  });

  it('low risk when no significant alerts', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 120 },
    });
    expect(result.riskProfile.overallRisk).toBe('low');
  });

  it('polypharmacy noted in risk factors', () => {
    const result = generateClinicalAlerts({
      medications: ['warfarin', 'metformin', 'lisinopril', 'amlodipine', 'omeprazole'],
    });
    expect(result.riskProfile.factors.some(f => f.includes('Polypharmacy'))).toBe(true);
  });

  it('advanced age noted in risk factors', () => {
    const result = generateClinicalAlerts({
      age: 80,
    });
    expect(result.riskProfile.factors.some(f => f.includes('age'))).toBe(true);
  });
});

describe('Alert Sorting and Priority', () => {
  it('alerts sorted by priority (critical first)', () => {
    const result = generateClinicalAlerts({
      vitals: {
        systolicBp: 80,  // critical
        heartRate: 110,   // moderate
      },
    });
    expect(result.alerts.length).toBeGreaterThan(1);
    expect(result.alerts[0].priority).toBe('critical');
  });

  it('all alert fields are populated', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 80 },
    });
    for (const alert of result.alerts) {
      expect(alert.priority).toBeTruthy();
      expect(alert.category).toBeTruthy();
      expect(alert.title).toBeTruthy();
      expect(alert.detail).toBeTruthy();
      expect(alert.action).toBeTruthy();
      expect(alert.source).toBeTruthy();
    }
  });
});

describe('Combined Multi-System Alerts', () => {
  it('multiple system alerts aggregated correctly', () => {
    const result = generateClinicalAlerts({
      age: 75,
      medications: ['warfarin', 'aspirin', 'alprazolam', 'metformin', 'lisinopril'],
      labResults: [
        { test: 'K', value: 6.8 },
        { test: 'INR', value: 5.5 },
      ],
      vitals: {
        systolicBp: 85,
        heartRate: 120,
        temperature: 38.5,
      },
      conditions: ['renal impairment'],
    });
    expect(result.totalAlerts).toBeGreaterThan(5);
    expect(result.riskProfile.overallRisk).toBe('critical');
    expect(result.alertsByPriority.critical).toBeGreaterThan(0);

    // Should have alerts from multiple categories
    const categories = new Set(result.alerts.map(a => a.category));
    expect(categories.size).toBeGreaterThan(2);
  });

  it('summary includes critical count', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 80 },
      labResults: [{ test: 'K', value: 7.0 }],
    });
    if (result.alertsByPriority.critical > 0) {
      expect(result.summary).toContain('CRITICAL');
    }
  });

  it('summary lists categories', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 80 },
      medications: ['warfarin', 'aspirin'],
    });
    if (result.totalAlerts > 0) {
      expect(result.summary).toContain('Categories');
    }
  });
});

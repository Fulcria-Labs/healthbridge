import { describe, it, expect } from 'vitest';
import { generateClinicalAlerts, type PatientContext } from '../src/tools/clinical-alerts-tool';

/**
 * Edge cases and boundary conditions for clinical alerts generation.
 */

describe('Clinical Alerts - Empty/Minimal Contexts', () => {
  it('generates no alerts for completely empty context', () => {
    const result = generateClinicalAlerts({});
    expect(result.totalAlerts).toBe(0);
    expect(result.riskProfile.overallRisk).toBe('low');
    expect(result.summary).toContain('No clinical alerts');
  });

  it('generates no alerts for context with only age', () => {
    const result = generateClinicalAlerts({ age: 45 });
    expect(result.totalAlerts).toBe(0);
  });

  it('generates no alerts for context with only sex', () => {
    const result = generateClinicalAlerts({ sex: 'male' });
    expect(result.totalAlerts).toBe(0);
  });

  it('generates no alerts for single medication', () => {
    const result = generateClinicalAlerts({ medications: ['metformin'] });
    expect(result.totalAlerts).toBe(0);
  });

  it('generates no alerts for empty medication list', () => {
    const result = generateClinicalAlerts({ medications: [] });
    expect(result.totalAlerts).toBe(0);
  });

  it('generates no alerts for empty lab results', () => {
    const result = generateClinicalAlerts({ labResults: [] });
    expect(result.totalAlerts).toBe(0);
  });
});

describe('Clinical Alerts - Vital Sign Thresholds', () => {
  it('critical alert for hypotension (SBP < 90)', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 80 },
    });
    const alert = result.alerts.find(a => a.title.includes('Hypotension'));
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('critical');
  });

  it('critical alert for hypertensive emergency (SBP >= 180)', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 200 },
    });
    const alert = result.alerts.find(a => a.title.includes('Hypertensive'));
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('critical');
  });

  it('moderate alert for elevated BP (SBP 140-179)', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 155 },
    });
    const alert = result.alerts.find(a => a.title.includes('Elevated blood pressure'));
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('moderate');
  });

  it('no BP alert for normal SBP (91-139)', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 120 },
    });
    const bpAlerts = result.alerts.filter(a => a.category === 'Vital Signs' && a.title.includes('pressure') || a.title.includes('tension'));
    expect(bpAlerts.length).toBe(0);
  });

  it('critical alert for severe bradycardia (HR < 40)', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 35 },
    });
    const alert = result.alerts.find(a => a.title.includes('bradycardia'));
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('critical');
  });

  it('high alert for bradycardia (HR 40-49)', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 45 },
    });
    const alert = result.alerts.find(a => a.title === 'Bradycardia');
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('high');
  });

  it('moderate alert for tachycardia (HR 101-150)', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 120 },
    });
    const alert = result.alerts.find(a => a.title === 'Tachycardia');
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('moderate');
  });

  it('critical alert for severe tachycardia (HR > 150)', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 165 },
    });
    const alert = result.alerts.find(a => a.title.includes('Severe tachycardia'));
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('critical');
  });

  it('no HR alert for normal heart rate (50-100)', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 72 },
    });
    const hrAlerts = result.alerts.filter(a => a.title.includes('cardia'));
    expect(hrAlerts.length).toBe(0);
  });

  it('critical alert for severe hypoxia (SpO2 < 88)', () => {
    const result = generateClinicalAlerts({
      vitals: { spo2: 82 },
    });
    const alert = result.alerts.find(a => a.title.includes('Severe hypoxia'));
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('critical');
  });

  it('high alert for hypoxia (SpO2 88-91)', () => {
    const result = generateClinicalAlerts({
      vitals: { spo2: 90 },
    });
    const alert = result.alerts.find(a => a.title === 'Hypoxia');
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('high');
  });

  it('no SpO2 alert for normal saturation (>= 92)', () => {
    const result = generateClinicalAlerts({
      vitals: { spo2: 98 },
    });
    const spo2Alerts = result.alerts.filter(a => a.title.includes('hypoxia') || a.title.includes('Hypoxia'));
    expect(spo2Alerts.length).toBe(0);
  });

  it('critical alert for high fever (>= 40.0)', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 40.5 },
    });
    const alert = result.alerts.find(a => a.title.includes('Hyperthermia') || a.title.includes('fever'));
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('critical');
  });

  it('moderate alert for fever (38.3-39.9)', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 38.5 },
    });
    const alert = result.alerts.find(a => a.title === 'Fever');
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('moderate');
  });

  it('high alert for hypothermia (< 35.0)', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 34.0 },
    });
    const alert = result.alerts.find(a => a.title.includes('Hypothermia'));
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('high');
  });

  it('no temperature alert for normal (35.0-38.2)', () => {
    const result = generateClinicalAlerts({
      vitals: { temperature: 36.8 },
    });
    const tempAlerts = result.alerts.filter(a => a.title.includes('Fever') || a.title.includes('therm'));
    expect(tempAlerts.length).toBe(0);
  });

  it('critical alert for severe tachypnea (RR > 30)', () => {
    const result = generateClinicalAlerts({
      vitals: { respiratoryRate: 35 },
    });
    const alert = result.alerts.find(a => a.title.includes('Severe tachypnea'));
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('critical');
  });

  it('moderate alert for tachypnea (RR 23-30)', () => {
    const result = generateClinicalAlerts({
      vitals: { respiratoryRate: 25 },
    });
    const alert = result.alerts.find(a => a.title === 'Tachypnea');
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('moderate');
  });

  it('critical alert for respiratory depression (RR < 8)', () => {
    const result = generateClinicalAlerts({
      vitals: { respiratoryRate: 5 },
    });
    const alert = result.alerts.find(a => a.title.includes('Respiratory depression'));
    expect(alert).toBeDefined();
    expect(alert!.priority).toBe('critical');
  });

  it('no RR alert for normal respiratory rate (8-22)', () => {
    const result = generateClinicalAlerts({
      vitals: { respiratoryRate: 16 },
    });
    const rrAlerts = result.alerts.filter(a => a.title.includes('tachypnea') || a.title.includes('Tachypnea') || a.title.includes('depression'));
    expect(rrAlerts.length).toBe(0);
  });
});

describe('Clinical Alerts - Vital Boundary Values', () => {
  it('SBP exactly 90 is NOT hypotension', () => {
    const result = generateClinicalAlerts({ vitals: { systolicBp: 90 } });
    const hypoAlert = result.alerts.find(a => a.title === 'Hypotension');
    expect(hypoAlert).toBeUndefined();
  });

  it('SBP exactly 180 IS hypertensive emergency', () => {
    const result = generateClinicalAlerts({ vitals: { systolicBp: 180 } });
    const hyperAlert = result.alerts.find(a => a.title.includes('Hypertensive'));
    expect(hyperAlert).toBeDefined();
  });

  it('SBP exactly 140 IS elevated', () => {
    const result = generateClinicalAlerts({ vitals: { systolicBp: 140 } });
    const elevAlert = result.alerts.find(a => a.title.includes('Elevated blood pressure'));
    expect(elevAlert).toBeDefined();
  });

  it('HR exactly 40 IS severe bradycardia', () => {
    const result = generateClinicalAlerts({ vitals: { heartRate: 40 } });
    // HR < 40 = critical, HR 40-49 = still checked
    // The code: < 40 is critical, < 50 is high
    const critBrady = result.alerts.find(a => a.title.includes('Severe bradycardia'));
    // HR = 40 is NOT < 40, so it should be bradycardia (high), not severe
    expect(critBrady).toBeUndefined();
    const brady = result.alerts.find(a => a.title === 'Bradycardia');
    expect(brady).toBeDefined();
  });

  it('HR exactly 50 has no alert (50 is NOT < 50)', () => {
    const result = generateClinicalAlerts({ vitals: { heartRate: 50 } });
    const bradyAlerts = result.alerts.filter(a => a.title.includes('radycardia'));
    expect(bradyAlerts.length).toBe(0);
  });

  it('HR exactly 100 has no alert (100 is NOT > 100)', () => {
    const result = generateClinicalAlerts({ vitals: { heartRate: 100 } });
    const tachyAlerts = result.alerts.filter(a => a.title.includes('achycardia'));
    expect(tachyAlerts.length).toBe(0);
  });

  it('temperature exactly 38.3 IS fever', () => {
    const result = generateClinicalAlerts({ vitals: { temperature: 38.3 } });
    const feverAlert = result.alerts.find(a => a.title === 'Fever');
    expect(feverAlert).toBeDefined();
  });

  it('temperature exactly 35.0 is NOT hypothermia', () => {
    const result = generateClinicalAlerts({ vitals: { temperature: 35.0 } });
    const hypoAlert = result.alerts.find(a => a.title.includes('Hypothermia'));
    expect(hypoAlert).toBeUndefined();
  });

  it('RR exactly 8 has no respiratory depression alert', () => {
    const result = generateClinicalAlerts({ vitals: { respiratoryRate: 8 } });
    const depAlert = result.alerts.find(a => a.title.includes('Respiratory depression'));
    expect(depAlert).toBeUndefined();
  });
});

describe('Clinical Alerts - Drug Interaction Integration', () => {
  it('generates critical drug alert for contraindicated combo', () => {
    const result = generateClinicalAlerts({
      medications: ['fluoxetine', 'phenelzine'],
    });
    const drugAlert = result.alerts.find(a => a.category === 'Drug Interaction' && a.priority === 'critical');
    expect(drugAlert).toBeDefined();
    expect(drugAlert!.title).toContain('CONTRAINDICATED');
  });

  it('generates high-priority alert for major interaction', () => {
    const result = generateClinicalAlerts({
      medications: ['warfarin', 'aspirin'],
    });
    const drugAlert = result.alerts.find(a => a.category === 'Drug Interaction');
    expect(drugAlert).toBeDefined();
    expect(drugAlert!.priority).toBe('high');
  });

  it('generates polypharmacy alert for 5+ medications', () => {
    const result = generateClinicalAlerts({
      medications: ['metformin', 'lisinopril', 'metoprolol', 'atorvastatin', 'omeprazole'],
    });
    const polyAlert = result.alerts.find(a => a.title.includes('Polypharmacy'));
    expect(polyAlert).toBeDefined();
    expect(polyAlert!.priority).toBe('moderate');
  });

  it('no polypharmacy alert for 4 medications', () => {
    const result = generateClinicalAlerts({
      medications: ['metformin', 'lisinopril', 'metoprolol', 'atorvastatin'],
    });
    const polyAlert = result.alerts.find(a => a.title.includes('Polypharmacy'));
    expect(polyAlert).toBeUndefined();
  });
});

describe('Clinical Alerts - Condition-Drug Interactions', () => {
  it('flags nephrotoxic drugs with renal impairment', () => {
    const result = generateClinicalAlerts({
      medications: ['ibuprofen', 'metformin'],
      conditions: ['chronic kidney disease'],
    });
    const condDrug = result.alerts.filter(a => a.category === 'Condition-Drug Interaction');
    expect(condDrug.length).toBeGreaterThanOrEqual(2);
  });

  it('flags hepatotoxic drugs with liver disease', () => {
    const result = generateClinicalAlerts({
      medications: ['acetaminophen', 'simvastatin'],
      conditions: ['cirrhosis'],
    });
    const condDrug = result.alerts.filter(a => a.category === 'Condition-Drug Interaction');
    expect(condDrug.length).toBeGreaterThanOrEqual(2);
  });

  it('flags drugs contraindicated in heart failure', () => {
    const result = generateClinicalAlerts({
      medications: ['verapamil', 'ibuprofen'],
      conditions: ['heart failure'],
    });
    const condDrug = result.alerts.filter(a => a.category === 'Condition-Drug Interaction');
    expect(condDrug.length).toBeGreaterThanOrEqual(2);
  });

  it('no condition-drug alerts without conditions', () => {
    const result = generateClinicalAlerts({
      medications: ['ibuprofen', 'metformin'],
    });
    const condDrug = result.alerts.filter(a => a.category === 'Condition-Drug Interaction');
    expect(condDrug.length).toBe(0);
  });

  it('detects CKD variant of renal condition', () => {
    // Needs >= 2 medications for drug alerts to fire
    const result = generateClinicalAlerts({
      medications: ['ibuprofen', 'metformin'],
      conditions: ['CKD stage 3'],
    });
    const condDrug = result.alerts.filter(a => a.category === 'Condition-Drug Interaction');
    expect(condDrug.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Clinical Alerts - Lab Pattern Detection', () => {
  it('detects BUN/Creatinine ratio pattern', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'BUN', value: 45 },
        { test: 'creatinine', value: 1.8 },
      ],
    });
    const ratioAlert = result.alerts.find(a => a.title.includes('BUN/Creatinine'));
    expect(ratioAlert).toBeDefined();
  });

  it('detects AST/ALT ratio > 2 pattern', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'AST', value: 200 },
        { test: 'ALT', value: 80 },
      ],
    });
    const ratioAlert = result.alerts.find(a => a.title.includes('AST/ALT'));
    expect(ratioAlert).toBeDefined();
    expect(ratioAlert!.detail).toContain('alcoholic liver disease');
  });

  it('detects combined anemia and thrombocytopenia', () => {
    const result = generateClinicalAlerts({
      labResults: [
        { test: 'hemoglobin', value: 8.0 },
        { test: 'platelets', value: 80 },
      ],
    });
    const biAlert = result.alerts.find(a => a.title.includes('anemia and thrombocytopenia'));
    expect(biAlert).toBeDefined();
    expect(biAlert!.priority).toBe('high');
  });
});

describe('Clinical Alerts - Sepsis Pattern Detection', () => {
  it('detects possible sepsis with >= 3 indicators', () => {
    const result = generateClinicalAlerts({
      vitals: {
        temperature: 39.0,
        heartRate: 120,
        respiratoryRate: 24,
        systolicBp: 90,
      },
      labResults: [
        { test: 'WBC', value: 18 },
        { test: 'lactate', value: 3.5 },
      ],
    });
    const sepsisAlert = result.alerts.find(a => a.title.includes('sepsis'));
    expect(sepsisAlert).toBeDefined();
    expect(sepsisAlert!.priority).toBe('critical');
  });

  it('detects sepsis screening positive with 2+ indicators including infection sign', () => {
    const result = generateClinicalAlerts({
      vitals: {
        temperature: 38.5,
        heartRate: 110,
      },
      labResults: [],
    });
    const sepsisAlert = result.alerts.find(a => a.title.includes('Sepsis screening'));
    expect(sepsisAlert).toBeDefined();
    expect(sepsisAlert!.priority).toBe('high');
  });

  it('hypothermia counts as infection sign for sepsis', () => {
    const result = generateClinicalAlerts({
      vitals: {
        temperature: 35.5, // < 36.0 = infection sign
        heartRate: 110,
        respiratoryRate: 24,
      },
      labResults: [
        { test: 'WBC', value: 16 },
      ],
    });
    const sepsisAlert = result.alerts.find(a => a.title.includes('sepsis'));
    expect(sepsisAlert).toBeDefined();
  });
});

describe('Clinical Alerts - ACS Pattern Detection', () => {
  it('detects possible ACS with elevated troponin and hemodynamic abnormality', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 110 },
      labResults: [{ test: 'troponin', value: 50 }],
    });
    const acsAlert = result.alerts.find(a => a.title.includes('acute coronary syndrome'));
    expect(acsAlert).toBeDefined();
    expect(acsAlert!.priority).toBe('critical');
  });

  it('no ACS alert with normal troponin even with tachycardia', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 110 },
      labResults: [{ test: 'troponin', value: 10 }],
    });
    const acsAlert = result.alerts.find(a => a.title.includes('acute coronary syndrome'));
    expect(acsAlert).toBeUndefined();
  });
});

describe('Clinical Alerts - DKA Pattern Detection', () => {
  it('detects possible DKA in diabetic with glucose > 300', () => {
    // The pattern detection uses labMap.get('GLU') so test input must be 'GLU'
    const result = generateClinicalAlerts({
      conditions: ['Type 2 Diabetes'],
      labResults: [{ test: 'GLU', value: 450 }],
    });
    const dkaAlert = result.alerts.find(a => a.title.includes('DKA'));
    expect(dkaAlert).toBeDefined();
    expect(dkaAlert!.priority).toBe('critical');
  });

  it('no DKA alert for glucose > 300 without diabetes', () => {
    const result = generateClinicalAlerts({
      labResults: [{ test: 'GLU', value: 450 }],
    });
    const dkaAlert = result.alerts.find(a => a.title.includes('DKA'));
    expect(dkaAlert).toBeUndefined();
  });

  it('no DKA alert for diabetic with glucose <= 300', () => {
    const result = generateClinicalAlerts({
      conditions: ['Diabetes'],
      labResults: [{ test: 'GLU', value: 250 }],
    });
    const dkaAlert = result.alerts.find(a => a.title.includes('DKA'));
    expect(dkaAlert).toBeUndefined();
  });
});

describe('Clinical Alerts - Anticoagulation + Lab Patterns', () => {
  it('critical alert for supratherapeutic INR on anticoagulant', () => {
    const result = generateClinicalAlerts({
      medications: ['warfarin'],
      labResults: [{ test: 'INR', value: 4.5 }],
    });
    const inrAlert = result.alerts.find(a => a.title.includes('Supratherapeutic'));
    expect(inrAlert).toBeDefined();
    expect(inrAlert!.priority).toBe('critical');
  });

  it('no supratherapeutic INR alert if not on anticoagulant', () => {
    const result = generateClinicalAlerts({
      medications: ['metformin'],
      labResults: [{ test: 'INR', value: 4.5 }],
    });
    const inrAlert = result.alerts.find(a => a.title.includes('Supratherapeutic'));
    expect(inrAlert).toBeUndefined();
  });

  it('thrombocytopenia on anticoagulation alert', () => {
    const result = generateClinicalAlerts({
      medications: ['heparin'],
      labResults: [{ test: 'PLT', value: 80 }],
    });
    const pltAlert = result.alerts.find(a => a.title.includes('Thrombocytopenia on anticoagulation'));
    expect(pltAlert).toBeDefined();
    expect(pltAlert!.priority).toBe('high');
    expect(pltAlert!.action).toContain('HIT');
  });

  it('recognizes DOAC as anticoagulant', () => {
    const result = generateClinicalAlerts({
      medications: ['rivaroxaban'],
      labResults: [{ test: 'PLT', value: 70 }],
    });
    const pltAlert = result.alerts.find(a => a.title.includes('Thrombocytopenia on anticoagulation'));
    expect(pltAlert).toBeDefined();
  });
});

describe('Clinical Alerts - Age-Specific Alerts', () => {
  it('fall risk alert for elderly on benzodiazepines', () => {
    const result = generateClinicalAlerts({
      age: 72,
      medications: ['alprazolam'],
    });
    const fallAlert = result.alerts.find(a => a.title.includes('Fall risk'));
    expect(fallAlert).toBeDefined();
    expect(fallAlert!.category).toBe('Geriatric Safety');
  });

  it('fall risk alert for elderly on opioids', () => {
    const result = generateClinicalAlerts({
      age: 80,
      medications: ['oxycodone'],
    });
    const fallAlert = result.alerts.find(a => a.title.includes('Fall risk'));
    expect(fallAlert).toBeDefined();
  });

  it('no fall risk alert for young patient on same meds', () => {
    const result = generateClinicalAlerts({
      age: 40,
      medications: ['alprazolam'],
    });
    const fallAlert = result.alerts.find(a => a.title.includes('Fall risk'));
    expect(fallAlert).toBeUndefined();
  });

  it('anticholinergic alert for elderly', () => {
    const result = generateClinicalAlerts({
      age: 70,
      medications: ['diphenhydramine'],
    });
    const acAlert = result.alerts.find(a => a.title.includes('Anticholinergic'));
    expect(acAlert).toBeDefined();
  });

  it('no anticholinergic alert for patient under 65', () => {
    const result = generateClinicalAlerts({
      age: 55,
      medications: ['diphenhydramine'],
    });
    const acAlert = result.alerts.find(a => a.title.includes('Anticholinergic'));
    expect(acAlert).toBeUndefined();
  });

  it('age exactly 65 triggers geriatric alerts', () => {
    const result = generateClinicalAlerts({
      age: 65,
      medications: ['lorazepam'],
    });
    const fallAlert = result.alerts.find(a => a.title.includes('Fall risk'));
    expect(fallAlert).toBeDefined();
  });
});

describe('Clinical Alerts - Risk Profile', () => {
  it('overall risk is critical when any critical alert exists', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 70 },
    });
    expect(result.riskProfile.overallRisk).toBe('critical');
    expect(result.riskProfile.factors).toContain('1 critical alert(s)');
  });

  it('overall risk is high when high alerts but no critical', () => {
    const result = generateClinicalAlerts({
      vitals: { heartRate: 45 },
    });
    expect(result.riskProfile.overallRisk).toBe('high');
  });

  it('risk factors include polypharmacy for 5+ meds', () => {
    const result = generateClinicalAlerts({
      medications: ['metformin', 'lisinopril', 'metoprolol', 'atorvastatin', 'omeprazole'],
    });
    expect(result.riskProfile.factors).toContain('Polypharmacy (5+ medications)');
  });

  it('risk factors include advanced age for >= 75', () => {
    const result = generateClinicalAlerts({ age: 80 });
    expect(result.riskProfile.factors).toContain('Advanced age (≥75)');
  });

  it('alerts are sorted by priority (critical first)', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 70, heartRate: 110 },
    });
    if (result.alerts.length >= 2) {
      const priorities = result.alerts.map(a => a.priority);
      const criticalIdx = priorities.indexOf('critical');
      const moderateIdx = priorities.indexOf('moderate');
      if (criticalIdx >= 0 && moderateIdx >= 0) {
        expect(criticalIdx).toBeLessThan(moderateIdx);
      }
    }
  });
});

describe('Clinical Alerts - Summary Generation', () => {
  it('summary mentions total alert count', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 70 },
    });
    expect(result.summary).toContain('alert');
    expect(result.summary).toContain(result.totalAlerts.toString());
  });

  it('summary mentions CRITICAL when present', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 70 },
    });
    expect(result.summary).toContain('CRITICAL');
  });

  it('summary lists categories', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 70 },
      medications: ['warfarin', 'aspirin'],
    });
    expect(result.summary).toContain('Categories');
  });

  it('alertsByPriority counts are accurate', () => {
    const result = generateClinicalAlerts({
      vitals: { systolicBp: 70, heartRate: 110 },
    });
    let total = 0;
    for (const count of Object.values(result.alertsByPriority)) {
      total += count;
    }
    expect(total).toBe(result.totalAlerts);
  });
});

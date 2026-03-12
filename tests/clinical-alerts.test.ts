import { describe, it, expect } from 'vitest';
import { generateClinicalAlerts, type PatientContext, type ClinicalAlert, type AlertPriority } from '../src/tools/clinical-alerts-tool';

// Helper to find alerts by criteria
function findAlerts(alerts: ClinicalAlert[], criteria: { priority?: AlertPriority; category?: string; titleContains?: string }) {
  return alerts.filter(a =>
    (!criteria.priority || a.priority === criteria.priority) &&
    (!criteria.category || a.category === criteria.category) &&
    (!criteria.titleContains || a.title.toLowerCase().includes(criteria.titleContains.toLowerCase()))
  );
}

describe('Clinical Alerts Aggregator', () => {

  describe('Empty / minimal context', () => {
    it('returns no alerts for empty context', () => {
      const result = generateClinicalAlerts({});
      expect(result.totalAlerts).toBe(0);
      expect(result.alerts).toHaveLength(0);
      expect(result.riskProfile.overallRisk).toBe('low');
      expect(result.summary).toContain('No clinical alerts');
    });

    it('returns no alerts for normal labs', () => {
      const result = generateClinicalAlerts({
        labResults: [
          { test: 'WBC', value: 7.0 },
          { test: 'HGB', value: 14.0 },
          { test: 'PLT', value: 250 },
          { test: 'K', value: 4.0 },
          { test: 'NA', value: 140 },
        ],
      });
      const labAlerts = findAlerts(result.alerts, { category: 'Laboratory' });
      expect(labAlerts).toHaveLength(0);
    });

    it('returns no alerts for normal vitals', () => {
      const result = generateClinicalAlerts({
        vitals: {
          systolicBp: 120,
          heartRate: 72,
          respiratoryRate: 16,
          temperature: 37.0,
          spo2: 98,
        },
      });
      const vitalAlerts = findAlerts(result.alerts, { category: 'Vital Signs' });
      expect(vitalAlerts).toHaveLength(0);
    });
  });

  describe('Lab-based alerts', () => {
    it('generates critical alert for critically low potassium', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'K', value: 2.2 }],
      });
      const criticalAlerts = findAlerts(result.alerts, { priority: 'critical', category: 'Laboratory' });
      expect(criticalAlerts.length).toBeGreaterThanOrEqual(1);
      expect(criticalAlerts[0].title).toContain('Potassium');
      expect(result.riskProfile.overallRisk).toBe('critical');
    });

    it('generates critical alert for critically high potassium', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'K', value: 7.0 }],
      });
      const criticalAlerts = findAlerts(result.alerts, { priority: 'critical' });
      expect(criticalAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('generates critical alert for severe hypoglycemia', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'GLU', value: 30 }],
      });
      const criticalAlerts = findAlerts(result.alerts, { priority: 'critical' });
      expect(criticalAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('generates high alert for abnormal hemoglobin', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'HGB', value: 9.0 }],
      });
      const highAlerts = findAlerts(result.alerts, { priority: 'high' });
      expect(highAlerts.length).toBeGreaterThanOrEqual(1);
      expect(highAlerts.some(a => a.title.includes('Hemoglobin'))).toBe(true);
    });

    it('generates critical alert for severe anemia', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'HGB', value: 5.0 }],
      });
      const criticalAlerts = findAlerts(result.alerts, { priority: 'critical' });
      expect(criticalAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('generates critical alert for critically high INR', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'INR', value: 6.0 }],
      });
      const criticalAlerts = findAlerts(result.alerts, { priority: 'critical' });
      expect(criticalAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('generates alert for elevated troponin', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'TROP', value: 150 }],
      });
      const alerts = result.alerts.filter(a => a.category === 'Laboratory');
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });

    it('generates alert for critically elevated WBC', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'WBC', value: 35 }],
      });
      const criticalAlerts = findAlerts(result.alerts, { priority: 'critical' });
      expect(criticalAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('generates alert for severe hyponatremia', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'NA', value: 115 }],
      });
      const criticalAlerts = findAlerts(result.alerts, { priority: 'critical' });
      expect(criticalAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('generates alert for elevated creatinine', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'CREAT', value: 3.5 }],
      });
      const alerts = findAlerts(result.alerts, { priority: 'high' });
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Lab pattern recognition', () => {
    it('detects elevated BUN/Creatinine ratio', () => {
      const result = generateClinicalAlerts({
        labResults: [
          { test: 'BUN', value: 45 },
          { test: 'CREAT', value: 1.5 },
        ],
      });
      const patternAlerts = findAlerts(result.alerts, { category: 'Laboratory Pattern' });
      expect(patternAlerts.some(a => a.title.includes('BUN/Creatinine'))).toBe(true);
    });

    it('detects AST/ALT ratio >2 pattern', () => {
      const result = generateClinicalAlerts({
        labResults: [
          { test: 'AST', value: 180 },
          { test: 'ALT', value: 70 },
        ],
      });
      const patternAlerts = findAlerts(result.alerts, { category: 'Laboratory Pattern' });
      expect(patternAlerts.some(a => a.title.includes('AST/ALT'))).toBe(true);
    });

    it('detects combined anemia + thrombocytopenia (bicytopenia)', () => {
      const result = generateClinicalAlerts({
        labResults: [
          { test: 'HGB', value: 8.0 },
          { test: 'PLT', value: 80 },
        ],
      });
      const patternAlerts = findAlerts(result.alerts, { titleContains: 'anemia' });
      expect(patternAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('does not flag BUN/Cr ratio when both normal', () => {
      const result = generateClinicalAlerts({
        labResults: [
          { test: 'BUN', value: 15 },
          { test: 'CREAT', value: 1.0 },
        ],
      });
      const patternAlerts = findAlerts(result.alerts, { category: 'Laboratory Pattern', titleContains: 'BUN' });
      expect(patternAlerts).toHaveLength(0);
    });

    it('does not flag AST/ALT ratio when both normal', () => {
      const result = generateClinicalAlerts({
        labResults: [
          { test: 'AST', value: 25 },
          { test: 'ALT', value: 30 },
        ],
      });
      const patternAlerts = findAlerts(result.alerts, { category: 'Laboratory Pattern', titleContains: 'AST/ALT' });
      expect(patternAlerts).toHaveLength(0);
    });
  });

  describe('Drug interaction alerts', () => {
    it('generates critical alert for contraindicated drug combination', () => {
      const result = generateClinicalAlerts({
        medications: ['phenelzine', 'fluoxetine'],
      });
      const criticalAlerts = findAlerts(result.alerts, { priority: 'critical', category: 'Drug Interaction' });
      expect(criticalAlerts.length).toBeGreaterThanOrEqual(1);
      expect(result.riskProfile.overallRisk).toBe('critical');
    });

    it('generates high alert for major drug interaction', () => {
      const result = generateClinicalAlerts({
        medications: ['warfarin', 'aspirin'],
      });
      const alerts = result.alerts.filter(a => a.category === 'Drug Interaction');
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });

    it('generates no drug alerts for non-interacting medications', () => {
      const result = generateClinicalAlerts({
        medications: ['metformin', 'lisinopril'],
      });
      const drugAlerts = findAlerts(result.alerts, { category: 'Drug Interaction' });
      expect(drugAlerts).toHaveLength(0);
    });

    it('generates polypharmacy alert for 5+ medications', () => {
      const result = generateClinicalAlerts({
        medications: ['metformin', 'lisinopril', 'amlodipine', 'atorvastatin', 'metoprolol'],
      });
      const polyAlerts = findAlerts(result.alerts, { titleContains: 'polypharmacy' });
      expect(polyAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('does not generate polypharmacy alert for <5 medications', () => {
      const result = generateClinicalAlerts({
        medications: ['metformin', 'lisinopril', 'atorvastatin'],
      });
      const polyAlerts = findAlerts(result.alerts, { titleContains: 'polypharmacy' });
      expect(polyAlerts).toHaveLength(0);
    });

    it('generates no drug alerts for single medication', () => {
      const result = generateClinicalAlerts({
        medications: ['metformin'],
      });
      const drugAlerts = findAlerts(result.alerts, { category: 'Drug Interaction' });
      expect(drugAlerts).toHaveLength(0);
    });
  });

  describe('Condition-drug interaction alerts', () => {
    it('flags nephrotoxic drugs with renal impairment', () => {
      const result = generateClinicalAlerts({
        medications: ['ibuprofen', 'lisinopril'],
        conditions: ['chronic kidney disease'],
      });
      const condAlerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
      expect(condAlerts.length).toBeGreaterThanOrEqual(1);
      expect(condAlerts.some(a => a.title.includes('ibuprofen'))).toBe(true);
    });

    it('flags hepatotoxic drugs with liver disease', () => {
      const result = generateClinicalAlerts({
        medications: ['acetaminophen', 'atorvastatin'],
        conditions: ['cirrhosis'],
      });
      const condAlerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
      expect(condAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('flags NSAIDs with heart failure', () => {
      const result = generateClinicalAlerts({
        medications: ['ibuprofen', 'metoprolol'],
        conditions: ['heart failure'],
      });
      const condAlerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
      expect(condAlerts.some(a => a.title.includes('ibuprofen'))).toBe(true);
    });

    it('flags verapamil with heart failure', () => {
      const result = generateClinicalAlerts({
        medications: ['verapamil', 'furosemide'],
        conditions: ['CHF'],
      });
      const condAlerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
      expect(condAlerts.some(a => a.title.includes('verapamil'))).toBe(true);
    });

    it('no condition alerts without conditions', () => {
      const result = generateClinicalAlerts({
        medications: ['ibuprofen', 'metformin'],
      });
      const condAlerts = findAlerts(result.alerts, { category: 'Condition-Drug Interaction' });
      expect(condAlerts).toHaveLength(0);
    });
  });

  describe('Vital sign alerts', () => {
    it('generates critical alert for hypotension', () => {
      const result = generateClinicalAlerts({
        vitals: { systolicBp: 75 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'critical', titleContains: 'hypotension' });
      expect(alerts).toHaveLength(1);
    });

    it('generates critical alert for hypertensive emergency', () => {
      const result = generateClinicalAlerts({
        vitals: { systolicBp: 200 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'critical', titleContains: 'hypertensive' });
      expect(alerts).toHaveLength(1);
    });

    it('generates moderate alert for elevated BP', () => {
      const result = generateClinicalAlerts({
        vitals: { systolicBp: 155 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'moderate', titleContains: 'blood pressure' });
      expect(alerts).toHaveLength(1);
    });

    it('generates critical alert for severe bradycardia', () => {
      const result = generateClinicalAlerts({
        vitals: { heartRate: 35 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'critical', titleContains: 'bradycardia' });
      expect(alerts).toHaveLength(1);
    });

    it('generates high alert for bradycardia', () => {
      const result = generateClinicalAlerts({
        vitals: { heartRate: 45 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'high', titleContains: 'bradycardia' });
      expect(alerts).toHaveLength(1);
    });

    it('generates critical alert for severe tachycardia', () => {
      const result = generateClinicalAlerts({
        vitals: { heartRate: 160 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'critical', titleContains: 'tachycardia' });
      expect(alerts).toHaveLength(1);
    });

    it('generates moderate alert for tachycardia', () => {
      const result = generateClinicalAlerts({
        vitals: { heartRate: 110 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'moderate', titleContains: 'tachycardia' });
      expect(alerts).toHaveLength(1);
    });

    it('generates critical alert for severe hypoxia', () => {
      const result = generateClinicalAlerts({
        vitals: { spo2: 82 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'critical', titleContains: 'hypoxia' });
      expect(alerts).toHaveLength(1);
    });

    it('generates high alert for hypoxia', () => {
      const result = generateClinicalAlerts({
        vitals: { spo2: 90 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'high', titleContains: 'hypoxia' });
      expect(alerts).toHaveLength(1);
    });

    it('generates critical alert for high fever', () => {
      const result = generateClinicalAlerts({
        vitals: { temperature: 40.5 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'critical', titleContains: 'fever' });
      expect(alerts).toHaveLength(1);
    });

    it('generates moderate alert for fever', () => {
      const result = generateClinicalAlerts({
        vitals: { temperature: 38.8 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'moderate', titleContains: 'fever' });
      expect(alerts).toHaveLength(1);
    });

    it('generates high alert for hypothermia', () => {
      const result = generateClinicalAlerts({
        vitals: { temperature: 34.5 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'high', titleContains: 'hypothermia' });
      expect(alerts).toHaveLength(1);
    });

    it('generates critical alert for severe tachypnea', () => {
      const result = generateClinicalAlerts({
        vitals: { respiratoryRate: 35 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'critical', titleContains: 'tachypnea' });
      expect(alerts).toHaveLength(1);
    });

    it('generates moderate alert for tachypnea', () => {
      const result = generateClinicalAlerts({
        vitals: { respiratoryRate: 25 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'moderate', titleContains: 'tachypnea' });
      expect(alerts).toHaveLength(1);
    });

    it('generates critical alert for respiratory depression', () => {
      const result = generateClinicalAlerts({
        vitals: { respiratoryRate: 6 },
      });
      const alerts = findAlerts(result.alerts, { priority: 'critical', titleContains: 'respiratory depression' });
      expect(alerts).toHaveLength(1);
    });
  });

  describe('Clinical pattern recognition', () => {
    it('detects sepsis pattern', () => {
      const result = generateClinicalAlerts({
        vitals: {
          temperature: 39.5,
          heartRate: 115,
          respiratoryRate: 24,
          systolicBp: 85,
        },
        labResults: [
          { test: 'WBC', value: 18 },
          { test: 'PCT', value: 3.0 },
        ],
      });
      const sepsisAlerts = findAlerts(result.alerts, { titleContains: 'sepsis' });
      expect(sepsisAlerts.length).toBeGreaterThanOrEqual(1);
      expect(sepsisAlerts[0].priority).toBe('critical');
    });

    it('detects partial sepsis screening with fever + tachycardia + elevated WBC', () => {
      const result = generateClinicalAlerts({
        vitals: {
          temperature: 39.0,
          heartRate: 105,
        },
        labResults: [
          { test: 'WBC', value: 15 },
        ],
      });
      const sepsisAlerts = findAlerts(result.alerts, { titleContains: 'sepsis' });
      expect(sepsisAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('detects possible ACS with elevated troponin + tachycardia', () => {
      const result = generateClinicalAlerts({
        vitals: { heartRate: 110 },
        labResults: [{ test: 'TROP', value: 200 }],
      });
      const acsAlerts = findAlerts(result.alerts, { titleContains: 'coronary' });
      expect(acsAlerts.length).toBeGreaterThanOrEqual(1);
      expect(acsAlerts[0].priority).toBe('critical');
    });

    it('detects possible ACS with elevated troponin + hypotension', () => {
      const result = generateClinicalAlerts({
        vitals: { systolicBp: 80 },
        labResults: [{ test: 'TROP', value: 50 }],
      });
      const acsAlerts = findAlerts(result.alerts, { titleContains: 'coronary' });
      expect(acsAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('detects DKA pattern in diabetic patient', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'GLU', value: 450 }],
        conditions: ['diabetes mellitus type 1'],
      });
      const dkaAlerts = findAlerts(result.alerts, { titleContains: 'DKA' });
      expect(dkaAlerts.length).toBeGreaterThanOrEqual(1);
      expect(dkaAlerts[0].priority).toBe('critical');
    });

    it('does not flag DKA without diabetes condition', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'GLU', value: 450 }],
      });
      const dkaAlerts = findAlerts(result.alerts, { titleContains: 'DKA' });
      expect(dkaAlerts).toHaveLength(0);
    });

    it('detects supratherapeutic anticoagulation', () => {
      const result = generateClinicalAlerts({
        medications: ['warfarin', 'lisinopril'],
        labResults: [{ test: 'INR', value: 5.5 }],
      });
      const alerts = findAlerts(result.alerts, { titleContains: 'supratherapeutic' });
      expect(alerts.length).toBeGreaterThanOrEqual(1);
      expect(alerts[0].priority).toBe('critical');
    });

    it('detects thrombocytopenia on anticoagulation', () => {
      const result = generateClinicalAlerts({
        medications: ['enoxaparin', 'metformin'],
        labResults: [{ test: 'PLT', value: 80 }],
      });
      const alerts = findAlerts(result.alerts, { titleContains: 'thrombocytopenia' });
      expect(alerts.some(a => a.category === 'Medication-Lab Interaction')).toBe(true);
    });

    it('no anticoagulation alerts when not on anticoagulants', () => {
      const result = generateClinicalAlerts({
        medications: ['metformin', 'lisinopril'],
        labResults: [{ test: 'INR', value: 5.5 }],
      });
      const alerts = findAlerts(result.alerts, { category: 'Medication-Lab Interaction' });
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Geriatric safety alerts', () => {
    it('flags fall-risk medications in elderly', () => {
      const result = generateClinicalAlerts({
        age: 78,
        medications: ['alprazolam', 'lisinopril'],
      });
      const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety', titleContains: 'fall risk' });
      expect(alerts.length).toBeGreaterThanOrEqual(1);
      expect(alerts[0].detail).toContain('alprazolam');
    });

    it('flags anticholinergic medications in elderly', () => {
      const result = generateClinicalAlerts({
        age: 80,
        medications: ['diphenhydramine', 'metoprolol'],
      });
      const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety', titleContains: 'anticholinergic' });
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });

    it('flags opioids as fall-risk in elderly', () => {
      const result = generateClinicalAlerts({
        age: 72,
        medications: ['oxycodone', 'acetaminophen'],
      });
      const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety', titleContains: 'fall risk' });
      expect(alerts.length).toBeGreaterThanOrEqual(1);
    });

    it('no geriatric alerts for young patients', () => {
      const result = generateClinicalAlerts({
        age: 35,
        medications: ['alprazolam', 'diphenhydramine'],
      });
      const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety' });
      expect(alerts).toHaveLength(0);
    });

    it('no geriatric alerts without medications', () => {
      const result = generateClinicalAlerts({
        age: 80,
      });
      const alerts = findAlerts(result.alerts, { category: 'Geriatric Safety' });
      expect(alerts).toHaveLength(0);
    });
  });

  describe('Alert sorting and aggregation', () => {
    it('sorts alerts by priority (critical first)', () => {
      const result = generateClinicalAlerts({
        labResults: [
          { test: 'K', value: 2.0 },    // critical
          { test: 'HGB', value: 9.0 },   // abnormal/high
          { test: 'NA', value: 140 },     // normal
        ],
        vitals: { heartRate: 110 },       // moderate
      });
      expect(result.alerts.length).toBeGreaterThan(1);
      const priorities = result.alerts.map(a => a.priority);
      const priorityOrder = ['critical', 'high', 'moderate', 'low', 'informational'];
      for (let i = 1; i < priorities.length; i++) {
        expect(priorityOrder.indexOf(priorities[i])).toBeGreaterThanOrEqual(priorityOrder.indexOf(priorities[i - 1]));
      }
    });

    it('counts alerts by priority correctly', () => {
      const result = generateClinicalAlerts({
        labResults: [
          { test: 'K', value: 2.0 },
          { test: 'HGB', value: 9.0 },
        ],
      });
      const totalCounted = Object.values(result.alertsByPriority).reduce((a, b) => a + b, 0);
      expect(totalCounted).toBe(result.totalAlerts);
    });

    it('summary includes critical count', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'K', value: 2.0 }],
      });
      expect(result.summary).toContain('CRITICAL');
    });

    it('summary mentions categories', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'K', value: 2.0 }],
        vitals: { heartRate: 160 },
      });
      expect(result.summary).toContain('Categories');
    });
  });

  describe('Risk profile', () => {
    it('overall risk is critical when critical alerts exist', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'K', value: 2.0 }],
      });
      expect(result.riskProfile.overallRisk).toBe('critical');
    });

    it('overall risk is high when high alerts but no critical', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'HGB', value: 9.0 }],
      });
      expect(result.riskProfile.overallRisk).toBe('high');
    });

    it('overall risk is moderate when only moderate alerts', () => {
      const result = generateClinicalAlerts({
        vitals: { heartRate: 105 },
      });
      expect(result.riskProfile.overallRisk).toBe('moderate');
    });

    it('risk factors include polypharmacy', () => {
      const result = generateClinicalAlerts({
        medications: ['metformin', 'lisinopril', 'amlodipine', 'atorvastatin', 'metoprolol'],
      });
      expect(result.riskProfile.factors).toContain('Polypharmacy (5+ medications)');
    });

    it('risk factors include advanced age', () => {
      const result = generateClinicalAlerts({
        age: 80,
        vitals: { heartRate: 105 },
      });
      expect(result.riskProfile.factors).toContain('Advanced age (≥75)');
    });
  });

  describe('Complex multi-domain scenarios', () => {
    it('ICU patient: multiple critical findings across domains', () => {
      const result = generateClinicalAlerts({
        age: 68,
        medications: ['heparin', 'vancomycin', 'norepinephrine', 'fentanyl', 'midazolam'],
        labResults: [
          { test: 'WBC', value: 25 },
          { test: 'PLT', value: 45 },
          { test: 'CREAT', value: 4.5 },
          { test: 'K', value: 6.0 },
          { test: 'PCT', value: 8.0 },
        ],
        vitals: {
          systolicBp: 85,
          heartRate: 125,
          temperature: 39.5,
          respiratoryRate: 28,
          spo2: 88,
        },
        conditions: ['sepsis', 'acute kidney injury'],
      });

      expect(result.riskProfile.overallRisk).toBe('critical');
      expect(result.alertsByPriority.critical).toBeGreaterThanOrEqual(3);
      expect(result.totalAlerts).toBeGreaterThanOrEqual(8);
      // Should have alerts from multiple categories
      const categories = [...new Set(result.alerts.map(a => a.category))];
      expect(categories.length).toBeGreaterThanOrEqual(3);
    });

    it('Elderly cardiac patient: afib + anticoagulation + renal impairment', () => {
      const result = generateClinicalAlerts({
        age: 82,
        medications: ['warfarin', 'digoxin', 'metoprolol', 'furosemide', 'lisinopril', 'alprazolam'],
        labResults: [
          { test: 'INR', value: 4.2 },
          { test: 'CREAT', value: 2.1 },
          { test: 'K', value: 5.5 },
        ],
        conditions: ['atrial fibrillation', 'chronic kidney disease', 'heart failure'],
      });

      expect(result.totalAlerts).toBeGreaterThanOrEqual(4);
      // Should detect: drug interactions, polypharmacy, geriatric safety, condition-drug issues, abnormal labs
      expect(result.riskProfile.factors.some(f => f.includes('Polypharmacy'))).toBe(true);
      expect(result.riskProfile.factors.some(f => f.includes('Advanced age'))).toBe(true);
    });

    it('ED presentation: chest pain with acute findings', () => {
      const result = generateClinicalAlerts({
        age: 55,
        sex: 'male',
        medications: ['aspirin', 'atorvastatin'],
        labResults: [
          { test: 'TROP', value: 250 },
          { test: 'BNP', value: 500 },
        ],
        vitals: {
          systolicBp: 190,
          heartRate: 108,
          respiratoryRate: 22,
        },
      });

      expect(result.riskProfile.overallRisk).toBe('critical');
      // Should detect ACS pattern, hypertensive urgency, elevated troponin
      const acsAlerts = findAlerts(result.alerts, { titleContains: 'coronary' });
      expect(acsAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('Stable outpatient: routine medication check', () => {
      const result = generateClinicalAlerts({
        age: 50,
        medications: ['metformin', 'lisinopril', 'atorvastatin'],
        labResults: [
          { test: 'GLU', value: 95 },
          { test: 'HBA1C', value: 6.8 },
          { test: 'CREAT', value: 0.9 },
          { test: 'K', value: 4.2 },
        ],
        vitals: {
          systolicBp: 128,
          heartRate: 72,
        },
      });

      // Should be relatively calm - abnormal HbA1c but manageable
      expect(result.riskProfile.overallRisk).not.toBe('critical');
      expect(result.alertsByPriority.critical).toBe(0);
    });

    it('Diabetic emergency: DKA presentation', () => {
      const result = generateClinicalAlerts({
        age: 28,
        medications: ['insulin'],
        labResults: [
          { test: 'GLU', value: 520 },
          { test: 'K', value: 5.8 },
          { test: 'CREAT', value: 2.0 },
        ],
        vitals: {
          heartRate: 120,
          respiratoryRate: 30,
          systolicBp: 95,
        },
        conditions: ['diabetes mellitus type 1'],
      });

      expect(result.riskProfile.overallRisk).toBe('critical');
      const dkaAlerts = findAlerts(result.alerts, { titleContains: 'DKA' });
      expect(dkaAlerts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Alert structure validation', () => {
    it('all alerts have required fields', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'K', value: 2.0 }],
        vitals: { heartRate: 160 },
        medications: ['warfarin', 'aspirin'],
      });

      for (const alert of result.alerts) {
        expect(alert.priority).toBeDefined();
        expect(['critical', 'high', 'moderate', 'low', 'informational']).toContain(alert.priority);
        expect(alert.category).toBeTruthy();
        expect(alert.title).toBeTruthy();
        expect(alert.detail).toBeTruthy();
        expect(alert.action).toBeTruthy();
        expect(alert.source).toBeTruthy();
      }
    });

    it('output structure is complete', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'K', value: 2.0 }],
      });

      expect(result).toHaveProperty('totalAlerts');
      expect(result).toHaveProperty('alertsByPriority');
      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('riskProfile');
      expect(result.riskProfile).toHaveProperty('overallRisk');
      expect(result.riskProfile).toHaveProperty('factors');
      expect(result.alertsByPriority).toHaveProperty('critical');
      expect(result.alertsByPriority).toHaveProperty('high');
      expect(result.alertsByPriority).toHaveProperty('moderate');
      expect(result.alertsByPriority).toHaveProperty('low');
      expect(result.alertsByPriority).toHaveProperty('informational');
    });
  });

  describe('Hypothermia as infection indicator', () => {
    it('includes hypothermia as sepsis indicator', () => {
      const result = generateClinicalAlerts({
        vitals: {
          temperature: 35.5, // not quite hypothermic (<36 for sepsis, <35 for vital alert)
          heartRate: 115,
          respiratoryRate: 24,
        },
        labResults: [
          { test: 'WBC', value: 18 },
        ],
      });
      // With temp <36, tachycardia, tachypnea, and elevated WBC = 4 indicators
      const sepsisAlerts = findAlerts(result.alerts, { titleContains: 'sepsis' });
      expect(sepsisAlerts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Multiple drug interactions in single patient', () => {
    it('generates multiple interaction alerts for poly-interacting regimen', () => {
      const result = generateClinicalAlerts({
        medications: ['warfarin', 'aspirin', 'ibuprofen'],
      });
      const drugAlerts = findAlerts(result.alerts, { category: 'Drug Interaction' });
      expect(drugAlerts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Edge cases', () => {
    it('handles unknown lab tests gracefully', () => {
      const result = generateClinicalAlerts({
        labResults: [{ test: 'UNKNOWN_TEST', value: 42 }],
      });
      // Should not throw, just may not generate alerts for unknown test
      expect(result).toBeDefined();
      expect(result.totalAlerts).toBeGreaterThanOrEqual(0);
    });

    it('handles empty medication list', () => {
      const result = generateClinicalAlerts({
        medications: [],
      });
      expect(result).toBeDefined();
      expect(result.totalAlerts).toBe(0);
    });

    it('handles empty lab results', () => {
      const result = generateClinicalAlerts({
        labResults: [],
      });
      expect(result).toBeDefined();
      expect(result.totalAlerts).toBe(0);
    });

    it('handles age 0', () => {
      const result = generateClinicalAlerts({
        age: 0,
      });
      expect(result).toBeDefined();
    });

    it('handles very old age', () => {
      const result = generateClinicalAlerts({
        age: 105,
        medications: ['lorazepam'],
      });
      const geriatricAlerts = findAlerts(result.alerts, { category: 'Geriatric Safety' });
      expect(geriatricAlerts.length).toBeGreaterThanOrEqual(1);
    });

    it('handles boundary vital values', () => {
      // Exactly at thresholds
      const result = generateClinicalAlerts({
        vitals: {
          systolicBp: 90,  // exactly at hypotension threshold (should NOT trigger <90)
          heartRate: 100,   // exactly at tachycardia threshold (should NOT trigger >100)
          spo2: 92,         // exactly at hypoxia threshold (should NOT trigger <92)
        },
      });
      const criticalVitals = findAlerts(result.alerts, { priority: 'critical', category: 'Vital Signs' });
      expect(criticalVitals).toHaveLength(0);
    });
  });
});

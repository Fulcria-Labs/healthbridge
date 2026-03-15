/**
 * Clinical Alerts Aggregator
 *
 * Combines lab results, medications, vitals, and patient context into
 * a prioritized list of clinical alerts. Demonstrates compound reasoning
 * across multiple HealthBridge data sources — the core value proposition
 * for agent collaboration.
 */

import { checkDrugInteractions, type DrugInteractionOutput } from './drug-interaction-tool.js';
import { interpretPanel } from './lab-interpreter-tool.js';
import { calculateRiskScore, type ScoreName } from './risk-score-tool.js';
import { checkRenalDosing } from '../data/renal-dosing.js';
import type { LabResult } from '../data/lab-references.js';

export type AlertPriority = 'critical' | 'high' | 'moderate' | 'low' | 'informational';

export interface ClinicalAlert {
  priority: AlertPriority;
  category: string;
  title: string;
  detail: string;
  action: string;
  source: string;
}

export interface PatientContext {
  age?: number;
  sex?: 'male' | 'female';
  medications?: string[];
  labResults?: Array<{ test: string; value: number }>;
  vitals?: {
    systolicBp?: number;
    diastolicBp?: number;
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    spo2?: number;
    weight_kg?: number;
    height_cm?: number;
  };
  conditions?: string[];
  allergies?: string[];
}

export interface ClinicalAlertsOutput {
  totalAlerts: number;
  alertsByPriority: Record<AlertPriority, number>;
  alerts: ClinicalAlert[];
  summary: string;
  riskProfile: {
    overallRisk: 'critical' | 'high' | 'moderate' | 'low';
    factors: string[];
  };
}

const PRIORITY_ORDER: AlertPriority[] = ['critical', 'high', 'moderate', 'low', 'informational'];

export function generateClinicalAlerts(context: PatientContext): ClinicalAlertsOutput {
  const alerts: ClinicalAlert[] = [];

  // 1. Lab-based alerts
  if (context.labResults && context.labResults.length > 0) {
    const labAlerts = generateLabAlerts(context.labResults);
    alerts.push(...labAlerts);
  }

  // 2. Drug interaction alerts
  if (context.medications && context.medications.length >= 2) {
    const drugAlerts = generateDrugAlerts(context.medications, context.conditions);
    alerts.push(...drugAlerts);
  }

  // 3. Vital sign alerts
  if (context.vitals) {
    const vitalAlerts = generateVitalAlerts(context.vitals, context.age);
    alerts.push(...vitalAlerts);
  }

  // 4. Cross-domain clinical pattern alerts
  const patternAlerts = generatePatternAlerts(context);
  alerts.push(...patternAlerts);

  // 5. Age-specific alerts
  if (context.age !== undefined) {
    const ageAlerts = generateAgeAlerts(context);
    alerts.push(...ageAlerts);
  }

  // Sort by priority
  alerts.sort((a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority));

  // Count by priority
  const alertsByPriority: Record<AlertPriority, number> = {
    critical: 0, high: 0, moderate: 0, low: 0, informational: 0,
  };
  for (const alert of alerts) {
    alertsByPriority[alert.priority]++;
  }

  // Determine overall risk
  const riskFactors: string[] = [];
  let overallRisk: 'critical' | 'high' | 'moderate' | 'low' = 'low';

  if (alertsByPriority.critical > 0) {
    overallRisk = 'critical';
    riskFactors.push(`${alertsByPriority.critical} critical alert(s)`);
  } else if (alertsByPriority.high > 0) {
    overallRisk = 'high';
    riskFactors.push(`${alertsByPriority.high} high-priority alert(s)`);
  } else if (alertsByPriority.moderate > 0) {
    overallRisk = 'moderate';
    riskFactors.push(`${alertsByPriority.moderate} moderate alert(s)`);
  }

  if (context.medications && context.medications.length >= 5) {
    riskFactors.push('Polypharmacy (5+ medications)');
  }
  if (context.age !== undefined && context.age >= 75) {
    riskFactors.push('Advanced age (≥75)');
  }

  // Generate summary
  const summary = generateSummary(alerts, alertsByPriority, overallRisk);

  return {
    totalAlerts: alerts.length,
    alertsByPriority,
    alerts,
    summary,
    riskProfile: {
      overallRisk,
      factors: riskFactors,
    },
  };
}

function generateLabAlerts(labResults: Array<{ test: string; value: number }>): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  const panel = interpretPanel({ results: labResults });

  for (const result of panel.criticalValues) {
    alerts.push({
      priority: 'critical',
      category: 'Laboratory',
      title: `Critical ${result.testName}`,
      detail: `${result.testCode} = ${result.value} ${result.unit} (reference: ${result.referenceRange}). ${result.interpretation}`,
      action: result.suggestedAction,
      source: 'lab_interpreter',
    });
  }

  for (const result of panel.abnormalValues) {
    alerts.push({
      priority: 'high',
      category: 'Laboratory',
      title: `Abnormal ${result.testName}`,
      detail: `${result.testCode} = ${result.value} ${result.unit} (reference: ${result.referenceRange}). ${result.interpretation}`,
      action: result.suggestedAction,
      source: 'lab_interpreter',
    });
  }

  // Check for concerning lab patterns
  const labMap = new Map<string, LabResult>();
  for (const r of panel.results) {
    labMap.set(r.testCode, r);
  }

  // Raw value map for patterns involving tests not in reference database
  const rawLabMap = new Map<string, number>();
  for (const l of labResults) {
    rawLabMap.set(l.test.toUpperCase(), l.value);
  }

  // BUN/Creatinine ratio pattern
  const bun = labMap.get('BUN');
  const creat = labMap.get('CREAT');
  if (bun && creat && creat.value > 0) {
    const ratio = bun.value / creat.value;
    if (ratio > 20 && bun.urgency !== 'normal') {
      alerts.push({
        priority: 'moderate',
        category: 'Laboratory Pattern',
        title: 'Elevated BUN/Creatinine ratio',
        detail: `BUN/Creatinine ratio = ${ratio.toFixed(1)} (>20). Suggests pre-renal azotemia (dehydration, GI bleeding, or heart failure).`,
        action: 'Assess volume status. Consider IV fluids if dehydrated. Evaluate for GI bleeding if appropriate.',
        source: 'lab_pattern',
      });
    }
  }

  // AST/ALT ratio pattern (alcoholic liver disease indicator)
  const ast = labMap.get('AST');
  const alt = labMap.get('ALT');
  if (ast && alt && alt.value > 0 && (ast.urgency !== 'normal' || alt.urgency !== 'normal')) {
    const ratio = ast.value / alt.value;
    if (ratio > 2) {
      alerts.push({
        priority: 'moderate',
        category: 'Laboratory Pattern',
        title: 'AST/ALT ratio >2',
        detail: `AST/ALT ratio = ${ratio.toFixed(1)}. Ratio >2 is suggestive of alcoholic liver disease.`,
        action: 'Obtain alcohol use history. Consider GGT, liver imaging. Hepatology referral if warranted.',
        source: 'lab_pattern',
      });
    }
  }

  // Anemia pattern: low hemoglobin
  const hgb = labMap.get('HGB');
  if (hgb && hgb.urgency !== 'normal') {
    const plt = labMap.get('PLT');
    if (plt && plt.urgency !== 'normal' && plt.value < 150) {
      alerts.push({
        priority: 'high',
        category: 'Laboratory Pattern',
        title: 'Combined anemia and thrombocytopenia',
        detail: `Hemoglobin ${hgb.value} g/dL and Platelets ${plt.value} K/uL. Bicytopenia may indicate bone marrow disorder, DIC, or splenic sequestration.`,
        action: 'Peripheral blood smear. Reticulocyte count. Consider hematology consultation. Evaluate for DIC (check fibrinogen, D-dimer).',
        source: 'lab_pattern',
      });
    }
  }

  // Anion gap metabolic acidosis pattern (HCO3 may not be in lab reference DB)
  const naVal = labMap.get('NA')?.value ?? rawLabMap.get('NA');
  const clVal = labMap.get('CL')?.value ?? rawLabMap.get('CL');
  const hco3Val = rawLabMap.get('HCO3') ?? labMap.get('HCO3')?.value;
  if (naVal !== undefined && clVal !== undefined && hco3Val !== undefined) {
    const anionGap = naVal - (clVal + hco3Val);
    if (anionGap > 12) {
      alerts.push({
        priority: anionGap > 20 ? 'critical' : 'high',
        category: 'Laboratory Pattern',
        title: 'Elevated anion gap',
        detail: `Anion gap = ${anionGap.toFixed(1)} mEq/L (Na ${naVal} - Cl ${clVal} - HCO3 ${hco3Val}). Elevated AG (>12) suggests metabolic acidosis. MUDPILES: Methanol, Uremia, DKA, Propylene glycol, Isoniazid/Iron, Lactic acidosis, Ethylene glycol, Salicylates.`,
        action: 'Check lactate, ketones, BUN, osmolal gap, toxicology screen. ABG to confirm metabolic acidosis. Calculate delta-delta if AG elevated.',
        source: 'lab_pattern',
      });
    }
  }

  // Corrected calcium for hypoalbuminemia
  const ca = labMap.get('CA');
  const alb = labMap.get('ALB');
  if (ca && alb && alb.value < 4.0) {
    const correctedCa = ca.value + 0.8 * (4.0 - alb.value);
    if (correctedCa > 10.5 && ca.urgency === 'normal') {
      alerts.push({
        priority: 'moderate',
        category: 'Laboratory Pattern',
        title: 'Corrected hypercalcemia (masked by low albumin)',
        detail: `Total Ca ${ca.value} mg/dL appears normal, but corrected Ca = ${correctedCa.toFixed(1)} mg/dL (albumin ${alb.value} g/dL). True hypercalcemia.`,
        action: 'Check PTH, vitamin D, PTHrP. Evaluate for hyperparathyroidism or malignancy. ECG for QT changes.',
        source: 'lab_pattern',
      });
    } else if (correctedCa < 8.5 && ca.urgency === 'normal') {
      alerts.push({
        priority: 'moderate',
        category: 'Laboratory Pattern',
        title: 'True hypocalcemia (corrected for albumin)',
        detail: `Total Ca ${ca.value} mg/dL appears normal, but corrected Ca = ${correctedCa.toFixed(1)} mg/dL (albumin ${alb.value} g/dL). True hypocalcemia.`,
        action: 'Check ionized calcium, PTH, magnesium, vitamin D. Monitor for tetany, Chvostek/Trousseau signs.',
        source: 'lab_pattern',
      });
    }
  }

  // TSH / Free T4 pattern recognition (uses both interpreted and raw values)
  const tshValue = labMap.get('TSH')?.value ?? rawLabMap.get('TSH');
  const ft4Value = rawLabMap.get('FT4') ?? labMap.get('FT4')?.value;
  if (tshValue !== undefined && ft4Value !== undefined) {
    if (tshValue > 4.5 && ft4Value < 0.8) {
      alerts.push({
        priority: 'high',
        category: 'Laboratory Pattern',
        title: 'Primary hypothyroidism',
        detail: `TSH ${tshValue} mIU/L (elevated) with Free T4 ${ft4Value} ng/dL (low). Classic primary hypothyroidism pattern.`,
        action: 'Check TPO antibodies (Hashimoto\'s). Initiate levothyroxine if symptomatic. Start low dose (25-50 mcg) in elderly/cardiac patients.',
        source: 'lab_pattern',
      });
    } else if (tshValue < 0.4 && ft4Value > 1.8) {
      alerts.push({
        priority: 'high',
        category: 'Laboratory Pattern',
        title: 'Hyperthyroidism',
        detail: `TSH ${tshValue} mIU/L (suppressed) with Free T4 ${ft4Value} ng/dL (elevated). Hyperthyroid state.`,
        action: 'Check T3, TSI/TRAb antibodies. Thyroid uptake scan. Beta-blocker for symptom control. Endocrinology referral.',
        source: 'lab_pattern',
      });
    } else if (tshValue < 0.4 && ft4Value >= 0.8 && ft4Value <= 1.8) {
      alerts.push({
        priority: 'moderate',
        category: 'Laboratory Pattern',
        title: 'Subclinical hyperthyroidism',
        detail: `TSH ${tshValue} mIU/L (suppressed) with normal Free T4 ${ft4Value} ng/dL. Risk of atrial fibrillation and osteoporosis.`,
        action: 'Check T3 (may have T3 thyrotoxicosis). Repeat in 6-8 weeks. Evaluate for atrial fibrillation risk.',
        source: 'lab_pattern',
      });
    }
  }

  // CRP + Procalcitonin pattern (bacterial vs viral differentiation)
  const crp = labMap.get('CRP');
  const pct = labMap.get('PCT');
  if (crp && pct) {
    if (pct.value >= 0.5 && crp.value > 10) {
      alerts.push({
        priority: 'high',
        category: 'Laboratory Pattern',
        title: 'Bacterial infection likely (elevated CRP + PCT)',
        detail: `CRP ${crp.value} mg/L and Procalcitonin ${pct.value} ng/mL. Concurrent elevation suggests bacterial infection rather than viral.`,
        action: 'Blood cultures before antibiotics. Initiate empiric antibiotic therapy based on suspected source. Reassess with serial PCT at 48-72h for de-escalation.',
        source: 'lab_pattern',
      });
    } else if (crp.value > 10 && pct.value < 0.25) {
      alerts.push({
        priority: 'moderate',
        category: 'Laboratory Pattern',
        title: 'Inflammatory state with low procalcitonin',
        detail: `CRP ${crp.value} mg/L (elevated) but PCT ${pct.value} ng/mL (low). Pattern suggests viral infection, autoimmune flare, or non-infectious inflammation rather than bacterial infection.`,
        action: 'Consider viral panel. Evaluate for autoimmune conditions. Antibiotics may not be indicated — reassess clinical picture.',
        source: 'lab_pattern',
      });
    }
  }

  // Iron deficiency pattern
  const iron = labMap.get('IRON');
  const ferr = labMap.get('FERR');
  if (hgb && ferr) {
    if (hgb.urgency !== 'normal' && hgb.value < 12.0 && ferr.value < 30) {
      alerts.push({
        priority: 'moderate',
        category: 'Laboratory Pattern',
        title: 'Iron deficiency anemia pattern',
        detail: `Hemoglobin ${hgb.value} g/dL with Ferritin ${ferr.value} ng/mL (<30). Consistent with iron deficiency anemia.`,
        action: 'Evaluate for GI blood loss (occult blood, colonoscopy if appropriate). Start oral iron supplementation. Recheck CBC and ferritin in 4-6 weeks.',
        source: 'lab_pattern',
      });
    }
  }

  return alerts;
}

function generateDrugAlerts(medications: string[], conditions?: string[]): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  const result = checkDrugInteractions({ medications });

  for (const interaction of result.interactions) {
    let priority: AlertPriority;
    switch (interaction.severity) {
      case 'contraindicated': priority = 'critical'; break;
      case 'major': priority = 'high'; break;
      case 'moderate': priority = 'moderate'; break;
      default: priority = 'low'; break;
    }

    alerts.push({
      priority,
      category: 'Drug Interaction',
      title: `${interaction.severity.toUpperCase()}: ${interaction.drug1} + ${interaction.drug2}`,
      detail: `${interaction.description}. Mechanism: ${interaction.mechanism}. Effect: ${interaction.clinicalEffect}`,
      action: interaction.management,
      source: 'drug_interactions',
    });
  }

  // Polypharmacy alert
  if (medications.length >= 5) {
    alerts.push({
      priority: 'moderate',
      category: 'Medication Safety',
      title: 'Polypharmacy risk',
      detail: `Patient is on ${medications.length} medications. Polypharmacy increases risk of adverse drug events, falls, and hospitalizations.`,
      action: 'Review medication list for deprescribing opportunities. Assess each medication for continued indication.',
      source: 'medication_safety',
    });
  }

  // Condition-specific medication alerts
  if (conditions) {
    const condLower = conditions.map(c => c.toLowerCase());
    const medLower = medications.map(m => m.toLowerCase());

    // Renal impairment + nephrotoxic drugs
    if (condLower.some(c => c.includes('renal') || c.includes('kidney') || c.includes('ckd'))) {
      const nephrotoxic = ['ibuprofen', 'naproxen', 'celecoxib', 'lithium', 'metformin', 'methotrexate'];
      const flagged = medLower.filter(m => nephrotoxic.some(n => m.includes(n)));
      for (const drug of flagged) {
        alerts.push({
          priority: 'high',
          category: 'Condition-Drug Interaction',
          title: `${drug} with renal impairment`,
          detail: `${drug} requires dose adjustment or avoidance in renal impairment.`,
          action: 'Check eGFR and adjust dose accordingly. Consider alternative medication.',
          source: 'condition_drug',
        });
      }
    }

    // Liver disease + hepatotoxic drugs
    if (condLower.some(c => c.includes('liver') || c.includes('hepatic') || c.includes('cirrhosis'))) {
      const hepatotoxic = ['acetaminophen', 'methotrexate', 'simvastatin', 'atorvastatin', 'valproic acid'];
      const flagged = medLower.filter(m => hepatotoxic.some(h => m.includes(h)));
      for (const drug of flagged) {
        alerts.push({
          priority: 'high',
          category: 'Condition-Drug Interaction',
          title: `${drug} with liver disease`,
          detail: `${drug} may worsen hepatic function or requires dose reduction in liver disease.`,
          action: 'Monitor liver function closely. Consider dose reduction or alternative.',
          source: 'condition_drug',
        });
      }
    }

    // Heart failure + negative inotropes or fluid retainers
    if (condLower.some(c => c.includes('heart failure') || c.includes('chf'))) {
      const avoid = ['verapamil', 'diltiazem', 'ibuprofen', 'naproxen', 'celecoxib'];
      const flagged = medLower.filter(m => avoid.some(a => m.includes(a)));
      for (const drug of flagged) {
        alerts.push({
          priority: 'high',
          category: 'Condition-Drug Interaction',
          title: `${drug} with heart failure`,
          detail: `${drug} may worsen heart failure through fluid retention or negative inotropy.`,
          action: 'Consider alternative. NSAIDs should be avoided in heart failure. Non-dihydropyridine CCBs are contraindicated in HFrEF.',
          source: 'condition_drug',
        });
      }
    }
  }

  return alerts;
}

function generateVitalAlerts(vitals: PatientContext['vitals'], age?: number): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  if (!vitals) return alerts;

  // Blood pressure alerts
  if (vitals.systolicBp !== undefined) {
    if (vitals.systolicBp < 90) {
      alerts.push({
        priority: 'critical',
        category: 'Vital Signs',
        title: 'Hypotension',
        detail: `Systolic BP ${vitals.systolicBp} mmHg (<90). Shock state possible.`,
        action: 'Assess for shock etiology (hypovolemic, cardiogenic, distributive, obstructive). IV fluid resuscitation. Vasopressors if refractory.',
        source: 'vitals',
      });
    } else if (vitals.systolicBp >= 180) {
      alerts.push({
        priority: 'critical',
        category: 'Vital Signs',
        title: 'Hypertensive urgency/emergency',
        detail: `Systolic BP ${vitals.systolicBp} mmHg (≥180). Assess for end-organ damage.`,
        action: 'Check for symptoms of end-organ damage (headache, vision changes, chest pain). If present: hypertensive emergency — IV antihypertensives. If absent: hypertensive urgency — oral agents, close follow-up.',
        source: 'vitals',
      });
    } else if (vitals.systolicBp >= 140) {
      alerts.push({
        priority: 'moderate',
        category: 'Vital Signs',
        title: 'Elevated blood pressure',
        detail: `Systolic BP ${vitals.systolicBp} mmHg (≥140). Stage 2 hypertension range.`,
        action: 'Confirm with repeat measurement. Review antihypertensive regimen. Lifestyle counseling.',
        source: 'vitals',
      });
    }
  }

  // Heart rate alerts
  if (vitals.heartRate !== undefined) {
    if (vitals.heartRate < 40) {
      alerts.push({
        priority: 'critical',
        category: 'Vital Signs',
        title: 'Severe bradycardia',
        detail: `Heart rate ${vitals.heartRate} bpm (<40). Risk of hemodynamic instability.`,
        action: 'ECG immediately. Assess for symptomatic bradycardia. Consider atropine, transcutaneous pacing. Review medications (beta-blockers, CCBs, digoxin).',
        source: 'vitals',
      });
    } else if (vitals.heartRate < 50) {
      alerts.push({
        priority: 'high',
        category: 'Vital Signs',
        title: 'Bradycardia',
        detail: `Heart rate ${vitals.heartRate} bpm (<50).`,
        action: 'ECG. Assess symptoms (dizziness, syncope). Review rate-controlling medications.',
        source: 'vitals',
      });
    } else if (vitals.heartRate > 150) {
      alerts.push({
        priority: 'critical',
        category: 'Vital Signs',
        title: 'Severe tachycardia',
        detail: `Heart rate ${vitals.heartRate} bpm (>150).`,
        action: 'ECG immediately. Determine rhythm. If unstable: synchronized cardioversion. If stable: rate control based on rhythm.',
        source: 'vitals',
      });
    } else if (vitals.heartRate > 100) {
      alerts.push({
        priority: 'moderate',
        category: 'Vital Signs',
        title: 'Tachycardia',
        detail: `Heart rate ${vitals.heartRate} bpm (>100).`,
        action: 'Evaluate for pain, fever, dehydration, anxiety, anemia, PE. ECG if new onset.',
        source: 'vitals',
      });
    }
  }

  // SpO2 alerts
  if (vitals.spo2 !== undefined) {
    if (vitals.spo2 < 88) {
      alerts.push({
        priority: 'critical',
        category: 'Vital Signs',
        title: 'Severe hypoxia',
        detail: `SpO2 ${vitals.spo2}% (<88%). Respiratory failure likely.`,
        action: 'Supplemental oxygen immediately. ABG. Chest X-ray. Assess for pneumonia, PE, COPD exacerbation, pneumothorax. Consider intubation if declining.',
        source: 'vitals',
      });
    } else if (vitals.spo2 < 92) {
      alerts.push({
        priority: 'high',
        category: 'Vital Signs',
        title: 'Hypoxia',
        detail: `SpO2 ${vitals.spo2}% (<92%).`,
        action: 'Apply supplemental oxygen. Assess respiratory status. Consider ABG, chest imaging.',
        source: 'vitals',
      });
    }
  }

  // Temperature alerts
  if (vitals.temperature !== undefined) {
    if (vitals.temperature >= 40.0) {
      alerts.push({
        priority: 'critical',
        category: 'Vital Signs',
        title: 'High fever / Hyperthermia',
        detail: `Temperature ${vitals.temperature}°C (≥40.0). Risk of end-organ damage.`,
        action: 'Active cooling. Blood cultures. Broad-spectrum antibiotics. Assess for sepsis, neuroleptic malignant syndrome, serotonin syndrome.',
        source: 'vitals',
      });
    } else if (vitals.temperature >= 38.3) {
      alerts.push({
        priority: 'moderate',
        category: 'Vital Signs',
        title: 'Fever',
        detail: `Temperature ${vitals.temperature}°C (≥38.3).`,
        action: 'Source workup: blood/urine cultures, chest X-ray. Antipyretics. Consider empiric antibiotics based on clinical picture.',
        source: 'vitals',
      });
    } else if (vitals.temperature < 35.0) {
      alerts.push({
        priority: 'high',
        category: 'Vital Signs',
        title: 'Hypothermia',
        detail: `Temperature ${vitals.temperature}°C (<35.0).`,
        action: 'Active warming. Check for sepsis (hypothermia can indicate severe infection). Assess thyroid function.',
        source: 'vitals',
      });
    }
  }

  // Respiratory rate alerts
  if (vitals.respiratoryRate !== undefined) {
    if (vitals.respiratoryRate > 30) {
      alerts.push({
        priority: 'critical',
        category: 'Vital Signs',
        title: 'Severe tachypnea',
        detail: `Respiratory rate ${vitals.respiratoryRate} breaths/min (>30).`,
        action: 'Assess for respiratory failure. ABG. Consider BiPAP or intubation. Evaluate for PE, pneumothorax, severe pneumonia, metabolic acidosis.',
        source: 'vitals',
      });
    } else if (vitals.respiratoryRate > 22) {
      alerts.push({
        priority: 'moderate',
        category: 'Vital Signs',
        title: 'Tachypnea',
        detail: `Respiratory rate ${vitals.respiratoryRate} breaths/min (>22).`,
        action: 'Assess for infection, pain, anxiety, metabolic acidosis. Consider qSOFA scoring if infection suspected.',
        source: 'vitals',
      });
    } else if (vitals.respiratoryRate < 8) {
      alerts.push({
        priority: 'critical',
        category: 'Vital Signs',
        title: 'Respiratory depression',
        detail: `Respiratory rate ${vitals.respiratoryRate} breaths/min (<8). Risk of respiratory arrest.`,
        action: 'Assess airway. Consider naloxone if opioid-related. Prepare for intubation. Continuous monitoring.',
        source: 'vitals',
      });
    }
  }

  return alerts;
}

function generatePatternAlerts(context: PatientContext): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];

  // Sepsis pattern: fever + tachycardia + hypotension + elevated WBC/procalcitonin
  if (context.vitals && context.labResults) {
    const hasInfectionSign =
      (context.vitals.temperature !== undefined && context.vitals.temperature >= 38.3) ||
      (context.vitals.temperature !== undefined && context.vitals.temperature < 36.0);
    const hasTachycardia = context.vitals.heartRate !== undefined && context.vitals.heartRate > 100;
    const hasTachypnea = context.vitals.respiratoryRate !== undefined && context.vitals.respiratoryRate >= 22;
    const hasHypotension = context.vitals.systolicBp !== undefined && context.vitals.systolicBp <= 100;

    const labMap = new Map(context.labResults.map(l => [l.test.toUpperCase(), l.value]));
    const hasElevatedWBC = (labMap.get('WBC') ?? 0) > 12;
    const hasElevatedLactate = (labMap.get('LACTATE') ?? 0) > 2;
    const hasElevatedPCT = (labMap.get('PCT') ?? 0) > 0.5;

    const sepsisIndicators = [hasInfectionSign, hasTachycardia, hasTachypnea, hasHypotension, hasElevatedWBC, hasElevatedLactate, hasElevatedPCT].filter(Boolean).length;

    if (sepsisIndicators >= 3) {
      alerts.push({
        priority: 'critical',
        category: 'Clinical Pattern',
        title: 'Possible sepsis',
        detail: `${sepsisIndicators} sepsis indicators present. Immediate evaluation required.`,
        action: 'Activate sepsis protocol. Hour-1 bundle: lactate, blood cultures, broad-spectrum antibiotics, IV fluids 30mL/kg if hypotensive. Calculate qSOFA and SOFA scores.',
        source: 'pattern_recognition',
      });
    } else if (sepsisIndicators >= 2 && hasInfectionSign) {
      alerts.push({
        priority: 'high',
        category: 'Clinical Pattern',
        title: 'Sepsis screening positive',
        detail: `${sepsisIndicators} indicators present with signs of infection. Further evaluation needed.`,
        action: 'Calculate qSOFA score. Obtain blood cultures, CBC, lactate, procalcitonin. Consider empiric antibiotics.',
        source: 'pattern_recognition',
      });
    }
  }

  // ACS pattern: chest pain context + elevated troponin + ECG changes
  if (context.labResults && context.vitals) {
    const labMap = new Map(context.labResults.map(l => [l.test.toUpperCase(), l.value]));
    const troponin = labMap.get('TROP') ?? labMap.get('TROPONIN');
    const hasTachycardia = context.vitals.heartRate !== undefined && context.vitals.heartRate > 100;
    const hasHypoHypertension = context.vitals.systolicBp !== undefined &&
      (context.vitals.systolicBp < 90 || context.vitals.systolicBp > 180);

    if (troponin !== undefined && troponin > 14 && (hasTachycardia || hasHypoHypertension)) {
      alerts.push({
        priority: 'critical',
        category: 'Clinical Pattern',
        title: 'Possible acute coronary syndrome',
        detail: `Elevated troponin (${troponin} ng/L) with hemodynamic abnormality. ACS must be ruled out.`,
        action: 'Stat ECG. Serial troponins q3h. Cardiology consultation. Calculate HEART and TIMI scores. Aspirin, heparin per protocol if no contraindications.',
        source: 'pattern_recognition',
      });
    }
  }

  // DKA pattern: high glucose + metabolic derangement
  if (context.labResults) {
    const labMap = new Map(context.labResults.map(l => [l.test.toUpperCase(), l.value]));
    const glucose = labMap.get('GLU');
    const potassium = labMap.get('K');
    const hasDiabetes = context.conditions?.some(c =>
      c.toLowerCase().includes('diabetes') || c.toLowerCase().includes('dm')
    );

    if (glucose !== undefined && glucose > 300 && hasDiabetes) {
      alerts.push({
        priority: 'critical',
        category: 'Clinical Pattern',
        title: 'Possible DKA/HHS',
        detail: `Glucose ${glucose} mg/dL in diabetic patient. Evaluate for diabetic ketoacidosis or hyperosmolar hyperglycemic state.`,
        action: 'Check anion gap, serum ketones, blood gas. IV fluids, insulin drip protocol. Monitor potassium closely (insulin shifts K intracellularly).',
        source: 'pattern_recognition',
      });
    }
  }

  // Anticoagulation + bleeding risk
  if (context.medications && context.labResults) {
    const onAnticoag = context.medications.some(m => {
      const lower = m.toLowerCase();
      return ['warfarin', 'coumadin', 'heparin', 'enoxaparin', 'rivaroxaban', 'apixaban', 'dabigatran']
        .some(a => lower.includes(a));
    });

    if (onAnticoag) {
      const labMap = new Map(context.labResults.map(l => [l.test.toUpperCase(), l.value]));
      const inr = labMap.get('INR');
      const plt = labMap.get('PLT');

      if (inr !== undefined && inr > 3.5) {
        alerts.push({
          priority: 'critical',
          category: 'Medication-Lab Interaction',
          title: 'Supratherapeutic anticoagulation',
          detail: `INR ${inr} while on anticoagulant. High bleeding risk.`,
          action: 'Hold anticoagulant. Vitamin K if INR >5. FFP if active bleeding. Monitor closely.',
          source: 'med_lab_interaction',
        });
      }

      if (plt !== undefined && plt < 100) {
        alerts.push({
          priority: 'high',
          category: 'Medication-Lab Interaction',
          title: 'Thrombocytopenia on anticoagulation',
          detail: `Platelets ${plt} K/uL while on anticoagulant. Compounded bleeding risk.`,
          action: 'Reassess anticoagulation risk-benefit. Check for HIT if on heparin. Consider dose reduction or holding.',
          source: 'med_lab_interaction',
        });
      }
    }
  }

  return alerts;
}

function generateAgeAlerts(context: PatientContext): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  const age = context.age!;

  // Elderly fall risk with certain medications
  if (age >= 65 && context.medications) {
    const fallRiskMeds = ['benzodiazepine', 'alprazolam', 'diazepam', 'lorazepam',
      'zolpidem', 'ambien', 'opioid', 'morphine', 'oxycodone', 'hydrocodone',
      'tramadol', 'gabapentin', 'pregabalin'];
    const flagged = context.medications.filter(m =>
      fallRiskMeds.some(f => m.toLowerCase().includes(f))
    );

    if (flagged.length > 0) {
      alerts.push({
        priority: 'moderate',
        category: 'Geriatric Safety',
        title: 'Fall risk medications in elderly patient',
        detail: `Age ${age} on fall-risk medications: ${flagged.join(', ')}. Beers criteria recommends avoiding or minimizing these in older adults.`,
        action: 'Review for deprescribing. Fall risk assessment. Lowest effective dose if continued. Home safety evaluation.',
        source: 'geriatric_safety',
      });
    }

    // Anticholinergic burden
    const anticholinergic = ['diphenhydramine', 'benadryl', 'hydroxyzine', 'oxybutynin',
      'amitriptyline', 'nortriptyline', 'paroxetine'];
    const acFlagged = context.medications.filter(m =>
      anticholinergic.some(a => m.toLowerCase().includes(a))
    );

    if (acFlagged.length > 0) {
      alerts.push({
        priority: 'moderate',
        category: 'Geriatric Safety',
        title: 'Anticholinergic medications in elderly patient',
        detail: `Age ${age} on anticholinergic medications: ${acFlagged.join(', ')}. Risk of confusion, urinary retention, constipation, falls.`,
        action: 'Consider alternatives with lower anticholinergic burden. Monitor cognitive function.',
        source: 'geriatric_safety',
      });
    }

    // AGS Beers Criteria 2023 — additional PIMs (Potentially Inappropriate Medications)
    const beersPIMs: Array<{ drugs: string[]; category: string; reason: string; alternative: string }> = [
      {
        drugs: ['metoclopramide', 'reglan'],
        category: 'GI',
        reason: 'Extrapyramidal effects including tardive dyskinesia; risk increases with age and duration',
        alternative: 'Ondansetron, domperidone (where available), or non-pharmacologic measures',
      },
      {
        drugs: ['nitrofurantoin', 'macrobid', 'macrodantin'],
        category: 'Anti-infective',
        reason: 'Pulmonary toxicity, hepatotoxicity, peripheral neuropathy with long-term use; ineffective if CrCl < 30',
        alternative: 'Trimethoprim-sulfamethoxazole or fosfomycin (short course UTI only)',
      },
      {
        drugs: ['glyburide', 'glibenclamide'],
        category: 'Hypoglycemic',
        reason: 'Active metabolites accumulate in CKD; prolonged hypoglycemia risk highest among sulfonylureas',
        alternative: 'Glipizide or glimepiride (shorter acting, safer renal profile)',
      },
      {
        drugs: ['meperidine', 'demerol'],
        category: 'Opioid',
        reason: 'Neurotoxic metabolite normeperidine causes seizures; not effective orally; accumulates in renal impairment',
        alternative: 'Morphine (with renal adjustment), hydromorphone, or fentanyl',
      },
      {
        drugs: ['indomethacin', 'ketorolac'],
        category: 'NSAID',
        reason: 'Highest GI bleeding risk among NSAIDs; indomethacin also has most CNS adverse effects',
        alternative: 'Acetaminophen, topical NSAIDs (diclofenac gel), or short-course celecoxib if needed',
      },
      {
        drugs: ['chlorpropamide'],
        category: 'Hypoglycemic',
        reason: 'Prolonged half-life (36h); SIADH and severe hypoglycemia in elderly',
        alternative: 'Glipizide, metformin (if eGFR allows), or insulin',
      },
      {
        drugs: ['doxazosin', 'prazosin', 'terazosin'],
        category: 'Alpha-blocker',
        reason: 'High risk of orthostatic hypotension, syncope, and falls in elderly',
        alternative: 'Tamsulosin (for BPH), other antihypertensives for blood pressure',
      },
      {
        drugs: ['sliding scale insulin'],
        category: 'Hypoglycemic',
        reason: 'Higher risk of hypoglycemia without improvement in glycemic control in elderly',
        alternative: 'Basal insulin with fixed-dose prandial corrections; relaxed HbA1c targets (< 8%)',
      },
    ];

    for (const pim of beersPIMs) {
      const flagged = context.medications!.filter(m =>
        pim.drugs.some(d => m.toLowerCase().includes(d))
      );
      if (flagged.length > 0) {
        alerts.push({
          priority: 'moderate',
          category: 'Beers Criteria',
          title: `Potentially inappropriate: ${flagged.join(', ')} (${pim.category})`,
          detail: `AGS Beers Criteria 2023: ${flagged.join(', ')} — ${pim.reason}`,
          action: `Consider alternative: ${pim.alternative}. Deprescribing recommended if clinically appropriate.`,
          source: 'beers_criteria',
        });
      }
    }

    // Duplicate therapy detection in elderly
    const medClasses = new Map<string, string[]>();
    const classMap: Record<string, string[]> = {
      'NSAID': ['ibuprofen', 'naproxen', 'celecoxib', 'diclofenac', 'meloxicam', 'indomethacin', 'ketorolac'],
      'PPI': ['omeprazole', 'pantoprazole', 'lansoprazole', 'esomeprazole', 'rabeprazole'],
      'SSRI': ['fluoxetine', 'sertraline', 'paroxetine', 'citalopram', 'escitalopram', 'fluvoxamine'],
      'Benzodiazepine': ['alprazolam', 'diazepam', 'lorazepam', 'clonazepam', 'temazepam'],
      'Statin': ['simvastatin', 'atorvastatin', 'rosuvastatin', 'pravastatin', 'lovastatin'],
      'ACE-I/ARB': ['lisinopril', 'enalapril', 'ramipril', 'losartan', 'valsartan', 'irbesartan', 'candesartan'],
      'Opioid': ['morphine', 'oxycodone', 'hydrocodone', 'tramadol', 'fentanyl', 'codeine', 'hydromorphone'],
    };

    for (const [className, drugs] of Object.entries(classMap)) {
      const found = context.medications!.filter(m =>
        drugs.some(d => m.toLowerCase().includes(d))
      );
      if (found.length >= 2) {
        alerts.push({
          priority: 'moderate',
          category: 'Duplicate Therapy',
          title: `Multiple ${className} medications`,
          detail: `Patient is on ${found.length} ${className} agents: ${found.join(', ')}. Duplicate therapy increases adverse effect risk without proportional benefit.`,
          action: `Review for consolidation to single agent. Assess if both are clinically necessary.`,
          source: 'duplicate_therapy',
        });
      }
    }
  }

  // Renal dosing alerts — check medications against eGFR if lab data available
  if (context.medications && context.medications.length > 0 && context.labResults) {
    const labMap = new Map(context.labResults.map(l => [l.test.toUpperCase(), l.value]));
    const creat = labMap.get('CREAT');
    if (creat && context.age && context.sex) {
      // Calculate eGFR using CKD-EPI approximation for alert purposes
      const eGFR = calculateSimpleEGFR(creat, context.age, context.sex);
      if (eGFR < 60) {
        const renalCheck = checkRenalDosing(context.medications, eGFR);
        for (const adj of renalCheck.adjustments) {
          const priority: AlertPriority = (adj.action === 'avoid' || adj.action === 'contraindicated') ? 'critical' : 'high';
          alerts.push({
            priority,
            category: 'Renal Dosing',
            title: `${adj.action === 'avoid' || adj.action === 'contraindicated' ? 'AVOID' : 'Dose adjustment needed'}: ${adj.drug}`,
            detail: `eGFR ${eGFR.toFixed(0)} mL/min: ${adj.drug} (${adj.drugClass}) requires adjustment. Normal dose: ${adj.normalDose}. Recommended: ${adj.recommendedDose}. ${adj.rationale}`,
            action: `${adj.recommendedDose}. ${adj.monitoring}`,
            source: 'renal_dosing',
          });
        }
      }
    }
  }

  return alerts;
}

/** Simplified CKD-EPI 2021 eGFR for alert generation (creatinine in mg/dL) */
function calculateSimpleEGFR(creatResult: number, age: number, sex: 'male' | 'female'): number {
  // CKD-EPI 2021 (race-free)
  const isFemale = sex === 'female';
  const kappa = isFemale ? 0.7 : 0.9;
  const alpha = isFemale ? -0.241 : -0.302;
  const scr_k = creatResult / kappa;
  const min_val = Math.min(scr_k, 1);
  const max_val = Math.max(scr_k, 1);
  const multiplier = isFemale ? 1.012 : 1.0;
  return 142 * Math.pow(min_val, alpha) * Math.pow(max_val, -1.200) * Math.pow(0.9938, age) * multiplier;
}

function generateSummary(
  alerts: ClinicalAlert[],
  byPriority: Record<AlertPriority, number>,
  overallRisk: string
): string {
  if (alerts.length === 0) {
    return 'No clinical alerts generated. Patient data within expected parameters.';
  }

  const parts: string[] = [`Generated ${alerts.length} clinical alert(s). Overall risk: ${overallRisk.toUpperCase()}.`];

  if (byPriority.critical > 0) {
    parts.push(`⚠️ ${byPriority.critical} CRITICAL alert(s) requiring immediate attention.`);
  }
  if (byPriority.high > 0) {
    parts.push(`${byPriority.high} high-priority alert(s).`);
  }

  const categories = [...new Set(alerts.map(a => a.category))];
  parts.push(`Categories: ${categories.join(', ')}.`);

  return parts.join(' ');
}

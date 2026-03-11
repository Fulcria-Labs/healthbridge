/**
 * Laboratory test reference ranges and clinical interpretation.
 * Ranges based on standard adult reference intervals.
 */

export type Urgency = 'normal' | 'borderline' | 'abnormal' | 'critical';

export interface LabReference {
  testCode: string;
  testName: string;
  aliases: string[];
  unit: string;
  normalRange: { low: number; high: number };
  criticalRange?: { low?: number; high?: number };
  category: string;
  interpretation: Record<string, { range: string; meaning: string; action: string }>;
}

export interface LabResult {
  testCode: string;
  testName: string;
  value: number;
  unit: string;
  urgency: Urgency;
  referenceRange: string;
  interpretation: string;
  clinicalSignificance: string;
  suggestedAction: string;
}

export const labReferences: LabReference[] = [
  // Complete Blood Count
  {
    testCode: 'WBC', testName: 'White Blood Cell Count', aliases: ['leukocytes', 'white blood cells'],
    unit: 'K/uL', normalRange: { low: 4.5, high: 11.0 }, criticalRange: { low: 2.0, high: 30.0 },
    category: 'Hematology',
    interpretation: {
      critical_low: { range: '<2.0', meaning: 'Severe leukopenia/neutropenia', action: 'Urgent evaluation for infection risk. Consider isolation precautions. CBC with differential. Evaluate for bone marrow suppression.' },
      low: { range: '2.0-4.4', meaning: 'Leukopenia', action: 'Evaluate for viral infection, medication effect, autoimmune condition. Obtain differential count.' },
      normal: { range: '4.5-11.0', meaning: 'Normal white cell count', action: 'No action required.' },
      high: { range: '11.1-29.9', meaning: 'Leukocytosis', action: 'Evaluate for infection, inflammation, stress response, medication effect. Consider blood cultures if febrile.' },
      critical_high: { range: '≥30.0', meaning: 'Marked leukocytosis', action: 'Urgent evaluation. Consider leukemia workup. Peripheral smear. Hematology consultation.' }
    }
  },
  {
    testCode: 'HGB', testName: 'Hemoglobin', aliases: ['hgb', 'hb', 'hemoglobin'],
    unit: 'g/dL', normalRange: { low: 12.0, high: 17.5 }, criticalRange: { low: 7.0, high: 20.0 },
    category: 'Hematology',
    interpretation: {
      critical_low: { range: '<7.0', meaning: 'Severe anemia', action: 'Consider transfusion. Type and crossmatch. Evaluate for active bleeding. Cardiology assessment if symptomatic.' },
      low: { range: '7.0-11.9', meaning: 'Anemia', action: 'Evaluate for iron deficiency, B12/folate, chronic disease, hemolysis. Reticulocyte count. Iron studies.' },
      normal: { range: '12.0-17.5', meaning: 'Normal hemoglobin', action: 'No action required.' },
      high: { range: '17.6-19.9', meaning: 'Polycythemia', action: 'Evaluate for dehydration, chronic hypoxia, polycythemia vera. Check oxygen saturation.' },
      critical_high: { range: '≥20.0', meaning: 'Severe polycythemia', action: 'Urgent evaluation. Phlebotomy may be needed. Rule out polycythemia vera.' }
    }
  },
  {
    testCode: 'PLT', testName: 'Platelet Count', aliases: ['platelets', 'thrombocytes'],
    unit: 'K/uL', normalRange: { low: 150, high: 400 }, criticalRange: { low: 50, high: 1000 },
    category: 'Hematology',
    interpretation: {
      critical_low: { range: '<50', meaning: 'Severe thrombocytopenia', action: 'Bleeding risk assessment. Hold anticoagulants/antiplatelets. Consider platelet transfusion if <10 or active bleeding.' },
      low: { range: '50-149', meaning: 'Thrombocytopenia', action: 'Evaluate for medications (heparin-induced), liver disease, DIC, ITP. Peripheral smear.' },
      normal: { range: '150-400', meaning: 'Normal platelet count', action: 'No action required.' },
      high: { range: '401-999', meaning: 'Thrombocytosis', action: 'Often reactive (infection, inflammation, iron deficiency). Check ferritin, CRP, peripheral smear.' },
      critical_high: { range: '≥1000', meaning: 'Extreme thrombocytosis', action: 'Hematology referral. Evaluate for myeloproliferative disorder. JAK2 mutation testing.' }
    }
  },
  // Metabolic Panel
  {
    testCode: 'GLU', testName: 'Glucose (Fasting)', aliases: ['blood sugar', 'fasting glucose', 'blood glucose'],
    unit: 'mg/dL', normalRange: { low: 70, high: 100 }, criticalRange: { low: 40, high: 500 },
    category: 'Metabolic',
    interpretation: {
      critical_low: { range: '<40', meaning: 'Severe hypoglycemia', action: 'EMERGENCY. Administer IV dextrose or oral glucose immediately. Evaluate for insulinoma, medication overdose.' },
      low: { range: '40-69', meaning: 'Hypoglycemia', action: 'Give oral glucose. Evaluate medications (insulin, sulfonylureas). Check for adrenal insufficiency.' },
      normal: { range: '70-100', meaning: 'Normal fasting glucose', action: 'No action required.' },
      prediabetes: { range: '101-125', meaning: 'Impaired fasting glucose (pre-diabetes)', action: 'Lifestyle modification. Repeat testing. Consider HbA1c and oral glucose tolerance test.' },
      high: { range: '126-499', meaning: 'Diabetes range', action: 'Confirm with repeat fasting glucose or HbA1c. Initiate diabetes workup and management.' },
      critical_high: { range: '≥500', meaning: 'Severe hyperglycemia', action: 'EMERGENCY. Evaluate for DKA or HHS. Check BMP, ketones, blood gas. IV fluids and insulin protocol.' }
    }
  },
  {
    testCode: 'CREAT', testName: 'Creatinine', aliases: ['creatinine', 'serum creatinine', 'cr'],
    unit: 'mg/dL', normalRange: { low: 0.7, high: 1.3 }, criticalRange: { high: 10.0 },
    category: 'Renal',
    interpretation: {
      low: { range: '<0.7', meaning: 'Low creatinine', action: 'May indicate low muscle mass, liver disease, or pregnancy. Usually not clinically significant.' },
      normal: { range: '0.7-1.3', meaning: 'Normal creatinine', action: 'No action required. Calculate eGFR for full renal assessment.' },
      high: { range: '1.4-9.9', meaning: 'Elevated creatinine', action: 'Evaluate for acute vs chronic kidney disease. Check BUN, urinalysis, renal ultrasound. Calculate eGFR. Review nephrotoxic medications.' },
      critical_high: { range: '≥10.0', meaning: 'Severe renal failure', action: 'Urgent nephrology consultation. Evaluate for dialysis. Check electrolytes, acid-base status.' }
    }
  },
  {
    testCode: 'BUN', testName: 'Blood Urea Nitrogen', aliases: ['urea nitrogen', 'bun'],
    unit: 'mg/dL', normalRange: { low: 7, high: 20 }, criticalRange: { high: 100 },
    category: 'Renal',
    interpretation: {
      low: { range: '<7', meaning: 'Low BUN', action: 'May indicate liver disease, malnutrition, or overhydration. Usually not clinically significant.' },
      normal: { range: '7-20', meaning: 'Normal BUN', action: 'No action required.' },
      high: { range: '21-99', meaning: 'Elevated BUN', action: 'Evaluate for dehydration, GI bleeding, high protein diet, renal impairment. Check BUN/creatinine ratio.' },
      critical_high: { range: '≥100', meaning: 'Severely elevated BUN', action: 'Urgent evaluation. Likely significant renal failure or severe upper GI bleeding. Consider dialysis.' }
    }
  },
  {
    testCode: 'NA', testName: 'Sodium', aliases: ['sodium', 'na', 'serum sodium'],
    unit: 'mEq/L', normalRange: { low: 136, high: 145 }, criticalRange: { low: 120, high: 160 },
    category: 'Electrolytes',
    interpretation: {
      critical_low: { range: '<120', meaning: 'Severe hyponatremia', action: 'EMERGENCY. Risk of cerebral edema, seizures. Evaluate for SIADH, fluid overload, diuretic use. Careful correction to avoid osmotic demyelination.' },
      low: { range: '120-135', meaning: 'Hyponatremia', action: 'Assess volume status (hypo/eu/hypervolemic). Check serum and urine osmolality. Evaluate medications.' },
      normal: { range: '136-145', meaning: 'Normal sodium', action: 'No action required.' },
      high: { range: '146-159', meaning: 'Hypernatremia', action: 'Usually indicates dehydration or diabetes insipidus. Free water replacement. Check urine specific gravity.' },
      critical_high: { range: '≥160', meaning: 'Severe hypernatremia', action: 'EMERGENCY. Gradual correction with free water. Risk of cerebral hemorrhage if corrected too rapidly.' }
    }
  },
  {
    testCode: 'K', testName: 'Potassium', aliases: ['potassium', 'k+', 'serum potassium'],
    unit: 'mEq/L', normalRange: { low: 3.5, high: 5.0 }, criticalRange: { low: 2.5, high: 6.5 },
    category: 'Electrolytes',
    interpretation: {
      critical_low: { range: '<2.5', meaning: 'Severe hypokalemia', action: 'EMERGENCY. Cardiac monitoring (risk of fatal arrhythmias). IV potassium replacement. Check magnesium (often co-depleted).' },
      low: { range: '2.5-3.4', meaning: 'Hypokalemia', action: 'Oral or IV potassium supplementation. Evaluate cause: diuretics, GI losses, renal wasting. Check magnesium.' },
      normal: { range: '3.5-5.0', meaning: 'Normal potassium', action: 'No action required.' },
      high: { range: '5.1-6.4', meaning: 'Hyperkalemia', action: 'Repeat to rule out hemolysis artifact. ECG to evaluate for peaked T waves. Review medications (ACEi, ARB, K-sparing diuretics, NSAIDs).' },
      critical_high: { range: '≥6.5', meaning: 'Severe hyperkalemia', action: 'EMERGENCY. Immediate ECG. Calcium gluconate for cardiac protection. Insulin/glucose, kayexalate, consider dialysis.' }
    }
  },
  // Liver Function
  {
    testCode: 'ALT', testName: 'Alanine Aminotransferase', aliases: ['alt', 'sgpt', 'alanine transaminase'],
    unit: 'U/L', normalRange: { low: 7, high: 56 }, criticalRange: { high: 1000 },
    category: 'Hepatic',
    interpretation: {
      normal: { range: '7-56', meaning: 'Normal ALT', action: 'No action required.' },
      mild: { range: '57-200', meaning: 'Mildly elevated ALT', action: 'Evaluate for NAFLD, medications, alcohol, viral hepatitis. Check hepatitis serologies.' },
      moderate: { range: '201-999', meaning: 'Moderately elevated ALT', action: 'Significant hepatocellular injury. Viral hepatitis panel, autoimmune markers, medication review. Hepatology referral.' },
      critical_high: { range: '≥1000', meaning: 'Severely elevated ALT', action: 'Acute hepatitis or liver injury. Urgent evaluation: acetaminophen level, viral panel, imaging. Consider liver biopsy.' }
    }
  },
  {
    testCode: 'AST', testName: 'Aspartate Aminotransferase', aliases: ['ast', 'sgot', 'aspartate transaminase'],
    unit: 'U/L', normalRange: { low: 10, high: 40 }, criticalRange: { high: 1000 },
    category: 'Hepatic',
    interpretation: {
      normal: { range: '10-40', meaning: 'Normal AST', action: 'No action required.' },
      mild: { range: '41-200', meaning: 'Mildly elevated AST', action: 'Consider liver or muscle origin. Check ALT, CK. AST/ALT ratio >2 suggests alcoholic liver disease.' },
      moderate: { range: '201-999', meaning: 'Moderately elevated AST', action: 'Significant tissue injury (hepatic or cardiac/muscle). Comprehensive workup.' },
      critical_high: { range: '≥1000', meaning: 'Severely elevated AST', action: 'Acute liver injury, rhabdomyolysis, or myocardial infarction. Urgent evaluation with CK, troponin, liver panel.' }
    }
  },
  // Cardiac
  {
    testCode: 'TROP', testName: 'Troponin I (High Sensitivity)', aliases: ['troponin', 'hs-troponin', 'troponin i', 'hs-tnI'],
    unit: 'ng/L', normalRange: { low: 0, high: 14 }, criticalRange: { high: 100 },
    category: 'Cardiac',
    interpretation: {
      normal: { range: '0-14', meaning: 'Normal troponin', action: 'No myocardial injury detected. Consider serial testing if presentation <3 hours.' },
      elevated: { range: '15-99', meaning: 'Elevated troponin', action: 'Myocardial injury detected. Correlate with clinical picture. Serial troponins at 3 and 6 hours. Consider Type 1 vs Type 2 MI.' },
      critical_high: { range: '≥100', meaning: 'Significantly elevated troponin', action: 'Strong evidence of myocardial injury. Cardiology consultation. ECG. Consider emergent catheterization if STEMI criteria met.' }
    }
  },
  {
    testCode: 'BNP', testName: 'B-type Natriuretic Peptide', aliases: ['bnp', 'brain natriuretic peptide'],
    unit: 'pg/mL', normalRange: { low: 0, high: 100 }, criticalRange: { high: 900 },
    category: 'Cardiac',
    interpretation: {
      normal: { range: '0-100', meaning: 'Heart failure unlikely', action: 'BNP <100 has strong negative predictive value for heart failure. Consider alternative diagnoses for dyspnea.' },
      gray_zone: { range: '101-400', meaning: 'Indeterminate for heart failure', action: 'Clinical correlation needed. Consider echocardiogram. Evaluate for other causes of elevation (renal failure, PE, sepsis).' },
      high: { range: '401-899', meaning: 'Heart failure likely', action: 'Echocardiogram recommended. Initiate heart failure workup and treatment. Diuretics, ACEi/ARB consideration.' },
      critical_high: { range: '≥900', meaning: 'Severe heart failure', action: 'Decompensated heart failure likely. Aggressive diuresis. Cardiology consultation. Monitor in ICU/step-down.' }
    }
  },
  // Coagulation
  {
    testCode: 'INR', testName: 'International Normalized Ratio', aliases: ['inr', 'prothrombin time ratio'],
    unit: '', normalRange: { low: 0.8, high: 1.1 }, criticalRange: { high: 5.0 },
    category: 'Coagulation',
    interpretation: {
      normal: { range: '0.8-1.1', meaning: 'Normal coagulation', action: 'No action required (unless on warfarin, target typically 2.0-3.0).' },
      therapeutic: { range: '2.0-3.0', meaning: 'Therapeutic range (warfarin)', action: 'In range for most warfarin indications. Continue current dose.' },
      supratherapeutic: { range: '3.1-4.9', meaning: 'Supratherapeutic (if on warfarin)', action: 'Hold or reduce warfarin. Monitor for bleeding. Recheck in 1-2 days.' },
      critical_high: { range: '≥5.0', meaning: 'Dangerously elevated INR', action: 'Hold warfarin. Consider vitamin K (oral for INR 5-9, IV for >9 or active bleeding). FFP if actively bleeding.' }
    }
  },
  // Thyroid
  {
    testCode: 'TSH', testName: 'Thyroid Stimulating Hormone', aliases: ['tsh', 'thyrotropin'],
    unit: 'mIU/L', normalRange: { low: 0.4, high: 4.0 },
    category: 'Endocrine',
    interpretation: {
      low: { range: '<0.4', meaning: 'Low TSH (possible hyperthyroidism)', action: 'Check free T4 and free T3. Evaluate for Graves disease, toxic nodule, medication effect (steroids, dopamine).' },
      normal: { range: '0.4-4.0', meaning: 'Normal thyroid function', action: 'No action required.' },
      subclinical: { range: '4.1-10.0', meaning: 'Subclinical hypothyroidism', action: 'Repeat in 6-8 weeks. Check anti-TPO antibodies. Treatment depends on symptoms and antibody status.' },
      high: { range: '>10.0', meaning: 'Hypothyroidism', action: 'Check free T4. Initiate levothyroxine. Start low in elderly/cardiac patients.' }
    }
  },
  // Inflammatory
  {
    testCode: 'CRP', testName: 'C-Reactive Protein', aliases: ['crp', 'c-reactive protein'],
    unit: 'mg/L', normalRange: { low: 0, high: 3.0 },
    category: 'Inflammatory',
    interpretation: {
      normal: { range: '0-3.0', meaning: 'Normal/low inflammation', action: 'No significant systemic inflammation.' },
      mild: { range: '3.1-10.0', meaning: 'Mild inflammation', action: 'Non-specific. May indicate chronic inflammation, mild infection, or cardiovascular risk factor.' },
      moderate: { range: '10.1-100', meaning: 'Moderate inflammation', action: 'Active inflammation likely. Evaluate for infection, autoimmune disease, tissue injury.' },
      severe: { range: '>100', meaning: 'Severe inflammation', action: 'Significant systemic inflammation. Consider serious bacterial infection, severe autoimmune flare, or major tissue necrosis.' }
    }
  },
  // HbA1c
  {
    testCode: 'HBA1C', testName: 'Hemoglobin A1c', aliases: ['hba1c', 'a1c', 'glycated hemoglobin', 'glycohemoglobin'],
    unit: '%', normalRange: { low: 4.0, high: 5.6 },
    category: 'Endocrine',
    interpretation: {
      normal: { range: '4.0-5.6', meaning: 'Normal glucose control', action: 'No action required. Screen per guidelines (every 3 years if risk factors).' },
      prediabetes: { range: '5.7-6.4', meaning: 'Pre-diabetes', action: 'Lifestyle modification: diet, exercise, weight loss. Recheck annually. Consider metformin if high risk.' },
      diabetes: { range: '6.5-8.9', meaning: 'Diabetes', action: 'Confirm diagnosis (repeat test or fasting glucose). Initiate diabetes management plan. Target <7% for most adults.' },
      poorly_controlled: { range: '≥9.0', meaning: 'Poorly controlled diabetes', action: 'Intensify therapy. Evaluate adherence, medication regimen, and barriers. Consider referral to endocrinology.' }
    }
  },
];

/**
 * Resolve a test name/code to the reference entry
 */
export function resolveLabTest(input: string): LabReference | null {
  const normalized = input.toLowerCase().trim();

  return labReferences.find(ref =>
    ref.testCode.toLowerCase() === normalized ||
    ref.testName.toLowerCase() === normalized ||
    ref.aliases.some(alias => alias.toLowerCase() === normalized)
  ) ?? null;
}

/**
 * Interpret a lab result value
 */
export function interpretLabResult(testInput: string, value: number): LabResult | null {
  const ref = resolveLabTest(testInput);
  if (!ref) return null;

  let urgency: Urgency;
  let interpretationKey: string;

  // Determine urgency based on value
  if (ref.criticalRange?.low !== undefined && value < ref.criticalRange.low) {
    urgency = 'critical';
    interpretationKey = 'critical_low';
  } else if (ref.criticalRange?.high !== undefined && value >= ref.criticalRange.high) {
    urgency = 'critical';
    interpretationKey = 'critical_high';
  } else if (value < ref.normalRange.low) {
    urgency = 'abnormal';
    interpretationKey = 'low';
  } else if (value > ref.normalRange.high) {
    urgency = 'abnormal';
    interpretationKey = 'high';
  } else {
    urgency = 'normal';
    interpretationKey = 'normal';
  }

  // Find the best matching interpretation
  const interp = ref.interpretation[interpretationKey] ||
    findBestInterpretation(ref, value);

  return {
    testCode: ref.testCode,
    testName: ref.testName,
    value,
    unit: ref.unit,
    urgency,
    referenceRange: `${ref.normalRange.low}-${ref.normalRange.high} ${ref.unit}`,
    interpretation: interp?.meaning ?? 'See reference ranges',
    clinicalSignificance: urgency === 'critical'
      ? 'CRITICAL VALUE - Requires immediate clinical attention'
      : urgency === 'abnormal'
        ? 'Abnormal result - Clinical evaluation recommended'
        : 'Within normal limits',
    suggestedAction: interp?.action ?? 'Consult reference guidelines',
  };
}

function findBestInterpretation(ref: LabReference, value: number): { range: string; meaning: string; action: string } | null {
  // Try each interpretation and find the best match
  for (const [, interp] of Object.entries(ref.interpretation)) {
    // Parse range patterns like '<2.0', '2.0-4.4', '≥30.0', '>100'
    const range = interp.range;
    if (range.startsWith('<')) {
      const threshold = parseFloat(range.substring(1));
      if (value < threshold) return interp;
    } else if (range.startsWith('≥')) {
      const threshold = parseFloat(range.substring(1));
      if (value >= threshold) return interp;
    } else if (range.startsWith('>')) {
      const threshold = parseFloat(range.substring(1));
      if (value > threshold) return interp;
    } else if (range.includes('-')) {
      const [low, high] = range.split('-').map(parseFloat);
      if (value >= low && value <= high) return interp;
    }
  }
  return null;
}

/**
 * Interpret multiple lab results at once
 */
export function interpretLabPanel(results: Array<{ test: string; value: number }>): LabResult[] {
  return results
    .map(r => interpretLabResult(r.test, r.value))
    .filter((r): r is LabResult => r !== null);
}

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
  // Lipid Panel
  {
    testCode: 'TCHOL', testName: 'Total Cholesterol', aliases: ['total cholesterol', 'cholesterol'],
    unit: 'mg/dL', normalRange: { low: 0, high: 200 },
    category: 'Lipids',
    interpretation: {
      desirable: { range: '0-200', meaning: 'Desirable total cholesterol', action: 'No action required. Rescreen per guidelines.' },
      borderline: { range: '201-239', meaning: 'Borderline high cholesterol', action: 'Lifestyle modification. Assess cardiovascular risk factors. Consider statin therapy based on ASCVD risk.' },
      high: { range: '≥240', meaning: 'High cholesterol', action: 'Full lipid panel. ASCVD risk calculation. Lifestyle changes. Statin therapy likely indicated.' }
    }
  },
  {
    testCode: 'LDL', testName: 'LDL Cholesterol', aliases: ['ldl', 'low-density lipoprotein', 'bad cholesterol'],
    unit: 'mg/dL', normalRange: { low: 0, high: 100 },
    category: 'Lipids',
    interpretation: {
      optimal: { range: '0-70', meaning: 'Optimal LDL (goal for very high risk)', action: 'Optimal. Maintain current therapy.' },
      near_optimal: { range: '71-100', meaning: 'Near optimal LDL', action: 'Adequate for most patients. Very high-risk patients may benefit from LDL <70.' },
      borderline: { range: '101-129', meaning: 'Borderline high LDL', action: 'Lifestyle changes. Consider statin based on overall ASCVD risk.' },
      high: { range: '130-189', meaning: 'High LDL', action: 'Statin therapy recommended for most patients. Intensify lifestyle modifications.' },
      very_high: { range: '≥190', meaning: 'Very high LDL', action: 'High-intensity statin therapy. Evaluate for familial hypercholesterolemia. Consider PCSK9 inhibitor if refractory.' }
    }
  },
  {
    testCode: 'HDL', testName: 'HDL Cholesterol', aliases: ['hdl', 'high-density lipoprotein', 'good cholesterol'],
    unit: 'mg/dL', normalRange: { low: 40, high: 100 },
    category: 'Lipids',
    interpretation: {
      low: { range: '<40', meaning: 'Low HDL (cardiovascular risk factor)', action: 'Independent CVD risk factor. Lifestyle changes: exercise, weight loss, smoking cessation. Evaluate for metabolic syndrome.' },
      normal: { range: '40-59', meaning: 'Normal HDL', action: 'Adequate. Continue healthy lifestyle.' },
      high: { range: '≥60', meaning: 'High HDL (protective)', action: 'Considered protective against cardiovascular disease. No treatment needed.' }
    }
  },
  {
    testCode: 'TG', testName: 'Triglycerides', aliases: ['triglycerides', 'trig', 'trigs'],
    unit: 'mg/dL', normalRange: { low: 0, high: 150 }, criticalRange: { high: 500 },
    category: 'Lipids',
    interpretation: {
      normal: { range: '0-150', meaning: 'Normal triglycerides', action: 'No action required.' },
      borderline: { range: '151-199', meaning: 'Borderline high triglycerides', action: 'Lifestyle modification: reduce refined carbs, alcohol, weight loss, exercise.' },
      high: { range: '200-499', meaning: 'High triglycerides', action: 'Lifestyle changes. Consider fibrate or omega-3. Evaluate for secondary causes (diabetes, hypothyroidism, medications).' },
      critical_high: { range: '≥500', meaning: 'Very high triglycerides', action: 'Risk of acute pancreatitis. Urgent treatment with fibrate. Very low-fat diet. Evaluate for familial hypertriglyceridemia.' }
    }
  },
  // Calcium
  {
    testCode: 'CA', testName: 'Calcium (Total)', aliases: ['calcium', 'total calcium', 'serum calcium'],
    unit: 'mg/dL', normalRange: { low: 8.5, high: 10.5 }, criticalRange: { low: 6.0, high: 13.0 },
    category: 'Metabolic',
    interpretation: {
      critical_low: { range: '<6.0', meaning: 'Severe hypocalcemia', action: 'EMERGENCY. IV calcium gluconate. Cardiac monitoring. Evaluate for hypoparathyroidism, vitamin D deficiency, renal failure.' },
      low: { range: '6.0-8.4', meaning: 'Hypocalcemia', action: 'Check albumin (correct calcium), ionized calcium, PTH, vitamin D, magnesium. Supplement as needed.' },
      normal: { range: '8.5-10.5', meaning: 'Normal calcium', action: 'No action required.' },
      high: { range: '10.6-12.9', meaning: 'Hypercalcemia', action: 'Check PTH, vitamin D, PTHrP. Most common causes: primary hyperparathyroidism and malignancy. IV fluids if symptomatic.' },
      critical_high: { range: '≥13.0', meaning: 'Severe hypercalcemia', action: 'EMERGENCY. Aggressive IV hydration. Calcitonin. Consider bisphosphonate. Evaluate for malignancy.' }
    }
  },
  // Magnesium
  {
    testCode: 'MG', testName: 'Magnesium', aliases: ['magnesium', 'mag', 'serum magnesium'],
    unit: 'mg/dL', normalRange: { low: 1.7, high: 2.2 }, criticalRange: { low: 1.0, high: 4.0 },
    category: 'Electrolytes',
    interpretation: {
      critical_low: { range: '<1.0', meaning: 'Severe hypomagnesemia', action: 'EMERGENCY. IV magnesium sulfate. Cardiac monitoring (risk of torsades de pointes). Check potassium (often co-depleted).' },
      low: { range: '1.0-1.6', meaning: 'Hypomagnesemia', action: 'Oral or IV magnesium supplementation. Evaluate cause: diuretics, alcohol, GI losses, PPIs. Check calcium and potassium.' },
      normal: { range: '1.7-2.2', meaning: 'Normal magnesium', action: 'No action required.' },
      high: { range: '2.3-3.9', meaning: 'Hypermagnesemia', action: 'Usually iatrogenic. Stop magnesium sources. Check renal function.' },
      critical_high: { range: '≥4.0', meaning: 'Severe hypermagnesemia', action: 'EMERGENCY. IV calcium gluconate as antagonist. Cardiac monitoring. Consider dialysis if renal failure.' }
    }
  },
  // Alkaline Phosphatase
  {
    testCode: 'ALP', testName: 'Alkaline Phosphatase', aliases: ['alk phos', 'alkaline phosphatase', 'alp'],
    unit: 'U/L', normalRange: { low: 44, high: 147 },
    category: 'Hepatic',
    interpretation: {
      normal: { range: '44-147', meaning: 'Normal ALP', action: 'No action required.' },
      mild: { range: '148-300', meaning: 'Mildly elevated ALP', action: 'Evaluate source: hepatic (check GGT) or bone (check calcium, vitamin D). Consider medications, pregnancy.' },
      moderate: { range: '301-600', meaning: 'Moderately elevated ALP', action: 'Likely cholestatic liver disease or bone disorder. Liver imaging. Check GGT, bilirubin.' },
      high: { range: '>600', meaning: 'Markedly elevated ALP', action: 'Biliary obstruction, infiltrative liver disease, or active bone disease. Urgent imaging. GI/hepatology referral.' }
    }
  },
  // D-dimer
  {
    testCode: 'DDIMER', testName: 'D-dimer', aliases: ['d-dimer', 'fibrin degradation product'],
    unit: 'ng/mL', normalRange: { low: 0, high: 500 },
    category: 'Coagulation',
    interpretation: {
      normal: { range: '0-500', meaning: 'Normal D-dimer', action: 'Negative D-dimer effectively excludes PE/DVT in low-moderate pretest probability patients (high NPV).' },
      elevated: { range: '501-2000', meaning: 'Elevated D-dimer', action: 'Cannot rule out VTE. Consider CT angiography or lower extremity ultrasound. Non-specific: also elevated in infection, surgery, malignancy, pregnancy.' },
      markedly_elevated: { range: '>2000', meaning: 'Markedly elevated D-dimer', action: 'High suspicion for VTE, DIC, or major thrombotic event. Urgent imaging. Check coagulation panel for DIC.' }
    }
  },
  // Procalcitonin
  {
    testCode: 'PCT', testName: 'Procalcitonin', aliases: ['procalcitonin', 'pct'],
    unit: 'ng/mL', normalRange: { low: 0, high: 0.1 },
    category: 'Inflammatory',
    interpretation: {
      normal: { range: '0-0.1', meaning: 'Normal procalcitonin', action: 'Bacterial infection unlikely. Consider viral etiology. Safe to withhold or discontinue antibiotics.' },
      low_risk: { range: '0.1-0.25', meaning: 'Low probability of bacterial infection', action: 'Bacterial infection less likely. Antibiotic use discouraged unless clinical suspicion high.' },
      possible: { range: '0.26-0.49', meaning: 'Possible bacterial infection', action: 'Bacterial infection possible. Consider short-course antibiotics. Repeat in 24-48 hours for trend.' },
      likely: { range: '0.5-2.0', meaning: 'Bacterial infection likely', action: 'Initiate antibiotics. Cultures before treatment. Repeat procalcitonin to guide duration.' },
      severe: { range: '>2.0', meaning: 'Severe bacterial infection/sepsis', action: 'Aggressive antibiotic therapy. Evaluate for source. Sepsis protocol.' }
    }
  },
  // ESR
  {
    testCode: 'ESR', testName: 'Erythrocyte Sedimentation Rate', aliases: ['esr', 'sed rate', 'sedimentation rate'],
    unit: 'mm/hr', normalRange: { low: 0, high: 20 },
    category: 'Inflammatory',
    interpretation: {
      normal: { range: '0-20', meaning: 'Normal ESR', action: 'No significant inflammation detected.' },
      mild: { range: '21-50', meaning: 'Mildly elevated ESR', action: 'Non-specific inflammation. Correlate with clinical picture. Consider infection, autoimmune disease, malignancy.' },
      moderate: { range: '51-100', meaning: 'Moderately elevated ESR', action: 'Significant inflammation. Evaluate for rheumatic disease, infection, malignancy. Check CRP for confirmation.' },
      high: { range: '>100', meaning: 'Markedly elevated ESR', action: 'Consider giant cell arteritis, multiple myeloma, severe infection, malignancy. Urgent workup indicated.' }
    }
  },
  // Ferritin
  {
    testCode: 'FERR', testName: 'Ferritin', aliases: ['ferritin', 'serum ferritin'],
    unit: 'ng/mL', normalRange: { low: 20, high: 250 }, criticalRange: { high: 1000 },
    category: 'Hematology',
    interpretation: {
      low: { range: '<20', meaning: 'Iron deficiency', action: 'Iron deficiency confirmed. Start oral iron supplementation. Evaluate for GI blood loss, dietary deficiency, menstrual losses.' },
      normal: { range: '20-250', meaning: 'Normal iron stores', action: 'No action required. Note: ferritin is an acute phase reactant and may be falsely normal in inflammation.' },
      high: { range: '251-999', meaning: 'Elevated ferritin', action: 'Evaluate for iron overload, inflammation, liver disease, malignancy, hemochromatosis. Check transferrin saturation, HFE gene testing.' },
      critical_high: { range: '≥1000', meaning: 'Markedly elevated ferritin', action: 'Urgent evaluation. Consider hemochromatosis, hemophagocytic syndrome, adult-onset Still disease, hepatic necrosis.' }
    }
  },
  // Albumin
  {
    testCode: 'ALB', testName: 'Albumin', aliases: ['albumin', 'serum albumin'],
    unit: 'g/dL', normalRange: { low: 3.5, high: 5.0 }, criticalRange: { low: 1.5 },
    category: 'Hepatic',
    interpretation: {
      critical_low: { range: '<1.5', meaning: 'Severely low albumin', action: 'CRITICAL. High risk for edema, poor wound healing. Evaluate for liver failure, nephrotic syndrome, severe malnutrition. Consider albumin infusion.' },
      low: { range: '1.5-3.4', meaning: 'Hypoalbuminemia', action: 'Evaluate for liver disease, nephrotic syndrome, malnutrition, chronic inflammation, protein-losing enteropathy.' },
      normal: { range: '3.5-5.0', meaning: 'Normal albumin', action: 'No action required. Good nutritional and synthetic liver function marker.' },
      high: { range: '>5.0', meaning: 'Elevated albumin', action: 'Usually indicates dehydration. Evaluate fluid status.' }
    }
  },
  // Total Bilirubin
  {
    testCode: 'TBILI', testName: 'Total Bilirubin', aliases: ['bilirubin', 'total bilirubin', 'tbili'],
    unit: 'mg/dL', normalRange: { low: 0.1, high: 1.2 }, criticalRange: { high: 15.0 },
    category: 'Hepatic',
    interpretation: {
      normal: { range: '0.1-1.2', meaning: 'Normal bilirubin', action: 'No action required.' },
      mild: { range: '1.3-3.0', meaning: 'Mildly elevated bilirubin', action: 'May indicate Gilbert syndrome (benign), hemolysis, or early liver disease. Check direct bilirubin, reticulocyte count, LDH, haptoglobin.' },
      moderate: { range: '3.1-10.0', meaning: 'Jaundice likely', action: 'Clinical jaundice present. Fractionate (direct vs indirect). Evaluate for hepatitis, obstruction, hemolysis. Liver imaging.' },
      high: { range: '10.1-14.9', meaning: 'Significant hyperbilirubinemia', action: 'Severe liver dysfunction or complete biliary obstruction. Urgent evaluation with imaging and hepatology consultation.' },
      critical_high: { range: '≥15.0', meaning: 'Severe hyperbilirubinemia', action: 'EMERGENCY. Risk of bilirubin encephalopathy. Urgent intervention. ERCP if obstructive. Consider liver transplant evaluation.' }
    }
  },
  // GGT
  {
    testCode: 'GGT', testName: 'Gamma-Glutamyl Transferase', aliases: ['ggt', 'gamma gt', 'gamma-glutamyl transpeptidase'],
    unit: 'U/L', normalRange: { low: 0, high: 61 },
    category: 'Hepatic',
    interpretation: {
      normal: { range: '0-61', meaning: 'Normal GGT', action: 'No action required.' },
      mild: { range: '62-200', meaning: 'Mildly elevated GGT', action: 'Often elevated with alcohol use, medications (phenytoin, carbamazepine), or cholestatic disease. If ALP also elevated, suggests hepatobiliary source.' },
      moderate: { range: '201-500', meaning: 'Moderately elevated GGT', action: 'Evaluate for alcohol abuse, cholestatic liver disease, medication effect. Liver imaging recommended.' },
      high: { range: '>500', meaning: 'Markedly elevated GGT', action: 'Significant hepatobiliary disease. Consider biliary obstruction, alcoholic liver disease, or drug toxicity. Urgent imaging.' }
    }
  },
  // Vitamin D
  {
    testCode: 'VITD', testName: '25-Hydroxy Vitamin D', aliases: ['vitamin d', '25-oh vitamin d', '25-hydroxyvitamin d', 'calcidiol'],
    unit: 'ng/mL', normalRange: { low: 30, high: 100 },
    category: 'Endocrine',
    interpretation: {
      deficient: { range: '<20', meaning: 'Vitamin D deficiency', action: 'High-dose supplementation: 50,000 IU weekly for 8-12 weeks, then maintenance. Check calcium, PTH. Evaluate for osteoporosis.' },
      insufficient: { range: '20-29', meaning: 'Vitamin D insufficiency', action: 'Supplement with 1,000-2,000 IU daily. Recheck in 3 months. Dietary counseling.' },
      normal: { range: '30-100', meaning: 'Adequate vitamin D', action: 'No action required. Maintenance dose 600-1,000 IU daily recommended.' },
      high: { range: '>100', meaning: 'Vitamin D excess', action: 'Risk of hypercalcemia. Stop supplementation. Check calcium level. Rarely toxic unless >150 ng/mL.' }
    }
  },
  // Vitamin B12
  {
    testCode: 'B12', testName: 'Vitamin B12', aliases: ['vitamin b12', 'cobalamin', 'cyanocobalamin'],
    unit: 'pg/mL', normalRange: { low: 200, high: 900 },
    category: 'Hematology',
    interpretation: {
      deficient: { range: '<200', meaning: 'B12 deficiency', action: 'Start B12 supplementation (IM or high-dose oral). Evaluate for pernicious anemia (anti-intrinsic factor antibodies), malabsorption, dietary deficiency. Check methylmalonic acid for confirmation.' },
      borderline: { range: '200-300', meaning: 'Borderline B12', action: 'Check methylmalonic acid and homocysteine for functional deficiency. Consider supplementation if elevated.' },
      normal: { range: '301-900', meaning: 'Normal B12', action: 'No action required.' },
      high: { range: '>900', meaning: 'Elevated B12', action: 'Usually not harmful from supplementation. If unexplained, evaluate for liver disease, myeloproliferative disorders, or renal failure.' }
    }
  },
  // Folate
  {
    testCode: 'FOLATE', testName: 'Folate (Serum)', aliases: ['folate', 'folic acid', 'serum folate'],
    unit: 'ng/mL', normalRange: { low: 2.7, high: 17.0 },
    category: 'Hematology',
    interpretation: {
      deficient: { range: '<2.7', meaning: 'Folate deficiency', action: 'Supplement with folic acid 1-5 mg daily. Check B12 simultaneously (must treat B12 first if both deficient). Evaluate dietary intake, malabsorption, medications (methotrexate, phenytoin).' },
      normal: { range: '2.7-17.0', meaning: 'Normal folate', action: 'No action required.' },
      high: { range: '>17.0', meaning: 'Elevated folate', action: 'Usually from supplementation. Not typically harmful. May mask B12 deficiency.' }
    }
  },
  // Phosphorus
  {
    testCode: 'PHOS', testName: 'Phosphorus', aliases: ['phosphorus', 'phosphate', 'serum phosphorus', 'inorganic phosphate'],
    unit: 'mg/dL', normalRange: { low: 2.5, high: 4.5 }, criticalRange: { low: 1.0, high: 8.0 },
    category: 'Electrolytes',
    interpretation: {
      critical_low: { range: '<1.0', meaning: 'Severe hypophosphatemia', action: 'EMERGENCY. IV phosphate replacement. Risk of respiratory failure, rhabdomyolysis, cardiac dysfunction. Common in refeeding syndrome.' },
      low: { range: '1.0-2.4', meaning: 'Hypophosphatemia', action: 'Oral phosphate supplementation. Evaluate for refeeding syndrome, alcoholism, vitamin D deficiency, hyperparathyroidism, diabetic ketoacidosis recovery.' },
      normal: { range: '2.5-4.5', meaning: 'Normal phosphorus', action: 'No action required.' },
      high: { range: '4.6-7.9', meaning: 'Hyperphosphatemia', action: 'Most common cause is renal failure. Phosphate binders. Restrict dietary phosphate. Check calcium (risk of calciphylaxis).' },
      critical_high: { range: '≥8.0', meaning: 'Severe hyperphosphatemia', action: 'EMERGENCY. Risk of metastatic calcification, cardiac arrest. Urgent dialysis consideration. IV calcium if symptomatic.' }
    }
  },
  // Uric Acid
  {
    testCode: 'URIC', testName: 'Uric Acid', aliases: ['uric acid', 'serum uric acid', 'urate'],
    unit: 'mg/dL', normalRange: { low: 3.0, high: 7.0 }, criticalRange: { high: 13.0 },
    category: 'Metabolic',
    interpretation: {
      low: { range: '<3.0', meaning: 'Low uric acid', action: 'May indicate SIADH, Fanconi syndrome, or xanthine oxidase deficiency. Usually not clinically significant.' },
      normal: { range: '3.0-7.0', meaning: 'Normal uric acid', action: 'No action required.' },
      high: { range: '7.1-12.9', meaning: 'Hyperuricemia', action: 'Risk factor for gout and nephrolithiasis. Lifestyle modification (reduce purine-rich foods, alcohol). Consider urate-lowering therapy if recurrent gout. Check renal function.' },
      critical_high: { range: '≥13.0', meaning: 'Severe hyperuricemia', action: 'Risk of tumor lysis syndrome if oncology patient. Consider rasburicase. Check renal function, electrolytes, LDH. Aggressive hydration.' }
    }
  },
  // Lactate
  {
    testCode: 'LAC', testName: 'Lactate', aliases: ['lactate', 'lactic acid', 'serum lactate'],
    unit: 'mmol/L', normalRange: { low: 0.5, high: 2.0 }, criticalRange: { high: 4.0 },
    category: 'Metabolic',
    interpretation: {
      normal: { range: '0.5-2.0', meaning: 'Normal lactate', action: 'No tissue hypoperfusion detected.' },
      elevated: { range: '2.1-3.9', meaning: 'Elevated lactate', action: 'Possible tissue hypoperfusion or metabolic stress. Evaluate volume status, cardiac output, sepsis. Serial monitoring recommended.' },
      critical_high: { range: '≥4.0', meaning: 'Severe lactic acidosis', action: 'EMERGENCY. Indicates significant tissue hypoperfusion or metabolic crisis. Aggressive fluid resuscitation. Evaluate for sepsis, shock, mesenteric ischemia. ICU admission.' }
    }
  },
  // Chloride
  {
    testCode: 'CL', testName: 'Chloride', aliases: ['chloride', 'cl', 'serum chloride'],
    unit: 'mEq/L', normalRange: { low: 96, high: 106 }, criticalRange: { low: 80, high: 120 },
    category: 'Electrolytes',
    interpretation: {
      critical_low: { range: '<80', meaning: 'Severe hypochloremia', action: 'EMERGENCY. Evaluate for severe vomiting, nasogastric suction, metabolic alkalosis. IV normal saline.' },
      low: { range: '80-95', meaning: 'Hypochloremia', action: 'Often accompanies metabolic alkalosis. Evaluate for vomiting, diuretic use, SIADH. Check sodium, bicarbonate.' },
      normal: { range: '96-106', meaning: 'Normal chloride', action: 'No action required.' },
      high: { range: '107-119', meaning: 'Hyperchloremia', action: 'Often indicates non-anion gap metabolic acidosis. Evaluate for diarrhea, renal tubular acidosis, excessive normal saline administration.' },
      critical_high: { range: '≥120', meaning: 'Severe hyperchloremia', action: 'EMERGENCY. Evaluate for severe dehydration, diabetes insipidus, or excessive saline administration. Check acid-base status.' }
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

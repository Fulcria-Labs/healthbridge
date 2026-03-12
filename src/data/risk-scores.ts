/**
 * Clinical risk score calculators implementing validated medical scoring systems.
 * Each score includes interpretation guidelines and evidence references.
 */

export interface RiskScoreResult {
  scoreName: string;
  score: number;
  maxScore: number;
  riskLevel: string;
  interpretation: string;
  recommendation: string;
  components: Record<string, { value: number; description: string }>;
  reference: string;
}

export interface ScoreInput {
  [key: string]: number | boolean | string;
}

/**
 * CHA₂DS₂-VASc Score for Atrial Fibrillation Stroke Risk
 */
export function calculateCHA2DS2VASc(input: {
  age: number;
  sex: 'male' | 'female';
  chf: boolean;
  hypertension: boolean;
  stroke_tia_history: boolean;
  vascular_disease: boolean;
  diabetes: boolean;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  // CHF (1 point)
  const chfScore = input.chf ? 1 : 0;
  components['C - Congestive Heart Failure'] = { value: chfScore, description: input.chf ? 'Present' : 'Absent' };
  score += chfScore;

  // Hypertension (1 point)
  const htScore = input.hypertension ? 1 : 0;
  components['H - Hypertension'] = { value: htScore, description: input.hypertension ? 'Present' : 'Absent' };
  score += htScore;

  // Age ≥75 (2 points) or 65-74 (1 point)
  let ageScore = 0;
  let ageDesc = '';
  if (input.age >= 75) {
    ageScore = 2;
    ageDesc = `${input.age} years (≥75)`;
  } else if (input.age >= 65) {
    ageScore = 1;
    ageDesc = `${input.age} years (65-74)`;
  } else {
    ageDesc = `${input.age} years (<65)`;
  }
  components['A₂ - Age'] = { value: ageScore, description: ageDesc };
  score += ageScore;

  // Diabetes (1 point)
  const dmScore = input.diabetes ? 1 : 0;
  components['D - Diabetes'] = { value: dmScore, description: input.diabetes ? 'Present' : 'Absent' };
  score += dmScore;

  // Stroke/TIA (2 points)
  const strokeScore = input.stroke_tia_history ? 2 : 0;
  components['S₂ - Stroke/TIA History'] = { value: strokeScore, description: input.stroke_tia_history ? 'Present' : 'Absent' };
  score += strokeScore;

  // Vascular disease (1 point)
  const vascScore = input.vascular_disease ? 1 : 0;
  components['V - Vascular Disease'] = { value: vascScore, description: input.vascular_disease ? 'Present' : 'Absent' };
  score += vascScore;

  // Sex category - female (1 point)
  const sexScore = input.sex === 'female' ? 1 : 0;
  components['Sc - Sex Category'] = { value: sexScore, description: input.sex === 'female' ? 'Female' : 'Male' };
  score += sexScore;

  // Annual stroke risk estimates
  const strokeRiskMap: Record<number, string> = {
    0: '0.2%', 1: '0.6%', 2: '2.2%', 3: '3.2%', 4: '4.8%',
    5: '7.2%', 6: '9.7%', 7: '11.2%', 8: '10.8%', 9: '12.2%'
  };

  let riskLevel: string;
  let recommendation: string;
  if (score === 0 && input.sex === 'male') {
    riskLevel = 'Low';
    recommendation = 'No antithrombotic therapy recommended.';
  } else if (score === 1 && input.sex === 'male') {
    riskLevel = 'Low-Moderate';
    recommendation = 'Consider oral anticoagulation. Discuss risks and benefits with patient.';
  } else if (score === 1 && input.sex === 'female') {
    riskLevel = 'Low';
    recommendation = 'No antithrombotic therapy recommended (lone female sex criterion).';
  } else {
    riskLevel = score <= 3 ? 'Moderate' : 'High';
    recommendation = 'Oral anticoagulation recommended (DOAC preferred over warfarin in most patients).';
  }

  const annualRisk = strokeRiskMap[Math.min(score, 9)] ?? '>12%';

  return {
    scoreName: 'CHA₂DS₂-VASc',
    score,
    maxScore: 9,
    riskLevel,
    interpretation: `Score ${score}/9. Estimated annual stroke risk: ${annualRisk}.`,
    recommendation,
    components,
    reference: 'Lip GY, et al. Chest 2010;137(2):263-272'
  };
}

/**
 * HEART Score for Major Cardiac Events in Chest Pain
 */
export function calculateHEART(input: {
  history: 'slightly_suspicious' | 'moderately_suspicious' | 'highly_suspicious';
  ecg: 'normal' | 'non_specific_changes' | 'significant_st_deviation';
  age: number;
  risk_factors: number; // 0, 1-2, or 3+ (count of: HTN, DM, hyperlipidemia, smoking, obesity, family hx)
  troponin: 'normal' | 'mildly_elevated' | 'significantly_elevated'; // relative to normal limit
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  // History
  const historyMap = { slightly_suspicious: 0, moderately_suspicious: 1, highly_suspicious: 2 };
  const historyScore = historyMap[input.history];
  components['H - History'] = { value: historyScore, description: input.history.replace(/_/g, ' ') };
  score += historyScore;

  // ECG
  const ecgMap = { normal: 0, non_specific_changes: 1, significant_st_deviation: 2 };
  const ecgScore = ecgMap[input.ecg];
  components['E - ECG'] = { value: ecgScore, description: input.ecg.replace(/_/g, ' ') };
  score += ecgScore;

  // Age
  let ageScore: number;
  let ageDesc: string;
  if (input.age < 45) { ageScore = 0; ageDesc = `${input.age} years (<45)`; }
  else if (input.age <= 64) { ageScore = 1; ageDesc = `${input.age} years (45-64)`; }
  else { ageScore = 2; ageDesc = `${input.age} years (≥65)`; }
  components['A - Age'] = { value: ageScore, description: ageDesc };
  score += ageScore;

  // Risk factors
  let rfScore: number;
  let rfDesc: string;
  if (input.risk_factors === 0) { rfScore = 0; rfDesc = 'No risk factors'; }
  else if (input.risk_factors <= 2) { rfScore = 1; rfDesc = `${input.risk_factors} risk factor(s)`; }
  else { rfScore = 2; rfDesc = `${input.risk_factors} risk factors (≥3)`; }
  components['R - Risk Factors'] = { value: rfScore, description: rfDesc };
  score += rfScore;

  // Troponin
  const tropMap = { normal: 0, mildly_elevated: 1, significantly_elevated: 2 };
  const tropScore = tropMap[input.troponin];
  components['T - Troponin'] = { value: tropScore, description: input.troponin.replace(/_/g, ' ') };
  score += tropScore;

  let riskLevel: string;
  let recommendation: string;
  if (score <= 3) {
    riskLevel = 'Low';
    recommendation = 'MACE risk 0.9-1.7%. Consider early discharge with outpatient follow-up. Repeat troponin if borderline.';
  } else if (score <= 6) {
    riskLevel = 'Moderate';
    recommendation = 'MACE risk 12-16.6%. Admit for observation, serial troponins, and non-invasive testing.';
  } else {
    riskLevel = 'High';
    recommendation = 'MACE risk 50-65%. Early invasive strategy recommended. Cardiology consultation.';
  }

  return {
    scoreName: 'HEART Score',
    score,
    maxScore: 10,
    riskLevel,
    interpretation: `Score ${score}/10. ${riskLevel} risk for Major Adverse Cardiac Events (MACE) at 6 weeks.`,
    recommendation,
    components,
    reference: 'Six AJ, et al. Neth Heart J 2008;16:191-196'
  };
}

/**
 * Wells Score for Pulmonary Embolism
 */
export function calculateWellsPE(input: {
  clinical_signs_dvt: boolean;
  pe_most_likely_diagnosis: boolean;
  heart_rate_over_100: boolean;
  immobilization_or_surgery: boolean;
  previous_dvt_pe: boolean;
  hemoptysis: boolean;
  malignancy: boolean;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  const criteria: Array<{ key: keyof typeof input; points: number; label: string }> = [
    { key: 'clinical_signs_dvt', points: 3, label: 'Clinical signs/symptoms of DVT' },
    { key: 'pe_most_likely_diagnosis', points: 3, label: 'PE is #1 diagnosis or equally likely' },
    { key: 'heart_rate_over_100', points: 1.5, label: 'Heart rate >100 bpm' },
    { key: 'immobilization_or_surgery', points: 1.5, label: 'Immobilization/surgery in past 4 weeks' },
    { key: 'previous_dvt_pe', points: 1.5, label: 'Previous DVT/PE' },
    { key: 'hemoptysis', points: 1, label: 'Hemoptysis' },
    { key: 'malignancy', points: 1, label: 'Malignancy (treatment within 6 months)' },
  ];

  for (const criterion of criteria) {
    const present = input[criterion.key];
    const points = present ? criterion.points : 0;
    components[criterion.label] = { value: points, description: present ? 'Present' : 'Absent' };
    score += points;
  }

  let riskLevel: string;
  let recommendation: string;
  if (score <= 1) {
    riskLevel = 'Low';
    recommendation = 'PE probability ~1.3%. Consider D-dimer to rule out. If negative, PE effectively excluded.';
  } else if (score <= 4) {
    riskLevel = 'Moderate';
    recommendation = 'PE probability ~16.2%. D-dimer testing recommended. If positive, CT pulmonary angiography (CTPA) indicated.';
  } else {
    riskLevel = 'High';
    recommendation = 'PE probability ~40.6%. Proceed directly to CTPA. Consider empiric anticoagulation while awaiting imaging.';
  }

  return {
    scoreName: 'Wells Score for PE',
    score,
    maxScore: 12.5,
    riskLevel,
    interpretation: `Score ${score}/12.5. ${riskLevel} clinical probability for pulmonary embolism.`,
    recommendation,
    components,
    reference: 'Wells PS, et al. Thromb Haemost 2000;83:416-420'
  };
}

/**
 * MELD Score for End-Stage Liver Disease
 */
export function calculateMELD(input: {
  creatinine: number;     // mg/dL
  bilirubin: number;      // mg/dL
  inr: number;            // INR value
  sodium?: number;        // mEq/L (for MELD-Na)
  on_dialysis?: boolean;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};

  // Bound values per MELD specification
  let creatinine = Math.max(1, Math.min(4, input.creatinine));
  if (input.on_dialysis) creatinine = 4;
  const bilirubin = Math.max(1, input.bilirubin);
  const inr = Math.max(1, input.inr);

  components['Creatinine'] = { value: input.creatinine, description: `${input.creatinine} mg/dL${input.on_dialysis ? ' (dialysis, set to 4)' : ''}` };
  components['Bilirubin'] = { value: input.bilirubin, description: `${input.bilirubin} mg/dL` };
  components['INR'] = { value: input.inr, description: `${input.inr}` };

  // MELD = 10 × (0.957 × ln(Cr) + 0.378 × ln(Bili) + 1.120 × ln(INR) + 0.643)
  let meld = 10 * (0.957 * Math.log(creatinine) + 0.378 * Math.log(bilirubin) + 1.120 * Math.log(inr) + 0.643);
  meld = Math.round(meld);
  meld = Math.max(6, Math.min(40, meld));

  // MELD-Na if sodium provided
  let meldNa = meld;
  if (input.sodium !== undefined) {
    const na = Math.max(125, Math.min(137, input.sodium));
    components['Sodium'] = { value: input.sodium, description: `${input.sodium} mEq/L` };
    meldNa = meld + 1.32 * (137 - na) - 0.033 * meld * (137 - na);
    meldNa = Math.round(Math.max(6, Math.min(40, meldNa)));
  }

  const finalScore = input.sodium !== undefined ? meldNa : meld;

  // 3-month mortality estimates
  let riskLevel: string;
  let mortality: string;
  let recommendation: string;
  if (finalScore <= 9) {
    riskLevel = 'Low'; mortality = '1.9%';
    recommendation = 'Low priority for transplant listing. Continue medical management.';
  } else if (finalScore <= 19) {
    riskLevel = 'Moderate'; mortality = '6%';
    recommendation = 'Consider transplant evaluation. Regular MELD monitoring.';
  } else if (finalScore <= 29) {
    riskLevel = 'High'; mortality = '19.6%';
    recommendation = 'Transplant listing recommended. Intensify medical management.';
  } else {
    riskLevel = 'Very High'; mortality = '52.6-71.3%';
    recommendation = 'Urgent transplant consideration. ICU-level care may be needed.';
  }

  const scoreName = input.sodium !== undefined ? 'MELD-Na' : 'MELD';

  return {
    scoreName,
    score: finalScore,
    maxScore: 40,
    riskLevel,
    interpretation: `${scoreName} Score ${finalScore}/40. Estimated 3-month mortality: ${mortality}.`,
    recommendation,
    components,
    reference: 'Kamath PS, et al. Hepatology 2001;33:464-470'
  };
}

/**
 * CURB-65 Score for Community-Acquired Pneumonia Severity
 */
export function calculateCURB65(input: {
  confusion: boolean;
  bun_over_19: boolean;       // BUN > 19 mg/dL (or urea > 7 mmol/L)
  respiratory_rate_over_30: boolean;
  systolic_bp_under_90: boolean;
  diastolic_bp_under_60: boolean;
  age_65_or_over: boolean;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  const lowBP = input.systolic_bp_under_90 || input.diastolic_bp_under_60;

  const criteria: Array<{ present: boolean; label: string }> = [
    { present: input.confusion, label: 'C - Confusion (new onset)' },
    { present: input.bun_over_19, label: 'U - BUN > 19 mg/dL' },
    { present: input.respiratory_rate_over_30, label: 'R - Respiratory rate ≥ 30' },
    { present: lowBP, label: 'B - Blood pressure (SBP <90 or DBP ≤60)' },
    { present: input.age_65_or_over, label: '65 - Age ≥ 65' },
  ];

  for (const criterion of criteria) {
    const points = criterion.present ? 1 : 0;
    components[criterion.label] = { value: points, description: criterion.present ? 'Present' : 'Absent' };
    score += points;
  }

  let riskLevel: string;
  let mortality: string;
  let recommendation: string;
  if (score <= 1) {
    riskLevel = 'Low'; mortality = '1.5%';
    recommendation = 'Consider outpatient treatment. Low risk for 30-day mortality.';
  } else if (score === 2) {
    riskLevel = 'Moderate'; mortality = '9.2%';
    recommendation = 'Consider short inpatient stay or closely supervised outpatient treatment.';
  } else {
    riskLevel = 'High'; mortality = '22%';
    recommendation = 'Hospitalize. Consider ICU admission for scores 4-5.';
  }

  return {
    scoreName: 'CURB-65',
    score,
    maxScore: 5,
    riskLevel,
    interpretation: `CURB-65 Score ${score}/5. Estimated 30-day mortality: ${mortality}.`,
    recommendation,
    components,
    reference: 'Lim WS, et al. Thorax 2003;58:377-382'
  };
}

/**
 * APACHE II simplified (for demonstration - full APACHE II requires 12 physiologic variables)
 * This implements the Glasgow Coma Scale component and age/chronic health scoring
 */
export function calculateGCS(input: {
  eye_opening: 1 | 2 | 3 | 4;       // 1=none, 2=pain, 3=voice, 4=spontaneous
  verbal_response: 1 | 2 | 3 | 4 | 5;  // 1=none, 2=incomprehensible, 3=inappropriate, 4=confused, 5=oriented
  motor_response: 1 | 2 | 3 | 4 | 5 | 6;  // 1=none, 2=extension, 3=flexion, 4=withdrawal, 5=localizes, 6=obeys
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};

  const eyeLabels: Record<number, string> = { 1: 'None', 2: 'To pain', 3: 'To voice', 4: 'Spontaneous' };
  const verbalLabels: Record<number, string> = { 1: 'None', 2: 'Incomprehensible sounds', 3: 'Inappropriate words', 4: 'Confused', 5: 'Oriented' };
  const motorLabels: Record<number, string> = { 1: 'None', 2: 'Extension (decerebrate)', 3: 'Flexion (decorticate)', 4: 'Withdrawal', 5: 'Localizes pain', 6: 'Obeys commands' };

  components['Eye Opening (E)'] = { value: input.eye_opening, description: eyeLabels[input.eye_opening] };
  components['Verbal Response (V)'] = { value: input.verbal_response, description: verbalLabels[input.verbal_response] };
  components['Motor Response (M)'] = { value: input.motor_response, description: motorLabels[input.motor_response] };

  const score = input.eye_opening + input.verbal_response + input.motor_response;

  let riskLevel: string;
  let recommendation: string;
  if (score >= 13) {
    riskLevel = 'Mild brain injury';
    recommendation = 'Monitor neurological status. CT head if indicated by mechanism or findings.';
  } else if (score >= 9) {
    riskLevel = 'Moderate brain injury';
    recommendation = 'CT head required. Consider neurosurgical consultation. ICU monitoring.';
  } else {
    riskLevel = 'Severe brain injury';
    recommendation = 'Intubation may be required (GCS ≤8). Immediate neurosurgical consultation. ICU admission.';
  }

  return {
    scoreName: 'Glasgow Coma Scale',
    score,
    maxScore: 15,
    riskLevel,
    interpretation: `GCS ${score}/15 (E${input.eye_opening}V${input.verbal_response}M${input.motor_response}). ${riskLevel}.`,
    recommendation,
    components,
    reference: 'Teasdale G, Jennett B. Lancet 1974;2:81-84'
  };
}

/**
 * eGFR (CKD-EPI 2021) - Estimated Glomerular Filtration Rate
 * Race-free equation endorsed by NKF/ASN Task Force
 */
export function calculateEGFR(input: {
  creatinine: number;  // mg/dL
  age: number;
  sex: 'male' | 'female';
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};

  components['Creatinine'] = { value: input.creatinine, description: `${input.creatinine} mg/dL` };
  components['Age'] = { value: input.age, description: `${input.age} years` };
  components['Sex'] = { value: input.sex === 'female' ? 0 : 1, description: input.sex };

  // CKD-EPI 2021 (race-free) equation
  let egfr: number;
  const scr = input.creatinine;

  if (input.sex === 'female') {
    const kappa = 0.7;
    const alpha = -0.241;
    const scrOverKappa = scr / kappa;
    egfr = 142 * Math.pow(Math.min(scrOverKappa, 1), alpha) * Math.pow(Math.max(scrOverKappa, 1), -1.200) * Math.pow(0.9938, input.age) * 1.012;
  } else {
    const kappa = 0.9;
    const alpha = -0.302;
    const scrOverKappa = scr / kappa;
    egfr = 142 * Math.pow(Math.min(scrOverKappa, 1), alpha) * Math.pow(Math.max(scrOverKappa, 1), -1.200) * Math.pow(0.9938, input.age);
  }

  egfr = Math.round(egfr);

  let riskLevel: string;
  let ckdStage: string;
  let recommendation: string;

  if (egfr >= 90) {
    riskLevel = 'Normal';
    ckdStage = 'G1 (Normal or high)';
    recommendation = 'Normal kidney function. If proteinuria present, may still indicate CKD. Repeat annually if risk factors.';
  } else if (egfr >= 60) {
    riskLevel = 'Mild';
    ckdStage = 'G2 (Mildly decreased)';
    recommendation = 'Mildly decreased kidney function. Monitor annually. Check urine albumin-to-creatinine ratio. Manage cardiovascular risk factors.';
  } else if (egfr >= 45) {
    riskLevel = 'Moderate';
    ckdStage = 'G3a (Mild-moderate decrease)';
    recommendation = 'Refer to nephrology. Monitor every 6 months. Adjust medications for renal impairment. ACEI/ARB for proteinuria.';
  } else if (egfr >= 30) {
    riskLevel = 'Moderate-Severe';
    ckdStage = 'G3b (Moderate-severe decrease)';
    recommendation = 'Nephrology referral essential. Monitor every 3-6 months. Dose-adjust all renally cleared medications. Screen for CKD complications.';
  } else if (egfr >= 15) {
    riskLevel = 'Severe';
    ckdStage = 'G4 (Severely decreased)';
    recommendation = 'Prepare for renal replacement therapy. Nephrology co-management. Avoid nephrotoxins. Vascular access planning.';
  } else {
    riskLevel = 'Kidney Failure';
    ckdStage = 'G5 (Kidney failure)';
    recommendation = 'Dialysis or transplant evaluation needed. Urgent nephrology if not already engaged.';
  }

  return {
    scoreName: 'eGFR (CKD-EPI 2021)',
    score: egfr,
    maxScore: 120,
    riskLevel,
    interpretation: `eGFR ${egfr} mL/min/1.73m². CKD Stage: ${ckdStage}.`,
    recommendation,
    components,
    reference: 'Inker LA, et al. N Engl J Med 2021;385:1737-1749'
  };
}

/**
 * qSOFA Score for Sepsis Screening
 * Quick Sequential Organ Failure Assessment
 */
export function calculateQSOFA(input: {
  respiratory_rate_22_or_more: boolean;
  altered_mental_status: boolean;
  systolic_bp_100_or_less: boolean;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  const criteria: Array<{ present: boolean; label: string }> = [
    { present: input.respiratory_rate_22_or_more, label: 'Respiratory rate ≥ 22/min' },
    { present: input.altered_mental_status, label: 'Altered mental status (GCS < 15)' },
    { present: input.systolic_bp_100_or_less, label: 'Systolic BP ≤ 100 mmHg' },
  ];

  for (const criterion of criteria) {
    const points = criterion.present ? 1 : 0;
    components[criterion.label] = { value: points, description: criterion.present ? 'Present' : 'Absent' };
    score += points;
  }

  let riskLevel: string;
  let recommendation: string;

  if (score <= 1) {
    riskLevel = 'Low';
    recommendation = 'Low risk of poor outcome. Continue monitoring. qSOFA alone does not diagnose sepsis - use clinical judgment.';
  } else {
    riskLevel = 'High';
    recommendation = 'qSOFA ≥2 associated with 3-14x increased mortality. Evaluate for organ dysfunction (full SOFA). Consider ICU transfer. Obtain lactate, blood cultures. Initiate sepsis bundle if indicated.';
  }

  return {
    scoreName: 'qSOFA',
    score,
    maxScore: 3,
    riskLevel,
    interpretation: `qSOFA ${score}/3. ${riskLevel} risk for sepsis-related poor outcomes.`,
    recommendation,
    components,
    reference: 'Singer M, et al. JAMA 2016;315(8):801-810 (Sepsis-3)'
  };
}

/** Available risk score calculators */
export const availableScores = [
  { name: 'CHA2DS2-VASc', description: 'Stroke risk in atrial fibrillation', function: 'calculateCHA2DS2VASc' },
  { name: 'HEART', description: 'Major cardiac events in chest pain patients', function: 'calculateHEART' },
  { name: 'Wells PE', description: 'Clinical probability of pulmonary embolism', function: 'calculateWellsPE' },
  { name: 'MELD/MELD-Na', description: 'End-stage liver disease severity/transplant priority', function: 'calculateMELD' },
  { name: 'CURB-65', description: 'Community-acquired pneumonia severity', function: 'calculateCURB65' },
  { name: 'GCS', description: 'Glasgow Coma Scale for consciousness level', function: 'calculateGCS' },
  { name: 'eGFR', description: 'Estimated glomerular filtration rate (CKD-EPI 2021)', function: 'calculateEGFR' },
  { name: 'qSOFA', description: 'Quick sepsis-related organ failure assessment', function: 'calculateQSOFA' },
] as const;

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

/**
 * SOFA Score - Sequential Organ Failure Assessment
 * Predicts ICU mortality based on organ dysfunction in 6 systems
 */
export function calculateSOFA(input: {
  pao2_fio2: number;          // PaO2/FiO2 ratio (mmHg)
  on_mechanical_ventilation: boolean;
  platelets: number;          // ×10³/µL
  bilirubin: number;          // mg/dL
  cardiovascular: 'no_hypotension' | 'map_under_70' | 'dopamine_lte_5' | 'dopamine_gt_5_or_epi_lte_0_1' | 'dopamine_gt_15_or_epi_gt_0_1';
  gcs: number;                // Glasgow Coma Scale score (3-15)
  creatinine: number;         // mg/dL
  urine_output_ml_day?: number;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  // Respiration: PaO2/FiO2
  let respScore: number;
  if (input.pao2_fio2 >= 400) { respScore = 0; }
  else if (input.pao2_fio2 >= 300) { respScore = 1; }
  else if (input.pao2_fio2 >= 200) { respScore = 2; }
  else if (input.pao2_fio2 >= 100 && input.on_mechanical_ventilation) { respScore = 3; }
  else if (input.pao2_fio2 >= 100) { respScore = 2; }
  else { respScore = 4; }
  components['Respiration (PaO2/FiO2)'] = { value: respScore, description: `${input.pao2_fio2} mmHg${input.on_mechanical_ventilation ? ' (ventilated)' : ''}` };
  score += respScore;

  // Coagulation: Platelets
  let platScore: number;
  if (input.platelets >= 150) { platScore = 0; }
  else if (input.platelets >= 100) { platScore = 1; }
  else if (input.platelets >= 50) { platScore = 2; }
  else if (input.platelets >= 20) { platScore = 3; }
  else { platScore = 4; }
  components['Coagulation (Platelets)'] = { value: platScore, description: `${input.platelets} ×10³/µL` };
  score += platScore;

  // Liver: Bilirubin
  let liverScore: number;
  if (input.bilirubin < 1.2) { liverScore = 0; }
  else if (input.bilirubin <= 1.9) { liverScore = 1; }
  else if (input.bilirubin <= 5.9) { liverScore = 2; }
  else if (input.bilirubin <= 11.9) { liverScore = 3; }
  else { liverScore = 4; }
  components['Liver (Bilirubin)'] = { value: liverScore, description: `${input.bilirubin} mg/dL` };
  score += liverScore;

  // Cardiovascular
  const cvMap: Record<string, { score: number; desc: string }> = {
    no_hypotension: { score: 0, desc: 'No hypotension' },
    map_under_70: { score: 1, desc: 'MAP < 70 mmHg' },
    dopamine_lte_5: { score: 2, desc: 'Dopamine ≤5 µg/kg/min' },
    dopamine_gt_5_or_epi_lte_0_1: { score: 3, desc: 'Dopamine >5 or epinephrine ≤0.1 µg/kg/min' },
    dopamine_gt_15_or_epi_gt_0_1: { score: 4, desc: 'Dopamine >15 or epinephrine >0.1 µg/kg/min' },
  };
  const cv = cvMap[input.cardiovascular];
  components['Cardiovascular'] = { value: cv.score, description: cv.desc };
  score += cv.score;

  // CNS: GCS
  let cnsScore: number;
  if (input.gcs >= 15) { cnsScore = 0; }
  else if (input.gcs >= 13) { cnsScore = 1; }
  else if (input.gcs >= 10) { cnsScore = 2; }
  else if (input.gcs >= 6) { cnsScore = 3; }
  else { cnsScore = 4; }
  components['CNS (GCS)'] = { value: cnsScore, description: `GCS ${input.gcs}` };
  score += cnsScore;

  // Renal: Creatinine or urine output
  let renalScore: number;
  if (input.urine_output_ml_day !== undefined && input.urine_output_ml_day < 200) {
    renalScore = 4;
  } else if (input.urine_output_ml_day !== undefined && input.urine_output_ml_day < 500) {
    renalScore = Math.max(3, input.creatinine >= 3.5 ? 3 : input.creatinine >= 2.0 ? 2 : input.creatinine >= 1.2 ? 1 : 0);
  } else if (input.creatinine >= 5.0) { renalScore = 4; }
  else if (input.creatinine >= 3.5) { renalScore = 3; }
  else if (input.creatinine >= 2.0) { renalScore = 2; }
  else if (input.creatinine >= 1.2) { renalScore = 1; }
  else { renalScore = 0; }
  let renalDesc = `${input.creatinine} mg/dL`;
  if (input.urine_output_ml_day !== undefined) renalDesc += `, UO ${input.urine_output_ml_day} mL/day`;
  components['Renal (Creatinine)'] = { value: renalScore, description: renalDesc };
  score += renalScore;

  // ICU mortality estimates based on SOFA score
  let riskLevel: string;
  let mortality: string;
  let recommendation: string;
  if (score <= 1) {
    riskLevel = 'Low'; mortality = '<3.3%';
    recommendation = 'Low organ dysfunction. Continue monitoring. Reassess SOFA every 24 hours.';
  } else if (score <= 5) {
    riskLevel = 'Low-Moderate'; mortality = '<10%';
    recommendation = 'Mild organ dysfunction. ICU monitoring. Identify and treat underlying cause.';
  } else if (score <= 9) {
    riskLevel = 'Moderate'; mortality = '15-20%';
    recommendation = 'Moderate organ dysfunction. Aggressive ICU management. Consider source control. Reassess q24h.';
  } else if (score <= 14) {
    riskLevel = 'High'; mortality = '40-50%';
    recommendation = 'Severe organ dysfunction. Multi-organ support required. Goals of care discussion may be appropriate.';
  } else {
    riskLevel = 'Very High'; mortality = '>80%';
    recommendation = 'Critical multi-organ failure. Maximum ICU support. Palliative care consultation recommended.';
  }

  return {
    scoreName: 'SOFA',
    score,
    maxScore: 24,
    riskLevel,
    interpretation: `SOFA Score ${score}/24. Estimated ICU mortality: ${mortality}. ${score >= 2 ? 'SOFA ≥2 indicates organ dysfunction consistent with sepsis diagnosis (Sepsis-3).' : ''}`,
    recommendation,
    components,
    reference: 'Vincent JL, et al. Intensive Care Med 1996;22:707-710; Singer M, et al. JAMA 2016 (Sepsis-3)',
  };
}

/**
 * Child-Pugh Score for Chronic Liver Disease Classification
 */
export function calculateChildPugh(input: {
  bilirubin: number;                     // mg/dL
  albumin: number;                       // g/dL
  inr: number;
  ascites: 'none' | 'mild' | 'moderate_severe';
  encephalopathy: 'none' | 'grade_1_2' | 'grade_3_4';
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  // Bilirubin
  let bilScore: number;
  if (input.bilirubin < 2) { bilScore = 1; }
  else if (input.bilirubin <= 3) { bilScore = 2; }
  else { bilScore = 3; }
  components['Bilirubin'] = { value: bilScore, description: `${input.bilirubin} mg/dL` };
  score += bilScore;

  // Albumin
  let albScore: number;
  if (input.albumin > 3.5) { albScore = 1; }
  else if (input.albumin >= 2.8) { albScore = 2; }
  else { albScore = 3; }
  components['Albumin'] = { value: albScore, description: `${input.albumin} g/dL` };
  score += albScore;

  // INR
  let inrScore: number;
  if (input.inr < 1.7) { inrScore = 1; }
  else if (input.inr <= 2.3) { inrScore = 2; }
  else { inrScore = 3; }
  components['INR'] = { value: inrScore, description: `${input.inr}` };
  score += inrScore;

  // Ascites
  const ascitesMap: Record<string, { score: number; desc: string }> = {
    none: { score: 1, desc: 'None' },
    mild: { score: 2, desc: 'Mild (diuretic-responsive)' },
    moderate_severe: { score: 3, desc: 'Moderate to severe (refractory)' },
  };
  const asc = ascitesMap[input.ascites];
  components['Ascites'] = { value: asc.score, description: asc.desc };
  score += asc.score;

  // Encephalopathy
  const encMap: Record<string, { score: number; desc: string }> = {
    none: { score: 1, desc: 'None' },
    grade_1_2: { score: 2, desc: 'Grade I-II (mild confusion, asterixis)' },
    grade_3_4: { score: 3, desc: 'Grade III-IV (somnolence to coma)' },
  };
  const enc = encMap[input.encephalopathy];
  components['Encephalopathy'] = { value: enc.score, description: enc.desc };
  score += enc.score;

  let cpClass: string;
  let riskLevel: string;
  let survival: string;
  let recommendation: string;
  if (score <= 6) {
    cpClass = 'A'; riskLevel = 'Well-compensated'; survival = '1-year: 100%, 2-year: 85%';
    recommendation = 'Well-compensated cirrhosis. Standard medical management. Surveillance for HCC and varices.';
  } else if (score <= 9) {
    cpClass = 'B'; riskLevel = 'Significant functional compromise'; survival = '1-year: 81%, 2-year: 57%';
    recommendation = 'Significant hepatic dysfunction. Consider transplant evaluation. Manage complications (ascites, encephalopathy). Avoid hepatotoxic medications.';
  } else {
    cpClass = 'C'; riskLevel = 'Decompensated'; survival = '1-year: 45%, 2-year: 35%';
    recommendation = 'Decompensated cirrhosis. Urgent transplant evaluation. Maximum medical therapy. High surgical risk (perioperative mortality >50%).';
  }

  return {
    scoreName: 'Child-Pugh',
    score,
    maxScore: 15,
    riskLevel,
    interpretation: `Child-Pugh Score ${score}/15, Class ${cpClass}. ${riskLevel} disease. Survival: ${survival}.`,
    recommendation,
    components,
    reference: 'Pugh RN, et al. Br J Surg 1973;60:646-649',
  };
}

/**
 * ASCVD Risk Calculator - Pooled Cohort Equations (2013 ACC/AHA)
 * 10-year atherosclerotic cardiovascular disease risk
 */
export function calculateASCVD(input: {
  age: number;
  sex: 'male' | 'female';
  race: 'white' | 'african_american' | 'other';
  total_cholesterol: number;   // mg/dL
  hdl_cholesterol: number;     // mg/dL
  systolic_bp: number;         // mmHg
  on_bp_treatment: boolean;
  diabetes: boolean;
  smoker: boolean;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};

  components['Age'] = { value: input.age, description: `${input.age} years` };
  components['Sex'] = { value: input.sex === 'male' ? 1 : 0, description: input.sex };
  components['Race'] = { value: 0, description: input.race.replace(/_/g, ' ') };
  components['Total Cholesterol'] = { value: input.total_cholesterol, description: `${input.total_cholesterol} mg/dL` };
  components['HDL Cholesterol'] = { value: input.hdl_cholesterol, description: `${input.hdl_cholesterol} mg/dL` };
  components['Systolic BP'] = { value: input.systolic_bp, description: `${input.systolic_bp} mmHg${input.on_bp_treatment ? ' (treated)' : ''}` };
  components['Diabetes'] = { value: input.diabetes ? 1 : 0, description: input.diabetes ? 'Yes' : 'No' };
  components['Smoker'] = { value: input.smoker ? 1 : 0, description: input.smoker ? 'Current' : 'No' };

  // Pooled Cohort Equations coefficients
  const lnAge = Math.log(input.age);
  const lnTC = Math.log(input.total_cholesterol);
  const lnHDL = Math.log(input.hdl_cholesterol);
  const lnSBP = Math.log(input.systolic_bp);
  const lnAgeSq = lnAge * lnAge;

  let sumCoeff: number;
  let meanCoeff: number;
  let baseSurvival: number;

  const isAA = input.race === 'african_american';

  if (input.sex === 'male' && !isAA) {
    // White male coefficients
    sumCoeff = 12.344 * lnAge + 11.853 * lnTC + -2.664 * lnAge * lnTC
      + -7.990 * lnHDL + 1.769 * lnAge * lnHDL
      + (input.on_bp_treatment ? 1.797 * lnSBP : 1.764 * lnSBP)
      + 7.837 * (input.smoker ? 1 : 0) + -1.795 * lnAge * (input.smoker ? 1 : 0)
      + 0.658 * (input.diabetes ? 1 : 0);
    meanCoeff = 61.18;
    baseSurvival = 0.9144;
  } else if (input.sex === 'male' && isAA) {
    // African American male coefficients
    sumCoeff = 2.469 * lnAge + 0.302 * lnTC
      + -0.307 * lnHDL
      + (input.on_bp_treatment ? 1.916 * lnSBP : 1.809 * lnSBP)
      + 0.549 * (input.smoker ? 1 : 0)
      + 0.645 * (input.diabetes ? 1 : 0);
    meanCoeff = 19.54;
    baseSurvival = 0.8954;
  } else if (input.sex === 'female' && !isAA) {
    // White female coefficients
    sumCoeff = -29.799 * lnAge + 4.884 * lnAgeSq + 13.540 * lnTC + -3.114 * lnAge * lnTC
      + -13.578 * lnHDL + 3.149 * lnAge * lnHDL
      + (input.on_bp_treatment ? 2.019 * lnSBP : 1.957 * lnSBP)
      + 7.574 * (input.smoker ? 1 : 0) + -1.665 * lnAge * (input.smoker ? 1 : 0)
      + 0.661 * (input.diabetes ? 1 : 0);
    meanCoeff = -29.18;
    baseSurvival = 0.9665;
  } else {
    // African American female coefficients
    sumCoeff = 17.114 * lnAge + 0.940 * lnTC
      + -18.920 * lnHDL + 4.475 * lnAge * lnHDL
      + (input.on_bp_treatment ? 29.291 * lnSBP + -6.432 * lnAge * lnSBP : 27.820 * lnSBP + -6.087 * lnAge * lnSBP)
      + 0.691 * (input.smoker ? 1 : 0)
      + 0.874 * (input.diabetes ? 1 : 0);
    meanCoeff = 86.61;
    baseSurvival = 0.9533;
  }

  const risk10yr = 1 - Math.pow(baseSurvival, Math.exp(sumCoeff - meanCoeff));
  const riskPct = Math.max(0, Math.min(100, Math.round(risk10yr * 1000) / 10));
  const riskScore = Math.round(riskPct * 10); // Store as integer tenths for score field

  let riskLevel: string;
  let recommendation: string;
  if (riskPct < 5) {
    riskLevel = 'Low';
    recommendation = 'Low 10-year ASCVD risk. Emphasize lifestyle modifications. Statin therapy generally not indicated unless LDL ≥190 mg/dL.';
  } else if (riskPct < 7.5) {
    riskLevel = 'Borderline';
    recommendation = 'Borderline risk. Consider risk-enhancing factors (family history, hsCRP, CAC score). Lifestyle modifications. Discuss moderate-intensity statin.';
  } else if (riskPct < 20) {
    riskLevel = 'Intermediate';
    recommendation = 'Intermediate risk. Moderate-intensity statin recommended. Consider coronary artery calcium (CAC) scoring for shared decision-making. Optimize BP and lifestyle.';
  } else {
    riskLevel = 'High';
    recommendation = 'High 10-year ASCVD risk (≥20%). High-intensity statin indicated. Aggressive risk factor management. Consider aspirin if bleeding risk is low. BP target <130/80.';
  }

  return {
    scoreName: 'ASCVD Risk (10-year)',
    score: riskPct,
    maxScore: 100,
    riskLevel,
    interpretation: `Estimated 10-year ASCVD risk: ${riskPct}%. ${riskLevel} risk category.`,
    recommendation,
    components,
    reference: 'Goff DC, et al. J Am Coll Cardiol 2014;63(25):2935-2959 (2013 ACC/AHA Pooled Cohort Equations)',
  };
}

/**
 * NEWS2 - National Early Warning Score 2
 * Used in UK NHS and internationally for detecting acute deterioration in adult patients.
 * Royal College of Physicians 2017.
 */
export function calculateNEWS2(input: {
  respiratory_rate: number;         // breaths/min
  spo2: number;                     // %
  on_supplemental_o2: boolean;
  spo2_scale2: boolean;             // true for patients with hypercapnic respiratory failure (target SpO2 88-92%)
  systolic_bp: number;              // mmHg
  heart_rate: number;               // bpm
  consciousness: 'alert' | 'confusion' | 'voice' | 'pain' | 'unresponsive'; // ACVPU scale
  temperature: number;              // °C
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  // Respiratory rate scoring
  let rrScore: number;
  if (input.respiratory_rate <= 8) { rrScore = 3; }
  else if (input.respiratory_rate <= 11) { rrScore = 1; }
  else if (input.respiratory_rate <= 20) { rrScore = 0; }
  else if (input.respiratory_rate <= 24) { rrScore = 2; }
  else { rrScore = 3; }
  components['Respiratory rate'] = { value: rrScore, description: `${input.respiratory_rate}/min` };
  score += rrScore;

  // SpO2 scoring depends on Scale 1 vs Scale 2
  let spo2Score: number;
  if (input.spo2_scale2) {
    // Scale 2: for patients with hypercapnic respiratory failure (target 88-92%)
    if (input.spo2 <= 83) { spo2Score = 3; }
    else if (input.spo2 <= 85) { spo2Score = 2; }
    else if (input.spo2 <= 87) { spo2Score = 1; }
    else if (input.spo2 <= 92) { spo2Score = 0; }
    else if (input.spo2 <= 94 && input.on_supplemental_o2) { spo2Score = 1; }
    else if (input.spo2 <= 96 && input.on_supplemental_o2) { spo2Score = 2; }
    else if (input.spo2 >= 97 && input.on_supplemental_o2) { spo2Score = 3; }
    else { spo2Score = 0; } // ≥93 on room air
    components['SpO₂ (Scale 2)'] = { value: spo2Score, description: `${input.spo2}%${input.on_supplemental_o2 ? ' (on O₂)' : ' (room air)'}` };
  } else {
    // Scale 1: standard
    if (input.spo2 <= 91) { spo2Score = 3; }
    else if (input.spo2 <= 93) { spo2Score = 2; }
    else if (input.spo2 <= 95) { spo2Score = 1; }
    else { spo2Score = 0; }
    components['SpO₂ (Scale 1)'] = { value: spo2Score, description: `${input.spo2}%` };
  }
  score += spo2Score;

  // Supplemental O2
  const o2Score = input.on_supplemental_o2 && !input.spo2_scale2 ? 2 : 0;
  if (!input.spo2_scale2) {
    components['Supplemental O₂'] = { value: o2Score, description: input.on_supplemental_o2 ? 'Yes' : 'No' };
    score += o2Score;
  }

  // Systolic BP
  let bpScore: number;
  if (input.systolic_bp <= 90) { bpScore = 3; }
  else if (input.systolic_bp <= 100) { bpScore = 2; }
  else if (input.systolic_bp <= 110) { bpScore = 1; }
  else if (input.systolic_bp <= 219) { bpScore = 0; }
  else { bpScore = 3; }
  components['Systolic BP'] = { value: bpScore, description: `${input.systolic_bp} mmHg` };
  score += bpScore;

  // Heart rate
  let hrScore: number;
  if (input.heart_rate <= 40) { hrScore = 3; }
  else if (input.heart_rate <= 50) { hrScore = 1; }
  else if (input.heart_rate <= 90) { hrScore = 0; }
  else if (input.heart_rate <= 110) { hrScore = 1; }
  else if (input.heart_rate <= 130) { hrScore = 2; }
  else { hrScore = 3; }
  components['Heart rate'] = { value: hrScore, description: `${input.heart_rate} bpm` };
  score += hrScore;

  // Consciousness (ACVPU)
  let consScore: number;
  const consMap: Record<string, { score: number; desc: string }> = {
    alert: { score: 0, desc: 'Alert' },
    confusion: { score: 3, desc: 'New confusion' },
    voice: { score: 3, desc: 'Responds to voice' },
    pain: { score: 3, desc: 'Responds to pain' },
    unresponsive: { score: 3, desc: 'Unresponsive' },
  };
  const cons = consMap[input.consciousness];
  consScore = cons.score;
  components['Consciousness (ACVPU)'] = { value: consScore, description: cons.desc };
  score += consScore;

  // Temperature
  let tempScore: number;
  if (input.temperature <= 35.0) { tempScore = 3; }
  else if (input.temperature <= 36.0) { tempScore = 1; }
  else if (input.temperature <= 38.0) { tempScore = 0; }
  else if (input.temperature <= 39.0) { tempScore = 1; }
  else { tempScore = 2; }
  components['Temperature'] = { value: tempScore, description: `${input.temperature}°C` };
  score += tempScore;

  // Clinical response thresholds
  let riskLevel: string;
  let recommendation: string;

  // Check for individual parameter score of 3 (single extreme trigger)
  const hasExtremeParameter = [rrScore, spo2Score, o2Score, bpScore, hrScore, consScore, tempScore].some(s => s >= 3);

  if (score >= 7) {
    riskLevel = 'High';
    recommendation = 'Emergency response. Continuous monitoring of vital signs. Urgent assessment by critical care team. Consider ICU transfer. Frequency of monitoring: continuous.';
  } else if (score >= 5) {
    riskLevel = 'Medium';
    recommendation = 'Urgent response. Increase monitoring to at least hourly. Urgent assessment by clinician with critical care competencies. Consider higher level of care. Frequency: minimum every hour.';
  } else if (hasExtremeParameter) {
    riskLevel = 'Low-Medium';
    recommendation = 'Urgent ward-based response. Single parameter score of 3 requires urgent assessment by a clinician. Increase monitoring to minimum every hour. Consider cause.';
  } else if (score >= 1) {
    riskLevel = 'Low';
    recommendation = 'Ward-based response. Inform registered nurse. Assess by competent ward nurse to decide frequency of monitoring and escalation. Minimum every 4-6 hours.';
  } else {
    riskLevel = 'Low';
    recommendation = 'Continue routine monitoring. Minimum every 12 hours. NEWS2 = 0: no immediate clinical concern.';
  }

  return {
    scoreName: 'NEWS2',
    score,
    maxScore: 20,
    riskLevel,
    interpretation: `NEWS2 Score ${score}/20. ${riskLevel} clinical risk.${hasExtremeParameter && score < 5 ? ' Single extreme parameter detected - requires urgent assessment.' : ''}`,
    recommendation,
    components,
    reference: 'Royal College of Physicians. National Early Warning Score (NEWS) 2. London: RCP, 2017.',
  };
}

/**
 * HAS-BLED Score for Bleeding Risk on Anticoagulation
 * Pairs with CHA₂DS₂-VASc for anticoagulation decision-making.
 */
export function calculateHASBLED(input: {
  hypertension: boolean;
  renal_disease: boolean;
  liver_disease: boolean;
  stroke_history: boolean;
  bleeding_history: boolean;
  labile_inr: boolean;
  age_over_65: boolean;
  antiplatelet_or_nsaid: boolean;
  alcohol: boolean;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  const items: Array<{ key: string; label: string; field: keyof typeof input }> = [
    { key: 'H', label: 'Hypertension (uncontrolled SBP >160)', field: 'hypertension' },
    { key: 'A', label: 'Abnormal renal function', field: 'renal_disease' },
    { key: 'A', label: 'Abnormal liver function', field: 'liver_disease' },
    { key: 'S', label: 'Stroke history', field: 'stroke_history' },
    { key: 'B', label: 'Bleeding history/predisposition', field: 'bleeding_history' },
    { key: 'L', label: 'Labile INR (TTR <60%)', field: 'labile_inr' },
    { key: 'E', label: 'Elderly (age >65)', field: 'age_over_65' },
    { key: 'D', label: 'Drugs (antiplatelet/NSAID)', field: 'antiplatelet_or_nsaid' },
    { key: 'D', label: 'Alcohol excess', field: 'alcohol' },
  ];

  items.forEach((item, i) => {
    const val = input[item.field] ? 1 : 0;
    components[`${item.key} - ${item.label}`] = { value: val, description: input[item.field] ? 'Present' : 'Absent' };
    score += val;
  });

  let riskLevel: string;
  let recommendation: string;
  if (score >= 3) {
    riskLevel = 'High';
    recommendation = 'High bleeding risk. Address modifiable risk factors (uncontrolled BP, labile INR, concomitant antiplatelet/NSAID, alcohol). High HAS-BLED is NOT a contraindication to anticoagulation — it identifies patients needing closer monitoring and risk factor modification.';
  } else {
    riskLevel = 'Low';
    recommendation = 'Low-moderate bleeding risk. Proceed with anticoagulation if indicated by CHA₂DS₂-VASc. Standard monitoring. Review modifiable risk factors.';
  }

  return {
    scoreName: 'HAS-BLED',
    score,
    maxScore: 9,
    riskLevel,
    interpretation: `HAS-BLED Score ${score}/9. ${riskLevel} bleeding risk. Annual major bleeding rate: ${score <= 1 ? '1.0-3.4%' : score === 2 ? '4.1%' : score === 3 ? '5.8%' : score === 4 ? '8.7%' : '>10%'}.`,
    recommendation,
    components,
    reference: 'Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding. Chest. 2010;138(5):1093-100.',
  };
}

/**
 * TIMI Risk Score for UA/NSTEMI
 * Thrombolysis in Myocardial Infarction risk score for unstable angina/NSTEMI.
 */
export function calculateTIMI(input: {
  age_65_or_over: boolean;
  three_or_more_cad_risk_factors: boolean;
  known_cad_stenosis_50_percent: boolean;
  aspirin_use_past_7_days: boolean;
  severe_angina_24h: boolean;
  st_deviation: boolean;
  elevated_cardiac_markers: boolean;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  const items: Array<{ label: string; field: keyof typeof input }> = [
    { label: 'Age ≥65 years', field: 'age_65_or_over' },
    { label: '≥3 CAD risk factors (FHx, HTN, DM, dyslipidemia, smoking)', field: 'three_or_more_cad_risk_factors' },
    { label: 'Known CAD (stenosis ≥50%)', field: 'known_cad_stenosis_50_percent' },
    { label: 'Aspirin use in past 7 days', field: 'aspirin_use_past_7_days' },
    { label: 'Severe angina (≥2 episodes in 24h)', field: 'severe_angina_24h' },
    { label: 'ST deviation ≥0.5mm on ECG', field: 'st_deviation' },
    { label: 'Elevated cardiac markers (troponin/CK-MB)', field: 'elevated_cardiac_markers' },
  ];

  items.forEach(item => {
    const val = input[item.field] ? 1 : 0;
    components[item.label] = { value: val, description: input[item.field] ? 'Present' : 'Absent' };
    score += val;
  });

  let riskLevel: string;
  let recommendation: string;
  const riskPercent = [4.7, 4.7, 8.3, 13.2, 19.9, 26.2, 40.9, 40.9][score] ?? 40.9;

  if (score <= 2) {
    riskLevel = 'Low';
    recommendation = 'Low risk of death, MI, or urgent revascularization at 14 days. Consider conservative management with non-invasive testing. Serial troponins and ECGs.';
  } else if (score <= 4) {
    riskLevel = 'Intermediate';
    recommendation = 'Intermediate risk. Consider early invasive strategy (angiography within 24-72h). Dual antiplatelet therapy. Anticoagulation. Cardiology consultation.';
  } else {
    riskLevel = 'High';
    recommendation = 'High risk of death, MI, or urgent revascularization. Early invasive strategy recommended (angiography within 24h). GP IIb/IIIa inhibitor consideration. ICU/CCU admission.';
  }

  return {
    scoreName: 'TIMI',
    score,
    maxScore: 7,
    riskLevel,
    interpretation: `TIMI Score ${score}/7. ${riskLevel} risk. Estimated 14-day risk of death/MI/urgent revascularization: ${riskPercent}%.`,
    recommendation,
    components,
    reference: 'Antman EM, et al. The TIMI risk score for unstable angina/non-ST elevation MI. JAMA. 2000;284(7):835-42.',
  };
}

/**
 * ABCD2 Score for TIA Stroke Risk
 * Predicts short-term stroke risk after transient ischemic attack.
 */
export function calculateABCD2(input: {
  age_60_or_over: boolean;
  blood_pressure_elevated: boolean;
  clinical_features: 'speech_impairment' | 'unilateral_weakness' | 'other';
  duration_minutes: number;
  diabetes: boolean;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  // Age ≥60 (1 point)
  const ageScore = input.age_60_or_over ? 1 : 0;
  components['A - Age ≥60'] = { value: ageScore, description: input.age_60_or_over ? '≥60 years' : '<60 years' };
  score += ageScore;

  // Blood pressure ≥140/90 (1 point)
  const bpScore = input.blood_pressure_elevated ? 1 : 0;
  components['B - Blood Pressure ≥140/90'] = { value: bpScore, description: input.blood_pressure_elevated ? 'Elevated' : 'Normal' };
  score += bpScore;

  // Clinical features (0-2 points)
  let clinicalScore: number;
  let clinicalDesc: string;
  if (input.clinical_features === 'unilateral_weakness') {
    clinicalScore = 2;
    clinicalDesc = 'Unilateral weakness';
  } else if (input.clinical_features === 'speech_impairment') {
    clinicalScore = 1;
    clinicalDesc = 'Speech impairment without weakness';
  } else {
    clinicalScore = 0;
    clinicalDesc = 'Other symptoms';
  }
  components['C - Clinical features'] = { value: clinicalScore, description: clinicalDesc };
  score += clinicalScore;

  // Duration (0-2 points)
  let durScore: number;
  let durDesc: string;
  if (input.duration_minutes >= 60) {
    durScore = 2;
    durDesc = '≥60 minutes';
  } else if (input.duration_minutes >= 10) {
    durScore = 1;
    durDesc = '10-59 minutes';
  } else {
    durScore = 0;
    durDesc = '<10 minutes';
  }
  components['D - Duration'] = { value: durScore, description: durDesc };
  score += durScore;

  // Diabetes (1 point)
  const dmScore = input.diabetes ? 1 : 0;
  components['D - Diabetes'] = { value: dmScore, description: input.diabetes ? 'Present' : 'Absent' };
  score += dmScore;

  let riskLevel: string;
  let recommendation: string;
  if (score <= 3) {
    riskLevel = 'Low';
    recommendation = 'Low risk of stroke in 2 days (~1%). Consider outpatient workup with urgent neurology follow-up within 24-48h. Start antiplatelet therapy. Vascular imaging recommended.';
  } else if (score <= 5) {
    riskLevel = 'Moderate';
    recommendation = 'Moderate risk of stroke in 2 days (~4%). Hospital admission for observation and expedited workup. Brain imaging, vascular imaging, cardiac monitoring. Antiplatelet therapy.';
  } else {
    riskLevel = 'High';
    recommendation = 'High risk of stroke in 2 days (~8%). Hospital admission mandatory. Urgent brain and vascular imaging. Neurology consultation. Consider IV thrombolysis eligibility assessment.';
  }

  return {
    scoreName: 'ABCD2',
    score,
    maxScore: 7,
    riskLevel,
    interpretation: `ABCD2 Score ${score}/7. ${riskLevel} risk. 2-day stroke risk: ${score <= 3 ? '~1.0%' : score <= 5 ? '~4.1%' : '~8.1%'}. 7-day stroke risk: ${score <= 3 ? '~1.2%' : score <= 5 ? '~5.9%' : '~11.7%'}.`,
    recommendation,
    components,
    reference: 'Johnston SC, et al. Validation and refinement of scores to predict very early stroke risk after TIA. Lancet. 2007;369(9558):283-92.',
  };
}

/**
 * BMI Calculator with WHO Classification
 * Basic but frequently needed clinical calculation.
 */
export function calculateBMI(input: {
  weight_kg: number;
  height_cm: number;
}): RiskScoreResult {
  const heightM = input.height_cm / 100;
  const bmi = input.weight_kg / (heightM * heightM);
  const roundedBMI = Math.round(bmi * 10) / 10;

  const components: Record<string, { value: number; description: string }> = {
    'Weight': { value: input.weight_kg, description: `${input.weight_kg} kg` },
    'Height': { value: input.height_cm, description: `${input.height_cm} cm (${heightM.toFixed(2)} m)` },
    'BMI': { value: roundedBMI, description: `${roundedBMI} kg/m²` },
  };

  let riskLevel: string;
  let classification: string;
  let recommendation: string;

  if (bmi < 16) {
    riskLevel = 'Critical'; classification = 'Severe thinness';
    recommendation = 'Severe underweight. Evaluate for malnutrition, eating disorders, malabsorption, or underlying disease. Nutritional supplementation. Consider refeeding syndrome risk.';
  } else if (bmi < 17) {
    riskLevel = 'High'; classification = 'Moderate thinness';
    recommendation = 'Moderately underweight. Nutritional assessment recommended. Evaluate for underlying causes.';
  } else if (bmi < 18.5) {
    riskLevel = 'Moderate'; classification = 'Mild thinness';
    recommendation = 'Mildly underweight. Monitor nutritional status. Consider dietary counseling.';
  } else if (bmi < 25) {
    riskLevel = 'Normal'; classification = 'Normal weight';
    recommendation = 'Normal BMI. Maintain healthy lifestyle with balanced diet and regular physical activity.';
  } else if (bmi < 30) {
    riskLevel = 'Low-Moderate'; classification = 'Overweight (Pre-obese)';
    recommendation = 'Overweight. Lifestyle modification recommended: dietary changes, increased physical activity. Screen for metabolic syndrome. Calculate ASCVD risk.';
  } else if (bmi < 35) {
    riskLevel = 'Moderate'; classification = 'Obese class I';
    recommendation = 'Obesity class I. Structured weight management program. Screen for type 2 diabetes, hypertension, dyslipidemia. Consider metabolic syndrome evaluation.';
  } else if (bmi < 40) {
    riskLevel = 'High'; classification = 'Obese class II';
    recommendation = 'Obesity class II. Comprehensive weight management including behavioral therapy and dietary intervention. Consider pharmacotherapy. Screen for comorbidities.';
  } else {
    riskLevel = 'Very High'; classification = 'Obese class III (Morbid)';
    recommendation = 'Morbid obesity. Comprehensive evaluation for bariatric surgery eligibility. Multidisciplinary management. Aggressive comorbidity screening and management.';
  }

  components['WHO Classification'] = { value: roundedBMI, description: classification };

  return {
    scoreName: 'BMI',
    score: roundedBMI,
    maxScore: 100,
    riskLevel,
    interpretation: `BMI ${roundedBMI} kg/m². WHO Classification: ${classification}.`,
    recommendation,
    components,
    reference: 'WHO. Body mass index - BMI. Global Database on Body Mass Index, 2006.',
  };
}

/**
 * Framingham Risk Score - 10-Year Coronary Heart Disease Risk
 * Based on Wilson PWF, et al. Prediction of Coronary Heart Disease Using Risk Factor Categories.
 * Uses ATP III categorical model.
 */
export function calculateFramingham(input: {
  age: number;
  sex: 'male' | 'female';
  total_cholesterol: number;  // mg/dL
  hdl_cholesterol: number;    // mg/dL
  systolic_bp: number;        // mmHg
  bp_treated: boolean;
  smoker: boolean;
  diabetes: boolean;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let points = 0;

  // Age points
  let agePoints: number;
  if (input.sex === 'male') {
    if (input.age < 35) agePoints = -9;
    else if (input.age <= 39) agePoints = -4;
    else if (input.age <= 44) agePoints = 0;
    else if (input.age <= 49) agePoints = 3;
    else if (input.age <= 54) agePoints = 6;
    else if (input.age <= 59) agePoints = 8;
    else if (input.age <= 64) agePoints = 10;
    else if (input.age <= 69) agePoints = 11;
    else if (input.age <= 74) agePoints = 12;
    else agePoints = 13;
  } else {
    if (input.age < 35) agePoints = -7;
    else if (input.age <= 39) agePoints = -3;
    else if (input.age <= 44) agePoints = 0;
    else if (input.age <= 49) agePoints = 3;
    else if (input.age <= 54) agePoints = 6;
    else if (input.age <= 59) agePoints = 8;
    else if (input.age <= 64) agePoints = 10;
    else if (input.age <= 69) agePoints = 12;
    else if (input.age <= 74) agePoints = 14;
    else agePoints = 16;
  }
  components['Age'] = { value: agePoints, description: `${input.age} years` };
  points += agePoints;

  // Total cholesterol points
  let tcPoints: number;
  if (input.sex === 'male') {
    if (input.total_cholesterol < 160) tcPoints = -7;
    else if (input.total_cholesterol <= 199) tcPoints = -3;
    else if (input.total_cholesterol <= 239) tcPoints = 0;
    else if (input.total_cholesterol <= 279) tcPoints = 1;
    else tcPoints = 3;
  } else {
    if (input.total_cholesterol < 160) tcPoints = -9;
    else if (input.total_cholesterol <= 199) tcPoints = -4;
    else if (input.total_cholesterol <= 239) tcPoints = 0;
    else if (input.total_cholesterol <= 279) tcPoints = 1;
    else tcPoints = 3;
  }
  components['Total Cholesterol'] = { value: tcPoints, description: `${input.total_cholesterol} mg/dL` };
  points += tcPoints;

  // HDL cholesterol points
  let hdlPoints: number;
  if (input.hdl_cholesterol >= 60) hdlPoints = -1;
  else if (input.hdl_cholesterol >= 50) hdlPoints = 0;
  else if (input.hdl_cholesterol >= 40) hdlPoints = 1;
  else hdlPoints = 2;
  components['HDL Cholesterol'] = { value: hdlPoints, description: `${input.hdl_cholesterol} mg/dL` };
  points += hdlPoints;

  // Systolic BP points (differs by treated/untreated)
  let bpPoints: number;
  if (input.bp_treated) {
    if (input.systolic_bp < 120) bpPoints = 0;
    else if (input.systolic_bp <= 129) bpPoints = 1;
    else if (input.systolic_bp <= 139) bpPoints = 2;
    else if (input.systolic_bp <= 159) bpPoints = 3;
    else bpPoints = 4;
    // Males and females have same treated BP points in ATP III model
    if (input.sex === 'female') {
      if (input.systolic_bp < 120) bpPoints = 0;
      else if (input.systolic_bp <= 129) bpPoints = 3;
      else if (input.systolic_bp <= 139) bpPoints = 4;
      else if (input.systolic_bp <= 159) bpPoints = 5;
      else bpPoints = 6;
    }
  } else {
    if (input.sex === 'male') {
      if (input.systolic_bp < 120) bpPoints = 0;
      else if (input.systolic_bp <= 129) bpPoints = 0;
      else if (input.systolic_bp <= 139) bpPoints = 1;
      else if (input.systolic_bp <= 159) bpPoints = 1;
      else bpPoints = 2;
    } else {
      if (input.systolic_bp < 120) bpPoints = 0;
      else if (input.systolic_bp <= 129) bpPoints = 1;
      else if (input.systolic_bp <= 139) bpPoints = 2;
      else if (input.systolic_bp <= 159) bpPoints = 3;
      else bpPoints = 4;
    }
  }
  components['Systolic BP'] = { value: bpPoints, description: `${input.systolic_bp} mmHg (${input.bp_treated ? 'treated' : 'untreated'})` };
  points += bpPoints;

  // Smoking
  const smokePoints = input.smoker ? (input.sex === 'male' ? 3 : 2) : 0;
  components['Smoking'] = { value: smokePoints, description: input.smoker ? 'Current smoker' : 'Non-smoker' };
  points += smokePoints;

  // Diabetes
  const dmPoints = input.diabetes ? (input.sex === 'male' ? 2 : 4) : 0;
  components['Diabetes'] = { value: dmPoints, description: input.diabetes ? 'Present' : 'Absent' };
  points += dmPoints;

  // Calculate 10-year risk percentage based on point total
  let riskPercent: number;
  if (input.sex === 'male') {
    if (points <= 0) riskPercent = 1;
    else if (points <= 4) riskPercent = 2;
    else if (points <= 6) riskPercent = 3;
    else if (points === 7) riskPercent = 4;
    else if (points === 8) riskPercent = 5;
    else if (points === 9) riskPercent = 7;
    else if (points === 10) riskPercent = 8;
    else if (points === 11) riskPercent = 10;
    else if (points === 12) riskPercent = 13;
    else if (points === 13) riskPercent = 16;
    else if (points === 14) riskPercent = 20;
    else if (points === 15) riskPercent = 25;
    else if (points === 16) riskPercent = 30;
    else riskPercent = 30;
  } else {
    if (points <= 8) riskPercent = 1;
    else if (points <= 12) riskPercent = 2;
    else if (points <= 14) riskPercent = 3;
    else if (points === 15) riskPercent = 4;
    else if (points === 16) riskPercent = 5;
    else if (points === 17) riskPercent = 6;
    else if (points === 18) riskPercent = 8;
    else if (points === 19) riskPercent = 11;
    else if (points === 20) riskPercent = 14;
    else if (points === 21) riskPercent = 17;
    else if (points === 22) riskPercent = 22;
    else if (points === 23) riskPercent = 27;
    else if (points === 24) riskPercent = 30;
    else riskPercent = 30;
  }

  let riskLevel: string;
  let recommendation: string;
  if (riskPercent < 10) {
    riskLevel = 'Low';
    recommendation = 'Low 10-year CHD risk (<10%). Lifestyle modifications: healthy diet, regular exercise, smoking cessation if applicable. Reassess in 5 years. Therapeutic lifestyle changes if LDL ≥160 mg/dL.';
  } else if (riskPercent < 20) {
    riskLevel = 'Intermediate';
    recommendation = 'Intermediate 10-year CHD risk (10-20%). Aggressive risk factor modification. Consider statin therapy if LDL ≥130 mg/dL. Aspirin therapy may be considered. Reassess in 1-2 years.';
  } else {
    riskLevel = 'High';
    recommendation = 'High 10-year CHD risk (≥20%). Treat as CHD risk equivalent. Statin therapy recommended (LDL goal <100 mg/dL, optional <70). Aspirin therapy. Aggressive blood pressure and glucose management.';
  }

  return {
    scoreName: 'Framingham Risk Score',
    score: points,
    maxScore: 30,
    riskLevel,
    interpretation: `Framingham Risk Score ${points} points. Estimated 10-year CHD risk: ${riskPercent}%. ${riskLevel} risk category.`,
    recommendation,
    components,
    reference: 'Wilson PWF, et al. Prediction of Coronary Heart Disease Using Risk Factor Categories. Circulation. 1998;97(18):1837-47. ATP III Guidelines.',
  };
}

/**
 * APACHE II Score - Acute Physiology and Chronic Health Evaluation II
 * ICU mortality prediction scoring system using acute physiology variables, age, and chronic health.
 * Original: Knaus WA, et al. APACHE II: a severity of disease classification system. Crit Care Med. 1985.
 */
export function calculateAPACHEII(input: {
  temperature: number;           // °C (rectal/core)
  mean_arterial_pressure: number; // mmHg
  heart_rate: number;            // bpm
  respiratory_rate: number;      // breaths/min
  oxygenation: number;           // If FiO2 ≥ 0.5: A-a gradient; if FiO2 < 0.5: PaO2 (mmHg)
  fio2_gte_50: boolean;          // true if FiO2 ≥ 0.5 (use A-a gradient)
  arterial_ph: number;           // arterial blood gas pH
  sodium: number;                // mEq/L
  potassium: number;             // mEq/L
  creatinine: number;            // mg/dL
  acute_renal_failure: boolean;  // doubled if acute renal failure
  hematocrit: number;            // %
  wbc: number;                   // x10³/mm³
  gcs: number;                   // Glasgow Coma Scale (3-15)
  age: number;                   // years
  chronic_health: 'none' | 'nonoperative' | 'emergency_postop' | 'elective_postop';
  // nonoperative or emergency_postop = 5 pts; elective_postop = 2 pts
  severe_organ_insufficiency: boolean; // liver cirrhosis, NYHA IV, dialysis, immunocompromised
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  // Temperature
  let tempPts: number;
  const temp = input.temperature;
  if (temp >= 41) tempPts = 4;
  else if (temp >= 39) tempPts = 3;
  else if (temp >= 38.5) tempPts = 1;
  else if (temp >= 36) tempPts = 0;
  else if (temp >= 34) tempPts = 1;
  else if (temp >= 32) tempPts = 2;
  else if (temp >= 30) tempPts = 3;
  else tempPts = 4;
  components['Temperature'] = { value: tempPts, description: `${temp}°C` };
  score += tempPts;

  // Mean Arterial Pressure
  let mapPts: number;
  const map = input.mean_arterial_pressure;
  if (map >= 160) mapPts = 4;
  else if (map >= 130) mapPts = 3;
  else if (map >= 110) mapPts = 2;
  else if (map >= 70) mapPts = 0;
  else if (map >= 50) mapPts = 2;
  else mapPts = 4;
  components['Mean Arterial Pressure'] = { value: mapPts, description: `${map} mmHg` };
  score += mapPts;

  // Heart Rate
  let hrPts: number;
  const hr = input.heart_rate;
  if (hr >= 180) hrPts = 4;
  else if (hr >= 140) hrPts = 3;
  else if (hr >= 110) hrPts = 2;
  else if (hr >= 70) hrPts = 0;
  else if (hr >= 55) hrPts = 2;
  else if (hr >= 40) hrPts = 3;
  else hrPts = 4;
  components['Heart Rate'] = { value: hrPts, description: `${hr} bpm` };
  score += hrPts;

  // Respiratory Rate
  let rrPts: number;
  const rr = input.respiratory_rate;
  if (rr >= 50) rrPts = 4;
  else if (rr >= 35) rrPts = 3;
  else if (rr >= 25) rrPts = 1;
  else if (rr >= 12) rrPts = 0;
  else if (rr >= 10) rrPts = 1;
  else if (rr >= 6) rrPts = 2;
  else rrPts = 4;
  components['Respiratory Rate'] = { value: rrPts, description: `${rr} /min` };
  score += rrPts;

  // Oxygenation
  let o2Pts: number;
  if (input.fio2_gte_50) {
    // Use A-a gradient
    const aag = input.oxygenation;
    if (aag >= 500) o2Pts = 4;
    else if (aag >= 350) o2Pts = 3;
    else if (aag >= 200) o2Pts = 2;
    else o2Pts = 0;
    components['Oxygenation (A-a gradient)'] = { value: o2Pts, description: `A-a gradient ${aag} mmHg (FiO2 ≥50%)` };
  } else {
    // Use PaO2
    const pao2 = input.oxygenation;
    if (pao2 > 70) o2Pts = 0;
    else if (pao2 >= 61) o2Pts = 1;
    else if (pao2 >= 55) o2Pts = 3;
    else o2Pts = 4;
    components['Oxygenation (PaO2)'] = { value: o2Pts, description: `PaO2 ${pao2} mmHg (FiO2 <50%)` };
  }
  score += o2Pts;

  // Arterial pH
  let phPts: number;
  const ph = input.arterial_ph;
  if (ph >= 7.70) phPts = 4;
  else if (ph >= 7.60) phPts = 3;
  else if (ph >= 7.50) phPts = 1;
  else if (ph >= 7.33) phPts = 0;
  else if (ph >= 7.25) phPts = 2;
  else if (ph >= 7.15) phPts = 3;
  else phPts = 4;
  components['Arterial pH'] = { value: phPts, description: `${ph}` };
  score += phPts;

  // Sodium
  let naPts: number;
  const na = input.sodium;
  if (na >= 180) naPts = 4;
  else if (na >= 160) naPts = 3;
  else if (na >= 155) naPts = 2;
  else if (na >= 150) naPts = 1;
  else if (na >= 130) naPts = 0;
  else if (na >= 120) naPts = 2;
  else if (na >= 111) naPts = 3;
  else naPts = 4;
  components['Sodium'] = { value: naPts, description: `${na} mEq/L` };
  score += naPts;

  // Potassium
  let kPts: number;
  const k = input.potassium;
  if (k >= 7.0) kPts = 4;
  else if (k >= 6.0) kPts = 3;
  else if (k >= 5.5) kPts = 1;
  else if (k >= 3.5) kPts = 0;
  else if (k >= 3.0) kPts = 1;
  else if (k >= 2.5) kPts = 2;
  else kPts = 4;
  components['Potassium'] = { value: kPts, description: `${k} mEq/L` };
  score += kPts;

  // Creatinine (double points if acute renal failure)
  let crPts: number;
  const cr = input.creatinine;
  if (cr >= 3.5) crPts = 4;
  else if (cr >= 2.0) crPts = 3;
  else if (cr >= 1.5) crPts = 2;
  else if (cr >= 0.6) crPts = 0;
  else crPts = 2;
  if (input.acute_renal_failure) crPts = crPts * 2;
  components['Creatinine'] = { value: crPts, description: `${cr} mg/dL${input.acute_renal_failure ? ' (acute renal failure - doubled)' : ''}` };
  score += crPts;

  // Hematocrit
  let hctPts: number;
  const hct = input.hematocrit;
  if (hct >= 60) hctPts = 4;
  else if (hct >= 50) hctPts = 2;
  else if (hct >= 46) hctPts = 1;
  else if (hct >= 30) hctPts = 0;
  else if (hct >= 20) hctPts = 2;
  else hctPts = 4;
  components['Hematocrit'] = { value: hctPts, description: `${hct}%` };
  score += hctPts;

  // WBC
  let wbcPts: number;
  const wbc = input.wbc;
  if (wbc >= 40) wbcPts = 4;
  else if (wbc >= 20) wbcPts = 2;
  else if (wbc >= 15) wbcPts = 1;
  else if (wbc >= 3) wbcPts = 0;
  else if (wbc >= 1) wbcPts = 2;
  else wbcPts = 4;
  components['WBC'] = { value: wbcPts, description: `${wbc} x10³/mm³` };
  score += wbcPts;

  // GCS (APACHE II uses 15 - GCS)
  const gcsPts = 15 - input.gcs;
  components['GCS'] = { value: gcsPts, description: `GCS ${input.gcs} (score = 15 - ${input.gcs} = ${gcsPts})` };
  score += gcsPts;

  // Age points
  let agePts: number;
  if (input.age < 45) agePts = 0;
  else if (input.age <= 54) agePts = 2;
  else if (input.age <= 64) agePts = 3;
  else if (input.age <= 74) agePts = 5;
  else agePts = 6;
  components['Age'] = { value: agePts, description: `${input.age} years` };
  score += agePts;

  // Chronic Health Points
  let chPts = 0;
  if (input.severe_organ_insufficiency) {
    if (input.chronic_health === 'nonoperative' || input.chronic_health === 'emergency_postop') {
      chPts = 5;
    } else if (input.chronic_health === 'elective_postop') {
      chPts = 2;
    }
  }
  const chDesc = input.severe_organ_insufficiency
    ? `Severe organ insufficiency (${input.chronic_health.replace(/_/g, ' ')})`
    : 'No severe organ insufficiency';
  components['Chronic Health'] = { value: chPts, description: chDesc };
  score += chPts;

  // Mortality estimation (approximate from original APACHE II data)
  let riskLevel: string;
  let mortality: string;
  let recommendation: string;

  if (score <= 4) {
    riskLevel = 'Low'; mortality = '~4%';
    recommendation = 'Low ICU mortality risk. Standard ICU monitoring. Reassess daily for step-down eligibility.';
  } else if (score <= 9) {
    riskLevel = 'Low-Moderate'; mortality = '~8%';
    recommendation = 'Low-moderate ICU mortality risk. Standard ICU care with vigilant monitoring. Address reversible physiologic derangements.';
  } else if (score <= 14) {
    riskLevel = 'Moderate'; mortality = '~15%';
    recommendation = 'Moderate ICU mortality risk. Active organ support may be needed. Consider goals of care discussion if pre-existing comorbidities.';
  } else if (score <= 19) {
    riskLevel = 'Moderate-High'; mortality = '~25%';
    recommendation = 'Moderate-high ICU mortality risk. Aggressive critical care interventions. Multi-organ support likely needed. Goals of care discussion recommended.';
  } else if (score <= 24) {
    riskLevel = 'High'; mortality = '~40%';
    recommendation = 'High ICU mortality risk. Maximum critical care support. Family meeting and goals of care discussion essential. Consider palliative care consultation.';
  } else if (score <= 29) {
    riskLevel = 'Very High'; mortality = '~55%';
    recommendation = 'Very high ICU mortality risk. Serious prognostic discussion needed. Palliative care consultation strongly recommended.';
  } else {
    riskLevel = 'Critical'; mortality = '>70%';
    recommendation = 'Critical ICU mortality risk. Urgent goals of care discussion. Comfort care may be most appropriate depending on clinical context.';
  }

  return {
    scoreName: 'APACHE II',
    score,
    maxScore: 71,
    riskLevel,
    interpretation: `APACHE II Score ${score}/71. Estimated ICU mortality: ${mortality}. ${riskLevel} risk category.`,
    recommendation,
    components,
    reference: 'Knaus WA, et al. APACHE II: a severity of disease classification system. Crit Care Med. 1985;13(10):818-29.',
  };
}

/**
 * PESI - Pulmonary Embolism Severity Index
 * Prognostic model for patients with acute pulmonary embolism.
 * Original PESI (not simplified) for 30-day mortality.
 */
export function calculatePESI(input: {
  age: number;
  sex: 'male' | 'female';
  cancer: boolean;
  heart_failure: boolean;
  chronic_lung_disease: boolean;
  heart_rate_gte_110: boolean;
  systolic_bp_lt_100: boolean;
  respiratory_rate_gte_30: boolean;
  temperature_lt_36: boolean;
  altered_mental_status: boolean;
  spo2_lt_90: boolean;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  // Age (age in years)
  components['Age'] = { value: input.age, description: `${input.age} years (+${input.age} points)` };
  score += input.age;

  // Male sex (+10)
  const sexPts = input.sex === 'male' ? 10 : 0;
  components['Male sex'] = { value: sexPts, description: input.sex === 'male' ? 'Male (+10)' : 'Female (+0)' };
  score += sexPts;

  // Cancer (+30)
  const cancerPts = input.cancer ? 30 : 0;
  components['Cancer'] = { value: cancerPts, description: input.cancer ? 'Present (+30)' : 'Absent' };
  score += cancerPts;

  // Heart failure (+10)
  const hfPts = input.heart_failure ? 10 : 0;
  components['Heart failure'] = { value: hfPts, description: input.heart_failure ? 'Present (+10)' : 'Absent' };
  score += hfPts;

  // Chronic lung disease (+10)
  const lungPts = input.chronic_lung_disease ? 10 : 0;
  components['Chronic lung disease'] = { value: lungPts, description: input.chronic_lung_disease ? 'Present (+10)' : 'Absent' };
  score += lungPts;

  // Heart rate ≥110 (+20)
  const hrPts = input.heart_rate_gte_110 ? 20 : 0;
  components['Heart rate ≥110 bpm'] = { value: hrPts, description: input.heart_rate_gte_110 ? 'Yes (+20)' : 'No' };
  score += hrPts;

  // Systolic BP <100 (+30)
  const sbpPts = input.systolic_bp_lt_100 ? 30 : 0;
  components['Systolic BP <100 mmHg'] = { value: sbpPts, description: input.systolic_bp_lt_100 ? 'Yes (+30)' : 'No' };
  score += sbpPts;

  // Respiratory rate ≥30 (+20)
  const rrPts = input.respiratory_rate_gte_30 ? 20 : 0;
  components['Respiratory rate ≥30'] = { value: rrPts, description: input.respiratory_rate_gte_30 ? 'Yes (+20)' : 'No' };
  score += rrPts;

  // Temperature <36°C (+20)
  const tempPts = input.temperature_lt_36 ? 20 : 0;
  components['Temperature <36°C'] = { value: tempPts, description: input.temperature_lt_36 ? 'Yes (+20)' : 'No' };
  score += tempPts;

  // Altered mental status (+60)
  const amsPts = input.altered_mental_status ? 60 : 0;
  components['Altered mental status'] = { value: amsPts, description: input.altered_mental_status ? 'Present (+60)' : 'Absent' };
  score += amsPts;

  // SpO2 <90% (+20)
  const spo2Pts = input.spo2_lt_90 ? 20 : 0;
  components['SpO₂ <90%'] = { value: spo2Pts, description: input.spo2_lt_90 ? 'Yes (+20)' : 'No' };
  score += spo2Pts;

  // PESI Class determination
  let pesiClass: string;
  let mortality: string;
  let riskLevel: string;
  let recommendation: string;

  if (score <= 65) {
    pesiClass = 'Class I'; mortality = '0-1.6%'; riskLevel = 'Very Low';
    recommendation = 'Very low 30-day mortality risk. Consider outpatient management if no contraindications. Anticoagulation with follow-up in 24-48h. Ensure adequate social support and access to care.';
  } else if (score <= 85) {
    pesiClass = 'Class II'; mortality = '1.7-3.5%'; riskLevel = 'Low';
    recommendation = 'Low 30-day mortality risk. Consider early discharge with close outpatient follow-up. Standard anticoagulation. Outpatient management may be appropriate for selected patients.';
  } else if (score <= 105) {
    pesiClass = 'Class III'; mortality = '3.2-7.1%'; riskLevel = 'Intermediate';
    recommendation = 'Intermediate 30-day mortality risk. Hospital admission recommended. Standard anticoagulation. Monitor for hemodynamic instability. Consider echocardiography and troponin.';
  } else if (score <= 125) {
    pesiClass = 'Class IV'; mortality = '4.0-11.4%'; riskLevel = 'High';
    recommendation = 'High 30-day mortality risk. Hospital admission required. Close hemodynamic monitoring. Assess for RV dysfunction (echo/CT). Consider ICU admission. Evaluate for thrombolysis if hemodynamically unstable.';
  } else {
    pesiClass = 'Class V'; mortality = '10.0-24.5%'; riskLevel = 'Very High';
    recommendation = 'Very high 30-day mortality risk. ICU admission. Close hemodynamic monitoring. Consider systemic thrombolysis or catheter-directed therapy. Evaluate for surgical embolectomy if massive PE. ECMO consideration.';
  }

  return {
    scoreName: 'PESI',
    score,
    maxScore: 300,
    riskLevel,
    interpretation: `PESI Score ${score} - ${pesiClass}. Estimated 30-day mortality: ${mortality}. ${riskLevel} risk.`,
    recommendation,
    components,
    reference: 'Aujesky D, et al. Derivation and validation of a prognostic model for pulmonary embolism. Am J Respir Crit Care Med. 2005;172(8):1041-6.',
  };
}

/**
 * Modified Rankin Scale (mRS) - Stroke Disability Assessment
 * Standardized scale for measuring degree of disability/dependence after stroke.
 * Score range 0-6.
 */
export function calculateModifiedRankin(input: {
  functional_status: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  // 0 = No symptoms
  // 1 = No significant disability despite symptoms
  // 2 = Slight disability (unable to carry out all previous activities but independent)
  // 3 = Moderate disability (requires some help but walks without assistance)
  // 4 = Moderately severe disability (unable to walk/attend to bodily needs without assistance)
  // 5 = Severe disability (bedridden, incontinent, requires constant nursing)
  // 6 = Dead
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};

  const descriptions: Record<number, string> = {
    0: 'No symptoms at all',
    1: 'No significant disability despite symptoms; able to carry out all usual duties and activities',
    2: 'Slight disability; unable to carry out all previous activities but able to look after own affairs without assistance',
    3: 'Moderate disability; requiring some help, but able to walk without assistance',
    4: 'Moderately severe disability; unable to walk without assistance and unable to attend to own bodily needs without assistance',
    5: 'Severe disability; bedridden, incontinent, and requiring constant nursing care and attention',
    6: 'Dead',
  };

  const score = input.functional_status;
  components['Functional Status'] = { value: score, description: descriptions[score] };

  let riskLevel: string;
  let recommendation: string;

  if (score === 0) {
    riskLevel = 'No disability';
    recommendation = 'No disability. Continue secondary stroke prevention (antiplatelet/anticoagulation, statin, BP management). Regular follow-up. Educate on stroke recurrence signs.';
  } else if (score === 1) {
    riskLevel = 'No significant disability';
    recommendation = 'No significant disability. Standard secondary prevention. Outpatient rehabilitation assessment. Return to normal activities as tolerated.';
  } else if (score === 2) {
    riskLevel = 'Slight disability';
    recommendation = 'Slight disability. Outpatient rehabilitation (PT/OT/Speech as needed). Secondary prevention. May need workplace/driving assessment. Community support services.';
  } else if (score === 3) {
    riskLevel = 'Moderate disability';
    recommendation = 'Moderate disability. Comprehensive rehabilitation program. Occupational therapy for daily living skills. Assess home safety. Caregiver support. Depression screening. May require supervised living.';
  } else if (score === 4) {
    riskLevel = 'Moderately severe disability';
    recommendation = 'Moderately severe disability. Inpatient or intensive outpatient rehabilitation. Full-time caregiver needed. Assess for nursing home placement if no home support. Depression screening. DVT prophylaxis. Pressure sore prevention.';
  } else if (score === 5) {
    riskLevel = 'Severe disability';
    recommendation = 'Severe disability. Long-term care facility or 24h home care. Palliative care consultation. Address comfort, nutrition (PEG consideration), skin integrity. Family meeting for goals of care. DVT and aspiration prophylaxis.';
  } else {
    riskLevel = 'Dead';
    recommendation = 'Patient deceased. Complete death certificate. Offer autopsy if appropriate. Family bereavement support.';
  }

  return {
    scoreName: 'Modified Rankin Scale',
    score,
    maxScore: 6,
    riskLevel,
    interpretation: `Modified Rankin Scale (mRS) ${score}/6. ${riskLevel}. ${descriptions[score]}.`,
    recommendation,
    components,
    reference: 'van Swieten JC, et al. Interobserver agreement for the assessment of handicap in stroke patients. Stroke. 1988;19(5):604-7.',
  };
}

/**
 * Morse Fall Scale - Fall Risk Assessment
 * Widely used in acute care settings to identify patients at risk for falling.
 * Score range 0-125.
 */
export function calculateMorseFallScale(input: {
  history_of_falling: boolean;          // 25 points
  secondary_diagnosis: boolean;          // 15 points (≥2 medical diagnoses)
  ambulatory_aid: 'none' | 'crutch_cane_walker' | 'furniture';  // 0, 15, or 30
  iv_heparin_lock: boolean;             // 20 points
  gait: 'normal' | 'weak' | 'impaired'; // 0, 10, or 20
  mental_status: 'oriented' | 'overestimates';  // 0 or 15 (forgets limitations)
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  // History of falling (within 3 months)
  const fallPts = input.history_of_falling ? 25 : 0;
  components['History of falling'] = { value: fallPts, description: input.history_of_falling ? 'Yes (+25)' : 'No' };
  score += fallPts;

  // Secondary diagnosis
  const dxPts = input.secondary_diagnosis ? 15 : 0;
  components['Secondary diagnosis'] = { value: dxPts, description: input.secondary_diagnosis ? '≥2 diagnoses (+15)' : '<2 diagnoses' };
  score += dxPts;

  // Ambulatory aid
  let aidPts: number;
  let aidDesc: string;
  if (input.ambulatory_aid === 'none') {
    aidPts = 0; aidDesc = 'None/bedrest/nurse assist';
  } else if (input.ambulatory_aid === 'crutch_cane_walker') {
    aidPts = 15; aidDesc = 'Crutches/cane/walker (+15)';
  } else {
    aidPts = 30; aidDesc = 'Furniture for support (+30)';
  }
  components['Ambulatory aid'] = { value: aidPts, description: aidDesc };
  score += aidPts;

  // IV/heparin lock
  const ivPts = input.iv_heparin_lock ? 20 : 0;
  components['IV/heparin lock'] = { value: ivPts, description: input.iv_heparin_lock ? 'Yes (+20)' : 'No' };
  score += ivPts;

  // Gait
  let gaitPts: number;
  let gaitDesc: string;
  if (input.gait === 'normal') {
    gaitPts = 0; gaitDesc = 'Normal/bedrest/immobile';
  } else if (input.gait === 'weak') {
    gaitPts = 10; gaitDesc = 'Weak (+10)';
  } else {
    gaitPts = 20; gaitDesc = 'Impaired (+20)';
  }
  components['Gait'] = { value: gaitPts, description: gaitDesc };
  score += gaitPts;

  // Mental status
  const mentalPts = input.mental_status === 'overestimates' ? 15 : 0;
  components['Mental status'] = { value: mentalPts, description: input.mental_status === 'overestimates' ? 'Overestimates/forgets limitations (+15)' : 'Oriented to own ability' };
  score += mentalPts;

  let riskLevel: string;
  let recommendation: string;

  if (score <= 24) {
    riskLevel = 'No risk';
    recommendation = 'No risk for falls. Implement standard fall prevention: maintain safe environment, adequate lighting, non-slip footwear, call bell within reach. Good clinical practice measures.';
  } else if (score <= 50) {
    riskLevel = 'Low risk';
    recommendation = 'Low fall risk. Standard fall prevention interventions. Fall risk sign at bedside. Non-slip footwear. Bed in low position. Call bell in reach. Orient patient to environment. Reassess with condition changes.';
  } else {
    riskLevel = 'High risk';
    recommendation = 'High fall risk. Implement high-risk fall prevention protocol: Fall risk bracelet. Bed alarm/chair alarm. Toileting schedule. Assist with ambulation. Move closer to nurses station. Consider 1:1 sitter if very high risk. Remove environmental hazards. Physical therapy consultation.';
  }

  return {
    scoreName: 'Morse Fall Scale',
    score,
    maxScore: 125,
    riskLevel,
    interpretation: `Morse Fall Scale ${score}/125. ${riskLevel}. ${score <= 24 ? 'No action needed beyond standard precautions.' : score <= 50 ? 'Implement standard fall prevention interventions.' : 'Implement high-risk fall prevention protocol.'}`,
    recommendation,
    components,
    reference: 'Morse JM, et al. Development of a scale to identify the fall-prone patient. Canadian Journal of Aging. 1989;8(4):366-77.',
  };
}

/**
 * NIH Stroke Scale (NIHSS) - Stroke Severity Assessment
 * Quantifies stroke severity to guide treatment decisions including tPA eligibility.
 * Score range 0-42.
 */
export function calculateNIHSS(input: {
  consciousness: 0 | 1 | 2 | 3;
  orientation_questions: 0 | 1 | 2;
  commands: 0 | 1 | 2;
  gaze: 0 | 1 | 2;
  visual_fields: 0 | 1 | 2 | 3;
  facial_palsy: 0 | 1 | 2 | 3;
  motor_arm_left: 0 | 1 | 2 | 3 | 4;
  motor_arm_right: 0 | 1 | 2 | 3 | 4;
  motor_leg_left: 0 | 1 | 2 | 3 | 4;
  motor_leg_right: 0 | 1 | 2 | 3 | 4;
  ataxia: 0 | 1 | 2;
  sensory: 0 | 1 | 2;
  language: 0 | 1 | 2 | 3;
  dysarthria: 0 | 1 | 2;
  neglect: 0 | 1 | 2;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  // 1a. Level of consciousness
  const consciousnessDesc: Record<number, string> = {
    0: 'Alert; keenly responsive',
    1: 'Not alert; but arousable by minor stimulation',
    2: 'Not alert; requires repeated stimulation to attend',
    3: 'Unresponsive or responds only with reflex motor or autonomic effects',
  };
  components['1a. Level of Consciousness'] = { value: input.consciousness, description: consciousnessDesc[input.consciousness] };
  score += input.consciousness;

  // 1b. LOC Questions (month, age)
  const orientationDesc: Record<number, string> = {
    0: 'Answers both correctly',
    1: 'Answers one correctly',
    2: 'Answers neither correctly',
  };
  components['1b. Orientation Questions'] = { value: input.orientation_questions, description: orientationDesc[input.orientation_questions] };
  score += input.orientation_questions;

  // 1c. LOC Commands (open/close eyes, grip/release hand)
  const commandsDesc: Record<number, string> = {
    0: 'Performs both tasks correctly',
    1: 'Performs one task correctly',
    2: 'Performs neither task correctly',
  };
  components['1c. LOC Commands'] = { value: input.commands, description: commandsDesc[input.commands] };
  score += input.commands;

  // 2. Best gaze
  const gazeDesc: Record<number, string> = {
    0: 'Normal',
    1: 'Partial gaze palsy',
    2: 'Forced deviation or total gaze paresis',
  };
  components['2. Best Gaze'] = { value: input.gaze, description: gazeDesc[input.gaze] };
  score += input.gaze;

  // 3. Visual fields
  const visualDesc: Record<number, string> = {
    0: 'No visual loss',
    1: 'Partial hemianopia',
    2: 'Complete hemianopia',
    3: 'Bilateral hemianopia (blind including cortical blindness)',
  };
  components['3. Visual Fields'] = { value: input.visual_fields, description: visualDesc[input.visual_fields] };
  score += input.visual_fields;

  // 4. Facial palsy
  const facialDesc: Record<number, string> = {
    0: 'Normal symmetric movements',
    1: 'Minor paralysis (flattened nasolabial fold, asymmetry on smiling)',
    2: 'Partial paralysis (total or near-total paralysis of lower face)',
    3: 'Complete paralysis of one or both sides',
  };
  components['4. Facial Palsy'] = { value: input.facial_palsy, description: facialDesc[input.facial_palsy] };
  score += input.facial_palsy;

  // 5a. Motor arm - left
  const motorArmDesc: Record<number, string> = {
    0: 'No drift; limb holds 90 (or 45) degrees for full 10 seconds',
    1: 'Drift; limb holds but drifts down before full 10 seconds',
    2: 'Some effort against gravity; limb cannot maintain position',
    3: 'No effort against gravity; limb falls',
    4: 'No movement',
  };
  components['5a. Motor Arm (Left)'] = { value: input.motor_arm_left, description: motorArmDesc[input.motor_arm_left] };
  score += input.motor_arm_left;

  // 5b. Motor arm - right
  components['5b. Motor Arm (Right)'] = { value: input.motor_arm_right, description: motorArmDesc[input.motor_arm_right] };
  score += input.motor_arm_right;

  // 6a. Motor leg - left
  const motorLegDesc: Record<number, string> = {
    0: 'No drift; leg holds 30 degrees for full 5 seconds',
    1: 'Drift; leg falls by end of 5-second period',
    2: 'Some effort against gravity',
    3: 'No effort against gravity; leg falls immediately',
    4: 'No movement',
  };
  components['6a. Motor Leg (Left)'] = { value: input.motor_leg_left, description: motorLegDesc[input.motor_leg_left] };
  score += input.motor_leg_left;

  // 6b. Motor leg - right
  components['6b. Motor Leg (Right)'] = { value: input.motor_leg_right, description: motorLegDesc[input.motor_leg_right] };
  score += input.motor_leg_right;

  // 7. Limb ataxia
  const ataxiaDesc: Record<number, string> = {
    0: 'Absent',
    1: 'Present in one limb',
    2: 'Present in two limbs',
  };
  components['7. Limb Ataxia'] = { value: input.ataxia, description: ataxiaDesc[input.ataxia] };
  score += input.ataxia;

  // 8. Sensory
  const sensoryDesc: Record<number, string> = {
    0: 'Normal; no sensory loss',
    1: 'Mild-to-moderate sensory loss',
    2: 'Severe or total sensory loss',
  };
  components['8. Sensory'] = { value: input.sensory, description: sensoryDesc[input.sensory] };
  score += input.sensory;

  // 9. Best language
  const languageDesc: Record<number, string> = {
    0: 'No aphasia; normal',
    1: 'Mild-to-moderate aphasia',
    2: 'Severe aphasia; fragmentary expression',
    3: 'Mute, global aphasia; no usable speech or auditory comprehension',
  };
  components['9. Best Language'] = { value: input.language, description: languageDesc[input.language] };
  score += input.language;

  // 10. Dysarthria
  const dysarthriaDesc: Record<number, string> = {
    0: 'Normal',
    1: 'Mild-to-moderate dysarthria; slurs some words',
    2: 'Severe dysarthria; speech unintelligible or mute/anarthric',
  };
  components['10. Dysarthria'] = { value: input.dysarthria, description: dysarthriaDesc[input.dysarthria] };
  score += input.dysarthria;

  // 11. Extinction and inattention (neglect)
  const neglectDesc: Record<number, string> = {
    0: 'No abnormality',
    1: 'Partial neglect (visual, tactile, auditory, spatial, or personal inattention)',
    2: 'Complete neglect (profound hemi-inattention to more than one modality)',
  };
  components['11. Extinction/Neglect'] = { value: input.neglect, description: neglectDesc[input.neglect] };
  score += input.neglect;

  let riskLevel: string;
  let recommendation: string;
  let severityLabel: string;

  if (score === 0) {
    riskLevel = 'No stroke symptoms';
    severityLabel = 'No stroke symptoms';
    recommendation = 'No stroke symptoms on NIHSS. If clinical suspicion remains, consider MRI with diffusion-weighted imaging to rule out small or posterior circulation stroke.';
  } else if (score <= 4) {
    riskLevel = 'Minor stroke';
    severityLabel = 'Minor stroke';
    recommendation = 'Minor stroke. Consider IV alteplase if within 4.5h of onset and no contraindications (benefit debated for minor non-disabling strokes). Dual antiplatelet therapy (aspirin + clopidogrel for 21 days) if tPA not given. Urgent vascular imaging. Admit to stroke unit.';
  } else if (score <= 15) {
    riskLevel = 'Moderate stroke';
    severityLabel = 'Moderate stroke';
    recommendation = 'Moderate stroke. IV alteplase strongly recommended if within 4.5h of symptom onset and no contraindications. Consider endovascular thrombectomy if large vessel occlusion (within 24h with appropriate imaging). Admit to stroke unit or ICU. NPO until swallow screen completed.';
  } else if (score <= 20) {
    riskLevel = 'Moderate-to-severe stroke';
    severityLabel = 'Moderate-to-severe stroke';
    recommendation = 'Moderate-to-severe stroke. IV alteplase if within 4.5h window. Strongly consider endovascular thrombectomy for large vessel occlusion. ICU admission. Monitor for hemorrhagic transformation. Neurosurgery consultation for possible decompressive craniectomy if large MCA infarction.';
  } else {
    riskLevel = 'Severe stroke';
    severityLabel = 'Severe stroke';
    recommendation = 'Severe stroke. IV alteplase if within time window (generally NIHSS ≤25 for tPA consideration). Evaluate for thrombectomy if LVO. ICU admission. High risk of hemorrhagic transformation, cerebral edema, and herniation. Early goals-of-care discussion with family. Monitor airway; intubation may be needed.';
  }

  const tpaNote = score >= 6 && score <= 25
    ? ' tPA generally considered for NIHSS 6-25 within time window.'
    : score > 25
    ? ' NIHSS >25 associated with increased hemorrhagic risk with tPA; individualized risk-benefit assessment needed.'
    : '';

  return {
    scoreName: 'NIH Stroke Scale',
    score,
    maxScore: 42,
    riskLevel,
    interpretation: `NIHSS ${score}/42. ${severityLabel}.${tpaNote}`,
    recommendation,
    components,
    reference: 'Brott T, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864-870.',
  };
}

/**
 * PHQ-9 (Patient Health Questionnaire-9) - Depression Screening
 * Validated tool for screening and monitoring depression severity.
 * Score range 0-27.
 */
export function calculatePHQ9(input: {
  little_interest: 0 | 1 | 2 | 3;
  feeling_down: 0 | 1 | 2 | 3;
  sleep_trouble: 0 | 1 | 2 | 3;
  feeling_tired: 0 | 1 | 2 | 3;
  appetite_change: 0 | 1 | 2 | 3;
  feeling_bad_about_self: 0 | 1 | 2 | 3;
  concentration_trouble: 0 | 1 | 2 | 3;
  psychomotor_change: 0 | 1 | 2 | 3;
  suicidal_thoughts: 0 | 1 | 2 | 3;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  const frequencyDesc: Record<number, string> = {
    0: 'Not at all',
    1: 'Several days',
    2: 'More than half the days',
    3: 'Nearly every day',
  };

  // Item 1: Little interest or pleasure
  components['1. Little interest or pleasure in doing things'] = { value: input.little_interest, description: frequencyDesc[input.little_interest] };
  score += input.little_interest;

  // Item 2: Feeling down, depressed, or hopeless
  components['2. Feeling down, depressed, or hopeless'] = { value: input.feeling_down, description: frequencyDesc[input.feeling_down] };
  score += input.feeling_down;

  // Item 3: Trouble falling/staying asleep or sleeping too much
  components['3. Trouble with sleep'] = { value: input.sleep_trouble, description: frequencyDesc[input.sleep_trouble] };
  score += input.sleep_trouble;

  // Item 4: Feeling tired or having little energy
  components['4. Feeling tired or having little energy'] = { value: input.feeling_tired, description: frequencyDesc[input.feeling_tired] };
  score += input.feeling_tired;

  // Item 5: Poor appetite or overeating
  components['5. Poor appetite or overeating'] = { value: input.appetite_change, description: frequencyDesc[input.appetite_change] };
  score += input.appetite_change;

  // Item 6: Feeling bad about yourself
  components['6. Feeling bad about yourself'] = { value: input.feeling_bad_about_self, description: frequencyDesc[input.feeling_bad_about_self] };
  score += input.feeling_bad_about_self;

  // Item 7: Trouble concentrating
  components['7. Trouble concentrating'] = { value: input.concentration_trouble, description: frequencyDesc[input.concentration_trouble] };
  score += input.concentration_trouble;

  // Item 8: Psychomotor changes
  components['8. Moving/speaking slowly or being fidgety/restless'] = { value: input.psychomotor_change, description: frequencyDesc[input.psychomotor_change] };
  score += input.psychomotor_change;

  // Item 9: Suicidal thoughts
  components['9. Thoughts of self-harm or suicide'] = { value: input.suicidal_thoughts, description: frequencyDesc[input.suicidal_thoughts] };
  score += input.suicidal_thoughts;

  let riskLevel: string;
  let recommendation: string;
  let severityLabel: string;

  if (score <= 4) {
    riskLevel = 'Minimal';
    severityLabel = 'Minimal or no depression';
    recommendation = 'Minimal depression symptoms. No specific treatment indicated. Educate patient about depression. Rescreen periodically or if clinical concern arises.';
  } else if (score <= 9) {
    riskLevel = 'Mild';
    severityLabel = 'Mild depression';
    recommendation = 'Mild depression. Consider watchful waiting with repeat PHQ-9 at follow-up. Recommend lifestyle interventions (exercise, sleep hygiene, stress management). Consider counseling. If symptoms persist ≥2 months, reassess and consider treatment.';
  } else if (score <= 14) {
    riskLevel = 'Moderate';
    severityLabel = 'Moderate depression';
    recommendation = 'Moderate depression. Treatment plan warranted. Consider antidepressant medication (SSRI first-line) and/or psychotherapy (CBT, IPT). Follow up in 2-4 weeks to assess response. Monitor for treatment emergent suicidality especially in young adults.';
  } else if (score <= 19) {
    riskLevel = 'Moderately severe';
    severityLabel = 'Moderately severe depression';
    recommendation = 'Moderately severe depression. Initiate antidepressant medication (SSRI first-line) and strongly consider concurrent psychotherapy. Close follow-up in 1-2 weeks. Assess functional impairment. Screen for bipolar disorder before starting antidepressant. Safety planning if any suicidal ideation.';
  } else {
    riskLevel = 'Severe';
    severityLabel = 'Severe depression';
    recommendation = 'Severe depression. Initiate antidepressant medication with close follow-up (1-2 weeks). Combination therapy (medication + psychotherapy) recommended. Psychiatric referral strongly advised. Assess suicidality and safety. Consider hospitalization if imminent danger. ECT consideration for treatment-resistant or severe cases.';
  }

  // Critical safety flag for item 9
  const suicidalityWarning = input.suicidal_thoughts > 0
    ? ' SAFETY ALERT: Patient endorsed suicidal thoughts (item 9). Immediate safety assessment required regardless of total score. Evaluate intent, plan, access to means, and protective factors. Consider crisis intervention.'
    : '';

  return {
    scoreName: 'PHQ-9',
    score,
    maxScore: 27,
    riskLevel,
    interpretation: `PHQ-9 score ${score}/27. ${severityLabel}.${suicidalityWarning}`,
    recommendation,
    components,
    reference: 'Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.',
  };
}

/**
 * AUDIT-C (Alcohol Use Disorders Identification Test - Consumption)
 * Brief alcohol screening tool (first 3 questions of the full AUDIT).
 * Score range 0-12.
 */
export function calculateAUDITC(input: {
  drinking_frequency: 0 | 1 | 2 | 3 | 4;
  typical_quantity: 0 | 1 | 2 | 3 | 4;
  binge_frequency: 0 | 1 | 2 | 3 | 4;
  sex?: 'male' | 'female';
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  // Question 1: How often do you have a drink containing alcohol?
  const frequencyDesc: Record<number, string> = {
    0: 'Never',
    1: 'Monthly or less',
    2: '2-4 times a month',
    3: '2-3 times a week',
    4: '4 or more times a week',
  };
  components['1. Drinking frequency'] = { value: input.drinking_frequency, description: frequencyDesc[input.drinking_frequency] };
  score += input.drinking_frequency;

  // Question 2: How many drinks on a typical drinking day?
  const quantityDesc: Record<number, string> = {
    0: '1-2 drinks',
    1: '3-4 drinks',
    2: '5-6 drinks',
    3: '7-9 drinks',
    4: '10 or more drinks',
  };
  components['2. Typical quantity'] = { value: input.typical_quantity, description: quantityDesc[input.typical_quantity] };
  score += input.typical_quantity;

  // Question 3: How often do you have 6 or more drinks on one occasion?
  const bingeDesc: Record<number, string> = {
    0: 'Never',
    1: 'Less than monthly',
    2: 'Monthly',
    3: 'Weekly',
    4: 'Daily or almost daily',
  };
  components['3. Binge frequency (6+ drinks)'] = { value: input.binge_frequency, description: bingeDesc[input.binge_frequency] };
  score += input.binge_frequency;

  // Determine cutoff based on sex
  const cutoff = input.sex === 'female' ? 3 : 4;
  const isPositive = score >= cutoff;

  let riskLevel: string;
  let recommendation: string;

  if (score === 0) {
    riskLevel = 'Abstinent';
    recommendation = 'Non-drinker. No alcohol-related intervention needed. Document in health record.';
  } else if (!isPositive) {
    riskLevel = 'Low risk';
    recommendation = `Negative screen (below threshold of ${cutoff} for ${input.sex === 'female' ? 'women' : input.sex === 'male' ? 'men' : 'standard cutoff'}). Low-risk drinking. Brief reinforcement of safe drinking limits. Reassess annually.`;
  } else if (score <= 7) {
    riskLevel = 'At-risk/Hazardous';
    recommendation = `Positive screen (≥${cutoff}). At-risk or hazardous drinking. Perform brief intervention (SBIRT): provide feedback, advise moderation or abstinence, assess readiness to change. Consider full AUDIT or AUDIT-10 for further evaluation. Screen for alcohol-related medical complications. Reassess at follow-up.`;
  } else {
    riskLevel = 'High risk/Likely AUD';
    recommendation = `High AUDIT-C score suggesting likely alcohol use disorder. Complete full AUDIT assessment. Screen for alcohol withdrawal risk, liver disease, and nutritional deficiencies. Referral to addiction medicine or behavioral health. Consider pharmacotherapy (naltrexone, acamprosate, or disulfiram). Assess for comorbid psychiatric conditions.`;
  }

  const sexNote = input.sex
    ? ` (cutoff ≥${cutoff} for ${input.sex === 'female' ? 'women' : 'men'})`
    : ' (standard cutoff ≥4; use ≥3 for women)';

  return {
    scoreName: 'AUDIT-C',
    score,
    maxScore: 12,
    riskLevel,
    interpretation: `AUDIT-C score ${score}/12. ${isPositive ? 'Positive' : 'Negative'} screen${sexNote}. ${riskLevel}.`,
    recommendation,
    components,
    reference: 'Bush K, et al. The AUDIT alcohol consumption questions (AUDIT-C): an effective brief screening test for problem drinking. Arch Intern Med. 1998;158(16):1789-1795.',
  };
}

/**
 * GAD-7 (Generalized Anxiety Disorder 7-item scale)
 * Validated screening tool for generalized anxiety disorder.
 * Score range 0-21.
 */
export function calculateGAD7(input: {
  feeling_nervous: 0 | 1 | 2 | 3;
  uncontrollable_worry: 0 | 1 | 2 | 3;
  excessive_worry: 0 | 1 | 2 | 3;
  trouble_relaxing: 0 | 1 | 2 | 3;
  restlessness: 0 | 1 | 2 | 3;
  irritability: 0 | 1 | 2 | 3;
  feeling_afraid: 0 | 1 | 2 | 3;
}): RiskScoreResult {
  const components: Record<string, { value: number; description: string }> = {};
  let score = 0;

  const frequencyDesc: Record<number, string> = {
    0: 'Not at all',
    1: 'Several days',
    2: 'More than half the days',
    3: 'Nearly every day',
  };

  // Item 1: Feeling nervous, anxious, or on edge
  components['1. Feeling nervous, anxious, or on edge'] = { value: input.feeling_nervous, description: frequencyDesc[input.feeling_nervous] };
  score += input.feeling_nervous;

  // Item 2: Not being able to stop or control worrying
  components['2. Not being able to stop or control worrying'] = { value: input.uncontrollable_worry, description: frequencyDesc[input.uncontrollable_worry] };
  score += input.uncontrollable_worry;

  // Item 3: Worrying too much about different things
  components['3. Worrying too much about different things'] = { value: input.excessive_worry, description: frequencyDesc[input.excessive_worry] };
  score += input.excessive_worry;

  // Item 4: Trouble relaxing
  components['4. Trouble relaxing'] = { value: input.trouble_relaxing, description: frequencyDesc[input.trouble_relaxing] };
  score += input.trouble_relaxing;

  // Item 5: Being so restless that it is hard to sit still
  components['5. Being so restless that it is hard to sit still'] = { value: input.restlessness, description: frequencyDesc[input.restlessness] };
  score += input.restlessness;

  // Item 6: Becoming easily annoyed or irritable
  components['6. Becoming easily annoyed or irritable'] = { value: input.irritability, description: frequencyDesc[input.irritability] };
  score += input.irritability;

  // Item 7: Feeling afraid as if something awful might happen
  components['7. Feeling afraid as if something awful might happen'] = { value: input.feeling_afraid, description: frequencyDesc[input.feeling_afraid] };
  score += input.feeling_afraid;

  let riskLevel: string;
  let recommendation: string;
  let severityLabel: string;

  if (score <= 4) {
    riskLevel = 'Minimal';
    severityLabel = 'Minimal anxiety';
    recommendation = 'Minimal anxiety symptoms. No specific treatment indicated. Educate about stress management techniques. Rescreen if clinical concern arises or at routine health maintenance visits.';
  } else if (score <= 9) {
    riskLevel = 'Mild';
    severityLabel = 'Mild anxiety';
    recommendation = 'Mild anxiety. Monitor and reassess with repeat GAD-7. Recommend self-management strategies: regular exercise, sleep hygiene, mindfulness/relaxation techniques, caffeine reduction. Consider referral for psychotherapy (CBT) if symptoms persist. Rule out medical causes (thyroid, cardiac).';
  } else if (score <= 14) {
    riskLevel = 'Moderate';
    severityLabel = 'Moderate anxiety';
    recommendation = 'Moderate anxiety. Active treatment warranted. First-line options: CBT (psychotherapy) and/or SSRI/SNRI pharmacotherapy. If medication started, follow up in 2-4 weeks. Screen for comorbid depression (PHQ-9). Rule out medical causes (thyroid dysfunction, cardiac arrhythmia, medication side effects). Assess functional impairment.';
  } else {
    riskLevel = 'Severe';
    severityLabel = 'Severe anxiety';
    recommendation = 'Severe anxiety. Initiate treatment with SSRI/SNRI (first-line) and refer for psychotherapy (CBT). Combination therapy (medication + CBT) most effective for severe GAD. Psychiatric referral recommended. Assess for panic disorder, social anxiety, PTSD, and comorbid depression. Short-term benzodiazepine may be considered for acute distress but avoid long-term use. Assess functional impairment and occupational impact.';
  }

  const furtherEvalNote = score >= 10
    ? ' Score ≥10 has 89% sensitivity and 82% specificity for GAD. Further diagnostic evaluation recommended.'
    : '';

  return {
    scoreName: 'GAD-7',
    score,
    maxScore: 21,
    riskLevel,
    interpretation: `GAD-7 score ${score}/21. ${severityLabel}.${furtherEvalNote}`,
    recommendation,
    components,
    reference: 'Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006;166(10):1092-1097.',
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
  { name: 'SOFA', description: 'Sequential Organ Failure Assessment for ICU mortality', function: 'calculateSOFA' },
  { name: 'Child-Pugh', description: 'Chronic liver disease classification and prognosis', function: 'calculateChildPugh' },
  { name: 'ASCVD', description: '10-year atherosclerotic cardiovascular disease risk (Pooled Cohort Equations)', function: 'calculateASCVD' },
  { name: 'NEWS2', description: 'National Early Warning Score 2 for acute deterioration detection', function: 'calculateNEWS2' },
  { name: 'HAS-BLED', description: 'Bleeding risk on anticoagulation (pairs with CHA2DS2-VASc)', function: 'calculateHASBLED' },
  { name: 'TIMI', description: 'TIMI risk score for UA/NSTEMI (14-day event risk)', function: 'calculateTIMI' },
  { name: 'ABCD2', description: 'Short-term stroke risk after TIA', function: 'calculateABCD2' },
  { name: 'BMI', description: 'Body mass index with WHO classification', function: 'calculateBMI' },
  { name: 'Framingham', description: '10-year coronary heart disease risk (ATP III)', function: 'calculateFramingham' },
  { name: 'APACHE II', description: 'ICU mortality prediction (Acute Physiology and Chronic Health Evaluation)', function: 'calculateAPACHEII' },
  { name: 'PESI', description: 'Pulmonary Embolism Severity Index (30-day mortality)', function: 'calculatePESI' },
  { name: 'mRS', description: 'Modified Rankin Scale for stroke disability assessment', function: 'calculateModifiedRankin' },
  { name: 'Morse Fall Scale', description: 'Fall risk assessment for acute care patients', function: 'calculateMorseFallScale' },
  { name: 'NIHSS', description: 'NIH Stroke Scale for stroke severity assessment and tPA eligibility', function: 'calculateNIHSS' },
  { name: 'PHQ-9', description: 'Patient Health Questionnaire-9 for depression screening', function: 'calculatePHQ9' },
  { name: 'AUDIT-C', description: 'Alcohol Use Disorders Identification Test (Consumption) for alcohol screening', function: 'calculateAUDITC' },
  { name: 'GAD-7', description: 'Generalized Anxiety Disorder 7-item scale for anxiety screening', function: 'calculateGAD7' },
] as const;

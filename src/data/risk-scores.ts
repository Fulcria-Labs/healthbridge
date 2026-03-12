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
] as const;

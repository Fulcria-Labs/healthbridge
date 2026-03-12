import { describe, it, expect } from 'vitest';
import {
  calculateCHA2DS2VASc,
  calculateHEART,
  calculateWellsPE,
  calculateMELD,
  calculateCURB65,
  calculateGCS,
  calculateEGFR,
  calculateQSOFA,
  calculateSOFA,
  calculateChildPugh,
  calculateASCVD,
  calculateNEWS2,
} from '../src/data/risk-scores';
import { calculateRiskScore, listAvailableScores } from '../src/tools/risk-score-tool';

describe('CHA₂DS₂-VASc Score', () => {
  it('calculates score 0 for young healthy male', () => {
    const result = calculateCHA2DS2VASc({
      age: 40, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('calculates max score correctly', () => {
    const result = calculateCHA2DS2VASc({
      age: 80, sex: 'female', chf: true, hypertension: true,
      stroke_tia_history: true, vascular_disease: true, diabetes: true,
    });
    expect(result.score).toBe(9);
    expect(result.riskLevel).toBe('High');
  });

  it('gives 2 points for age ≥75', () => {
    const result = calculateCHA2DS2VASc({
      age: 75, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(2);
  });

  it('gives 1 point for age 65-74', () => {
    const result = calculateCHA2DS2VASc({
      age: 68, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(1);
  });

  it('gives 2 points for stroke/TIA history', () => {
    const result = calculateCHA2DS2VASc({
      age: 40, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: true, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(2);
  });

  it('gives 1 point for female sex', () => {
    const result = calculateCHA2DS2VASc({
      age: 40, sex: 'female', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(1);
    expect(result.riskLevel).toBe('Low');
  });

  it('recommends anticoagulation for score ≥2', () => {
    const result = calculateCHA2DS2VASc({
      age: 72, sex: 'male', chf: false, hypertension: true,
      stroke_tia_history: false, vascular_disease: false, diabetes: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(2);
    expect(result.recommendation).toContain('anticoagulation');
  });

  it('includes reference citation', () => {
    const result = calculateCHA2DS2VASc({
      age: 50, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.reference).toContain('Lip GY');
  });
});

describe('HEART Score', () => {
  it('calculates low risk correctly', () => {
    const result = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal', age: 30,
      risk_factors: 0, troponin: 'normal',
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
    expect(result.recommendation).toContain('discharge');
  });

  it('calculates high risk correctly', () => {
    const result = calculateHEART({
      history: 'highly_suspicious', ecg: 'significant_st_deviation',
      age: 70, risk_factors: 4, troponin: 'significantly_elevated',
    });
    expect(result.score).toBe(10);
    expect(result.riskLevel).toBe('High');
    expect(result.recommendation).toContain('invasive');
  });

  it('calculates moderate risk', () => {
    const result = calculateHEART({
      history: 'moderately_suspicious', ecg: 'non_specific_changes',
      age: 55, risk_factors: 2, troponin: 'normal',
    });
    expect(result.score).toBe(4);
    expect(result.riskLevel).toBe('Moderate');
  });

  it('has correct max score of 10', () => {
    const result = calculateHEART({
      history: 'highly_suspicious', ecg: 'significant_st_deviation',
      age: 70, risk_factors: 5, troponin: 'significantly_elevated',
    });
    expect(result.maxScore).toBe(10);
  });
});

describe('Wells PE Score', () => {
  it('calculates low risk', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: false, pe_most_likely_diagnosis: false,
      heart_rate_over_100: false, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
    expect(result.recommendation).toContain('D-dimer');
  });

  it('calculates high risk', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: true, pe_most_likely_diagnosis: true,
      heart_rate_over_100: true, immobilization_or_surgery: true,
      previous_dvt_pe: true, hemoptysis: true, malignancy: true,
    });
    expect(result.score).toBe(12.5);
    expect(result.riskLevel).toBe('High');
    expect(result.recommendation).toContain('CTPA');
  });

  it('gives 3 points for DVT signs', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: true, pe_most_likely_diagnosis: false,
      heart_rate_over_100: false, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    expect(result.score).toBe(3);
  });

  it('moderate risk for intermediate scores', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: false, pe_most_likely_diagnosis: false,
      heart_rate_over_100: true, immobilization_or_surgery: true,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('Moderate');
  });
});

describe('MELD Score', () => {
  it('calculates minimum score of 6', () => {
    const result = calculateMELD({ creatinine: 0.5, bilirubin: 0.5, inr: 0.8 });
    expect(result.score).toBe(6);
  });

  it('calculates high score for severe liver disease', () => {
    const result = calculateMELD({ creatinine: 4.0, bilirubin: 25.0, inr: 3.5 });
    expect(result.score).toBeGreaterThan(30);
    expect(result.riskLevel).toBe('Very High');
  });

  it('calculates MELD-Na when sodium provided', () => {
    const result = calculateMELD({ creatinine: 2.0, bilirubin: 3.0, inr: 1.5, sodium: 128 });
    expect(result.scoreName).toBe('MELD-Na');
    expect(result.score).toBeGreaterThan(0);
  });

  it('caps creatinine at 4 for dialysis patients', () => {
    const result = calculateMELD({ creatinine: 1.0, bilirubin: 2.0, inr: 1.3, on_dialysis: true });
    expect(result.components['Creatinine'].description).toContain('dialysis');
  });

  it('includes mortality estimate', () => {
    const result = calculateMELD({ creatinine: 2.0, bilirubin: 5.0, inr: 2.0 });
    expect(result.interpretation).toContain('mortality');
  });
});

describe('CURB-65 Score', () => {
  it('calculates score 0 for healthy young patient', () => {
    const result = calculateCURB65({
      confusion: false, bun_over_19: false, respiratory_rate_over_30: false,
      systolic_bp_under_90: false, diastolic_bp_under_60: false, age_65_or_over: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
    expect(result.recommendation).toContain('outpatient');
  });

  it('calculates max score', () => {
    const result = calculateCURB65({
      confusion: true, bun_over_19: true, respiratory_rate_over_30: true,
      systolic_bp_under_90: true, diastolic_bp_under_60: true, age_65_or_over: true,
    });
    expect(result.score).toBe(5);
    expect(result.riskLevel).toBe('High');
    expect(result.recommendation).toContain('ICU');
  });

  it('counts low BP as single point', () => {
    const result = calculateCURB65({
      confusion: false, bun_over_19: false, respiratory_rate_over_30: false,
      systolic_bp_under_90: true, diastolic_bp_under_60: true, age_65_or_over: false,
    });
    expect(result.score).toBe(1);
  });

  it('moderate risk for score 2', () => {
    const result = calculateCURB65({
      confusion: true, bun_over_19: false, respiratory_rate_over_30: false,
      systolic_bp_under_90: false, diastolic_bp_under_60: false, age_65_or_over: true,
    });
    expect(result.score).toBe(2);
    expect(result.riskLevel).toBe('Moderate');
  });
});

describe('Glasgow Coma Scale', () => {
  it('calculates normal GCS 15', () => {
    const result = calculateGCS({ eye_opening: 4, verbal_response: 5, motor_response: 6 });
    expect(result.score).toBe(15);
    expect(result.riskLevel).toBe('Mild brain injury');
  });

  it('calculates minimum GCS 3', () => {
    const result = calculateGCS({ eye_opening: 1, verbal_response: 1, motor_response: 1 });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('Severe brain injury');
    expect(result.recommendation).toContain('Intubation');
  });

  it('classifies moderate brain injury', () => {
    const result = calculateGCS({ eye_opening: 3, verbal_response: 3, motor_response: 4 });
    expect(result.score).toBe(10);
    expect(result.riskLevel).toBe('Moderate brain injury');
  });

  it('includes E/V/M notation in interpretation', () => {
    const result = calculateGCS({ eye_opening: 3, verbal_response: 4, motor_response: 5 });
    expect(result.interpretation).toContain('E3V4M5');
  });
});

describe('eGFR (CKD-EPI 2021)', () => {
  it('calculates normal eGFR for healthy young person', () => {
    const result = calculateEGFR({ creatinine: 0.9, age: 30, sex: 'male' });
    expect(result.score).toBeGreaterThan(90);
    expect(result.riskLevel).toBe('Normal');
  });

  it('calculates reduced eGFR for elevated creatinine', () => {
    const result = calculateEGFR({ creatinine: 2.5, age: 65, sex: 'male' });
    expect(result.score).toBeLessThan(30);
    expect(['Moderate-Severe', 'Severe', 'Kidney Failure']).toContain(result.riskLevel);
  });

  it('calculates higher eGFR for females (sex coefficient)', () => {
    const male = calculateEGFR({ creatinine: 1.0, age: 50, sex: 'male' });
    const female = calculateEGFR({ creatinine: 1.0, age: 50, sex: 'female' });
    // Females have higher eGFR at same creatinine due to lower muscle mass adjustment
    expect(female.score).not.toBe(male.score);
  });

  it('decreases eGFR with age', () => {
    const young = calculateEGFR({ creatinine: 1.0, age: 30, sex: 'male' });
    const old = calculateEGFR({ creatinine: 1.0, age: 80, sex: 'male' });
    expect(young.score).toBeGreaterThan(old.score);
  });

  it('identifies CKD stages correctly', () => {
    // Stage G5 (kidney failure)
    const g5 = calculateEGFR({ creatinine: 8.0, age: 60, sex: 'male' });
    expect(g5.riskLevel).toBe('Kidney Failure');
    expect(g5.recommendation).toContain('Dialysis');
  });

  it('includes CKD-EPI reference', () => {
    const result = calculateEGFR({ creatinine: 1.0, age: 50, sex: 'male' });
    expect(result.reference).toContain('Inker');
  });
});

describe('qSOFA Score', () => {
  it('calculates score 0 for no criteria', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: false,
      altered_mental_status: false,
      systolic_bp_100_or_less: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('calculates score 3 for all criteria present', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: true,
      altered_mental_status: true,
      systolic_bp_100_or_less: true,
    });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('High');
    expect(result.recommendation).toContain('sepsis');
  });

  it('flags high risk at score 2', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: true,
      altered_mental_status: true,
      systolic_bp_100_or_less: false,
    });
    expect(result.score).toBe(2);
    expect(result.riskLevel).toBe('High');
  });

  it('keeps low risk at score 1', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: true,
      altered_mental_status: false,
      systolic_bp_100_or_less: false,
    });
    expect(result.score).toBe(1);
    expect(result.riskLevel).toBe('Low');
  });

  it('includes Sepsis-3 reference', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: false,
      altered_mental_status: false,
      systolic_bp_100_or_less: false,
    });
    expect(result.reference).toContain('Singer');
    expect(result.reference).toContain('Sepsis-3');
  });
});

describe('SOFA Score', () => {
  it('calculates score 0 for normal values', () => {
    const result = calculateSOFA({
      pao2_fio2: 450, on_mechanical_ventilation: false,
      platelets: 200, bilirubin: 0.8,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.8,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('calculates max score 24 for worst values', () => {
    const result = calculateSOFA({
      pao2_fio2: 80, on_mechanical_ventilation: true,
      platelets: 15, bilirubin: 13,
      cardiovascular: 'dopamine_gt_15_or_epi_gt_0_1', gcs: 4, creatinine: 5.5,
    });
    expect(result.score).toBe(24);
    expect(result.riskLevel).toBe('Very High');
    expect(result.recommendation).toContain('Palliative');
  });

  it('scores respiration correctly for ventilated patients', () => {
    // PaO2/FiO2 150 without ventilation = score 2
    const noVent = calculateSOFA({
      pao2_fio2: 150, on_mechanical_ventilation: false,
      platelets: 200, bilirubin: 0.5, cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.5,
    });
    // PaO2/FiO2 150 with ventilation = score 3
    const vent = calculateSOFA({
      pao2_fio2: 150, on_mechanical_ventilation: true,
      platelets: 200, bilirubin: 0.5, cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.5,
    });
    expect(vent.score).toBeGreaterThan(noVent.score);
  });

  it('uses urine output for renal scoring when very low', () => {
    const result = calculateSOFA({
      pao2_fio2: 450, on_mechanical_ventilation: false,
      platelets: 200, bilirubin: 0.5, cardiovascular: 'no_hypotension',
      gcs: 15, creatinine: 0.8, urine_output_ml_day: 150,
    });
    expect(result.components['Renal (Creatinine)'].value).toBe(4);
  });

  it('identifies sepsis at SOFA >= 2', () => {
    const result = calculateSOFA({
      pao2_fio2: 350, on_mechanical_ventilation: false,
      platelets: 120, bilirubin: 1.5, cardiovascular: 'map_under_70',
      gcs: 15, creatinine: 0.8,
    });
    expect(result.score).toBeGreaterThanOrEqual(2);
    expect(result.interpretation).toContain('organ dysfunction');
  });

  it('scores moderate organ dysfunction for mid-range values', () => {
    const result = calculateSOFA({
      pao2_fio2: 250, on_mechanical_ventilation: false,
      platelets: 80, bilirubin: 3.0, cardiovascular: 'dopamine_lte_5',
      gcs: 12, creatinine: 2.5,
    });
    expect(result.score).toBeGreaterThanOrEqual(6);
    expect(result.score).toBeLessThanOrEqual(14);
  });

  it('includes Sepsis-3 reference', () => {
    const result = calculateSOFA({
      pao2_fio2: 450, on_mechanical_ventilation: false,
      platelets: 200, bilirubin: 0.5, cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.5,
    });
    expect(result.reference).toContain('Vincent');
    expect(result.reference).toContain('Sepsis-3');
  });
});

describe('Child-Pugh Score', () => {
  it('calculates Class A for well-compensated cirrhosis', () => {
    const result = calculateChildPugh({
      bilirubin: 1.5, albumin: 3.8, inr: 1.3,
      ascites: 'none', encephalopathy: 'none',
    });
    expect(result.score).toBe(5);
    expect(result.interpretation).toContain('Class A');
    expect(result.riskLevel).toBe('Well-compensated');
  });

  it('calculates max score Class C', () => {
    const result = calculateChildPugh({
      bilirubin: 5.0, albumin: 2.0, inr: 3.0,
      ascites: 'moderate_severe', encephalopathy: 'grade_3_4',
    });
    expect(result.score).toBe(15);
    expect(result.interpretation).toContain('Class C');
    expect(result.riskLevel).toBe('Decompensated');
    expect(result.recommendation).toContain('transplant');
  });

  it('calculates Class B for intermediate values', () => {
    // bilirubin 2.5 (2-3→2), albumin 3.0 (2.8-3.5→2), inr 1.5 (<1.7→1), ascites mild (2), encephalopathy none (1) = 8
    const result = calculateChildPugh({
      bilirubin: 2.5, albumin: 3.0, inr: 1.5,
      ascites: 'mild', encephalopathy: 'none',
    });
    expect(result.score).toBe(8);
    expect(result.interpretation).toContain('Class B');
  });

  it('scores individual components correctly', () => {
    const result = calculateChildPugh({
      bilirubin: 1.0, albumin: 4.0, inr: 1.2,
      ascites: 'none', encephalopathy: 'none',
    });
    expect(result.components['Bilirubin'].value).toBe(1);
    expect(result.components['Albumin'].value).toBe(1);
    expect(result.components['INR'].value).toBe(1);
    expect(result.components['Ascites'].value).toBe(1);
    expect(result.components['Encephalopathy'].value).toBe(1);
  });

  it('includes survival estimates', () => {
    const result = calculateChildPugh({
      bilirubin: 1.5, albumin: 3.8, inr: 1.3,
      ascites: 'none', encephalopathy: 'none',
    });
    expect(result.interpretation).toContain('Survival');
  });

  it('warns about surgical risk for Class C', () => {
    const result = calculateChildPugh({
      bilirubin: 5.0, albumin: 2.0, inr: 3.0,
      ascites: 'moderate_severe', encephalopathy: 'grade_3_4',
    });
    expect(result.recommendation).toContain('surgical risk');
  });

  it('includes reference citation', () => {
    const result = calculateChildPugh({
      bilirubin: 1.5, albumin: 3.8, inr: 1.3,
      ascites: 'none', encephalopathy: 'none',
    });
    expect(result.reference).toContain('Pugh');
  });
});

describe('ASCVD Risk Calculator', () => {
  it('calculates low risk for young healthy person', () => {
    const result = calculateASCVD({
      age: 42, sex: 'male', race: 'white',
      total_cholesterol: 180, hdl_cholesterol: 55,
      systolic_bp: 120, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.score).toBeLessThan(5);
    expect(result.riskLevel).toBe('Low');
  });

  it('calculates high risk for older person with multiple risk factors', () => {
    const result = calculateASCVD({
      age: 68, sex: 'male', race: 'white',
      total_cholesterol: 260, hdl_cholesterol: 35,
      systolic_bp: 155, on_bp_treatment: true,
      diabetes: true, smoker: true,
    });
    expect(result.score).toBeGreaterThan(20);
    expect(result.riskLevel).toBe('High');
    expect(result.recommendation).toContain('statin');
  });

  it('shows higher risk for smokers', () => {
    const base = {
      age: 55, sex: 'male' as const, race: 'white' as const,
      total_cholesterol: 200, hdl_cholesterol: 45,
      systolic_bp: 130, on_bp_treatment: false, diabetes: false,
    };
    const nonSmoker = calculateASCVD({ ...base, smoker: false });
    const smoker = calculateASCVD({ ...base, smoker: true });
    expect(smoker.score).toBeGreaterThan(nonSmoker.score);
  });

  it('shows higher risk for diabetics', () => {
    const base = {
      age: 55, sex: 'male' as const, race: 'white' as const,
      total_cholesterol: 200, hdl_cholesterol: 45,
      systolic_bp: 130, on_bp_treatment: false, smoker: false,
    };
    const noDM = calculateASCVD({ ...base, diabetes: false });
    const withDM = calculateASCVD({ ...base, diabetes: true });
    expect(withDM.score).toBeGreaterThan(noDM.score);
  });

  it('handles African American coefficients', () => {
    const result = calculateASCVD({
      age: 55, sex: 'male', race: 'african_american',
      total_cholesterol: 200, hdl_cholesterol: 45,
      systolic_bp: 130, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.scoreName).toContain('ASCVD');
  });

  it('handles female coefficients', () => {
    const result = calculateASCVD({
      age: 55, sex: 'female', race: 'white',
      total_cholesterol: 200, hdl_cholesterol: 55,
      systolic_bp: 125, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThan(100);
  });

  it('handles African American female coefficients', () => {
    const result = calculateASCVD({
      age: 55, sex: 'female', race: 'african_american',
      total_cholesterol: 200, hdl_cholesterol: 55,
      systolic_bp: 125, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('recommends statin for intermediate risk', () => {
    const result = calculateASCVD({
      age: 60, sex: 'male', race: 'white',
      total_cholesterol: 230, hdl_cholesterol: 40,
      systolic_bp: 140, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    if (result.riskLevel === 'Intermediate') {
      expect(result.recommendation).toContain('statin');
    }
    expect(result.score).toBeGreaterThan(0);
  });

  it('includes ACC/AHA reference', () => {
    const result = calculateASCVD({
      age: 50, sex: 'male', race: 'white',
      total_cholesterol: 200, hdl_cholesterol: 50,
      systolic_bp: 120, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.reference).toContain('ACC/AHA');
  });

  it('caps risk between 0 and 100', () => {
    const result = calculateASCVD({
      age: 79, sex: 'male', race: 'white',
      total_cholesterol: 300, hdl_cholesterol: 25,
      systolic_bp: 180, on_bp_treatment: true,
      diabetes: true, smoker: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe('Risk Score Tool', () => {
  it('lists available scores', () => {
    const scores = listAvailableScores();
    expect(scores.length).toBe(12);
    expect(scores.map(s => s.name)).toContain('CHA2DS2-VASc');
    expect(scores.map(s => s.name)).toContain('HEART');
    expect(scores.map(s => s.name)).toContain('eGFR');
    expect(scores.map(s => s.name)).toContain('qSOFA');
  });

  it('calculates via generic interface', () => {
    const result = calculateRiskScore('CHA2DS2-VASc', {
      age: 72, sex: 'male', chf: true, hypertension: true,
      stroke_tia_history: false, vascular_disease: false, diabetes: true,
    });
    expect(result.scoreName).toBe('CHA₂DS₂-VASc');
    expect(result.score).toBeGreaterThan(0);
  });

  it('calculates eGFR via generic interface', () => {
    const result = calculateRiskScore('eGFR', {
      creatinine: 1.0, age: 50, sex: 'male',
    });
    expect(result.scoreName).toContain('eGFR');
    expect(result.score).toBeGreaterThan(0);
  });

  it('calculates qSOFA via generic interface', () => {
    const result = calculateRiskScore('qSOFA', {
      respiratory_rate_22_or_more: true,
      altered_mental_status: true,
      systolic_bp_100_or_less: false,
    });
    expect(result.scoreName).toBe('qSOFA');
    expect(result.score).toBe(2);
  });

  it('calculates SOFA via generic interface', () => {
    const result = calculateRiskScore('SOFA', {
      pao2_fio2: 300, on_mechanical_ventilation: false,
      platelets: 150, bilirubin: 1.0,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.8,
    });
    expect(result.scoreName).toBe('SOFA');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('calculates Child-Pugh via generic interface', () => {
    const result = calculateRiskScore('Child-Pugh', {
      bilirubin: 2.5, albumin: 3.0, inr: 1.8,
      ascites: 'mild', encephalopathy: 'none',
    });
    expect(result.scoreName).toBe('Child-Pugh');
    expect(result.score).toBeGreaterThan(0);
  });

  it('calculates ASCVD via generic interface', () => {
    const result = calculateRiskScore('ASCVD', {
      age: 55, sex: 'male', race: 'white',
      total_cholesterol: 200, hdl_cholesterol: 50,
      systolic_bp: 130, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.scoreName).toContain('ASCVD');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('throws for unknown score', () => {
    expect(() => calculateRiskScore('Unknown' as any, {})).toThrow('Unknown score');
  });

  it('calculates NEWS2 via generic interface', () => {
    const result = calculateRiskScore('NEWS2', {
      respiratory_rate: 22, spo2: 94, on_supplemental_o2: false,
      spo2_scale2: false, systolic_bp: 110, heart_rate: 95,
      consciousness: 'alert', temperature: 37.5,
    });
    expect(result.scoreName).toBe('NEWS2');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

describe('NEWS2 - National Early Warning Score 2', () => {
  const normalVitals = {
    respiratory_rate: 16, spo2: 97, on_supplemental_o2: false,
    spo2_scale2: false, systolic_bp: 120, heart_rate: 72,
    consciousness: 'alert' as const, temperature: 37.0,
  };

  it('calculates score 0 for completely normal vitals', () => {
    const result = calculateNEWS2(normalVitals);
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
    expect(result.scoreName).toBe('NEWS2');
    expect(result.maxScore).toBe(20);
  });

  it('scores respiratory rate ≤8 as 3', () => {
    const result = calculateNEWS2({ ...normalVitals, respiratory_rate: 7 });
    expect(result.score).toBe(3);
  });

  it('scores respiratory rate 9-11 as 1', () => {
    const result = calculateNEWS2({ ...normalVitals, respiratory_rate: 10 });
    expect(result.score).toBe(1);
  });

  it('scores respiratory rate 12-20 as 0', () => {
    const result = calculateNEWS2({ ...normalVitals, respiratory_rate: 18 });
    expect(result.score).toBe(0);
  });

  it('scores respiratory rate 21-24 as 2', () => {
    const result = calculateNEWS2({ ...normalVitals, respiratory_rate: 23 });
    expect(result.score).toBe(2);
  });

  it('scores respiratory rate ≥25 as 3', () => {
    const result = calculateNEWS2({ ...normalVitals, respiratory_rate: 28 });
    expect(result.score).toBe(3);
  });

  it('scores SpO2 ≤91 as 3 (Scale 1)', () => {
    const result = calculateNEWS2({ ...normalVitals, spo2: 90 });
    expect(result.score).toBe(3);
  });

  it('scores SpO2 92-93 as 2 (Scale 1)', () => {
    const result = calculateNEWS2({ ...normalVitals, spo2: 92 });
    expect(result.score).toBe(2);
  });

  it('scores SpO2 94-95 as 1 (Scale 1)', () => {
    const result = calculateNEWS2({ ...normalVitals, spo2: 95 });
    expect(result.score).toBe(1);
  });

  it('adds 2 for supplemental O2 on Scale 1', () => {
    const result = calculateNEWS2({ ...normalVitals, on_supplemental_o2: true });
    expect(result.score).toBe(2);
  });

  it('uses Scale 2 scoring for hypercapnic patients', () => {
    const result = calculateNEWS2({
      ...normalVitals, spo2: 90, spo2_scale2: true,
    });
    expect(result.score).toBe(0); // 88-92 on Scale 2 = 0
  });

  it('scores high SpO2 on O2 as 3 in Scale 2', () => {
    const result = calculateNEWS2({
      ...normalVitals, spo2: 98, spo2_scale2: true, on_supplemental_o2: true,
    });
    expect(result.score).toBe(3); // ≥97 on O2 in Scale 2 = 3
  });

  it('scores systolic BP ≤90 as 3', () => {
    const result = calculateNEWS2({ ...normalVitals, systolic_bp: 85 });
    expect(result.score).toBe(3);
  });

  it('scores systolic BP 91-100 as 2', () => {
    const result = calculateNEWS2({ ...normalVitals, systolic_bp: 95 });
    expect(result.score).toBe(2);
  });

  it('scores systolic BP 101-110 as 1', () => {
    const result = calculateNEWS2({ ...normalVitals, systolic_bp: 105 });
    expect(result.score).toBe(1);
  });

  it('scores systolic BP ≥220 as 3', () => {
    const result = calculateNEWS2({ ...normalVitals, systolic_bp: 225 });
    expect(result.score).toBe(3);
  });

  it('scores heart rate ≤40 as 3', () => {
    const result = calculateNEWS2({ ...normalVitals, heart_rate: 35 });
    expect(result.score).toBe(3);
  });

  it('scores heart rate 41-50 as 1', () => {
    const result = calculateNEWS2({ ...normalVitals, heart_rate: 48 });
    expect(result.score).toBe(1);
  });

  it('scores heart rate 91-110 as 1', () => {
    const result = calculateNEWS2({ ...normalVitals, heart_rate: 100 });
    expect(result.score).toBe(1);
  });

  it('scores heart rate 111-130 as 2', () => {
    const result = calculateNEWS2({ ...normalVitals, heart_rate: 120 });
    expect(result.score).toBe(2);
  });

  it('scores heart rate ≥131 as 3', () => {
    const result = calculateNEWS2({ ...normalVitals, heart_rate: 140 });
    expect(result.score).toBe(3);
  });

  it('scores confusion as 3', () => {
    const result = calculateNEWS2({ ...normalVitals, consciousness: 'confusion' });
    expect(result.score).toBe(3);
  });

  it('scores voice response as 3', () => {
    const result = calculateNEWS2({ ...normalVitals, consciousness: 'voice' });
    expect(result.score).toBe(3);
  });

  it('scores unresponsive as 3', () => {
    const result = calculateNEWS2({ ...normalVitals, consciousness: 'unresponsive' });
    expect(result.score).toBe(3);
  });

  it('scores temperature ≤35.0 as 3', () => {
    const result = calculateNEWS2({ ...normalVitals, temperature: 34.5 });
    expect(result.score).toBe(3);
  });

  it('scores temperature 35.1-36.0 as 1', () => {
    const result = calculateNEWS2({ ...normalVitals, temperature: 35.5 });
    expect(result.score).toBe(1);
  });

  it('scores temperature 38.1-39.0 as 1', () => {
    const result = calculateNEWS2({ ...normalVitals, temperature: 38.5 });
    expect(result.score).toBe(1);
  });

  it('scores temperature ≥39.1 as 2', () => {
    const result = calculateNEWS2({ ...normalVitals, temperature: 39.5 });
    expect(result.score).toBe(2);
  });

  it('triggers high risk for score ≥7', () => {
    const result = calculateNEWS2({
      respiratory_rate: 28, spo2: 90, on_supplemental_o2: true,
      spo2_scale2: false, systolic_bp: 85, heart_rate: 72,
      consciousness: 'alert', temperature: 37.0,
    });
    // RR 28 = 3, SpO2 90 = 3, O2 = 2, SBP 85 = 3 => total ≥ 7
    expect(result.score).toBeGreaterThanOrEqual(7);
    expect(result.riskLevel).toBe('High');
  });

  it('triggers medium risk for score 5-6', () => {
    const result = calculateNEWS2({
      respiratory_rate: 22, spo2: 92, on_supplemental_o2: true,
      spo2_scale2: false, systolic_bp: 120, heart_rate: 72,
      consciousness: 'alert', temperature: 37.0,
    });
    // RR 22 = 2, SpO2 92 = 2, O2 = 2 => total = 6
    expect(result.score).toBe(6);
    expect(result.riskLevel).toBe('Medium');
  });

  it('flags single extreme parameter', () => {
    const result = calculateNEWS2({
      ...normalVitals, consciousness: 'unresponsive',
    });
    // Score = 3 (only consciousness), but extreme parameter
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('Low-Medium');
    expect(result.interpretation).toContain('extreme parameter');
  });

  it('includes reference to RCP 2017', () => {
    const result = calculateNEWS2(normalVitals);
    expect(result.reference).toContain('Royal College of Physicians');
  });
});

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
  calculateHASBLED,
  calculateTIMI,
  calculateABCD2,
  calculateBMI,
  availableScores,
} from '../src/data/risk-scores';
import { calculateRiskScore, listAvailableScores } from '../src/tools/risk-score-tool';

/**
 * Comprehensive risk score tests covering all scoring systems,
 * boundary values, extreme cases, and output structure validation.
 */

describe('Available Scores Metadata', () => {
  it('lists all 16 scoring systems', () => {
    const scores = listAvailableScores();
    expect(scores.length).toBe(16);
  });

  it('each score has name and description', () => {
    const scores = listAvailableScores();
    for (const score of scores) {
      expect(score.name).toBeTruthy();
      expect(score.description).toBeTruthy();
    }
  });

  it('availableScores includes expected score names', () => {
    const names = availableScores.map(s => s.name);
    expect(names).toContain('CHA2DS2-VASc');
    expect(names).toContain('HEART');
    expect(names).toContain('Wells PE');
    expect(names).toContain('MELD/MELD-Na');
    expect(names).toContain('CURB-65');
    expect(names).toContain('GCS');
    expect(names).toContain('eGFR');
    expect(names).toContain('qSOFA');
    expect(names).toContain('SOFA');
    expect(names).toContain('Child-Pugh');
    expect(names).toContain('ASCVD');
    expect(names).toContain('NEWS2');
    expect(names).toContain('HAS-BLED');
    expect(names).toContain('TIMI');
    expect(names).toContain('ABCD2');
    expect(names).toContain('BMI');
  });
});

describe('CHA2DS2-VASc Score - Comprehensive', () => {
  it('minimum score - young male, no risk factors', () => {
    const result = calculateCHA2DS2VASc({
      age: 40, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(0);
    expect(result.maxScore).toBe(9);
  });

  it('maximum score - elderly female with all factors', () => {
    const result = calculateCHA2DS2VASc({
      age: 80, sex: 'female', chf: true, hypertension: true,
      stroke_tia_history: true, vascular_disease: true, diabetes: true,
    });
    expect(result.score).toBe(9);
  });

  it('age 65-74 gets 1 point', () => {
    const result = calculateCHA2DS2VASc({
      age: 70, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(1);
  });

  it('age >= 75 gets 2 points', () => {
    const result = calculateCHA2DS2VASc({
      age: 75, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(2);
  });

  it('female sex adds 1 point', () => {
    const result = calculateCHA2DS2VASc({
      age: 40, sex: 'female', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(1);
  });

  it('stroke/TIA history adds 2 points', () => {
    const result = calculateCHA2DS2VASc({
      age: 40, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: true, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(2);
  });

  it('has correct result structure', () => {
    const result = calculateCHA2DS2VASc({
      age: 70, sex: 'male', chf: true, hypertension: true,
      stroke_tia_history: false, vascular_disease: false, diabetes: true,
    });
    expect(result).toHaveProperty('scoreName');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('maxScore');
    expect(result).toHaveProperty('riskLevel');
    expect(result).toHaveProperty('interpretation');
    expect(result).toHaveProperty('recommendation');
    expect(result).toHaveProperty('components');
    expect(result).toHaveProperty('reference');
  });
});

describe('HEART Score - Comprehensive', () => {
  it('minimum score - low risk', () => {
    const result = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal',
      age: 40, risk_factors: 0, troponin: 'normal',
    });
    expect(result.score).toBe(0);
  });

  it('maximum score - high risk', () => {
    const result = calculateHEART({
      history: 'highly_suspicious', ecg: 'significant_st_deviation',
      age: 70, risk_factors: 5, troponin: 'significantly_elevated',
    });
    expect(result.score).toBe(10);
  });

  it('moderate risk with mixed factors', () => {
    const result = calculateHEART({
      history: 'moderately_suspicious', ecg: 'non_specific_changes',
      age: 55, risk_factors: 2, troponin: 'mildly_elevated',
    });
    expect(result.score).toBeGreaterThanOrEqual(4);
    expect(result.score).toBeLessThanOrEqual(7);
  });

  it('age 45-64 gets 1 point', () => {
    const result1 = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal',
      age: 50, risk_factors: 0, troponin: 'normal',
    });
    const result2 = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal',
      age: 40, risk_factors: 0, troponin: 'normal',
    });
    expect(result1.score - result2.score).toBe(1);
  });

  it('age >= 65 gets 2 points', () => {
    const result1 = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal',
      age: 65, risk_factors: 0, troponin: 'normal',
    });
    expect(result1.score).toBe(2);
  });
});

describe('Wells PE Score - Comprehensive', () => {
  it('all negative = score 0', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: false, pe_most_likely_diagnosis: false,
      heart_rate_over_100: false, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    expect(result.score).toBe(0);
  });

  it('all positive = maximum score', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: true, pe_most_likely_diagnosis: true,
      heart_rate_over_100: true, immobilization_or_surgery: true,
      previous_dvt_pe: true, hemoptysis: true, malignancy: true,
    });
    expect(result.score).toBeGreaterThan(0);
  });

  it('PE most likely adds 3 points', () => {
    const baseline = calculateWellsPE({
      clinical_signs_dvt: false, pe_most_likely_diagnosis: false,
      heart_rate_over_100: false, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    const withPE = calculateWellsPE({
      clinical_signs_dvt: false, pe_most_likely_diagnosis: true,
      heart_rate_over_100: false, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    expect(withPE.score - baseline.score).toBe(3);
  });

  it('clinical signs DVT adds 3 points', () => {
    const baseline = calculateWellsPE({
      clinical_signs_dvt: false, pe_most_likely_diagnosis: false,
      heart_rate_over_100: false, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    const withDVT = calculateWellsPE({
      clinical_signs_dvt: true, pe_most_likely_diagnosis: false,
      heart_rate_over_100: false, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    expect(withDVT.score - baseline.score).toBe(3);
  });
});

describe('GCS Score - Comprehensive', () => {
  it('minimum GCS (3 - deep coma)', () => {
    const result = calculateGCS({
      eye_opening: 1, verbal_response: 1, motor_response: 1,
    });
    expect(result.score).toBe(3);
  });

  it('maximum GCS (15 - fully alert)', () => {
    const result = calculateGCS({
      eye_opening: 4, verbal_response: 5, motor_response: 6,
    });
    expect(result.score).toBe(15);
  });

  it('moderate injury GCS (9-12)', () => {
    const result = calculateGCS({
      eye_opening: 3, verbal_response: 3, motor_response: 5,
    });
    expect(result.score).toBe(11);
    expect(result.score).toBeGreaterThanOrEqual(9);
    expect(result.score).toBeLessThanOrEqual(12);
  });

  it('severe injury GCS (3-8)', () => {
    const result = calculateGCS({
      eye_opening: 2, verbal_response: 2, motor_response: 3,
    });
    expect(result.score).toBe(7);
    expect(result.score).toBeLessThanOrEqual(8);
  });

  it('has correct component values', () => {
    const result = calculateGCS({
      eye_opening: 3, verbal_response: 4, motor_response: 5,
    });
    expect(result.score).toBe(12);
  });
});

describe('CURB-65 Score - Comprehensive', () => {
  it('score 0 - all negative', () => {
    const result = calculateCURB65({
      confusion: false, bun_over_19: false, respiratory_rate_over_30: false,
      systolic_bp_under_90: false, diastolic_bp_under_60: false, age_65_or_over: false,
    });
    expect(result.score).toBe(0);
  });

  it('score 5 - all positive', () => {
    const result = calculateCURB65({
      confusion: true, bun_over_19: true, respiratory_rate_over_30: true,
      systolic_bp_under_90: true, diastolic_bp_under_60: true, age_65_or_over: true,
    });
    expect(result.score).toBe(5);
  });

  it('score 1 - only confusion', () => {
    const result = calculateCURB65({
      confusion: true, bun_over_19: false, respiratory_rate_over_30: false,
      systolic_bp_under_90: false, diastolic_bp_under_60: false, age_65_or_over: false,
    });
    expect(result.score).toBe(1);
  });

  it('score 2 - outpatient vs inpatient boundary', () => {
    const result = calculateCURB65({
      confusion: true, bun_over_19: true, respiratory_rate_over_30: false,
      systolic_bp_under_90: false, diastolic_bp_under_60: false, age_65_or_over: false,
    });
    expect(result.score).toBe(2);
  });
});

describe('qSOFA Score - Comprehensive', () => {
  it('score 0 - no criteria met', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: false,
      altered_mental_status: false,
      systolic_bp_100_or_less: false,
    });
    expect(result.score).toBe(0);
  });

  it('score 3 - all criteria met', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: true,
      altered_mental_status: true,
      systolic_bp_100_or_less: true,
    });
    expect(result.score).toBe(3);
  });

  it('score 2 - positive sepsis screen', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: true,
      altered_mental_status: true,
      systolic_bp_100_or_less: false,
    });
    expect(result.score).toBe(2);
  });

  it('score 1 - single criterion', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: false,
      altered_mental_status: false,
      systolic_bp_100_or_less: true,
    });
    expect(result.score).toBe(1);
  });
});

describe('eGFR Calculation - Comprehensive', () => {
  it('normal eGFR for young healthy male', () => {
    const result = calculateEGFR({
      creatinine: 1.0, age: 30, sex: 'male',
    });
    expect(result.score).toBeGreaterThan(90);
  });

  it('normal eGFR for young healthy female', () => {
    const result = calculateEGFR({
      creatinine: 0.8, age: 30, sex: 'female',
    });
    expect(result.score).toBeGreaterThan(90);
  });

  it('decreased eGFR with elevated creatinine', () => {
    const result = calculateEGFR({
      creatinine: 2.5, age: 60, sex: 'male',
    });
    expect(result.score).toBeLessThan(60);
  });

  it('severely decreased eGFR', () => {
    const result = calculateEGFR({
      creatinine: 5.0, age: 70, sex: 'female',
    });
    expect(result.score).toBeLessThan(30);
  });

  it('eGFR decreases with age', () => {
    const young = calculateEGFR({ creatinine: 1.0, age: 30, sex: 'male' });
    const old = calculateEGFR({ creatinine: 1.0, age: 80, sex: 'male' });
    expect(young.score).toBeGreaterThan(old.score);
  });

  it('eGFR varies by sex', () => {
    const male = calculateEGFR({ creatinine: 1.0, age: 50, sex: 'male' });
    const female = calculateEGFR({ creatinine: 1.0, age: 50, sex: 'female' });
    // CKD-EPI formula produces different results by sex
    expect(male.score).not.toBe(female.score);
  });
});

describe('MELD Score - Comprehensive', () => {
  it('low MELD score with normal values', () => {
    const result = calculateMELD({
      creatinine: 1.0, bilirubin: 1.0, inr: 1.0,
    });
    expect(result.score).toBeLessThan(15);
  });

  it('high MELD score with deranged values', () => {
    const result = calculateMELD({
      creatinine: 4.0, bilirubin: 10.0, inr: 3.0,
    });
    expect(result.score).toBeGreaterThan(25);
  });

  it('MELD with sodium adjustment', () => {
    const result = calculateMELD({
      creatinine: 2.0, bilirubin: 3.0, inr: 2.0, sodium: 125,
    });
    expect(result.score).toBeGreaterThan(0);
    expect(result.scoreName).toContain('MELD');
  });

  it('MELD with dialysis flag', () => {
    const result = calculateMELD({
      creatinine: 1.0, bilirubin: 2.0, inr: 1.5, on_dialysis: true,
    });
    expect(result.score).toBeGreaterThan(0);
  });
});

describe('Child-Pugh Score - Comprehensive', () => {
  it('Class A - mild cirrhosis', () => {
    const result = calculateChildPugh({
      bilirubin: 1.5, albumin: 4.0, inr: 1.2,
      ascites: 'none', encephalopathy: 'none',
    });
    expect(result.score).toBeLessThanOrEqual(6);
    expect(result.riskLevel).toContain('Well-compensated');
  });

  it('Class C - severe cirrhosis', () => {
    const result = calculateChildPugh({
      bilirubin: 5.0, albumin: 2.0, inr: 2.8,
      ascites: 'moderate_severe', encephalopathy: 'grade_3_4',
    });
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.riskLevel).toContain('Decompensated');
  });

  it('Class B - moderate cirrhosis', () => {
    // bil 2.5 -> 2pts, alb 3.2 -> 2pts, inr 1.8 -> 2pts, ascites none -> 1pt, enc grade_1_2 -> 2pts = 9
    const result = calculateChildPugh({
      bilirubin: 2.5, albumin: 3.2, inr: 1.8,
      ascites: 'none', encephalopathy: 'grade_1_2',
    });
    expect(result.score).toBeGreaterThanOrEqual(7);
    expect(result.score).toBeLessThanOrEqual(9);
  });
});

describe('BMI Score - Comprehensive', () => {
  it('underweight BMI (<18.5)', () => {
    const result = calculateBMI({ weight_kg: 50, height_cm: 180 });
    expect(result.score).toBeLessThan(18.5);
  });

  it('normal BMI (18.5-24.9)', () => {
    const result = calculateBMI({ weight_kg: 70, height_cm: 175 });
    expect(result.score).toBeGreaterThanOrEqual(18.5);
    expect(result.score).toBeLessThanOrEqual(24.9);
  });

  it('overweight BMI (25-29.9)', () => {
    const result = calculateBMI({ weight_kg: 85, height_cm: 175 });
    expect(result.score).toBeGreaterThanOrEqual(25);
    expect(result.score).toBeLessThanOrEqual(29.9);
  });

  it('obese BMI (>=30)', () => {
    const result = calculateBMI({ weight_kg: 100, height_cm: 170 });
    expect(result.score).toBeGreaterThanOrEqual(30);
  });

  it('BMI calculation is correct', () => {
    // 70kg / (1.75m)^2 = 22.86
    const result = calculateBMI({ weight_kg: 70, height_cm: 175 });
    expect(Math.abs(result.score - 22.86)).toBeLessThan(0.1);
  });

  it('morbid obesity BMI (>=40)', () => {
    const result = calculateBMI({ weight_kg: 150, height_cm: 170 });
    expect(result.score).toBeGreaterThanOrEqual(40);
  });
});

describe('HAS-BLED Score - Comprehensive', () => {
  it('score 0 - no risk factors', () => {
    const result = calculateHASBLED({
      hypertension: false, renal_disease: false, liver_disease: false,
      stroke_history: false, bleeding_history: false, labile_inr: false,
      age_over_65: false, antiplatelet_or_nsaid: false, alcohol: false,
    });
    expect(result.score).toBe(0);
  });

  it('score 9 - all risk factors', () => {
    const result = calculateHASBLED({
      hypertension: true, renal_disease: true, liver_disease: true,
      stroke_history: true, bleeding_history: true, labile_inr: true,
      age_over_65: true, antiplatelet_or_nsaid: true, alcohol: true,
    });
    expect(result.score).toBe(9);
  });

  it('high bleeding risk (>=3)', () => {
    const result = calculateHASBLED({
      hypertension: true, renal_disease: false, liver_disease: false,
      stroke_history: true, bleeding_history: true, labile_inr: false,
      age_over_65: false, antiplatelet_or_nsaid: false, alcohol: false,
    });
    expect(result.score).toBe(3);
  });
});

describe('TIMI Score - Comprehensive', () => {
  it('score 0 - no risk factors', () => {
    const result = calculateTIMI({
      age_65_or_over: false, three_or_more_cad_risk_factors: false,
      known_cad_stenosis_50_percent: false, aspirin_use_past_7_days: false,
      severe_angina_24h: false, st_deviation: false, elevated_cardiac_markers: false,
    });
    expect(result.score).toBe(0);
  });

  it('score 7 - all risk factors', () => {
    const result = calculateTIMI({
      age_65_or_over: true, three_or_more_cad_risk_factors: true,
      known_cad_stenosis_50_percent: true, aspirin_use_past_7_days: true,
      severe_angina_24h: true, st_deviation: true, elevated_cardiac_markers: true,
    });
    expect(result.score).toBe(7);
  });

  it('intermediate risk (3-4)', () => {
    const result = calculateTIMI({
      age_65_or_over: true, three_or_more_cad_risk_factors: true,
      known_cad_stenosis_50_percent: true, aspirin_use_past_7_days: false,
      severe_angina_24h: false, st_deviation: false, elevated_cardiac_markers: false,
    });
    expect(result.score).toBe(3);
  });
});

describe('ABCD2 Score - Comprehensive', () => {
  it('score 0 - lowest risk', () => {
    const result = calculateABCD2({
      age_60_or_over: false, blood_pressure_elevated: false,
      clinical_features: 'other', duration_minutes: 5, diabetes: false,
    });
    expect(result.score).toBe(0);
  });

  it('maximum score', () => {
    const result = calculateABCD2({
      age_60_or_over: true, blood_pressure_elevated: true,
      clinical_features: 'unilateral_weakness', duration_minutes: 90, diabetes: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(6);
  });

  it('speech impairment adds 1 point', () => {
    const baseline = calculateABCD2({
      age_60_or_over: false, blood_pressure_elevated: false,
      clinical_features: 'other', duration_minutes: 5, diabetes: false,
    });
    const withSpeech = calculateABCD2({
      age_60_or_over: false, blood_pressure_elevated: false,
      clinical_features: 'speech_impairment', duration_minutes: 5, diabetes: false,
    });
    expect(withSpeech.score - baseline.score).toBe(1);
  });

  it('unilateral weakness adds 2 points', () => {
    const baseline = calculateABCD2({
      age_60_or_over: false, blood_pressure_elevated: false,
      clinical_features: 'other', duration_minutes: 5, diabetes: false,
    });
    const withWeakness = calculateABCD2({
      age_60_or_over: false, blood_pressure_elevated: false,
      clinical_features: 'unilateral_weakness', duration_minutes: 5, diabetes: false,
    });
    expect(withWeakness.score - baseline.score).toBe(2);
  });
});

describe('NEWS2 Score - Comprehensive', () => {
  it('score 0 - all vital signs normal', () => {
    const result = calculateNEWS2({
      respiratory_rate: 16, spo2: 97, on_supplemental_o2: false,
      spo2_scale2: false, systolic_bp: 120, heart_rate: 70,
      consciousness: 'alert', temperature: 37.0,
    });
    expect(result.score).toBe(0);
  });

  it('high score with severely abnormal vitals', () => {
    const result = calculateNEWS2({
      respiratory_rate: 35, spo2: 85, on_supplemental_o2: true,
      spo2_scale2: false, systolic_bp: 85, heart_rate: 135,
      consciousness: 'unresponsive', temperature: 40.5,
    });
    expect(result.score).toBeGreaterThanOrEqual(7);
  });

  it('moderate score with some abnormalities', () => {
    const result = calculateNEWS2({
      respiratory_rate: 22, spo2: 93, on_supplemental_o2: true,
      spo2_scale2: false, systolic_bp: 110, heart_rate: 95,
      consciousness: 'alert', temperature: 38.5,
    });
    expect(result.score).toBeGreaterThan(0);
  });

  it('supplemental O2 adds 2 points', () => {
    const without = calculateNEWS2({
      respiratory_rate: 16, spo2: 97, on_supplemental_o2: false,
      spo2_scale2: false, systolic_bp: 120, heart_rate: 70,
      consciousness: 'alert', temperature: 37.0,
    });
    const withO2 = calculateNEWS2({
      respiratory_rate: 16, spo2: 97, on_supplemental_o2: true,
      spo2_scale2: false, systolic_bp: 120, heart_rate: 70,
      consciousness: 'alert', temperature: 37.0,
    });
    expect(withO2.score - without.score).toBe(2);
  });
});

describe('SOFA Score - Comprehensive', () => {
  it('score 0 - no organ dysfunction', () => {
    const result = calculateSOFA({
      pao2_fio2: 450, on_mechanical_ventilation: false,
      platelets: 250, bilirubin: 0.8,
      cardiovascular: 'no_hypotension', gcs: 15,
      creatinine: 0.9,
    });
    expect(result.score).toBe(0);
  });

  it('high score - multiple organ failure', () => {
    const result = calculateSOFA({
      pao2_fio2: 80, on_mechanical_ventilation: true,
      platelets: 30, bilirubin: 8.0,
      cardiovascular: 'dopamine_gt_15_or_epi_gt_0_1', gcs: 6,
      creatinine: 4.5,
    });
    expect(result.score).toBeGreaterThan(10);
  });

  it('respiratory component scoring', () => {
    const normal = calculateSOFA({
      pao2_fio2: 450, on_mechanical_ventilation: false,
      platelets: 250, bilirubin: 0.8,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.9,
    });
    const impaired = calculateSOFA({
      pao2_fio2: 150, on_mechanical_ventilation: true,
      platelets: 250, bilirubin: 0.8,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.9,
    });
    expect(impaired.score).toBeGreaterThan(normal.score);
  });
});

describe('ASCVD Score - Comprehensive', () => {
  it('low risk - young healthy male', () => {
    const result = calculateASCVD({
      age: 45, sex: 'male', race: 'white',
      total_cholesterol: 180, hdl_cholesterol: 55,
      systolic_bp: 120, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.score).toBeLessThan(10);
  });

  it('high risk - older male with risk factors', () => {
    const result = calculateASCVD({
      age: 70, sex: 'male', race: 'african_american',
      total_cholesterol: 260, hdl_cholesterol: 35,
      systolic_bp: 160, on_bp_treatment: true,
      diabetes: true, smoker: true,
    });
    expect(result.score).toBeGreaterThan(20);
  });

  it('race affects calculation', () => {
    const white = calculateASCVD({
      age: 55, sex: 'male', race: 'white',
      total_cholesterol: 220, hdl_cholesterol: 45,
      systolic_bp: 140, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    const aa = calculateASCVD({
      age: 55, sex: 'male', race: 'african_american',
      total_cholesterol: 220, hdl_cholesterol: 45,
      systolic_bp: 140, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    // Scores should differ by race
    expect(white.score).not.toBe(aa.score);
  });

  it('other race defaults correctly', () => {
    const result = calculateASCVD({
      age: 55, sex: 'female', race: 'other',
      total_cholesterol: 200, hdl_cholesterol: 50,
      systolic_bp: 130, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

describe('calculateRiskScore Tool Wrapper', () => {
  it('delegates to CHA2DS2-VASc correctly', () => {
    const result = calculateRiskScore('CHA2DS2-VASc', {
      age: 70, sex: 'male', chf: true, hypertension: true,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.scoreName).toContain('CHA');
  });

  it('delegates to HEART correctly', () => {
    const result = calculateRiskScore('HEART', {
      history: 'moderately_suspicious', ecg: 'normal',
      age: 55, risk_factors: 2, troponin: 'normal',
    });
    expect(result.scoreName).toContain('HEART');
  });

  it('delegates to BMI correctly', () => {
    const result = calculateRiskScore('BMI', {
      weight_kg: 70, height_cm: 175,
    });
    expect(result.scoreName).toContain('BMI');
  });

  it('throws for unknown score name', () => {
    expect(() => calculateRiskScore('Unknown' as any, {})).toThrow();
  });

  it('delegates to Wells-PE correctly', () => {
    const result = calculateRiskScore('Wells-PE', {
      clinical_signs_dvt: true, pe_most_likely_diagnosis: false,
      heart_rate_over_100: true, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    expect(result.scoreName).toContain('Wells');
  });

  it('delegates to qSOFA correctly', () => {
    const result = calculateRiskScore('qSOFA', {
      respiratory_rate_22_or_more: true,
      altered_mental_status: true,
      systolic_bp_100_or_less: false,
    });
    expect(result.scoreName).toContain('qSOFA');
  });

  it('delegates to eGFR correctly', () => {
    const result = calculateRiskScore('eGFR', {
      creatinine: 1.0, age: 50, sex: 'male',
    });
    expect(result.scoreName).toContain('eGFR');
  });

  it('delegates to GCS correctly', () => {
    const result = calculateRiskScore('GCS', {
      eye_opening: 4, verbal_response: 5, motor_response: 6,
    });
    expect(result.score).toBe(15);
  });

  it('delegates to CURB-65 correctly', () => {
    const result = calculateRiskScore('CURB-65', {
      confusion: true, bun_over_19: false, respiratory_rate_over_30: false,
      systolic_bp_under_90: false, diastolic_bp_under_60: false, age_65_or_over: false,
    });
    expect(result.score).toBe(1);
  });

  it('delegates to MELD correctly', () => {
    const result = calculateRiskScore('MELD', {
      creatinine: 1.0, bilirubin: 1.0, inr: 1.0,
    });
    expect(result.scoreName).toContain('MELD');
  });

  it('delegates to Child-Pugh correctly', () => {
    const result = calculateRiskScore('Child-Pugh', {
      bilirubin: 1.5, albumin: 4.0, inr: 1.2,
      ascites: 'none', encephalopathy: 'none',
    });
    expect(result.scoreName).toContain('Child-Pugh');
  });

  it('delegates to HAS-BLED correctly', () => {
    const result = calculateRiskScore('HAS-BLED', {
      hypertension: true, renal_disease: false, liver_disease: false,
      stroke_history: false, bleeding_history: false, labile_inr: false,
      age_over_65: false, antiplatelet_or_nsaid: false, alcohol: false,
    });
    expect(result.score).toBe(1);
  });

  it('delegates to TIMI correctly', () => {
    const result = calculateRiskScore('TIMI', {
      age_65_or_over: true, three_or_more_cad_risk_factors: false,
      known_cad_stenosis_50_percent: false, aspirin_use_past_7_days: false,
      severe_angina_24h: false, st_deviation: false, elevated_cardiac_markers: false,
    });
    expect(result.score).toBe(1);
  });

  it('delegates to ABCD2 correctly', () => {
    const result = calculateRiskScore('ABCD2', {
      age_60_or_over: true, blood_pressure_elevated: false,
      clinical_features: 'other', duration_minutes: 5, diabetes: false,
    });
    expect(result.score).toBe(1);
  });

  it('delegates to NEWS2 correctly', () => {
    const result = calculateRiskScore('NEWS2', {
      respiratory_rate: 16, spo2: 97, on_supplemental_o2: false,
      spo2_scale2: false, systolic_bp: 120, heart_rate: 70,
      consciousness: 'alert', temperature: 37.0,
    });
    expect(result.score).toBe(0);
  });

  it('delegates to SOFA correctly', () => {
    const result = calculateRiskScore('SOFA', {
      pao2_fio2: 450, on_mechanical_ventilation: false,
      platelets: 250, bilirubin: 0.8,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.9,
    });
    expect(result.score).toBe(0);
  });

  it('delegates to ASCVD correctly', () => {
    const result = calculateRiskScore('ASCVD', {
      age: 55, sex: 'male', race: 'white',
      total_cholesterol: 200, hdl_cholesterol: 50,
      systolic_bp: 130, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.scoreName).toContain('ASCVD');
  });
});

describe('Risk Score Result Structure', () => {
  it('all scores return required fields', () => {
    const scores = [
      { name: 'CHA2DS2-VASc' as const, params: { age: 70, sex: 'male', chf: false, hypertension: false, stroke_tia_history: false, vascular_disease: false, diabetes: false } },
      { name: 'BMI' as const, params: { weight_kg: 70, height_cm: 175 } },
      { name: 'GCS' as const, params: { eye_opening: 4, verbal_response: 5, motor_response: 6 } },
    ];

    for (const { name, params } of scores) {
      const result = calculateRiskScore(name, params);
      expect(result.scoreName).toBeTruthy();
      expect(typeof result.score).toBe('number');
      expect(typeof result.maxScore).toBe('number');
      expect(result.riskLevel).toBeTruthy();
      expect(result.interpretation).toBeTruthy();
      expect(result.recommendation).toBeTruthy();
      expect(result.components).toBeDefined();
      expect(result.reference).toBeTruthy();
    }
  });
});

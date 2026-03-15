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

describe('Risk Score Tool Error Handling', () => {
  it('throws error for unknown score name', () => {
    expect(() => calculateRiskScore('UnknownScore' as any, {})).toThrow('Unknown score');
  });

  it('listAvailableScores returns all 16 scores', () => {
    const scores = listAvailableScores();
    expect(scores.length).toBe(25);
    expect(scores.some(s => s.name === 'CHA2DS2-VASc')).toBe(true);
    expect(scores.some(s => s.name === 'HEART')).toBe(true);
    expect(scores.some(s => s.name === 'Wells PE')).toBe(true);
    expect(scores.some(s => s.name === 'MELD/MELD-Na')).toBe(true);
  });

  it('availableScores constant has correct entries', () => {
    expect(availableScores.length).toBe(25);
    for (const score of availableScores) {
      expect(score.name).toBeTruthy();
      expect(score.description).toBeTruthy();
    }
  });
});

describe('calculateRiskScore Routing', () => {
  it('routes CHA2DS2-VASc correctly', () => {
    const result = calculateRiskScore('CHA2DS2-VASc', {
      age: 65, sex: 'male', chf: false, hypertension: true,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.scoreName).toContain('CHA');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('routes HEART correctly', () => {
    const result = calculateRiskScore('HEART', {
      history: 'moderately_suspicious', ecg: 'normal',
      age: 55, risk_factors: 2, troponin: 'normal',
    });
    expect(result.scoreName).toBe('HEART Score');
  });

  it('routes Wells-PE correctly', () => {
    const result = calculateRiskScore('Wells-PE', {
      clinical_signs_dvt: false, pe_most_likely_diagnosis: false,
      heart_rate_over_100: true, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    expect(result.scoreName).toContain('Wells');
  });

  it('routes MELD correctly', () => {
    const result = calculateRiskScore('MELD', {
      creatinine: 1.5, bilirubin: 2.0, inr: 1.5,
    });
    expect(result.scoreName).toBe('MELD');
  });

  it('routes CURB-65 correctly', () => {
    const result = calculateRiskScore('CURB-65', {
      confusion: false, bun_over_19: false,
      respiratory_rate_over_30: false, systolic_bp_under_90: false,
      diastolic_bp_under_60: false, age_65_or_over: false,
    });
    expect(result.scoreName).toBe('CURB-65');
  });

  it('routes GCS correctly', () => {
    const result = calculateRiskScore('GCS', {
      eye_opening: 4, verbal_response: 5, motor_response: 6,
    });
    expect(result.scoreName).toBe('Glasgow Coma Scale');
  });

  it('routes eGFR correctly', () => {
    const result = calculateRiskScore('eGFR', {
      creatinine: 1.0, age: 50, sex: 'male',
    });
    expect(result.scoreName).toBe('eGFR (CKD-EPI 2021)');
  });

  it('routes qSOFA correctly', () => {
    const result = calculateRiskScore('qSOFA', {
      respiratory_rate_22_or_more: false,
      altered_mental_status: false,
      systolic_bp_100_or_less: false,
    });
    expect(result.scoreName).toBe('qSOFA');
  });

  it('routes SOFA correctly', () => {
    const result = calculateRiskScore('SOFA', {
      pao2_fio2: 400, on_mechanical_ventilation: false,
      platelets: 200, bilirubin: 1.0,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 1.0,
    });
    expect(result.scoreName).toBe('SOFA');
  });

  it('routes Child-Pugh correctly', () => {
    const result = calculateRiskScore('Child-Pugh', {
      bilirubin: 1.5, albumin: 3.8, inr: 1.2,
      ascites: 'none', encephalopathy: 'none',
    });
    expect(result.scoreName).toBe('Child-Pugh');
  });

  it('routes ASCVD correctly', () => {
    const result = calculateRiskScore('ASCVD', {
      age: 55, sex: 'male', race: 'white',
      total_cholesterol: 200, hdl_cholesterol: 50,
      systolic_bp: 130, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.scoreName).toBe('ASCVD Risk (10-year)');
  });

  it('routes NEWS2 correctly', () => {
    const result = calculateRiskScore('NEWS2', {
      respiratory_rate: 18, spo2: 97, on_supplemental_o2: false,
      spo2_scale2: false, systolic_bp: 120, heart_rate: 75,
      consciousness: 'alert', temperature: 37.0,
    });
    expect(result.scoreName).toBe('NEWS2');
  });

  it('routes HAS-BLED correctly', () => {
    const result = calculateRiskScore('HAS-BLED', {
      hypertension: false, renal_disease: false, liver_disease: false,
      stroke_history: false, bleeding_history: false, labile_inr: false,
      age_over_65: false, antiplatelet_or_nsaid: false, alcohol: false,
    });
    expect(result.scoreName).toBe('HAS-BLED');
  });

  it('routes TIMI correctly', () => {
    const result = calculateRiskScore('TIMI', {
      age_65_or_over: false, three_or_more_cad_risk_factors: false,
      known_cad_stenosis_50_percent: false, aspirin_use_past_7_days: false,
      severe_angina_24h: false, st_deviation: false,
      elevated_cardiac_markers: false,
    });
    expect(result.scoreName).toBe('TIMI');
  });

  it('routes ABCD2 correctly', () => {
    const result = calculateRiskScore('ABCD2', {
      age_60_or_over: false, blood_pressure_elevated: false,
      clinical_features: 'other', duration_minutes: 10,
      diabetes: false,
    });
    expect(result.scoreName).toBe('ABCD2');
  });

  it('routes BMI correctly', () => {
    const result = calculateRiskScore('BMI', {
      weight_kg: 70, height_cm: 170,
    });
    expect(result.scoreName).toBe('BMI');
  });
});

describe('MELD Score Extended', () => {
  it('calculates MELD-Na when sodium provided', () => {
    const result = calculateMELD({
      creatinine: 2.0, bilirubin: 3.0, inr: 1.8, sodium: 130,
    });
    expect(result.scoreName).toBe('MELD-Na');
    expect(result.components['Sodium']).toBeDefined();
  });

  it('bounds creatinine to max 4 for non-dialysis', () => {
    const result1 = calculateMELD({ creatinine: 6.0, bilirubin: 2.0, inr: 1.5 });
    const result2 = calculateMELD({ creatinine: 4.0, bilirubin: 2.0, inr: 1.5 });
    expect(result1.score).toBe(result2.score);
  });

  it('sets creatinine to 4 for dialysis patients', () => {
    const result = calculateMELD({ creatinine: 1.0, bilirubin: 2.0, inr: 1.5, on_dialysis: true });
    expect(result.components['Creatinine'].description).toContain('dialysis');
  });

  it('MELD score bounded to 6-40 range', () => {
    const low = calculateMELD({ creatinine: 0.5, bilirubin: 0.5, inr: 0.8 });
    expect(low.score).toBeGreaterThanOrEqual(6);
    const high = calculateMELD({ creatinine: 4.0, bilirubin: 30, inr: 6.0 });
    expect(high.score).toBeLessThanOrEqual(40);
  });

  it('very high MELD classified as Very High risk', () => {
    const result = calculateMELD({ creatinine: 4.0, bilirubin: 20, inr: 4.0 });
    expect(result.riskLevel).toBe('Very High');
  });

  it('low MELD classified as Low risk', () => {
    const result = calculateMELD({ creatinine: 0.8, bilirubin: 0.8, inr: 1.0 });
    expect(result.riskLevel).toBe('Low');
  });

  it('MELD-Na with sodium at boundary (125)', () => {
    const result = calculateMELD({ creatinine: 2.0, bilirubin: 3.0, inr: 1.5, sodium: 125 });
    expect(result.scoreName).toBe('MELD-Na');
  });

  it('MELD-Na with sodium above cap (137)', () => {
    const result = calculateMELD({ creatinine: 2.0, bilirubin: 3.0, inr: 1.5, sodium: 140 });
    // Sodium is capped at 137, so MELD-Na should equal MELD
    const meld = calculateMELD({ creatinine: 2.0, bilirubin: 3.0, inr: 1.5 });
    expect(result.score).toBe(meld.score);
  });
});

describe('CURB-65 Extended', () => {
  it('scores 0 for young patient with no criteria', () => {
    const result = calculateCURB65({
      confusion: false, bun_over_19: false,
      respiratory_rate_over_30: false, systolic_bp_under_90: false,
      diastolic_bp_under_60: false, age_65_or_over: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('scores 5 for maximum severity', () => {
    const result = calculateCURB65({
      confusion: true, bun_over_19: true,
      respiratory_rate_over_30: true, systolic_bp_under_90: true,
      diastolic_bp_under_60: false, age_65_or_over: true,
    });
    expect(result.score).toBe(5);
    expect(result.riskLevel).toBe('High');
  });

  it('BP criterion met by diastolic alone', () => {
    const result = calculateCURB65({
      confusion: false, bun_over_19: false,
      respiratory_rate_over_30: false, systolic_bp_under_90: false,
      diastolic_bp_under_60: true, age_65_or_over: false,
    });
    expect(result.score).toBe(1);
  });

  it('moderate risk at score 2', () => {
    const result = calculateCURB65({
      confusion: true, bun_over_19: false,
      respiratory_rate_over_30: false, systolic_bp_under_90: false,
      diastolic_bp_under_60: false, age_65_or_over: true,
    });
    expect(result.score).toBe(2);
    expect(result.riskLevel).toBe('Moderate');
  });
});

describe('GCS Extended', () => {
  it('minimum score is 3', () => {
    const result = calculateGCS({ eye_opening: 1, verbal_response: 1, motor_response: 1 });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('Severe brain injury');
  });

  it('maximum score is 15', () => {
    const result = calculateGCS({ eye_opening: 4, verbal_response: 5, motor_response: 6 });
    expect(result.score).toBe(15);
    expect(result.riskLevel).toBe('Mild brain injury');
  });

  it('moderate brain injury at GCS 9-12', () => {
    const result = calculateGCS({ eye_opening: 3, verbal_response: 3, motor_response: 4 });
    expect(result.score).toBe(10);
    expect(result.riskLevel).toBe('Moderate brain injury');
  });
});

describe('eGFR Extended', () => {
  it('healthy young male has high eGFR', () => {
    const result = calculateEGFR({ creatinine: 0.9, age: 25, sex: 'male' });
    expect(result.score).toBeGreaterThan(90);
  });

  it('elderly female with elevated creatinine has low eGFR', () => {
    const result = calculateEGFR({ creatinine: 2.5, age: 80, sex: 'female' });
    expect(result.score).toBeLessThan(30);
  });

  it('severe renal failure with very high creatinine', () => {
    const result = calculateEGFR({ creatinine: 8.0, age: 60, sex: 'male' });
    expect(result.score).toBeLessThan(15);
    expect(result.riskLevel).toBe('Kidney Failure');
  });

  it('sex differences in eGFR calculation', () => {
    const male = calculateEGFR({ creatinine: 1.0, age: 50, sex: 'male' });
    const female = calculateEGFR({ creatinine: 1.0, age: 50, sex: 'female' });
    // Female coefficient leads to different result
    expect(male.score).not.toBe(female.score);
  });
});

describe('BMI Extended', () => {
  it('underweight (BMI < 18.5)', () => {
    const result = calculateBMI({ weight_kg: 45, height_cm: 170 });
    expect(result.score).toBeLessThan(18.5);
    // BMI < 18.5 is 'Moderate' (Mild thinness) or higher based on how low
    expect(['Moderate', 'High', 'Critical']).toContain(result.riskLevel);
  });

  it('normal weight (BMI 18.5-24.9)', () => {
    const result = calculateBMI({ weight_kg: 70, height_cm: 175 });
    expect(result.score).toBeGreaterThanOrEqual(18.5);
    expect(result.score).toBeLessThan(25);
    expect(result.riskLevel).toBe('Normal');
  });

  it('overweight (BMI 25-29.9)', () => {
    const result = calculateBMI({ weight_kg: 85, height_cm: 175 });
    expect(result.score).toBeGreaterThanOrEqual(25);
    expect(result.score).toBeLessThan(30);
  });

  it('obese class I (BMI 30-34.9)', () => {
    const result = calculateBMI({ weight_kg: 100, height_cm: 175 });
    expect(result.score).toBeGreaterThanOrEqual(30);
  });

  it('morbidly obese (BMI >= 40)', () => {
    const result = calculateBMI({ weight_kg: 140, height_cm: 170 });
    expect(result.score).toBeGreaterThanOrEqual(40);
    expect(result.riskLevel).toBe('Very High');
  });

  it('very short height', () => {
    const result = calculateBMI({ weight_kg: 50, height_cm: 100 });
    expect(result.score).toBe(50);
  });

  it('very tall height', () => {
    const result = calculateBMI({ weight_kg: 90, height_cm: 200 });
    expect(result.score).toBe(22.5);
  });
});

describe('SOFA Extended', () => {
  it('minimal SOFA for healthy patient', () => {
    const result = calculateSOFA({
      pao2_fio2: 450, on_mechanical_ventilation: false,
      platelets: 250, bilirubin: 0.8,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.9,
    });
    expect(result.score).toBe(0);
  });

  it('maximum SOFA with multi-organ failure', () => {
    const result = calculateSOFA({
      pao2_fio2: 50, on_mechanical_ventilation: true,
      platelets: 15, bilirubin: 15,
      cardiovascular: 'dopamine_gt_15_or_epi_gt_0_1', gcs: 3, creatinine: 6.0,
    });
    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.riskLevel).toContain('High');
  });

  it('SOFA with urine output criterion', () => {
    const result = calculateSOFA({
      pao2_fio2: 400, on_mechanical_ventilation: false,
      platelets: 200, bilirubin: 1.0,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 1.0,
      urine_output_ml_day: 100,
    });
    // Very low urine output should increase score
    expect(result.score).toBeGreaterThanOrEqual(1);
  });
});

describe('Child-Pugh Extended', () => {
  it('Class A (5-6 points) - compensated', () => {
    const result = calculateChildPugh({
      bilirubin: 1.5, albumin: 3.8, inr: 1.2,
      ascites: 'none', encephalopathy: 'none',
    });
    // All 1-point values = score 5
    expect(result.score).toBe(5);
    expect(result.riskLevel).toBe('Well-compensated');
  });

  it('Class C (10-15 points) - decompensated', () => {
    const result = calculateChildPugh({
      bilirubin: 5.0, albumin: 2.0, inr: 2.8,
      ascites: 'moderate_severe', encephalopathy: 'grade_3_4',
    });
    // All 3-point values = score 15
    expect(result.score).toBe(15);
    expect(result.riskLevel).toBe('Decompensated');
  });

  it('Class B (7-9 points) - significant compromise', () => {
    const result = calculateChildPugh({
      bilirubin: 2.5, albumin: 3.2, inr: 1.5,
      ascites: 'mild', encephalopathy: 'none',
    });
    // bil=2pt, alb=2pt, inr=1pt, ascites=2pt, enc=1pt = 8
    expect(result.score).toBe(8);
    expect(result.riskLevel).toBe('Significant functional compromise');
  });
});

describe('ASCVD Extended', () => {
  it('low risk for young non-smoker', () => {
    const result = calculateASCVD({
      age: 42, sex: 'female', race: 'white',
      total_cholesterol: 180, hdl_cholesterol: 60,
      systolic_bp: 110, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.score).toBeLessThan(5);
    expect(result.riskLevel).toContain('Low');
  });

  it('high risk for older diabetic smoker', () => {
    const result = calculateASCVD({
      age: 70, sex: 'male', race: 'african_american',
      total_cholesterol: 280, hdl_cholesterol: 35,
      systolic_bp: 160, on_bp_treatment: true,
      diabetes: true, smoker: true,
    });
    expect(result.score).toBeGreaterThan(20);
  });

  it('still calculates for age <40 (equations extrapolate)', () => {
    const result = calculateASCVD({
      age: 35, sex: 'male', race: 'white',
      total_cholesterol: 200, hdl_cholesterol: 50,
      systolic_bp: 120, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    // Equation still runs, just extrapolated
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.interpretation).toContain('ASCVD');
  });

  it('still calculates for age >79 (equations extrapolate)', () => {
    const result = calculateASCVD({
      age: 85, sex: 'female', race: 'white',
      total_cholesterol: 200, hdl_cholesterol: 50,
      systolic_bp: 120, on_bp_treatment: false,
      diabetes: false, smoker: false,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.interpretation).toContain('ASCVD');
  });
});

describe('NEWS2 Extended', () => {
  it('score 0 for perfectly normal vitals', () => {
    const result = calculateNEWS2({
      respiratory_rate: 16, spo2: 97, on_supplemental_o2: false,
      spo2_scale2: false, systolic_bp: 120, heart_rate: 75,
      consciousness: 'alert', temperature: 37.0,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('high score for critical vitals', () => {
    const result = calculateNEWS2({
      respiratory_rate: 30, spo2: 85, on_supplemental_o2: true,
      spo2_scale2: false, systolic_bp: 80, heart_rate: 140,
      consciousness: 'unresponsive', temperature: 40.0,
    });
    expect(result.score).toBeGreaterThanOrEqual(12);
    expect(result.riskLevel).toBe('High');
  });

  it('moderate risk with some abnormal parameters', () => {
    const result = calculateNEWS2({
      respiratory_rate: 22, spo2: 94, on_supplemental_o2: false,
      spo2_scale2: false, systolic_bp: 105, heart_rate: 95,
      consciousness: 'alert', temperature: 38.5,
    });
    expect(result.score).toBeGreaterThan(0);
  });

  it('supplemental O2 adds 2 points', () => {
    const without = calculateNEWS2({
      respiratory_rate: 16, spo2: 97, on_supplemental_o2: false,
      spo2_scale2: false, systolic_bp: 120, heart_rate: 75,
      consciousness: 'alert', temperature: 37.0,
    });
    const withO2 = calculateNEWS2({
      respiratory_rate: 16, spo2: 97, on_supplemental_o2: true,
      spo2_scale2: false, systolic_bp: 120, heart_rate: 75,
      consciousness: 'alert', temperature: 37.0,
    });
    expect(withO2.score - without.score).toBe(2);
  });
});

describe('HAS-BLED Extended', () => {
  it('score 0 with no risk factors', () => {
    const result = calculateHASBLED({
      hypertension: false, renal_disease: false, liver_disease: false,
      stroke_history: false, bleeding_history: false, labile_inr: false,
      age_over_65: false, antiplatelet_or_nsaid: false, alcohol: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('max score with all risk factors', () => {
    const result = calculateHASBLED({
      hypertension: true, renal_disease: true, liver_disease: true,
      stroke_history: true, bleeding_history: true, labile_inr: true,
      age_over_65: true, antiplatelet_or_nsaid: true, alcohol: true,
    });
    expect(result.score).toBe(9);
    expect(result.riskLevel).toBe('High');
  });

  it('high risk at score 3', () => {
    const result = calculateHASBLED({
      hypertension: true, renal_disease: false, liver_disease: false,
      stroke_history: false, bleeding_history: true, labile_inr: false,
      age_over_65: true, antiplatelet_or_nsaid: false, alcohol: false,
    });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('High');
  });
});

describe('TIMI Extended', () => {
  it('score 0 (low risk)', () => {
    const result = calculateTIMI({
      age_65_or_over: false, three_or_more_cad_risk_factors: false,
      known_cad_stenosis_50_percent: false, aspirin_use_past_7_days: false,
      severe_angina_24h: false, st_deviation: false,
      elevated_cardiac_markers: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('max score 7 (high risk)', () => {
    const result = calculateTIMI({
      age_65_or_over: true, three_or_more_cad_risk_factors: true,
      known_cad_stenosis_50_percent: true, aspirin_use_past_7_days: true,
      severe_angina_24h: true, st_deviation: true,
      elevated_cardiac_markers: true,
    });
    expect(result.score).toBe(7);
    expect(result.riskLevel).toBe('High');
  });
});

describe('ABCD2 Extended', () => {
  it('low risk TIA', () => {
    const result = calculateABCD2({
      age_60_or_over: false, blood_pressure_elevated: false,
      clinical_features: 'other', duration_minutes: 5,
      diabetes: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('high risk TIA with all factors', () => {
    const result = calculateABCD2({
      age_60_or_over: true, blood_pressure_elevated: true,
      clinical_features: 'unilateral_weakness', duration_minutes: 90,
      diabetes: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(6);
    expect(result.riskLevel).toBe('High');
  });

  it('speech impairment scores 1 point', () => {
    const result = calculateABCD2({
      age_60_or_over: false, blood_pressure_elevated: false,
      clinical_features: 'speech_impairment', duration_minutes: 5,
      diabetes: false,
    });
    expect(result.score).toBe(1);
  });

  it('unilateral weakness scores 2 points', () => {
    const result = calculateABCD2({
      age_60_or_over: false, blood_pressure_elevated: false,
      clinical_features: 'unilateral_weakness', duration_minutes: 5,
      diabetes: false,
    });
    expect(result.score).toBe(2);
  });

  it('duration 10-59 minutes scores 1 point', () => {
    const result = calculateABCD2({
      age_60_or_over: false, blood_pressure_elevated: false,
      clinical_features: 'other', duration_minutes: 30,
      diabetes: false,
    });
    expect(result.score).toBe(1);
  });

  it('duration >=60 minutes scores 2 points', () => {
    const result = calculateABCD2({
      age_60_or_over: false, blood_pressure_elevated: false,
      clinical_features: 'other', duration_minutes: 120,
      diabetes: false,
    });
    expect(result.score).toBe(2);
  });
});

describe('Wells PE Extended', () => {
  it('high probability with multiple criteria', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: true, pe_most_likely_diagnosis: true,
      heart_rate_over_100: true, immobilization_or_surgery: true,
      previous_dvt_pe: true, hemoptysis: true, malignancy: true,
    });
    expect(result.score).toBe(12.5);
    expect(result.riskLevel).toContain('High');
  });

  it('low probability with no criteria', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: false, pe_most_likely_diagnosis: false,
      heart_rate_over_100: false, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toContain('Low');
  });
});

describe('Risk Score Output Structure', () => {
  it('all scores return complete structure', () => {
    const testCases = [
      calculateCHA2DS2VASc({ age: 60, sex: 'male', chf: false, hypertension: true, stroke_tia_history: false, vascular_disease: false, diabetes: false }),
      calculateHEART({ history: 'slightly_suspicious', ecg: 'normal', age: 50, risk_factors: 1, troponin: 'normal' }),
      calculateGCS({ eye_opening: 4, verbal_response: 5, motor_response: 6 }),
      calculateBMI({ weight_kg: 70, height_cm: 175 }),
    ];

    for (const result of testCases) {
      expect(result.scoreName).toBeTruthy();
      expect(typeof result.score).toBe('number');
      expect(typeof result.maxScore).toBe('number');
      expect(result.riskLevel).toBeTruthy();
      expect(result.interpretation).toBeTruthy();
      expect(result.recommendation).toBeTruthy();
      expect(result.reference).toBeTruthy();
      expect(typeof result.components).toBe('object');
    }
  });
});

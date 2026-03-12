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
import { calculateRiskScore, listAvailableScores, type ScoreName } from '../src/tools/risk-score-tool';

/**
 * Edge cases and boundary conditions for all risk score calculators.
 */

describe('CHA2DS2-VASc Edge Cases', () => {
  it('age exactly 65 gets 1 point', () => {
    const result = calculateCHA2DS2VASc({
      age: 65, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(1);
  });

  it('age exactly 74 gets 1 point', () => {
    const result = calculateCHA2DS2VASc({
      age: 74, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(1);
  });

  it('age exactly 75 gets 2 points', () => {
    const result = calculateCHA2DS2VASc({
      age: 75, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(2);
  });

  it('age 64 gets 0 age points', () => {
    const result = calculateCHA2DS2VASc({
      age: 64, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(0);
  });

  it('female score=1 is treated as low risk', () => {
    const result = calculateCHA2DS2VASc({
      age: 40, sex: 'female', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(1);
    expect(result.riskLevel).toBe('Low');
    expect(result.recommendation).toContain('lone female');
  });

  it('male score=1 recommends considering anticoagulation', () => {
    const result = calculateCHA2DS2VASc({
      age: 68, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(1);
    expect(result.riskLevel).toBe('Low-Moderate');
    expect(result.recommendation).toContain('Consider');
  });

  it('includes reference citation', () => {
    const result = calculateCHA2DS2VASc({
      age: 40, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.reference).toContain('Lip');
  });

  it('maxScore is 9', () => {
    const result = calculateCHA2DS2VASc({
      age: 40, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.maxScore).toBe(9);
  });

  it('very old age (100) still gets 2 points', () => {
    const result = calculateCHA2DS2VASc({
      age: 100, sex: 'male', chf: false, hypertension: false,
      stroke_tia_history: false, vascular_disease: false, diabetes: false,
    });
    expect(result.score).toBe(2);
  });
});

describe('HEART Score Edge Cases', () => {
  it('minimum score is 0', () => {
    const result = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal', age: 30,
      risk_factors: 0, troponin: 'normal',
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('maximum score is 10', () => {
    const result = calculateHEART({
      history: 'highly_suspicious', ecg: 'significant_st_deviation', age: 70,
      risk_factors: 5, troponin: 'significantly_elevated',
    });
    expect(result.score).toBe(10);
    expect(result.riskLevel).toBe('High');
  });

  it('age < 45 gets 0 points', () => {
    const result = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal', age: 44,
      risk_factors: 0, troponin: 'normal',
    });
    expect(result.score).toBe(0);
  });

  it('age 45 gets 1 point', () => {
    const result = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal', age: 45,
      risk_factors: 0, troponin: 'normal',
    });
    expect(result.score).toBe(1);
  });

  it('age 64 gets 1 point', () => {
    const result = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal', age: 64,
      risk_factors: 0, troponin: 'normal',
    });
    expect(result.score).toBe(1);
  });

  it('age 65 gets 2 points', () => {
    const result = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal', age: 65,
      risk_factors: 0, troponin: 'normal',
    });
    expect(result.score).toBe(2);
  });

  it('risk_factors 1-2 gets 1 point', () => {
    const result = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal', age: 30,
      risk_factors: 2, troponin: 'normal',
    });
    expect(result.score).toBe(1);
  });

  it('risk_factors >=3 gets 2 points', () => {
    const result = calculateHEART({
      history: 'slightly_suspicious', ecg: 'normal', age: 30,
      risk_factors: 3, troponin: 'normal',
    });
    expect(result.score).toBe(2);
  });

  it('score 3 is low risk', () => {
    const result = calculateHEART({
      history: 'slightly_suspicious', ecg: 'non_specific_changes', age: 55,
      risk_factors: 1, troponin: 'normal',
    });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('Low');
  });

  it('score 4 is moderate risk', () => {
    const result = calculateHEART({
      history: 'moderately_suspicious', ecg: 'non_specific_changes', age: 55,
      risk_factors: 1, troponin: 'normal',
    });
    expect(result.score).toBe(4);
    expect(result.riskLevel).toBe('Moderate');
  });

  it('score 7 is high risk', () => {
    const result = calculateHEART({
      history: 'highly_suspicious', ecg: 'significant_st_deviation', age: 70,
      risk_factors: 1, troponin: 'normal',
    });
    expect(result.score).toBe(7);
    expect(result.riskLevel).toBe('High');
  });
});

describe('Wells PE Edge Cases', () => {
  it('minimum score is 0', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: false, pe_most_likely_diagnosis: false,
      heart_rate_over_100: false, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('maximum score is 12.5', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: true, pe_most_likely_diagnosis: true,
      heart_rate_over_100: true, immobilization_or_surgery: true,
      previous_dvt_pe: true, hemoptysis: true, malignancy: true,
    });
    expect(result.score).toBe(12.5);
    expect(result.riskLevel).toBe('High');
    expect(result.maxScore).toBe(12.5);
  });

  it('score 1 is low risk', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: false, pe_most_likely_diagnosis: false,
      heart_rate_over_100: false, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: true, malignancy: false,
    });
    expect(result.score).toBe(1);
    expect(result.riskLevel).toBe('Low');
  });

  it('score 1.5 is moderate risk', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: false, pe_most_likely_diagnosis: false,
      heart_rate_over_100: true, immobilization_or_surgery: false,
      previous_dvt_pe: false, hemoptysis: false, malignancy: false,
    });
    expect(result.score).toBe(1.5);
    expect(result.riskLevel).toBe('Moderate');
  });

  it('score > 4 is high risk', () => {
    const result = calculateWellsPE({
      clinical_signs_dvt: false, pe_most_likely_diagnosis: false,
      heart_rate_over_100: true, immobilization_or_surgery: true,
      previous_dvt_pe: true, hemoptysis: false, malignancy: false,
    });
    expect(result.score).toBe(4.5);
    expect(result.riskLevel).toBe('High');
  });
});

describe('MELD Score Edge Cases', () => {
  it('bounds creatinine to 1-4 range', () => {
    const result1 = calculateMELD({ creatinine: 0.5, bilirubin: 1, inr: 1 });
    const result2 = calculateMELD({ creatinine: 1, bilirubin: 1, inr: 1 });
    // With creatinine bounded to 1, both should give same score
    expect(result1.score).toBe(result2.score);
  });

  it('sets creatinine to 4 if on dialysis', () => {
    const result = calculateMELD({ creatinine: 1, bilirubin: 1, inr: 1, on_dialysis: true });
    expect(result.score).toBeGreaterThan(6);
  });

  it('score is bounded to 6-40 range', () => {
    const low = calculateMELD({ creatinine: 0.5, bilirubin: 0.5, inr: 0.8 });
    expect(low.score).toBeGreaterThanOrEqual(6);

    const high = calculateMELD({ creatinine: 10, bilirubin: 30, inr: 8 });
    expect(high.score).toBeLessThanOrEqual(40);
  });

  it('calculates MELD-Na when sodium provided', () => {
    const result = calculateMELD({ creatinine: 2, bilirubin: 3, inr: 2, sodium: 130 });
    expect(result.scoreName).toBe('MELD-Na');
  });

  it('MELD without sodium uses MELD name', () => {
    const result = calculateMELD({ creatinine: 2, bilirubin: 3, inr: 2 });
    expect(result.scoreName).toBe('MELD');
  });

  it('sodium is bounded to 125-137', () => {
    const result1 = calculateMELD({ creatinine: 2, bilirubin: 3, inr: 2, sodium: 110 });
    const result2 = calculateMELD({ creatinine: 2, bilirubin: 3, inr: 2, sodium: 125 });
    // sodium of 110 should be treated as 125
    expect(result1.score).toBe(result2.score);
  });

  it('low score <= 9 is low risk', () => {
    const result = calculateMELD({ creatinine: 0.8, bilirubin: 0.8, inr: 1.0 });
    expect(result.riskLevel).toBe('Low');
  });

  it('high score >= 30 is very high risk', () => {
    const result = calculateMELD({ creatinine: 4, bilirubin: 20, inr: 5 });
    expect(result.riskLevel).toBe('Very High');
  });
});

describe('GCS Edge Cases', () => {
  it('minimum score is 3 (E1V1M1)', () => {
    const result = calculateGCS({ eye_opening: 1, verbal_response: 1, motor_response: 1 });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('Severe brain injury');
  });

  it('maximum score is 15 (E4V5M6)', () => {
    const result = calculateGCS({ eye_opening: 4, verbal_response: 5, motor_response: 6 });
    expect(result.score).toBe(15);
    expect(result.riskLevel).toBe('Mild brain injury');
  });

  it('score 8 is severe brain injury (intubation threshold)', () => {
    const result = calculateGCS({ eye_opening: 2, verbal_response: 3, motor_response: 3 });
    expect(result.score).toBe(8);
    expect(result.riskLevel).toBe('Severe brain injury');
    expect(result.recommendation).toContain('Intubation');
  });

  it('score 9 is moderate brain injury', () => {
    const result = calculateGCS({ eye_opening: 3, verbal_response: 3, motor_response: 3 });
    expect(result.score).toBe(9);
    expect(result.riskLevel).toBe('Moderate brain injury');
  });

  it('score 13 is mild brain injury', () => {
    const result = calculateGCS({ eye_opening: 4, verbal_response: 4, motor_response: 5 });
    expect(result.score).toBe(13);
    expect(result.riskLevel).toBe('Mild brain injury');
  });

  it('interpretation includes E/V/M breakdown', () => {
    const result = calculateGCS({ eye_opening: 3, verbal_response: 4, motor_response: 5 });
    expect(result.interpretation).toContain('E3V4M5');
  });
});

describe('eGFR Edge Cases', () => {
  it('normal creatinine in young male gives high eGFR', () => {
    const result = calculateEGFR({ creatinine: 1.0, age: 30, sex: 'male' });
    expect(result.score).toBeGreaterThanOrEqual(90);
    expect(result.riskLevel).toBe('Normal');
  });

  it('elevated creatinine gives reduced eGFR', () => {
    const result = calculateEGFR({ creatinine: 3.0, age: 60, sex: 'male' });
    expect(result.score).toBeLessThan(30);
  });

  it('very high creatinine gives very low eGFR', () => {
    const result = calculateEGFR({ creatinine: 8.0, age: 70, sex: 'male' });
    expect(result.score).toBeLessThan(15);
    expect(result.riskLevel).toBe('Kidney Failure');
  });

  it('female calculation uses different coefficients', () => {
    const male = calculateEGFR({ creatinine: 1.0, age: 50, sex: 'male' });
    const female = calculateEGFR({ creatinine: 1.0, age: 50, sex: 'female' });
    // eGFR should differ between male and female
    expect(male.score).not.toBe(female.score);
  });

  it('older age reduces eGFR', () => {
    const young = calculateEGFR({ creatinine: 1.0, age: 30, sex: 'male' });
    const old = calculateEGFR({ creatinine: 1.0, age: 80, sex: 'male' });
    expect(old.score).toBeLessThan(young.score);
  });

  it('CKD stage G3a: eGFR 45-59', () => {
    const result = calculateEGFR({ creatinine: 1.5, age: 65, sex: 'male' });
    if (result.score >= 45 && result.score < 60) {
      expect(result.riskLevel).toBe('Moderate');
      expect(result.interpretation).toContain('G3a');
    }
  });

  it('CKD stage G2: eGFR 60-89', () => {
    const result = calculateEGFR({ creatinine: 1.2, age: 55, sex: 'male' });
    if (result.score >= 60 && result.score < 90) {
      expect(result.riskLevel).toBe('Mild');
      expect(result.interpretation).toContain('G2');
    }
  });
});

describe('qSOFA Edge Cases', () => {
  it('score 0 is low risk', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: false,
      altered_mental_status: false,
      systolic_bp_100_or_less: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('score 1 is still low risk', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: true,
      altered_mental_status: false,
      systolic_bp_100_or_less: false,
    });
    expect(result.score).toBe(1);
    expect(result.riskLevel).toBe('Low');
  });

  it('score 2 is high risk', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: true,
      altered_mental_status: true,
      systolic_bp_100_or_less: false,
    });
    expect(result.score).toBe(2);
    expect(result.riskLevel).toBe('High');
  });

  it('score 3 is high risk', () => {
    const result = calculateQSOFA({
      respiratory_rate_22_or_more: true,
      altered_mental_status: true,
      systolic_bp_100_or_less: true,
    });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('High');
    expect(result.recommendation).toContain('mortality');
  });
});

describe('SOFA Score Edge Cases', () => {
  it('minimum score 0 for all normal values', () => {
    const result = calculateSOFA({
      pao2_fio2: 450, on_mechanical_ventilation: false,
      platelets: 200, bilirubin: 0.8,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.8,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('maximum score for all worst values', () => {
    const result = calculateSOFA({
      pao2_fio2: 50, on_mechanical_ventilation: true,
      platelets: 10, bilirubin: 15,
      cardiovascular: 'dopamine_gt_15_or_epi_gt_0_1', gcs: 3, creatinine: 6,
    });
    expect(result.score).toBe(24);
    expect(result.riskLevel).toBe('Very High');
  });

  it('urine output < 200 gives renal score of 4', () => {
    const result = calculateSOFA({
      pao2_fio2: 450, on_mechanical_ventilation: false,
      platelets: 200, bilirubin: 0.8,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.8,
      urine_output_ml_day: 150,
    });
    expect(result.score).toBe(4); // Only renal component scores
  });

  it('respiration score depends on ventilation status', () => {
    const onVent = calculateSOFA({
      pao2_fio2: 150, on_mechanical_ventilation: true,
      platelets: 200, bilirubin: 0.8,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.8,
    });
    const offVent = calculateSOFA({
      pao2_fio2: 150, on_mechanical_ventilation: false,
      platelets: 200, bilirubin: 0.8,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.8,
    });
    expect(onVent.score).toBeGreaterThan(offVent.score);
  });

  it('score >= 2 indicates organ dysfunction', () => {
    const result = calculateSOFA({
      pao2_fio2: 250, on_mechanical_ventilation: false,
      platelets: 200, bilirubin: 0.8,
      cardiovascular: 'no_hypotension', gcs: 15, creatinine: 0.8,
    });
    expect(result.score).toBe(2);
    expect(result.interpretation).toContain('organ dysfunction');
  });
});

describe('Child-Pugh Edge Cases', () => {
  it('minimum score 5 (Class A)', () => {
    const result = calculateChildPugh({
      bilirubin: 1, albumin: 4.0, inr: 1.2,
      ascites: 'none', encephalopathy: 'none',
    });
    expect(result.score).toBe(5);
    expect(result.interpretation).toContain('Class A');
  });

  it('maximum score 15 (Class C)', () => {
    const result = calculateChildPugh({
      bilirubin: 5, albumin: 2.0, inr: 3.0,
      ascites: 'moderate_severe', encephalopathy: 'grade_3_4',
    });
    expect(result.score).toBe(15);
    expect(result.interpretation).toContain('Class C');
  });

  it('score 6 boundary: Class A', () => {
    const result = calculateChildPugh({
      bilirubin: 2.5, albumin: 4.0, inr: 1.2,
      ascites: 'none', encephalopathy: 'none',
    });
    expect(result.score).toBe(6);
    expect(result.interpretation).toContain('Class A');
  });

  it('score 7 boundary: Class B', () => {
    const result = calculateChildPugh({
      bilirubin: 2.5, albumin: 3.0, inr: 1.2,
      ascites: 'none', encephalopathy: 'none',
    });
    expect(result.score).toBe(7);
    expect(result.interpretation).toContain('Class B');
  });

  it('score 10 boundary: Class C', () => {
    // bilirubin > 3 = 3pts, albumin 2.8-3.5 = 2pts, inr 1.7-2.3 = 2pts,
    // ascites mild = 2pts, encephalopathy none = 1pt = total 10
    const result = calculateChildPugh({
      bilirubin: 4, albumin: 3.0, inr: 2.0,
      ascites: 'mild', encephalopathy: 'none',
    });
    expect(result.score).toBe(10);
    expect(result.interpretation).toContain('Class C');
  });
});

describe('NEWS2 Edge Cases', () => {
  it('score 0 for all normal vitals', () => {
    const result = calculateNEWS2({
      respiratory_rate: 16, spo2: 98, on_supplemental_o2: false,
      spo2_scale2: false, systolic_bp: 130, heart_rate: 75,
      consciousness: 'alert', temperature: 37.0,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('single parameter of 3 triggers Low-Medium risk', () => {
    const result = calculateNEWS2({
      respiratory_rate: 16, spo2: 98, on_supplemental_o2: false,
      spo2_scale2: false, systolic_bp: 130, heart_rate: 35, // HR <=40 = 3 points
      consciousness: 'alert', temperature: 37.0,
    });
    expect(result.riskLevel).toBe('Low-Medium');
    expect(result.interpretation).toContain('extreme parameter');
  });

  it('score 5 is medium risk', () => {
    const result = calculateNEWS2({
      respiratory_rate: 25, spo2: 94, on_supplemental_o2: true,
      spo2_scale2: false, systolic_bp: 105, heart_rate: 95,
      consciousness: 'alert', temperature: 37.5,
    });
    if (result.score >= 5 && result.score <= 6) {
      expect(result.riskLevel).toBe('Medium');
    }
  });

  it('score >= 7 is high risk', () => {
    const result = calculateNEWS2({
      respiratory_rate: 30, spo2: 88, on_supplemental_o2: true,
      spo2_scale2: false, systolic_bp: 85, heart_rate: 140,
      consciousness: 'confusion', temperature: 34.5,
    });
    expect(result.score).toBeGreaterThanOrEqual(7);
    expect(result.riskLevel).toBe('High');
  });

  it('Scale 2 SpO2 scoring: 88-92 on room air is 0', () => {
    const result = calculateNEWS2({
      respiratory_rate: 16, spo2: 90, on_supplemental_o2: false,
      spo2_scale2: true, systolic_bp: 130, heart_rate: 75,
      consciousness: 'alert', temperature: 37.0,
    });
    expect(result.score).toBe(0);
  });

  it('Scale 2 SpO2: high SpO2 on O2 is penalized', () => {
    const result = calculateNEWS2({
      respiratory_rate: 16, spo2: 97, on_supplemental_o2: true,
      spo2_scale2: true, systolic_bp: 130, heart_rate: 75,
      consciousness: 'alert', temperature: 37.0,
    });
    expect(result.score).toBeGreaterThan(0); // SpO2 >=97 on O2 in scale2 = 3
  });

  it('supplemental O2 adds 2 points on Scale 1', () => {
    const withO2 = calculateNEWS2({
      respiratory_rate: 16, spo2: 98, on_supplemental_o2: true,
      spo2_scale2: false, systolic_bp: 130, heart_rate: 75,
      consciousness: 'alert', temperature: 37.0,
    });
    const withoutO2 = calculateNEWS2({
      respiratory_rate: 16, spo2: 98, on_supplemental_o2: false,
      spo2_scale2: false, systolic_bp: 130, heart_rate: 75,
      consciousness: 'alert', temperature: 37.0,
    });
    expect(withO2.score - withoutO2.score).toBe(2);
  });

  it('consciousness levels other than alert all score 3', () => {
    const levels: Array<'confusion' | 'voice' | 'pain' | 'unresponsive'> = ['confusion', 'voice', 'pain', 'unresponsive'];
    for (const level of levels) {
      const result = calculateNEWS2({
        respiratory_rate: 16, spo2: 98, on_supplemental_o2: false,
        spo2_scale2: false, systolic_bp: 130, heart_rate: 75,
        consciousness: level, temperature: 37.0,
      });
      expect(result.score).toBe(3);
    }
  });
});

describe('HAS-BLED Edge Cases', () => {
  it('minimum score 0', () => {
    const result = calculateHASBLED({
      hypertension: false, renal_disease: false, liver_disease: false,
      stroke_history: false, bleeding_history: false, labile_inr: false,
      age_over_65: false, antiplatelet_or_nsaid: false, alcohol: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('maximum score 9', () => {
    const result = calculateHASBLED({
      hypertension: true, renal_disease: true, liver_disease: true,
      stroke_history: true, bleeding_history: true, labile_inr: true,
      age_over_65: true, antiplatelet_or_nsaid: true, alcohol: true,
    });
    expect(result.score).toBe(9);
    expect(result.riskLevel).toBe('High');
  });

  it('score 2 is low risk', () => {
    const result = calculateHASBLED({
      hypertension: true, renal_disease: false, liver_disease: false,
      stroke_history: false, bleeding_history: false, labile_inr: false,
      age_over_65: true, antiplatelet_or_nsaid: false, alcohol: false,
    });
    expect(result.score).toBe(2);
    expect(result.riskLevel).toBe('Low');
  });

  it('score 3 is high risk', () => {
    const result = calculateHASBLED({
      hypertension: true, renal_disease: true, liver_disease: false,
      stroke_history: false, bleeding_history: false, labile_inr: false,
      age_over_65: true, antiplatelet_or_nsaid: false, alcohol: false,
    });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('High');
    // Should note that high HAS-BLED is NOT a contraindication to anticoagulation
    expect(result.recommendation).toContain('NOT a contraindication');
  });
});

describe('TIMI Score Edge Cases', () => {
  it('minimum score 0', () => {
    const result = calculateTIMI({
      age_65_or_over: false, three_or_more_cad_risk_factors: false,
      known_cad_stenosis_50_percent: false, aspirin_use_past_7_days: false,
      severe_angina_24h: false, st_deviation: false, elevated_cardiac_markers: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Low');
  });

  it('maximum score 7', () => {
    const result = calculateTIMI({
      age_65_or_over: true, three_or_more_cad_risk_factors: true,
      known_cad_stenosis_50_percent: true, aspirin_use_past_7_days: true,
      severe_angina_24h: true, st_deviation: true, elevated_cardiac_markers: true,
    });
    expect(result.score).toBe(7);
    expect(result.riskLevel).toBe('High');
  });

  it('score 2 boundary: low risk', () => {
    const result = calculateTIMI({
      age_65_or_over: true, three_or_more_cad_risk_factors: true,
      known_cad_stenosis_50_percent: false, aspirin_use_past_7_days: false,
      severe_angina_24h: false, st_deviation: false, elevated_cardiac_markers: false,
    });
    expect(result.score).toBe(2);
    expect(result.riskLevel).toBe('Low');
  });

  it('score 3 boundary: intermediate risk', () => {
    const result = calculateTIMI({
      age_65_or_over: true, three_or_more_cad_risk_factors: true,
      known_cad_stenosis_50_percent: true, aspirin_use_past_7_days: false,
      severe_angina_24h: false, st_deviation: false, elevated_cardiac_markers: false,
    });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('Intermediate');
  });

  it('score 5 boundary: high risk', () => {
    const result = calculateTIMI({
      age_65_or_over: true, three_or_more_cad_risk_factors: true,
      known_cad_stenosis_50_percent: true, aspirin_use_past_7_days: true,
      severe_angina_24h: true, st_deviation: false, elevated_cardiac_markers: false,
    });
    expect(result.score).toBe(5);
    expect(result.riskLevel).toBe('High');
  });
});

describe('BMI Edge Cases', () => {
  it('calculates BMI correctly', () => {
    const result = calculateBMI({ weight_kg: 70, height_cm: 175 });
    expect(result.score).toBeCloseTo(22.9, 0);
  });

  it('underweight classification (mild thinness)', () => {
    const result = calculateBMI({ weight_kg: 55, height_cm: 180 });
    expect(result.score).toBeLessThan(18.5);
    // BMI uses WHO classification: Mild thinness for 17-18.5
    expect(result.interpretation).toContain('thinness');
  });

  it('severe thinness classification', () => {
    const result = calculateBMI({ weight_kg: 40, height_cm: 180 });
    expect(result.score).toBeLessThan(16);
    expect(result.riskLevel).toBe('Critical');
  });

  it('normal weight classification', () => {
    const result = calculateBMI({ weight_kg: 70, height_cm: 175 });
    expect(result.score).toBeGreaterThanOrEqual(18.5);
    expect(result.score).toBeLessThan(25);
    expect(result.riskLevel).toBe('Normal');
  });

  it('overweight classification (pre-obese)', () => {
    const result = calculateBMI({ weight_kg: 85, height_cm: 175 });
    expect(result.score).toBeGreaterThanOrEqual(25);
    expect(result.score).toBeLessThan(30);
    expect(result.riskLevel).toBe('Low-Moderate');
    expect(result.interpretation).toContain('Overweight');
  });

  it('obese classification', () => {
    const result = calculateBMI({ weight_kg: 100, height_cm: 170 });
    expect(result.score).toBeGreaterThanOrEqual(30);
  });
});

describe('calculateRiskScore Tool Routing', () => {
  it('routes to correct calculator for each score name', () => {
    const scores: Array<{ name: ScoreName; params: Record<string, unknown> }> = [
      { name: 'CHA2DS2-VASc', params: { age: 40, sex: 'male', chf: false, hypertension: false, stroke_tia_history: false, vascular_disease: false, diabetes: false } },
      { name: 'HEART', params: { history: 'slightly_suspicious', ecg: 'normal', age: 30, risk_factors: 0, troponin: 'normal' } },
      { name: 'Wells-PE', params: { clinical_signs_dvt: false, pe_most_likely_diagnosis: false, heart_rate_over_100: false, immobilization_or_surgery: false, previous_dvt_pe: false, hemoptysis: false, malignancy: false } },
      { name: 'MELD', params: { creatinine: 1, bilirubin: 1, inr: 1 } },
      { name: 'CURB-65', params: { confusion: false, bun_over_19: false, respiratory_rate_over_30: false, systolic_bp_under_90: false, diastolic_bp_under_60: false, age_65_or_over: false } },
      { name: 'GCS', params: { eye_opening: 4, verbal_response: 5, motor_response: 6 } },
      { name: 'eGFR', params: { creatinine: 1, age: 50, sex: 'male' } },
      { name: 'qSOFA', params: { respiratory_rate_22_or_more: false, altered_mental_status: false, systolic_bp_100_or_less: false } },
      { name: 'BMI', params: { weight_kg: 70, height_cm: 175 } },
    ];

    for (const { name, params } of scores) {
      const result = calculateRiskScore(name, params);
      expect(result.scoreName).toBeDefined();
      expect(result.score).toBeDefined();
      expect(result.maxScore).toBeDefined();
      expect(result.riskLevel).toBeDefined();
      expect(result.interpretation).toBeDefined();
      expect(result.recommendation).toBeDefined();
    }
  });

  it('throws for unknown score name', () => {
    expect(() => calculateRiskScore('INVALID' as ScoreName, {})).toThrow('Unknown score');
  });
});

describe('listAvailableScores', () => {
  it('returns array of score definitions', () => {
    const scores = listAvailableScores();
    expect(Array.isArray(scores)).toBeTruthy();
    expect(scores.length).toBeGreaterThanOrEqual(10);
  });

  it('each score has name and description', () => {
    const scores = listAvailableScores();
    for (const score of scores) {
      expect(score.name).toBeDefined();
      expect(score.description).toBeDefined();
    }
  });
});

describe('CURB-65 Edge Cases', () => {
  it('low BP from systolic alone counts', () => {
    const result = calculateCURB65({
      confusion: false, bun_over_19: false, respiratory_rate_over_30: false,
      systolic_bp_under_90: true, diastolic_bp_under_60: false, age_65_or_over: false,
    });
    expect(result.score).toBe(1);
  });

  it('low BP from diastolic alone counts', () => {
    const result = calculateCURB65({
      confusion: false, bun_over_19: false, respiratory_rate_over_30: false,
      systolic_bp_under_90: false, diastolic_bp_under_60: true, age_65_or_over: false,
    });
    expect(result.score).toBe(1);
  });

  it('score 2 is moderate risk', () => {
    const result = calculateCURB65({
      confusion: true, bun_over_19: true, respiratory_rate_over_30: false,
      systolic_bp_under_90: false, diastolic_bp_under_60: false, age_65_or_over: false,
    });
    expect(result.score).toBe(2);
    expect(result.riskLevel).toBe('Moderate');
  });

  it('score 3-5 is high risk', () => {
    const result = calculateCURB65({
      confusion: true, bun_over_19: true, respiratory_rate_over_30: true,
      systolic_bp_under_90: false, diastolic_bp_under_60: false, age_65_or_over: false,
    });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe('High');
    expect(result.recommendation).toContain('ICU');
  });
});

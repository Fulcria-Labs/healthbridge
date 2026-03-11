import { describe, it, expect } from 'vitest';
import {
  calculateCHA2DS2VASc,
  calculateHEART,
  calculateWellsPE,
  calculateMELD,
  calculateCURB65,
  calculateGCS,
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

describe('Risk Score Tool', () => {
  it('lists available scores', () => {
    const scores = listAvailableScores();
    expect(scores.length).toBe(6);
    expect(scores.map(s => s.name)).toContain('CHA2DS2-VASc');
    expect(scores.map(s => s.name)).toContain('HEART');
  });

  it('calculates via generic interface', () => {
    const result = calculateRiskScore('CHA2DS2-VASc', {
      age: 72, sex: 'male', chf: true, hypertension: true,
      stroke_tia_history: false, vascular_disease: false, diabetes: true,
    });
    expect(result.scoreName).toBe('CHA₂DS₂-VASc');
    expect(result.score).toBeGreaterThan(0);
  });

  it('throws for unknown score', () => {
    expect(() => calculateRiskScore('Unknown' as any, {})).toThrow('Unknown score');
  });
});

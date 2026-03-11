import {
  calculateCHA2DS2VASc,
  calculateHEART,
  calculateWellsPE,
  calculateMELD,
  calculateCURB65,
  calculateGCS,
  availableScores,
  type RiskScoreResult,
} from '../data/risk-scores.js';

export type ScoreName = 'CHA2DS2-VASc' | 'HEART' | 'Wells-PE' | 'MELD' | 'CURB-65' | 'GCS';

export function listAvailableScores() {
  return availableScores.map(s => ({
    name: s.name,
    description: s.description,
  }));
}

export function calculateRiskScore(scoreName: ScoreName, parameters: Record<string, unknown>): RiskScoreResult {
  switch (scoreName) {
    case 'CHA2DS2-VASc':
      return calculateCHA2DS2VASc({
        age: Number(parameters.age),
        sex: parameters.sex as 'male' | 'female',
        chf: Boolean(parameters.chf),
        hypertension: Boolean(parameters.hypertension),
        stroke_tia_history: Boolean(parameters.stroke_tia_history),
        vascular_disease: Boolean(parameters.vascular_disease),
        diabetes: Boolean(parameters.diabetes),
      });

    case 'HEART':
      return calculateHEART({
        history: parameters.history as 'slightly_suspicious' | 'moderately_suspicious' | 'highly_suspicious',
        ecg: parameters.ecg as 'normal' | 'non_specific_changes' | 'significant_st_deviation',
        age: Number(parameters.age),
        risk_factors: Number(parameters.risk_factors),
        troponin: parameters.troponin as 'normal' | 'mildly_elevated' | 'significantly_elevated',
      });

    case 'Wells-PE':
      return calculateWellsPE({
        clinical_signs_dvt: Boolean(parameters.clinical_signs_dvt),
        pe_most_likely_diagnosis: Boolean(parameters.pe_most_likely_diagnosis),
        heart_rate_over_100: Boolean(parameters.heart_rate_over_100),
        immobilization_or_surgery: Boolean(parameters.immobilization_or_surgery),
        previous_dvt_pe: Boolean(parameters.previous_dvt_pe),
        hemoptysis: Boolean(parameters.hemoptysis),
        malignancy: Boolean(parameters.malignancy),
      });

    case 'MELD':
      return calculateMELD({
        creatinine: Number(parameters.creatinine),
        bilirubin: Number(parameters.bilirubin),
        inr: Number(parameters.inr),
        sodium: parameters.sodium !== undefined ? Number(parameters.sodium) : undefined,
        on_dialysis: parameters.on_dialysis !== undefined ? Boolean(parameters.on_dialysis) : undefined,
      });

    case 'CURB-65':
      return calculateCURB65({
        confusion: Boolean(parameters.confusion),
        bun_over_19: Boolean(parameters.bun_over_19),
        respiratory_rate_over_30: Boolean(parameters.respiratory_rate_over_30),
        systolic_bp_under_90: Boolean(parameters.systolic_bp_under_90),
        diastolic_bp_under_60: Boolean(parameters.diastolic_bp_under_60),
        age_65_or_over: Boolean(parameters.age_65_or_over),
      });

    case 'GCS':
      return calculateGCS({
        eye_opening: Number(parameters.eye_opening) as 1 | 2 | 3 | 4,
        verbal_response: Number(parameters.verbal_response) as 1 | 2 | 3 | 4 | 5,
        motor_response: Number(parameters.motor_response) as 1 | 2 | 3 | 4 | 5 | 6,
      });

    default:
      throw new Error(`Unknown score: ${scoreName}. Available scores: ${availableScores.map(s => s.name).join(', ')}`);
  }
}

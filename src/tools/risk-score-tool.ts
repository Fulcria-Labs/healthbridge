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
  availableScores,
  type RiskScoreResult,
} from '../data/risk-scores.js';

export type ScoreName = 'CHA2DS2-VASc' | 'HEART' | 'Wells-PE' | 'MELD' | 'CURB-65' | 'GCS' | 'eGFR' | 'qSOFA' | 'SOFA' | 'Child-Pugh' | 'ASCVD' | 'NEWS2';

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

    case 'eGFR':
      return calculateEGFR({
        creatinine: Number(parameters.creatinine),
        age: Number(parameters.age),
        sex: parameters.sex as 'male' | 'female',
      });

    case 'qSOFA':
      return calculateQSOFA({
        respiratory_rate_22_or_more: Boolean(parameters.respiratory_rate_22_or_more),
        altered_mental_status: Boolean(parameters.altered_mental_status),
        systolic_bp_100_or_less: Boolean(parameters.systolic_bp_100_or_less),
      });

    case 'SOFA':
      return calculateSOFA({
        pao2_fio2: Number(parameters.pao2_fio2),
        on_mechanical_ventilation: Boolean(parameters.on_mechanical_ventilation),
        platelets: Number(parameters.platelets),
        bilirubin: Number(parameters.bilirubin),
        cardiovascular: parameters.cardiovascular as 'no_hypotension' | 'map_under_70' | 'dopamine_lte_5' | 'dopamine_gt_5_or_epi_lte_0_1' | 'dopamine_gt_15_or_epi_gt_0_1',
        gcs: Number(parameters.gcs),
        creatinine: Number(parameters.creatinine),
        urine_output_ml_day: parameters.urine_output_ml_day !== undefined ? Number(parameters.urine_output_ml_day) : undefined,
      });

    case 'Child-Pugh':
      return calculateChildPugh({
        bilirubin: Number(parameters.bilirubin),
        albumin: Number(parameters.albumin),
        inr: Number(parameters.inr),
        ascites: parameters.ascites as 'none' | 'mild' | 'moderate_severe',
        encephalopathy: parameters.encephalopathy as 'none' | 'grade_1_2' | 'grade_3_4',
      });

    case 'ASCVD':
      return calculateASCVD({
        age: Number(parameters.age),
        sex: parameters.sex as 'male' | 'female',
        race: (parameters.race as 'white' | 'african_american' | 'other') ?? 'other',
        total_cholesterol: Number(parameters.total_cholesterol),
        hdl_cholesterol: Number(parameters.hdl_cholesterol),
        systolic_bp: Number(parameters.systolic_bp),
        on_bp_treatment: Boolean(parameters.on_bp_treatment),
        diabetes: Boolean(parameters.diabetes),
        smoker: Boolean(parameters.smoker),
      });

    case 'NEWS2':
      return calculateNEWS2({
        respiratory_rate: Number(parameters.respiratory_rate),
        spo2: Number(parameters.spo2),
        on_supplemental_o2: Boolean(parameters.on_supplemental_o2),
        spo2_scale2: Boolean(parameters.spo2_scale2),
        systolic_bp: Number(parameters.systolic_bp),
        heart_rate: Number(parameters.heart_rate),
        consciousness: parameters.consciousness as 'alert' | 'confusion' | 'voice' | 'pain' | 'unresponsive',
        temperature: Number(parameters.temperature),
      });

    default:
      throw new Error(`Unknown score: ${scoreName}. Available scores: ${availableScores.map(s => s.name).join(', ')}`);
  }
}

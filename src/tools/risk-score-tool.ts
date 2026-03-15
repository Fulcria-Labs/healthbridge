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
  calculateFramingham,
  calculateAPACHEII,
  calculatePESI,
  calculateModifiedRankin,
  calculateMorseFallScale,
  availableScores,
  type RiskScoreResult,
} from '../data/risk-scores.js';

export type ScoreName = 'CHA2DS2-VASc' | 'HEART' | 'Wells-PE' | 'MELD' | 'CURB-65' | 'GCS' | 'eGFR' | 'qSOFA' | 'SOFA' | 'Child-Pugh' | 'ASCVD' | 'NEWS2' | 'HAS-BLED' | 'TIMI' | 'ABCD2' | 'BMI' | 'Framingham' | 'APACHE-II' | 'PESI' | 'mRS' | 'Morse-Fall-Scale';

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

    case 'HAS-BLED':
      return calculateHASBLED({
        hypertension: Boolean(parameters.hypertension),
        renal_disease: Boolean(parameters.renal_disease),
        liver_disease: Boolean(parameters.liver_disease),
        stroke_history: Boolean(parameters.stroke_history),
        bleeding_history: Boolean(parameters.bleeding_history),
        labile_inr: Boolean(parameters.labile_inr),
        age_over_65: Boolean(parameters.age_over_65),
        antiplatelet_or_nsaid: Boolean(parameters.antiplatelet_or_nsaid),
        alcohol: Boolean(parameters.alcohol),
      });

    case 'TIMI':
      return calculateTIMI({
        age_65_or_over: Boolean(parameters.age_65_or_over),
        three_or_more_cad_risk_factors: Boolean(parameters.three_or_more_cad_risk_factors),
        known_cad_stenosis_50_percent: Boolean(parameters.known_cad_stenosis_50_percent),
        aspirin_use_past_7_days: Boolean(parameters.aspirin_use_past_7_days),
        severe_angina_24h: Boolean(parameters.severe_angina_24h),
        st_deviation: Boolean(parameters.st_deviation),
        elevated_cardiac_markers: Boolean(parameters.elevated_cardiac_markers),
      });

    case 'ABCD2':
      return calculateABCD2({
        age_60_or_over: Boolean(parameters.age_60_or_over),
        blood_pressure_elevated: Boolean(parameters.blood_pressure_elevated),
        clinical_features: parameters.clinical_features as 'speech_impairment' | 'unilateral_weakness' | 'other',
        duration_minutes: Number(parameters.duration_minutes),
        diabetes: Boolean(parameters.diabetes),
      });

    case 'BMI':
      return calculateBMI({
        weight_kg: Number(parameters.weight_kg),
        height_cm: Number(parameters.height_cm),
      });

    case 'Framingham':
      return calculateFramingham({
        age: Number(parameters.age),
        sex: parameters.sex as 'male' | 'female',
        total_cholesterol: Number(parameters.total_cholesterol),
        hdl_cholesterol: Number(parameters.hdl_cholesterol),
        systolic_bp: Number(parameters.systolic_bp),
        bp_treated: Boolean(parameters.bp_treated),
        smoker: Boolean(parameters.smoker),
        diabetes: Boolean(parameters.diabetes),
      });

    case 'APACHE-II':
      return calculateAPACHEII({
        temperature: Number(parameters.temperature),
        mean_arterial_pressure: Number(parameters.mean_arterial_pressure),
        heart_rate: Number(parameters.heart_rate),
        respiratory_rate: Number(parameters.respiratory_rate),
        oxygenation: Number(parameters.oxygenation),
        fio2_gte_50: Boolean(parameters.fio2_gte_50),
        arterial_ph: Number(parameters.arterial_ph),
        sodium: Number(parameters.sodium),
        potassium: Number(parameters.potassium),
        creatinine: Number(parameters.creatinine),
        acute_renal_failure: Boolean(parameters.acute_renal_failure),
        hematocrit: Number(parameters.hematocrit),
        wbc: Number(parameters.wbc),
        gcs: Number(parameters.gcs),
        age: Number(parameters.age),
        chronic_health: (parameters.chronic_health as 'none' | 'nonoperative' | 'emergency_postop' | 'elective_postop') ?? 'none',
        severe_organ_insufficiency: Boolean(parameters.severe_organ_insufficiency),
      });

    case 'PESI':
      return calculatePESI({
        age: Number(parameters.age),
        sex: parameters.sex as 'male' | 'female',
        cancer: Boolean(parameters.cancer),
        heart_failure: Boolean(parameters.heart_failure),
        chronic_lung_disease: Boolean(parameters.chronic_lung_disease),
        heart_rate_gte_110: Boolean(parameters.heart_rate_gte_110),
        systolic_bp_lt_100: Boolean(parameters.systolic_bp_lt_100),
        respiratory_rate_gte_30: Boolean(parameters.respiratory_rate_gte_30),
        temperature_lt_36: Boolean(parameters.temperature_lt_36),
        altered_mental_status: Boolean(parameters.altered_mental_status),
        spo2_lt_90: Boolean(parameters.spo2_lt_90),
      });

    case 'mRS':
      return calculateModifiedRankin({
        functional_status: Number(parameters.functional_status) as 0 | 1 | 2 | 3 | 4 | 5 | 6,
      });

    case 'Morse-Fall-Scale':
      return calculateMorseFallScale({
        history_of_falling: Boolean(parameters.history_of_falling),
        secondary_diagnosis: Boolean(parameters.secondary_diagnosis),
        ambulatory_aid: (parameters.ambulatory_aid as 'none' | 'crutch_cane_walker' | 'furniture') ?? 'none',
        iv_heparin_lock: Boolean(parameters.iv_heparin_lock),
        gait: (parameters.gait as 'normal' | 'weak' | 'impaired') ?? 'normal',
        mental_status: (parameters.mental_status as 'oriented' | 'overestimates') ?? 'oriented',
      });

    default:
      throw new Error(`Unknown score: ${scoreName}. Available scores: ${availableScores.map(s => s.name).join(', ')}`);
  }
}

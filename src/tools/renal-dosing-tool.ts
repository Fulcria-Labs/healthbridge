/**
 * Renal Dosing Adjustment Tool
 *
 * Provides evidence-based medication dose adjustments for patients
 * with chronic kidney disease (CKD) based on eGFR.
 */

import { checkRenalDosing, getDosingForEGFR, listRenalDosingDrugs } from '../data/renal-dosing.js';

export interface RenalDosingInput {
  medications: string[];
  eGFR: number;
}

export interface SingleDrugDosingInput {
  drug: string;
  eGFR: number;
}

export function checkMedicationRenalDosing(input: RenalDosingInput) {
  return checkRenalDosing(input.medications, input.eGFR);
}

export function checkSingleDrugDosing(input: SingleDrugDosingInput) {
  const result = getDosingForEGFR(input.drug, input.eGFR);
  if (!result) {
    return {
      error: `Drug "${input.drug}" not found in renal dosing database.`,
      availableDrugs: listRenalDosingDrugs(),
    };
  }
  return result;
}

export function listAvailableRenalDosingDrugs() {
  return listRenalDosingDrugs();
}

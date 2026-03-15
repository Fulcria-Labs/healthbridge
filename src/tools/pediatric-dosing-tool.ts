/**
 * Pediatric Dosing Tool
 *
 * Weight-based and age-based dosing calculations for pediatric medications.
 */

import { calculatePediatricDose, listPediatricDosingDrugs } from '../data/pediatric-dosing.js';

export interface PediatricDosingInput {
  drug: string;
  weightKg: number;
  ageMonths: number;
  indication?: string;
}

export function getPediatricDose(input: PediatricDosingInput) {
  const result = calculatePediatricDose(input.drug, input.weightKg, input.ageMonths, input.indication);
  if (!result) {
    return {
      error: `Drug "${input.drug}" not found in pediatric dosing database.`,
      availableDrugs: listPediatricDosingDrugs(),
    };
  }
  return result;
}

export function listPediatricDrugs() {
  return listPediatricDosingDrugs();
}

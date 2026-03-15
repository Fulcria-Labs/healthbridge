/**
 * Allergy Cross-Reactivity Tool
 *
 * Checks for drug allergy cross-reactivity between known allergies
 * and proposed medications.
 */

import { checkCrossReactivity, checkAllCrossReactivities, listAllergyClasses } from '../data/allergy-crossreactivity.js';

export interface SingleAllergyCheckInput {
  allergy: string;
  proposedDrug: string;
}

export interface BulkAllergyCheckInput {
  allergies: string[];
  medications: string[];
}

export function checkSingleCrossReactivity(input: SingleAllergyCheckInput) {
  const result = checkCrossReactivity(input.allergy, input.proposedDrug);
  if (!result) {
    return {
      allergy: input.allergy,
      proposedDrug: input.proposedDrug,
      crossReactivityFound: false,
      riskLevel: 'none',
      recommendation: 'No known cross-reactivity found in database. Standard allergy precautions still apply.',
      availableAllergyClasses: listAllergyClasses(),
    };
  }
  return result;
}

export function checkBulkCrossReactivity(input: BulkAllergyCheckInput) {
  return checkAllCrossReactivities(input.allergies, input.medications);
}

export function listAvailableAllergyClasses() {
  return listAllergyClasses();
}

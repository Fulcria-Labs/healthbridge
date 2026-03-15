/**
 * Pregnancy Safety Tool
 *
 * Check medication safety during pregnancy and lactation.
 */

import { checkPregnancySafety, screenMedicationsForPregnancy, listPregnancyDrugs } from '../data/pregnancy-safety.js';

export function checkSinglePregnancySafety(input: { drug: string; trimester?: 1 | 2 | 3 }) {
  return checkPregnancySafety(input.drug, input.trimester);
}

export function screenPregnancyMedications(input: { medications: string[]; trimester?: 1 | 2 | 3 }) {
  return screenMedicationsForPregnancy(input.medications, input.trimester);
}

export function listPregnancyDatabaseDrugs() {
  return listPregnancyDrugs();
}

/**
 * IV Compatibility Tool
 *
 * Check Y-site and admixture compatibility between IV medications.
 */

import { checkIVCompatibility, checkBulkIVCompatibility, listIVDrugsInDatabase } from '../data/iv-compatibility.js';

export function checkSingleIVCompatibility(input: { drug1: string; drug2: string }) {
  return checkIVCompatibility(input.drug1, input.drug2);
}

export function checkMultipleIVCompatibility(input: { drugs: string[] }) {
  return checkBulkIVCompatibility(input.drugs);
}

export function listIVDrugs() {
  return listIVDrugsInDatabase();
}

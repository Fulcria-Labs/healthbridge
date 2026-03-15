/**
 * Opioid MEDD Tool
 *
 * Calculate Morphine Equivalent Daily Dose and opioid conversions.
 */

import { calculateSingleOpioidMME, calculateTotalMEDD, convertOpioidDose, listOpioids, type OpioidDoseInput } from '../data/opioid-medd.js';

export function calculateMME(input: { drug: string; dailyDose: number }) {
  return calculateSingleOpioidMME(input);
}

export function calculateTotalMME(input: { opioids: OpioidDoseInput[] }) {
  return calculateTotalMEDD(input.opioids);
}

export function convertOpioid(input: { fromDrug: string; fromDailyDose: number; toDrug: string; reductionPercent?: number }) {
  return convertOpioidDose(input.fromDrug, input.fromDailyDose, input.toDrug, input.reductionPercent);
}

export function listAvailableOpioids() {
  return listOpioids();
}

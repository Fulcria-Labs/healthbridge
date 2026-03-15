/**
 * Pharmacokinetic Calculator Tool
 *
 * Clinical calculators for drug dosing parameters.
 */

import { runCalculator, listCalculators } from '../data/pharmacokinetics.js';

export interface PKCalcInput {
  calculator: string;
  parameters: Record<string, unknown>;
}

export function runPKCalculator(input: PKCalcInput) {
  return runCalculator(input.calculator, input.parameters);
}

export function listPKCalculators() {
  return listCalculators();
}

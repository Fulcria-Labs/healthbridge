/**
 * Pharmacokinetic Calculators
 *
 * Clinical calculators for pharmacokinetic parameters used in drug dosing.
 * Based on established clinical formulas.
 */

export interface PKCalcResult {
  calculator: string;
  result: number;
  unit: string;
  formula: string;
  inputs: Record<string, number | string>;
  interpretation: string;
  clinicalNotes: string;
}

/**
 * Cockcroft-Gault Creatinine Clearance (CrCl)
 * Standard formula for drug dosing adjustments
 */
export function calculateCrCl(params: {
  age: number;
  weightKg: number;
  serumCreatinine: number;
  sex: 'male' | 'female';
}): PKCalcResult {
  const { age, weightKg, serumCreatinine, sex } = params;
  const base = ((140 - age) * weightKg) / (72 * serumCreatinine);
  const result = sex === 'female' ? base * 0.85 : base;
  const rounded = Math.round(result * 10) / 10;

  let interpretation: string;
  if (rounded >= 90) interpretation = 'Normal kidney function';
  else if (rounded >= 60) interpretation = 'Mild impairment';
  else if (rounded >= 30) interpretation = 'Moderate impairment';
  else if (rounded >= 15) interpretation = 'Severe impairment';
  else interpretation = 'Kidney failure';

  return {
    calculator: 'Cockcroft-Gault CrCl',
    result: rounded,
    unit: 'mL/min',
    formula: 'CrCl = [(140 - age) × weight] / (72 × SCr)' + (sex === 'female' ? ' × 0.85' : ''),
    inputs: { age, weightKg, serumCreatinine, sex },
    interpretation,
    clinicalNotes: 'Uses actual body weight. For obese patients (>130% IBW), consider using adjusted body weight. Many drug dosing tables reference CrCl rather than eGFR.',
  };
}

/**
 * Ideal Body Weight (Devine formula, 1974)
 */
export function calculateIBW(params: {
  heightCm: number;
  sex: 'male' | 'female';
}): PKCalcResult {
  const { heightCm, sex } = params;
  const heightInches = heightCm / 2.54;
  const inchesOver60 = Math.max(0, heightInches - 60);
  const ibw = sex === 'male'
    ? 50 + 2.3 * inchesOver60
    : 45.5 + 2.3 * inchesOver60;
  const rounded = Math.round(ibw * 10) / 10;

  return {
    calculator: 'Ideal Body Weight (Devine)',
    result: rounded,
    unit: 'kg',
    formula: sex === 'male'
      ? 'IBW = 50 + 2.3 × (height in inches - 60)'
      : 'IBW = 45.5 + 2.3 × (height in inches - 60)',
    inputs: { heightCm, sex },
    interpretation: `Ideal body weight: ${rounded} kg`,
    clinicalNotes: 'Used for aminoglycoside dosing, ventilator tidal volume calculations, and as input for adjusted body weight. Not validated for height <152 cm (5 ft).',
  };
}

/**
 * Adjusted Body Weight (ABW)
 * For obese patients (actual weight > 130% IBW)
 */
export function calculateABW(params: {
  actualWeightKg: number;
  heightCm: number;
  sex: 'male' | 'female';
  correctionFactor?: number;
}): PKCalcResult {
  const { actualWeightKg, heightCm, sex, correctionFactor = 0.4 } = params;
  const ibwResult = calculateIBW({ heightCm, sex });
  const ibw = ibwResult.result;
  const abw = ibw + correctionFactor * (actualWeightKg - ibw);
  const rounded = Math.round(abw * 10) / 10;
  const percentIBW = Math.round((actualWeightKg / ibw) * 100);

  return {
    calculator: 'Adjusted Body Weight',
    result: rounded,
    unit: 'kg',
    formula: `ABW = IBW + ${correctionFactor} × (actual weight - IBW)`,
    inputs: { actualWeightKg, heightCm, sex, correctionFactor, ibw, percentIBW: `${percentIBW}%` },
    interpretation: percentIBW > 130
      ? `Patient is ${percentIBW}% of IBW (obese). Use ABW ${rounded} kg for dosing.`
      : `Patient is ${percentIBW}% of IBW. ABW = ${rounded} kg, but actual weight may be appropriate for dosing.`,
    clinicalNotes: 'Correction factor 0.4 is standard for most drugs. Vancomycin uses actual body weight. Aminoglycosides use ABW when >130% IBW.',
  };
}

/**
 * Body Surface Area (BSA) - Mosteller formula
 */
export function calculateBSA(params: {
  heightCm: number;
  weightKg: number;
}): PKCalcResult {
  const { heightCm, weightKg } = params;
  const bsa = Math.sqrt((heightCm * weightKg) / 3600);
  const rounded = Math.round(bsa * 100) / 100;

  let interpretation: string;
  if (rounded < 1.0) interpretation = 'Below average BSA (pediatric range)';
  else if (rounded < 1.7) interpretation = 'Below average adult BSA';
  else if (rounded < 2.0) interpretation = 'Average adult BSA';
  else if (rounded < 2.5) interpretation = 'Above average BSA';
  else interpretation = 'Very high BSA';

  return {
    calculator: 'Body Surface Area (Mosteller)',
    result: rounded,
    unit: 'm²',
    formula: 'BSA = √(height [cm] × weight [kg] / 3600)',
    inputs: { heightCm, weightKg },
    interpretation,
    clinicalNotes: 'Used for chemotherapy dosing, fluid resuscitation (Burns), and cardiac index calculation. Average adult BSA ≈ 1.7-2.0 m².',
  };
}

/**
 * Corrected Calcium for Albumin
 */
export function calculateCorrectedCalcium(params: {
  totalCalcium: number;
  albumin: number;
}): PKCalcResult {
  const { totalCalcium, albumin } = params;
  const corrected = totalCalcium + 0.8 * (4.0 - albumin);
  const rounded = Math.round(corrected * 10) / 10;

  let interpretation: string;
  if (rounded < 8.5) interpretation = 'Hypocalcemia (corrected)';
  else if (rounded <= 10.5) interpretation = 'Normal (corrected)';
  else if (rounded <= 12.0) interpretation = 'Mild hypercalcemia';
  else if (rounded <= 14.0) interpretation = 'Moderate hypercalcemia';
  else interpretation = 'Severe hypercalcemia — medical emergency';

  return {
    calculator: 'Corrected Calcium (Albumin)',
    result: rounded,
    unit: 'mg/dL',
    formula: 'Corrected Ca = Total Ca + 0.8 × (4.0 - albumin)',
    inputs: { totalCalcium, albumin },
    interpretation,
    clinicalNotes: 'Adjusts for hypoalbuminemia which falsely lowers measured total calcium. Normal serum albumin assumed as 4.0 g/dL. Ionized calcium is more accurate when available.',
  };
}

/**
 * Corrected Phenytoin for Albumin (Sheiner-Tozer)
 */
export function calculateCorrectedPhenytoin(params: {
  measuredPhenytoin: number;
  albumin: number;
  renalImpairment?: boolean;
}): PKCalcResult {
  const { measuredPhenytoin, albumin, renalImpairment = false } = params;
  const factor = renalImpairment ? 0.1 : 0.2;
  const corrected = measuredPhenytoin / (factor * albumin + 0.1);
  const rounded = Math.round(corrected * 10) / 10;

  let interpretation: string;
  if (rounded < 10) interpretation = 'Subtherapeutic (target 10-20 mcg/mL)';
  else if (rounded <= 20) interpretation = 'Therapeutic range';
  else interpretation = 'Supratherapeutic — toxicity risk';

  return {
    calculator: 'Corrected Phenytoin (Sheiner-Tozer)',
    result: rounded,
    unit: 'mcg/mL',
    formula: renalImpairment
      ? 'Corrected = measured / (0.1 × albumin + 0.1)'
      : 'Corrected = measured / (0.2 × albumin + 0.1)',
    inputs: { measuredPhenytoin, albumin, renalImpairment: renalImpairment ? 'yes' : 'no' },
    interpretation,
    clinicalNotes: 'Phenytoin is ~90% protein bound. Low albumin increases free (active) fraction. This formula estimates what the total level would be with normal albumin. Free phenytoin level (target 1-2 mcg/mL) is more accurate.',
  };
}

/**
 * Anion Gap
 */
export function calculateAnionGap(params: {
  sodium: number;
  chloride: number;
  bicarbonate: number;
  albumin?: number;
}): PKCalcResult {
  const { sodium, chloride, bicarbonate, albumin } = params;
  const ag = sodium - (chloride + bicarbonate);
  const rounded = Math.round(ag * 10) / 10;

  let correctedAG: number | undefined;
  let correctionNote = '';
  if (albumin !== undefined && albumin < 4.0) {
    correctedAG = Math.round((ag + 2.5 * (4.0 - albumin)) * 10) / 10;
    correctionNote = ` Albumin-corrected AG: ${correctedAG} mEq/L.`;
  }

  const effectiveAG = correctedAG ?? rounded;

  let interpretation: string;
  if (effectiveAG <= 12) interpretation = 'Normal anion gap';
  else if (effectiveAG <= 20) interpretation = 'Elevated anion gap — consider MUDPILES differential';
  else interpretation = 'Significantly elevated anion gap — urgent workup needed';

  return {
    calculator: 'Anion Gap',
    result: rounded,
    unit: 'mEq/L',
    formula: 'AG = Na⁺ - (Cl⁻ + HCO₃⁻)' + (albumin !== undefined ? ' + 2.5 × (4.0 - albumin)' : ''),
    inputs: { sodium, chloride, bicarbonate, ...(albumin !== undefined ? { albumin } : {}) },
    interpretation: interpretation + correctionNote,
    clinicalNotes: 'Normal AG: 8-12 mEq/L. MUDPILES: Methanol, Uremia, DKA, Propylene glycol, INH/Iron, Lactic acidosis, Ethylene glycol, Salicylates. Correct for albumin: each 1 g/dL decrease in albumin lowers AG by ~2.5.',
  };
}

/**
 * Run a named calculator
 */
export function runCalculator(
  calculatorName: string,
  params: Record<string, unknown>
): PKCalcResult | { error: string; availableCalculators: string[] } {
  const name = calculatorName.toLowerCase().replace(/[^a-z]/g, '');
  const available = listCalculators();

  switch (name) {
    case 'crcl':
    case 'creatinineclearance':
    case 'cockcroftgault':
      return calculateCrCl(params as Parameters<typeof calculateCrCl>[0]);
    case 'ibw':
    case 'idealbodyweight':
      return calculateIBW(params as Parameters<typeof calculateIBW>[0]);
    case 'abw':
    case 'adjustedbodyweight':
      return calculateABW(params as Parameters<typeof calculateABW>[0]);
    case 'bsa':
    case 'bodysurfacearea':
      return calculateBSA(params as Parameters<typeof calculateBSA>[0]);
    case 'correctedcalcium':
      return calculateCorrectedCalcium(params as Parameters<typeof calculateCorrectedCalcium>[0]);
    case 'correctedphenytoin':
      return calculateCorrectedPhenytoin(params as Parameters<typeof calculateCorrectedPhenytoin>[0]);
    case 'aniongap':
      return calculateAnionGap(params as Parameters<typeof calculateAnionGap>[0]);
    default:
      return { error: `Unknown calculator: ${calculatorName}`, availableCalculators: available.map(c => c.name) };
  }
}

/**
 * List available calculators
 */
export function listCalculators(): Array<{ name: string; description: string; requiredParams: string[] }> {
  return [
    { name: 'CrCl', description: 'Cockcroft-Gault Creatinine Clearance', requiredParams: ['age', 'weightKg', 'serumCreatinine', 'sex'] },
    { name: 'IBW', description: 'Ideal Body Weight (Devine)', requiredParams: ['heightCm', 'sex'] },
    { name: 'ABW', description: 'Adjusted Body Weight', requiredParams: ['actualWeightKg', 'heightCm', 'sex'] },
    { name: 'BSA', description: 'Body Surface Area (Mosteller)', requiredParams: ['heightCm', 'weightKg'] },
    { name: 'correctedCalcium', description: 'Albumin-Corrected Calcium', requiredParams: ['totalCalcium', 'albumin'] },
    { name: 'correctedPhenytoin', description: 'Albumin-Corrected Phenytoin (Sheiner-Tozer)', requiredParams: ['measuredPhenytoin', 'albumin'] },
    { name: 'anionGap', description: 'Anion Gap (with optional albumin correction)', requiredParams: ['sodium', 'chloride', 'bicarbonate'] },
  ];
}

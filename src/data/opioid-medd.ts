/**
 * Opioid Morphine Equivalent Daily Dose (MEDD) Calculator
 *
 * Converts between opioid doses using standardized morphine milligram equivalents (MME).
 * Based on CDC Clinical Practice Guideline for Prescribing Opioids (2022).
 * CMS MME conversion factors.
 *
 * CRITICAL: These conversions are approximate. Clinical judgment required.
 * Cross-tolerance is incomplete — reduce calculated equianalgesic dose by 25-50%.
 */

export interface OpioidConversionFactor {
  name: string;
  aliases: string[];
  route: 'oral' | 'parenteral' | 'transdermal' | 'sublingual';
  mmeFactor: number;  // multiply dose by this to get MME
  unit: string;
  maxRecommendedMME: number;
  notes: string;
}

const opioidFactors: OpioidConversionFactor[] = [
  // Oral opioids
  { name: 'morphine', aliases: ['ms contin', 'kadian', 'avinza', 'msir'], route: 'oral', mmeFactor: 1, unit: 'mg', maxRecommendedMME: 90, notes: 'Reference standard. 1 mg oral morphine = 1 MME.' },
  { name: 'codeine', aliases: ['tylenol #3', 'tylenol with codeine'], route: 'oral', mmeFactor: 0.15, unit: 'mg', maxRecommendedMME: 90, notes: 'Prodrug — 10% of population are poor metabolizers (CYP2D6).' },
  { name: 'tramadol', aliases: ['ultram', 'ultracet'], route: 'oral', mmeFactor: 0.2, unit: 'mg', maxRecommendedMME: 90, notes: 'Also inhibits serotonin/NE reuptake. Seizure risk. Serotonin syndrome risk with SSRIs.' },
  { name: 'hydrocodone', aliases: ['vicodin', 'norco', 'lortab', 'zohydro'], route: 'oral', mmeFactor: 1, unit: 'mg', maxRecommendedMME: 90, notes: 'Equianalgesic to oral morphine. Most prescribed opioid in US.' },
  { name: 'oxycodone', aliases: ['oxycontin', 'percocet', 'roxicodone', 'xtampza'], route: 'oral', mmeFactor: 1.5, unit: 'mg', maxRecommendedMME: 90, notes: '1 mg oxycodone = 1.5 MME. Higher bioavailability than morphine.' },
  { name: 'hydromorphone', aliases: ['dilaudid', 'exalgo'], route: 'oral', mmeFactor: 4, unit: 'mg', maxRecommendedMME: 90, notes: '1 mg oral hydromorphone = 4 MME. More potent than morphine.' },
  { name: 'oxymorphone', aliases: ['opana'], route: 'oral', mmeFactor: 3, unit: 'mg', maxRecommendedMME: 90, notes: '1 mg oral oxymorphone = 3 MME.' },
  { name: 'tapentadol', aliases: ['nucynta'], route: 'oral', mmeFactor: 0.4, unit: 'mg', maxRecommendedMME: 90, notes: 'Dual mechanism: mu-opioid agonist + norepinephrine reuptake inhibitor.' },
  { name: 'methadone', aliases: ['dolophine', 'methadose'], route: 'oral', mmeFactor: 0, unit: 'mg', maxRecommendedMME: 40, notes: 'VARIABLE conversion — NOT linear. Use tiered conversion: 1-20mg/day MME=4, 21-40=8, 41-60=10, >60=12. Long/unpredictable half-life (8-59h). Consult pain specialist.' },

  // Parenteral opioids
  { name: 'morphine iv', aliases: ['morphine injection', 'morphine parenteral'], route: 'parenteral', mmeFactor: 3, unit: 'mg', maxRecommendedMME: 90, notes: 'IV morphine is ~3x more potent than oral. 1 mg IV morphine ≈ 3 mg oral morphine.' },
  { name: 'hydromorphone iv', aliases: ['dilaudid injection', 'dilaudid iv'], route: 'parenteral', mmeFactor: 20, unit: 'mg', maxRecommendedMME: 90, notes: '1 mg IV hydromorphone ≈ 20 MME. Very potent.' },
  { name: 'fentanyl iv', aliases: ['fentanyl injection', 'sublimaze'], route: 'parenteral', mmeFactor: 300, unit: 'mg', maxRecommendedMME: 90, notes: '1 mg IV fentanyl = 300 MME. Typically dosed in mcg.' },

  // Transdermal
  { name: 'fentanyl patch', aliases: ['duragesic', 'fentanyl transdermal'], route: 'transdermal', mmeFactor: 2.4, unit: 'mcg/hr', maxRecommendedMME: 90, notes: 'Fentanyl patch 25 mcg/hr ≈ 60 MME/day. Factor: dose (mcg/hr) × 2.4 = daily MME. Only for opioid-tolerant patients.' },

  // Sublingual/buccal
  { name: 'buprenorphine', aliases: ['subutex', 'suboxone', 'sublocade', 'belbuca'], route: 'sublingual', mmeFactor: 0, unit: 'mg', maxRecommendedMME: 90, notes: 'Partial agonist. MME conversion not applicable per CDC. Ceiling effect on respiratory depression. Used for OUD treatment and chronic pain.' },
];

// Special methadone tiered conversion
function methadoneMMEFactor(dailyDoseMg: number): number {
  if (dailyDoseMg <= 20) return 4;
  if (dailyDoseMg <= 40) return 8;
  if (dailyDoseMg <= 60) return 10;
  return 12;
}

function resolveOpioid(name: string): OpioidConversionFactor | undefined {
  const lower = name.toLowerCase().trim();
  return opioidFactors.find(o =>
    o.name === lower || o.aliases.some(a => a === lower)
  );
}

export interface OpioidDoseInput {
  drug: string;
  dailyDose: number;
  unit?: string;
}

export interface MEDDResult {
  drug: string;
  resolvedName: string;
  route: string;
  dailyDose: number;
  unit: string;
  mmeFactor: number;
  dailyMME: number;
  riskLevel: string;
  cdcThresholdWarning?: string;
  notes: string;
}

export function calculateSingleOpioidMME(input: OpioidDoseInput): MEDDResult | { error: string; availableOpioids: string[] } {
  const opioid = resolveOpioid(input.drug);
  if (!opioid) {
    return {
      error: `Unknown opioid: ${input.drug}`,
      availableOpioids: opioidFactors.map(o => `${o.name} (${o.route})`),
    };
  }

  let dailyMME: number;
  let factor: number;

  if (opioid.name === 'methadone') {
    factor = methadoneMMEFactor(input.dailyDose);
    dailyMME = input.dailyDose * factor;
  } else if (opioid.name === 'buprenorphine') {
    factor = 0;
    dailyMME = 0;
  } else {
    factor = opioid.mmeFactor;
    dailyMME = input.dailyDose * factor;
  }

  dailyMME = Math.round(dailyMME * 10) / 10;

  let riskLevel: string;
  let cdcThresholdWarning: string | undefined;

  if (opioid.name === 'buprenorphine') {
    riskLevel = 'Partial agonist — MME not applicable';
  } else if (dailyMME === 0) {
    riskLevel = 'Unable to calculate';
  } else if (dailyMME < 50) {
    riskLevel = 'Lower risk';
  } else if (dailyMME < 90) {
    riskLevel = 'Moderate risk';
    cdcThresholdWarning = 'Approaching CDC 90 MME/day threshold. Reassess need for opioid therapy.';
  } else {
    riskLevel = 'HIGH RISK';
    cdcThresholdWarning = 'EXCEEDS CDC 90 MME/day threshold. Associated with significantly increased overdose risk. Consider dose reduction, non-opioid alternatives, or specialist referral.';
  }

  return {
    drug: input.drug,
    resolvedName: opioid.name,
    route: opioid.route,
    dailyDose: input.dailyDose,
    unit: opioid.unit,
    mmeFactor: factor,
    dailyMME,
    riskLevel,
    cdcThresholdWarning,
    notes: opioid.notes,
  };
}

export interface TotalMEDDResult {
  opioids: MEDDResult[];
  errors: Array<{ drug: string; error: string }>;
  totalDailyMME: number;
  riskLevel: string;
  cdcThresholdWarning?: string;
  naloxoneRecommendation: string;
  prescribingConsiderations: string[];
}

export function calculateTotalMEDD(opioids: OpioidDoseInput[]): TotalMEDDResult {
  const results: MEDDResult[] = [];
  const errors: Array<{ drug: string; error: string }> = [];

  for (const input of opioids) {
    const result = calculateSingleOpioidMME(input);
    if ('error' in result) {
      errors.push({ drug: input.drug, error: result.error });
    } else {
      results.push(result);
    }
  }

  const totalDailyMME = Math.round(results.reduce((sum, r) => sum + r.dailyMME, 0) * 10) / 10;

  let riskLevel: string;
  let cdcThresholdWarning: string | undefined;
  const considerations: string[] = [];

  if (totalDailyMME < 50) {
    riskLevel = 'Lower risk';
    considerations.push('Continue to reassess pain and function at each visit');
  } else if (totalDailyMME < 90) {
    riskLevel = 'Moderate risk';
    cdcThresholdWarning = 'Total MME approaching 90 MME/day CDC threshold.';
    considerations.push('Implement risk mitigation strategies');
    considerations.push('Check state PDMP before prescribing');
    considerations.push('Consider urine drug screening');
  } else {
    riskLevel = 'HIGH RISK';
    cdcThresholdWarning = `TOTAL ${totalDailyMME} MME/day EXCEEDS CDC 90 MME/day threshold. Overdose risk is significantly elevated.`;
    considerations.push('URGENT: Evaluate for dose reduction');
    considerations.push('Consider opioid rotation with 25-50% dose reduction');
    considerations.push('Refer to pain specialist');
    considerations.push('Check PDMP at every visit');
    considerations.push('Mandatory urine drug testing');
    considerations.push('Discuss risks explicitly with patient');
  }

  if (results.some(r => r.resolvedName === 'methadone')) {
    considerations.push('METHADONE: Long/variable half-life. Specialist management recommended. QTc monitoring.');
  }

  if (results.length >= 2) {
    considerations.push('Multiple opioids: increased risk of accidental overdose. Simplify regimen if possible.');
  }

  const naloxoneRecommendation = totalDailyMME >= 50
    ? 'PRESCRIBE NALOXONE: Co-prescribe naloxone (Narcan) for patient and household members per CDC guidelines.'
    : 'Consider naloxone co-prescription for patients with additional risk factors (history of overdose, concurrent benzodiazepines, substance use disorder).';

  return {
    opioids: results,
    errors,
    totalDailyMME,
    riskLevel,
    cdcThresholdWarning,
    naloxoneRecommendation,
    prescribingConsiderations: considerations,
  };
}

export interface OpioidConversionResult {
  fromDrug: string;
  fromDose: number;
  fromRoute: string;
  toDrug: string;
  toRoute: string;
  calculatedDose: number;
  reducedDose: number;
  reductionPercent: number;
  unit: string;
  mmeEquivalent: number;
  warnings: string[];
}

export function convertOpioidDose(
  fromDrug: string,
  fromDailyDose: number,
  toDrug: string,
  reductionPercent: number = 25
): OpioidConversionResult | { error: string } {
  const from = resolveOpioid(fromDrug);
  const to = resolveOpioid(toDrug);

  if (!from) return { error: `Unknown source opioid: ${fromDrug}` };
  if (!to) return { error: `Unknown target opioid: ${toDrug}` };
  if (from.name === 'buprenorphine' || to.name === 'buprenorphine') {
    return { error: 'Buprenorphine conversion requires specialist guidance. MME conversion not applicable for partial agonists.' };
  }

  let fromMME: number;
  if (from.name === 'methadone') {
    fromMME = fromDailyDose * methadoneMMEFactor(fromDailyDose);
  } else {
    fromMME = fromDailyDose * from.mmeFactor;
  }

  let calculatedDose: number;
  const warnings: string[] = [];

  if (to.name === 'methadone') {
    warnings.push('METHADONE: Conversion is NOT linear and highly variable. This is an ESTIMATE ONLY. Start lower and titrate slowly.');
    warnings.push('Methadone has long, unpredictable half-life (8-59 hours). Wait 3+ days between dose adjustments.');
    const toFactor = methadoneMMEFactor(fromMME / 8);
    calculatedDose = fromMME / toFactor;
  } else if (to.name === 'fentanyl patch') {
    calculatedDose = fromMME / 2.4;
    warnings.push('Fentanyl patch dose calculated as mcg/hr. Round to nearest available patch size (12, 25, 50, 75, 100 mcg/hr).');
  } else {
    calculatedDose = fromMME / to.mmeFactor;
  }

  const reducedDose = Math.round(calculatedDose * (1 - reductionPercent / 100) * 10) / 10;
  calculatedDose = Math.round(calculatedDose * 10) / 10;

  warnings.push(`Applied ${reductionPercent}% dose reduction for incomplete cross-tolerance.`);
  if (reductionPercent < 25) {
    warnings.push('CDC recommends at least 25-50% dose reduction when rotating opioids.');
  }

  return {
    fromDrug: from.name,
    fromDose: fromDailyDose,
    fromRoute: from.route,
    toDrug: to.name,
    toRoute: to.route,
    calculatedDose,
    reducedDose,
    reductionPercent,
    unit: to.unit,
    mmeEquivalent: Math.round(fromMME * 10) / 10,
    warnings,
  };
}

export function listOpioids(): Array<{ name: string; route: string; mmeFactor: number; unit: string }> {
  return opioidFactors.map(o => ({
    name: o.name,
    route: o.route,
    mmeFactor: o.mmeFactor,
    unit: o.unit,
  }));
}

export function getOpioidCount(): number {
  return opioidFactors.length;
}

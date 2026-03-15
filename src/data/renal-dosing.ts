/**
 * Renal Dosing Adjustment Database
 *
 * Evidence-based dose adjustments for medications requiring modification
 * based on kidney function (eGFR / CrCl). Based on FDA labeling,
 * KDIGO guidelines, and clinical pharmacology references.
 */

export interface RenalDosingEntry {
  drug: string;
  drugClass: string;
  /** Normal adult dose (eGFR ≥ 60) */
  normalDose: string;
  /** Adjustments by eGFR range */
  adjustments: RenalAdjustment[];
  /** Whether the drug is dialyzable */
  dialyzable: boolean;
  /** Supplemental dose after dialysis if applicable */
  dialysisSupplement?: string;
  /** Monitoring recommendations */
  monitoring: string;
  /** Key clinical notes */
  notes: string;
}

export interface RenalAdjustment {
  eGFRRange: { min: number; max: number };
  label: string;
  dose: string;
  /** 'reduce' | 'avoid' | 'use_with_caution' | 'no_change' */
  action: 'reduce' | 'avoid' | 'use_with_caution' | 'no_change' | 'contraindicated';
  rationale: string;
}

export const renalDosingDatabase: RenalDosingEntry[] = [
  // --- Diabetes ---
  {
    drug: 'metformin',
    drugClass: 'biguanide',
    normalDose: '500-1000 mg twice daily',
    adjustments: [
      { eGFRRange: { min: 45, max: 999 }, label: 'eGFR ≥ 45', dose: '500-1000 mg twice daily', action: 'no_change', rationale: 'Full dose safe above eGFR 45' },
      { eGFRRange: { min: 30, max: 44 }, label: 'eGFR 30-44', dose: '500 mg twice daily (max 1000 mg/day)', action: 'reduce', rationale: 'Increased risk of lactic acidosis with reduced clearance' },
      { eGFRRange: { min: 0, max: 29 }, label: 'eGFR < 30', dose: 'CONTRAINDICATED', action: 'contraindicated', rationale: 'Significant risk of lactic acidosis; accumulation in severe renal impairment' },
    ],
    dialyzable: true,
    dialysisSupplement: 'Supplement after dialysis if used',
    monitoring: 'Check eGFR before initiation and at least annually. More frequent monitoring if eGFR 30-60.',
    notes: 'Hold before iodinated contrast. Restart 48h after if renal function stable.',
  },
  // --- Antibiotics ---
  {
    drug: 'vancomycin',
    drugClass: 'glycopeptide antibiotic',
    normalDose: '15-20 mg/kg IV every 8-12h',
    adjustments: [
      { eGFRRange: { min: 50, max: 999 }, label: 'eGFR ≥ 50', dose: '15-20 mg/kg IV every 12h', action: 'no_change', rationale: 'Standard dosing with trough monitoring' },
      { eGFRRange: { min: 30, max: 49 }, label: 'eGFR 30-49', dose: '15 mg/kg IV every 24h', action: 'reduce', rationale: 'Reduced clearance; extend interval' },
      { eGFRRange: { min: 10, max: 29 }, label: 'eGFR 10-29', dose: '15 mg/kg IV every 24-48h', action: 'reduce', rationale: 'Significant accumulation risk' },
      { eGFRRange: { min: 0, max: 9 }, label: 'eGFR < 10', dose: '15 mg/kg IV; redose based on levels', action: 'reduce', rationale: 'Minimal clearance; dose by therapeutic drug monitoring' },
    ],
    dialyzable: false,
    monitoring: 'Trough levels before 4th dose (target AUC/MIC ≥ 400). Monitor SCr every 48-72h.',
    notes: 'AUC-guided dosing preferred per IDSA/ASHP 2020 guidelines.',
  },
  {
    drug: 'gentamicin',
    drugClass: 'aminoglycoside antibiotic',
    normalDose: '5-7 mg/kg IV once daily (extended interval)',
    adjustments: [
      { eGFRRange: { min: 60, max: 999 }, label: 'eGFR ≥ 60', dose: '5-7 mg/kg IV every 24h', action: 'no_change', rationale: 'Standard extended-interval dosing' },
      { eGFRRange: { min: 40, max: 59 }, label: 'eGFR 40-59', dose: '5-7 mg/kg IV every 36h', action: 'reduce', rationale: 'Extended interval to prevent accumulation and nephrotoxicity' },
      { eGFRRange: { min: 20, max: 39 }, label: 'eGFR 20-39', dose: '5-7 mg/kg IV every 48h', action: 'reduce', rationale: 'High nephrotoxicity risk; consider alternative if possible' },
      { eGFRRange: { min: 0, max: 19 }, label: 'eGFR < 20', dose: 'Use only if no alternative; dose by levels', action: 'use_with_caution', rationale: 'Extreme accumulation risk; ototoxicity and nephrotoxicity' },
    ],
    dialyzable: true,
    dialysisSupplement: 'Re-dose based on post-dialysis levels',
    monitoring: 'Peak and trough levels. BUN/SCr every 2-3 days. Audiometry for prolonged courses.',
    notes: 'Nephrotoxicity is cumulative. Avoid concomitant nephrotoxins.',
  },
  {
    drug: 'levofloxacin',
    drugClass: 'fluoroquinolone antibiotic',
    normalDose: '500-750 mg daily',
    adjustments: [
      { eGFRRange: { min: 50, max: 999 }, label: 'eGFR ≥ 50', dose: '500-750 mg every 24h', action: 'no_change', rationale: 'Normal renal clearance' },
      { eGFRRange: { min: 20, max: 49 }, label: 'eGFR 20-49', dose: '250-500 mg every 24h (or 750 mg every 48h)', action: 'reduce', rationale: 'Reduced renal excretion' },
      { eGFRRange: { min: 0, max: 19 }, label: 'eGFR < 20', dose: '250-500 mg every 48h', action: 'reduce', rationale: 'Significant accumulation; seizure risk with high levels' },
    ],
    dialyzable: false,
    monitoring: 'Monitor for QT prolongation. Tendon symptoms in elderly.',
    notes: 'FDA black box warning: tendinitis/rupture, neuropathy, CNS effects. Use only when no alternative.',
  },
  // --- Anticoagulation ---
  {
    drug: 'enoxaparin',
    drugClass: 'low-molecular-weight heparin',
    normalDose: '1 mg/kg SC every 12h (treatment) or 40 mg SC daily (prophylaxis)',
    adjustments: [
      { eGFRRange: { min: 30, max: 999 }, label: 'eGFR ≥ 30', dose: 'Standard dosing', action: 'no_change', rationale: 'Adequate renal clearance' },
      { eGFRRange: { min: 0, max: 29 }, label: 'eGFR < 30', dose: '1 mg/kg SC once daily (treatment) or 30 mg SC daily (prophylaxis)', action: 'reduce', rationale: 'Significant accumulation; increased bleeding risk. Consider unfractionated heparin.' },
    ],
    dialyzable: false,
    monitoring: 'Anti-Xa levels if eGFR < 30 or extremes of body weight. Monitor for bleeding.',
    notes: 'Anti-Xa monitoring critical in severe renal impairment. Consider UFH as alternative.',
  },
  {
    drug: 'apixaban',
    drugClass: 'direct oral anticoagulant (DOAC)',
    normalDose: '5 mg twice daily (AF) or 10 mg twice daily (VTE treatment)',
    adjustments: [
      { eGFRRange: { min: 25, max: 999 }, label: 'eGFR ≥ 25', dose: '5 mg twice daily (reduce to 2.5 mg if ≥2: age ≥80, weight ≤60kg, SCr ≥1.5)', action: 'no_change', rationale: 'Primarily hepatic metabolism (75%); less renal dependency than other DOACs' },
      { eGFRRange: { min: 15, max: 24 }, label: 'eGFR 15-24', dose: '5 mg or 2.5 mg twice daily (limited data)', action: 'use_with_caution', rationale: 'Limited clinical data; use with close monitoring' },
      { eGFRRange: { min: 0, max: 14 }, label: 'eGFR < 15 or dialysis', dose: '5 mg or 2.5 mg twice daily (per ARISTOTLE criteria)', action: 'use_with_caution', rationale: 'FDA-approved for dialysis patients; among safest DOACs in ESRD' },
    ],
    dialyzable: false,
    monitoring: 'Monitor for bleeding. No routine coagulation monitoring needed.',
    notes: 'Preferred DOAC in severe CKD/ESRD per KDIGO. Less renal elimination than rivaroxaban/dabigatran.',
  },
  {
    drug: 'dabigatran',
    drugClass: 'direct oral anticoagulant (DOAC)',
    normalDose: '150 mg twice daily',
    adjustments: [
      { eGFRRange: { min: 50, max: 999 }, label: 'eGFR ≥ 50', dose: '150 mg twice daily', action: 'no_change', rationale: 'Standard dose with adequate clearance' },
      { eGFRRange: { min: 30, max: 49 }, label: 'eGFR 30-49', dose: '150 mg twice daily (consider 110 mg if high bleeding risk)', action: 'use_with_caution', rationale: '80% renally excreted; accumulation increases with declining GFR' },
      { eGFRRange: { min: 15, max: 29 }, label: 'eGFR 15-29', dose: '75 mg twice daily (US labeling)', action: 'reduce', rationale: 'Significant accumulation; limited clinical data' },
      { eGFRRange: { min: 0, max: 14 }, label: 'eGFR < 15', dose: 'AVOID', action: 'avoid', rationale: 'Not recommended; 80% renal excretion makes dosing unpredictable' },
    ],
    dialyzable: true,
    dialysisSupplement: 'Partially removed by dialysis (60% over 2-3h)',
    monitoring: 'Monitor for bleeding. aPTT/thrombin time for qualitative assessment.',
    notes: 'Most renally-dependent DOAC. Idarucizumab available as reversal agent.',
  },
  // --- Pain / Anti-inflammatory ---
  {
    drug: 'gabapentin',
    drugClass: 'gabapentinoid',
    normalDose: '300-600 mg three times daily',
    adjustments: [
      { eGFRRange: { min: 60, max: 999 }, label: 'eGFR ≥ 60', dose: '300-600 mg three times daily', action: 'no_change', rationale: 'Standard dosing' },
      { eGFRRange: { min: 30, max: 59 }, label: 'eGFR 30-59', dose: '200-700 mg twice daily', action: 'reduce', rationale: 'Reduce dose and frequency proportional to renal function' },
      { eGFRRange: { min: 15, max: 29 }, label: 'eGFR 15-29', dose: '100-300 mg once daily', action: 'reduce', rationale: 'Exclusively renally eliminated; high CNS toxicity risk' },
      { eGFRRange: { min: 0, max: 14 }, label: 'eGFR < 15', dose: '100-300 mg every other day', action: 'reduce', rationale: 'Minimal clearance; CNS depression, myoclonus with accumulation' },
    ],
    dialyzable: true,
    dialysisSupplement: '200-300 mg after each dialysis session',
    monitoring: 'Monitor for drowsiness, ataxia, respiratory depression (especially with opioids).',
    notes: '100% renally eliminated. Fall risk increased in elderly. FDA warning with opioid co-use.',
  },
  // --- Cardiovascular ---
  {
    drug: 'digoxin',
    drugClass: 'cardiac glycoside',
    normalDose: '0.125-0.25 mg daily',
    adjustments: [
      { eGFRRange: { min: 50, max: 999 }, label: 'eGFR ≥ 50', dose: '0.125-0.25 mg daily', action: 'no_change', rationale: 'Standard dosing with level monitoring' },
      { eGFRRange: { min: 30, max: 49 }, label: 'eGFR 30-49', dose: '0.0625-0.125 mg daily', action: 'reduce', rationale: '70% renally excreted; narrow therapeutic index' },
      { eGFRRange: { min: 10, max: 29 }, label: 'eGFR 10-29', dose: '0.0625 mg daily or every other day', action: 'reduce', rationale: 'High toxicity risk; hypokalemia in CKD potentiates toxicity' },
      { eGFRRange: { min: 0, max: 9 }, label: 'eGFR < 10', dose: '0.0625 mg every 48h; dose by levels', action: 'reduce', rationale: 'Minimal clearance; accumulation nearly certain' },
    ],
    dialyzable: false,
    monitoring: 'Serum digoxin level (target 0.5-0.9 ng/mL for HF). Check K+, Mg2+, Ca2+, SCr regularly.',
    notes: 'Narrow therapeutic index. Toxicity potentiated by hypokalemia, hypomagnesemia, hypercalcemia.',
  },
  {
    drug: 'atenolol',
    drugClass: 'beta-blocker',
    normalDose: '25-100 mg daily',
    adjustments: [
      { eGFRRange: { min: 35, max: 999 }, label: 'eGFR ≥ 35', dose: '25-100 mg daily', action: 'no_change', rationale: 'Standard dosing' },
      { eGFRRange: { min: 15, max: 34 }, label: 'eGFR 15-34', dose: '25-50 mg daily', action: 'reduce', rationale: 'Renally excreted; accumulation causes excessive bradycardia/hypotension' },
      { eGFRRange: { min: 0, max: 14 }, label: 'eGFR < 15', dose: '25 mg daily or every other day', action: 'reduce', rationale: 'Consider switching to metoprolol (hepatically cleared)' },
    ],
    dialyzable: true,
    dialysisSupplement: 'Give dose after dialysis',
    monitoring: 'Heart rate, blood pressure. Monitor for excessive bradycardia.',
    notes: 'Unlike metoprolol/carvedilol, atenolol is renally eliminated. Consider hepatically-cleared alternative in severe CKD.',
  },
  // --- Gout ---
  {
    drug: 'allopurinol',
    drugClass: 'xanthine oxidase inhibitor',
    normalDose: '100-800 mg daily',
    adjustments: [
      { eGFRRange: { min: 60, max: 999 }, label: 'eGFR ≥ 60', dose: '100-800 mg daily (titrate to uric acid target)', action: 'no_change', rationale: 'Standard dose titration' },
      { eGFRRange: { min: 30, max: 59 }, label: 'eGFR 30-59', dose: 'Start 50-100 mg daily; max 200 mg/day', action: 'reduce', rationale: 'Active metabolite oxypurinol accumulates; increased SJS/TEN and hypersensitivity risk' },
      { eGFRRange: { min: 15, max: 29 }, label: 'eGFR 15-29', dose: 'Start 50 mg daily; max 100 mg/day', action: 'reduce', rationale: 'High risk of allopurinol hypersensitivity syndrome' },
      { eGFRRange: { min: 0, max: 14 }, label: 'eGFR < 15', dose: '50 mg every other day', action: 'reduce', rationale: 'Minimal clearance of oxypurinol' },
    ],
    dialyzable: true,
    dialysisSupplement: 'Dose after dialysis on dialysis days',
    monitoring: 'Uric acid level. LFTs at baseline. Watch for rash (early sign of hypersensitivity).',
    notes: 'Check HLA-B*5801 before starting (Black, Southeast Asian patients). Febuxostat is alternative in CKD.',
  },
  {
    drug: 'colchicine',
    drugClass: 'anti-inflammatory (gout)',
    normalDose: '0.6 mg once or twice daily',
    adjustments: [
      { eGFRRange: { min: 30, max: 999 }, label: 'eGFR ≥ 30', dose: '0.6 mg once or twice daily', action: 'no_change', rationale: 'Standard dosing; monitor for GI effects' },
      { eGFRRange: { min: 10, max: 29 }, label: 'eGFR 10-29', dose: '0.3 mg daily (reduce frequency, avoid P-gp/CYP3A4 inhibitors)', action: 'reduce', rationale: 'Accumulation increases risk of myelosuppression, neuromyopathy' },
      { eGFRRange: { min: 0, max: 9 }, label: 'eGFR < 10 or dialysis', dose: 'AVOID (or 0.3 mg with extreme caution)', action: 'avoid', rationale: 'Not dialyzable; fatal toxicity reported in severe renal impairment' },
    ],
    dialyzable: false,
    monitoring: 'CBC for myelosuppression. Muscle symptoms for myopathy. Check drug interactions (CYP3A4).',
    notes: 'CRITICAL: Do not combine with strong CYP3A4 inhibitors (clarithromycin, itraconazole) in renal impairment — fatal cases reported.',
  },
  // --- Mood Stabilizer ---
  {
    drug: 'lithium',
    drugClass: 'mood stabilizer',
    normalDose: '300-600 mg 2-3 times daily (target level 0.6-1.2 mEq/L)',
    adjustments: [
      { eGFRRange: { min: 60, max: 999 }, label: 'eGFR ≥ 60', dose: 'Standard dosing with level monitoring', action: 'no_change', rationale: 'Normal renal clearance; dose by serum levels' },
      { eGFRRange: { min: 30, max: 59 }, label: 'eGFR 30-59', dose: 'Reduce dose 25-50%; start low, check levels frequently', action: 'reduce', rationale: '95% renally excreted; accumulation causes tremor, ataxia, renal damage' },
      { eGFRRange: { min: 10, max: 29 }, label: 'eGFR 10-29', dose: 'Reduce dose 50-75%; use only if essential', action: 'reduce', rationale: 'Very high toxicity risk; lithium itself is nephrotoxic' },
      { eGFRRange: { min: 0, max: 9 }, label: 'eGFR < 10', dose: 'Generally AVOID; specialist decision only', action: 'avoid', rationale: 'Worsens renal function further; consider valproate or other alternatives' },
    ],
    dialyzable: true,
    dialysisSupplement: 'Rebound after dialysis; may need post-dialysis supplementation based on levels',
    monitoring: 'Serum lithium levels (q 3-6 months stable, weekly when adjusting). TSH, SCr, Ca2+ every 6-12 months.',
    notes: 'Lithium causes nephrogenic diabetes insipidus and chronic tubulointerstitial nephropathy. NSAIDs, ACE-I, dehydration increase levels.',
  },
  // --- Analgesic ---
  {
    drug: 'morphine',
    drugClass: 'opioid analgesic',
    normalDose: '10-30 mg PO every 4h as needed',
    adjustments: [
      { eGFRRange: { min: 50, max: 999 }, label: 'eGFR ≥ 50', dose: 'Standard dosing', action: 'no_change', rationale: 'Normal clearance of active metabolites' },
      { eGFRRange: { min: 30, max: 49 }, label: 'eGFR 30-49', dose: 'Reduce dose 25%; extend interval', action: 'reduce', rationale: 'Active metabolite M6G accumulates; enhanced sedation and respiratory depression' },
      { eGFRRange: { min: 10, max: 29 }, label: 'eGFR 10-29', dose: 'Reduce dose 50%; consider hydromorphone or fentanyl', action: 'reduce', rationale: 'M6G and M3G accumulate significantly; neurotoxicity (myoclonus, seizures)' },
      { eGFRRange: { min: 0, max: 9 }, label: 'eGFR < 10', dose: 'AVOID; use fentanyl or hydromorphone instead', action: 'avoid', rationale: 'Active metabolites not cleared; prolonged respiratory depression reported' },
    ],
    dialyzable: false,
    monitoring: 'Pain scores, sedation level, respiratory rate. Monitor for myoclonus.',
    notes: 'Fentanyl and hydromorphone are preferred opioids in severe CKD (no active renal metabolites).',
  },
  // --- Antidiabetic ---
  {
    drug: 'glipizide',
    drugClass: 'sulfonylurea',
    normalDose: '5-20 mg daily',
    adjustments: [
      { eGFRRange: { min: 30, max: 999 }, label: 'eGFR ≥ 30', dose: '5-20 mg daily (start low in elderly)', action: 'no_change', rationale: 'Hepatically metabolized; safer sulfonylurea in CKD' },
      { eGFRRange: { min: 15, max: 29 }, label: 'eGFR 15-29', dose: '2.5-10 mg daily; start at lowest dose', action: 'use_with_caution', rationale: 'Hypoglycemia risk higher with reduced caloric intake in uremia' },
      { eGFRRange: { min: 0, max: 14 }, label: 'eGFR < 15', dose: '2.5-5 mg daily; prefer insulin', action: 'use_with_caution', rationale: 'Significant hypoglycemia risk; insulin preferred in ESRD' },
    ],
    dialyzable: false,
    monitoring: 'Blood glucose, HbA1c. Watch for hypoglycemia (especially if intake is reduced).',
    notes: 'Preferred sulfonylurea in CKD (vs glyburide which has active renal metabolites). Glyburide is CONTRAINDICATED in CKD.',
  },
  // --- ACE Inhibitor ---
  {
    drug: 'lisinopril',
    drugClass: 'ACE inhibitor',
    normalDose: '10-40 mg daily',
    adjustments: [
      { eGFRRange: { min: 30, max: 999 }, label: 'eGFR ≥ 30', dose: '10-40 mg daily', action: 'no_change', rationale: 'Standard dosing; renoprotective in CKD' },
      { eGFRRange: { min: 10, max: 29 }, label: 'eGFR 10-29', dose: 'Start at 2.5-5 mg daily; titrate cautiously', action: 'reduce', rationale: 'Risk of hyperkalemia and acute kidney injury; beneficial for proteinuria but requires close monitoring' },
      { eGFRRange: { min: 0, max: 9 }, label: 'eGFR < 10', dose: '2.5-5 mg daily; specialist supervision', action: 'use_with_caution', rationale: 'High hyperkalemia risk; monitor K+ within 1 week of starting/dose change' },
    ],
    dialyzable: true,
    dialysisSupplement: 'Give dose after dialysis',
    monitoring: 'K+, SCr within 1-2 weeks of initiation or dose change. Monitor for hyperkalemia.',
    notes: 'ACE-I/ARBs are renoprotective in proteinuric CKD. DO NOT combine with ARB + aliskiren (ONTARGET/ALTITUDE).',
  },
  // --- Antiviral ---
  {
    drug: 'acyclovir',
    drugClass: 'antiviral',
    normalDose: '800 mg 5 times daily (zoster) or 400 mg TID (herpes)',
    adjustments: [
      { eGFRRange: { min: 50, max: 999 }, label: 'eGFR ≥ 50', dose: 'Standard dosing', action: 'no_change', rationale: 'Adequate renal clearance' },
      { eGFRRange: { min: 25, max: 49 }, label: 'eGFR 25-49', dose: '800 mg every 8h (zoster)', action: 'reduce', rationale: 'Crystalluria risk increases with reduced clearance' },
      { eGFRRange: { min: 10, max: 24 }, label: 'eGFR 10-24', dose: '800 mg every 12h (zoster)', action: 'reduce', rationale: 'Neurotoxicity (tremor, confusion, hallucinations) with accumulation' },
      { eGFRRange: { min: 0, max: 9 }, label: 'eGFR < 10', dose: '800 mg every 12h; ensure adequate hydration', action: 'reduce', rationale: 'High neurotoxicity and crystalluria risk' },
    ],
    dialyzable: true,
    dialysisSupplement: 'Dose after dialysis',
    monitoring: 'SCr, neurologic status. Ensure adequate hydration.',
    notes: 'IV acyclovir: infuse over 1h with adequate hydration to prevent crystal nephropathy.',
  },
  // --- Diuretic ---
  {
    drug: 'spironolactone',
    drugClass: 'potassium-sparing diuretic / mineralocorticoid receptor antagonist',
    normalDose: '25-50 mg daily',
    adjustments: [
      { eGFRRange: { min: 45, max: 999 }, label: 'eGFR ≥ 45', dose: '25-50 mg daily', action: 'no_change', rationale: 'Standard dosing with K+ monitoring' },
      { eGFRRange: { min: 30, max: 44 }, label: 'eGFR 30-44', dose: '12.5-25 mg daily', action: 'reduce', rationale: 'Hyperkalemia risk significantly increased' },
      { eGFRRange: { min: 0, max: 29 }, label: 'eGFR < 30', dose: 'Generally AVOID', action: 'avoid', rationale: 'Life-threatening hyperkalemia risk; RALES trial excluded eGFR < 30' },
    ],
    dialyzable: false,
    monitoring: 'K+ within 3-7 days of starting. Repeat at 1 month, then regularly. SCr.',
    notes: 'Do NOT combine with ACE-I + ARB (triple RAAS blockade). Avoid K+ supplements concurrently.',
  },
];

/**
 * Look up renal dosing adjustments for a medication
 */
export function getDosingForEGFR(drug: string, eGFR: number): {
  drug: string;
  drugClass: string;
  normalDose: string;
  currentEGFR: number;
  ckdStage: string;
  adjustment: RenalAdjustment | null;
  dialyzable: boolean;
  dialysisSupplement?: string;
  monitoring: string;
  notes: string;
} | null {
  const drugLower = drug.toLowerCase();
  const entry = renalDosingDatabase.find(e => e.drug.toLowerCase() === drugLower);
  if (!entry) return null;

  const ckdStage = getCKDStage(eGFR);
  const adjustment = entry.adjustments.find(a =>
    eGFR >= a.eGFRRange.min && eGFR <= a.eGFRRange.max
  ) ?? null;

  return {
    drug: entry.drug,
    drugClass: entry.drugClass,
    normalDose: entry.normalDose,
    currentEGFR: eGFR,
    ckdStage,
    adjustment,
    dialyzable: entry.dialyzable,
    dialysisSupplement: entry.dialysisSupplement,
    monitoring: entry.monitoring,
    notes: entry.notes,
  };
}

/**
 * Check all medications against eGFR for renal dosing
 */
export function checkRenalDosing(medications: string[], eGFR: number): {
  eGFR: number;
  ckdStage: string;
  adjustments: Array<{
    drug: string;
    drugClass: string;
    normalDose: string;
    recommendedDose: string;
    action: string;
    rationale: string;
    monitoring: string;
  }>;
  noAdjustmentNeeded: string[];
  notInDatabase: string[];
  summary: string;
} {
  const ckdStage = getCKDStage(eGFR);
  const adjustments: Array<{
    drug: string;
    drugClass: string;
    normalDose: string;
    recommendedDose: string;
    action: string;
    rationale: string;
    monitoring: string;
  }> = [];
  const noAdjustmentNeeded: string[] = [];
  const notInDatabase: string[] = [];

  for (const med of medications) {
    const result = getDosingForEGFR(med, eGFR);
    if (!result) {
      notInDatabase.push(med);
      continue;
    }
    if (!result.adjustment || result.adjustment.action === 'no_change') {
      noAdjustmentNeeded.push(med);
      continue;
    }
    adjustments.push({
      drug: result.drug,
      drugClass: result.drugClass,
      normalDose: result.normalDose,
      recommendedDose: result.adjustment.dose,
      action: result.adjustment.action,
      rationale: result.adjustment.rationale,
      monitoring: result.monitoring,
    });
  }

  let summary = `Renal dosing check for ${medications.length} medications at eGFR ${eGFR} (${ckdStage}).`;
  if (adjustments.length > 0) {
    const avoid = adjustments.filter(a => a.action === 'avoid' || a.action === 'contraindicated');
    const reduce = adjustments.filter(a => a.action === 'reduce');
    const caution = adjustments.filter(a => a.action === 'use_with_caution');
    if (avoid.length > 0) summary += ` AVOID: ${avoid.map(a => a.drug).join(', ')}.`;
    if (reduce.length > 0) summary += ` DOSE REDUCTION: ${reduce.map(a => a.drug).join(', ')}.`;
    if (caution.length > 0) summary += ` USE WITH CAUTION: ${caution.map(a => a.drug).join(', ')}.`;
  }
  if (noAdjustmentNeeded.length > 0) {
    summary += ` No adjustment needed: ${noAdjustmentNeeded.join(', ')}.`;
  }

  return { eGFR, ckdStage, adjustments, noAdjustmentNeeded, notInDatabase, summary };
}

function getCKDStage(eGFR: number): string {
  if (eGFR >= 90) return 'G1 (Normal or high)';
  if (eGFR >= 60) return 'G2 (Mildly decreased)';
  if (eGFR >= 45) return 'G3a (Mildly to moderately decreased)';
  if (eGFR >= 30) return 'G3b (Moderately to severely decreased)';
  if (eGFR >= 15) return 'G4 (Severely decreased)';
  return 'G5 (Kidney failure)';
}

/** List all drugs with renal dosing data */
export function listRenalDosingDrugs(): Array<{ drug: string; drugClass: string }> {
  return renalDosingDatabase.map(e => ({ drug: e.drug, drugClass: e.drugClass }));
}

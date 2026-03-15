/**
 * Pregnancy & Lactation Safety Database
 *
 * Medication safety categories for pregnancy and lactation.
 * Based on FDA Pregnancy and Lactation Labeling Rule (PLLR) framework
 * and legacy FDA categories (A, B, C, D, X) which remain widely used clinically.
 *
 * NOTE: FDA replaced letter categories with narrative sections in 2015 (PLLR),
 * but legacy categories remain in widespread clinical use.
 */

export type PregnancyCategory = 'A' | 'B' | 'C' | 'D' | 'X' | 'N';
export type LactationSafety = 'safe' | 'probably_safe' | 'use_caution' | 'contraindicated' | 'unknown';
export type TrimesterRisk = 'low' | 'moderate' | 'high' | 'contraindicated';

export interface PregnancyDrugEntry {
  name: string;
  aliases: string[];
  pregnancyCategory: PregnancyCategory;
  lactationSafety: LactationSafety;
  trimesterRisks: {
    first: TrimesterRisk;
    second: TrimesterRisk;
    third: TrimesterRisk;
  };
  teratogenicRisk: string;
  saferAlternatives: string[];
  counselingPoints: string[];
  references: string[];
}

const pregnancyDatabase: PregnancyDrugEntry[] = [
  // CATEGORY X — CONTRAINDICATED IN PREGNANCY
  {
    name: 'methotrexate',
    aliases: ['trexall', 'otrexup', 'rasuvo', 'mtx'],
    pregnancyCategory: 'X',
    lactationSafety: 'contraindicated',
    trimesterRisks: { first: 'contraindicated', second: 'contraindicated', third: 'contraindicated' },
    teratogenicRisk: 'KNOWN TERATOGEN. Causes aminopterin syndrome: cranial defects, limb abnormalities, growth restriction. Fetal death risk 40%+.',
    saferAlternatives: ['azathioprine (Category D but used when benefits outweigh risks)', 'sulfasalazine (Category B)', 'hydroxychloroquine (Category C)'],
    counselingPoints: ['Discontinue 3+ months before conception (both partners)', 'Reliable contraception mandatory during therapy', 'Folic acid supplementation 5mg/day if conception planned after stopping'],
    references: ['FDA Label 2024', 'ACOG Practice Bulletin 2023'],
  },
  {
    name: 'warfarin',
    aliases: ['coumadin', 'jantoven'],
    pregnancyCategory: 'X',
    lactationSafety: 'safe',
    trimesterRisks: { first: 'contraindicated', second: 'high', third: 'high' },
    teratogenicRisk: 'Warfarin embryopathy (1st trimester): nasal hypoplasia, stippled epiphyses. 2nd/3rd trimester: CNS abnormalities, fetal hemorrhage.',
    saferAlternatives: ['enoxaparin (Category B)', 'heparin (Category C)', 'dalteparin (Category B)'],
    counselingPoints: ['Switch to LMWH before 6 weeks gestation', 'Safe during breastfeeding (minimally excreted)', 'Vitamin K for neonate if exposed'],
    references: ['ACOG Practice Bulletin 2024', 'ESC Guidelines 2024'],
  },
  {
    name: 'isotretinoin',
    aliases: ['accutane', 'absorica', 'claravis', 'myorisan', 'zenatane'],
    pregnancyCategory: 'X',
    lactationSafety: 'contraindicated',
    trimesterRisks: { first: 'contraindicated', second: 'contraindicated', third: 'contraindicated' },
    teratogenicRisk: 'POTENT TERATOGEN. Isotretinoin embryopathy: craniofacial, cardiac, thymic, CNS malformations. Risk ~25% with any exposure.',
    saferAlternatives: ['topical retinoids are also category X', 'benzoyl peroxide (Category C)', 'erythromycin topical (Category B)', 'azelaic acid (Category B)'],
    counselingPoints: ['iPLEDGE program mandatory', 'Two forms of contraception required', 'Negative pregnancy test before each refill', 'Wait 1 month after stopping before conception'],
    references: ['iPLEDGE Program', 'FDA Label 2024'],
  },
  {
    name: 'statins',
    aliases: ['atorvastatin', 'lipitor', 'simvastatin', 'zocor', 'rosuvastatin', 'crestor', 'pravastatin', 'lovastatin'],
    pregnancyCategory: 'X',
    lactationSafety: 'contraindicated',
    trimesterRisks: { first: 'contraindicated', second: 'contraindicated', third: 'contraindicated' },
    teratogenicRisk: 'Cholesterol is essential for fetal development. Animal studies show skeletal malformations. Human data limited but theoretical risk high.',
    saferAlternatives: ['bile acid sequestrants: cholestyramine (Category C)', 'dietary management during pregnancy'],
    counselingPoints: ['Discontinue when pregnancy planned or confirmed', 'Cholesterol naturally rises in pregnancy — generally not treated', 'Resume postpartum if indicated'],
    references: ['FDA Label 2024', 'AHA/ACC Guideline 2023'],
  },
  {
    name: 'misoprostol',
    aliases: ['cytotec'],
    pregnancyCategory: 'X',
    lactationSafety: 'probably_safe',
    trimesterRisks: { first: 'contraindicated', second: 'contraindicated', third: 'contraindicated' },
    teratogenicRisk: 'Causes uterine contractions and can induce abortion. Associated with Moebius syndrome (cranial nerve palsies) and limb defects.',
    saferAlternatives: ['PPIs for ulcer prophylaxis: omeprazole (Category C)', 'famotidine (Category B)'],
    counselingPoints: ['Used therapeutically for labor induction and miscarriage management under medical supervision', 'Contraindicated for NSAID gastroprophylaxis in pregnancy'],
    references: ['FDA Label 2024', 'WHO Essential Medicines 2024'],
  },
  {
    name: 'valproic acid',
    aliases: ['depakote', 'depakene', 'divalproex', 'valproate'],
    pregnancyCategory: 'X',
    lactationSafety: 'use_caution',
    trimesterRisks: { first: 'contraindicated', second: 'high', third: 'high' },
    teratogenicRisk: 'Major teratogen: neural tube defects (1-2% vs 0.1% baseline), craniofacial anomalies, cardiac defects. IQ reduction of 8-11 points. Fetal valproate syndrome.',
    saferAlternatives: ['lamotrigine (Category C) — preferred for epilepsy in pregnancy', 'levetiracetam (Category C)', 'carbamazepine (Category D) — lower NTD risk than valproate'],
    counselingPoints: ['High-dose folic acid (4-5 mg/day) before and during pregnancy', 'Level monitoring — clearance increases in pregnancy', 'Avoid if possible; if required, use lowest effective dose', 'Screen with detailed anatomy ultrasound at 18-20 weeks'],
    references: ['AAN/AES Guideline 2024', 'FDA Drug Safety Communication 2023'],
  },

  // CATEGORY D — EVIDENCE OF RISK BUT MAY BE NECESSARY
  {
    name: 'lisinopril',
    aliases: ['prinivil', 'zestril', 'enalapril', 'vasotec', 'ramipril', 'altace', 'captopril', 'benazepril'],
    pregnancyCategory: 'D',
    lactationSafety: 'probably_safe',
    trimesterRisks: { first: 'moderate', second: 'contraindicated', third: 'contraindicated' },
    teratogenicRisk: '2nd/3rd trimester: oligohydramnios, renal failure, skull hypoplasia, fetal death. First trimester risk lower but cardiac defects reported.',
    saferAlternatives: ['labetalol (Category C)', 'nifedipine (Category C)', 'methyldopa (Category B)'],
    counselingPoints: ['Discontinue ACE inhibitors as soon as pregnancy confirmed', 'All ACE inhibitors and ARBs contraindicated in 2nd/3rd trimester', 'Monitor amniotic fluid if exposed'],
    references: ['ACOG Practice Bulletin 2024', 'FDA Label'],
  },
  {
    name: 'losartan',
    aliases: ['cozaar', 'valsartan', 'diovan', 'irbesartan', 'avapro', 'candesartan', 'olmesartan'],
    pregnancyCategory: 'D',
    lactationSafety: 'unknown',
    trimesterRisks: { first: 'moderate', second: 'contraindicated', third: 'contraindicated' },
    teratogenicRisk: 'Same as ACE inhibitors: fetotoxic in 2nd/3rd trimester. Oligohydramnios, renal failure, neonatal hypotension.',
    saferAlternatives: ['labetalol (Category C)', 'nifedipine (Category C)', 'methyldopa (Category B)'],
    counselingPoints: ['Discontinue immediately when pregnancy confirmed', 'Switch to pregnancy-safe antihypertensive'],
    references: ['ACOG Practice Bulletin 2024', 'FDA Label'],
  },
  {
    name: 'phenytoin',
    aliases: ['dilantin'],
    pregnancyCategory: 'D',
    lactationSafety: 'probably_safe',
    trimesterRisks: { first: 'high', second: 'moderate', third: 'moderate' },
    teratogenicRisk: 'Fetal hydantoin syndrome: craniofacial dysmorphism, nail/digit hypoplasia, growth restriction, intellectual disability (~10% risk).',
    saferAlternatives: ['lamotrigine (Category C)', 'levetiracetam (Category C)'],
    counselingPoints: ['Folic acid 4mg/day preconception', 'Monitor levels — binding decreases in pregnancy', 'Vitamin K for mother (last month) and neonate'],
    references: ['AAN Guideline 2024', 'FDA Label'],
  },
  {
    name: 'lithium',
    aliases: ['lithobid', 'eskalith'],
    pregnancyCategory: 'D',
    lactationSafety: 'use_caution',
    trimesterRisks: { first: 'high', second: 'moderate', third: 'moderate' },
    teratogenicRisk: 'Ebstein anomaly (cardiac): relative risk elevated but absolute risk ~0.1% (lower than previously thought). Neonatal complications: hypotonia, thyroid dysfunction.',
    saferAlternatives: ['lamotrigine for bipolar depression', 'quetiapine (limited pregnancy data)'],
    counselingPoints: ['Fetal echocardiography at 16-20 weeks', 'Level monitoring every 4 weeks (clearance increases)', 'Hold or reduce dose near delivery to avoid neonatal toxicity', 'Close neonatal monitoring for 48h'],
    references: ['APA Guideline 2024', 'Lancet Psychiatry 2023'],
  },
  {
    name: 'tetracycline',
    aliases: ['doxycycline', 'minocycline', 'vibramycin', 'doryx'],
    pregnancyCategory: 'D',
    lactationSafety: 'probably_safe',
    trimesterRisks: { first: 'moderate', second: 'high', third: 'high' },
    teratogenicRisk: 'Permanent tooth discoloration (after week 16). Maternal hepatotoxicity risk with IV tetracycline. Bone growth inhibition.',
    saferAlternatives: ['azithromycin (Category B)', 'amoxicillin (Category B)', 'cephalexin (Category B)'],
    counselingPoints: ['Avoid after 1st trimester', 'Doxycycline specifically: limited data but generally avoid', 'Short courses in 1st trimester likely low risk per CDC'],
    references: ['CDC STI Treatment Guidelines 2024', 'FDA Label'],
  },

  // CATEGORY C — RISK CANNOT BE RULED OUT
  {
    name: 'omeprazole',
    aliases: ['prilosec', 'nexium', 'esomeprazole', 'lansoprazole', 'prevacid', 'pantoprazole', 'protonix'],
    pregnancyCategory: 'C',
    lactationSafety: 'probably_safe',
    trimesterRisks: { first: 'low', second: 'low', third: 'low' },
    teratogenicRisk: 'Animal studies show dose-related embryotoxicity. Large human registry data (>1000 1st trimester exposures) show no increased malformation rate.',
    saferAlternatives: ['famotidine (Category B)', 'antacids (most Category A/B)'],
    counselingPoints: ['Generally considered safe in pregnancy based on extensive human data despite Category C', 'First-line PPI for GERD in pregnancy per ACOG'],
    references: ['ACOG Practice Bulletin 2024', 'FDA Label'],
  },
  {
    name: 'fluoxetine',
    aliases: ['prozac', 'sarafem'],
    pregnancyCategory: 'C',
    lactationSafety: 'probably_safe',
    trimesterRisks: { first: 'low', second: 'low', third: 'moderate' },
    teratogenicRisk: 'Most studied SSRI in pregnancy. No clear teratogenic signal. Third trimester: neonatal adaptation syndrome (jitteriness, poor feeding) in ~30%.',
    saferAlternatives: ['sertraline (Category C, most pregnancy data after fluoxetine)', 'CBT (non-pharmacologic)'],
    counselingPoints: ['Benefits usually outweigh risks for moderate-severe depression', 'Do not abruptly discontinue', 'Paroxetine has most cardiac defect data — avoid', 'Neonatal monitoring for 48h if exposed near delivery'],
    references: ['ACOG Practice Bulletin 2024', 'APA Guideline 2024'],
  },
  {
    name: 'sertraline',
    aliases: ['zoloft'],
    pregnancyCategory: 'C',
    lactationSafety: 'safe',
    trimesterRisks: { first: 'low', second: 'low', third: 'moderate' },
    teratogenicRisk: 'Extensive human data. No clear teratogenic effect. Third trimester: neonatal adaptation syndrome possible. Preferred SSRI in lactation.',
    saferAlternatives: ['CBT (non-pharmacologic)'],
    counselingPoints: ['Preferred SSRI during breastfeeding (lowest milk levels)', 'Continue if needed for depression — untreated depression has fetal risks', 'Shared decision-making with patient'],
    references: ['ACOG/APA Joint Guidelines 2024'],
  },
  {
    name: 'metformin',
    aliases: ['glucophage'],
    pregnancyCategory: 'C',
    lactationSafety: 'safe',
    trimesterRisks: { first: 'low', second: 'low', third: 'low' },
    teratogenicRisk: 'Growing evidence of safety. Used for gestational diabetes and PCOS. Crosses placenta. Some concern about long-term metabolic effects in offspring.',
    saferAlternatives: ['insulin (Category B) — standard of care for gestational diabetes'],
    counselingPoints: ['MiG trial: comparable to insulin for gestational diabetes', 'May be continued in Type 2 DM if glycemic targets met', 'Supplemental folic acid and B12 monitoring'],
    references: ['ADA Standards of Care 2024', 'NICE Guideline 2024'],
  },
  {
    name: 'ondansetron',
    aliases: ['zofran'],
    pregnancyCategory: 'C',
    lactationSafety: 'probably_safe',
    trimesterRisks: { first: 'low', second: 'low', third: 'low' },
    teratogenicRisk: 'Conflicting data: some studies suggest slight cleft palate risk (OR 1.2-1.4). Large studies show no significant increase. Widely used for hyperemesis.',
    saferAlternatives: ['doxylamine/pyridoxine (Diclegis, Category A)', 'promethazine (Category C)', 'metoclopramide (Category B)'],
    counselingPoints: ['Second-line after doxylamine/pyridoxine per ACOG', 'Very commonly used for hyperemesis gravidarum', 'Avoid in patients with QT prolongation'],
    references: ['ACOG Practice Bulletin 2024', 'FDA Safety Communication'],
  },

  // CATEGORY B — NO EVIDENCE OF RISK IN HUMANS
  {
    name: 'acetaminophen',
    aliases: ['tylenol', 'paracetamol', 'apap'],
    pregnancyCategory: 'B',
    lactationSafety: 'safe',
    trimesterRisks: { first: 'low', second: 'low', third: 'low' },
    teratogenicRisk: 'Generally considered safest analgesic in pregnancy. Recent studies suggest possible link to ADHD/ASD with prolonged high-dose use — significance debated.',
    saferAlternatives: [],
    counselingPoints: ['First-line analgesic/antipyretic in all trimesters', 'Use lowest effective dose for shortest duration', 'FDA consensus: benefits outweigh risks for appropriate use'],
    references: ['FDA Drug Safety Communication 2024', 'ACOG Statement 2024'],
  },
  {
    name: 'amoxicillin',
    aliases: ['amoxil', 'augmentin', 'amoxicillin-clavulanate'],
    pregnancyCategory: 'B',
    lactationSafety: 'safe',
    trimesterRisks: { first: 'low', second: 'low', third: 'low' },
    teratogenicRisk: 'Extensive use in pregnancy with no documented teratogenic risk.',
    saferAlternatives: [],
    counselingPoints: ['Safe throughout pregnancy', 'First-line for many infections in pregnancy (UTI, dental, etc.)'],
    references: ['FDA Label', 'ACOG Practice Bulletin'],
  },
  {
    name: 'metoclopramide',
    aliases: ['reglan'],
    pregnancyCategory: 'B',
    lactationSafety: 'probably_safe',
    trimesterRisks: { first: 'low', second: 'low', third: 'low' },
    teratogenicRisk: 'Large registry data shows no increased malformation risk.',
    saferAlternatives: ['doxylamine/pyridoxine (Category A)'],
    counselingPoints: ['Used for nausea/GERD in pregnancy', 'EPS risk with prolonged use', 'Generally short-term use preferred'],
    references: ['ACOG Practice Bulletin 2024'],
  },

  // CATEGORY A — CONTROLLED STUDIES SHOW NO RISK
  {
    name: 'prenatal vitamins',
    aliases: ['folic acid', 'folate', 'iron supplement', 'ferrous sulfate'],
    pregnancyCategory: 'A',
    lactationSafety: 'safe',
    trimesterRisks: { first: 'low', second: 'low', third: 'low' },
    teratogenicRisk: 'No risk. Folic acid prevents neural tube defects. Standard of care.',
    saferAlternatives: [],
    counselingPoints: ['Start folic acid 400-800 mcg at least 1 month before conception', 'High-dose folic acid (4mg) for prior NTD, epilepsy drugs, diabetes', 'Continue through pregnancy and lactation'],
    references: ['USPSTF Recommendation 2024', 'ACOG Practice Bulletin'],
  },
  {
    name: 'levothyroxine',
    aliases: ['synthroid', 'levoxyl', 'unithroid', 'tirosint'],
    pregnancyCategory: 'A',
    lactationSafety: 'safe',
    trimesterRisks: { first: 'low', second: 'low', third: 'low' },
    teratogenicRisk: 'No risk at physiologic doses. Untreated hypothyroidism is harmful to fetus.',
    saferAlternatives: [],
    counselingPoints: ['Increase dose 25-30% early in pregnancy', 'Check TSH every 4 weeks in 1st half of pregnancy', 'Goal TSH <2.5 mIU/L in 1st trimester'],
    references: ['ATA Guideline 2024', 'ACOG Practice Bulletin'],
  },

  // NSAIDs (trimester-specific risk)
  {
    name: 'ibuprofen',
    aliases: ['advil', 'motrin'],
    pregnancyCategory: 'C',
    lactationSafety: 'safe',
    trimesterRisks: { first: 'low', second: 'moderate', third: 'contraindicated' },
    teratogenicRisk: '3rd trimester: premature closure of ductus arteriosus, oligohydramnios, neonatal renal impairment. FDA warning against use after 20 weeks.',
    saferAlternatives: ['acetaminophen (Category B)'],
    counselingPoints: ['Avoid after 20 weeks gestation per FDA 2020 guidance', 'Short-term use in 1st trimester generally considered low risk', 'All NSAIDs carry same 3rd trimester risk'],
    references: ['FDA Drug Safety Communication 2020', 'ACOG Committee Opinion'],
  },
  {
    name: 'aspirin',
    aliases: ['asa', 'bayer', 'ecotrin'],
    pregnancyCategory: 'C',
    lactationSafety: 'use_caution',
    trimesterRisks: { first: 'low', second: 'low', third: 'high' },
    teratogenicRisk: 'Low-dose (81mg) used therapeutically for preeclampsia prevention. High-dose: same NSAID 3rd trimester risks.',
    saferAlternatives: ['acetaminophen for pain (Category B)'],
    counselingPoints: ['Low-dose aspirin (81mg) RECOMMENDED for preeclampsia prevention in high-risk women starting 12-16 weeks', 'Avoid full-dose (>325mg) in 3rd trimester', 'Stop low-dose aspirin at 36 weeks per ACOG'],
    references: ['USPSTF Recommendation 2024', 'ACOG Practice Advisory 2024'],
  },
];

function resolveName(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const entry of pregnancyDatabase) {
    if (entry.name === lower) return entry.name;
    if (entry.aliases.some(a => a === lower)) return entry.name;
  }
  return lower;
}

export interface PregnancySafetyResult {
  drug: string;
  resolvedName: string;
  found: boolean;
  pregnancyCategory?: PregnancyCategory;
  categoryDescription?: string;
  lactationSafety?: LactationSafety;
  trimesterRisks?: { first: TrimesterRisk; second: TrimesterRisk; third: TrimesterRisk };
  teratogenicRisk?: string;
  saferAlternatives?: string[];
  counselingPoints?: string[];
  references?: string[];
  overallSafety?: string;
}

const categoryDescriptions: Record<PregnancyCategory, string> = {
  A: 'Category A: Controlled studies show no risk. Adequate studies in pregnant women show no increased risk of fetal abnormalities.',
  B: 'Category B: No evidence of risk in humans. Animal studies show no risk, or animal risk not confirmed in human studies.',
  C: 'Category C: Risk cannot be ruled out. Animal studies show risk, or no studies exist. Benefits may justify potential risks.',
  D: 'Category D: Positive evidence of risk. Human data show risk, but benefits may outweigh in serious/life-threatening conditions.',
  X: 'Category X: Contraindicated in pregnancy. Studies show fetal abnormalities. Risks clearly outweigh any possible benefit.',
  N: 'Not classified by FDA.',
};

export function checkPregnancySafety(drugName: string, trimester?: 1 | 2 | 3): PregnancySafetyResult {
  const resolved = resolveName(drugName);
  const entry = pregnancyDatabase.find(e => e.name === resolved);

  if (!entry) {
    return {
      drug: drugName,
      resolvedName: resolved,
      found: false,
      overallSafety: 'NOT IN DATABASE — Consult prescribing information and OB pharmacist before use in pregnancy.',
    };
  }

  const trimesterKey = trimester === 1 ? 'first' : trimester === 2 ? 'second' : trimester === 3 ? 'third' : null;
  let overallSafety: string;

  if (entry.pregnancyCategory === 'X') {
    overallSafety = 'CONTRAINDICATED — Do not use in pregnancy.';
  } else if (trimesterKey && entry.trimesterRisks[trimesterKey] === 'contraindicated') {
    overallSafety = `CONTRAINDICATED in trimester ${trimester}. Consider alternatives.`;
  } else if (entry.pregnancyCategory === 'D') {
    overallSafety = 'HIGH RISK — Use only if potential benefit justifies risk to fetus.';
  } else if (trimesterKey && entry.trimesterRisks[trimesterKey] === 'high') {
    overallSafety = `HIGH RISK in trimester ${trimester}. Use only if no safer alternative.`;
  } else if (entry.pregnancyCategory === 'A' || entry.pregnancyCategory === 'B') {
    overallSafety = 'Generally considered safe in pregnancy based on available evidence.';
  } else {
    overallSafety = 'Use with caution. Discuss risk-benefit with patient.';
  }

  return {
    drug: drugName,
    resolvedName: entry.name,
    found: true,
    pregnancyCategory: entry.pregnancyCategory,
    categoryDescription: categoryDescriptions[entry.pregnancyCategory],
    lactationSafety: entry.lactationSafety,
    trimesterRisks: entry.trimesterRisks,
    teratogenicRisk: entry.teratogenicRisk,
    saferAlternatives: entry.saferAlternatives,
    counselingPoints: entry.counselingPoints,
    references: entry.references,
    overallSafety,
  };
}

export interface BulkPregnancySafetyResult {
  medications: string[];
  trimester?: number;
  results: PregnancySafetyResult[];
  contraindicated: PregnancySafetyResult[];
  highRisk: PregnancySafetyResult[];
  safe: PregnancySafetyResult[];
  unknown: PregnancySafetyResult[];
  summary: string;
}

export function screenMedicationsForPregnancy(medications: string[], trimester?: 1 | 2 | 3): BulkPregnancySafetyResult {
  const results = medications.map(m => checkPregnancySafety(m, trimester));
  const contraindicated = results.filter(r => r.found && (r.pregnancyCategory === 'X' || (trimester && r.trimesterRisks && r.trimesterRisks[trimester === 1 ? 'first' : trimester === 2 ? 'second' : 'third'] === 'contraindicated')));
  const highRisk = results.filter(r => r.found && r.pregnancyCategory === 'D' && !contraindicated.includes(r));
  const safe = results.filter(r => r.found && (r.pregnancyCategory === 'A' || r.pregnancyCategory === 'B'));
  const unknown = results.filter(r => !r.found);

  let summary: string;
  if (contraindicated.length > 0) {
    summary = `ALERT: ${contraindicated.length} medication(s) CONTRAINDICATED${trimester ? ` in trimester ${trimester}` : ''}: ${contraindicated.map(r => r.resolvedName).join(', ')}. Immediate review required.`;
  } else if (highRisk.length > 0) {
    summary = `WARNING: ${highRisk.length} high-risk medication(s): ${highRisk.map(r => r.resolvedName).join(', ')}. Risk-benefit discussion needed.`;
  } else if (unknown.length > 0) {
    summary = `${safe.length} safe medication(s), ${unknown.length} not in database. Consult OB pharmacist for unknowns.`;
  } else {
    summary = `All ${results.length} medication(s) reviewed. No contraindicated or high-risk drugs identified.`;
  }

  return { medications, trimester, results, contraindicated, highRisk, safe, unknown, summary };
}

export function listPregnancyDrugs(): Array<{ name: string; category: PregnancyCategory; lactation: LactationSafety }> {
  return pregnancyDatabase.map(e => ({ name: e.name, category: e.pregnancyCategory, lactation: e.lactationSafety }));
}

export function getDrugCount(): number {
  return pregnancyDatabase.length;
}

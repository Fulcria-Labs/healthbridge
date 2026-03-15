/**
 * IV Compatibility Database
 *
 * Y-site and admixture compatibility data for common intravenous medications.
 * Based on Trissel's Handbook of Injectable Drugs and King Guide to Parenteral Admixtures.
 */

export type CompatibilityStatus = 'compatible' | 'incompatible' | 'variable' | 'unknown';

export interface IVCompatibilityEntry {
  drug1: string;
  drug2: string;
  ysite: CompatibilityStatus;
  admixture: CompatibilityStatus;
  notes: string;
  reference: string;
}

const compatibilityData: IVCompatibilityEntry[] = [
  // Heparin combinations
  { drug1: 'heparin', drug2: 'insulin', ysite: 'compatible', admixture: 'compatible', notes: 'Stable for 24h in NS or D5W', reference: 'Trissel 2024' },
  { drug1: 'heparin', drug2: 'morphine', ysite: 'compatible', admixture: 'compatible', notes: 'Stable in NS', reference: 'Trissel 2024' },
  { drug1: 'heparin', drug2: 'potassium chloride', ysite: 'compatible', admixture: 'compatible', notes: 'Common combination in IV fluids', reference: 'Trissel 2024' },
  { drug1: 'heparin', drug2: 'vancomycin', ysite: 'incompatible', admixture: 'incompatible', notes: 'Haze or precipitate forms. Flush line between drugs.', reference: 'Trissel 2024' },
  { drug1: 'heparin', drug2: 'amiodarone', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate forms within 24h', reference: 'Trissel 2024' },
  { drug1: 'heparin', drug2: 'dopamine', ysite: 'compatible', admixture: 'compatible', notes: 'Stable for 24h at room temperature', reference: 'Trissel 2024' },
  { drug1: 'heparin', drug2: 'nitroglycerin', ysite: 'compatible', admixture: 'variable', notes: 'Y-site compatible; avoid admixture in PVC bags (absorption)', reference: 'Trissel 2024' },
  { drug1: 'heparin', drug2: 'diazepam', ysite: 'incompatible', admixture: 'incompatible', notes: 'Haze forms immediately', reference: 'Trissel 2024' },
  { drug1: 'heparin', drug2: 'phenytoin', ysite: 'incompatible', admixture: 'incompatible', notes: 'Crystallization occurs. Never mix.', reference: 'Trissel 2024' },
  { drug1: 'heparin', drug2: 'furosemide', ysite: 'compatible', admixture: 'compatible', notes: 'Stable for 24h', reference: 'Trissel 2024' },

  // Vancomycin combinations
  { drug1: 'vancomycin', drug2: 'piperacillin-tazobactam', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate forms. Flush line between drugs. One of the most commonly reported IV incompatibilities.', reference: 'Trissel 2024' },
  { drug1: 'vancomycin', drug2: 'cefepime', ysite: 'incompatible', admixture: 'incompatible', notes: 'Physically incompatible. Flush line.', reference: 'Trissel 2024' },
  { drug1: 'vancomycin', drug2: 'ceftriaxone', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate may form. Flush between.', reference: 'Trissel 2024' },
  { drug1: 'vancomycin', drug2: 'meropenem', ysite: 'compatible', admixture: 'variable', notes: 'Y-site compatible for short infusion', reference: 'Trissel 2024' },
  { drug1: 'vancomycin', drug2: 'metronidazole', ysite: 'compatible', admixture: 'compatible', notes: 'Stable in NS for 24h', reference: 'Trissel 2024' },
  { drug1: 'vancomycin', drug2: 'dexmedetomidine', ysite: 'compatible', admixture: 'unknown', notes: 'Y-site compatible at standard concentrations', reference: 'King Guide 2024' },
  { drug1: 'vancomycin', drug2: 'albumin', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate forms', reference: 'Trissel 2024' },

  // Phenytoin — incompatible with almost everything
  { drug1: 'phenytoin', drug2: 'dextrose', ysite: 'incompatible', admixture: 'incompatible', notes: 'ONLY compatible with NS. Crystallizes in dextrose-containing solutions.', reference: 'Trissel 2024' },
  { drug1: 'phenytoin', drug2: 'morphine', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate forms', reference: 'Trissel 2024' },
  { drug1: 'phenytoin', drug2: 'potassium chloride', ysite: 'incompatible', admixture: 'incompatible', notes: 'Crystallization occurs', reference: 'Trissel 2024' },

  // Insulin combinations
  { drug1: 'insulin', drug2: 'potassium chloride', ysite: 'compatible', admixture: 'compatible', notes: 'Standard combination for hyperkalemia treatment', reference: 'Trissel 2024' },
  { drug1: 'insulin', drug2: 'octreotide', ysite: 'compatible', admixture: 'compatible', notes: 'Stable in NS for 48h', reference: 'Trissel 2024' },
  { drug1: 'insulin', drug2: 'total parenteral nutrition', ysite: 'compatible', admixture: 'compatible', notes: 'Standard additive to TPN', reference: 'King Guide 2024' },

  // Dopamine/vasopressor combinations
  { drug1: 'dopamine', drug2: 'dobutamine', ysite: 'compatible', admixture: 'compatible', notes: 'May be co-infused via Y-site', reference: 'Trissel 2024' },
  { drug1: 'dopamine', drug2: 'norepinephrine', ysite: 'compatible', admixture: 'compatible', notes: 'Compatible at standard concentrations', reference: 'Trissel 2024' },
  { drug1: 'dopamine', drug2: 'sodium bicarbonate', ysite: 'incompatible', admixture: 'incompatible', notes: 'Dopamine inactivated in alkaline solutions', reference: 'Trissel 2024' },
  { drug1: 'norepinephrine', drug2: 'sodium bicarbonate', ysite: 'incompatible', admixture: 'incompatible', notes: 'Catecholamines inactivated by bicarbonate', reference: 'Trissel 2024' },
  { drug1: 'norepinephrine', drug2: 'vasopressin', ysite: 'compatible', admixture: 'unknown', notes: 'Commonly co-infused in septic shock', reference: 'King Guide 2024' },
  { drug1: 'norepinephrine', drug2: 'phenylephrine', ysite: 'compatible', admixture: 'unknown', notes: 'Compatible at standard concentrations', reference: 'King Guide 2024' },

  // Propofol combinations
  { drug1: 'propofol', drug2: 'midazolam', ysite: 'compatible', admixture: 'unknown', notes: 'Y-site compatible. Do not admix (lipid emulsion).', reference: 'Trissel 2024' },
  { drug1: 'propofol', drug2: 'fentanyl', ysite: 'compatible', admixture: 'unknown', notes: 'Y-site compatible. Common ICU combination.', reference: 'Trissel 2024' },
  { drug1: 'propofol', drug2: 'blood products', ysite: 'incompatible', admixture: 'incompatible', notes: 'Never administer through same line as blood', reference: 'Trissel 2024' },
  { drug1: 'propofol', drug2: 'amiodarone', ysite: 'incompatible', admixture: 'incompatible', notes: 'Emulsion breakage occurs', reference: 'Trissel 2024' },

  // Magnesium sulfate
  { drug1: 'magnesium sulfate', drug2: 'calcium gluconate', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate forms. Separate lines required. Fatal in neonates when mixed.', reference: 'Trissel 2024' },
  { drug1: 'magnesium sulfate', drug2: 'potassium chloride', ysite: 'compatible', admixture: 'compatible', notes: 'Common electrolyte combination', reference: 'Trissel 2024' },
  { drug1: 'magnesium sulfate', drug2: 'oxytocin', ysite: 'compatible', admixture: 'compatible', notes: 'Stable for 24h', reference: 'Trissel 2024' },

  // Furosemide
  { drug1: 'furosemide', drug2: 'midazolam', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate forms immediately', reference: 'Trissel 2024' },
  { drug1: 'furosemide', drug2: 'ciprofloxacin', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate within 1 hour', reference: 'Trissel 2024' },
  { drug1: 'furosemide', drug2: 'milrinone', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate forms', reference: 'Trissel 2024' },
  { drug1: 'furosemide', drug2: 'morphine', ysite: 'compatible', admixture: 'compatible', notes: 'Compatible in NS at standard concentrations', reference: 'Trissel 2024' },

  // Amiodarone combinations
  { drug1: 'amiodarone', drug2: 'sodium bicarbonate', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate forms', reference: 'Trissel 2024' },
  { drug1: 'amiodarone', drug2: 'furosemide', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate forms. Common error in cardiac arrest.', reference: 'Trissel 2024' },
  { drug1: 'amiodarone', drug2: 'normal saline', ysite: 'variable', admixture: 'variable', notes: 'Stable <24h in NS. Preferred diluent is D5W for infusions >2h. Precipitates in NS at higher concentrations.', reference: 'Trissel 2024' },
  { drug1: 'amiodarone', drug2: 'lidocaine', ysite: 'compatible', admixture: 'unknown', notes: 'Y-site compatible', reference: 'Trissel 2024' },

  // Pantoprazole
  { drug1: 'pantoprazole', drug2: 'midazolam', ysite: 'incompatible', admixture: 'incompatible', notes: 'Color change and precipitate', reference: 'Trissel 2024' },
  { drug1: 'pantoprazole', drug2: 'octreotide', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate forms', reference: 'Trissel 2024' },
  { drug1: 'pantoprazole', drug2: 'insulin', ysite: 'incompatible', admixture: 'incompatible', notes: 'Incompatible via Y-site', reference: 'Trissel 2024' },

  // Common ICU sedation
  { drug1: 'fentanyl', drug2: 'midazolam', ysite: 'compatible', admixture: 'compatible', notes: 'Common ICU sedation combination. Stable for 24h.', reference: 'Trissel 2024' },
  { drug1: 'fentanyl', drug2: 'ketamine', ysite: 'compatible', admixture: 'compatible', notes: 'Stable for 24h in NS or D5W', reference: 'King Guide 2024' },
  { drug1: 'dexmedetomidine', drug2: 'fentanyl', ysite: 'compatible', admixture: 'unknown', notes: 'Y-site compatible at standard concentrations', reference: 'King Guide 2024' },
  { drug1: 'dexmedetomidine', drug2: 'propofol', ysite: 'compatible', admixture: 'unknown', notes: 'Y-site compatible', reference: 'King Guide 2024' },

  // Antibiotics
  { drug1: 'ceftriaxone', drug2: 'calcium gluconate', ysite: 'incompatible', admixture: 'incompatible', notes: 'FATAL precipitation risk, especially neonates. Ceftriaxone-calcium precipitate can deposit in lungs and kidneys.', reference: 'FDA Safety Alert' },
  { drug1: 'ceftriaxone', drug2: 'calcium chloride', ysite: 'incompatible', admixture: 'incompatible', notes: 'Same risk as calcium gluconate. Contraindicated in neonates.', reference: 'FDA Safety Alert' },
  { drug1: 'ampicillin', drug2: 'gentamicin', ysite: 'incompatible', admixture: 'incompatible', notes: 'Aminoglycosides inactivated by penicillins. Separate by ≥1h.', reference: 'Trissel 2024' },
  { drug1: 'piperacillin-tazobactam', drug2: 'gentamicin', ysite: 'incompatible', admixture: 'incompatible', notes: 'Aminoglycoside inactivation. Flush line.', reference: 'Trissel 2024' },
  { drug1: 'meropenem', drug2: 'dextrose', ysite: 'compatible', admixture: 'variable', notes: 'Less stable in D5W vs NS. Use within 1h in D5W, 4h in NS at room temp.', reference: 'Trissel 2024' },

  // TPN
  { drug1: 'total parenteral nutrition', drug2: 'phenytoin', ysite: 'incompatible', admixture: 'incompatible', notes: 'Precipitate forms immediately', reference: 'Trissel 2024' },
  { drug1: 'total parenteral nutrition', drug2: 'ciprofloxacin', ysite: 'incompatible', admixture: 'incompatible', notes: 'Physical incompatibility', reference: 'Trissel 2024' },

  // Additional high-risk combinations
  { drug1: 'mannitol', drug2: 'potassium chloride', ysite: 'compatible', admixture: 'compatible', notes: 'Stable at standard concentrations', reference: 'Trissel 2024' },
  { drug1: 'mannitol', drug2: 'blood products', ysite: 'incompatible', admixture: 'incompatible', notes: 'Causes RBC crenation. Separate lines.', reference: 'Trissel 2024' },
  { drug1: 'sodium bicarbonate', drug2: 'calcium chloride', ysite: 'incompatible', admixture: 'incompatible', notes: 'Calcium carbonate precipitate. Common ACLS error.', reference: 'Trissel 2024' },
  { drug1: 'sodium bicarbonate', drug2: 'calcium gluconate', ysite: 'incompatible', admixture: 'incompatible', notes: 'Calcium carbonate precipitate forms', reference: 'Trissel 2024' },
];

// Drug name aliases for lookup
const drugAliases: Record<string, string> = {
  'zosyn': 'piperacillin-tazobactam',
  'pip-tazo': 'piperacillin-tazobactam',
  'pip/tazo': 'piperacillin-tazobactam',
  'levophed': 'norepinephrine',
  'norepi': 'norepinephrine',
  'neo': 'phenylephrine',
  'neosynephrine': 'phenylephrine',
  'lasix': 'furosemide',
  'versed': 'midazolam',
  'diprivan': 'propofol',
  'precedex': 'dexmedetomidine',
  'dex': 'dexmedetomidine',
  'mag': 'magnesium sulfate',
  'magsulfate': 'magnesium sulfate',
  'kcl': 'potassium chloride',
  'bicarb': 'sodium bicarbonate',
  'nahco3': 'sodium bicarbonate',
  'ns': 'normal saline',
  'd5w': 'dextrose',
  'd5': 'dextrose',
  'tpn': 'total parenteral nutrition',
  'vanco': 'vancomycin',
  'gent': 'gentamicin',
  'rocephin': 'ceftriaxone',
  'maxipime': 'cefepime',
  'cordarone': 'amiodarone',
  'protonix': 'pantoprazole',
  'unasyn': 'ampicillin-sulbactam',
  'cacl': 'calcium chloride',
};

function resolveDrugName(name: string): string {
  const lower = name.toLowerCase().trim();
  return drugAliases[lower] ?? lower;
}

export interface IVCompatibilityResult {
  drug1: string;
  drug2: string;
  drug1Resolved: string;
  drug2Resolved: string;
  ysite: CompatibilityStatus;
  admixture: CompatibilityStatus;
  notes: string;
  reference: string;
  clinicalWarning?: string;
}

export function checkIVCompatibility(drug1: string, drug2: string): IVCompatibilityResult {
  const d1 = resolveDrugName(drug1);
  const d2 = resolveDrugName(drug2);

  const entry = compatibilityData.find(e =>
    (e.drug1 === d1 && e.drug2 === d2) ||
    (e.drug1 === d2 && e.drug2 === d1)
  );

  if (!entry) {
    return {
      drug1,
      drug2,
      drug1Resolved: d1,
      drug2Resolved: d2,
      ysite: 'unknown',
      admixture: 'unknown',
      notes: 'No compatibility data found in database. Consult pharmacist or Trissel\'s Handbook before co-administering.',
      reference: 'N/A',
      clinicalWarning: 'UNKNOWN COMPATIBILITY: When in doubt, administer separately with a line flush between drugs.',
    };
  }

  const clinicalWarning = entry.ysite === 'incompatible'
    ? `DO NOT co-administer ${d1} and ${d2} via Y-site. Flush line between infusions.`
    : entry.ysite === 'variable'
      ? `Variable compatibility — verify concentration and diluent before co-administering.`
      : undefined;

  return {
    drug1,
    drug2,
    drug1Resolved: d1,
    drug2Resolved: d2,
    ysite: entry.ysite,
    admixture: entry.admixture,
    notes: entry.notes,
    reference: entry.reference,
    clinicalWarning,
  };
}

export interface BulkIVCompatibilityResult {
  drugList: string[];
  resolvedDrugs: string[];
  pairs: IVCompatibilityResult[];
  incompatiblePairs: IVCompatibilityResult[];
  variablePairs: IVCompatibilityResult[];
  compatiblePairs: IVCompatibilityResult[];
  unknownPairs: IVCompatibilityResult[];
  summary: string;
}

export function checkBulkIVCompatibility(drugs: string[]): BulkIVCompatibilityResult {
  const resolved = drugs.map(d => resolveDrugName(d));
  const pairs: IVCompatibilityResult[] = [];

  for (let i = 0; i < drugs.length; i++) {
    for (let j = i + 1; j < drugs.length; j++) {
      pairs.push(checkIVCompatibility(drugs[i], drugs[j]));
    }
  }

  const incompatiblePairs = pairs.filter(p => p.ysite === 'incompatible');
  const variablePairs = pairs.filter(p => p.ysite === 'variable');
  const compatiblePairs = pairs.filter(p => p.ysite === 'compatible');
  const unknownPairs = pairs.filter(p => p.ysite === 'unknown');

  let summary: string;
  if (incompatiblePairs.length > 0) {
    summary = `WARNING: ${incompatiblePairs.length} incompatible pair(s) found among ${drugs.length} drugs. Do NOT co-administer: ${incompatiblePairs.map(p => `${p.drug1Resolved} + ${p.drug2Resolved}`).join('; ')}`;
  } else if (variablePairs.length > 0) {
    summary = `CAUTION: ${variablePairs.length} pair(s) with variable compatibility. Verify concentrations and diluents.`;
  } else if (unknownPairs.length > 0) {
    summary = `${compatiblePairs.length} compatible pair(s), ${unknownPairs.length} unknown pair(s). Consult pharmacist for unknowns.`;
  } else {
    summary = `All ${pairs.length} pair(s) are Y-site compatible.`;
  }

  return {
    drugList: drugs,
    resolvedDrugs: resolved,
    pairs,
    incompatiblePairs,
    variablePairs,
    compatiblePairs,
    unknownPairs,
    summary,
  };
}

export function listIVDrugsInDatabase(): string[] {
  const drugs = new Set<string>();
  for (const entry of compatibilityData) {
    drugs.add(entry.drug1);
    drugs.add(entry.drug2);
  }
  return [...drugs].sort();
}

export function getCompatibilityCount(): number {
  return compatibilityData.length;
}

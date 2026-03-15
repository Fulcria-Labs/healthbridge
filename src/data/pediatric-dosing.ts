/**
 * Pediatric Dosing Database
 *
 * Weight-based and age-based dosing for common pediatric medications.
 * Based on Harriet Lane Handbook, AAP guidelines, and FDA labeling.
 * All doses in mg/kg unless otherwise noted.
 */

export interface PediatricDosingEntry {
  drug: string;
  drugClass: string;
  /** Indication-specific dosing */
  indications: PediatricIndication[];
  /** Minimum age in months (0 = neonatal) */
  minAgeMonths: number;
  /** FDA-approved for pediatric use */
  fdaApprovedPediatric: boolean;
  /** Key warnings */
  warnings: string[];
}

export interface PediatricIndication {
  indication: string;
  route: 'oral' | 'IV' | 'IM' | 'rectal' | 'inhaled' | 'topical';
  /** mg/kg/dose */
  dosePerKg: number;
  /** Maximum single dose in mg */
  maxSingleDoseMg: number;
  /** Frequency description */
  frequency: string;
  /** Maximum daily dose in mg */
  maxDailyDoseMg: number;
  /** Duration of therapy if applicable */
  duration?: string;
  /** Additional notes */
  notes?: string;
}

export interface AgeCategory {
  label: string;
  minMonths: number;
  maxMonths: number;
}

export const AGE_CATEGORIES: AgeCategory[] = [
  { label: 'Neonate (0-28 days)', minMonths: 0, maxMonths: 1 },
  { label: 'Infant (1-12 months)', minMonths: 1, maxMonths: 12 },
  { label: 'Toddler (1-3 years)', minMonths: 12, maxMonths: 36 },
  { label: 'Preschool (3-5 years)', minMonths: 36, maxMonths: 60 },
  { label: 'School-age (6-12 years)', minMonths: 60, maxMonths: 144 },
  { label: 'Adolescent (12-18 years)', minMonths: 144, maxMonths: 216 },
];

export const pediatricDosingDatabase: PediatricDosingEntry[] = [
  // --- Antipyretics/Analgesics ---
  {
    drug: 'acetaminophen',
    drugClass: 'analgesic/antipyretic',
    indications: [
      { indication: 'Fever/Pain', route: 'oral', dosePerKg: 15, maxSingleDoseMg: 1000, frequency: 'Every 4-6 hours', maxDailyDoseMg: 75, notes: 'Max daily dose: 75 mg/kg/day up to 4000 mg/day' },
      { indication: 'Fever/Pain', route: 'rectal', dosePerKg: 15, maxSingleDoseMg: 1000, frequency: 'Every 4-6 hours', maxDailyDoseMg: 75, notes: 'Rectal absorption variable; onset slower than oral' },
    ],
    minAgeMonths: 0,
    fdaApprovedPediatric: true,
    warnings: ['Hepatotoxicity risk with overdose or chronic use', 'Check all combination products for acetaminophen content', 'Neonates: reduce frequency to every 6-8 hours'],
  },
  {
    drug: 'ibuprofen',
    drugClass: 'NSAID',
    indications: [
      { indication: 'Fever/Pain', route: 'oral', dosePerKg: 10, maxSingleDoseMg: 400, frequency: 'Every 6-8 hours', maxDailyDoseMg: 40, notes: 'Max 40 mg/kg/day up to 1200 mg/day (OTC), 2400 mg/day (Rx)' },
    ],
    minAgeMonths: 6,
    fdaApprovedPediatric: true,
    warnings: ['Not recommended under 6 months of age', 'Avoid in dehydration (nephrotoxicity risk)', 'Avoid with varicella/influenza (Reye syndrome concern debated)', 'GI bleeding risk; give with food'],
  },
  // --- Antibiotics ---
  {
    drug: 'amoxicillin',
    drugClass: 'aminopenicillin antibiotic',
    indications: [
      { indication: 'Otitis Media (standard)', route: 'oral', dosePerKg: 40, maxSingleDoseMg: 500, frequency: 'Every 8 hours (divided TID)', maxDailyDoseMg: 1500, duration: '10 days (<2yr) or 5-7 days (≥2yr)' },
      { indication: 'Otitis Media (high-dose)', route: 'oral', dosePerKg: 45, maxSingleDoseMg: 1000, frequency: 'Every 12 hours (divided BID)', maxDailyDoseMg: 3000, duration: '10 days', notes: 'For resistant pneumococcus or treatment failure' },
      { indication: 'Strep Pharyngitis', route: 'oral', dosePerKg: 25, maxSingleDoseMg: 500, frequency: 'Every 12 hours (BID)', maxDailyDoseMg: 1000, duration: '10 days' },
      { indication: 'Community-Acquired Pneumonia', route: 'oral', dosePerKg: 45, maxSingleDoseMg: 1000, frequency: 'Every 12 hours (BID)', maxDailyDoseMg: 3000, duration: '5-7 days' },
    ],
    minAgeMonths: 0,
    fdaApprovedPediatric: true,
    warnings: ['Check penicillin allergy', 'May cause rash (especially with EBV/mono)', 'Diarrhea common; probiotics may help'],
  },
  {
    drug: 'amoxicillin-clavulanate',
    drugClass: 'beta-lactam/inhibitor antibiotic',
    indications: [
      { indication: 'Otitis Media (resistant)', route: 'oral', dosePerKg: 45, maxSingleDoseMg: 875, frequency: 'Every 12 hours (BID)', maxDailyDoseMg: 1750, duration: '10 days', notes: 'Dose based on amoxicillin component; use 14:1 formulation for high-dose' },
      { indication: 'Sinusitis', route: 'oral', dosePerKg: 22.5, maxSingleDoseMg: 875, frequency: 'Every 12 hours (BID)', maxDailyDoseMg: 1750, duration: '10-14 days' },
      { indication: 'Skin/Soft Tissue (bite wounds)', route: 'oral', dosePerKg: 22.5, maxSingleDoseMg: 875, frequency: 'Every 12 hours (BID)', maxDailyDoseMg: 1750, duration: '5-7 days' },
    ],
    minAgeMonths: 0,
    fdaApprovedPediatric: true,
    warnings: ['Check penicillin allergy', 'Higher rate of diarrhea than amoxicillin alone', 'Clavulanate component limited to 6.4 mg/kg/day to reduce GI effects'],
  },
  {
    drug: 'azithromycin',
    drugClass: 'macrolide antibiotic',
    indications: [
      { indication: 'Otitis Media', route: 'oral', dosePerKg: 10, maxSingleDoseMg: 500, frequency: 'Day 1, then 5 mg/kg days 2-5', maxDailyDoseMg: 500, duration: '5 days' },
      { indication: 'Community-Acquired Pneumonia', route: 'oral', dosePerKg: 10, maxSingleDoseMg: 500, frequency: 'Day 1, then 5 mg/kg days 2-5', maxDailyDoseMg: 500, duration: '5 days' },
      { indication: 'Strep Pharyngitis (PCN-allergic)', route: 'oral', dosePerKg: 12, maxSingleDoseMg: 500, frequency: 'Once daily', maxDailyDoseMg: 500, duration: '5 days' },
    ],
    minAgeMonths: 6,
    fdaApprovedPediatric: true,
    warnings: ['QT prolongation risk', 'Not first-line for strep pharyngitis (resistance concerns)', 'GI upset common; take with food'],
  },
  {
    drug: 'cephalexin',
    drugClass: 'first-generation cephalosporin',
    indications: [
      { indication: 'Skin/Soft Tissue Infection', route: 'oral', dosePerKg: 12.5, maxSingleDoseMg: 500, frequency: 'Every 6 hours (QID)', maxDailyDoseMg: 2000, duration: '7-10 days' },
      { indication: 'UTI', route: 'oral', dosePerKg: 12.5, maxSingleDoseMg: 500, frequency: 'Every 6 hours (QID)', maxDailyDoseMg: 2000, duration: '7-10 days' },
      { indication: 'Strep Pharyngitis (PCN-allergic, non-anaphylaxis)', route: 'oral', dosePerKg: 10, maxSingleDoseMg: 500, frequency: 'Every 12 hours (BID)', maxDailyDoseMg: 1000, duration: '10 days' },
    ],
    minAgeMonths: 0,
    fdaApprovedPediatric: true,
    warnings: ['~1-2% cross-reactivity with penicillin allergy', 'Avoid in severe penicillin anaphylaxis'],
  },
  {
    drug: 'ceftriaxone',
    drugClass: 'third-generation cephalosporin',
    indications: [
      { indication: 'Meningitis', route: 'IV', dosePerKg: 50, maxSingleDoseMg: 2000, frequency: 'Every 12 hours', maxDailyDoseMg: 4000, duration: '10-14 days (pneumococcal), 7 days (meningococcal)' },
      { indication: 'Serious Bacterial Infection', route: 'IV', dosePerKg: 50, maxSingleDoseMg: 2000, frequency: 'Every 24 hours', maxDailyDoseMg: 4000, duration: 'Based on source' },
      { indication: 'Otitis Media (refractory)', route: 'IM', dosePerKg: 50, maxSingleDoseMg: 1000, frequency: 'Single dose (may repeat x1 in 48h)', maxDailyDoseMg: 1000, duration: '1-3 doses' },
    ],
    minAgeMonths: 0,
    fdaApprovedPediatric: true,
    warnings: ['CONTRAINDICATED in neonates receiving IV calcium', 'Can cause biliary sludge/pseudolithiasis', 'Do not use in hyperbilirubinemic neonates'],
  },
  {
    drug: 'trimethoprim-sulfamethoxazole',
    drugClass: 'sulfonamide antibiotic',
    indications: [
      { indication: 'UTI', route: 'oral', dosePerKg: 4, maxSingleDoseMg: 160, frequency: 'Every 12 hours (BID, TMP component)', maxDailyDoseMg: 320, duration: '7-10 days', notes: 'Dose based on TMP component' },
      { indication: 'MRSA Skin Infection', route: 'oral', dosePerKg: 4, maxSingleDoseMg: 160, frequency: 'Every 12 hours (BID, TMP component)', maxDailyDoseMg: 320, duration: '5-7 days' },
    ],
    minAgeMonths: 2,
    fdaApprovedPediatric: true,
    warnings: ['Avoid under 2 months (kernicterus risk)', 'Sulfa allergy cross-reactivity', 'Photosensitivity', 'Monitor CBC with prolonged use'],
  },
  // --- Asthma/Respiratory ---
  {
    drug: 'albuterol',
    drugClass: 'short-acting beta-2 agonist',
    indications: [
      { indication: 'Acute Bronchospasm (nebulizer)', route: 'inhaled', dosePerKg: 0.15, maxSingleDoseMg: 5, frequency: 'Every 20 min x3, then every 1-4 hours', maxDailyDoseMg: 30, notes: 'Nebulizer: 2.5 mg for <20kg, 5 mg for ≥20kg' },
      { indication: 'Acute Bronchospasm (MDI)', route: 'inhaled', dosePerKg: 0, maxSingleDoseMg: 0.9, frequency: '4-8 puffs every 20 min x3', maxDailyDoseMg: 10.8, notes: '90 mcg/puff; 4-8 puffs with spacer' },
    ],
    minAgeMonths: 0,
    fdaApprovedPediatric: true,
    warnings: ['Tachycardia, tremor common', 'Hypokalemia with frequent dosing', 'Always use spacer with MDI in children'],
  },
  {
    drug: 'prednisolone',
    drugClass: 'corticosteroid',
    indications: [
      { indication: 'Asthma Exacerbation', route: 'oral', dosePerKg: 1, maxSingleDoseMg: 60, frequency: 'Once daily', maxDailyDoseMg: 60, duration: '3-5 days', notes: 'No taper needed for ≤5 days' },
      { indication: 'Croup', route: 'oral', dosePerKg: 1, maxSingleDoseMg: 60, frequency: 'Single dose', maxDailyDoseMg: 60, duration: 'Single dose', notes: 'Dexamethasone 0.6 mg/kg x1 often preferred' },
    ],
    minAgeMonths: 0,
    fdaApprovedPediatric: true,
    warnings: ['Behavioral changes/hyperactivity common in children', 'GI upset - give with food', 'Immunosuppression risk with prolonged courses', 'Check varicella immunity status'],
  },
  // --- Anticonvulsants ---
  {
    drug: 'levetiracetam',
    drugClass: 'anticonvulsant',
    indications: [
      { indication: 'Seizure Disorder', route: 'oral', dosePerKg: 10, maxSingleDoseMg: 750, frequency: 'Every 12 hours (BID), titrate up over 2-4 weeks', maxDailyDoseMg: 3000, notes: 'Target: 20-30 mg/kg/day BID; max 3000 mg/day' },
      { indication: 'Status Epilepticus (adjunct)', route: 'IV', dosePerKg: 30, maxSingleDoseMg: 3000, frequency: 'Single loading dose over 15 min', maxDailyDoseMg: 3000 },
    ],
    minAgeMonths: 1,
    fdaApprovedPediatric: true,
    warnings: ['Behavioral side effects (irritability, aggression) in 10-20% of children', 'Dose adjust for renal impairment', 'No significant drug interactions'],
  },
  // --- Antiemetics ---
  {
    drug: 'ondansetron',
    drugClass: 'serotonin 5-HT3 antagonist',
    indications: [
      { indication: 'Nausea/Vomiting (gastroenteritis)', route: 'oral', dosePerKg: 0.15, maxSingleDoseMg: 4, frequency: 'Every 8 hours (TID)', maxDailyDoseMg: 12, notes: 'Often single dose sufficient for acute gastroenteritis' },
      { indication: 'Chemotherapy-Induced Nausea', route: 'IV', dosePerKg: 0.15, maxSingleDoseMg: 16, frequency: 'Every 8 hours', maxDailyDoseMg: 48 },
    ],
    minAgeMonths: 1,
    fdaApprovedPediatric: true,
    warnings: ['QT prolongation risk (dose-dependent)', 'May mask signs of appendicitis or obstruction', 'Max IV dose 16mg (FDA black box for 32mg single IV dose)'],
  },
  // --- Antihistamines ---
  {
    drug: 'diphenhydramine',
    drugClass: 'first-generation antihistamine',
    indications: [
      { indication: 'Allergic Reaction', route: 'oral', dosePerKg: 1.25, maxSingleDoseMg: 50, frequency: 'Every 6 hours (QID)', maxDailyDoseMg: 300 },
      { indication: 'Anaphylaxis (adjunct)', route: 'IV', dosePerKg: 1.25, maxSingleDoseMg: 50, frequency: 'Every 6 hours', maxDailyDoseMg: 300, notes: 'Always give epinephrine FIRST in anaphylaxis' },
    ],
    minAgeMonths: 24,
    fdaApprovedPediatric: true,
    warnings: ['NOT recommended under 2 years (AAP)', 'Sedation, anticholinergic effects', 'Paradoxical excitation in young children', 'Avoid in neonates'],
  },
  {
    drug: 'cetirizine',
    drugClass: 'second-generation antihistamine',
    indications: [
      { indication: 'Allergic Rhinitis/Urticaria', route: 'oral', dosePerKg: 0, maxSingleDoseMg: 10, frequency: 'Once daily', maxDailyDoseMg: 10, notes: '6-12 mo: 2.5mg daily; 1-5yr: 2.5mg daily (may increase to 5mg); 6+yr: 5-10mg daily' },
    ],
    minAgeMonths: 6,
    fdaApprovedPediatric: true,
    warnings: ['Less sedating than diphenhydramine but some sedation possible', 'Dose adjust for renal impairment'],
  },
  // --- GI ---
  {
    drug: 'omeprazole',
    drugClass: 'proton pump inhibitor',
    indications: [
      { indication: 'GERD', route: 'oral', dosePerKg: 1, maxSingleDoseMg: 20, frequency: 'Once daily', maxDailyDoseMg: 40, notes: '5-10 kg: 5mg; 10-20 kg: 10mg; >20 kg: 20mg daily' },
    ],
    minAgeMonths: 12,
    fdaApprovedPediatric: true,
    warnings: ['Not recommended for functional reflux in infants', 'Long-term use: monitor Mg2+, B12, bone health', 'Capsule can be opened and mixed with applesauce'],
  },
  // --- ADHD ---
  {
    drug: 'methylphenidate',
    drugClass: 'CNS stimulant',
    indications: [
      { indication: 'ADHD', route: 'oral', dosePerKg: 0.3, maxSingleDoseMg: 20, frequency: 'BID-TID (IR) or once daily (ER)', maxDailyDoseMg: 72, notes: 'Start 5mg BID (IR); titrate weekly by 5-10mg. ER: start 18mg daily. Max 72mg/day (ER)' },
    ],
    minAgeMonths: 72,
    fdaApprovedPediatric: true,
    warnings: ['Black box: abuse potential', 'Monitor height/weight (growth suppression)', 'Cardiovascular screening before starting', 'Insomnia, appetite suppression common', 'Drug holidays may be considered during school breaks'],
  },
];

/**
 * Calculate pediatric dose based on weight
 */
export function calculatePediatricDose(
  drug: string,
  weightKg: number,
  ageMonths: number,
  indication?: string
): {
  drug: string;
  drugClass: string;
  weightKg: number;
  ageMonths: number;
  ageCategory: string;
  indications: Array<{
    indication: string;
    route: string;
    calculatedDoseMg: number;
    maxSingleDoseMg: number;
    recommendedDoseMg: number;
    frequency: string;
    maxDailyDoseMg: number;
    notes?: string;
    duration?: string;
  }>;
  warnings: string[];
  ageAppropriate: boolean;
  fdaApprovedPediatric: boolean;
} | null {
  const drugLower = drug.toLowerCase();
  const entry = pediatricDosingDatabase.find(e => e.drug.toLowerCase() === drugLower);
  if (!entry) return null;

  const ageCategory = getAgeCategory(ageMonths);
  const ageAppropriate = ageMonths >= entry.minAgeMonths;

  let filteredIndications = entry.indications;
  if (indication) {
    const indLower = indication.toLowerCase();
    const matched = entry.indications.filter(i =>
      i.indication.toLowerCase().includes(indLower)
    );
    if (matched.length > 0) filteredIndications = matched;
  }

  const calculatedIndications = filteredIndications.map(ind => {
    const rawDose = ind.dosePerKg * weightKg;
    const capped = Math.min(rawDose, ind.maxSingleDoseMg);
    const recommended = Math.round(capped * 10) / 10;

    return {
      indication: ind.indication,
      route: ind.route,
      calculatedDoseMg: Math.round(rawDose * 10) / 10,
      maxSingleDoseMg: ind.maxSingleDoseMg,
      recommendedDoseMg: recommended,
      frequency: ind.frequency,
      maxDailyDoseMg: ind.maxDailyDoseMg,
      notes: ind.notes,
      duration: ind.duration,
    };
  });

  const warnings = [...entry.warnings];
  if (!ageAppropriate) {
    warnings.unshift(`WARNING: ${entry.drug} is not recommended for patients under ${entry.minAgeMonths} months of age.`);
  }
  if (weightKg < 3) {
    warnings.unshift('WARNING: Very low weight (<3 kg). Verify neonatal dosing with pharmacy/NICU guidelines.');
  }
  if (weightKg > 40 && ageMonths < 144) {
    warnings.push('Note: Weight exceeds typical range for age. Consider using adult dosing guidelines if weight ≥40 kg.');
  }

  return {
    drug: entry.drug,
    drugClass: entry.drugClass,
    weightKg,
    ageMonths,
    ageCategory,
    indications: calculatedIndications,
    warnings,
    ageAppropriate,
    fdaApprovedPediatric: entry.fdaApprovedPediatric,
  };
}

/**
 * List all drugs with pediatric dosing data
 */
export function listPediatricDosingDrugs(): Array<{ drug: string; drugClass: string; minAgeMonths: number }> {
  return pediatricDosingDatabase.map(e => ({
    drug: e.drug,
    drugClass: e.drugClass,
    minAgeMonths: e.minAgeMonths,
  }));
}

function getAgeCategory(ageMonths: number): string {
  const cat = AGE_CATEGORIES.find(c => ageMonths >= c.minMonths && ageMonths < c.maxMonths);
  return cat?.label ?? (ageMonths >= 216 ? 'Adult (≥18 years)' : 'Unknown');
}

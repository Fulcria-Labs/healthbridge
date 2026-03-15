/**
 * Drug Allergy Cross-Reactivity Database
 *
 * Evidence-based cross-reactivity data between drug classes.
 * Based on major allergy/immunology guidelines, AAAAI, and
 * published meta-analyses.
 */

export interface CrossReactivityEntry {
  allergyClass: string;
  /** Common drugs in this allergy class */
  drugs: string[];
  /** Cross-reactive drug classes */
  crossReactivities: CrossReactivity[];
}

export interface CrossReactivity {
  targetClass: string;
  targetDrugs: string[];
  /** Estimated cross-reactivity rate */
  riskPercent: string;
  riskLevel: 'high' | 'moderate' | 'low' | 'negligible';
  /** Evidence and rationale */
  evidence: string;
  /** Clinical recommendation */
  recommendation: string;
  /** Safe alternatives within target class */
  safeAlternatives?: string[];
}

export const crossReactivityDatabase: CrossReactivityEntry[] = [
  {
    allergyClass: 'penicillin',
    drugs: ['penicillin', 'amoxicillin', 'ampicillin', 'piperacillin', 'nafcillin', 'oxacillin', 'dicloxacillin'],
    crossReactivities: [
      {
        targetClass: 'cephalosporins (1st generation)',
        targetDrugs: ['cephalexin', 'cefazolin', 'cefadroxil'],
        riskPercent: '1-2%',
        riskLevel: 'low',
        evidence: 'Modern data shows ~1-2% cross-reactivity, much lower than historical 10% figure. R1 side chain similarity is the primary determinant.',
        recommendation: 'Can generally use with monitoring. Avoid if history of severe anaphylaxis to amoxicillin specifically (shared R1 side chain with cephalexin). Consider skin testing if available.',
        safeAlternatives: ['cefuroxime', 'ceftriaxone', 'cefepime'],
      },
      {
        targetClass: 'cephalosporins (2nd generation)',
        targetDrugs: ['cefuroxime', 'cefaclor', 'cefprozil', 'loracarbef'],
        riskPercent: '1%',
        riskLevel: 'low',
        evidence: 'Very low cross-reactivity. Cefaclor and cefprozil share side chain with ampicillin - slightly higher risk.',
        recommendation: 'Generally safe. Avoid cefaclor/cefprozil if ampicillin was the trigger. Cefuroxime has different side chain and is safer.',
      },
      {
        targetClass: 'cephalosporins (3rd/4th generation)',
        targetDrugs: ['ceftriaxone', 'cefdinir', 'cefixime', 'ceftazidime', 'cefepime'],
        riskPercent: '<1%',
        riskLevel: 'negligible',
        evidence: 'Very different side chains from penicillins. Multiple studies show negligible cross-reactivity.',
        recommendation: 'Safe to use. Minimal cross-reactivity risk. Ceftriaxone widely used in penicillin-allergic patients.',
      },
      {
        targetClass: 'carbapenems',
        targetDrugs: ['meropenem', 'imipenem', 'ertapenem', 'doripenem'],
        riskPercent: '<1%',
        riskLevel: 'negligible',
        evidence: 'Previous concern about shared beta-lactam ring. Modern studies show <1% cross-reactivity.',
        recommendation: 'Safe to use in penicillin-allergic patients. Can administer without skin testing per AAAAI/ACAAI guidelines.',
      },
      {
        targetClass: 'monobactams',
        targetDrugs: ['aztreonam'],
        riskPercent: '0%',
        riskLevel: 'negligible',
        evidence: 'No shared ring structure with penicillins. Aztreonam shares side chain with ceftazidime only.',
        recommendation: 'Safe to use. No cross-reactivity with penicillins.',
      },
    ],
  },
  {
    allergyClass: 'sulfonamide antibiotics',
    drugs: ['sulfamethoxazole', 'sulfasalazine', 'sulfadiazine'],
    crossReactivities: [
      {
        targetClass: 'sulfonamide non-antibiotics',
        targetDrugs: ['furosemide', 'hydrochlorothiazide', 'celecoxib', 'sumatriptan', 'glipizide', 'acetazolamide'],
        riskPercent: '<2%',
        riskLevel: 'negligible',
        evidence: 'Non-antibiotic sulfonamides lack the N1 aromatic amine that causes immunogenic reactions. Different chemical structure despite shared "sulfa" prefix.',
        recommendation: 'Safe to use. Cross-reactivity is a myth based on shared sulfonamide moiety. AAAAI/ACAAI state these are safe in sulfa-allergic patients.',
      },
      {
        targetClass: 'dapsone',
        targetDrugs: ['dapsone'],
        riskPercent: '5-10%',
        riskLevel: 'moderate',
        evidence: 'Dapsone is an aryl amine sulfonamide like TMP-SMX. Similar metabolic pathways produce reactive hydroxylamine metabolites.',
        recommendation: 'Use with caution. Consider desensitization if dapsone is clinically necessary (e.g., PJP prophylaxis).',
      },
    ],
  },
  {
    allergyClass: 'NSAIDs (aspirin)',
    drugs: ['aspirin'],
    crossReactivities: [
      {
        targetClass: 'other NSAIDs (COX-1 inhibitors)',
        targetDrugs: ['ibuprofen', 'naproxen', 'ketorolac', 'indomethacin', 'piroxicam', 'diclofenac'],
        riskPercent: '20-30%',
        riskLevel: 'high',
        evidence: 'COX-1 inhibition shifts arachidonic acid toward leukotriene pathway. Cross-reactivity is pharmacologic, not immunologic.',
        recommendation: 'AVOID all non-selective NSAIDs. Risk is especially high in patients with aspirin-exacerbated respiratory disease (AERD/Samter triad).',
        safeAlternatives: ['celecoxib', 'acetaminophen'],
      },
      {
        targetClass: 'COX-2 selective inhibitors',
        targetDrugs: ['celecoxib', 'meloxicam (low dose)'],
        riskPercent: '2-4%',
        riskLevel: 'low',
        evidence: 'Selective COX-2 inhibitors spare COX-1, avoiding the leukotriene shunt. Multiple studies confirm safety in AERD.',
        recommendation: 'Celecoxib is generally safe. Consider supervised oral challenge in clinic for high-risk patients.',
      },
    ],
  },
  {
    allergyClass: 'NSAIDs (single NSAID)',
    drugs: ['ibuprofen', 'naproxen', 'diclofenac', 'ketorolac'],
    crossReactivities: [
      {
        targetClass: 'other NSAIDs',
        targetDrugs: ['aspirin', 'other NSAIDs'],
        riskPercent: '5-10%',
        riskLevel: 'moderate',
        evidence: 'If reaction was to a single NSAID (urticaria/angioedema type), may be IgE-mediated. Cross-reactivity depends on reaction type.',
        recommendation: 'If reaction was urticaria/angioedema to single NSAID: try structurally different NSAID under observation. If respiratory reaction: avoid all NSAIDs.',
        safeAlternatives: ['acetaminophen', 'celecoxib'],
      },
    ],
  },
  {
    allergyClass: 'fluoroquinolones',
    drugs: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'ofloxacin'],
    crossReactivities: [
      {
        targetClass: 'other fluoroquinolones',
        targetDrugs: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin'],
        riskPercent: '10-20%',
        riskLevel: 'moderate',
        evidence: 'Shared core quinolone structure. Cross-reactivity varies by specific agent and reaction type.',
        recommendation: 'Avoid all fluoroquinolones if history of severe reaction. For mild reactions, may try different subclass under observation. Consider desensitization if essential.',
      },
    ],
  },
  {
    allergyClass: 'opioids (morphine)',
    drugs: ['morphine', 'codeine'],
    crossReactivities: [
      {
        targetClass: 'natural opioids',
        targetDrugs: ['hydromorphone', 'oxycodone', 'hydrocodone'],
        riskPercent: '10-15%',
        riskLevel: 'moderate',
        evidence: 'Structural similarity among phenanthrene derivatives. Most "opioid allergies" are actually pseudo-allergic (direct mast cell degranulation).',
        recommendation: 'Use semi-synthetic opioids with caution. Hydromorphone has lower histamine release than morphine.',
        safeAlternatives: ['fentanyl', 'tramadol', 'meperidine'],
      },
      {
        targetClass: 'synthetic opioids',
        targetDrugs: ['fentanyl', 'tramadol', 'meperidine', 'methadone'],
        riskPercent: '<1%',
        riskLevel: 'negligible',
        evidence: 'Completely different chemical structure from phenanthrene opioids. No structural cross-reactivity.',
        recommendation: 'Safe to use. Fentanyl is preferred opioid in morphine-allergic patients.',
      },
    ],
  },
  {
    allergyClass: 'local anesthetics (ester type)',
    drugs: ['procaine', 'benzocaine', 'tetracaine', 'chloroprocaine'],
    crossReactivities: [
      {
        targetClass: 'amide local anesthetics',
        targetDrugs: ['lidocaine', 'bupivacaine', 'ropivacaine', 'mepivacaine'],
        riskPercent: '0%',
        riskLevel: 'negligible',
        evidence: 'Completely different chemical structure. Ester type metabolized to PABA (the allergen). Amide type does not produce PABA.',
        recommendation: 'Safe to use. No cross-reactivity between ester and amide local anesthetics.',
      },
      {
        targetClass: 'other ester local anesthetics',
        targetDrugs: ['procaine', 'benzocaine', 'tetracaine'],
        riskPercent: '100%',
        riskLevel: 'high',
        evidence: 'All ester-type local anesthetics are metabolized to para-aminobenzoic acid (PABA), which is the allergenic determinant.',
        recommendation: 'AVOID all ester-type local anesthetics. Switch to amide class (lidocaine, bupivacaine).',
        safeAlternatives: ['lidocaine', 'bupivacaine', 'ropivacaine'],
      },
    ],
  },
  {
    allergyClass: 'ACE inhibitors (angioedema)',
    drugs: ['lisinopril', 'enalapril', 'ramipril', 'captopril', 'benazepril'],
    crossReactivities: [
      {
        targetClass: 'ARBs',
        targetDrugs: ['losartan', 'valsartan', 'irbesartan', 'candesartan', 'olmesartan'],
        riskPercent: '2-8%',
        riskLevel: 'low',
        evidence: 'Different mechanism (ARBs block AT1 receptor vs ACE enzyme). However, angioedema from both involves bradykinin. Some guidelines suggest up to 8% risk.',
        recommendation: 'Can use ARBs with monitoring. Start in supervised setting. Risk is low but not zero. Ensure no history of hereditary angioedema.',
      },
      {
        targetClass: 'other ACE inhibitors',
        targetDrugs: ['lisinopril', 'enalapril', 'ramipril'],
        riskPercent: '100%',
        riskLevel: 'high',
        evidence: 'ACE inhibitor angioedema is a class effect mediated by bradykinin accumulation. All ACE inhibitors carry the same risk.',
        recommendation: 'AVOID all ACE inhibitors permanently. Switch to ARB or other antihypertensive.',
        safeAlternatives: ['losartan', 'valsartan', 'amlodipine'],
      },
    ],
  },
  {
    allergyClass: 'statins',
    drugs: ['atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin', 'lovastatin'],
    crossReactivities: [
      {
        targetClass: 'other statins',
        targetDrugs: ['atorvastatin', 'simvastatin', 'rosuvastatin', 'pravastatin'],
        riskPercent: '10-30%',
        riskLevel: 'moderate',
        evidence: 'Cross-reactivity varies by structure. Lipophilic statins (atorvastatin, simvastatin) may cross-react. Hydrophilic statins (pravastatin, rosuvastatin) are structurally different.',
        recommendation: 'Try a structurally different statin. If reacted to lipophilic, try hydrophilic (pravastatin/rosuvastatin) and vice versa.',
        safeAlternatives: ['pravastatin (if reacted to lipophilic)', 'ezetimibe (non-statin alternative)'],
      },
    ],
  },
];

/**
 * Check cross-reactivity for a given allergy and proposed drug
 */
export function checkCrossReactivity(
  allergy: string,
  proposedDrug: string
): {
  allergy: string;
  proposedDrug: string;
  crossReactivityFound: boolean;
  riskLevel: string;
  riskPercent: string;
  evidence: string;
  recommendation: string;
  safeAlternatives: string[];
  allergyClass: string;
  targetClass: string;
} | null {
  const allergyLower = allergy.toLowerCase();
  const drugLower = proposedDrug.toLowerCase();

  for (const entry of crossReactivityDatabase) {
    const allergyMatch = entry.allergyClass.toLowerCase().includes(allergyLower) ||
      entry.drugs.some(d => d.toLowerCase().includes(allergyLower) || allergyLower.includes(d.toLowerCase()));

    if (!allergyMatch) continue;

    for (const cr of entry.crossReactivities) {
      const drugMatch = cr.targetDrugs.some(d =>
        d.toLowerCase().includes(drugLower) || drugLower.includes(d.toLowerCase())
      ) || cr.targetClass.toLowerCase().includes(drugLower);

      if (drugMatch) {
        return {
          allergy,
          proposedDrug,
          crossReactivityFound: true,
          riskLevel: cr.riskLevel,
          riskPercent: cr.riskPercent,
          evidence: cr.evidence,
          recommendation: cr.recommendation,
          safeAlternatives: cr.safeAlternatives ?? [],
          allergyClass: entry.allergyClass,
          targetClass: cr.targetClass,
        };
      }
    }

    // Drug is in the same class as the allergy
    if (entry.drugs.some(d => d.toLowerCase().includes(drugLower) || drugLower.includes(d.toLowerCase()))) {
      return {
        allergy,
        proposedDrug,
        crossReactivityFound: true,
        riskLevel: 'high',
        riskPercent: '100%',
        evidence: 'Proposed drug is in the same class as the known allergy.',
        recommendation: `AVOID: ${proposedDrug} is in the same drug class (${entry.allergyClass}) as the known allergy.`,
        safeAlternatives: [],
        allergyClass: entry.allergyClass,
        targetClass: entry.allergyClass,
      };
    }
  }

  return null;
}

/**
 * Check all allergies against all proposed medications
 */
export function checkAllCrossReactivities(
  allergies: string[],
  medications: string[]
): {
  alerts: Array<{
    allergy: string;
    drug: string;
    riskLevel: string;
    riskPercent: string;
    recommendation: string;
    safeAlternatives: string[];
  }>;
  safeMedications: string[];
  summary: string;
} {
  const alerts: Array<{
    allergy: string;
    drug: string;
    riskLevel: string;
    riskPercent: string;
    recommendation: string;
    safeAlternatives: string[];
  }> = [];
  const flaggedDrugs = new Set<string>();

  for (const allergy of allergies) {
    for (const med of medications) {
      const result = checkCrossReactivity(allergy, med);
      if (result && result.crossReactivityFound) {
        alerts.push({
          allergy: result.allergy,
          drug: result.proposedDrug,
          riskLevel: result.riskLevel,
          riskPercent: result.riskPercent,
          recommendation: result.recommendation,
          safeAlternatives: result.safeAlternatives,
        });
        flaggedDrugs.add(med.toLowerCase());
      }
    }
  }

  const safeMedications = medications.filter(m => !flaggedDrugs.has(m.toLowerCase()));

  let summary = `Cross-reactivity check: ${allergies.length} allergy(ies) × ${medications.length} medication(s).`;
  if (alerts.length === 0) {
    summary += ' No cross-reactivity concerns identified.';
  } else {
    const high = alerts.filter(a => a.riskLevel === 'high');
    const moderate = alerts.filter(a => a.riskLevel === 'moderate');
    if (high.length > 0) summary += ` HIGH RISK: ${high.map(a => a.drug).join(', ')}.`;
    if (moderate.length > 0) summary += ` MODERATE RISK: ${moderate.map(a => a.drug).join(', ')}.`;
  }

  return { alerts, safeMedications, summary };
}

/**
 * List all allergy classes in the database
 */
export function listAllergyClasses(): Array<{ allergyClass: string; drugs: string[] }> {
  return crossReactivityDatabase.map(e => ({
    allergyClass: e.allergyClass,
    drugs: e.drugs,
  }));
}

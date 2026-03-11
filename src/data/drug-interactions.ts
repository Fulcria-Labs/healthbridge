/**
 * Drug interaction database with severity levels and clinical descriptions.
 * Based on well-established pharmacological interactions.
 * Uses generic/brand name mappings for comprehensive matching.
 */

export type Severity = 'contraindicated' | 'major' | 'moderate' | 'minor';

export interface DrugInteraction {
  drug1: string;
  drug2: string;
  severity: Severity;
  description: string;
  mechanism: string;
  clinicalEffect: string;
  management: string;
}

export interface DrugInfo {
  genericName: string;
  brandNames: string[];
  drugClass: string;
}

// Common drug name mappings (generic -> brand names and class)
export const drugDirectory: Record<string, DrugInfo> = {
  warfarin: { genericName: 'warfarin', brandNames: ['coumadin', 'jantoven'], drugClass: 'anticoagulant' },
  aspirin: { genericName: 'aspirin', brandNames: ['bayer', 'ecotrin'], drugClass: 'nsaid/antiplatelet' },
  ibuprofen: { genericName: 'ibuprofen', brandNames: ['advil', 'motrin'], drugClass: 'nsaid' },
  naproxen: { genericName: 'naproxen', brandNames: ['aleve', 'naprosyn'], drugClass: 'nsaid' },
  metformin: { genericName: 'metformin', brandNames: ['glucophage'], drugClass: 'biguanide' },
  lisinopril: { genericName: 'lisinopril', brandNames: ['prinivil', 'zestril'], drugClass: 'ace-inhibitor' },
  enalapril: { genericName: 'enalapril', brandNames: ['vasotec'], drugClass: 'ace-inhibitor' },
  losartan: { genericName: 'losartan', brandNames: ['cozaar'], drugClass: 'arb' },
  amlodipine: { genericName: 'amlodipine', brandNames: ['norvasc'], drugClass: 'calcium-channel-blocker' },
  metoprolol: { genericName: 'metoprolol', brandNames: ['lopressor', 'toprol'], drugClass: 'beta-blocker' },
  atenolol: { genericName: 'atenolol', brandNames: ['tenormin'], drugClass: 'beta-blocker' },
  simvastatin: { genericName: 'simvastatin', brandNames: ['zocor'], drugClass: 'statin' },
  atorvastatin: { genericName: 'atorvastatin', brandNames: ['lipitor'], drugClass: 'statin' },
  omeprazole: { genericName: 'omeprazole', brandNames: ['prilosec'], drugClass: 'ppi' },
  pantoprazole: { genericName: 'pantoprazole', brandNames: ['protonix'], drugClass: 'ppi' },
  clopidogrel: { genericName: 'clopidogrel', brandNames: ['plavix'], drugClass: 'antiplatelet' },
  fluoxetine: { genericName: 'fluoxetine', brandNames: ['prozac'], drugClass: 'ssri' },
  sertraline: { genericName: 'sertraline', brandNames: ['zoloft'], drugClass: 'ssri' },
  paroxetine: { genericName: 'paroxetine', brandNames: ['paxil'], drugClass: 'ssri' },
  ciprofloxacin: { genericName: 'ciprofloxacin', brandNames: ['cipro'], drugClass: 'fluoroquinolone' },
  amoxicillin: { genericName: 'amoxicillin', brandNames: ['amoxil'], drugClass: 'penicillin' },
  azithromycin: { genericName: 'azithromycin', brandNames: ['zithromax', 'z-pack'], drugClass: 'macrolide' },
  clarithromycin: { genericName: 'clarithromycin', brandNames: ['biaxin'], drugClass: 'macrolide' },
  erythromycin: { genericName: 'erythromycin', brandNames: ['erythrocin'], drugClass: 'macrolide' },
  tramadol: { genericName: 'tramadol', brandNames: ['ultram'], drugClass: 'opioid' },
  hydrocodone: { genericName: 'hydrocodone', brandNames: ['vicodin', 'norco'], drugClass: 'opioid' },
  oxycodone: { genericName: 'oxycodone', brandNames: ['oxycontin', 'percocet'], drugClass: 'opioid' },
  phenelzine: { genericName: 'phenelzine', brandNames: ['nardil'], drugClass: 'maoi' },
  tranylcypromine: { genericName: 'tranylcypromine', brandNames: ['parnate'], drugClass: 'maoi' },
  lithium: { genericName: 'lithium', brandNames: ['lithobid', 'eskalith'], drugClass: 'mood-stabilizer' },
  digoxin: { genericName: 'digoxin', brandNames: ['lanoxin'], drugClass: 'cardiac-glycoside' },
  potassium: { genericName: 'potassium chloride', brandNames: ['k-dur', 'klor-con'], drugClass: 'electrolyte' },
  spironolactone: { genericName: 'spironolactone', brandNames: ['aldactone'], drugClass: 'potassium-sparing-diuretic' },
  furosemide: { genericName: 'furosemide', brandNames: ['lasix'], drugClass: 'loop-diuretic' },
  hydrochlorothiazide: { genericName: 'hydrochlorothiazide', brandNames: ['microzide'], drugClass: 'thiazide-diuretic' },
  sildenafil: { genericName: 'sildenafil', brandNames: ['viagra', 'revatio'], drugClass: 'pde5-inhibitor' },
  nitroglycerin: { genericName: 'nitroglycerin', brandNames: ['nitrostat', 'nitro-dur'], drugClass: 'nitrate' },
  isosorbide: { genericName: 'isosorbide mononitrate', brandNames: ['imdur', 'isordil'], drugClass: 'nitrate' },
  ketoconazole: { genericName: 'ketoconazole', brandNames: ['nizoral'], drugClass: 'azole-antifungal' },
  rifampin: { genericName: 'rifampin', brandNames: ['rifadin'], drugClass: 'rifamycin' },
  carbamazepine: { genericName: 'carbamazepine', brandNames: ['tegretol'], drugClass: 'anticonvulsant' },
  phenytoin: { genericName: 'phenytoin', brandNames: ['dilantin'], drugClass: 'anticonvulsant' },
  verapamil: { genericName: 'verapamil', brandNames: ['calan', 'verelan'], drugClass: 'calcium-channel-blocker' },
  diltiazem: { genericName: 'diltiazem', brandNames: ['cardizem', 'tiazac'], drugClass: 'calcium-channel-blocker' },
  allopurinol: { genericName: 'allopurinol', brandNames: ['zyloprim'], drugClass: 'xanthine-oxidase-inhibitor' },
  azathioprine: { genericName: 'azathioprine', brandNames: ['imuran'], drugClass: 'immunosuppressant' },
  cyclosporine: { genericName: 'cyclosporine', brandNames: ['neoral', 'sandimmune'], drugClass: 'immunosuppressant' },
  methotrexate: { genericName: 'methotrexate', brandNames: ['trexall'], drugClass: 'antimetabolite' },
};

// Drug interaction database
export const drugInteractions: DrugInteraction[] = [
  // Anticoagulant interactions
  {
    drug1: 'warfarin', drug2: 'aspirin', severity: 'major',
    description: 'Increased risk of bleeding',
    mechanism: 'Additive anticoagulant and antiplatelet effects',
    clinicalEffect: 'Significantly elevated bleeding risk including GI and intracranial hemorrhage',
    management: 'Avoid combination unless specifically indicated. Monitor INR closely if used together. Watch for signs of bleeding.'
  },
  {
    drug1: 'warfarin', drug2: 'ibuprofen', severity: 'major',
    description: 'Increased risk of GI bleeding and elevated INR',
    mechanism: 'NSAIDs inhibit platelet function and can cause GI erosion; some NSAIDs displace warfarin from protein binding',
    clinicalEffect: 'Significantly increased risk of GI bleeding and potential for supratherapeutic INR',
    management: 'Avoid NSAIDs if possible. Use acetaminophen for pain. If NSAID required, use lowest dose for shortest duration with PPI protection.'
  },
  {
    drug1: 'warfarin', drug2: 'naproxen', severity: 'major',
    description: 'Increased risk of GI bleeding and elevated INR',
    mechanism: 'NSAIDs inhibit platelet function and cause GI erosion',
    clinicalEffect: 'Significantly increased risk of GI bleeding',
    management: 'Avoid NSAIDs if possible. Use acetaminophen for pain. If NSAID required, add PPI protection.'
  },
  {
    drug1: 'warfarin', drug2: 'fluoxetine', severity: 'major',
    description: 'Increased anticoagulant effect and bleeding risk',
    mechanism: 'SSRIs inhibit platelet aggregation and fluoxetine inhibits CYP2C9 metabolism of warfarin',
    clinicalEffect: 'Elevated INR and increased bleeding risk',
    management: 'Monitor INR more frequently when starting/stopping SSRI. Consider dose adjustment.'
  },
  {
    drug1: 'warfarin', drug2: 'sertraline', severity: 'moderate',
    description: 'Increased bleeding risk',
    mechanism: 'SSRIs inhibit platelet serotonin uptake, impairing platelet aggregation',
    clinicalEffect: 'Modestly increased bleeding risk',
    management: 'Monitor for signs of bleeding. Check INR when starting or adjusting SSRI dose.'
  },
  {
    drug1: 'warfarin', drug2: 'ciprofloxacin', severity: 'major',
    description: 'Significantly increased anticoagulant effect',
    mechanism: 'Ciprofloxacin inhibits CYP1A2 and CYP3A4, reducing warfarin metabolism',
    clinicalEffect: 'Markedly elevated INR with bleeding risk',
    management: 'Monitor INR within 2-3 days of starting ciprofloxacin. May need 25-50% warfarin dose reduction.'
  },
  {
    drug1: 'warfarin', drug2: 'rifampin', severity: 'contraindicated',
    description: 'Dramatically reduced anticoagulant effect',
    mechanism: 'Rifampin is a potent CYP inducer that massively increases warfarin clearance',
    clinicalEffect: 'Loss of anticoagulation with risk of thromboembolic events',
    management: 'Avoid combination. If unavoidable, may need 2-5x warfarin dose increase with very frequent INR monitoring.'
  },
  // SSRI + MAOI
  {
    drug1: 'fluoxetine', drug2: 'phenelzine', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Combined serotonergic activity from SSRI and MAOI causes excessive serotonin',
    clinicalEffect: 'Life-threatening serotonin syndrome: hyperthermia, rigidity, myoclonus, autonomic instability, mental status changes',
    management: 'NEVER combine. Allow 5-week washout after fluoxetine before starting MAOI (2 weeks for other SSRIs). Allow 2 weeks after MAOI before starting SSRI.'
  },
  {
    drug1: 'sertraline', drug2: 'phenelzine', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Combined serotonergic activity',
    clinicalEffect: 'Life-threatening serotonin syndrome',
    management: 'NEVER combine. Allow 2-week washout between agents.'
  },
  {
    drug1: 'paroxetine', drug2: 'phenelzine', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Combined serotonergic activity',
    clinicalEffect: 'Life-threatening serotonin syndrome',
    management: 'NEVER combine. Allow 2-week washout between agents.'
  },
  {
    drug1: 'tramadol', drug2: 'phenelzine', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome and seizures',
    mechanism: 'Tramadol inhibits serotonin reuptake; combined with MAOI causes serotonin excess',
    clinicalEffect: 'Serotonin syndrome and lowered seizure threshold',
    management: 'NEVER combine. Use alternative analgesics.'
  },
  // Opioid + SSRI serotonin risk
  {
    drug1: 'tramadol', drug2: 'fluoxetine', severity: 'major',
    description: 'Increased risk of serotonin syndrome and seizures',
    mechanism: 'Both agents increase serotonin; fluoxetine also inhibits CYP2D6 metabolism of tramadol',
    clinicalEffect: 'Risk of serotonin syndrome and reduced tramadol efficacy with increased seizure risk',
    management: 'Use alternative analgesic if possible. Monitor for serotonin syndrome symptoms.'
  },
  {
    drug1: 'tramadol', drug2: 'sertraline', severity: 'major',
    description: 'Increased risk of serotonin syndrome and seizures',
    mechanism: 'Additive serotonergic effects',
    clinicalEffect: 'Risk of serotonin syndrome',
    management: 'Use alternative analgesic if possible. Monitor closely.'
  },
  // Nitrate + PDE5 inhibitor
  {
    drug1: 'sildenafil', drug2: 'nitroglycerin', severity: 'contraindicated',
    description: 'Severe hypotension',
    mechanism: 'Both agents cause vasodilation via nitric oxide/cGMP pathway',
    clinicalEffect: 'Potentially fatal hypotension, cardiovascular collapse',
    management: 'NEVER combine. Allow at least 24 hours (48 hours for tadalafil) between agents.'
  },
  {
    drug1: 'sildenafil', drug2: 'isosorbide', severity: 'contraindicated',
    description: 'Severe hypotension',
    mechanism: 'Synergistic vasodilation via nitric oxide pathway',
    clinicalEffect: 'Potentially fatal hypotension',
    management: 'NEVER combine.'
  },
  // ACE-inhibitor + potassium-sparing diuretic
  {
    drug1: 'lisinopril', drug2: 'spironolactone', severity: 'major',
    description: 'Risk of hyperkalemia',
    mechanism: 'Both agents reduce potassium excretion',
    clinicalEffect: 'Dangerous hyperkalemia potentially causing cardiac arrhythmias',
    management: 'Monitor potassium closely. Avoid potassium supplements. Consider lower doses.'
  },
  {
    drug1: 'lisinopril', drug2: 'potassium', severity: 'major',
    description: 'Risk of hyperkalemia',
    mechanism: 'ACE inhibitors reduce aldosterone-mediated potassium excretion',
    clinicalEffect: 'Hyperkalemia with cardiac risk',
    management: 'Monitor serum potassium. Use potassium supplements only if documented hypokalemia.'
  },
  {
    drug1: 'enalapril', drug2: 'spironolactone', severity: 'major',
    description: 'Risk of hyperkalemia',
    mechanism: 'Both agents reduce potassium excretion',
    clinicalEffect: 'Dangerous hyperkalemia',
    management: 'Monitor potassium closely. Avoid potassium supplements.'
  },
  // Statin interactions
  {
    drug1: 'simvastatin', drug2: 'clarithromycin', severity: 'contraindicated',
    description: 'Increased risk of rhabdomyolysis',
    mechanism: 'Clarithromycin strongly inhibits CYP3A4, dramatically increasing simvastatin levels',
    clinicalEffect: 'Rhabdomyolysis, myopathy, acute renal failure',
    management: 'Suspend simvastatin during clarithromycin course. Use azithromycin as alternative macrolide.'
  },
  {
    drug1: 'simvastatin', drug2: 'erythromycin', severity: 'contraindicated',
    description: 'Increased risk of rhabdomyolysis',
    mechanism: 'Erythromycin inhibits CYP3A4, increasing simvastatin exposure',
    clinicalEffect: 'Rhabdomyolysis and myopathy',
    management: 'Suspend simvastatin during erythromycin course or use alternative statin/antibiotic.'
  },
  {
    drug1: 'simvastatin', drug2: 'verapamil', severity: 'major',
    description: 'Increased risk of myopathy',
    mechanism: 'Verapamil inhibits CYP3A4 and P-glycoprotein, increasing simvastatin levels',
    clinicalEffect: 'Myopathy and rhabdomyolysis risk',
    management: 'Limit simvastatin to 10 mg/day with verapamil. Consider alternative statin.'
  },
  {
    drug1: 'simvastatin', drug2: 'diltiazem', severity: 'major',
    description: 'Increased risk of myopathy',
    mechanism: 'Diltiazem inhibits CYP3A4, increasing simvastatin levels',
    clinicalEffect: 'Myopathy and rhabdomyolysis risk',
    management: 'Limit simvastatin to 10 mg/day with diltiazem. Consider pravastatin or rosuvastatin.'
  },
  {
    drug1: 'simvastatin', drug2: 'ketoconazole', severity: 'contraindicated',
    description: 'Dramatically increased statin levels',
    mechanism: 'Ketoconazole is a potent CYP3A4 inhibitor',
    clinicalEffect: 'High risk of rhabdomyolysis',
    management: 'Do not use together. Choose alternative antifungal or alternative statin (pravastatin, rosuvastatin).'
  },
  {
    drug1: 'simvastatin', drug2: 'cyclosporine', severity: 'contraindicated',
    description: 'Dramatically increased statin levels',
    mechanism: 'Cyclosporine inhibits CYP3A4 and OATP1B1 transport',
    clinicalEffect: 'Very high risk of rhabdomyolysis',
    management: 'Do not combine. If statin needed, use pravastatin at reduced dose.'
  },
  // Clopidogrel + PPI
  {
    drug1: 'clopidogrel', drug2: 'omeprazole', severity: 'major',
    description: 'Reduced antiplatelet effect of clopidogrel',
    mechanism: 'Omeprazole inhibits CYP2C19, blocking conversion of clopidogrel to active metabolite',
    clinicalEffect: 'Reduced platelet inhibition, increased risk of cardiovascular events',
    management: 'Use pantoprazole or famotidine instead of omeprazole. Separate dosing by 12 hours if PPI necessary.'
  },
  // Methotrexate + NSAIDs
  {
    drug1: 'methotrexate', drug2: 'ibuprofen', severity: 'major',
    description: 'Increased methotrexate toxicity',
    mechanism: 'NSAIDs reduce renal clearance of methotrexate',
    clinicalEffect: 'Methotrexate accumulation causing pancytopenia, mucositis, hepatotoxicity, nephrotoxicity',
    management: 'Avoid NSAIDs with high-dose methotrexate. With low-dose MTX, use with caution and monitor CBC.'
  },
  {
    drug1: 'methotrexate', drug2: 'naproxen', severity: 'major',
    description: 'Increased methotrexate toxicity',
    mechanism: 'NSAIDs reduce renal clearance of methotrexate',
    clinicalEffect: 'Methotrexate accumulation and toxicity',
    management: 'Avoid combination. If needed, monitor methotrexate levels and CBC closely.'
  },
  // Allopurinol + Azathioprine
  {
    drug1: 'allopurinol', drug2: 'azathioprine', severity: 'contraindicated',
    description: 'Severe myelosuppression',
    mechanism: 'Allopurinol inhibits xanthine oxidase, blocking azathioprine/6-MP metabolism',
    clinicalEffect: 'Dramatically increased azathioprine levels causing life-threatening bone marrow suppression',
    management: 'If combination unavoidable, reduce azathioprine dose by 67-75% with close CBC monitoring.'
  },
  // Digoxin interactions
  {
    drug1: 'digoxin', drug2: 'verapamil', severity: 'major',
    description: 'Increased digoxin levels and AV block risk',
    mechanism: 'Verapamil inhibits P-glycoprotein efflux of digoxin and both depress AV conduction',
    clinicalEffect: 'Digoxin toxicity and excessive bradycardia/AV block',
    management: 'Reduce digoxin dose by 50% when starting verapamil. Monitor digoxin levels and heart rate.'
  },
  {
    drug1: 'digoxin', drug2: 'amiodarone', severity: 'major',
    description: 'Increased digoxin levels',
    mechanism: 'Amiodarone inhibits P-glycoprotein and renal clearance of digoxin',
    clinicalEffect: 'Digoxin toxicity (nausea, arrhythmias, visual changes)',
    management: 'Reduce digoxin dose by 50%. Monitor digoxin levels within 1 week.'
  },
  // Lithium interactions
  {
    drug1: 'lithium', drug2: 'ibuprofen', severity: 'major',
    description: 'Increased lithium levels',
    mechanism: 'NSAIDs reduce renal prostaglandin synthesis, decreasing lithium clearance',
    clinicalEffect: 'Lithium toxicity (tremor, confusion, seizures, renal failure)',
    management: 'Avoid NSAIDs if possible. If necessary, monitor lithium levels within 5 days and adjust dose.'
  },
  {
    drug1: 'lithium', drug2: 'lisinopril', severity: 'major',
    description: 'Increased lithium levels',
    mechanism: 'ACE inhibitors reduce renal lithium clearance',
    clinicalEffect: 'Lithium toxicity',
    management: 'Monitor lithium levels closely when starting/stopping ACE inhibitor. May need dose reduction.'
  },
  {
    drug1: 'lithium', drug2: 'hydrochlorothiazide', severity: 'major',
    description: 'Increased lithium levels',
    mechanism: 'Thiazide diuretics increase sodium-dependent lithium reabsorption in proximal tubule',
    clinicalEffect: 'Lithium toxicity - can increase levels by 25-40%',
    management: 'Reduce lithium dose by 25-50% when starting thiazide. Monitor lithium levels frequently.'
  },
  // Beta-blocker + calcium channel blocker
  {
    drug1: 'metoprolol', drug2: 'verapamil', severity: 'major',
    description: 'Excessive bradycardia and heart block',
    mechanism: 'Both agents depress SA and AV node conduction',
    clinicalEffect: 'Severe bradycardia, AV block, heart failure exacerbation',
    management: 'Avoid IV combination. Oral combination requires careful monitoring. Use dihydropyridine CCB (amlodipine) instead.'
  },
  {
    drug1: 'metoprolol', drug2: 'diltiazem', severity: 'major',
    description: 'Excessive bradycardia and heart block',
    mechanism: 'Both agents depress cardiac conduction',
    clinicalEffect: 'Bradycardia, AV block, possible heart failure',
    management: 'Monitor heart rate closely. Use dihydropyridine CCB (amlodipine) as safer alternative.'
  },
  // Metformin + contrast
  {
    drug1: 'metformin', drug2: 'ciprofloxacin', severity: 'moderate',
    description: 'Altered glucose control',
    mechanism: 'Fluoroquinolones can cause both hypo- and hyperglycemia',
    clinicalEffect: 'Unpredictable blood glucose changes',
    management: 'Monitor blood glucose more frequently during fluoroquinolone therapy.'
  },
  // Phenytoin + carbamazepine
  {
    drug1: 'phenytoin', drug2: 'carbamazepine', severity: 'major',
    description: 'Complex bidirectional interaction',
    mechanism: 'Both are CYP3A4 inducers and substrates; mutual enzyme induction',
    clinicalEffect: 'Unpredictable changes in levels of both drugs, potential loss of seizure control or toxicity',
    management: 'Monitor levels of both drugs frequently. Adjust doses based on clinical response and drug levels.'
  },
];

/**
 * Resolve a drug name (generic or brand) to its generic name
 */
export function resolveToGeneric(drugName: string): string | null {
  const normalized = drugName.toLowerCase().trim();

  // Check if it's already a generic name
  if (drugDirectory[normalized]) {
    return normalized;
  }

  // Check brand names
  for (const [generic, info] of Object.entries(drugDirectory)) {
    if (info.brandNames.includes(normalized)) {
      return generic;
    }
  }

  return null;
}

/**
 * Check if two drug classes interact (class-level interactions)
 */
export function getClassInteractions(class1: string, class2: string): DrugInteraction[] {
  return drugInteractions.filter(interaction => {
    const info1 = drugDirectory[interaction.drug1];
    const info2 = drugDirectory[interaction.drug2];
    if (!info1 || !info2) return false;
    return (info1.drugClass === class1 && info2.drugClass === class2) ||
           (info1.drugClass === class2 && info2.drugClass === class1);
  });
}

/**
 * Find interactions between two specific drugs
 */
export function findInteraction(drug1: string, drug2: string): DrugInteraction | null {
  const generic1 = resolveToGeneric(drug1);
  const generic2 = resolveToGeneric(drug2);

  if (!generic1 || !generic2) return null;

  return drugInteractions.find(
    interaction =>
      (interaction.drug1 === generic1 && interaction.drug2 === generic2) ||
      (interaction.drug1 === generic2 && interaction.drug2 === generic1)
  ) ?? null;
}

/**
 * Find all interactions for a list of medications
 */
export function findAllInteractions(medications: string[]): Array<DrugInteraction & { inputDrug1: string; inputDrug2: string }> {
  const results: Array<DrugInteraction & { inputDrug1: string; inputDrug2: string }> = [];

  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const interaction = findInteraction(medications[i], medications[j]);
      if (interaction) {
        results.push({
          ...interaction,
          inputDrug1: medications[i],
          inputDrug2: medications[j],
        });
      }
    }
  }

  // Sort by severity
  const severityOrder: Record<Severity, number> = {
    contraindicated: 0,
    major: 1,
    moderate: 2,
    minor: 3,
  };

  results.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return results;
}

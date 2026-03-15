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
  amiodarone: { genericName: 'amiodarone', brandNames: ['cordarone', 'pacerone'], drugClass: 'antiarrhythmic' },
  sumatriptan: { genericName: 'sumatriptan', brandNames: ['imitrex'], drugClass: 'triptan' },
  metronidazole: { genericName: 'metronidazole', brandNames: ['flagyl'], drugClass: 'nitroimidazole' },
  prednisone: { genericName: 'prednisone', brandNames: ['deltasone', 'rayos'], drugClass: 'corticosteroid' },
  dextromethorphan: { genericName: 'dextromethorphan', brandNames: ['delsym', 'robitussin'], drugClass: 'antitussive' },
  tadalafil: { genericName: 'tadalafil', brandNames: ['cialis', 'adcirca'], drugClass: 'pde5-inhibitor' },
  duloxetine: { genericName: 'duloxetine', brandNames: ['cymbalta'], drugClass: 'snri' },
  gabapentin: { genericName: 'gabapentin', brandNames: ['neurontin', 'gralise'], drugClass: 'gabapentinoid' },
  pregabalin: { genericName: 'pregabalin', brandNames: ['lyrica'], drugClass: 'gabapentinoid' },
  rosuvastatin: { genericName: 'rosuvastatin', brandNames: ['crestor'], drugClass: 'statin' },
  pravastatin: { genericName: 'pravastatin', brandNames: ['pravachol'], drugClass: 'statin' },
  apixaban: { genericName: 'apixaban', brandNames: ['eliquis'], drugClass: 'doac' },
  rivaroxaban: { genericName: 'rivaroxaban', brandNames: ['xarelto'], drugClass: 'doac' },
  dabigatran: { genericName: 'dabigatran', brandNames: ['pradaxa'], drugClass: 'doac' },
  edoxaban: { genericName: 'edoxaban', brandNames: ['savaysa'], drugClass: 'doac' },
  // HIV antivirals
  ritonavir: { genericName: 'ritonavir', brandNames: ['norvir'], drugClass: 'protease-inhibitor' },
  atazanavir: { genericName: 'atazanavir', brandNames: ['reyataz'], drugClass: 'protease-inhibitor' },
  lopinavir: { genericName: 'lopinavir', brandNames: ['kaletra'], drugClass: 'protease-inhibitor' },
  // Immunosuppressants
  tacrolimus: { genericName: 'tacrolimus', brandNames: ['prograf', 'envarsus'], drugClass: 'immunosuppressant' },
  mycophenolate: { genericName: 'mycophenolate', brandNames: ['cellcept', 'myfortic'], drugClass: 'immunosuppressant' },
  // Antipsychotics
  haloperidol: { genericName: 'haloperidol', brandNames: ['haldol'], drugClass: 'antipsychotic' },
  quetiapine: { genericName: 'quetiapine', brandNames: ['seroquel'], drugClass: 'atypical-antipsychotic' },
  ziprasidone: { genericName: 'ziprasidone', brandNames: ['geodon'], drugClass: 'atypical-antipsychotic' },
  aripiprazole: { genericName: 'aripiprazole', brandNames: ['abilify'], drugClass: 'atypical-antipsychotic' },
  olanzapine: { genericName: 'olanzapine', brandNames: ['zyprexa'], drugClass: 'atypical-antipsychotic' },
  // Benzodiazepines
  alprazolam: { genericName: 'alprazolam', brandNames: ['xanax'], drugClass: 'benzodiazepine' },
  diazepam: { genericName: 'diazepam', brandNames: ['valium'], drugClass: 'benzodiazepine' },
  lorazepam: { genericName: 'lorazepam', brandNames: ['ativan'], drugClass: 'benzodiazepine' },
  midazolam: { genericName: 'midazolam', brandNames: ['versed'], drugClass: 'benzodiazepine' },
  // Muscle relaxants
  cyclobenzaprine: { genericName: 'cyclobenzaprine', brandNames: ['flexeril', 'amrix'], drugClass: 'muscle-relaxant' },
  baclofen: { genericName: 'baclofen', brandNames: ['lioresal', 'gablofen'], drugClass: 'muscle-relaxant' },
  // Additional cardiovascular
  sotalol: { genericName: 'sotalol', brandNames: ['betapace'], drugClass: 'antiarrhythmic' },
  dofetilide: { genericName: 'dofetilide', brandNames: ['tikosyn'], drugClass: 'antiarrhythmic' },
  dronedarone: { genericName: 'dronedarone', brandNames: ['multaq'], drugClass: 'antiarrhythmic' },
  // Fluoroquinolones
  levofloxacin: { genericName: 'levofloxacin', brandNames: ['levaquin'], drugClass: 'fluoroquinolone' },
  moxifloxacin: { genericName: 'moxifloxacin', brandNames: ['avelox'], drugClass: 'fluoroquinolone' },
  // Antacids / minerals
  calcium_carbonate: { genericName: 'calcium carbonate', brandNames: ['tums', 'caltrate'], drugClass: 'antacid' },
  aluminum_hydroxide: { genericName: 'aluminum hydroxide', brandNames: ['maalox', 'alternagel'], drugClass: 'antacid' },
  magnesium_hydroxide: { genericName: 'magnesium hydroxide', brandNames: ['milk of magnesia'], drugClass: 'antacid' },
  // Insulin
  insulin: { genericName: 'insulin', brandNames: ['humalog', 'novolog', 'lantus', 'levemir'], drugClass: 'insulin' },
  // Anticoagulant
  heparin: { genericName: 'heparin', brandNames: ['hep-lock'], drugClass: 'anticoagulant' },
  enoxaparin: { genericName: 'enoxaparin', brandNames: ['lovenox'], drugClass: 'lmwh' },
  // Antidepressants
  venlafaxine: { genericName: 'venlafaxine', brandNames: ['effexor'], drugClass: 'snri' },
  citalopram: { genericName: 'citalopram', brandNames: ['celexa'], drugClass: 'ssri' },
  escitalopram: { genericName: 'escitalopram', brandNames: ['lexapro'], drugClass: 'ssri' },
  trazodone: { genericName: 'trazodone', brandNames: ['desyrel', 'oleptro'], drugClass: 'sari' },
  // Opioids
  morphine: { genericName: 'morphine', brandNames: ['ms contin', 'kadian'], drugClass: 'opioid' },
  fentanyl: { genericName: 'fentanyl', brandNames: ['duragesic', 'sublimaze'], drugClass: 'opioid' },
  codeine: { genericName: 'codeine', brandNames: ['tylenol with codeine'], drugClass: 'opioid' },
  methadone: { genericName: 'methadone', brandNames: ['dolophine', 'methadose'], drugClass: 'opioid' },
  // Miscellaneous
  fluconazole: { genericName: 'fluconazole', brandNames: ['diflucan'], drugClass: 'azole-antifungal' },
  itraconazole: { genericName: 'itraconazole', brandNames: ['sporanox'], drugClass: 'azole-antifungal' },
  linezolid: { genericName: 'linezolid', brandNames: ['zyvox'], drugClass: 'oxazolidinone' },
  ondansetron: { genericName: 'ondansetron', brandNames: ['zofran'], drugClass: 'antiemetic' },
  domperidone: { genericName: 'domperidone', brandNames: ['motilium'], drugClass: 'antiemetic' },
  levothyroxine: { genericName: 'levothyroxine', brandNames: ['synthroid', 'levoxyl'], drugClass: 'thyroid-hormone' },
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
  // ACE inhibitor + NSAID (renal)
  {
    drug1: 'lisinopril', drug2: 'ibuprofen', severity: 'moderate',
    description: 'Reduced antihypertensive effect and risk of acute kidney injury',
    mechanism: 'NSAIDs inhibit renal prostaglandins, reducing renal blood flow and opposing ACE inhibitor hemodynamic effects',
    clinicalEffect: 'Decreased blood pressure control, increased risk of acute kidney injury, hyperkalemia',
    management: 'Monitor blood pressure and renal function. Use lowest NSAID dose for shortest duration. Consider acetaminophen.'
  },
  {
    drug1: 'lisinopril', drug2: 'naproxen', severity: 'moderate',
    description: 'Reduced antihypertensive effect and renal risk',
    mechanism: 'NSAIDs reduce renal prostaglandin synthesis',
    clinicalEffect: 'Attenuated blood pressure control and risk of renal impairment',
    management: 'Monitor BP and renal function. Prefer acetaminophen for pain relief.'
  },
  // ACE + ARB (dual RAAS blockade)
  {
    drug1: 'lisinopril', drug2: 'losartan', severity: 'major',
    description: 'Dual RAAS blockade increases adverse events',
    mechanism: 'Both block the renin-angiotensin system at different points',
    clinicalEffect: 'Increased risk of hyperkalemia, hypotension, and renal failure without mortality benefit',
    management: 'Avoid dual RAAS blockade. ONTARGET trial showed no benefit with increased adverse events.'
  },
  // Warfarin + metronidazole
  {
    drug1: 'warfarin', drug2: 'metronidazole', severity: 'major',
    description: 'Significantly increased anticoagulant effect',
    mechanism: 'Metronidazole inhibits CYP2C9 metabolism of S-warfarin',
    clinicalEffect: 'Markedly elevated INR with high bleeding risk',
    management: 'Monitor INR within 2-3 days of starting metronidazole. Reduce warfarin dose by 25-50% empirically.'
  },
  // Warfarin + azithromycin
  {
    drug1: 'warfarin', drug2: 'azithromycin', severity: 'moderate',
    description: 'Potentially increased anticoagulant effect',
    mechanism: 'Azithromycin may alter gut flora affecting vitamin K production and modestly inhibit warfarin metabolism',
    clinicalEffect: 'Modestly elevated INR',
    management: 'Monitor INR during and after azithromycin course. Usually less significant than other macrolides.'
  },
  // Atorvastatin + clarithromycin
  {
    drug1: 'atorvastatin', drug2: 'clarithromycin', severity: 'major',
    description: 'Increased risk of myopathy and rhabdomyolysis',
    mechanism: 'Clarithromycin inhibits CYP3A4, increasing atorvastatin levels',
    clinicalEffect: 'Elevated statin levels with risk of myopathy and rhabdomyolysis',
    management: 'Suspend atorvastatin during clarithromycin course or use azithromycin as alternative. If statin needed, use pravastatin or rosuvastatin.'
  },
  // Digoxin + furosemide
  {
    drug1: 'digoxin', drug2: 'furosemide', severity: 'major',
    description: 'Increased digoxin toxicity risk due to hypokalemia',
    mechanism: 'Loop diuretics cause potassium and magnesium wasting, increasing myocardial sensitivity to digoxin',
    clinicalEffect: 'Digoxin toxicity (arrhythmias, nausea, visual changes) at therapeutic digoxin levels',
    management: 'Monitor potassium and magnesium. Supplement as needed. Consider potassium-sparing diuretic. Check digoxin levels.'
  },
  // SSRI + triptan (serotonin syndrome)
  {
    drug1: 'fluoxetine', drug2: 'sumatriptan', severity: 'moderate',
    description: 'Potential risk of serotonin syndrome',
    mechanism: 'Triptans are 5-HT1B/1D agonists; combined with SSRI serotonergic effect may cause serotonin excess',
    clinicalEffect: 'Risk of serotonin syndrome (FDA warning 2006, though clinical significance debated)',
    management: 'Use with caution. Educate patient on serotonin syndrome symptoms. Consider alternative migraine therapy.'
  },
  {
    drug1: 'sertraline', drug2: 'sumatriptan', severity: 'moderate',
    description: 'Potential risk of serotonin syndrome',
    mechanism: 'Additive serotonergic effects from SSRI and triptan',
    clinicalEffect: 'Potential serotonin syndrome risk',
    management: 'Use with caution. Monitor for serotonin syndrome symptoms. Lowest effective triptan dose.'
  },
  // SSRI + NSAID (bleeding risk)
  {
    drug1: 'fluoxetine', drug2: 'ibuprofen', severity: 'moderate',
    description: 'Increased risk of GI bleeding',
    mechanism: 'SSRIs deplete platelet serotonin, impairing aggregation; NSAIDs cause GI erosion and inhibit platelet COX-1',
    clinicalEffect: 'Significantly increased GI bleeding risk (3-15x depending on study)',
    management: 'Add PPI if combination needed. Use lowest NSAID dose. Monitor for GI bleeding symptoms.'
  },
  {
    drug1: 'sertraline', drug2: 'ibuprofen', severity: 'moderate',
    description: 'Increased risk of GI bleeding',
    mechanism: 'Additive antiplatelet effects and GI mucosal injury',
    clinicalEffect: 'Elevated GI bleeding risk',
    management: 'Consider PPI prophylaxis. Use acetaminophen when possible.'
  },
  // Dextromethorphan + SSRI
  {
    drug1: 'dextromethorphan', drug2: 'fluoxetine', severity: 'major',
    description: 'Risk of serotonin syndrome and increased dextromethorphan levels',
    mechanism: 'Fluoxetine inhibits CYP2D6 (dextromethorphan metabolism) and both agents increase serotonin',
    clinicalEffect: 'Serotonin syndrome and CNS toxicity from dextromethorphan accumulation',
    management: 'Avoid combination. Use alternative antitussive (benzonatate, guaifenesin).'
  },
  {
    drug1: 'dextromethorphan', drug2: 'phenelzine', severity: 'contraindicated',
    description: 'Life-threatening serotonin syndrome',
    mechanism: 'Dextromethorphan inhibits serotonin reuptake; MAOI prevents serotonin breakdown',
    clinicalEffect: 'Severe serotonin syndrome, hyperthermia, death reported',
    management: 'NEVER combine. Avoid dextromethorphan-containing products (many OTC cough medicines) with MAOIs.'
  },
  // Nitrate + tadalafil
  {
    drug1: 'tadalafil', drug2: 'nitroglycerin', severity: 'contraindicated',
    description: 'Severe hypotension',
    mechanism: 'Both agents cause vasodilation via nitric oxide/cGMP pathway',
    clinicalEffect: 'Potentially fatal hypotension, cardiovascular collapse',
    management: 'NEVER combine. Allow at least 48 hours after tadalafil (longer half-life than sildenafil) before nitrate use.'
  },
  {
    drug1: 'tadalafil', drug2: 'isosorbide', severity: 'contraindicated',
    description: 'Severe hypotension',
    mechanism: 'Synergistic vasodilation via nitric oxide pathway',
    clinicalEffect: 'Potentially fatal hypotension',
    management: 'NEVER combine. 48-hour washout required for tadalafil.'
  },
  // DOAC interactions
  {
    drug1: 'apixaban', drug2: 'ketoconazole', severity: 'major',
    description: 'Significantly increased apixaban levels',
    mechanism: 'Ketoconazole strongly inhibits CYP3A4 and P-glycoprotein, both involved in apixaban metabolism',
    clinicalEffect: 'Doubled apixaban exposure with markedly increased bleeding risk',
    management: 'Reduce apixaban dose by 50% or avoid combination. Use alternative antifungal.'
  },
  {
    drug1: 'rivaroxaban', drug2: 'ketoconazole', severity: 'contraindicated',
    description: 'Dramatically increased rivaroxaban levels',
    mechanism: 'Ketoconazole inhibits CYP3A4 and P-glycoprotein, both critical for rivaroxaban clearance',
    clinicalEffect: 'Increased rivaroxaban exposure by 150%+ with high bleeding risk',
    management: 'Avoid combination. Use alternative antifungal or alternative anticoagulant.'
  },
  {
    drug1: 'apixaban', drug2: 'rifampin', severity: 'contraindicated',
    description: 'Dramatically reduced apixaban levels',
    mechanism: 'Rifampin strongly induces CYP3A4 and P-glycoprotein, accelerating apixaban metabolism',
    clinicalEffect: 'Reduced apixaban levels by ~54%, loss of anticoagulant protection',
    management: 'Avoid combination. Use alternative antimycobacterial or switch to warfarin with dose adjustment.'
  },
  // Corticosteroid + NSAID
  {
    drug1: 'prednisone', drug2: 'ibuprofen', severity: 'moderate',
    description: 'Increased risk of GI bleeding and ulceration',
    mechanism: 'Both agents independently increase GI mucosal injury risk; corticosteroids impair mucosal healing',
    clinicalEffect: 'Significantly increased risk of peptic ulcer and GI hemorrhage',
    management: 'Add PPI prophylaxis if combination necessary. Monitor for GI symptoms. Use lowest doses for shortest duration.'
  },
  {
    drug1: 'prednisone', drug2: 'naproxen', severity: 'moderate',
    description: 'Increased risk of GI bleeding',
    mechanism: 'Additive GI mucosal injury',
    clinicalEffect: 'Elevated peptic ulcer and GI hemorrhage risk',
    management: 'PPI prophylaxis recommended. Monitor for GI bleeding.'
  },
  // SNRI interactions
  {
    drug1: 'duloxetine', drug2: 'phenelzine', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Combined serotonergic activity from SNRI and MAOI',
    clinicalEffect: 'Life-threatening serotonin syndrome',
    management: 'NEVER combine. Allow 5-day washout after duloxetine; 2-week washout after MAOI.'
  },
  {
    drug1: 'duloxetine', drug2: 'tramadol', severity: 'major',
    description: 'Increased risk of serotonin syndrome and seizures',
    mechanism: 'Both agents increase serotonin; duloxetine inhibits CYP2D6 metabolism of tramadol',
    clinicalEffect: 'Risk of serotonin syndrome and lowered seizure threshold',
    management: 'Use alternative analgesic. If combination necessary, use lowest doses with close monitoring.'
  },
  // Gabapentinoid + opioid
  {
    drug1: 'gabapentin', drug2: 'oxycodone', severity: 'major',
    description: 'Increased risk of CNS depression and respiratory failure',
    mechanism: 'Additive CNS depressant effects',
    clinicalEffect: 'Excessive sedation, respiratory depression, death (FDA boxed warning consideration)',
    management: 'If combination necessary, use lowest effective doses. Monitor respiratory status. Educate about sedation.'
  },
  {
    drug1: 'pregabalin', drug2: 'oxycodone', severity: 'major',
    description: 'Increased risk of CNS depression and respiratory failure',
    mechanism: 'Additive CNS depressant effects',
    clinicalEffect: 'Respiratory depression, excessive sedation',
    management: 'Use lowest effective doses. Monitor for respiratory depression. Consider non-opioid alternatives.'
  },
  // Cyclosporine + ketoconazole
  {
    drug1: 'cyclosporine', drug2: 'ketoconazole', severity: 'major',
    description: 'Significantly increased cyclosporine levels',
    mechanism: 'Ketoconazole inhibits CYP3A4 and P-glycoprotein, dramatically reducing cyclosporine clearance',
    clinicalEffect: 'Cyclosporine toxicity: nephrotoxicity, hypertension, neurotoxicity',
    management: 'Reduce cyclosporine dose by 50-80%. Monitor cyclosporine trough levels closely.'
  },
  // Warfarin + phenytoin
  {
    drug1: 'warfarin', drug2: 'phenytoin', severity: 'major',
    description: 'Complex bidirectional interaction affecting both drug levels',
    mechanism: 'Phenytoin induces warfarin metabolism (CYP2C9/3A4); warfarin may initially displace phenytoin from protein binding',
    clinicalEffect: 'Unpredictable changes in anticoagulation and seizure control',
    management: 'Monitor INR and phenytoin levels frequently when starting/stopping either drug. Adjust doses based on levels.'
  },
  // Lithium + furosemide
  {
    drug1: 'lithium', drug2: 'furosemide', severity: 'major',
    description: 'Increased lithium levels',
    mechanism: 'Loop diuretics cause sodium and water loss, leading to compensatory proximal tubule reabsorption of lithium',
    clinicalEffect: 'Lithium toxicity (tremor, confusion, seizures, renal failure)',
    management: 'Monitor lithium levels when starting/adjusting diuretic. Consider dose reduction. Maintain adequate hydration.'
  },
  // Rivaroxaban + rifampin
  {
    drug1: 'rivaroxaban', drug2: 'rifampin', severity: 'major',
    description: 'Reduced rivaroxaban efficacy',
    mechanism: 'Rifampin induces CYP3A4/P-gp, significantly reducing rivaroxaban levels',
    clinicalEffect: 'Subtherapeutic anticoagulation, increased thromboembolic risk',
    management: 'Avoid combination. Switch to warfarin with INR monitoring if rifampin required.'
  },
  // Gabapentinoid + opioid (respiratory depression)
  {
    drug1: 'gabapentin', drug2: 'hydrocodone', severity: 'major',
    description: 'Increased risk of respiratory depression',
    mechanism: 'Additive CNS depressant effects between gabapentinoid and opioid',
    clinicalEffect: 'Respiratory depression, excessive sedation, potentially fatal',
    management: 'Limit dosages and duration. Monitor closely. FDA boxed warning.'
  },
  // Duloxetine interactions
  {
    drug1: 'duloxetine', drug2: 'warfarin', severity: 'major',
    description: 'Increased bleeding risk',
    mechanism: 'SNRIs impair platelet serotonin uptake, adding to warfarin anticoagulation',
    clinicalEffect: 'Increased risk of GI and other bleeding events',
    management: 'Monitor INR closely when starting/stopping duloxetine. Watch for signs of bleeding.'
  },
  // Amiodarone + simvastatin
  {
    drug1: 'amiodarone', drug2: 'simvastatin', severity: 'major',
    description: 'Increased risk of rhabdomyolysis',
    mechanism: 'Amiodarone inhibits CYP3A4, increasing simvastatin levels',
    clinicalEffect: 'Rhabdomyolysis, myopathy, acute kidney injury',
    management: 'Do not exceed simvastatin 20mg/day with amiodarone. Consider switching to pravastatin or rosuvastatin (not CYP3A4 dependent).'
  },
  // Prednisone + warfarin
  {
    drug1: 'prednisone', drug2: 'warfarin', severity: 'moderate',
    description: 'Altered anticoagulation response',
    mechanism: 'Corticosteroids may enhance or reduce warfarin effect; also increase GI bleeding risk',
    clinicalEffect: 'Unpredictable INR changes. Increased bleeding risk.',
    management: 'Monitor INR closely when starting, adjusting, or stopping corticosteroids. Adjust warfarin dose as needed.'
  },
  // Cyclosporine + statins
  {
    drug1: 'cyclosporine', drug2: 'atorvastatin', severity: 'major',
    description: 'High risk of rhabdomyolysis',
    mechanism: 'Cyclosporine inhibits CYP3A4 and OATP1B1, greatly increasing atorvastatin exposure',
    clinicalEffect: 'Rhabdomyolysis, myopathy, acute kidney injury',
    management: 'Avoid if possible. If needed, limit atorvastatin to 10mg/day. Monitor CK levels and renal function.'
  },
  // === NEW INTERACTIONS ===
  // Warfarin + amiodarone
  {
    drug1: 'warfarin', drug2: 'amiodarone', severity: 'major',
    description: 'Significantly increased anticoagulant effect',
    mechanism: 'Amiodarone inhibits CYP2C9 and CYP3A4, reducing warfarin metabolism. Effect persists weeks after amiodarone discontinuation.',
    clinicalEffect: 'Markedly elevated INR with high bleeding risk. Effect may take 1-2 weeks to manifest.',
    management: 'Reduce warfarin dose by 30-50% when starting amiodarone. Monitor INR weekly for several weeks. Effect persists for months after amiodarone discontinuation.'
  },
  // Warfarin + clarithromycin
  {
    drug1: 'warfarin', drug2: 'clarithromycin', severity: 'major',
    description: 'Significantly increased anticoagulant effect',
    mechanism: 'Clarithromycin inhibits CYP3A4 metabolism of R-warfarin and alters gut flora vitamin K production',
    clinicalEffect: 'Elevated INR with increased bleeding risk',
    management: 'Monitor INR within 3-5 days of starting clarithromycin. Consider azithromycin as alternative (less CYP interaction).'
  },
  // Metformin + furosemide
  {
    drug1: 'metformin', drug2: 'furosemide', severity: 'moderate',
    description: 'Altered metformin levels and potential lactic acidosis',
    mechanism: 'Furosemide increases metformin plasma levels by ~22% via competition for renal tubular secretion',
    clinicalEffect: 'Increased metformin exposure; dehydration from diuresis can worsen lactic acidosis risk',
    management: 'Monitor renal function and blood glucose. Ensure adequate hydration. Hold metformin if dehydration occurs.'
  },
  // Spironolactone + potassium
  {
    drug1: 'spironolactone', drug2: 'potassium', severity: 'major',
    description: 'Dangerous hyperkalemia risk',
    mechanism: 'Spironolactone blocks aldosterone-mediated potassium excretion; supplemental potassium adds to load',
    clinicalEffect: 'Life-threatening hyperkalemia with cardiac arrhythmias',
    management: 'Avoid potassium supplements with spironolactone unless documented hypokalemia. Monitor potassium closely.'
  },
  // Losartan + spironolactone
  {
    drug1: 'losartan', drug2: 'spironolactone', severity: 'major',
    description: 'Risk of hyperkalemia',
    mechanism: 'Both reduce potassium excretion through RAAS blockade',
    clinicalEffect: 'Dangerous hyperkalemia potentially causing cardiac arrhythmias',
    management: 'Monitor potassium within 1 week of starting and regularly thereafter. Avoid potassium supplements.'
  },
  // Losartan + potassium
  {
    drug1: 'losartan', drug2: 'potassium', severity: 'major',
    description: 'Risk of hyperkalemia',
    mechanism: 'ARBs reduce aldosterone-mediated potassium excretion',
    clinicalEffect: 'Hyperkalemia with cardiac risk',
    management: 'Monitor serum potassium. Use potassium supplements only if documented hypokalemia.'
  },
  // Atenolol + verapamil
  {
    drug1: 'atenolol', drug2: 'verapamil', severity: 'major',
    description: 'Excessive bradycardia and AV block',
    mechanism: 'Both agents depress SA and AV node conduction',
    clinicalEffect: 'Severe bradycardia, AV block, heart failure exacerbation',
    management: 'Avoid IV combination. If oral combination needed, monitor closely. Prefer amlodipine (dihydropyridine CCB).'
  },
  // Pregabalin + hydrocodone
  {
    drug1: 'pregabalin', drug2: 'hydrocodone', severity: 'major',
    description: 'Increased risk of respiratory depression',
    mechanism: 'Additive CNS depression between gabapentinoid and opioid',
    clinicalEffect: 'Respiratory depression, excessive sedation, potentially fatal',
    management: 'Limit dosages and duration. Monitor respiratory status. FDA boxed warning.'
  },
  // Atorvastatin + erythromycin
  {
    drug1: 'atorvastatin', drug2: 'erythromycin', severity: 'major',
    description: 'Increased risk of myopathy and rhabdomyolysis',
    mechanism: 'Erythromycin inhibits CYP3A4, increasing atorvastatin exposure',
    clinicalEffect: 'Elevated risk of rhabdomyolysis',
    management: 'Suspend atorvastatin during erythromycin course. Use azithromycin as alternative.'
  },
  // Atorvastatin + ketoconazole
  {
    drug1: 'atorvastatin', drug2: 'ketoconazole', severity: 'major',
    description: 'Significantly increased atorvastatin levels',
    mechanism: 'Ketoconazole is a potent CYP3A4 inhibitor, increasing atorvastatin exposure ~3-fold',
    clinicalEffect: 'High risk of myopathy and rhabdomyolysis',
    management: 'Avoid combination. Use pravastatin or rosuvastatin (not CYP3A4 substrates) or alternative antifungal.'
  },
  // Carbamazepine + erythromycin
  {
    drug1: 'carbamazepine', drug2: 'erythromycin', severity: 'major',
    description: 'Increased carbamazepine levels and toxicity',
    mechanism: 'Erythromycin inhibits CYP3A4, reducing carbamazepine metabolism',
    clinicalEffect: 'Carbamazepine toxicity (diplopia, ataxia, drowsiness, nausea)',
    management: 'Avoid combination. Use azithromycin as alternative macrolide. If unavoidable, reduce carbamazepine dose and monitor levels.'
  },
  // Carbamazepine + clarithromycin
  {
    drug1: 'carbamazepine', drug2: 'clarithromycin', severity: 'major',
    description: 'Increased carbamazepine levels and toxicity',
    mechanism: 'Clarithromycin strongly inhibits CYP3A4 metabolism of carbamazepine',
    clinicalEffect: 'Carbamazepine toxicity (diplopia, ataxia, drowsiness, nausea)',
    management: 'Avoid combination. Use azithromycin as alternative macrolide.'
  },
  // Phenytoin + fluoxetine
  {
    drug1: 'phenytoin', drug2: 'fluoxetine', severity: 'major',
    description: 'Increased phenytoin levels',
    mechanism: 'Fluoxetine inhibits CYP2C9, reducing phenytoin metabolism',
    clinicalEffect: 'Phenytoin toxicity (nystagmus, ataxia, confusion, seizures)',
    management: 'Monitor phenytoin levels when starting/stopping fluoxetine. May need 25-50% dose reduction.'
  },
  // Aspirin + clopidogrel
  {
    drug1: 'aspirin', drug2: 'clopidogrel', severity: 'moderate',
    description: 'Increased bleeding risk with dual antiplatelet therapy',
    mechanism: 'Additive inhibition of platelet aggregation via different pathways (COX-1 + P2Y12)',
    clinicalEffect: 'Significantly increased bleeding risk, especially GI. However, combination is standard of care post-ACS/PCI.',
    management: 'Standard after ACS/PCI for defined duration. Add PPI for GI protection. Monitor for bleeding.'
  },
  // Digoxin + hydrochlorothiazide
  {
    drug1: 'digoxin', drug2: 'hydrochlorothiazide', severity: 'moderate',
    description: 'Increased digoxin toxicity risk due to hypokalemia',
    mechanism: 'Thiazide diuretics cause potassium and magnesium wasting, increasing myocardial sensitivity to digoxin',
    clinicalEffect: 'Digoxin toxicity (arrhythmias, nausea) at therapeutic digoxin levels',
    management: 'Monitor potassium and magnesium. Supplement as needed. Check digoxin levels.'
  },
  // Apixaban + aspirin
  {
    drug1: 'apixaban', drug2: 'aspirin', severity: 'major',
    description: 'Increased bleeding risk',
    mechanism: 'Additive effects on hemostasis: anticoagulant + antiplatelet',
    clinicalEffect: 'Significantly increased bleeding risk, especially GI and intracranial hemorrhage',
    management: 'Avoid combination unless specifically indicated (e.g., post-ACS). If used, lowest aspirin dose (81mg) and shortest duration.'
  },
  // Rivaroxaban + aspirin
  {
    drug1: 'rivaroxaban', drug2: 'aspirin', severity: 'major',
    description: 'Increased bleeding risk',
    mechanism: 'Additive effects on hemostasis: anticoagulant + antiplatelet',
    clinicalEffect: 'Significantly increased bleeding risk. COMPASS trial used low-dose rivaroxaban + aspirin.',
    management: 'Avoid unless specifically indicated. Low-dose rivaroxaban (2.5mg BID) + aspirin approved for CAD/PAD.'
  },
  // Paroxetine + tramadol
  {
    drug1: 'paroxetine', drug2: 'tramadol', severity: 'major',
    description: 'Risk of serotonin syndrome and reduced tramadol efficacy',
    mechanism: 'Paroxetine strongly inhibits CYP2D6 (blocking tramadol activation) and both increase serotonin',
    clinicalEffect: 'Serotonin syndrome risk AND reduced tramadol analgesic effect',
    management: 'Use alternative analgesic. If combination necessary, monitor for serotonin syndrome.'
  },
  // Amiodarone + warfarin
  // (already covered by warfarin + amiodarone above, but adding atorvastatin + amiodarone)
  {
    drug1: 'amiodarone', drug2: 'atorvastatin', severity: 'major',
    description: 'Increased risk of myopathy',
    mechanism: 'Amiodarone inhibits CYP3A4, increasing atorvastatin levels',
    clinicalEffect: 'Myopathy and rhabdomyolysis risk',
    management: 'Limit atorvastatin dose. Consider pravastatin or rosuvastatin (less CYP3A4 dependent). Monitor CK.'
  },
  // Lithium + naproxen
  {
    drug1: 'lithium', drug2: 'naproxen', severity: 'major',
    description: 'Increased lithium levels',
    mechanism: 'NSAIDs reduce renal prostaglandin synthesis, decreasing lithium clearance',
    clinicalEffect: 'Lithium toxicity (tremor, confusion, seizures, renal failure)',
    management: 'Avoid NSAIDs if possible. If necessary, monitor lithium levels within 5 days and adjust dose.'
  },
  // Lithium + enalapril
  {
    drug1: 'lithium', drug2: 'enalapril', severity: 'major',
    description: 'Increased lithium levels',
    mechanism: 'ACE inhibitors reduce renal lithium clearance',
    clinicalEffect: 'Lithium toxicity',
    management: 'Monitor lithium levels closely when starting/stopping ACE inhibitor. May need dose reduction.'
  },
  // Lithium + losartan
  {
    drug1: 'lithium', drug2: 'losartan', severity: 'major',
    description: 'Increased lithium levels',
    mechanism: 'ARBs reduce renal lithium clearance similar to ACE inhibitors',
    clinicalEffect: 'Lithium toxicity',
    management: 'Monitor lithium levels closely when starting/stopping ARB. May need dose reduction.'
  },
  // Fluoxetine + lithium (serotonin syndrome risk)
  {
    drug1: 'fluoxetine', drug2: 'lithium', severity: 'major',
    description: 'Increased risk of serotonin syndrome and lithium toxicity',
    mechanism: 'SSRIs increase serotonergic activity; combined with lithium can produce additive serotonin effects',
    clinicalEffect: 'Serotonin syndrome (tremor, hyperreflexia, myoclonus, agitation), increased lithium levels',
    management: 'Monitor for serotonin syndrome symptoms. Check lithium levels when starting/adjusting SSRI. Use lowest effective doses.'
  },
  // Enalapril + ibuprofen
  {
    drug1: 'enalapril', drug2: 'ibuprofen', severity: 'moderate',
    description: 'Reduced antihypertensive effect and risk of acute kidney injury',
    mechanism: 'NSAIDs inhibit renal prostaglandins, opposing ACE inhibitor effects',
    clinicalEffect: 'Decreased blood pressure control, increased risk of AKI, hyperkalemia',
    management: 'Monitor blood pressure and renal function. Use lowest NSAID dose for shortest duration.'
  },
  // Losartan + ibuprofen
  {
    drug1: 'losartan', drug2: 'ibuprofen', severity: 'moderate',
    description: 'Reduced antihypertensive effect and renal risk',
    mechanism: 'NSAIDs inhibit renal prostaglandins, opposing ARB hemodynamic effects',
    clinicalEffect: 'Attenuated blood pressure control and increased risk of AKI',
    management: 'Monitor BP and renal function. Prefer acetaminophen for pain relief.'
  },

  // === FLUOROQUINOLONE + ANTACID INTERACTIONS ===
  {
    drug1: 'ciprofloxacin', drug2: 'calcium_carbonate', severity: 'major',
    description: 'Dramatically reduced ciprofloxacin absorption',
    mechanism: 'Divalent and trivalent cations (Ca2+, Mg2+, Al3+) chelate fluoroquinolones in the GI tract, forming insoluble complexes',
    clinicalEffect: 'Ciprofloxacin levels reduced by up to 90%, leading to treatment failure',
    management: 'Administer ciprofloxacin at least 2 hours before or 6 hours after antacids or calcium supplements.'
  },
  {
    drug1: 'ciprofloxacin', drug2: 'aluminum_hydroxide', severity: 'major',
    description: 'Dramatically reduced ciprofloxacin absorption',
    mechanism: 'Aluminum cations chelate fluoroquinolones, forming insoluble complexes that cannot be absorbed',
    clinicalEffect: 'Up to 85% reduction in ciprofloxacin bioavailability, risk of treatment failure',
    management: 'Give ciprofloxacin at least 2 hours before or 6 hours after aluminum-containing antacids.'
  },
  {
    drug1: 'levofloxacin', drug2: 'calcium_carbonate', severity: 'major',
    description: 'Reduced levofloxacin absorption',
    mechanism: 'Calcium chelates fluoroquinolones in the GI tract',
    clinicalEffect: 'Reduced levofloxacin bioavailability, potential treatment failure',
    management: 'Administer levofloxacin at least 2 hours before or 2 hours after calcium products.'
  },
  {
    drug1: 'levofloxacin', drug2: 'magnesium_hydroxide', severity: 'major',
    description: 'Reduced levofloxacin absorption',
    mechanism: 'Magnesium cations chelate fluoroquinolones in the GI tract',
    clinicalEffect: 'Significantly reduced levofloxacin levels, risk of therapeutic failure',
    management: 'Give levofloxacin at least 2 hours before or 2 hours after magnesium-containing antacids.'
  },
  {
    drug1: 'moxifloxacin', drug2: 'aluminum_hydroxide', severity: 'major',
    description: 'Reduced moxifloxacin absorption',
    mechanism: 'Aluminum cations chelate moxifloxacin, reducing GI absorption',
    clinicalEffect: 'Moxifloxacin bioavailability reduced by ~40%, risk of treatment failure',
    management: 'Take moxifloxacin at least 4 hours before or 8 hours after aluminum-containing antacids.'
  },

  // === MACROLIDE + STATIN INTERACTIONS ===
  {
    drug1: 'clarithromycin', drug2: 'rosuvastatin', severity: 'moderate',
    description: 'Increased rosuvastatin levels',
    mechanism: 'Clarithromycin inhibits OATP1B1 transporter, increasing rosuvastatin exposure (rosuvastatin is not primarily CYP3A4 metabolized)',
    clinicalEffect: 'Approximately 2-fold increase in rosuvastatin levels, increased myopathy risk',
    management: 'Limit rosuvastatin dose to 5mg during clarithromycin therapy. Monitor for muscle symptoms.'
  },
  {
    drug1: 'erythromycin', drug2: 'atorvastatin', severity: 'major',
    description: 'Increased risk of myopathy and rhabdomyolysis',
    mechanism: 'Erythromycin inhibits CYP3A4, increasing atorvastatin exposure',
    clinicalEffect: 'Elevated risk of rhabdomyolysis',
    management: 'Suspend atorvastatin during erythromycin course. Use azithromycin as alternative.'
  },

  // === HIV PROTEASE INHIBITOR INTERACTIONS ===
  {
    drug1: 'ritonavir', drug2: 'simvastatin', severity: 'contraindicated',
    description: 'Dramatically increased simvastatin levels causing rhabdomyolysis',
    mechanism: 'Ritonavir is one of the most potent CYP3A4 inhibitors known, increasing simvastatin AUC by >30-fold',
    clinicalEffect: 'Near-certain rhabdomyolysis with renal failure and potentially death',
    management: 'NEVER combine. Use pravastatin, rosuvastatin, or pitavastatin as alternatives.'
  },
  {
    drug1: 'ritonavir', drug2: 'atorvastatin', severity: 'major',
    description: 'Markedly increased atorvastatin levels',
    mechanism: 'Ritonavir potently inhibits CYP3A4, increasing atorvastatin exposure 5-9 fold',
    clinicalEffect: 'High risk of rhabdomyolysis and myopathy',
    management: 'Use lowest possible atorvastatin dose (max 20mg) or switch to pravastatin/rosuvastatin. Monitor CK.'
  },
  {
    drug1: 'ritonavir', drug2: 'midazolam', severity: 'contraindicated',
    description: 'Profound and prolonged sedation',
    mechanism: 'Ritonavir potently inhibits CYP3A4, the primary route of midazolam metabolism',
    clinicalEffect: 'Midazolam AUC increased >10-fold, causing extreme sedation and respiratory depression',
    management: 'NEVER combine oral midazolam with ritonavir. IV midazolam with caution only in ICU setting.'
  },
  {
    drug1: 'ritonavir', drug2: 'alprazolam', severity: 'contraindicated',
    description: 'Markedly increased alprazolam levels and toxicity',
    mechanism: 'Ritonavir inhibits CYP3A4 metabolism of alprazolam',
    clinicalEffect: 'Profound CNS depression, respiratory depression',
    management: 'Avoid combination. Use lorazepam or oxazepam (glucuronidated, not CYP3A4 dependent) as alternatives.'
  },
  {
    drug1: 'atazanavir', drug2: 'omeprazole', severity: 'contraindicated',
    description: 'Dramatically reduced atazanavir absorption',
    mechanism: 'Atazanavir requires gastric acidity for dissolution and absorption; PPIs raise gastric pH',
    clinicalEffect: 'Atazanavir levels reduced by ~75%, leading to virologic failure and HIV resistance',
    management: 'Do not use PPIs with atazanavir. H2 blockers may be used with timing separation (12h apart).'
  },
  {
    drug1: 'ritonavir', drug2: 'rivaroxaban', severity: 'contraindicated',
    description: 'Dramatically increased rivaroxaban levels',
    mechanism: 'Ritonavir inhibits both CYP3A4 and P-glycoprotein, dramatically increasing rivaroxaban exposure',
    clinicalEffect: 'Rivaroxaban AUC increased by 153%, very high bleeding risk',
    management: 'Avoid combination. Consider warfarin with INR monitoring as alternative anticoagulant.'
  },
  {
    drug1: 'ritonavir', drug2: 'apixaban', severity: 'major',
    description: 'Significantly increased apixaban levels',
    mechanism: 'Ritonavir inhibits CYP3A4 and P-glycoprotein involved in apixaban clearance',
    clinicalEffect: 'Approximately 2-fold increase in apixaban exposure with increased bleeding risk',
    management: 'Reduce apixaban dose by 50%. Avoid if patient is already on reduced dose. Monitor for bleeding.'
  },
  {
    drug1: 'lopinavir', drug2: 'simvastatin', severity: 'contraindicated',
    description: 'Dramatically increased simvastatin levels',
    mechanism: 'Lopinavir/ritonavir potently inhibits CYP3A4',
    clinicalEffect: 'Extreme risk of rhabdomyolysis',
    management: 'NEVER combine. Use pravastatin or rosuvastatin as alternatives.'
  },

  // === IMMUNOSUPPRESSANT INTERACTIONS ===
  {
    drug1: 'cyclosporine', drug2: 'clarithromycin', severity: 'major',
    description: 'Significantly increased cyclosporine levels',
    mechanism: 'Clarithromycin inhibits CYP3A4 and P-glycoprotein, reducing cyclosporine clearance',
    clinicalEffect: 'Cyclosporine toxicity: nephrotoxicity, hypertension, tremor, seizures',
    management: 'Monitor cyclosporine trough levels closely. Reduce cyclosporine dose by 25-50%. Use azithromycin as alternative.'
  },
  {
    drug1: 'tacrolimus', drug2: 'ketoconazole', severity: 'major',
    description: 'Dramatically increased tacrolimus levels',
    mechanism: 'Ketoconazole potently inhibits CYP3A4 and P-glycoprotein, the primary clearance pathways for tacrolimus',
    clinicalEffect: 'Tacrolimus toxicity: nephrotoxicity, neurotoxicity, hyperglycemia, QT prolongation',
    management: 'Reduce tacrolimus dose by 50-75%. Monitor trough levels every 2-3 days until stable.'
  },
  {
    drug1: 'tacrolimus', drug2: 'clarithromycin', severity: 'major',
    description: 'Significantly increased tacrolimus levels',
    mechanism: 'Clarithromycin inhibits CYP3A4, reducing tacrolimus metabolism',
    clinicalEffect: 'Tacrolimus toxicity: nephrotoxicity, neurotoxicity, electrolyte disturbances',
    management: 'Monitor tacrolimus trough levels. Reduce dose. Use azithromycin as alternative macrolide.'
  },
  {
    drug1: 'tacrolimus', drug2: 'fluconazole', severity: 'major',
    description: 'Increased tacrolimus levels',
    mechanism: 'Fluconazole inhibits CYP3A4 (dose-dependent), increasing tacrolimus exposure',
    clinicalEffect: 'Tacrolimus toxicity, particularly nephrotoxicity',
    management: 'Reduce tacrolimus dose by 25-50%. Monitor trough levels. Effect is dose-dependent (worse with fluconazole >200mg/day).'
  },
  {
    drug1: 'cyclosporine', drug2: 'rifampin', severity: 'major',
    description: 'Dramatically reduced cyclosporine levels',
    mechanism: 'Rifampin potently induces CYP3A4 and P-glycoprotein, massively increasing cyclosporine clearance',
    clinicalEffect: 'Loss of immunosuppression leading to organ rejection',
    management: 'Avoid if possible. If unavoidable, may need 3-5x cyclosporine dose increase with frequent trough monitoring.'
  },
  {
    drug1: 'tacrolimus', drug2: 'rifampin', severity: 'major',
    description: 'Dramatically reduced tacrolimus levels',
    mechanism: 'Rifampin induces CYP3A4 and P-glycoprotein, greatly accelerating tacrolimus metabolism',
    clinicalEffect: 'Subtherapeutic tacrolimus levels, risk of graft rejection',
    management: 'Avoid if possible. If unavoidable, increase tacrolimus dose substantially with daily trough monitoring.'
  },
  {
    drug1: 'methotrexate', drug2: 'omeprazole', severity: 'moderate',
    description: 'Increased methotrexate levels',
    mechanism: 'PPIs inhibit renal tubular secretion of methotrexate via inhibition of breast cancer resistance protein (BCRP)',
    clinicalEffect: 'Delayed methotrexate elimination, increased toxicity risk especially with high-dose MTX',
    management: 'Discontinue PPIs 1 week before high-dose methotrexate. Monitor methotrexate levels.'
  },
  {
    drug1: 'cyclosporine', drug2: 'methotrexate', severity: 'major',
    description: 'Increased methotrexate toxicity and immunosuppression',
    mechanism: 'Cyclosporine reduces renal clearance of methotrexate and both are immunosuppressive',
    clinicalEffect: 'Enhanced methotrexate toxicity (pancytopenia, hepatotoxicity) and excessive immunosuppression',
    management: 'Monitor methotrexate levels, CBC, and renal/liver function closely. Reduce doses if needed.'
  },

  // === DOAC INTERACTIONS ===
  {
    drug1: 'apixaban', drug2: 'clarithromycin', severity: 'major',
    description: 'Increased apixaban levels with bleeding risk',
    mechanism: 'Clarithromycin inhibits CYP3A4 and P-glycoprotein, both involved in apixaban clearance',
    clinicalEffect: 'Approximately 60% increase in apixaban exposure, elevated bleeding risk',
    management: 'Consider apixaban dose reduction. Monitor for bleeding signs. Use azithromycin as alternative.'
  },
  {
    drug1: 'rivaroxaban', drug2: 'clarithromycin', severity: 'major',
    description: 'Increased rivaroxaban levels with bleeding risk',
    mechanism: 'Clarithromycin inhibits CYP3A4 and P-glycoprotein, both critical for rivaroxaban clearance',
    clinicalEffect: 'Significant increase in rivaroxaban exposure with heightened bleeding risk',
    management: 'Use azithromycin instead. If unavoidable, monitor closely for bleeding. Consider dose reduction.'
  },
  {
    drug1: 'dabigatran', drug2: 'ketoconazole', severity: 'contraindicated',
    description: 'Dramatically increased dabigatran levels',
    mechanism: 'Ketoconazole potently inhibits P-glycoprotein, the primary efflux transporter for dabigatran',
    clinicalEffect: 'Dabigatran AUC increased by 138-153%, very high bleeding risk',
    management: 'Avoid combination. Use alternative antifungal or alternative anticoagulant.'
  },
  {
    drug1: 'dabigatran', drug2: 'rifampin', severity: 'major',
    description: 'Significantly reduced dabigatran levels',
    mechanism: 'Rifampin induces P-glycoprotein, increasing dabigatran elimination',
    clinicalEffect: 'Dabigatran AUC reduced by ~66%, loss of anticoagulant effect',
    management: 'Avoid combination. Use warfarin with INR monitoring if rifampin is required.'
  },
  {
    drug1: 'edoxaban', drug2: 'ketoconazole', severity: 'major',
    description: 'Increased edoxaban levels',
    mechanism: 'Ketoconazole inhibits P-glycoprotein, reducing edoxaban clearance',
    clinicalEffect: 'Edoxaban exposure increased by ~87%, increased bleeding risk',
    management: 'Reduce edoxaban dose by 50% when used with strong P-gp inhibitors.'
  },

  // === OPIOID + BENZODIAZEPINE INTERACTIONS (FDA Black Box Warning) ===
  {
    drug1: 'oxycodone', drug2: 'alprazolam', severity: 'major',
    description: 'Life-threatening respiratory depression (FDA Black Box Warning)',
    mechanism: 'Additive CNS depression from opioid mu-receptor and GABA-A receptor agonism',
    clinicalEffect: 'Profound sedation, respiratory depression, coma, and death',
    management: 'Avoid combination. If medically necessary, limit doses and duration. FDA Black Box Warning on concurrent use.'
  },
  {
    drug1: 'oxycodone', drug2: 'diazepam', severity: 'major',
    description: 'Life-threatening respiratory depression (FDA Black Box Warning)',
    mechanism: 'Synergistic CNS depression from opioid and benzodiazepine',
    clinicalEffect: 'Profound sedation, respiratory depression, coma, death',
    management: 'Avoid concurrent prescribing. If needed, lowest doses for shortest duration with respiratory monitoring.'
  },
  {
    drug1: 'hydrocodone', drug2: 'alprazolam', severity: 'major',
    description: 'Life-threatening respiratory depression (FDA Black Box Warning)',
    mechanism: 'Additive CNS depression from combined opioid and benzodiazepine',
    clinicalEffect: 'Respiratory depression, sedation, coma, death',
    management: 'Avoid combination. Prescribe lowest effective doses if medically necessary. Monitor respiratory status.'
  },
  {
    drug1: 'hydrocodone', drug2: 'diazepam', severity: 'major',
    description: 'Life-threatening respiratory depression (FDA Black Box Warning)',
    mechanism: 'Synergistic CNS depression',
    clinicalEffect: 'Respiratory depression, oversedation, death',
    management: 'Avoid. If essential, use lowest doses, shortest duration, and monitor closely.'
  },
  {
    drug1: 'morphine', drug2: 'lorazepam', severity: 'major',
    description: 'Life-threatening respiratory depression (FDA Black Box Warning)',
    mechanism: 'Additive CNS depression from opioid mu-receptor agonism and GABA-A receptor activation',
    clinicalEffect: 'Profound sedation, respiratory depression, death',
    management: 'Avoid combination. In palliative care settings, use lowest effective doses with close monitoring.'
  },
  {
    drug1: 'fentanyl', drug2: 'midazolam', severity: 'major',
    description: 'Severe respiratory depression (FDA Black Box Warning)',
    mechanism: 'Potent synergistic CNS depression between strong opioid and benzodiazepine',
    clinicalEffect: 'Profound respiratory depression, apnea, death. Common in procedural sedation.',
    management: 'In procedural sedation, use reduced doses with continuous monitoring. Outside ICU/OR, avoid combination.'
  },
  {
    drug1: 'methadone', drug2: 'alprazolam', severity: 'major',
    description: 'Life-threatening respiratory depression and QT prolongation',
    mechanism: 'Additive CNS depression; methadone also prolongs QT interval',
    clinicalEffect: 'Respiratory depression, oversedation, death. Methadone QT effects add cardiac risk.',
    management: 'Avoid combination. Benzodiazepine-related deaths are a leading cause of methadone program fatalities.'
  },

  // === OPIOID + MUSCLE RELAXANT INTERACTIONS ===
  {
    drug1: 'oxycodone', drug2: 'cyclobenzaprine', severity: 'major',
    description: 'Excessive CNS depression and serotonin syndrome risk',
    mechanism: 'Additive CNS depression; cyclobenzaprine is structurally related to TCAs and has serotonergic activity',
    clinicalEffect: 'Excessive sedation, respiratory depression, potential serotonin syndrome',
    management: 'Use lowest effective doses. Monitor for sedation and respiratory depression. Consider non-sedating alternatives.'
  },
  {
    drug1: 'hydrocodone', drug2: 'cyclobenzaprine', severity: 'major',
    description: 'Excessive CNS depression',
    mechanism: 'Additive sedation from opioid and centrally-acting muscle relaxant',
    clinicalEffect: 'Respiratory depression, excessive sedation, falls risk',
    management: 'Limit doses and duration. Monitor respiratory status. Consider topical muscle relaxant alternatives.'
  },
  {
    drug1: 'oxycodone', drug2: 'baclofen', severity: 'major',
    description: 'Enhanced CNS and respiratory depression',
    mechanism: 'Additive CNS depression from opioid and GABA-B agonist',
    clinicalEffect: 'Respiratory depression, sedation, potentially fatal',
    management: 'Use lowest effective doses. Monitor respiratory status closely.'
  },

  // === QT-PROLONGING DRUG COMBINATIONS ===
  {
    drug1: 'amiodarone', drug2: 'sotalol', severity: 'contraindicated',
    description: 'Excessive QT prolongation and torsades de pointes',
    mechanism: 'Both drugs independently prolong QT interval via potassium channel blockade',
    clinicalEffect: 'Severe QT prolongation, torsades de pointes, ventricular fibrillation, sudden death',
    management: 'NEVER combine. Allow adequate washout (amiodarone has very long half-life, weeks to months).'
  },
  {
    drug1: 'haloperidol', drug2: 'amiodarone', severity: 'major',
    description: 'Additive QT prolongation',
    mechanism: 'Both agents block cardiac potassium channels (hERG), prolonging the QT interval',
    clinicalEffect: 'QT prolongation, torsades de pointes, cardiac arrest',
    management: 'Avoid combination. If necessary, monitor ECG and QTc closely. Correct hypokalemia and hypomagnesemia.'
  },
  {
    drug1: 'ziprasidone', drug2: 'amiodarone', severity: 'contraindicated',
    description: 'High risk of QT prolongation and torsades de pointes',
    mechanism: 'Ziprasidone has the highest QT-prolonging potential among atypical antipsychotics; additive with amiodarone',
    clinicalEffect: 'Severe QT prolongation, torsades de pointes, sudden cardiac death',
    management: 'NEVER combine. Use alternative antipsychotic with lower QT risk (e.g., aripiprazole).'
  },
  {
    drug1: 'haloperidol', drug2: 'sotalol', severity: 'major',
    description: 'Additive QT prolongation',
    mechanism: 'Both agents independently prolong QT interval',
    clinicalEffect: 'Increased risk of torsades de pointes and ventricular arrhythmias',
    management: 'Avoid if possible. If necessary, baseline and periodic ECG monitoring. Maintain normal K+ and Mg2+.'
  },
  {
    drug1: 'moxifloxacin', drug2: 'amiodarone', severity: 'major',
    description: 'Additive QT prolongation',
    mechanism: 'Moxifloxacin prolongs QT interval more than other fluoroquinolones; additive with amiodarone',
    clinicalEffect: 'Increased risk of torsades de pointes',
    management: 'Use alternative fluoroquinolone (levofloxacin or ciprofloxacin have less QT effect). Monitor ECG if unavoidable.'
  },
  {
    drug1: 'ondansetron', drug2: 'amiodarone', severity: 'major',
    description: 'Additive QT prolongation',
    mechanism: 'Both agents block hERG potassium channels, prolonging cardiac repolarization',
    clinicalEffect: 'QT prolongation, torsades de pointes risk',
    management: 'Limit ondansetron dose to 16mg IV max. Monitor ECG. Consider alternative antiemetics (metoclopramide).'
  },
  {
    drug1: 'methadone', drug2: 'sotalol', severity: 'contraindicated',
    description: 'Severe QT prolongation and cardiac arrhythmia risk',
    mechanism: 'Both agents cause dose-dependent QT prolongation via hERG channel blockade',
    clinicalEffect: 'Torsades de pointes, ventricular fibrillation, sudden death',
    management: 'NEVER combine. Use alternative opioid without QT-prolonging properties. ECG monitoring mandatory.'
  },
  {
    drug1: 'citalopram', drug2: 'amiodarone', severity: 'major',
    description: 'Additive QT prolongation',
    mechanism: 'Citalopram causes dose-dependent QT prolongation (FDA warning); additive with amiodarone',
    clinicalEffect: 'QT prolongation, risk of torsades de pointes',
    management: 'Avoid combination. Max citalopram dose 20mg/day. Monitor ECG. Consider sertraline (less QT effect).'
  },
  {
    drug1: 'domperidone', drug2: 'ketoconazole', severity: 'contraindicated',
    description: 'QT prolongation and cardiac arrhythmias',
    mechanism: 'Ketoconazole inhibits CYP3A4 metabolism of domperidone, increasing levels; both prolong QT',
    clinicalEffect: 'Elevated domperidone levels with additive QT prolongation; torsades de pointes risk',
    management: 'NEVER combine. Use alternative antiemetic or antifungal.'
  },

  // === PSYCHIATRIC MEDICATION INTERACTIONS ===
  {
    drug1: 'quetiapine', drug2: 'ketoconazole', severity: 'major',
    description: 'Significantly increased quetiapine levels',
    mechanism: 'Ketoconazole inhibits CYP3A4, the primary metabolic pathway for quetiapine',
    clinicalEffect: 'Quetiapine exposure increased 6-fold, causing excessive sedation, hypotension, QT prolongation',
    management: 'Reduce quetiapine dose to 1/6th when used with strong CYP3A4 inhibitors. Monitor sedation and ECG.'
  },
  {
    drug1: 'aripiprazole', drug2: 'fluoxetine', severity: 'major',
    description: 'Increased aripiprazole levels',
    mechanism: 'Fluoxetine inhibits CYP2D6, a major pathway for aripiprazole metabolism',
    clinicalEffect: 'Aripiprazole AUC increased ~112%, risk of akathisia, EPS, sedation',
    management: 'Reduce aripiprazole dose by 50% when used with strong CYP2D6 inhibitors.'
  },
  {
    drug1: 'olanzapine', drug2: 'ciprofloxacin', severity: 'moderate',
    description: 'Increased olanzapine levels',
    mechanism: 'Ciprofloxacin inhibits CYP1A2, the primary metabolic pathway for olanzapine',
    clinicalEffect: 'Increased olanzapine exposure with risk of sedation, weight gain, metabolic effects',
    management: 'Monitor for olanzapine toxicity. Consider olanzapine dose reduction during ciprofloxacin course.'
  },
  {
    drug1: 'linezolid', drug2: 'fluoxetine', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Linezolid is a reversible non-selective MAO inhibitor; combined with SSRI causes serotonin excess',
    clinicalEffect: 'Life-threatening serotonin syndrome: hyperthermia, rigidity, myoclonus, autonomic instability',
    management: 'NEVER combine unless life-threatening infection with no alternatives. If linezolid essential, stop SSRI and monitor for serotonin syndrome.'
  },
  {
    drug1: 'linezolid', drug2: 'sertraline', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Linezolid has MAO-inhibiting properties; combined with SSRI produces excess serotonin',
    clinicalEffect: 'Life-threatening serotonin syndrome',
    management: 'NEVER combine. Stop sertraline before starting linezolid. Monitor for 2 weeks after sertraline discontinuation.'
  },
  {
    drug1: 'linezolid', drug2: 'tramadol', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Linezolid inhibits MAO; tramadol inhibits serotonin reuptake',
    clinicalEffect: 'Serotonin syndrome: agitation, confusion, hyperthermia, tachycardia',
    management: 'NEVER combine. Use alternative analgesic (non-serotonergic opioid or non-opioid).'
  },
  {
    drug1: 'venlafaxine', drug2: 'phenelzine', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome',
    mechanism: 'SNRI + MAOI produces extreme serotonin excess via dual potentiation',
    clinicalEffect: 'Life-threatening serotonin syndrome, hypertensive crisis, death',
    management: 'NEVER combine. Allow 1-week washout after venlafaxine; 2-week washout after MAOI.'
  },
  {
    drug1: 'trazodone', drug2: 'phenelzine', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Trazodone inhibits serotonin reuptake; MAOI prevents serotonin breakdown',
    clinicalEffect: 'Serotonin syndrome, hyperthermia, death',
    management: 'NEVER combine. Allow 2-week washout between agents.'
  },

  // === CARDIOVASCULAR INTERACTIONS ===
  {
    drug1: 'amlodipine', drug2: 'simvastatin', severity: 'major',
    description: 'Increased simvastatin levels and myopathy risk',
    mechanism: 'Amlodipine inhibits CYP3A4, modestly increasing simvastatin exposure',
    clinicalEffect: 'Increased risk of myopathy and rhabdomyolysis',
    management: 'Do not exceed simvastatin 20mg/day with amlodipine. Consider pravastatin or rosuvastatin as alternatives.'
  },
  {
    drug1: 'digoxin', drug2: 'clarithromycin', severity: 'major',
    description: 'Significantly increased digoxin levels',
    mechanism: 'Clarithromycin inhibits P-glycoprotein (reducing renal/biliary digoxin secretion) and eliminates Eubacterium lentum gut flora that inactivates digoxin',
    clinicalEffect: 'Digoxin toxicity: nausea, visual disturbances, arrhythmias, potentially fatal',
    management: 'Reduce digoxin dose by 50%. Monitor digoxin levels. Use azithromycin as alternative (less P-gp inhibition).'
  },
  {
    drug1: 'digoxin', drug2: 'cyclosporine', severity: 'major',
    description: 'Increased digoxin levels',
    mechanism: 'Cyclosporine inhibits P-glycoprotein and reduces renal clearance of digoxin',
    clinicalEffect: 'Digoxin toxicity with arrhythmias, nausea, visual changes',
    management: 'Reduce digoxin dose by 50%. Monitor digoxin trough levels closely. Check renal function.'
  },
  {
    drug1: 'verapamil', drug2: 'simvastatin', severity: 'major',
    description: 'Increased simvastatin levels and myopathy risk',
    mechanism: 'Verapamil inhibits CYP3A4 and P-glycoprotein, increasing simvastatin exposure',
    clinicalEffect: 'Myopathy and rhabdomyolysis',
    management: 'Do not exceed simvastatin 10mg/day with verapamil. Consider pravastatin or rosuvastatin.'
  },
  {
    drug1: 'dronedarone', drug2: 'digoxin', severity: 'major',
    description: 'Increased digoxin levels',
    mechanism: 'Dronedarone inhibits P-glycoprotein, reducing digoxin renal clearance',
    clinicalEffect: 'Digoxin exposure increased by 150%, risk of toxicity',
    management: 'Reduce digoxin dose by 50%. Monitor digoxin levels. Avoid digoxin >0.125mg/day with dronedarone.'
  },
  {
    drug1: 'dronedarone', drug2: 'simvastatin', severity: 'major',
    description: 'Increased simvastatin levels',
    mechanism: 'Dronedarone inhibits CYP3A4, increasing simvastatin exposure',
    clinicalEffect: 'Increased risk of myopathy and rhabdomyolysis',
    management: 'Do not exceed simvastatin 10mg/day with dronedarone. Consider alternative statin.'
  },

  // === ENDOCRINE INTERACTIONS ===
  {
    drug1: 'insulin', drug2: 'ciprofloxacin', severity: 'major',
    description: 'Severe and unpredictable glucose dysregulation',
    mechanism: 'Fluoroquinolones directly affect pancreatic beta cell potassium channels, causing both hypo- and hyperglycemia',
    clinicalEffect: 'Severe hypoglycemia (including coma) or hyperglycemia. FDA Black Box Warning for glucose dysregulation.',
    management: 'Monitor blood glucose frequently (4x daily minimum). Adjust insulin doses as needed. Warn patient of hypoglycemia symptoms.'
  },
  {
    drug1: 'insulin', drug2: 'levofloxacin', severity: 'major',
    description: 'Severe and unpredictable glucose dysregulation',
    mechanism: 'Fluoroquinolones affect pancreatic beta cell function, causing unpredictable glycemic changes',
    clinicalEffect: 'Severe hypoglycemia or hyperglycemia. FDA Black Box Warning.',
    management: 'Frequent glucose monitoring. Adjust insulin dose as needed. Be prepared for both hypo- and hyperglycemia.'
  },
  {
    drug1: 'levothyroxine', drug2: 'calcium_carbonate', severity: 'moderate',
    description: 'Reduced levothyroxine absorption',
    mechanism: 'Calcium forms insoluble complexes with levothyroxine in the GI tract, reducing absorption',
    clinicalEffect: 'Increased TSH, inadequate thyroid hormone replacement',
    management: 'Separate administration by at least 4 hours. Take levothyroxine on empty stomach, calcium with meals.'
  },
  {
    drug1: 'levothyroxine', drug2: 'omeprazole', severity: 'moderate',
    description: 'Reduced levothyroxine absorption',
    mechanism: 'PPIs increase gastric pH, reducing dissolution and absorption of levothyroxine tablets',
    clinicalEffect: 'Increased TSH, subtherapeutic thyroid replacement',
    management: 'Monitor TSH when starting/stopping PPI. May need levothyroxine dose increase. Liquid formulation less affected.'
  },

  // === ADDITIONAL IMPORTANT INTERACTIONS ===
  {
    drug1: 'warfarin', drug2: 'fluconazole', severity: 'major',
    description: 'Significantly increased anticoagulant effect',
    mechanism: 'Fluconazole inhibits CYP2C9 and CYP3A4, the primary warfarin metabolic pathways',
    clinicalEffect: 'Markedly elevated INR with high bleeding risk, even with single-dose fluconazole',
    management: 'Monitor INR within 2-3 days of starting fluconazole. Empirically reduce warfarin dose by 25-50%.'
  },
  {
    drug1: 'fentanyl', drug2: 'ritonavir', severity: 'contraindicated',
    description: 'Dramatically increased fentanyl levels and respiratory depression',
    mechanism: 'Ritonavir potently inhibits CYP3A4, the primary fentanyl metabolic pathway',
    clinicalEffect: 'Fatal respiratory depression from fentanyl accumulation',
    management: 'Avoid combination. If opioid needed, use morphine or hydromorphone (not CYP3A4 dependent).'
  },
  {
    drug1: 'methadone', drug2: 'rifampin', severity: 'major',
    description: 'Dramatically reduced methadone levels',
    mechanism: 'Rifampin induces CYP3A4, CYP2B6, and other enzymes that metabolize methadone',
    clinicalEffect: 'Opioid withdrawal syndrome, loss of pain control, potential relapse in addiction treatment',
    management: 'Increase methadone dose as needed (may require 2-3x increase). Monitor for withdrawal symptoms daily.'
  },
  {
    drug1: 'codeine', drug2: 'paroxetine', severity: 'major',
    description: 'Loss of codeine analgesic effect',
    mechanism: 'Paroxetine strongly inhibits CYP2D6, blocking conversion of codeine to its active metabolite morphine',
    clinicalEffect: 'Complete loss of analgesic effect from codeine',
    management: 'Use alternative analgesic not requiring CYP2D6 activation (e.g., non-opioid or morphine directly).'
  },
  {
    drug1: 'itraconazole', drug2: 'simvastatin', severity: 'contraindicated',
    description: 'Dramatically increased simvastatin levels',
    mechanism: 'Itraconazole potently inhibits CYP3A4, increasing simvastatin exposure >10-fold',
    clinicalEffect: 'Very high risk of rhabdomyolysis',
    management: 'NEVER combine. Suspend simvastatin during itraconazole course. Use pravastatin or rosuvastatin as alternatives.'
  },
  {
    drug1: 'heparin', drug2: 'enoxaparin', severity: 'contraindicated',
    description: 'Excessive anticoagulation from overlapping anticoagulants',
    mechanism: 'Both enhance antithrombin III activity; combined use provides excessive anticoagulation',
    clinicalEffect: 'Major hemorrhage, potentially fatal bleeding',
    management: 'NEVER use simultaneously. Ensure adequate washout when transitioning between agents.'
  },
  {
    drug1: 'warfarin', drug2: 'carbamazepine', severity: 'major',
    description: 'Reduced anticoagulant effect of warfarin',
    mechanism: 'Carbamazepine induces CYP1A2, CYP2C9, and CYP3A4, increasing warfarin metabolism',
    clinicalEffect: 'Subtherapeutic INR with increased thromboembolic risk',
    management: 'Monitor INR frequently when starting/stopping carbamazepine. May need significant warfarin dose increase.'
  },
  {
    drug1: 'phenytoin', drug2: 'omeprazole', severity: 'moderate',
    description: 'Increased phenytoin levels',
    mechanism: 'Omeprazole inhibits CYP2C19, which contributes to phenytoin metabolism',
    clinicalEffect: 'Elevated phenytoin levels with risk of toxicity (nystagmus, ataxia, confusion)',
    management: 'Monitor phenytoin levels when starting/stopping omeprazole. Pantoprazole has less CYP2C19 interaction.'
  },
  {
    drug1: 'mycophenolate', drug2: 'omeprazole', severity: 'moderate',
    description: 'Reduced mycophenolate absorption',
    mechanism: 'PPIs increase gastric pH, reducing dissolution of mycophenolate mofetil enteric coating and decreasing absorption of active metabolite MPA',
    clinicalEffect: 'Reduced mycophenolic acid (MPA) exposure by ~35%, potential for graft rejection',
    management: 'Monitor MPA trough levels. Consider switching to mycophenolate sodium (Myfortic) which is less pH-dependent.'
  },
  {
    drug1: 'tacrolimus', drug2: 'itraconazole', severity: 'major',
    description: 'Dramatically increased tacrolimus levels',
    mechanism: 'Itraconazole potently inhibits CYP3A4 and P-glycoprotein, primary clearance pathways for tacrolimus',
    clinicalEffect: 'Tacrolimus toxicity: severe nephrotoxicity, neurotoxicity, hyperglycemia',
    management: 'Reduce tacrolimus dose by 50-75%. Monitor trough levels every 2-3 days. Use alternative antifungal if possible.'
  },
  {
    drug1: 'dofetilide', drug2: 'verapamil', severity: 'contraindicated',
    description: 'Increased dofetilide levels with QT prolongation',
    mechanism: 'Verapamil increases dofetilide levels via inhibition of renal cation transport',
    clinicalEffect: 'Excessive QT prolongation, torsades de pointes',
    management: 'NEVER combine. Verapamil is specifically contraindicated with dofetilide per FDA labeling.'
  },
  {
    drug1: 'escitalopram', drug2: 'phenelzine', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Combined serotonergic activity from SSRI and MAOI causes excessive serotonin',
    clinicalEffect: 'Life-threatening serotonin syndrome: hyperthermia, rigidity, autonomic instability',
    management: 'NEVER combine. Allow 2-week washout between agents.'
  },
  {
    drug1: 'citalopram', drug2: 'phenelzine', severity: 'contraindicated',
    description: 'Risk of serotonin syndrome',
    mechanism: 'Combined serotonergic activity from SSRI and MAOI',
    clinicalEffect: 'Life-threatening serotonin syndrome',
    management: 'NEVER combine. Allow 2-week washout between agents.'
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

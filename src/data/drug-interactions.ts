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

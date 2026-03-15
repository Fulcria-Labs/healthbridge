import { describe, it, expect } from 'vitest';
import { drugDirectory, drugInteractions, resolveToGeneric, findInteraction, findAllInteractions } from '../src/data/drug-interactions';

describe('Oncology Drug Directory', () => {
  const oncologyDrugs = [
    'cisplatin', 'carboplatin', 'doxorubicin', 'paclitaxel', 'docetaxel',
    'cyclophosphamide', 'fluorouracil', 'capecitabine', 'imatinib', 'erlotinib',
    'sorafenib', 'ibrutinib', 'venetoclax', 'pembrolizumab', 'nivolumab',
  ];

  it.each(oncologyDrugs)('%s is in the drug directory', (drug) => {
    expect(drugDirectory[drug]).toBeDefined();
    expect(drugDirectory[drug].genericName).toBe(drug);
  });

  it('resolves oncology brand names to generics', () => {
    expect(resolveToGeneric('Platinol')).toBe('cisplatin');
    expect(resolveToGeneric('Adriamycin')).toBe('doxorubicin');
    expect(resolveToGeneric('Taxol')).toBe('paclitaxel');
    expect(resolveToGeneric('Gleevec')).toBe('imatinib');
    expect(resolveToGeneric('Imbruvica')).toBe('ibrutinib');
    expect(resolveToGeneric('Venclexta')).toBe('venetoclax');
    expect(resolveToGeneric('Keytruda')).toBe('pembrolizumab');
    expect(resolveToGeneric('Opdivo')).toBe('nivolumab');
    expect(resolveToGeneric('Xeloda')).toBe('capecitabine');
    expect(resolveToGeneric('Tarceva')).toBe('erlotinib');
    expect(resolveToGeneric('Nexavar')).toBe('sorafenib');
    expect(resolveToGeneric('Cytoxan')).toBe('cyclophosphamide');
  });

  it('oncology drugs have correct drug classes', () => {
    expect(drugDirectory.cisplatin.drugClass).toBe('platinum-agent');
    expect(drugDirectory.doxorubicin.drugClass).toBe('anthracycline');
    expect(drugDirectory.paclitaxel.drugClass).toBe('taxane');
    expect(drugDirectory.imatinib.drugClass).toBe('tyrosine-kinase-inhibitor');
    expect(drugDirectory.ibrutinib.drugClass).toBe('btk-inhibitor');
    expect(drugDirectory.venetoclax.drugClass).toBe('bcl2-inhibitor');
    expect(drugDirectory.pembrolizumab.drugClass).toBe('checkpoint-inhibitor');
  });
});

describe('Oncology Drug Interactions', () => {
  it('cisplatin + furosemide is major (nephrotoxicity)', () => {
    const interaction = findInteraction('cisplatin', 'furosemide');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
    expect(interaction!.description).toContain('nephrotoxicity');
  });

  it('cisplatin + carboplatin is major (additive toxicity)', () => {
    const interaction = findInteraction('cisplatin', 'carboplatin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('doxorubicin + paclitaxel is major (cardiotoxicity)', () => {
    const interaction = findInteraction('doxorubicin', 'paclitaxel');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
    expect(interaction!.description).toContain('cardiotoxicity');
  });

  it('doxorubicin + cyclosporine is major (P-gp inhibition)', () => {
    const interaction = findInteraction('doxorubicin', 'cyclosporine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('capecitabine + warfarin is contraindicated', () => {
    const interaction = findInteraction('capecitabine', 'warfarin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('fluorouracil + warfarin is contraindicated', () => {
    const interaction = findInteraction('fluorouracil', 'warfarin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('imatinib + simvastatin is major (rhabdomyolysis)', () => {
    const interaction = findInteraction('imatinib', 'simvastatin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('imatinib + warfarin is major', () => {
    const interaction = findInteraction('imatinib', 'warfarin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('ibrutinib + warfarin is contraindicated (bleeding risk)', () => {
    const interaction = findInteraction('ibrutinib', 'warfarin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('ibrutinib + ketoconazole is contraindicated (24x exposure)', () => {
    const interaction = findInteraction('ibrutinib', 'ketoconazole');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('venetoclax + ketoconazole is contraindicated (TLS risk)', () => {
    const interaction = findInteraction('venetoclax', 'ketoconazole');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
    expect(interaction!.clinicalEffect).toContain('tumor lysis');
  });

  it('venetoclax + rifampin is contraindicated (loss of efficacy)', () => {
    const interaction = findInteraction('venetoclax', 'rifampin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('erlotinib + omeprazole is major (reduced absorption)', () => {
    const interaction = findInteraction('erlotinib', 'omeprazole');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('sorafenib + warfarin is major', () => {
    const interaction = findInteraction('sorafenib', 'warfarin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('detects oncology polypharmacy interactions', () => {
    const meds = ['capecitabine', 'warfarin', 'omeprazole'];
    const interactions = findAllInteractions(meds);
    expect(interactions.length).toBeGreaterThanOrEqual(1);
    expect(interactions.some(i => i.severity === 'contraindicated')).toBe(true);
  });

  it('resolves brand name Gleevec in interaction check', () => {
    const interaction = findInteraction('Gleevec', 'Zocor');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });
});

describe('HIV/Antiretroviral Drug Directory', () => {
  const hivDrugs = [
    'efavirenz', 'nevirapine', 'dolutegravir', 'raltegravir',
    'tenofovir', 'emtricitabine', 'abacavir', 'darunavir', 'cobicistat',
  ];

  it.each(hivDrugs)('%s is in the drug directory', (drug) => {
    expect(drugDirectory[drug]).toBeDefined();
    expect(drugDirectory[drug].genericName).toBe(drug);
  });

  it('resolves HIV brand names', () => {
    expect(resolveToGeneric('Sustiva')).toBe('efavirenz');
    expect(resolveToGeneric('Tivicay')).toBe('dolutegravir');
    expect(resolveToGeneric('Viread')).toBe('tenofovir');
    expect(resolveToGeneric('Prezista')).toBe('darunavir');
    expect(resolveToGeneric('Tybost')).toBe('cobicistat');
    expect(resolveToGeneric('Isentress')).toBe('raltegravir');
  });

  it('HIV drugs have correct drug classes', () => {
    expect(drugDirectory.efavirenz.drugClass).toBe('nnrti');
    expect(drugDirectory.dolutegravir.drugClass).toBe('integrase-inhibitor');
    expect(drugDirectory.tenofovir.drugClass).toBe('nrti');
    expect(drugDirectory.cobicistat.drugClass).toBe('pharmacokinetic-enhancer');
    expect(drugDirectory.darunavir.drugClass).toBe('protease-inhibitor');
  });
});

describe('HIV Drug Interactions', () => {
  it('efavirenz + simvastatin is major', () => {
    const interaction = findInteraction('efavirenz', 'simvastatin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('efavirenz + carbamazepine is major (bidirectional)', () => {
    const interaction = findInteraction('efavirenz', 'carbamazepine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
    expect(interaction!.mechanism).toContain('CYP3A4');
  });

  it('dolutegravir + rifampin is major', () => {
    const interaction = findInteraction('dolutegravir', 'rifampin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
    expect(interaction!.management).toContain('50mg BID');
  });

  it('dolutegravir + metformin is moderate (OCT2 inhibition)', () => {
    const interaction = findInteraction('dolutegravir', 'metformin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('moderate');
  });

  it('tenofovir + cisplatin is contraindicated (nephrotoxicity)', () => {
    const interaction = findInteraction('tenofovir', 'cisplatin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('cobicistat + simvastatin is contraindicated', () => {
    const interaction = findInteraction('cobicistat', 'simvastatin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('cobicistat + midazolam is contraindicated', () => {
    const interaction = findInteraction('cobicistat', 'midazolam');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('detects HIV + cardiovascular polypharmacy', () => {
    const meds = ['dolutegravir', 'metformin', 'simvastatin', 'cobicistat'];
    const interactions = findAllInteractions(meds);
    expect(interactions.length).toBeGreaterThanOrEqual(2);
    expect(interactions.some(i => i.severity === 'contraindicated')).toBe(true);
  });
});

describe('Psychiatric Drug Directory', () => {
  const psychiatricDrugs = [
    'clozapine', 'risperidone', 'paliperidone', 'chlorpromazine', 'fluphenazine',
    'amitriptyline', 'nortriptyline', 'imipramine', 'desipramine', 'clomipramine',
    'methylphenidate', 'amphetamine', 'atomoxetine',
  ];

  it.each(psychiatricDrugs)('%s is in the drug directory', (drug) => {
    expect(drugDirectory[drug]).toBeDefined();
    expect(drugDirectory[drug].genericName).toBe(drug);
  });

  it('resolves psychiatric brand names', () => {
    expect(resolveToGeneric('Clozaril')).toBe('clozapine');
    expect(resolveToGeneric('Risperdal')).toBe('risperidone');
    expect(resolveToGeneric('Elavil')).toBe('amitriptyline');
    expect(resolveToGeneric('Pamelor')).toBe('nortriptyline');
    expect(resolveToGeneric('Ritalin')).toBe('methylphenidate');
    expect(resolveToGeneric('Concerta')).toBe('methylphenidate');
    expect(resolveToGeneric('Adderall')).toBe('amphetamine');
    expect(resolveToGeneric('Strattera')).toBe('atomoxetine');
    expect(resolveToGeneric('Anafranil')).toBe('clomipramine');
    expect(resolveToGeneric('Thorazine')).toBe('chlorpromazine');
  });

  it('TCAs have correct drug class', () => {
    expect(drugDirectory.amitriptyline.drugClass).toBe('tca');
    expect(drugDirectory.nortriptyline.drugClass).toBe('tca');
    expect(drugDirectory.imipramine.drugClass).toBe('tca');
    expect(drugDirectory.desipramine.drugClass).toBe('tca');
    expect(drugDirectory.clomipramine.drugClass).toBe('tca');
  });

  it('stimulants have correct drug class', () => {
    expect(drugDirectory.methylphenidate.drugClass).toBe('stimulant');
    expect(drugDirectory.amphetamine.drugClass).toBe('stimulant');
  });
});

describe('Psychiatric Drug Interactions', () => {
  it('clozapine + ciprofloxacin is contraindicated (CYP1A2)', () => {
    const interaction = findInteraction('clozapine', 'ciprofloxacin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
    expect(interaction!.mechanism).toContain('CYP1A2');
  });

  it('clozapine + carbamazepine is contraindicated (agranulocytosis)', () => {
    const interaction = findInteraction('clozapine', 'carbamazepine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
    expect(interaction!.clinicalEffect).toContain('agranulocytosis');
  });

  it('clozapine + fluoxetine is major', () => {
    const interaction = findInteraction('clozapine', 'fluoxetine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('amitriptyline + phenelzine is contraindicated (serotonin syndrome)', () => {
    const interaction = findInteraction('amitriptyline', 'phenelzine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('amitriptyline + tramadol is major (serotonin + seizure)', () => {
    const interaction = findInteraction('amitriptyline', 'tramadol');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('nortriptyline + fluoxetine is major (CYP2D6)', () => {
    const interaction = findInteraction('nortriptyline', 'fluoxetine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
    expect(interaction!.mechanism).toContain('CYP2D6');
  });

  it('methylphenidate + phenelzine is contraindicated', () => {
    const interaction = findInteraction('methylphenidate', 'phenelzine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('amphetamine + phenelzine is contraindicated', () => {
    const interaction = findInteraction('amphetamine', 'phenelzine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('risperidone + fluoxetine is major (CYP2D6)', () => {
    const interaction = findInteraction('risperidone', 'fluoxetine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('chlorpromazine + methadone is major (QT + CNS)', () => {
    const interaction = findInteraction('chlorpromazine', 'methadone');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('atomoxetine + fluoxetine is major (CYP2D6)', () => {
    const interaction = findInteraction('atomoxetine', 'fluoxetine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('detects complex psychiatric polypharmacy', () => {
    const meds = ['clozapine', 'ciprofloxacin', 'fluoxetine'];
    const interactions = findAllInteractions(meds);
    expect(interactions.length).toBeGreaterThanOrEqual(2);
    const sorted = interactions.map(i => i.severity);
    expect(sorted[0]).toBe('contraindicated');
  });
});

describe('Geriatric High-Risk Drug Directory', () => {
  const geriatricDrugs = [
    'diphenhydramine', 'hydroxyzine', 'promethazine', 'oxybutynin', 'tolterodine',
    'donepezil', 'memantine', 'zolpidem', 'eszopiclone',
  ];

  it.each(geriatricDrugs)('%s is in the drug directory', (drug) => {
    expect(drugDirectory[drug]).toBeDefined();
    expect(drugDirectory[drug].genericName).toBe(drug);
  });

  it('resolves geriatric brand names', () => {
    expect(resolveToGeneric('Benadryl')).toBe('diphenhydramine');
    expect(resolveToGeneric('Aricept')).toBe('donepezil');
    expect(resolveToGeneric('Namenda')).toBe('memantine');
    expect(resolveToGeneric('Ambien')).toBe('zolpidem');
    expect(resolveToGeneric('Ditropan')).toBe('oxybutynin');
    expect(resolveToGeneric('Lunesta')).toBe('eszopiclone');
  });
});

describe('Geriatric Drug Interactions', () => {
  it('donepezil + oxybutynin is major (pharmacological antagonism)', () => {
    const interaction = findInteraction('donepezil', 'oxybutynin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
    expect(interaction!.description).toContain('antagonism');
  });

  it('donepezil + diphenhydramine is major (anticholinergic)', () => {
    const interaction = findInteraction('donepezil', 'diphenhydramine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('zolpidem + oxycodone is major (CNS depression)', () => {
    const interaction = findInteraction('zolpidem', 'oxycodone');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('zolpidem + lorazepam is major (GABA synergy)', () => {
    const interaction = findInteraction('zolpidem', 'lorazepam');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('diphenhydramine + oxycodone is major (elderly risk)', () => {
    const interaction = findInteraction('diphenhydramine', 'oxycodone');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('hydroxyzine + methadone is major (QT + CNS)', () => {
    const interaction = findInteraction('hydroxyzine', 'methadone');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('promethazine + morphine is major', () => {
    const interaction = findInteraction('promethazine', 'morphine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('detects dangerous geriatric polypharmacy', () => {
    const meds = ['donepezil', 'oxybutynin', 'zolpidem', 'oxycodone'];
    const interactions = findAllInteractions(meds);
    expect(interactions.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Cardiovascular Expanded Interactions', () => {
  it('ranolazine + simvastatin is major', () => {
    const interaction = findInteraction('ranolazine', 'simvastatin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('ranolazine + digoxin is major (P-gp)', () => {
    const interaction = findInteraction('ranolazine', 'digoxin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('ivabradine + diltiazem is contraindicated', () => {
    const interaction = findInteraction('ivabradine', 'diltiazem');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('ivabradine + verapamil is contraindicated', () => {
    const interaction = findInteraction('ivabradine', 'verapamil');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('sacubitril/valsartan + lisinopril is contraindicated (angioedema)', () => {
    const interaction = findInteraction('sacubitril_valsartan', 'lisinopril');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
    expect(interaction!.clinicalEffect).toContain('angioedema');
  });

  it('sacubitril/valsartan + enalapril is contraindicated', () => {
    const interaction = findInteraction('sacubitril_valsartan', 'enalapril');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('Entresto brand name resolves correctly', () => {
    const interaction = findInteraction('Entresto', 'lisinopril');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('eplerenone + ketoconazole is contraindicated', () => {
    const interaction = findInteraction('eplerenone', 'ketoconazole');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('hydralazine + metoprolol is moderate', () => {
    const interaction = findInteraction('hydralazine', 'metoprolol');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('moderate');
  });

  it('new cardiovascular drugs are in directory', () => {
    expect(drugDirectory.ranolazine).toBeDefined();
    expect(drugDirectory.ivabradine).toBeDefined();
    expect(drugDirectory.sacubitril_valsartan).toBeDefined();
    expect(drugDirectory.eplerenone).toBeDefined();
    expect(drugDirectory.hydralazine).toBeDefined();
  });
});

describe('Cross-Category Interaction Scenarios', () => {
  it('oncology patient on anticoagulation (capecitabine + warfarin)', () => {
    const meds = ['capecitabine', 'warfarin', 'ondansetron'];
    const interactions = findAllInteractions(meds);
    expect(interactions.some(i =>
      i.drug1 === 'capecitabine' && i.drug2 === 'warfarin' && i.severity === 'contraindicated'
    )).toBe(true);
  });

  it('HIV patient on cardiac meds (cobicistat + simvastatin + midazolam)', () => {
    const meds = ['cobicistat', 'simvastatin', 'midazolam'];
    const interactions = findAllInteractions(meds);
    expect(interactions.length).toBe(2);
    expect(interactions.every(i => i.severity === 'contraindicated')).toBe(true);
  });

  it('elderly dementia patient polypharmacy', () => {
    const meds = ['donepezil', 'oxybutynin', 'diphenhydramine', 'zolpidem', 'oxycodone'];
    const interactions = findAllInteractions(meds);
    expect(interactions.length).toBeGreaterThanOrEqual(3);
  });

  it('heart failure patient on Entresto + ACEi (sacubitril_valsartan + lisinopril)', () => {
    const meds = ['sacubitril_valsartan', 'lisinopril', 'furosemide', 'metoprolol'];
    const interactions = findAllInteractions(meds);
    expect(interactions.some(i => i.severity === 'contraindicated')).toBe(true);
  });

  it('psychiatric patient on clozapine + ciprofloxacin during infection', () => {
    const meds = ['clozapine', 'ciprofloxacin', 'lorazepam'];
    const interactions = findAllInteractions(meds);
    expect(interactions.some(i => i.severity === 'contraindicated')).toBe(true);
  });
});

describe('Drug Database Integrity - New Additions', () => {
  it('all new drug keys match genericName', () => {
    const newDrugs = [
      'cisplatin', 'carboplatin', 'doxorubicin', 'paclitaxel', 'docetaxel',
      'cyclophosphamide', 'fluorouracil', 'capecitabine', 'imatinib', 'erlotinib',
      'sorafenib', 'ibrutinib', 'venetoclax', 'pembrolizumab', 'nivolumab',
      'efavirenz', 'nevirapine', 'dolutegravir', 'raltegravir', 'tenofovir',
      'emtricitabine', 'abacavir', 'darunavir', 'cobicistat',
      'clozapine', 'risperidone', 'paliperidone', 'chlorpromazine', 'fluphenazine',
      'amitriptyline', 'nortriptyline', 'imipramine', 'desipramine', 'clomipramine',
      'methylphenidate', 'amphetamine', 'atomoxetine',
      'diphenhydramine', 'hydroxyzine', 'promethazine', 'oxybutynin', 'tolterodine',
      'donepezil', 'memantine', 'zolpidem', 'eszopiclone',
      'ranolazine', 'ivabradine', 'sacubitril_valsartan', 'eplerenone', 'hydralazine',
    ];

    for (const drug of newDrugs) {
      expect(drugDirectory[drug]).toBeDefined();
      expect(drugDirectory[drug].genericName).toBe(drug);
      expect(drugDirectory[drug].brandNames.length).toBeGreaterThan(0);
      expect(drugDirectory[drug].drugClass).toBeTruthy();
    }
  });

  it('drug directory has at least 185 drugs', () => {
    expect(Object.keys(drugDirectory).length).toBeGreaterThanOrEqual(185);
  });

  it('interactions database has at least 310 interactions', () => {
    expect(drugInteractions.length).toBeGreaterThanOrEqual(310);
  });

  it('all new interactions reference valid drugs', () => {
    for (const interaction of drugInteractions) {
      expect(drugDirectory[interaction.drug1]).toBeDefined();
      expect(drugDirectory[interaction.drug2]).toBeDefined();
    }
  });

  it('no duplicate interactions exist', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const i of drugInteractions) {
      const key = [i.drug1, i.drug2].sort().join('|');
      if (seen.has(key)) dupes.push(key);
      seen.add(key);
    }
    expect(dupes).toEqual([]);
  });
});

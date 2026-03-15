import { describe, it, expect } from 'vitest';
import {
  findInteraction,
  findAllInteractions,
  resolveToGeneric,
  drugDirectory,
  drugInteractions,
} from '../src/data/drug-interactions';

describe('Expanded Drug Directory - New Drugs', () => {
  describe('SGLT2 Inhibitors', () => {
    it('resolves empagliflozin generic', () => {
      expect(resolveToGeneric('empagliflozin')).toBe('empagliflozin');
    });
    it('resolves Jardiance to empagliflozin', () => {
      expect(resolveToGeneric('jardiance')).toBe('empagliflozin');
    });
    it('resolves dapagliflozin generic', () => {
      expect(resolveToGeneric('dapagliflozin')).toBe('dapagliflozin');
    });
    it('resolves Farxiga to dapagliflozin', () => {
      expect(resolveToGeneric('farxiga')).toBe('dapagliflozin');
    });
    it('resolves canagliflozin generic', () => {
      expect(resolveToGeneric('canagliflozin')).toBe('canagliflozin');
    });
    it('resolves Invokana to canagliflozin', () => {
      expect(resolveToGeneric('invokana')).toBe('canagliflozin');
    });
  });

  describe('GLP-1 Agonists', () => {
    it('resolves semaglutide generic', () => {
      expect(resolveToGeneric('semaglutide')).toBe('semaglutide');
    });
    it('resolves Ozempic to semaglutide', () => {
      expect(resolveToGeneric('ozempic')).toBe('semaglutide');
    });
    it('resolves Wegovy to semaglutide', () => {
      expect(resolveToGeneric('wegovy')).toBe('semaglutide');
    });
    it('resolves liraglutide generic', () => {
      expect(resolveToGeneric('liraglutide')).toBe('liraglutide');
    });
    it('resolves Victoza to liraglutide', () => {
      expect(resolveToGeneric('victoza')).toBe('liraglutide');
    });
    it('resolves dulaglutide generic', () => {
      expect(resolveToGeneric('dulaglutide')).toBe('dulaglutide');
    });
    it('resolves Trulicity to dulaglutide', () => {
      expect(resolveToGeneric('trulicity')).toBe('dulaglutide');
    });
  });

  describe('Newer Antidepressants', () => {
    it('resolves mirtazapine / Remeron', () => {
      expect(resolveToGeneric('mirtazapine')).toBe('mirtazapine');
      expect(resolveToGeneric('remeron')).toBe('mirtazapine');
    });
    it('resolves bupropion / Wellbutrin', () => {
      expect(resolveToGeneric('bupropion')).toBe('bupropion');
      expect(resolveToGeneric('wellbutrin')).toBe('bupropion');
    });
    it('resolves nefazodone', () => {
      expect(resolveToGeneric('nefazodone')).toBe('nefazodone');
    });
  });

  describe('Anticonvulsants', () => {
    it('resolves valproic acid / Depakote', () => {
      expect(resolveToGeneric('valproic_acid')).toBe('valproic_acid');
      expect(resolveToGeneric('depakote')).toBe('valproic_acid');
    });
    it('resolves lamotrigine / Lamictal', () => {
      expect(resolveToGeneric('lamotrigine')).toBe('lamotrigine');
      expect(resolveToGeneric('lamictal')).toBe('lamotrigine');
    });
    it('resolves levetiracetam / Keppra', () => {
      expect(resolveToGeneric('levetiracetam')).toBe('levetiracetam');
      expect(resolveToGeneric('keppra')).toBe('levetiracetam');
    });
    it('resolves topiramate / Topamax', () => {
      expect(resolveToGeneric('topiramate')).toBe('topiramate');
      expect(resolveToGeneric('topamax')).toBe('topiramate');
    });
  });

  describe('Newer Antiplatelets', () => {
    it('resolves ticagrelor / Brilinta', () => {
      expect(resolveToGeneric('ticagrelor')).toBe('ticagrelor');
      expect(resolveToGeneric('brilinta')).toBe('ticagrelor');
    });
    it('resolves prasugrel / Effient', () => {
      expect(resolveToGeneric('prasugrel')).toBe('prasugrel');
      expect(resolveToGeneric('effient')).toBe('prasugrel');
    });
    it('resolves fondaparinux / Arixtra', () => {
      expect(resolveToGeneric('fondaparinux')).toBe('fondaparinux');
      expect(resolveToGeneric('arixtra')).toBe('fondaparinux');
    });
  });

  describe('Blood Pressure Agents', () => {
    it('resolves ramipril / Altace', () => {
      expect(resolveToGeneric('ramipril')).toBe('ramipril');
      expect(resolveToGeneric('altace')).toBe('ramipril');
    });
    it('resolves candesartan / Atacand', () => {
      expect(resolveToGeneric('candesartan')).toBe('candesartan');
      expect(resolveToGeneric('atacand')).toBe('candesartan');
    });
    it('resolves doxazosin / Cardura', () => {
      expect(resolveToGeneric('doxazosin')).toBe('doxazosin');
      expect(resolveToGeneric('cardura')).toBe('doxazosin');
    });
    it('resolves clonidine / Catapres', () => {
      expect(resolveToGeneric('clonidine')).toBe('clonidine');
      expect(resolveToGeneric('catapres')).toBe('clonidine');
    });
    it('resolves nifedipine / Procardia', () => {
      expect(resolveToGeneric('nifedipine')).toBe('nifedipine');
      expect(resolveToGeneric('procardia')).toBe('nifedipine');
    });
  });

  describe('Other New Drugs', () => {
    it('resolves buspirone / Buspar', () => {
      expect(resolveToGeneric('buspirone')).toBe('buspirone');
      expect(resolveToGeneric('buspar')).toBe('buspirone');
    });
    it('resolves colchicine / Colcrys', () => {
      expect(resolveToGeneric('colchicine')).toBe('colchicine');
      expect(resolveToGeneric('colcrys')).toBe('colchicine');
    });
    it('resolves tamoxifen / Nolvadex', () => {
      expect(resolveToGeneric('tamoxifen')).toBe('tamoxifen');
      expect(resolveToGeneric('nolvadex')).toBe('tamoxifen');
    });
    it('resolves doxycycline / Vibramycin', () => {
      expect(resolveToGeneric('doxycycline')).toBe('doxycycline');
      expect(resolveToGeneric('vibramycin')).toBe('doxycycline');
    });
    it('resolves trimethoprim / Bactrim', () => {
      expect(resolveToGeneric('trimethoprim')).toBe('trimethoprim');
      expect(resolveToGeneric('bactrim')).toBe('trimethoprim');
    });
    it('resolves glipizide / Glucotrol', () => {
      expect(resolveToGeneric('glipizide')).toBe('glipizide');
      expect(resolveToGeneric('glucotrol')).toBe('glipizide');
    });
    it('resolves glyburide / Diabeta', () => {
      expect(resolveToGeneric('glyburide')).toBe('glyburide');
      expect(resolveToGeneric('diabeta')).toBe('glyburide');
    });
    it('resolves pioglitazone / Actos', () => {
      expect(resolveToGeneric('pioglitazone')).toBe('pioglitazone');
      expect(resolveToGeneric('actos')).toBe('pioglitazone');
    });
    it('resolves esomeprazole / Nexium', () => {
      expect(resolveToGeneric('esomeprazole')).toBe('esomeprazole');
      expect(resolveToGeneric('nexium')).toBe('esomeprazole');
    });
    it('resolves lansoprazole / Prevacid', () => {
      expect(resolveToGeneric('lansoprazole')).toBe('lansoprazole');
      expect(resolveToGeneric('prevacid')).toBe('lansoprazole');
    });
    it('resolves meropenem / Merrem', () => {
      expect(resolveToGeneric('meropenem')).toBe('meropenem');
      expect(resolveToGeneric('merrem')).toBe('meropenem');
    });
  });
});

describe('Expanded Drug Interactions - SGLT2 Inhibitors', () => {
  it('empagliflozin + furosemide: dehydration risk', () => {
    const i = findInteraction('empagliflozin', 'furosemide');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('moderate');
    expect(i!.mechanism).toContain('diuretic');
  });

  it('dapagliflozin + hydrochlorothiazide: volume depletion', () => {
    const i = findInteraction('dapagliflozin', 'hydrochlorothiazide');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('moderate');
  });

  it('canagliflozin + insulin: hypoglycemia risk', () => {
    const i = findInteraction('canagliflozin', 'insulin');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('moderate');
  });

  it('empagliflozin + insulin: hypoglycemia risk', () => {
    const i = findInteraction('empagliflozin', 'insulin');
    expect(i).not.toBeNull();
  });

  it('SGLT2 interactions via brand names', () => {
    const i = findInteraction('jardiance', 'lasix');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('moderate');
  });
});

describe('Expanded Drug Interactions - GLP-1 Agonists', () => {
  it('semaglutide + insulin: hypoglycemia risk', () => {
    const i = findInteraction('semaglutide', 'insulin');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });

  it('liraglutide + glipizide: hypoglycemia risk', () => {
    const i = findInteraction('liraglutide', 'glipizide');
    expect(i).not.toBeNull();
  });

  it('semaglutide + warfarin: absorption change', () => {
    const i = findInteraction('semaglutide', 'warfarin');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('moderate');
  });

  it('Ozempic + insulin via brand names', () => {
    const i = findInteraction('ozempic', 'lantus');
    expect(i).not.toBeNull();
  });
});

describe('Expanded Drug Interactions - Valproic Acid', () => {
  it('valproic acid + lamotrigine: SJS risk (major)', () => {
    const i = findInteraction('valproic_acid', 'lamotrigine');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
    expect(i!.clinicalEffect).toContain('Stevens-Johnson');
  });

  it('valproic acid + meropenem: contraindicated', () => {
    const i = findInteraction('valproic_acid', 'meropenem');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('contraindicated');
  });

  it('valproic acid + carbamazepine: bidirectional', () => {
    const i = findInteraction('valproic_acid', 'carbamazepine');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });

  it('valproic acid + aspirin: free valproate increase', () => {
    const i = findInteraction('valproic_acid', 'aspirin');
    expect(i).not.toBeNull();
  });

  it('Depakote + Lamictal via brand names', () => {
    const i = findInteraction('depakote', 'lamictal');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });
});

describe('Expanded Drug Interactions - Ticagrelor', () => {
  it('ticagrelor + ketoconazole: contraindicated', () => {
    const i = findInteraction('ticagrelor', 'ketoconazole');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('contraindicated');
  });

  it('ticagrelor + clarithromycin: major', () => {
    const i = findInteraction('ticagrelor', 'clarithromycin');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });

  it('ticagrelor + simvastatin: dose limit', () => {
    const i = findInteraction('ticagrelor', 'simvastatin');
    expect(i).not.toBeNull();
  });

  it('ticagrelor + digoxin: P-gp inhibition', () => {
    const i = findInteraction('ticagrelor', 'digoxin');
    expect(i).not.toBeNull();
  });

  it('Brilinta + aspirin: dose-dependent', () => {
    const i = findInteraction('brilinta', 'aspirin');
    expect(i).not.toBeNull();
  });
});

describe('Expanded Drug Interactions - Colchicine', () => {
  it('colchicine + clarithromycin: contraindicated', () => {
    const i = findInteraction('colchicine', 'clarithromycin');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('contraindicated');
  });

  it('colchicine + ketoconazole: contraindicated', () => {
    const i = findInteraction('colchicine', 'ketoconazole');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('contraindicated');
  });

  it('colchicine + ritonavir: contraindicated', () => {
    const i = findInteraction('colchicine', 'ritonavir');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('contraindicated');
  });

  it('colchicine + cyclosporine: major toxicity risk', () => {
    const i = findInteraction('colchicine', 'cyclosporine');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });

  it('Colcrys + atorvastatin: rhabdomyolysis risk', () => {
    const i = findInteraction('colcrys', 'lipitor');
    expect(i).not.toBeNull();
  });
});

describe('Expanded Drug Interactions - Tamoxifen + CYP2D6', () => {
  it('tamoxifen + fluoxetine: reduced efficacy', () => {
    const i = findInteraction('tamoxifen', 'fluoxetine');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
    expect(i!.management).toContain('CYP2D6');
  });

  it('tamoxifen + paroxetine: reduced efficacy', () => {
    const i = findInteraction('tamoxifen', 'paroxetine');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });

  it('tamoxifen + bupropion: moderate CYP2D6 inhibition', () => {
    const i = findInteraction('tamoxifen', 'bupropion');
    expect(i).not.toBeNull();
  });

  it('Nolvadex + Prozac via brand names', () => {
    const i = findInteraction('nolvadex', 'prozac');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });
});

describe('Expanded Drug Interactions - Bupropion', () => {
  it('bupropion + phenelzine: contraindicated', () => {
    const i = findInteraction('bupropion', 'phenelzine');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('contraindicated');
  });

  it('bupropion + tramadol: seizure risk', () => {
    const i = findInteraction('bupropion', 'tramadol');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });

  it('bupropion + metoprolol: CYP2D6 inhibition', () => {
    const i = findInteraction('bupropion', 'metoprolol');
    expect(i).not.toBeNull();
  });
});

describe('Expanded Drug Interactions - Clonidine', () => {
  it('clonidine + metoprolol: rebound hypertension risk', () => {
    const i = findInteraction('clonidine', 'metoprolol');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
    expect(i!.clinicalEffect).toContain('rebound');
  });

  it('clonidine + verapamil: excessive bradycardia', () => {
    const i = findInteraction('clonidine', 'verapamil');
    expect(i).not.toBeNull();
  });
});

describe('Expanded Drug Interactions - Nifedipine', () => {
  it('nifedipine + metoprolol: excessive hypotension', () => {
    const i = findInteraction('nifedipine', 'metoprolol');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('moderate');
  });

  it('nifedipine + phenytoin: reduced levels', () => {
    const i = findInteraction('nifedipine', 'phenytoin');
    expect(i).not.toBeNull();
  });

  it('nifedipine + rifampin: reduced efficacy', () => {
    const i = findInteraction('nifedipine', 'rifampin');
    expect(i).not.toBeNull();
  });
});

describe('Expanded Drug Interactions - Pioglitazone', () => {
  it('pioglitazone + insulin: fluid retention / HF risk', () => {
    const i = findInteraction('pioglitazone', 'insulin');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });

  it('pioglitazone + furosemide: fluid retention', () => {
    const i = findInteraction('pioglitazone', 'furosemide');
    expect(i).not.toBeNull();
  });

  it('Actos + insulin via brand names', () => {
    const i = findInteraction('actos', 'lantus');
    expect(i).not.toBeNull();
  });
});

describe('Expanded Drug Interactions - Trimethoprim', () => {
  it('trimethoprim + methotrexate: bone marrow suppression', () => {
    const i = findInteraction('trimethoprim', 'methotrexate');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });

  it('trimethoprim + warfarin: increased INR', () => {
    const i = findInteraction('trimethoprim', 'warfarin');
    expect(i).not.toBeNull();
  });

  it('trimethoprim + spironolactone: hyperkalemia', () => {
    const i = findInteraction('trimethoprim', 'spironolactone');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });

  it('trimethoprim + lisinopril: hyperkalemia risk', () => {
    const i = findInteraction('trimethoprim', 'lisinopril');
    expect(i).not.toBeNull();
  });
});

describe('Expanded Drug Interactions - Nefazodone', () => {
  it('nefazodone + simvastatin: contraindicated (rhabdomyolysis)', () => {
    const i = findInteraction('nefazodone', 'simvastatin');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('contraindicated');
  });

  it('nefazodone + midazolam: contraindicated (excessive sedation)', () => {
    const i = findInteraction('nefazodone', 'midazolam');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('contraindicated');
  });
});

describe('Expanded Drug Interactions - DOACs with CYP3A4/P-gp', () => {
  it('apixaban + ketoconazole: dose reduction needed', () => {
    const i = findInteraction('apixaban', 'ketoconazole');
    expect(i).not.toBeNull();
  });

  it('rivaroxaban + ketoconazole: avoid combination', () => {
    const i = findInteraction('rivaroxaban', 'ketoconazole');
    expect(i).not.toBeNull();
  });

  it('apixaban + rifampin: reduced efficacy', () => {
    const i = findInteraction('apixaban', 'rifampin');
    expect(i).not.toBeNull();
  });

  it('Eliquis + ketoconazole via brand names', () => {
    const i = findInteraction('eliquis', 'nizoral');
    expect(i).not.toBeNull();
  });
});

describe('Expanded Drug Interactions - PPI Interactions', () => {
  it('esomeprazole + clopidogrel: reduced antiplatelet effect', () => {
    const i = findInteraction('esomeprazole', 'clopidogrel');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });

  it('lansoprazole + methotrexate: delayed clearance', () => {
    const i = findInteraction('lansoprazole', 'methotrexate');
    expect(i).not.toBeNull();
  });

  it('Nexium + Plavix via brand names', () => {
    const i = findInteraction('nexium', 'plavix');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });
});

describe('Expanded Drug Interactions - Doxazosin', () => {
  it('doxazosin + sildenafil: excessive hypotension', () => {
    const i = findInteraction('doxazosin', 'sildenafil');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('major');
  });

  it('doxazosin + tadalafil: excessive hypotension', () => {
    const i = findInteraction('doxazosin', 'tadalafil');
    expect(i).not.toBeNull();
  });
});

describe('Expanded Drug Interactions - Mirtazapine', () => {
  it('mirtazapine + phenelzine: serotonin syndrome risk', () => {
    const i = findInteraction('mirtazapine', 'phenelzine');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('contraindicated');
  });
});

describe('Expanded Drug Interactions - Buspirone', () => {
  it('buspirone + phenelzine: hypertensive crisis risk', () => {
    const i = findInteraction('buspirone', 'phenelzine');
    expect(i).not.toBeNull();
    expect(i!.severity).toBe('contraindicated');
  });
});

describe('Expanded Interactions - Multi-Drug Scenarios', () => {
  it('diabetic polypharmacy with new drugs', () => {
    const meds = ['semaglutide', 'metformin', 'empagliflozin', 'insulin', 'atorvastatin'];
    const interactions = findAllInteractions(meds);
    expect(interactions.length).toBeGreaterThan(0);
    const hasSemaglutideInsulin = interactions.some(
      i => (i.drug1 === 'semaglutide' && i.drug2 === 'insulin') ||
           (i.drug1 === 'insulin' && i.drug2 === 'semaglutide')
    );
    expect(hasSemaglutideInsulin).toBe(true);
  });

  it('cardiovascular polypharmacy with new drugs', () => {
    const meds = ['ticagrelor', 'aspirin', 'atorvastatin', 'ramipril', 'metoprolol'];
    const interactions = findAllInteractions(meds);
    expect(interactions.length).toBeGreaterThan(0);
  });

  it('pain + anticoagulant polypharmacy', () => {
    const meds = ['colchicine', 'apixaban', 'atorvastatin', 'omeprazole'];
    const interactions = findAllInteractions(meds);
    expect(interactions.length).toBeGreaterThan(0);
  });

  it('psychiatric polypharmacy with newer agents', () => {
    const meds = ['bupropion', 'lamotrigine', 'buspirone', 'gabapentin'];
    const interactions = findAllInteractions(meds);
    // bupropion may have some interactions
    expect(interactions).toBeDefined();
  });

  it('oncology patient on tamoxifen + SSRIs', () => {
    const meds = ['tamoxifen', 'fluoxetine', 'omeprazole', 'metformin'];
    const interactions = findAllInteractions(meds);
    const hasTamoxifenSSRI = interactions.some(
      i => (i.drug1 === 'tamoxifen' && i.drug2 === 'fluoxetine') ||
           (i.drug1 === 'fluoxetine' && i.drug2 === 'tamoxifen')
    );
    expect(hasTamoxifenSSRI).toBe(true);
    expect(interactions[0].severity).toBe('major');
  });

  it('elderly patient with gout + cardiovascular disease', () => {
    const meds = ['colchicine', 'atorvastatin', 'apixaban', 'amlodipine', 'lisinopril'];
    const interactions = findAllInteractions(meds);
    expect(interactions.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Database Integrity - Expanded', () => {
  it('all interaction drug1 references exist in directory', () => {
    const missing: string[] = [];
    for (const interaction of drugInteractions) {
      if (!drugDirectory[interaction.drug1]) {
        missing.push(interaction.drug1);
      }
    }
    expect(missing).toEqual([]);
  });

  it('all interaction drug2 references exist in directory', () => {
    const missing: string[] = [];
    for (const interaction of drugInteractions) {
      if (!drugDirectory[interaction.drug2]) {
        missing.push(interaction.drug2);
      }
    }
    expect(missing).toEqual([]);
  });

  it('no duplicate interactions exist', () => {
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (const interaction of drugInteractions) {
      const key = [interaction.drug1, interaction.drug2].sort().join('|');
      if (seen.has(key)) {
        duplicates.push(key);
      }
      seen.add(key);
    }
    expect(duplicates).toEqual([]);
  });

  it('all interactions have valid severity', () => {
    const validSeverities = ['contraindicated', 'major', 'moderate', 'minor'];
    for (const interaction of drugInteractions) {
      expect(validSeverities).toContain(interaction.severity);
    }
  });

  it('all interactions have non-empty descriptions', () => {
    for (const interaction of drugInteractions) {
      expect(interaction.description.length).toBeGreaterThan(0);
      expect(interaction.mechanism.length).toBeGreaterThan(0);
      expect(interaction.clinicalEffect.length).toBeGreaterThan(0);
      expect(interaction.management.length).toBeGreaterThan(0);
    }
  });

  it('drug directory has at least 135 drugs', () => {
    expect(Object.keys(drugDirectory).length).toBeGreaterThanOrEqual(135);
  });

  it('interactions database has at least 265 interactions', () => {
    expect(drugInteractions.length).toBeGreaterThanOrEqual(265);
  });
});

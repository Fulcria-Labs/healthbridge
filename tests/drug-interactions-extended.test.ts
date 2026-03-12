import { describe, it, expect } from 'vitest';
import {
  findInteraction,
  findAllInteractions,
  resolveToGeneric,
  getClassInteractions,
  drugDirectory,
  drugInteractions,
} from '../src/data/drug-interactions';
import { checkDrugInteractions } from '../src/tools/drug-interaction-tool';

describe('getClassInteractions (untested function)', () => {
  it('finds interactions between nsaid and anticoagulant classes', () => {
    const interactions = getClassInteractions('nsaid', 'anticoagulant');
    expect(interactions.length).toBeGreaterThanOrEqual(1);
    expect(interactions.some(i => i.drug1 === 'warfarin' || i.drug2 === 'warfarin')).toBe(true);
  });

  it('finds interactions between ssri and maoi classes', () => {
    const interactions = getClassInteractions('ssri', 'maoi');
    expect(interactions.length).toBeGreaterThanOrEqual(1);
    expect(interactions.some(i => i.severity === 'contraindicated')).toBe(true);
  });

  it('returns empty array for non-interacting classes', () => {
    const interactions = getClassInteractions('biguanide', 'calcium-channel-blocker');
    expect(interactions).toHaveLength(0);
  });

  it('is order-independent for class names', () => {
    const forward = getClassInteractions('ssri', 'maoi');
    const reverse = getClassInteractions('maoi', 'ssri');
    expect(forward.length).toBe(reverse.length);
  });

  it('finds statin + azole-antifungal interactions', () => {
    const interactions = getClassInteractions('statin', 'azole-antifungal');
    expect(interactions.length).toBeGreaterThanOrEqual(1);
  });

  it('finds interactions between pde5-inhibitor and nitrate', () => {
    const interactions = getClassInteractions('pde5-inhibitor', 'nitrate');
    expect(interactions.length).toBeGreaterThanOrEqual(1);
    expect(interactions.some(i => i.severity === 'contraindicated')).toBe(true);
  });

  it('returns empty for non-existent class', () => {
    const interactions = getClassInteractions('non-existent-class', 'nsaid');
    expect(interactions).toHaveLength(0);
  });
});

describe('Drug Directory Integrity', () => {
  it('all drugs in interaction database exist in directory', () => {
    for (const interaction of drugInteractions) {
      expect(drugDirectory[interaction.drug1]).toBeDefined();
      expect(drugDirectory[interaction.drug2]).toBeDefined();
    }
  });

  it('all drugs have non-empty brand names array', () => {
    for (const [generic, info] of Object.entries(drugDirectory)) {
      expect(info.brandNames.length).toBeGreaterThanOrEqual(1);
      // genericName may differ from the key (e.g., 'potassium' key -> 'potassium chloride' genericName)
      expect(info.genericName).toBeTruthy();
    }
  });

  it('no duplicate brand names across drugs', () => {
    const allBrands = new Set<string>();
    for (const [, info] of Object.entries(drugDirectory)) {
      for (const brand of info.brandNames) {
        expect(allBrands.has(brand)).toBe(false);
        allBrands.add(brand);
      }
    }
  });

  it('all drug classes are non-empty strings', () => {
    for (const [, info] of Object.entries(drugDirectory)) {
      expect(info.drugClass).toBeTruthy();
      expect(typeof info.drugClass).toBe('string');
    }
  });

  it('all interaction fields are non-empty', () => {
    for (const interaction of drugInteractions) {
      expect(interaction.description).toBeTruthy();
      expect(interaction.mechanism).toBeTruthy();
      expect(interaction.clinicalEffect).toBeTruthy();
      expect(interaction.management).toBeTruthy();
      expect(['contraindicated', 'major', 'moderate', 'minor']).toContain(interaction.severity);
    }
  });
});

describe('Drug Name Resolution Edge Cases', () => {
  it('resolves empty string to null', () => {
    expect(resolveToGeneric('')).toBeNull();
  });

  it('resolves whitespace-only to null', () => {
    expect(resolveToGeneric('   ')).toBeNull();
  });

  it('handles mixed case brand names', () => {
    expect(resolveToGeneric('CoUmAdIn')).toBe('warfarin');
    expect(resolveToGeneric('LIPITOR')).toBe('atorvastatin');
    expect(resolveToGeneric('Zoloft')).toBe('sertraline');
  });

  it('resolves all brand names for warfarin', () => {
    expect(resolveToGeneric('coumadin')).toBe('warfarin');
    expect(resolveToGeneric('jantoven')).toBe('warfarin');
  });

  it('resolves brand names for opioids', () => {
    expect(resolveToGeneric('vicodin')).toBe('hydrocodone');
    expect(resolveToGeneric('norco')).toBe('hydrocodone');
    expect(resolveToGeneric('oxycontin')).toBe('oxycodone');
    expect(resolveToGeneric('percocet')).toBe('oxycodone');
    expect(resolveToGeneric('ultram')).toBe('tramadol');
  });

  it('resolves brand names for cardiac drugs', () => {
    expect(resolveToGeneric('lanoxin')).toBe('digoxin');
    expect(resolveToGeneric('cordarone')).toBe('amiodarone');
    expect(resolveToGeneric('pacerone')).toBe('amiodarone');
    expect(resolveToGeneric('lopressor')).toBe('metoprolol');
    expect(resolveToGeneric('toprol')).toBe('metoprolol');
  });

  it('resolves brand names for psychiatric drugs', () => {
    expect(resolveToGeneric('nardil')).toBe('phenelzine');
    expect(resolveToGeneric('parnate')).toBe('tranylcypromine');
    expect(resolveToGeneric('lithobid')).toBe('lithium');
    expect(resolveToGeneric('eskalith')).toBe('lithium');
    expect(resolveToGeneric('paxil')).toBe('paroxetine');
  });

  it('resolves brand names for antifungals and antibiotics', () => {
    expect(resolveToGeneric('nizoral')).toBe('ketoconazole');
    expect(resolveToGeneric('rifadin')).toBe('rifampin');
    expect(resolveToGeneric('cipro')).toBe('ciprofloxacin');
    expect(resolveToGeneric('amoxil')).toBe('amoxicillin');
    expect(resolveToGeneric('zithromax')).toBe('azithromycin');
    expect(resolveToGeneric('z-pack')).toBe('azithromycin');
  });

  it('resolves brand names for diuretics', () => {
    expect(resolveToGeneric('lasix')).toBe('furosemide');
    expect(resolveToGeneric('aldactone')).toBe('spironolactone');
    expect(resolveToGeneric('microzide')).toBe('hydrochlorothiazide');
  });

  it('resolves brand names for PDE5 inhibitors and nitrates', () => {
    expect(resolveToGeneric('viagra')).toBe('sildenafil');
    expect(resolveToGeneric('revatio')).toBe('sildenafil');
    expect(resolveToGeneric('cialis')).toBe('tadalafil');
    expect(resolveToGeneric('adcirca')).toBe('tadalafil');
    expect(resolveToGeneric('nitrostat')).toBe('nitroglycerin');
    expect(resolveToGeneric('imdur')).toBe('isosorbide');
  });

  it('resolves brand names for anticonvulsants', () => {
    expect(resolveToGeneric('tegretol')).toBe('carbamazepine');
    expect(resolveToGeneric('dilantin')).toBe('phenytoin');
  });

  it('resolves brand names for calcium channel blockers', () => {
    expect(resolveToGeneric('norvasc')).toBe('amlodipine');
    expect(resolveToGeneric('calan')).toBe('verapamil');
    expect(resolveToGeneric('verelan')).toBe('verapamil');
    expect(resolveToGeneric('cardizem')).toBe('diltiazem');
    expect(resolveToGeneric('tiazac')).toBe('diltiazem');
  });

  it('resolves brand names for immunosuppressants', () => {
    expect(resolveToGeneric('neoral')).toBe('cyclosporine');
    expect(resolveToGeneric('sandimmune')).toBe('cyclosporine');
    expect(resolveToGeneric('imuran')).toBe('azathioprine');
    expect(resolveToGeneric('trexall')).toBe('methotrexate');
  });
});

describe('findInteraction Edge Cases', () => {
  it('returns null when both drugs are the same', () => {
    const interaction = findInteraction('warfarin', 'warfarin');
    expect(interaction).toBeNull();
  });

  it('returns null when both drugs are unknown', () => {
    const interaction = findInteraction('unknowndrug1', 'unknowndrug2');
    expect(interaction).toBeNull();
  });

  it('returns null when first drug is unknown', () => {
    const interaction = findInteraction('unknowndrug', 'warfarin');
    expect(interaction).toBeNull();
  });

  it('tadalafil + nitroglycerin contraindication', () => {
    const interaction = findInteraction('tadalafil', 'nitroglycerin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('sildenafil + isosorbide contraindication', () => {
    const interaction = findInteraction('sildenafil', 'isosorbide');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('allopurinol + azathioprine interaction', () => {
    const interaction = findInteraction('allopurinol', 'azathioprine');
    expect(interaction).not.toBeNull();
  });

  it('methotrexate + nsaid interaction', () => {
    const interaction = findInteraction('methotrexate', 'ibuprofen');
    expect(interaction).not.toBeNull();
  });

  it('spironolactone + ACE inhibitor hyperkalemia risk', () => {
    const interaction = findInteraction('spironolactone', 'lisinopril');
    expect(interaction).not.toBeNull();
  });
});

describe('findAllInteractions Edge Cases', () => {
  it('returns empty for empty array', () => {
    const results = findAllInteractions([]);
    expect(results).toHaveLength(0);
  });

  it('returns empty for all unknown drugs', () => {
    const results = findAllInteractions(['fake1', 'fake2', 'fake3']);
    expect(results).toHaveLength(0);
  });

  it('handles duplicate medications', () => {
    const results = findAllInteractions(['warfarin', 'warfarin', 'aspirin']);
    // Should still find warfarin-aspirin once or handle duplicates gracefully
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('handles large medication lists', () => {
    const meds = ['warfarin', 'aspirin', 'ibuprofen', 'fluoxetine', 'phenelzine', 'metformin', 'lisinopril', 'losartan'];
    const results = findAllInteractions(meds);
    expect(results.length).toBeGreaterThanOrEqual(5);
  });

  it('correctly deduplicates when using brand and generic names', () => {
    const results = findAllInteractions(['warfarin', 'Advil']);
    const results2 = findAllInteractions(['warfarin', 'ibuprofen']);
    expect(results.length).toBe(results2.length);
  });
});

describe('checkDrugInteractions Tool Extended', () => {
  it('returns correct structure for two medications', () => {
    const result = checkDrugInteractions({ medications: ['warfarin', 'aspirin'] });
    expect(result.medicationCount).toBe(2);
    expect(result.resolvedMedications).toHaveLength(2);
    expect(result.resolvedMedications[0].generic).toBe('warfarin');
    expect(result.resolvedMedications[0].drugClass).toBe('anticoagulant');
  });

  it('reports correct drug class for resolved medications', () => {
    const result = checkDrugInteractions({
      medications: ['fluoxetine', 'metformin', 'amlodipine'],
    });
    const ssri = result.resolvedMedications.find(r => r.generic === 'fluoxetine');
    expect(ssri?.drugClass).toBe('ssri');
    const met = result.resolvedMedications.find(r => r.generic === 'metformin');
    expect(met?.drugClass).toBe('biguanide');
    const aml = result.resolvedMedications.find(r => r.generic === 'amlodipine');
    expect(aml?.drugClass).toBe('calcium-channel-blocker');
  });

  it('summary includes major interaction count', () => {
    const result = checkDrugInteractions({ medications: ['warfarin', 'aspirin', 'metformin'] });
    const majorCount = result.interactions.filter(i => i.severity === 'major').length;
    if (majorCount > 0) {
      expect(result.summary).toContain('major');
    }
  });

  it('summary includes moderate interaction count', () => {
    const result = checkDrugInteractions({ medications: ['lisinopril', 'ibuprofen', 'metformin'] });
    const modCount = result.interactions.filter(i => i.severity === 'moderate').length;
    if (modCount > 0) {
      expect(result.summary).toContain('moderate');
    }
  });

  it('handles all unknown medications gracefully', () => {
    const result = checkDrugInteractions({ medications: ['fakemed1', 'fakemed2'] });
    expect(result.unresolvedMedications).toContain('fakemed1');
    expect(result.unresolvedMedications).toContain('fakemed2');
    expect(result.interactionsFound).toBe(0);
  });

  it('handles mix of known and unknown medications', () => {
    const result = checkDrugInteractions({ medications: ['warfarin', 'unknowndrug', 'aspirin'] });
    expect(result.unresolvedMedications).toContain('unknowndrug');
    expect(result.interactionsFound).toBeGreaterThanOrEqual(1);
  });

  it('interaction output has all required fields', () => {
    const result = checkDrugInteractions({ medications: ['warfarin', 'aspirin'] });
    for (const interaction of result.interactions) {
      expect(interaction.drug1).toBeTruthy();
      expect(interaction.drug2).toBeTruthy();
      expect(interaction.severity).toBeTruthy();
      expect(interaction.description).toBeTruthy();
      expect(interaction.mechanism).toBeTruthy();
      expect(interaction.clinicalEffect).toBeTruthy();
      expect(interaction.management).toBeTruthy();
    }
  });
});

describe('Drug Interaction Severity Counts', () => {
  it('counts contraindicated interactions in polypharmacy', () => {
    const result = checkDrugInteractions({
      medications: ['fluoxetine', 'phenelzine', 'simvastatin', 'clarithromycin'],
    });
    const contraindicated = result.interactions.filter(i => i.severity === 'contraindicated');
    expect(contraindicated.length).toBeGreaterThanOrEqual(2);
  });

  it('no minor interactions when only major/contraindicated exist', () => {
    const result = checkDrugInteractions({
      medications: ['fluoxetine', 'phenelzine'],
    });
    const minor = result.interactions.filter(i => i.severity === 'minor');
    expect(minor).toHaveLength(0);
  });
});

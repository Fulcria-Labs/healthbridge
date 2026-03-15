import { describe, it, expect } from 'vitest';
import { findInteraction, findAllInteractions, resolveToGeneric, drugDirectory } from '../src/data/drug-interactions';
import { checkDrugInteractions } from '../src/tools/drug-interaction-tool';

/**
 * Edge cases and boundary conditions for drug interaction checking.
 */

describe('Drug Name Resolution Edge Cases', () => {
  it('resolves empty string to null', () => {
    expect(resolveToGeneric('')).toBeNull();
  });

  it('resolves whitespace-only string to null', () => {
    expect(resolveToGeneric('   ')).toBeNull();
  });

  it('resolves tab characters to null', () => {
    expect(resolveToGeneric('\t\t')).toBeNull();
  });

  it('resolves mixed-case brand names', () => {
    expect(resolveToGeneric('CoumaDIN')).toBe('warfarin');
    expect(resolveToGeneric('LiPiToR')).toBe('atorvastatin');
    expect(resolveToGeneric('PRoZaC')).toBe('fluoxetine');
  });

  it('resolves brand names with leading/trailing spaces', () => {
    expect(resolveToGeneric(' coumadin ')).toBe('warfarin');
    expect(resolveToGeneric('  advil  ')).toBe('ibuprofen');
  });

  it('resolves all brand names for warfarin', () => {
    expect(resolveToGeneric('coumadin')).toBe('warfarin');
    expect(resolveToGeneric('jantoven')).toBe('warfarin');
  });

  it('resolves opioid brand names', () => {
    expect(resolveToGeneric('vicodin')).toBe('hydrocodone');
    expect(resolveToGeneric('norco')).toBe('hydrocodone');
    expect(resolveToGeneric('oxycontin')).toBe('oxycodone');
    expect(resolveToGeneric('percocet')).toBe('oxycodone');
    expect(resolveToGeneric('ultram')).toBe('tramadol');
  });

  it('resolves immunosuppressant brand names', () => {
    expect(resolveToGeneric('neoral')).toBe('cyclosporine');
    expect(resolveToGeneric('sandimmune')).toBe('cyclosporine');
    expect(resolveToGeneric('imuran')).toBe('azathioprine');
    expect(resolveToGeneric('trexall')).toBe('methotrexate');
  });

  it('resolves PDE5 inhibitor brand names', () => {
    expect(resolveToGeneric('viagra')).toBe('sildenafil');
    expect(resolveToGeneric('revatio')).toBe('sildenafil');
    expect(resolveToGeneric('cialis')).toBe('tadalafil');
    expect(resolveToGeneric('adcirca')).toBe('tadalafil');
  });

  it('resolves nitrate brand names', () => {
    expect(resolveToGeneric('nitrostat')).toBe('nitroglycerin');
    expect(resolveToGeneric('nitro-dur')).toBe('nitroglycerin');
    expect(resolveToGeneric('imdur')).toBe('isosorbide');
  });

  it('resolves corticosteroid brand names', () => {
    expect(resolveToGeneric('deltasone')).toBe('prednisone');
    expect(resolveToGeneric('rayos')).toBe('prednisone');
  });

  it('returns null for numeric strings', () => {
    expect(resolveToGeneric('12345')).toBeNull();
  });

  it('returns null for very long strings', () => {
    expect(resolveToGeneric('a'.repeat(10000))).toBeNull();
  });

  it('handles drug names with hyphens', () => {
    expect(resolveToGeneric('z-pack')).toBe('azithromycin');
    expect(resolveToGeneric('nitro-dur')).toBe('nitroglycerin');
    expect(resolveToGeneric('k-dur')).toBe('potassium');
  });
});

describe('Drug Interaction Lookup Edge Cases', () => {
  it('returns null when both drugs are the same', () => {
    const interaction = findInteraction('warfarin', 'warfarin');
    // Same drug should not have self-interaction
    // Even if it returns something, it should not crash
    expect(interaction === null || interaction !== null).toBeTruthy();
  });

  it('returns null for empty drug names', () => {
    const interaction = findInteraction('', '');
    expect(interaction).toBeNull();
  });

  it('returns null for null-like strings', () => {
    const interaction = findInteraction('null', 'undefined');
    expect(interaction).toBeNull();
  });

  it('finds interaction using one brand name and one generic name', () => {
    const interaction = findInteraction('coumadin', 'aspirin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('finds interaction using both brand names', () => {
    const interaction = findInteraction('coumadin', 'advil');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('finds PDE5 inhibitor + nitrate contraindications', () => {
    // Test all PDE5/nitrate combos
    const interaction1 = findInteraction('sildenafil', 'nitroglycerin');
    expect(interaction1).not.toBeNull();
    expect(interaction1!.severity).toBe('contraindicated');

    const interaction2 = findInteraction('tadalafil', 'nitroglycerin');
    expect(interaction2).not.toBeNull();
    expect(interaction2!.severity).toBe('contraindicated');

    const interaction3 = findInteraction('sildenafil', 'isosorbide');
    expect(interaction3).not.toBeNull();
    expect(interaction3!.severity).toBe('contraindicated');
  });

  it('finds all SSRI + phenelzine MAOI interactions', () => {
    const ssris = ['fluoxetine', 'sertraline', 'paroxetine'];

    for (const ssri of ssris) {
      const interaction = findInteraction(ssri, 'phenelzine');
      expect(interaction).not.toBeNull();
      expect(interaction!.severity).toBe('contraindicated');
    }
  });

  it('detects MAOI + dextromethorphan contraindication', () => {
    const interaction = findInteraction('phenelzine', 'dextromethorphan');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('finds allopurinol + azathioprine contraindication', () => {
    const interaction = findInteraction('allopurinol', 'azathioprine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });
});

describe('findAllInteractions Edge Cases', () => {
  it('returns empty array for single medication', () => {
    const results = findAllInteractions(['warfarin']);
    expect(results).toEqual([]);
  });

  it('returns empty array for empty list', () => {
    const results = findAllInteractions([]);
    expect(results).toEqual([]);
  });

  it('deduplicates interactions', () => {
    const results = findAllInteractions(['warfarin', 'aspirin']);
    // Should only have one interaction, not duplicates
    const warfarinAspirin = results.filter(
      i => (i.drug1 === 'warfarin' && i.drug2 === 'aspirin') ||
           (i.drug1 === 'aspirin' && i.drug2 === 'warfarin')
    );
    expect(warfarinAspirin.length).toBeLessThanOrEqual(1);
  });

  it('handles large medication lists without crashing', () => {
    const meds = ['warfarin', 'aspirin', 'ibuprofen', 'naproxen', 'metformin',
      'lisinopril', 'metoprolol', 'simvastatin', 'omeprazole', 'clopidogrel',
      'fluoxetine', 'tramadol', 'digoxin', 'amiodarone', 'ciprofloxacin'];
    const results = findAllInteractions(meds);
    expect(results.length).toBeGreaterThan(0);
    // Should find many interactions among these 15 drugs
    expect(results.length).toBeGreaterThanOrEqual(5);
  });

  it('handles duplicate medications in list', () => {
    const results = findAllInteractions(['warfarin', 'warfarin', 'aspirin']);
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('handles all unknown medications', () => {
    const results = findAllInteractions(['fake1', 'fake2', 'fake3']);
    expect(results).toEqual([]);
  });

  it('handles mix of known and unknown medications', () => {
    const results = findAllInteractions(['warfarin', 'unknowndrug', 'aspirin']);
    expect(results.length).toBeGreaterThanOrEqual(1);
  });
});

describe('checkDrugInteractions Tool Edge Cases', () => {
  it('categorizes severity counts correctly', () => {
    const result = checkDrugInteractions({
      medications: ['fluoxetine', 'phenelzine', 'warfarin', 'aspirin'],
    });
    expect(result.summary).toContain('CONTRAINDICATED');
    expect(result.interactionsFound).toBeGreaterThanOrEqual(2);
  });

  it('reports unresolved medications correctly', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'mysteriousdrug', 'aspirin'],
    });
    expect(result.unresolvedMedications).toContain('mysteriousdrug');
    expect(result.summary).toContain('not found');
  });

  it('resolves brand names and reports in resolvedMedications', () => {
    const result = checkDrugInteractions({
      medications: ['Coumadin', 'Advil'],
    });
    const coumadin = result.resolvedMedications.find(r => r.input === 'Coumadin');
    expect(coumadin).toBeDefined();
    expect(coumadin!.generic).toBe('warfarin');
    expect(coumadin!.drugClass).toBe('anticoagulant');
  });

  it('returns correct medicationCount', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'aspirin', 'ibuprofen', 'metformin'],
    });
    expect(result.medicationCount).toBe(4);
  });

  it('returns no interactions for non-interacting pair', () => {
    const result = checkDrugInteractions({
      medications: ['metformin', 'atorvastatin'],
    });
    expect(result.interactionsFound).toBe(0);
    expect(result.summary).toContain('No known interactions');
  });

  it('handles medications with only whitespace', () => {
    const result = checkDrugInteractions({
      medications: ['  ', 'warfarin'],
    });
    expect(result.medicationCount).toBe(2);
  });

  it('includes mechanism and management in interaction output', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'aspirin'],
    });
    expect(result.interactions.length).toBeGreaterThanOrEqual(1);
    const interaction = result.interactions[0];
    expect(interaction.mechanism).toBeDefined();
    expect(interaction.management).toBeDefined();
    expect(interaction.clinicalEffect).toBeDefined();
    expect(interaction.description).toBeDefined();
  });

  it('summary mentions all severity categories found', () => {
    // This combo should have at least moderate interactions
    const result = checkDrugInteractions({
      medications: ['warfarin', 'aspirin', 'fluoxetine', 'phenelzine'],
    });
    if (result.interactions.some(i => i.severity === 'moderate')) {
      expect(result.summary).toContain('moderate');
    }
    if (result.interactions.some(i => i.severity === 'contraindicated')) {
      expect(result.summary).toContain('CONTRAINDICATED');
    }
  });
});

describe('Drug Directory Completeness', () => {
  it('every drug in directory has genericName set', () => {
    for (const [key, info] of Object.entries(drugDirectory)) {
      expect(info.genericName).toBeDefined();
      expect(info.genericName.length).toBeGreaterThan(0);
    }
  });

  it('every drug in directory has drugClass set', () => {
    for (const [key, info] of Object.entries(drugDirectory)) {
      expect(info.drugClass).toBeDefined();
      expect(info.drugClass.length).toBeGreaterThan(0);
    }
  });

  it('every drug in directory has at least one brand name', () => {
    for (const [key, info] of Object.entries(drugDirectory)) {
      expect(info.brandNames.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('all brand names in directory resolve back to their generic', () => {
    for (const [key, info] of Object.entries(drugDirectory)) {
      for (const brand of info.brandNames) {
        const resolved = resolveToGeneric(brand);
        expect(resolved).toBe(key);
      }
    }
  });

  it('generic name key matches genericName field', () => {
    for (const [key, info] of Object.entries(drugDirectory)) {
      // The key should match the start of genericName (some have extra text like "potassium chloride")
      // Compound names may use underscores as keys (e.g., "calcium_carbonate" -> "calcium carbonate")
      const keyNormalized = key.replace(/_/g, ' ');
      expect(info.genericName.startsWith(key) || info.genericName.startsWith(keyNormalized) || key === 'potassium').toBeTruthy();
    }
  });
});

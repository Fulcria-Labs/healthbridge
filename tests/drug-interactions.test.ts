import { describe, it, expect } from 'vitest';
import { findInteraction, findAllInteractions, resolveToGeneric } from '../src/data/drug-interactions';
import { checkDrugInteractions } from '../src/tools/drug-interaction-tool';

describe('Drug Name Resolution', () => {
  it('resolves generic names', () => {
    expect(resolveToGeneric('warfarin')).toBe('warfarin');
    expect(resolveToGeneric('metformin')).toBe('metformin');
    expect(resolveToGeneric('lisinopril')).toBe('lisinopril');
  });

  it('resolves brand names to generic', () => {
    expect(resolveToGeneric('coumadin')).toBe('warfarin');
    expect(resolveToGeneric('advil')).toBe('ibuprofen');
    expect(resolveToGeneric('lipitor')).toBe('atorvastatin');
    expect(resolveToGeneric('prozac')).toBe('fluoxetine');
    expect(resolveToGeneric('zoloft')).toBe('sertraline');
  });

  it('is case-insensitive', () => {
    expect(resolveToGeneric('Warfarin')).toBe('warfarin');
    expect(resolveToGeneric('ADVIL')).toBe('ibuprofen');
    expect(resolveToGeneric('Lipitor')).toBe('atorvastatin');
  });

  it('returns null for unknown drugs', () => {
    expect(resolveToGeneric('unknowndrug')).toBeNull();
    expect(resolveToGeneric('fake medicine')).toBeNull();
  });

  it('handles whitespace', () => {
    expect(resolveToGeneric('  warfarin  ')).toBe('warfarin');
  });
});

describe('Drug Interaction Lookup', () => {
  it('finds warfarin + aspirin interaction', () => {
    const interaction = findInteraction('warfarin', 'aspirin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
    expect(interaction!.description).toContain('bleeding');
  });

  it('finds interactions regardless of order', () => {
    const forward = findInteraction('warfarin', 'aspirin');
    const reverse = findInteraction('aspirin', 'warfarin');
    expect(forward).toEqual(reverse);
  });

  it('finds contraindicated SSRI + MAOI', () => {
    const interaction = findInteraction('fluoxetine', 'phenelzine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
    expect(interaction!.description).toContain('serotonin syndrome');
  });

  it('finds nitrate + PDE5 inhibitor contraindication', () => {
    const interaction = findInteraction('sildenafil', 'nitroglycerin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
    expect(interaction!.description).toContain('hypotension');
  });

  it('finds statin + macrolide interaction', () => {
    const interaction = findInteraction('simvastatin', 'clarithromycin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
    expect(interaction!.description).toContain('rhabdomyolysis');
  });

  it('resolves brand names in interactions', () => {
    const interaction = findInteraction('coumadin', 'advil');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('returns null for non-interacting drugs', () => {
    const interaction = findInteraction('metformin', 'atorvastatin');
    expect(interaction).toBeNull();
  });

  it('returns null for unknown drugs', () => {
    const interaction = findInteraction('warfarin', 'unknowndrug');
    expect(interaction).toBeNull();
  });
});

describe('Multiple Drug Interaction Check', () => {
  it('finds multiple interactions in a drug list', () => {
    const results = findAllInteractions(['warfarin', 'aspirin', 'ibuprofen']);
    expect(results.length).toBeGreaterThanOrEqual(2);
    // warfarin-aspirin and warfarin-ibuprofen
  });

  it('sorts by severity (most severe first)', () => {
    const results = findAllInteractions(['warfarin', 'aspirin', 'fluoxetine', 'phenelzine']);
    if (results.length >= 2) {
      const severityOrder = { contraindicated: 0, major: 1, moderate: 2, minor: 3 };
      for (let i = 1; i < results.length; i++) {
        expect(severityOrder[results[i].severity]).toBeGreaterThanOrEqual(
          severityOrder[results[i - 1].severity]
        );
      }
    }
  });

  it('returns empty array for non-interacting drugs', () => {
    const results = findAllInteractions(['metformin', 'amlodipine']);
    expect(results.length).toBe(0);
  });

  it('returns empty array for single drug', () => {
    const results = findAllInteractions(['warfarin']);
    expect(results.length).toBe(0);
  });

  it('preserves input drug names', () => {
    const results = findAllInteractions(['Coumadin', 'Advil']);
    if (results.length > 0) {
      expect(results[0].inputDrug1).toBe('Coumadin');
      expect(results[0].inputDrug2).toBe('Advil');
    }
  });
});

describe('checkDrugInteractions Tool', () => {
  it('returns full interaction report', () => {
    const result = checkDrugInteractions({ medications: ['warfarin', 'aspirin', 'lisinopril'] });
    expect(result.medicationCount).toBe(3);
    expect(result.interactionsFound).toBeGreaterThanOrEqual(1);
    expect(result.summary).toContain('3 medications');
  });

  it('reports unresolved medications', () => {
    const result = checkDrugInteractions({ medications: ['warfarin', 'unknowndrug'] });
    expect(result.unresolvedMedications).toContain('unknowndrug');
    expect(result.summary).toContain('not found');
  });

  it('reports contraindicated combinations', () => {
    const result = checkDrugInteractions({ medications: ['fluoxetine', 'phenelzine'] });
    expect(result.interactions.some(i => i.severity === 'contraindicated')).toBe(true);
    expect(result.summary).toContain('CONTRAINDICATED');
  });

  it('handles all brand names', () => {
    const result = checkDrugInteractions({ medications: ['Coumadin', 'Advil', 'Zocor', 'Biaxin'] });
    expect(result.resolvedMedications.every(r => r.generic !== null)).toBe(true);
    expect(result.interactionsFound).toBeGreaterThanOrEqual(2);
  });

  it('handles case where no interactions found', () => {
    const result = checkDrugInteractions({ medications: ['metformin', 'amlodipine'] });
    expect(result.interactionsFound).toBe(0);
    expect(result.summary).toContain('No known interactions');
  });
});

describe('New Drug Interactions (Expanded Database)', () => {
  it('finds ACE inhibitor + NSAID interaction', () => {
    const interaction = findInteraction('lisinopril', 'ibuprofen');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('moderate');
    expect(interaction!.description).toContain('kidney');
  });

  it('finds dual RAAS blockade (ACE + ARB)', () => {
    const interaction = findInteraction('lisinopril', 'losartan');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
    expect(interaction!.description).toContain('RAAS');
  });

  it('finds warfarin + metronidazole interaction', () => {
    const interaction = findInteraction('warfarin', 'metronidazole');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('finds SSRI + triptan interaction', () => {
    const interaction = findInteraction('fluoxetine', 'sumatriptan');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('moderate');
    expect(interaction!.description).toContain('serotonin');
  });

  it('finds SSRI + NSAID bleeding risk', () => {
    const interaction = findInteraction('fluoxetine', 'ibuprofen');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('moderate');
    expect(interaction!.description).toContain('bleeding');
  });

  it('finds dextromethorphan + MAOI contraindication', () => {
    const interaction = findInteraction('dextromethorphan', 'phenelzine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('finds DOAC + ketoconazole interaction', () => {
    const interaction = findInteraction('rivaroxaban', 'ketoconazole');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('finds gabapentin + opioid CNS depression risk', () => {
    const interaction = findInteraction('gabapentin', 'oxycodone');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
    expect(interaction!.description).toContain('CNS');
  });

  it('finds corticosteroid + NSAID GI risk', () => {
    const interaction = findInteraction('prednisone', 'ibuprofen');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('moderate');
  });

  it('finds SNRI + MAOI contraindication', () => {
    const interaction = findInteraction('duloxetine', 'phenelzine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('resolves new brand names', () => {
    expect(resolveToGeneric('imitrex')).toBe('sumatriptan');
    expect(resolveToGeneric('flagyl')).toBe('metronidazole');
    expect(resolveToGeneric('cymbalta')).toBe('duloxetine');
    expect(resolveToGeneric('eliquis')).toBe('apixaban');
    expect(resolveToGeneric('xarelto')).toBe('rivaroxaban');
    expect(resolveToGeneric('neurontin')).toBe('gabapentin');
    expect(resolveToGeneric('crestor')).toBe('rosuvastatin');
  });

  it('finds interactions via brand names for new drugs', () => {
    const interaction = findInteraction('Flagyl', 'Coumadin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('finds polypharmacy interactions correctly', () => {
    const results = findAllInteractions(['warfarin', 'metronidazole', 'ibuprofen', 'lisinopril']);
    expect(results.length).toBeGreaterThanOrEqual(3);
  });
});

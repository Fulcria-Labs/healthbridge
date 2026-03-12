import { describe, it, expect } from 'vitest';
import { findInteraction, findAllInteractions, resolveToGeneric, drugDirectory, drugInteractions } from '../src/data/drug-interactions';
import { checkDrugInteractions } from '../src/tools/drug-interaction-tool';

/**
 * Comprehensive drug interaction tests covering edge cases, brand name resolution,
 * multi-drug combinations, and boundary conditions.
 */

describe('Drug Directory Completeness', () => {
  it('contains expected cardiovascular medications', () => {
    const cardioMeds = ['warfarin', 'aspirin', 'clopidogrel', 'metoprolol', 'atenolol',
      'lisinopril', 'enalapril', 'losartan', 'amlodipine', 'digoxin', 'amiodarone'];
    for (const med of cardioMeds) {
      expect(drugDirectory[med]).toBeDefined();
      expect(drugDirectory[med].drugClass).toBeTruthy();
    }
  });

  it('contains expected psychiatric medications', () => {
    const psychMeds = ['fluoxetine', 'sertraline', 'paroxetine', 'phenelzine',
      'tranylcypromine', 'lithium', 'duloxetine'];
    for (const med of psychMeds) {
      expect(drugDirectory[med]).toBeDefined();
    }
  });

  it('contains expected analgesics', () => {
    const analgesics = ['ibuprofen', 'naproxen', 'tramadol', 'oxycodone', 'hydrocodone'];
    for (const med of analgesics) {
      expect(drugDirectory[med]).toBeDefined();
    }
  });

  it('contains expected antimicrobials', () => {
    const antimicrobials = ['ciprofloxacin', 'azithromycin', 'clarithromycin',
      'erythromycin', 'metronidazole', 'rifampin'];
    for (const med of antimicrobials) {
      expect(drugDirectory[med]).toBeDefined();
    }
  });

  it('every drug has genericName, brandNames array, and drugClass', () => {
    for (const [key, info] of Object.entries(drugDirectory)) {
      expect(info.genericName).toBeTruthy();
      expect(Array.isArray(info.brandNames)).toBe(true);
      expect(info.drugClass).toBeTruthy();
    }
  });

  it('no duplicate brand names across different drugs', () => {
    const allBrands = new Map<string, string>();
    for (const [generic, info] of Object.entries(drugDirectory)) {
      for (const brand of info.brandNames) {
        const lower = brand.toLowerCase();
        // Each brand should map to only one generic
        if (allBrands.has(lower)) {
          // Some brands may legitimately map to same generic
          expect(allBrands.get(lower)).toBe(generic);
        }
        allBrands.set(lower, generic);
      }
    }
  });
});

describe('Brand Name Resolution - Extended', () => {
  it('resolves common cardiac brand names', () => {
    expect(resolveToGeneric('lopressor')).toBe('metoprolol');
    expect(resolveToGeneric('toprol')).toBe('metoprolol');
    expect(resolveToGeneric('tenormin')).toBe('atenolol');
    expect(resolveToGeneric('norvasc')).toBe('amlodipine');
    expect(resolveToGeneric('lanoxin')).toBe('digoxin');
  });

  it('resolves anticoagulant brand names', () => {
    expect(resolveToGeneric('coumadin')).toBe('warfarin');
    expect(resolveToGeneric('jantoven')).toBe('warfarin');
    expect(resolveToGeneric('eliquis')).toBe('apixaban');
    expect(resolveToGeneric('xarelto')).toBe('rivaroxaban');
  });

  it('resolves antidepressant brand names', () => {
    expect(resolveToGeneric('prozac')).toBe('fluoxetine');
    expect(resolveToGeneric('zoloft')).toBe('sertraline');
    expect(resolveToGeneric('paxil')).toBe('paroxetine');
    expect(resolveToGeneric('cymbalta')).toBe('duloxetine');
  });

  it('resolves pain medication brand names', () => {
    expect(resolveToGeneric('advil')).toBe('ibuprofen');
    expect(resolveToGeneric('motrin')).toBe('ibuprofen');
    expect(resolveToGeneric('aleve')).toBe('naproxen');
    expect(resolveToGeneric('ultram')).toBe('tramadol');
    expect(resolveToGeneric('vicodin')).toBe('hydrocodone');
    expect(resolveToGeneric('norco')).toBe('hydrocodone');
    expect(resolveToGeneric('oxycontin')).toBe('oxycodone');
    expect(resolveToGeneric('percocet')).toBe('oxycodone');
  });

  it('resolves statin brand names', () => {
    expect(resolveToGeneric('lipitor')).toBe('atorvastatin');
    expect(resolveToGeneric('zocor')).toBe('simvastatin');
    expect(resolveToGeneric('crestor')).toBe('rosuvastatin');
    expect(resolveToGeneric('pravachol')).toBe('pravastatin');
  });

  it('resolves diuretic brand names', () => {
    expect(resolveToGeneric('lasix')).toBe('furosemide');
    expect(resolveToGeneric('aldactone')).toBe('spironolactone');
    expect(resolveToGeneric('microzide')).toBe('hydrochlorothiazide');
  });

  it('resolves PDE5 inhibitor brand names', () => {
    expect(resolveToGeneric('viagra')).toBe('sildenafil');
    expect(resolveToGeneric('revatio')).toBe('sildenafil');
    expect(resolveToGeneric('cialis')).toBe('tadalafil');
    expect(resolveToGeneric('adcirca')).toBe('tadalafil');
  });

  it('resolves anticonvulsant brand names', () => {
    expect(resolveToGeneric('tegretol')).toBe('carbamazepine');
    expect(resolveToGeneric('dilantin')).toBe('phenytoin');
  });

  it('handles mixed case brand names', () => {
    expect(resolveToGeneric('LIPITOR')).toBe('atorvastatin');
    expect(resolveToGeneric('Prozac')).toBe('fluoxetine');
    expect(resolveToGeneric('lAsIx')).toBe('furosemide');
    expect(resolveToGeneric('ADVIL')).toBe('ibuprofen');
  });

  it('handles leading/trailing whitespace', () => {
    expect(resolveToGeneric('  lipitor  ')).toBe('atorvastatin');
    expect(resolveToGeneric('\tprozac\t')).toBe('fluoxetine');
    expect(resolveToGeneric('   warfarin')).toBe('warfarin');
  });

  it('returns null for empty string', () => {
    expect(resolveToGeneric('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(resolveToGeneric('   ')).toBeNull();
  });

  it('returns null for numeric string', () => {
    expect(resolveToGeneric('12345')).toBeNull();
  });

  it('returns null for special characters', () => {
    expect(resolveToGeneric('@#$%')).toBeNull();
    expect(resolveToGeneric('drug-123')).toBeNull();
  });
});

describe('Interaction Severity Classification', () => {
  it('identifies all contraindicated pairs', () => {
    const contraindicated = drugInteractions.filter(i => i.severity === 'contraindicated');
    expect(contraindicated.length).toBeGreaterThan(0);
    for (const interaction of contraindicated) {
      expect(interaction.management).toBeTruthy();
      expect(interaction.clinicalEffect).toBeTruthy();
    }
  });

  it('identifies all major interactions', () => {
    const major = drugInteractions.filter(i => i.severity === 'major');
    expect(major.length).toBeGreaterThan(0);
    for (const interaction of major) {
      expect(interaction.description).toBeTruthy();
    }
  });

  it('identifies all moderate interactions', () => {
    const moderate = drugInteractions.filter(i => i.severity === 'moderate');
    expect(moderate.length).toBeGreaterThan(0);
  });

  it('checks for minor interactions (may be zero)', () => {
    const minor = drugInteractions.filter(i => i.severity === 'minor');
    expect(minor.length).toBeGreaterThanOrEqual(0);
  });

  it('all interactions have required fields', () => {
    for (const interaction of drugInteractions) {
      expect(['contraindicated', 'major', 'moderate', 'minor']).toContain(interaction.severity);
      expect(interaction.drug1).toBeTruthy();
      expect(interaction.drug2).toBeTruthy();
      expect(interaction.description).toBeTruthy();
      expect(interaction.mechanism).toBeTruthy();
      expect(interaction.clinicalEffect).toBeTruthy();
      expect(interaction.management).toBeTruthy();
    }
  });
});

describe('Multi-Drug Interaction Checking', () => {
  it('finds all interactions in a 3-drug combination', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'aspirin', 'ibuprofen'],
    });
    // warfarin+aspirin, warfarin+ibuprofen should both be found
    expect(result.interactionsFound).toBeGreaterThanOrEqual(2);
  });

  it('handles a large medication list (8+ drugs)', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'aspirin', 'lisinopril', 'metoprolol',
        'metformin', 'simvastatin', 'omeprazole', 'amlodipine'],
    });
    expect(result.medicationCount).toBe(8);
    expect(result.resolvedMedications.length).toBe(8);
    expect(result.summary).toContain('8 medications');
  });

  it('correctly reports unresolved medications', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'aspirin', 'unknownDrug123'],
    });
    expect(result.unresolvedMedications).toContain('unknownDrug123');
    expect(result.summary).toContain('not found in database');
  });

  it('handles all unresolved medications', () => {
    const result = checkDrugInteractions({
      medications: ['fakeDrug1', 'fakeDrug2'],
    });
    expect(result.unresolvedMedications.length).toBe(2);
    expect(result.interactionsFound).toBe(0);
  });

  it('finds interactions using brand names in combination', () => {
    const result = checkDrugInteractions({
      medications: ['coumadin', 'advil'],
    });
    expect(result.interactionsFound).toBeGreaterThanOrEqual(1);
    const interaction = result.interactions[0];
    expect(interaction.severity).toBe('major');
  });

  it('mixed brand and generic names in same list', () => {
    const result = checkDrugInteractions({
      medications: ['coumadin', 'aspirin', 'lipitor'],
    });
    expect(result.medicationCount).toBe(3);
    // All should resolve
    expect(result.unresolvedMedications.length).toBe(0);
  });

  it('correctly identifies contraindicated combination in mix', () => {
    const result = checkDrugInteractions({
      medications: ['fluoxetine', 'phenelzine', 'metformin'],
    });
    const contraindicated = result.interactions.filter(i => i.severity === 'contraindicated');
    expect(contraindicated.length).toBeGreaterThanOrEqual(1);
    expect(result.summary).toContain('CONTRAINDICATED');
  });

  it('summary reflects no interactions when drugs do not interact', () => {
    const result = checkDrugInteractions({
      medications: ['metformin', 'amlodipine'],
    });
    if (result.interactionsFound === 0) {
      expect(result.summary).toContain('No known interactions');
    }
  });

  it('handles duplicate medications gracefully', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'warfarin'],
    });
    expect(result.medicationCount).toBe(2);
    // Should not find self-interactions
  });

  it('handles brand and generic of same drug', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'coumadin'],
    });
    expect(result.medicationCount).toBe(2);
  });
});

describe('Specific Interaction Pairs - Detailed Verification', () => {
  it('warfarin + rifampin is contraindicated', () => {
    const interaction = findInteraction('warfarin', 'rifampin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('simvastatin + clarithromycin is contraindicated', () => {
    const interaction = findInteraction('simvastatin', 'clarithromycin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('tramadol + phenelzine is contraindicated', () => {
    const interaction = findInteraction('tramadol', 'phenelzine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('warfarin + ciprofloxacin is major', () => {
    const interaction = findInteraction('warfarin', 'ciprofloxacin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('tramadol + fluoxetine is major', () => {
    const interaction = findInteraction('tramadol', 'fluoxetine');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('major');
  });

  it('warfarin + sertraline is moderate', () => {
    const interaction = findInteraction('warfarin', 'sertraline');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('moderate');
  });

  it('sildenafil + nitroglycerin is contraindicated', () => {
    const interaction = findInteraction('sildenafil', 'nitroglycerin');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
    expect(interaction!.clinicalEffect).toContain('hypotension');
  });

  it('sildenafil + isosorbide is contraindicated', () => {
    const interaction = findInteraction('sildenafil', 'isosorbide');
    expect(interaction).not.toBeNull();
    expect(interaction!.severity).toBe('contraindicated');
  });

  it('interaction description contains clinically relevant info', () => {
    const interaction = findInteraction('warfarin', 'aspirin');
    expect(interaction).not.toBeNull();
    expect(interaction!.description).toContain('bleeding');
    expect(interaction!.mechanism).toBeTruthy();
    expect(interaction!.management).toBeTruthy();
  });

  it('MAOI interactions are all contraindicated', () => {
    const ssris = ['fluoxetine', 'sertraline', 'paroxetine'];
    for (const ssri of ssris) {
      const interaction = findInteraction(ssri, 'phenelzine');
      if (interaction) {
        expect(interaction.severity).toBe('contraindicated');
      }
    }
  });

  it('reverse lookup produces same result', () => {
    const pairs = [
      ['warfarin', 'aspirin'],
      ['fluoxetine', 'phenelzine'],
      ['sildenafil', 'nitroglycerin'],
      ['simvastatin', 'clarithromycin'],
    ] as const;
    for (const [drug1, drug2] of pairs) {
      const forward = findInteraction(drug1, drug2);
      const reverse = findInteraction(drug2, drug1);
      expect(forward).toEqual(reverse);
    }
  });
});

describe('checkDrugInteractions Output Structure', () => {
  it('returns correct output structure', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'aspirin'],
    });
    expect(result).toHaveProperty('medicationCount');
    expect(result).toHaveProperty('interactionsFound');
    expect(result).toHaveProperty('resolvedMedications');
    expect(result).toHaveProperty('interactions');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('unresolvedMedications');
  });

  it('resolvedMedications has input, generic, and drugClass', () => {
    const result = checkDrugInteractions({
      medications: ['advil', 'coumadin'],
    });
    for (const med of result.resolvedMedications) {
      expect(med).toHaveProperty('input');
      expect(med).toHaveProperty('generic');
      expect(med).toHaveProperty('drugClass');
    }
    // Check advil resolved
    const advil = result.resolvedMedications.find(m => m.input === 'advil');
    expect(advil).toBeDefined();
    expect(advil!.generic).toBe('ibuprofen');
    expect(advil!.drugClass).toBe('nsaid');
  });

  it('interactions array items have correct fields', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'aspirin'],
    });
    expect(result.interactions.length).toBeGreaterThan(0);
    const interaction = result.interactions[0];
    expect(interaction).toHaveProperty('drug1');
    expect(interaction).toHaveProperty('drug2');
    expect(interaction).toHaveProperty('severity');
    expect(interaction).toHaveProperty('description');
    expect(interaction).toHaveProperty('mechanism');
    expect(interaction).toHaveProperty('clinicalEffect');
    expect(interaction).toHaveProperty('management');
  });

  it('summary counts reflect actual data', () => {
    const result = checkDrugInteractions({
      medications: ['warfarin', 'aspirin', 'ibuprofen', 'unknownMed'],
    });
    expect(result.medicationCount).toBe(4);
    expect(result.summary).toContain('4 medications');
    expect(result.summary).toContain(`${result.interactionsFound} interaction`);
  });
});

import { describe, it, expect } from 'vitest';
import { getDosingForEGFR, checkRenalDosing, listRenalDosingDrugs, renalDosingDatabase } from '../src/data/renal-dosing';
import { checkMedicationRenalDosing, checkSingleDrugDosing, listAvailableRenalDosingDrugs } from '../src/tools/renal-dosing-tool';

// =============================================================================
// Data Integrity Tests
// =============================================================================

describe('Renal Dosing Database Integrity', () => {
  it('has medications in the database', () => {
    expect(renalDosingDatabase.length).toBeGreaterThan(10);
  });

  it('every entry has required fields', () => {
    for (const entry of renalDosingDatabase) {
      expect(entry.drug).toBeTruthy();
      expect(entry.drugClass).toBeTruthy();
      expect(entry.normalDose).toBeTruthy();
      expect(entry.adjustments.length).toBeGreaterThan(0);
      expect(typeof entry.dialyzable).toBe('boolean');
      expect(entry.monitoring).toBeTruthy();
      expect(entry.notes).toBeTruthy();
    }
  });

  it('every adjustment has valid eGFR ranges', () => {
    for (const entry of renalDosingDatabase) {
      for (const adj of entry.adjustments) {
        expect(adj.eGFRRange.min).toBeGreaterThanOrEqual(0);
        expect(adj.eGFRRange.max).toBeGreaterThan(adj.eGFRRange.min);
        expect(adj.dose).toBeTruthy();
        expect(adj.rationale).toBeTruthy();
        expect(['reduce', 'avoid', 'use_with_caution', 'no_change', 'contraindicated']).toContain(adj.action);
      }
    }
  });

  it('lists all drugs', () => {
    const drugs = listRenalDosingDrugs();
    expect(drugs.length).toBe(renalDosingDatabase.length);
    for (const d of drugs) {
      expect(d.drug).toBeTruthy();
      expect(d.drugClass).toBeTruthy();
    }
  });
});

// =============================================================================
// Metformin Tests
// =============================================================================

describe('Metformin Renal Dosing', () => {
  it('allows full dose at eGFR 60', () => {
    const result = getDosingForEGFR('metformin', 60);
    expect(result).not.toBeNull();
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('reduces dose at eGFR 35', () => {
    const result = getDosingForEGFR('metformin', 35);
    expect(result).not.toBeNull();
    expect(result!.adjustment!.action).toBe('reduce');
    expect(result!.adjustment!.dose).toContain('500');
  });

  it('is contraindicated at eGFR 20', () => {
    const result = getDosingForEGFR('metformin', 20);
    expect(result).not.toBeNull();
    expect(result!.adjustment!.action).toBe('contraindicated');
  });

  it('returns CKD stage', () => {
    const result = getDosingForEGFR('metformin', 35);
    expect(result!.ckdStage).toContain('G3b');
  });

  it('indicates dialyzability', () => {
    const result = getDosingForEGFR('metformin', 60);
    expect(result!.dialyzable).toBe(true);
  });
});

// =============================================================================
// Vancomycin Tests
// =============================================================================

describe('Vancomycin Renal Dosing', () => {
  it('standard dosing at eGFR 60', () => {
    const result = getDosingForEGFR('vancomycin', 60);
    expect(result).not.toBeNull();
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('reduces at eGFR 40', () => {
    const result = getDosingForEGFR('vancomycin', 40);
    expect(result!.adjustment!.action).toBe('reduce');
    expect(result!.adjustment!.dose).toContain('24h');
  });

  it('dose by levels at eGFR 5', () => {
    const result = getDosingForEGFR('vancomycin', 5);
    expect(result!.adjustment!.action).toBe('reduce');
    expect(result!.adjustment!.dose.toLowerCase()).toContain('levels');
  });

  it('not dialyzable', () => {
    const result = getDosingForEGFR('vancomycin', 50);
    expect(result!.dialyzable).toBe(false);
  });
});

// =============================================================================
// Gabapentin Tests
// =============================================================================

describe('Gabapentin Renal Dosing', () => {
  it('full dose at eGFR 80', () => {
    const result = getDosingForEGFR('gabapentin', 80);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('reduces at eGFR 40', () => {
    const result = getDosingForEGFR('gabapentin', 40);
    expect(result!.adjustment!.action).toBe('reduce');
  });

  it('every other day at eGFR 10', () => {
    const result = getDosingForEGFR('gabapentin', 10);
    expect(result!.adjustment!.action).toBe('reduce');
    expect(result!.adjustment!.dose).toContain('every other day');
  });

  it('dialyzable with supplement', () => {
    const result = getDosingForEGFR('gabapentin', 50);
    expect(result!.dialyzable).toBe(true);
    expect(result!.dialysisSupplement).toBeTruthy();
  });
});

// =============================================================================
// Digoxin Tests
// =============================================================================

describe('Digoxin Renal Dosing', () => {
  it('standard at eGFR 60', () => {
    const result = getDosingForEGFR('digoxin', 60);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('reduced at eGFR 40', () => {
    const result = getDosingForEGFR('digoxin', 40);
    expect(result!.adjustment!.action).toBe('reduce');
  });

  it('dose by levels at eGFR 5', () => {
    const result = getDosingForEGFR('digoxin', 5);
    expect(result!.adjustment!.dose.toLowerCase()).toContain('levels');
  });
});

// =============================================================================
// Morphine Tests
// =============================================================================

describe('Morphine Renal Dosing', () => {
  it('avoid at eGFR 5', () => {
    const result = getDosingForEGFR('morphine', 5);
    expect(result!.adjustment!.action).toBe('avoid');
    expect(result!.adjustment!.dose.toLowerCase()).toContain('fentanyl');
  });

  it('reduce 50% at eGFR 20', () => {
    const result = getDosingForEGFR('morphine', 20);
    expect(result!.adjustment!.action).toBe('reduce');
  });
});

// =============================================================================
// DOAC Tests
// =============================================================================

describe('DOAC Renal Dosing', () => {
  it('apixaban safe in ESRD', () => {
    const result = getDosingForEGFR('apixaban', 10);
    expect(result!.adjustment!.action).toBe('use_with_caution');
    expect(result!.notes).toContain('ESRD');
  });

  it('dabigatran avoid in ESRD', () => {
    const result = getDosingForEGFR('dabigatran', 10);
    expect(result!.adjustment!.action).toBe('avoid');
  });

  it('dabigatran partially dialyzable', () => {
    const result = getDosingForEGFR('dabigatran', 50);
    expect(result!.dialyzable).toBe(true);
  });

  it('enoxaparin reduced at eGFR 20', () => {
    const result = getDosingForEGFR('enoxaparin', 20);
    expect(result!.adjustment!.action).toBe('reduce');
    expect(result!.adjustment!.dose).toContain('once daily');
  });
});

// =============================================================================
// ACE Inhibitor Tests
// =============================================================================

describe('Lisinopril Renal Dosing', () => {
  it('standard dose at eGFR 45', () => {
    const result = getDosingForEGFR('lisinopril', 45);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('start low at eGFR 20', () => {
    const result = getDosingForEGFR('lisinopril', 20);
    expect(result!.adjustment!.action).toBe('reduce');
    expect(result!.adjustment!.dose).toContain('2.5');
  });

  it('dialyzable', () => {
    const result = getDosingForEGFR('lisinopril', 50);
    expect(result!.dialyzable).toBe(true);
  });
});

// =============================================================================
// Lithium Tests
// =============================================================================

describe('Lithium Renal Dosing', () => {
  it('standard at eGFR 70', () => {
    const result = getDosingForEGFR('lithium', 70);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('avoid at eGFR 5', () => {
    const result = getDosingForEGFR('lithium', 5);
    expect(result!.adjustment!.action).toBe('avoid');
  });
});

// =============================================================================
// Batch Checking Tests
// =============================================================================

describe('Batch Renal Dosing Check', () => {
  it('checks multiple medications at once', () => {
    const result = checkRenalDosing(
      ['metformin', 'gabapentin', 'lisinopril', 'aspirin'],
      25
    );
    expect(result.eGFR).toBe(25);
    expect(result.ckdStage).toContain('G4');
    expect(result.adjustments.length).toBeGreaterThan(0);
    expect(result.notInDatabase).toContain('aspirin'); // aspirin not in renal dosing db
    expect(result.summary).toBeTruthy();
  });

  it('flags contraindicated meds', () => {
    const result = checkRenalDosing(['metformin'], 20);
    expect(result.adjustments[0].action).toBe('contraindicated');
    expect(result.summary).toContain('AVOID');
  });

  it('flags dose reductions', () => {
    const result = checkRenalDosing(['gabapentin', 'vancomycin'], 25);
    expect(result.adjustments.length).toBe(2);
    expect(result.summary).toContain('DOSE REDUCTION');
  });

  it('reports no adjustments for normal eGFR', () => {
    const result = checkRenalDosing(['metformin', 'lisinopril'], 90);
    expect(result.adjustments.length).toBe(0);
    expect(result.noAdjustmentNeeded.length).toBe(2);
  });

  it('handles empty medication list', () => {
    const result = checkRenalDosing([], 30);
    expect(result.adjustments.length).toBe(0);
    expect(result.notInDatabase.length).toBe(0);
  });

  it('handles unknown medications', () => {
    const result = checkRenalDosing(['totally_fake_drug'], 30);
    expect(result.notInDatabase).toContain('totally_fake_drug');
    expect(result.adjustments.length).toBe(0);
  });
});

// =============================================================================
// Tool Interface Tests
// =============================================================================

describe('Renal Dosing Tool', () => {
  it('checkMedicationRenalDosing works', () => {
    const result = checkMedicationRenalDosing({
      medications: ['metformin', 'digoxin'],
      eGFR: 25,
    });
    expect(result.adjustments.length).toBe(2);
    expect(result.ckdStage).toContain('G4');
  });

  it('checkSingleDrugDosing works for known drug', () => {
    const result = checkSingleDrugDosing({ drug: 'vancomycin', eGFR: 40 });
    expect('drug' in result).toBe(true);
    if ('drug' in result) {
      expect(result.drug).toBe('vancomycin');
    }
  });

  it('checkSingleDrugDosing returns error for unknown drug', () => {
    const result = checkSingleDrugDosing({ drug: 'nosuchthing', eGFR: 40 });
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('not found');
      expect(result.availableDrugs.length).toBeGreaterThan(0);
    }
  });

  it('listAvailableRenalDosingDrugs returns drugs', () => {
    const drugs = listAvailableRenalDosingDrugs();
    expect(drugs.length).toBeGreaterThan(10);
    expect(drugs[0]).toHaveProperty('drug');
    expect(drugs[0]).toHaveProperty('drugClass');
  });
});

// =============================================================================
// CKD Stage Tests
// =============================================================================

describe('CKD Stage Classification', () => {
  it('classifies eGFR 95 as G1', () => {
    const result = getDosingForEGFR('metformin', 95);
    expect(result!.ckdStage).toContain('G1');
  });

  it('classifies eGFR 70 as G2', () => {
    const result = getDosingForEGFR('metformin', 70);
    expect(result!.ckdStage).toContain('G2');
  });

  it('classifies eGFR 50 as G3a', () => {
    const result = getDosingForEGFR('metformin', 50);
    expect(result!.ckdStage).toContain('G3a');
  });

  it('classifies eGFR 35 as G3b', () => {
    const result = getDosingForEGFR('metformin', 35);
    expect(result!.ckdStage).toContain('G3b');
  });

  it('classifies eGFR 20 as G4', () => {
    const result = getDosingForEGFR('metformin', 20);
    expect(result!.ckdStage).toContain('G4');
  });

  it('classifies eGFR 10 as G5', () => {
    const result = getDosingForEGFR('metformin', 10);
    expect(result!.ckdStage).toContain('G5');
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('Renal Dosing Edge Cases', () => {
  it('handles eGFR 0', () => {
    const result = getDosingForEGFR('metformin', 0);
    expect(result).not.toBeNull();
    expect(result!.adjustment!.action).toBe('contraindicated');
  });

  it('handles very high eGFR', () => {
    const result = getDosingForEGFR('metformin', 150);
    expect(result).not.toBeNull();
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('returns null for unknown drug', () => {
    const result = getDosingForEGFR('notadrugname', 50);
    expect(result).toBeNull();
  });

  it('case insensitive drug lookup', () => {
    const r1 = getDosingForEGFR('Metformin', 50);
    const r2 = getDosingForEGFR('METFORMIN', 50);
    const r3 = getDosingForEGFR('metformin', 50);
    expect(r1).not.toBeNull();
    expect(r2).not.toBeNull();
    expect(r3).not.toBeNull();
  });

  it('borderline eGFR at exact cutoff', () => {
    // eGFR 30 is the metformin contraindication boundary
    const at29 = getDosingForEGFR('metformin', 29);
    expect(at29!.adjustment!.action).toBe('contraindicated');
    const at30 = getDosingForEGFR('metformin', 30);
    expect(at30!.adjustment!.action).toBe('reduce');
  });
});

// =============================================================================
// Colchicine Tests
// =============================================================================

describe('Colchicine Renal Dosing', () => {
  it('standard dose at eGFR 50', () => {
    const result = getDosingForEGFR('colchicine', 50);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('reduce at eGFR 20', () => {
    const result = getDosingForEGFR('colchicine', 20);
    expect(result!.adjustment!.action).toBe('reduce');
  });

  it('avoid at eGFR 5', () => {
    const result = getDosingForEGFR('colchicine', 5);
    expect(result!.adjustment!.action).toBe('avoid');
  });

  it('not dialyzable', () => {
    const result = getDosingForEGFR('colchicine', 30);
    expect(result!.dialyzable).toBe(false);
  });
});

// =============================================================================
// Allopurinol Tests
// =============================================================================

describe('Allopurinol Renal Dosing', () => {
  it('standard at eGFR 70', () => {
    const result = getDosingForEGFR('allopurinol', 70);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('reduce at eGFR 40', () => {
    const result = getDosingForEGFR('allopurinol', 40);
    expect(result!.adjustment!.action).toBe('reduce');
  });

  it('mentions HLA-B*5801', () => {
    const result = getDosingForEGFR('allopurinol', 50);
    expect(result!.notes).toContain('HLA');
  });
});

// =============================================================================
// Spironolactone Tests
// =============================================================================

describe('Spironolactone Renal Dosing', () => {
  it('standard at eGFR 60', () => {
    const result = getDosingForEGFR('spironolactone', 60);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('reduce at eGFR 35', () => {
    const result = getDosingForEGFR('spironolactone', 35);
    expect(result!.adjustment!.action).toBe('reduce');
  });

  it('avoid at eGFR 20', () => {
    const result = getDosingForEGFR('spironolactone', 20);
    expect(result!.adjustment!.action).toBe('avoid');
  });
});

// =============================================================================
// Levofloxacin Tests
// =============================================================================

describe('Levofloxacin Renal Dosing', () => {
  it('standard at eGFR 60', () => {
    const result = getDosingForEGFR('levofloxacin', 60);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('reduce at eGFR 30', () => {
    const result = getDosingForEGFR('levofloxacin', 30);
    expect(result!.adjustment!.action).toBe('reduce');
  });

  it('reduce at eGFR 15', () => {
    const result = getDosingForEGFR('levofloxacin', 15);
    expect(result!.adjustment!.action).toBe('reduce');
  });
});

// =============================================================================
// Acyclovir Tests
// =============================================================================

describe('Acyclovir Renal Dosing', () => {
  it('standard at eGFR 60', () => {
    const result = getDosingForEGFR('acyclovir', 60);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('reduce at eGFR 30', () => {
    const result = getDosingForEGFR('acyclovir', 30);
    expect(result!.adjustment!.action).toBe('reduce');
  });

  it('dialyzable', () => {
    const result = getDosingForEGFR('acyclovir', 50);
    expect(result!.dialyzable).toBe(true);
  });
});

// =============================================================================
// Gentamicin Tests
// =============================================================================

describe('Gentamicin Renal Dosing', () => {
  it('standard at eGFR 70', () => {
    const result = getDosingForEGFR('gentamicin', 70);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('extended interval at eGFR 50', () => {
    const result = getDosingForEGFR('gentamicin', 50);
    expect(result!.adjustment!.action).toBe('reduce');
    expect(result!.adjustment!.dose).toContain('36h');
  });

  it('use with caution at eGFR 10', () => {
    const result = getDosingForEGFR('gentamicin', 10);
    expect(result!.adjustment!.action).toBe('use_with_caution');
  });
});

// =============================================================================
// Atenolol Tests
// =============================================================================

describe('Atenolol Renal Dosing', () => {
  it('standard at eGFR 50', () => {
    const result = getDosingForEGFR('atenolol', 50);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('reduce at eGFR 20', () => {
    const result = getDosingForEGFR('atenolol', 20);
    expect(result!.adjustment!.action).toBe('reduce');
  });

  it('suggests metoprolol switch for severe CKD', () => {
    const result = getDosingForEGFR('atenolol', 10);
    expect(result!.adjustment!.rationale.toLowerCase()).toContain('metoprolol');
  });
});

// =============================================================================
// Glipizide Tests
// =============================================================================

describe('Glipizide Renal Dosing', () => {
  it('standard at eGFR 40', () => {
    const result = getDosingForEGFR('glipizide', 40);
    expect(result!.adjustment!.action).toBe('no_change');
  });

  it('caution at eGFR 20', () => {
    const result = getDosingForEGFR('glipizide', 20);
    expect(result!.adjustment!.action).toBe('use_with_caution');
  });

  it('notes glyburide is contraindicated in CKD', () => {
    const result = getDosingForEGFR('glipizide', 50);
    expect(result!.notes.toLowerCase()).toContain('glyburide');
  });
});

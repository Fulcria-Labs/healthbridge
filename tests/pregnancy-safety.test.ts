import { describe, it, expect } from 'vitest';
import { checkPregnancySafety, screenMedicationsForPregnancy, listPregnancyDrugs } from '../src/data/pregnancy-safety.js';

describe('Pregnancy Safety Checker', () => {
  describe('Category X Drugs', () => {
    it('should flag methotrexate as contraindicated', () => {
      const result = checkPregnancySafety('methotrexate');
      expect(result.found).toBe(true);
      expect(result.pregnancyCategory).toBe('X');
      expect(result.overallSafety).toContain('CONTRAINDICATED');
    });

    it('should flag warfarin as Category X', () => {
      const result = checkPregnancySafety('warfarin');
      expect(result.pregnancyCategory).toBe('X');
      expect(result.saferAlternatives).toBeDefined();
      expect(result.saferAlternatives!.length).toBeGreaterThan(0);
    });

    it('should flag isotretinoin as Category X', () => {
      const result = checkPregnancySafety('isotretinoin');
      expect(result.pregnancyCategory).toBe('X');
      expect(result.teratogenicRisk).toContain('POTENT TERATOGEN');
    });

    it('should flag statins as Category X', () => {
      const result = checkPregnancySafety('statins');
      expect(result.pregnancyCategory).toBe('X');
    });

    it('should flag valproic acid as Category X', () => {
      const result = checkPregnancySafety('valproic acid');
      expect(result.pregnancyCategory).toBe('X');
      expect(result.teratogenicRisk).toContain('neural tube defects');
    });

    it('should flag misoprostol as Category X', () => {
      const result = checkPregnancySafety('misoprostol');
      expect(result.pregnancyCategory).toBe('X');
    });

    it('should note warfarin is safe for lactation', () => {
      const result = checkPregnancySafety('warfarin');
      expect(result.lactationSafety).toBe('safe');
    });
  });

  describe('Category D Drugs', () => {
    it('should flag lisinopril as Category D', () => {
      const result = checkPregnancySafety('lisinopril');
      expect(result.pregnancyCategory).toBe('D');
      expect(result.overallSafety).toContain('HIGH RISK');
    });

    it('should flag losartan as Category D', () => {
      const result = checkPregnancySafety('losartan');
      expect(result.pregnancyCategory).toBe('D');
    });

    it('should flag phenytoin as Category D', () => {
      const result = checkPregnancySafety('phenytoin');
      expect(result.pregnancyCategory).toBe('D');
      expect(result.teratogenicRisk).toContain('hydantoin');
    });

    it('should flag lithium as Category D', () => {
      const result = checkPregnancySafety('lithium');
      expect(result.pregnancyCategory).toBe('D');
      expect(result.teratogenicRisk).toContain('Ebstein');
    });

    it('should flag tetracycline as Category D', () => {
      const result = checkPregnancySafety('tetracycline');
      expect(result.pregnancyCategory).toBe('D');
    });

    it('should show ACE inhibitors contraindicated in 2nd/3rd trimester', () => {
      const result = checkPregnancySafety('lisinopril', 3);
      expect(result.trimesterRisks!.third).toBe('contraindicated');
      expect(result.overallSafety).toContain('CONTRAINDICATED in trimester 3');
    });
  });

  describe('Category C Drugs', () => {
    it('should categorize omeprazole as Category C', () => {
      const result = checkPregnancySafety('omeprazole');
      expect(result.pregnancyCategory).toBe('C');
    });

    it('should categorize fluoxetine as Category C', () => {
      const result = checkPregnancySafety('fluoxetine');
      expect(result.pregnancyCategory).toBe('C');
    });

    it('should categorize sertraline as Category C with safe lactation', () => {
      const result = checkPregnancySafety('sertraline');
      expect(result.pregnancyCategory).toBe('C');
      expect(result.lactationSafety).toBe('safe');
    });

    it('should categorize metformin as Category C', () => {
      const result = checkPregnancySafety('metformin');
      expect(result.pregnancyCategory).toBe('C');
    });

    it('should flag ibuprofen as contraindicated in 3rd trimester', () => {
      const result = checkPregnancySafety('ibuprofen', 3);
      expect(result.trimesterRisks!.third).toBe('contraindicated');
      expect(result.overallSafety).toContain('CONTRAINDICATED in trimester 3');
    });

    it('should show ibuprofen as low risk in 1st trimester', () => {
      const result = checkPregnancySafety('ibuprofen', 1);
      expect(result.trimesterRisks!.first).toBe('low');
    });

    it('should note aspirin low-dose for preeclampsia prevention', () => {
      const result = checkPregnancySafety('aspirin');
      expect(result.counselingPoints).toBeDefined();
      expect(result.counselingPoints!.some(cp => cp.includes('preeclampsia'))).toBe(true);
    });
  });

  describe('Category B Drugs', () => {
    it('should categorize acetaminophen as Category B (safe)', () => {
      const result = checkPregnancySafety('acetaminophen');
      expect(result.pregnancyCategory).toBe('B');
      expect(result.overallSafety).toContain('Generally considered safe');
    });

    it('should categorize amoxicillin as Category B', () => {
      const result = checkPregnancySafety('amoxicillin');
      expect(result.pregnancyCategory).toBe('B');
      expect(result.lactationSafety).toBe('safe');
    });

    it('should categorize metoclopramide as Category B', () => {
      const result = checkPregnancySafety('metoclopramide');
      expect(result.pregnancyCategory).toBe('B');
    });
  });

  describe('Category A Drugs', () => {
    it('should categorize prenatal vitamins as Category A', () => {
      const result = checkPregnancySafety('prenatal vitamins');
      expect(result.pregnancyCategory).toBe('A');
      expect(result.overallSafety).toContain('Generally considered safe');
    });

    it('should categorize levothyroxine as Category A', () => {
      const result = checkPregnancySafety('levothyroxine');
      expect(result.pregnancyCategory).toBe('A');
    });
  });

  describe('Brand Name Resolution', () => {
    it('should resolve Coumadin to warfarin', () => {
      const result = checkPregnancySafety('coumadin');
      expect(result.resolvedName).toBe('warfarin');
      expect(result.pregnancyCategory).toBe('X');
    });

    it('should resolve Accutane to isotretinoin', () => {
      const result = checkPregnancySafety('accutane');
      expect(result.resolvedName).toBe('isotretinoin');
      expect(result.pregnancyCategory).toBe('X');
    });

    it('should resolve Depakote to valproic acid', () => {
      const result = checkPregnancySafety('depakote');
      expect(result.resolvedName).toBe('valproic acid');
    });

    it('should resolve Tylenol to acetaminophen', () => {
      const result = checkPregnancySafety('tylenol');
      expect(result.resolvedName).toBe('acetaminophen');
    });

    it('should resolve Zoloft to sertraline', () => {
      const result = checkPregnancySafety('zoloft');
      expect(result.resolvedName).toBe('sertraline');
    });

    it('should resolve Prozac to fluoxetine', () => {
      const result = checkPregnancySafety('prozac');
      expect(result.resolvedName).toBe('fluoxetine');
    });

    it('should resolve Synthroid to levothyroxine', () => {
      const result = checkPregnancySafety('synthroid');
      expect(result.resolvedName).toBe('levothyroxine');
    });

    it('should resolve Advil to ibuprofen', () => {
      const result = checkPregnancySafety('advil');
      expect(result.resolvedName).toBe('ibuprofen');
    });

    it('should resolve Dilantin to phenytoin', () => {
      const result = checkPregnancySafety('dilantin');
      expect(result.resolvedName).toBe('phenytoin');
    });

    it('should resolve Glucophage to metformin', () => {
      const result = checkPregnancySafety('glucophage');
      expect(result.resolvedName).toBe('metformin');
    });
  });

  describe('Unknown Drugs', () => {
    it('should return found=false for unknown drugs', () => {
      const result = checkPregnancySafety('some_unknown_drug_xyz');
      expect(result.found).toBe(false);
      expect(result.overallSafety).toContain('NOT IN DATABASE');
    });
  });

  describe('Trimester-Specific Risk', () => {
    it('should show ACE inhibitor 1st trimester as moderate risk', () => {
      const result = checkPregnancySafety('lisinopril', 1);
      expect(result.trimesterRisks!.first).toBe('moderate');
    });

    it('should show ACE inhibitor 2nd trimester as contraindicated', () => {
      const result = checkPregnancySafety('lisinopril', 2);
      expect(result.trimesterRisks!.second).toBe('contraindicated');
    });

    it('should show tetracycline 3rd trimester as high risk', () => {
      const result = checkPregnancySafety('tetracycline', 3);
      expect(result.trimesterRisks!.third).toBe('high');
    });

    it('should show ondansetron as low risk in all trimesters', () => {
      for (const t of [1, 2, 3] as const) {
        const result = checkPregnancySafety('ondansetron', t);
        expect(result.trimesterRisks!.first).toBe('low');
      }
    });
  });
});

describe('Pregnancy Medication Screening', () => {
  it('should screen a typical prenatal medication list', () => {
    const result = screenMedicationsForPregnancy(['prenatal vitamins', 'acetaminophen', 'ondansetron'], 1);
    expect(result.contraindicated).toHaveLength(0);
    expect(result.highRisk).toHaveLength(0);
    expect(result.safe.length).toBeGreaterThan(0);
  });

  it('should flag contraindicated drugs in mixed list', () => {
    const result = screenMedicationsForPregnancy(['methotrexate', 'acetaminophen', 'folic acid'], 1);
    expect(result.contraindicated.length).toBeGreaterThan(0);
    expect(result.summary).toContain('ALERT');
    expect(result.summary).toContain('CONTRAINDICATED');
  });

  it('should flag ibuprofen as contraindicated in 3rd trimester', () => {
    const result = screenMedicationsForPregnancy(['ibuprofen', 'acetaminophen'], 3);
    expect(result.contraindicated.length).toBeGreaterThan(0);
  });

  it('should flag Category D drugs as high risk', () => {
    const result = screenMedicationsForPregnancy(['lithium', 'acetaminophen'], 1);
    expect(result.highRisk.length).toBeGreaterThan(0);
    expect(result.summary).toContain('WARNING');
  });

  it('should handle unknown drugs gracefully', () => {
    const result = screenMedicationsForPregnancy(['some_new_drug', 'acetaminophen'], 1);
    expect(result.unknown.length).toBeGreaterThan(0);
  });

  it('should flag statins + ACE inhibitor combo', () => {
    const result = screenMedicationsForPregnancy(['atorvastatin', 'lisinopril', 'prenatal vitamins'], 2);
    const totalFlagged = result.contraindicated.length + result.highRisk.length;
    expect(totalFlagged).toBeGreaterThanOrEqual(2);
  });

  it('should provide trimester in result', () => {
    const result = screenMedicationsForPregnancy(['acetaminophen'], 2);
    expect(result.trimester).toBe(2);
  });

  it('should work without specifying trimester', () => {
    const result = screenMedicationsForPregnancy(['warfarin', 'acetaminophen']);
    expect(result.contraindicated.length).toBeGreaterThan(0);
  });
});

describe('List Pregnancy Drugs', () => {
  it('should return a non-empty list', () => {
    const drugs = listPregnancyDrugs();
    expect(drugs.length).toBeGreaterThan(15);
  });

  it('should include all FDA categories', () => {
    const drugs = listPregnancyDrugs();
    const categories = new Set(drugs.map(d => d.category));
    expect(categories.has('A')).toBe(true);
    expect(categories.has('B')).toBe(true);
    expect(categories.has('C')).toBe(true);
    expect(categories.has('D')).toBe(true);
    expect(categories.has('X')).toBe(true);
  });

  it('should include lactation safety info', () => {
    const drugs = listPregnancyDrugs();
    const lactationStatuses = new Set(drugs.map(d => d.lactation));
    expect(lactationStatuses.size).toBeGreaterThan(2);
  });
});

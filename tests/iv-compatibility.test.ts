import { describe, it, expect } from 'vitest';
import { checkIVCompatibility, checkBulkIVCompatibility, listIVDrugsInDatabase } from '../src/data/iv-compatibility.js';

describe('IV Compatibility Checker', () => {
  describe('Single Pair Checks', () => {
    it('should detect heparin + vancomycin as incompatible', () => {
      const result = checkIVCompatibility('heparin', 'vancomycin');
      expect(result.ysite).toBe('incompatible');
      expect(result.clinicalWarning).toBeDefined();
    });

    it('should detect heparin + insulin as compatible', () => {
      const result = checkIVCompatibility('heparin', 'insulin');
      expect(result.ysite).toBe('compatible');
      expect(result.clinicalWarning).toBeUndefined();
    });

    it('should detect vancomycin + piperacillin-tazobactam as incompatible', () => {
      const result = checkIVCompatibility('vancomycin', 'piperacillin-tazobactam');
      expect(result.ysite).toBe('incompatible');
    });

    it('should detect phenytoin + dextrose as incompatible', () => {
      const result = checkIVCompatibility('phenytoin', 'dextrose');
      expect(result.ysite).toBe('incompatible');
    });

    it('should detect ceftriaxone + calcium gluconate as incompatible (fatal risk)', () => {
      const result = checkIVCompatibility('ceftriaxone', 'calcium gluconate');
      expect(result.ysite).toBe('incompatible');
      expect(result.notes).toContain('FATAL');
    });

    it('should detect magnesium sulfate + calcium gluconate as incompatible', () => {
      const result = checkIVCompatibility('magnesium sulfate', 'calcium gluconate');
      expect(result.ysite).toBe('incompatible');
    });

    it('should detect dopamine + dobutamine as compatible', () => {
      const result = checkIVCompatibility('dopamine', 'dobutamine');
      expect(result.ysite).toBe('compatible');
    });

    it('should detect fentanyl + midazolam as compatible', () => {
      const result = checkIVCompatibility('fentanyl', 'midazolam');
      expect(result.ysite).toBe('compatible');
    });

    it('should detect propofol + blood products as incompatible', () => {
      const result = checkIVCompatibility('propofol', 'blood products');
      expect(result.ysite).toBe('incompatible');
    });

    it('should detect amiodarone + furosemide as incompatible', () => {
      const result = checkIVCompatibility('amiodarone', 'furosemide');
      expect(result.ysite).toBe('incompatible');
    });

    it('should detect sodium bicarbonate + calcium chloride as incompatible', () => {
      const result = checkIVCompatibility('sodium bicarbonate', 'calcium chloride');
      expect(result.ysite).toBe('incompatible');
    });

    it('should detect dopamine + sodium bicarbonate as incompatible', () => {
      const result = checkIVCompatibility('dopamine', 'sodium bicarbonate');
      expect(result.ysite).toBe('incompatible');
    });

    it('should detect variable compatibility for amiodarone + normal saline', () => {
      const result = checkIVCompatibility('amiodarone', 'normal saline');
      expect(result.ysite).toBe('variable');
      expect(result.clinicalWarning).toContain('Variable');
    });

    it('should detect norepinephrine + vasopressin as compatible', () => {
      const result = checkIVCompatibility('norepinephrine', 'vasopressin');
      expect(result.ysite).toBe('compatible');
    });

    it('should detect pantoprazole + insulin as incompatible', () => {
      const result = checkIVCompatibility('pantoprazole', 'insulin');
      expect(result.ysite).toBe('incompatible');
    });

    it('should detect ampicillin + gentamicin as incompatible (aminoglycoside inactivation)', () => {
      const result = checkIVCompatibility('ampicillin', 'gentamicin');
      expect(result.ysite).toBe('incompatible');
      expect(result.notes).toContain('inactivated');
    });
  });

  describe('Brand Name Aliases', () => {
    it('should resolve Zosyn to piperacillin-tazobactam', () => {
      const result = checkIVCompatibility('zosyn', 'vancomycin');
      expect(result.drug1Resolved).toBe('piperacillin-tazobactam');
      expect(result.ysite).toBe('incompatible');
    });

    it('should resolve Levophed to norepinephrine', () => {
      const result = checkIVCompatibility('levophed', 'vasopressin');
      expect(result.drug1Resolved).toBe('norepinephrine');
      expect(result.ysite).toBe('compatible');
    });

    it('should resolve Lasix to furosemide', () => {
      const result = checkIVCompatibility('lasix', 'morphine');
      expect(result.drug1Resolved).toBe('furosemide');
      expect(result.ysite).toBe('compatible');
    });

    it('should resolve Versed to midazolam', () => {
      const result = checkIVCompatibility('versed', 'fentanyl');
      expect(result.drug1Resolved).toBe('midazolam');
      expect(result.ysite).toBe('compatible');
    });

    it('should resolve Precedex to dexmedetomidine', () => {
      const result = checkIVCompatibility('precedex', 'fentanyl');
      expect(result.drug1Resolved).toBe('dexmedetomidine');
      expect(result.ysite).toBe('compatible');
    });

    it('should resolve Vanco to vancomycin', () => {
      const result = checkIVCompatibility('vanco', 'metronidazole');
      expect(result.drug1Resolved).toBe('vancomycin');
      expect(result.ysite).toBe('compatible');
    });

    it('should resolve KCl to potassium chloride', () => {
      const result = checkIVCompatibility('kcl', 'insulin');
      expect(result.drug1Resolved).toBe('potassium chloride');
      expect(result.ysite).toBe('compatible');
    });

    it('should resolve bicarb to sodium bicarbonate', () => {
      const result = checkIVCompatibility('bicarb', 'dopamine');
      expect(result.drug1Resolved).toBe('sodium bicarbonate');
      expect(result.ysite).toBe('incompatible');
    });

    it('should resolve Diprivan to propofol', () => {
      const result = checkIVCompatibility('diprivan', 'fentanyl');
      expect(result.drug1Resolved).toBe('propofol');
      expect(result.ysite).toBe('compatible');
    });

    it('should resolve Rocephin to ceftriaxone', () => {
      const result = checkIVCompatibility('rocephin', 'calcium gluconate');
      expect(result.drug1Resolved).toBe('ceftriaxone');
      expect(result.ysite).toBe('incompatible');
    });
  });

  describe('Unknown Pairs', () => {
    it('should return unknown for drugs not in database', () => {
      const result = checkIVCompatibility('aspirin', 'acetaminophen');
      expect(result.ysite).toBe('unknown');
      expect(result.clinicalWarning).toContain('UNKNOWN');
    });

    it('should return unknown for one known + one unknown drug', () => {
      const result = checkIVCompatibility('heparin', 'some_rare_drug');
      expect(result.ysite).toBe('unknown');
    });
  });

  describe('Bidirectional Lookup', () => {
    it('should find compatibility regardless of drug order', () => {
      const result1 = checkIVCompatibility('heparin', 'vancomycin');
      const result2 = checkIVCompatibility('vancomycin', 'heparin');
      expect(result1.ysite).toBe(result2.ysite);
      expect(result1.admixture).toBe(result2.admixture);
    });

    it('should work bidirectionally with aliases', () => {
      const result1 = checkIVCompatibility('zosyn', 'vanco');
      const result2 = checkIVCompatibility('vancomycin', 'piperacillin-tazobactam');
      expect(result1.ysite).toBe(result2.ysite);
    });
  });
});

describe('Bulk IV Compatibility Screening', () => {
  it('should check all pairs among 3 drugs', () => {
    const result = checkBulkIVCompatibility(['heparin', 'vancomycin', 'insulin']);
    expect(result.pairs).toHaveLength(3); // 3 choose 2
  });

  it('should check all pairs among 4 drugs', () => {
    const result = checkBulkIVCompatibility(['heparin', 'vancomycin', 'insulin', 'morphine']);
    expect(result.pairs).toHaveLength(6); // 4 choose 2
  });

  it('should identify incompatible pairs in ICU scenario', () => {
    const result = checkBulkIVCompatibility(['vancomycin', 'piperacillin-tazobactam', 'heparin', 'insulin']);
    expect(result.incompatiblePairs.length).toBeGreaterThan(0);
    expect(result.summary).toContain('WARNING');
  });

  it('should show all compatible for safe combinations', () => {
    const result = checkBulkIVCompatibility(['dopamine', 'dobutamine']);
    expect(result.incompatiblePairs).toHaveLength(0);
    expect(result.compatiblePairs.length).toBeGreaterThan(0);
  });

  it('should handle brand names in bulk check', () => {
    const result = checkBulkIVCompatibility(['zosyn', 'vanco', 'levophed']);
    expect(result.resolvedDrugs).toContain('piperacillin-tazobactam');
    expect(result.resolvedDrugs).toContain('vancomycin');
    expect(result.resolvedDrugs).toContain('norepinephrine');
  });

  it('should flag ceftriaxone + calcium in neonatal scenario', () => {
    const result = checkBulkIVCompatibility(['ceftriaxone', 'calcium gluconate', 'normal saline']);
    expect(result.incompatiblePairs.length).toBeGreaterThan(0);
    const fatal = result.incompatiblePairs.find(p =>
      (p.drug1Resolved === 'ceftriaxone' || p.drug2Resolved === 'ceftriaxone')
    );
    expect(fatal).toBeDefined();
  });

  it('should handle cardiac arrest drug combo', () => {
    const result = checkBulkIVCompatibility(['amiodarone', 'sodium bicarbonate', 'calcium chloride']);
    expect(result.incompatiblePairs.length).toBeGreaterThanOrEqual(2);
  });

  it('should provide summary with unknown pairs', () => {
    const result = checkBulkIVCompatibility(['heparin', 'some_unknown_drug']);
    expect(result.unknownPairs.length).toBeGreaterThan(0);
  });
});

describe('List IV Drugs', () => {
  it('should return a non-empty list', () => {
    const drugs = listIVDrugsInDatabase();
    expect(drugs.length).toBeGreaterThan(20);
  });

  it('should include common ICU drugs', () => {
    const drugs = listIVDrugsInDatabase();
    expect(drugs).toContain('heparin');
    expect(drugs).toContain('vancomycin');
    expect(drugs).toContain('insulin');
    expect(drugs).toContain('norepinephrine');
    expect(drugs).toContain('propofol');
  });

  it('should be sorted alphabetically', () => {
    const drugs = listIVDrugsInDatabase();
    const sorted = [...drugs].sort();
    expect(drugs).toEqual(sorted);
  });
});

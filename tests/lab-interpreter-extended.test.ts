import { describe, it, expect } from 'vitest';
import { interpretLabResult, interpretLabPanel, resolveLabTest, labReferences } from '../src/data/lab-references';
import { interpretSingleLab, interpretPanel, listAvailableTests } from '../src/tools/lab-interpreter-tool';

describe('Lab Reference Data Integrity', () => {
  it('all lab references have valid test codes', () => {
    for (const ref of labReferences) {
      expect(ref.testCode).toBeTruthy();
      expect(ref.testName).toBeTruthy();
      expect(ref.unit).toBeDefined();
      expect(ref.category).toBeTruthy();
    }
  });

  it('all lab references have normal range with low < high', () => {
    for (const ref of labReferences) {
      expect(ref.normalRange.low).toBeLessThanOrEqual(ref.normalRange.high);
    }
  });

  it('all lab references have at least one interpretation entry', () => {
    for (const ref of labReferences) {
      expect(Object.keys(ref.interpretation).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('all interpretation entries have required fields', () => {
    for (const ref of labReferences) {
      for (const [, interp] of Object.entries(ref.interpretation)) {
        expect(interp.range).toBeTruthy();
        expect(interp.meaning).toBeTruthy();
        expect(interp.action).toBeTruthy();
      }
    }
  });

  it('critical ranges are wider than normal ranges where defined', () => {
    for (const ref of labReferences) {
      if (ref.criticalRange?.low !== undefined) {
        expect(ref.criticalRange.low).toBeLessThan(ref.normalRange.low);
      }
      if (ref.criticalRange?.high !== undefined) {
        expect(ref.criticalRange.high).toBeGreaterThan(ref.normalRange.high);
      }
    }
  });

  it('each test has a unique test code', () => {
    const codes = labReferences.map(r => r.testCode);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });
});

describe('Lab Result Boundary Values', () => {
  it('WBC at exactly normal low boundary (4.5)', () => {
    const result = interpretLabResult('WBC', 4.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('WBC at exactly normal high boundary (11.0)', () => {
    const result = interpretLabResult('WBC', 11.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('WBC just above normal high (11.1)', () => {
    const result = interpretLabResult('WBC', 11.1);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('WBC just below normal low (4.4)', () => {
    const result = interpretLabResult('WBC', 4.4);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('WBC at critical low boundary (2.0)', () => {
    const result = interpretLabResult('WBC', 2.0);
    expect(result).not.toBeNull();
    // 2.0 is the boundary - at critical_low (<2.0) it should be abnormal not critical
    expect(result!.urgency).toBe('abnormal');
  });

  it('WBC just below critical low (1.9)', () => {
    const result = interpretLabResult('WBC', 1.9);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('WBC at critical high boundary (30.0)', () => {
    const result = interpretLabResult('WBC', 30.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('potassium at exactly 3.5 (normal low)', () => {
    const result = interpretLabResult('K', 3.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('potassium at exactly 5.0 (normal high)', () => {
    const result = interpretLabResult('K', 5.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('potassium at 5.1 (just above normal)', () => {
    const result = interpretLabResult('K', 5.1);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('potassium at 2.5 (critical low boundary)', () => {
    const result = interpretLabResult('K', 2.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('potassium at 6.5 (critical high boundary)', () => {
    const result = interpretLabResult('K', 6.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('sodium at exactly 136 (normal low)', () => {
    const result = interpretLabResult('NA', 136);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('sodium at exactly 145 (normal high)', () => {
    const result = interpretLabResult('NA', 145);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('hemoglobin at exactly 12.0 (normal low)', () => {
    const result = interpretLabResult('HGB', 12.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('glucose at exactly 70 (normal low)', () => {
    const result = interpretLabResult('GLU', 70);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('glucose at exactly 100 (normal high)', () => {
    const result = interpretLabResult('GLU', 100);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('glucose at 0 (extreme low)', () => {
    const result = interpretLabResult('GLU', 0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('calcium at critical low boundary (6.0)', () => {
    const result = interpretLabResult('CA', 6.0);
    expect(result).not.toBeNull();
    // At 6.0, it's >=6.0 so above critical_low, so abnormal
    expect(result!.urgency).toBe('abnormal');
  });

  it('calcium at 5.9 (below critical low)', () => {
    const result = interpretLabResult('CA', 5.9);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });
});

describe('Lab Tests with Special Interpretation Keys', () => {
  it('glucose in prediabetes range (101-125)', () => {
    const result = interpretLabResult('GLU', 110);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('glucose at 500 (critical high boundary)', () => {
    const result = interpretLabResult('GLU', 500);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('INR in therapeutic warfarin range (2.0-3.0)', () => {
    const result = interpretLabResult('INR', 2.5);
    expect(result).not.toBeNull();
    // INR 2.5 is above normal high (1.1) but below critical (5.0) = abnormal
    expect(result!.urgency).toBe('abnormal');
  });

  it('INR at exactly 5.0 (critical boundary)', () => {
    const result = interpretLabResult('INR', 5.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('TSH low (possible hyperthyroidism)', () => {
    const result = interpretLabResult('TSH', 0.1);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('TSH subclinical hypothyroidism range', () => {
    const result = interpretLabResult('TSH', 6.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('TSH overt hypothyroidism', () => {
    const result = interpretLabResult('TSH', 15.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('HbA1c in prediabetes range (5.7-6.4)', () => {
    const result = interpretLabResult('HBA1C', 6.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('HbA1c poorly controlled diabetes (>=9.0)', () => {
    const result = interpretLabResult('HBA1C', 10.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('CRP mild inflammation (3.1-10.0)', () => {
    const result = interpretLabResult('CRP', 5.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('CRP severe inflammation (>100)', () => {
    const result = interpretLabResult('CRP', 150);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('procalcitonin in bacterial infection likely range', () => {
    const result = interpretLabResult('PCT', 1.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('procalcitonin in severe sepsis range', () => {
    const result = interpretLabResult('PCT', 10.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('BNP in gray zone (101-400)', () => {
    const result = interpretLabResult('BNP', 250);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('BNP critical (>=900)', () => {
    const result = interpretLabResult('BNP', 1000);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('D-dimer markedly elevated (>2000)', () => {
    const result = interpretLabResult('DDIMER', 3000);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('LDL very high (>=190)', () => {
    const result = interpretLabResult('LDL', 210);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('HDL at exactly 40 (normal low)', () => {
    const result = interpretLabResult('HDL', 40);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('triglycerides at exactly 500 (critical boundary)', () => {
    const result = interpretLabResult('TG', 500);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('magnesium at critical high (>=4.0)', () => {
    const result = interpretLabResult('MG', 4.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('magnesium at high but not critical (2.3-3.9)', () => {
    const result = interpretLabResult('MG', 3.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('ALP markedly elevated (>600)', () => {
    const result = interpretLabResult('ALP', 700);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('ALT mild elevation (57-200)', () => {
    const result = interpretLabResult('ALT', 100);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('ALT critical (>=1000)', () => {
    const result = interpretLabResult('ALT', 1500);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('AST moderate elevation (201-999)', () => {
    const result = interpretLabResult('AST', 500);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('AST critical (>=1000)', () => {
    const result = interpretLabResult('AST', 1200);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('platelet at critical high (>=1000)', () => {
    const result = interpretLabResult('PLT', 1200);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('BUN critical high (>=100)', () => {
    const result = interpretLabResult('BUN', 110);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('creatinine critical high (>=10.0)', () => {
    const result = interpretLabResult('CREAT', 12.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('creatinine low (<0.7)', () => {
    const result = interpretLabResult('CREAT', 0.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('BUN low (<7)', () => {
    const result = interpretLabResult('BUN', 5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });
});

describe('Lab Result Output Field Validation', () => {
  it('result contains all required fields', () => {
    const result = interpretLabResult('WBC', 7.0);
    expect(result).not.toBeNull();
    expect(result!.testCode).toBe('WBC');
    expect(result!.testName).toBe('White Blood Cell Count');
    expect(result!.value).toBe(7.0);
    expect(result!.unit).toBe('K/uL');
    expect(result!.urgency).toBeDefined();
    expect(result!.referenceRange).toContain('4.5');
    expect(result!.referenceRange).toContain('11');
    expect(result!.interpretation).toBeTruthy();
    expect(result!.clinicalSignificance).toBeTruthy();
    expect(result!.suggestedAction).toBeTruthy();
  });

  it('critical result has CRITICAL significance', () => {
    const result = interpretLabResult('K', 7.0);
    expect(result!.clinicalSignificance).toContain('CRITICAL');
  });

  it('abnormal result has Abnormal significance', () => {
    const result = interpretLabResult('HGB', 9.0);
    expect(result!.clinicalSignificance).toContain('Abnormal');
  });

  it('normal result has Within normal limits significance', () => {
    const result = interpretLabResult('WBC', 7.0);
    expect(result!.clinicalSignificance).toContain('Within normal limits');
  });
});

describe('Lab Test Resolution Extended', () => {
  it('resolves all hematology aliases', () => {
    expect(resolveLabTest('leukocytes')).not.toBeNull();
    expect(resolveLabTest('white blood cells')).not.toBeNull();
    expect(resolveLabTest('hgb')).not.toBeNull();
    expect(resolveLabTest('hb')).not.toBeNull();
    expect(resolveLabTest('platelets')).not.toBeNull();
    expect(resolveLabTest('thrombocytes')).not.toBeNull();
  });

  it('resolves all metabolic aliases', () => {
    expect(resolveLabTest('blood sugar')).not.toBeNull();
    expect(resolveLabTest('fasting glucose')).not.toBeNull();
    expect(resolveLabTest('blood glucose')).not.toBeNull();
    expect(resolveLabTest('serum creatinine')).not.toBeNull();
    expect(resolveLabTest('cr')).not.toBeNull();
    expect(resolveLabTest('urea nitrogen')).not.toBeNull();
  });

  it('resolves all electrolyte aliases', () => {
    expect(resolveLabTest('sodium')).not.toBeNull();
    expect(resolveLabTest('serum sodium')).not.toBeNull();
    expect(resolveLabTest('na')).not.toBeNull();
    expect(resolveLabTest('potassium')).not.toBeNull();
    expect(resolveLabTest('k+')).not.toBeNull();
    expect(resolveLabTest('serum potassium')).not.toBeNull();
  });

  it('resolves all liver function aliases', () => {
    expect(resolveLabTest('sgpt')).not.toBeNull();
    expect(resolveLabTest('alanine transaminase')).not.toBeNull();
    expect(resolveLabTest('sgot')).not.toBeNull();
    expect(resolveLabTest('aspartate transaminase')).not.toBeNull();
  });

  it('resolves cardiac marker aliases', () => {
    expect(resolveLabTest('hs-troponin')).not.toBeNull();
    expect(resolveLabTest('troponin i')).not.toBeNull();
    expect(resolveLabTest('brain natriuretic peptide')).not.toBeNull();
  });

  it('resolves thyroid and endocrine aliases', () => {
    expect(resolveLabTest('thyrotropin')).not.toBeNull();
    expect(resolveLabTest('a1c')).not.toBeNull();
    expect(resolveLabTest('glycated hemoglobin')).not.toBeNull();
  });

  it('resolves inflammatory marker aliases', () => {
    expect(resolveLabTest('c-reactive protein')).not.toBeNull();
  });

  it('resolves coagulation aliases', () => {
    expect(resolveLabTest('prothrombin time ratio')).not.toBeNull();
    expect(resolveLabTest('fibrin degradation product')).not.toBeNull();
  });

  it('handles trimming of input', () => {
    expect(resolveLabTest('  WBC  ')).not.toBeNull();
    expect(resolveLabTest('  potassium  ')).not.toBeNull();
  });
});

describe('Lab Panel Extended Tests', () => {
  it('interprets a comprehensive metabolic panel', () => {
    const results = interpretLabPanel([
      { test: 'GLU', value: 95 },
      { test: 'CREAT', value: 1.0 },
      { test: 'BUN', value: 15 },
      { test: 'NA', value: 140 },
      { test: 'K', value: 4.0 },
      { test: 'CA', value: 9.5 },
      { test: 'MG', value: 2.0 },
      { test: 'ALT', value: 25 },
      { test: 'AST', value: 20 },
    ]);
    expect(results.length).toBe(9);
    expect(results.every(r => r.urgency === 'normal')).toBe(true);
  });

  it('interprets a full CBC panel', () => {
    const results = interpretLabPanel([
      { test: 'WBC', value: 7.0 },
      { test: 'HGB', value: 14.0 },
      { test: 'PLT', value: 250 },
    ]);
    expect(results.length).toBe(3);
  });

  it('interprets a cardiac panel with critical values', () => {
    const results = interpretLabPanel([
      { test: 'TROP', value: 250 },
      { test: 'BNP', value: 1000 },
      { test: 'INR', value: 5.5 },
    ]);
    const criticals = results.filter(r => r.urgency === 'critical');
    expect(criticals.length).toBeGreaterThanOrEqual(2);
  });

  it('handles empty panel', () => {
    const results = interpretLabPanel([]);
    expect(results).toHaveLength(0);
  });

  it('handles panel with all unknown tests', () => {
    const results = interpretLabPanel([
      { test: 'UNKNOWN1', value: 42 },
      { test: 'UNKNOWN2', value: 99 },
    ]);
    expect(results).toHaveLength(0);
  });
});

describe('interpretPanel Tool Summary', () => {
  it('summary mentions unresolved tests', () => {
    const result = interpretPanel({
      results: [
        { test: 'WBC', value: 7.0 },
        { test: 'UNKNOWN', value: 42 },
      ],
    });
    expect(result.summary).toContain('not found');
  });

  it('summary counts abnormal values', () => {
    const result = interpretPanel({
      results: [
        { test: 'HGB', value: 9.0 },
        { test: 'WBC', value: 7.0 },
      ],
    });
    expect(result.abnormalValues.length).toBe(1);
    expect(result.summary).toContain('1 abnormal');
  });

  it('correctly separates critical and abnormal in panel', () => {
    const result = interpretPanel({
      results: [
        { test: 'K', value: 7.0 },      // critical
        { test: 'HGB', value: 9.0 },     // abnormal
        { test: 'WBC', value: 7.0 },     // normal
      ],
    });
    expect(result.criticalValues.length).toBe(1);
    expect(result.abnormalValues.length).toBe(1);
    const normalCount = result.results.filter(r => r.urgency === 'normal').length;
    expect(normalCount).toBe(1);
  });

  it('listAvailableTests includes categories', () => {
    const tests = listAvailableTests();
    const categories = [...new Set(tests.map(t => t.category))];
    expect(categories.length).toBeGreaterThanOrEqual(5);
    expect(categories).toContain('Hematology');
    expect(categories).toContain('Metabolic');
    expect(categories).toContain('Electrolytes');
    expect(categories).toContain('Hepatic');
    expect(categories).toContain('Cardiac');
  });
});

describe('Negative and Zero Values', () => {
  it('handles value of 0 for WBC', () => {
    const result = interpretLabResult('WBC', 0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('handles value of 0 for hemoglobin', () => {
    const result = interpretLabResult('HGB', 0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('handles very large values', () => {
    const result = interpretLabResult('WBC', 100);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('handles troponin value of 0 (normal)', () => {
    const result = interpretLabResult('TROP', 0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('handles INR value of 1.0 (normal)', () => {
    const result = interpretLabResult('INR', 1.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });
});

import { describe, it, expect } from 'vitest';
import { resolveLabTest, interpretLabResult, interpretLabPanel, labReferences } from '../src/data/lab-references';
import { interpretSingleLab, interpretPanel, listAvailableTests } from '../src/tools/lab-interpreter-tool';

/**
 * Comprehensive lab interpreter tests covering all test codes, boundary values,
 * critical thresholds, panel interpretations, and edge cases.
 */

describe('Lab Test Resolution', () => {
  it('resolves all test codes by their primary code', () => {
    const codes = ['WBC', 'HGB', 'PLT', 'GLU', 'CREAT', 'BUN', 'NA', 'K',
      'ALT', 'AST', 'TROP', 'BNP', 'INR', 'TSH', 'CRP', 'HBA1C',
      'TCHOL', 'LDL', 'HDL', 'TG', 'CA', 'MG', 'ALP', 'DDIMER', 'PCT'];
    for (const code of codes) {
      const ref = resolveLabTest(code);
      expect(ref).not.toBeNull();
      expect(ref!.testCode).toBe(code);
    }
  });

  it('resolves tests by lowercase code', () => {
    expect(resolveLabTest('wbc')).not.toBeNull();
    expect(resolveLabTest('hgb')).not.toBeNull();
    expect(resolveLabTest('plt')).not.toBeNull();
    expect(resolveLabTest('inr')).not.toBeNull();
  });

  it('resolves tests by aliases', () => {
    expect(resolveLabTest('hemoglobin')).not.toBeNull();
    expect(resolveLabTest('platelets')).not.toBeNull();
    expect(resolveLabTest('potassium')).not.toBeNull();
    expect(resolveLabTest('sodium')).not.toBeNull();
    expect(resolveLabTest('troponin')).not.toBeNull();
    expect(resolveLabTest('blood sugar')).not.toBeNull();
  });

  it('resolves tests by full name', () => {
    expect(resolveLabTest('White Blood Cell Count')).not.toBeNull();
    expect(resolveLabTest('Hemoglobin')).not.toBeNull();
    expect(resolveLabTest('Platelet Count')).not.toBeNull();
    expect(resolveLabTest('Creatinine')).not.toBeNull();
  });

  it('returns null for unknown test names', () => {
    expect(resolveLabTest('xyz123')).toBeNull();
    expect(resolveLabTest('fake_test')).toBeNull();
    expect(resolveLabTest('complete blood count')).toBeNull();
  });

  it('handles whitespace in test names', () => {
    expect(resolveLabTest('  WBC  ')).not.toBeNull();
    expect(resolveLabTest(' hemoglobin ')).not.toBeNull();
  });
});

describe('WBC Interpretation - All Ranges', () => {
  it('critical low WBC (<2.0)', () => {
    const result = interpretLabResult('WBC', 1.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
    expect(result!.interpretation).toContain('leukopenia');
  });

  it('low WBC (2.0-4.4)', () => {
    const result = interpretLabResult('WBC', 3.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('normal WBC (4.5-11.0)', () => {
    const result = interpretLabResult('WBC', 7.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('high WBC (11.1-29.9)', () => {
    const result = interpretLabResult('WBC', 15.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('critical high WBC (>=30.0)', () => {
    const result = interpretLabResult('WBC', 35.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('WBC at exact normal boundary low (4.5)', () => {
    const result = interpretLabResult('WBC', 4.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('WBC at exact normal boundary high (11.0)', () => {
    const result = interpretLabResult('WBC', 11.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('WBC just below normal (4.4)', () => {
    const result = interpretLabResult('WBC', 4.4);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('WBC at critical low boundary (2.0)', () => {
    const result = interpretLabResult('WBC', 2.0);
    expect(result).not.toBeNull();
    // 2.0 is at the boundary - should be abnormal (not critical since <2.0 is critical)
    expect(result!.urgency).toBe('abnormal');
  });
});

describe('Glucose Interpretation - All Ranges', () => {
  it('critical low glucose (<40)', () => {
    const result = interpretLabResult('GLU', 30);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('low glucose (40-69)', () => {
    const result = interpretLabResult('GLU', 55);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('normal glucose (70-100)', () => {
    const result = interpretLabResult('GLU', 85);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('high glucose (126-499)', () => {
    const result = interpretLabResult('GLU', 250);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('critical high glucose (>=500)', () => {
    const result = interpretLabResult('GLU', 600);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('glucose at boundary 70', () => {
    const result = interpretLabResult('GLU', 70);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('glucose at boundary 100', () => {
    const result = interpretLabResult('GLU', 100);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('glucose at 500 boundary', () => {
    const result = interpretLabResult('GLU', 500);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });
});

describe('Potassium Interpretation - All Ranges', () => {
  it('critical low K (<2.5)', () => {
    const result = interpretLabResult('K', 2.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('low K (2.5-3.4)', () => {
    const result = interpretLabResult('K', 3.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('normal K (3.5-5.0)', () => {
    const result = interpretLabResult('K', 4.2);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('high K (5.1-6.4)', () => {
    const result = interpretLabResult('K', 5.8);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('critical high K (>=6.5)', () => {
    const result = interpretLabResult('K', 7.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('K at exact boundary 3.5', () => {
    const result = interpretLabResult('K', 3.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('K at exact boundary 5.0', () => {
    const result = interpretLabResult('K', 5.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('K at exact critical boundary 6.5', () => {
    const result = interpretLabResult('K', 6.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });
});

describe('Sodium Interpretation - All Ranges', () => {
  it('critical low Na (<120)', () => {
    const result = interpretLabResult('NA', 115);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('low Na (120-135)', () => {
    const result = interpretLabResult('NA', 128);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('normal Na (136-145)', () => {
    const result = interpretLabResult('NA', 140);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('high Na (146-159)', () => {
    const result = interpretLabResult('NA', 152);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('critical high Na (>=160)', () => {
    const result = interpretLabResult('NA', 165);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });
});

describe('Troponin Interpretation', () => {
  it('normal troponin (0-14)', () => {
    const result = interpretLabResult('TROP', 5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('elevated troponin (15-99)', () => {
    const result = interpretLabResult('TROP', 50);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('critical troponin (>=100)', () => {
    const result = interpretLabResult('TROP', 150);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('troponin at boundary 14', () => {
    const result = interpretLabResult('TROP', 14);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('troponin at 0', () => {
    const result = interpretLabResult('TROP', 0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });
});

describe('INR Interpretation', () => {
  it('normal INR (0.8-1.1)', () => {
    const result = interpretLabResult('INR', 1.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('elevated INR above normal', () => {
    const result = interpretLabResult('INR', 2.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('critical INR (>=5.0)', () => {
    const result = interpretLabResult('INR', 6.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('low INR', () => {
    const result = interpretLabResult('INR', 0.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });
});

describe('Thyroid (TSH) Interpretation', () => {
  it('low TSH (<0.4)', () => {
    const result = interpretLabResult('TSH', 0.1);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('normal TSH (0.4-4.0)', () => {
    const result = interpretLabResult('TSH', 2.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('high TSH (>4.0)', () => {
    const result = interpretLabResult('TSH', 8.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });
});

describe('Lipid Panel Tests', () => {
  it('desirable total cholesterol (<200)', () => {
    const result = interpretLabResult('TCHOL', 180);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('high total cholesterol (>=240)', () => {
    const result = interpretLabResult('TCHOL', 260);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('optimal LDL (<70)', () => {
    const result = interpretLabResult('LDL', 50);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('very high LDL (>=190)', () => {
    const result = interpretLabResult('LDL', 200);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('low HDL (<40)', () => {
    const result = interpretLabResult('HDL', 35);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('high HDL (protective, >=60)', () => {
    const result = interpretLabResult('HDL', 65);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('normal triglycerides (<150)', () => {
    const result = interpretLabResult('TG', 120);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('critical high triglycerides (>=500)', () => {
    const result = interpretLabResult('TG', 550);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });
});

describe('Calcium and Magnesium', () => {
  it('critical low calcium (<6.0)', () => {
    const result = interpretLabResult('CA', 5.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('normal calcium (8.5-10.5)', () => {
    const result = interpretLabResult('CA', 9.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('critical high calcium (>=13.0)', () => {
    const result = interpretLabResult('CA', 14.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('critical low magnesium (<1.0)', () => {
    const result = interpretLabResult('MG', 0.8);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('normal magnesium (1.7-2.2)', () => {
    const result = interpretLabResult('MG', 2.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('critical high magnesium (>=4.0)', () => {
    const result = interpretLabResult('MG', 4.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });
});

describe('Liver Function Tests', () => {
  it('normal ALT (7-56)', () => {
    const result = interpretLabResult('ALT', 30);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('elevated ALT (>56)', () => {
    const result = interpretLabResult('ALT', 100);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('critical ALT (>=1000)', () => {
    const result = interpretLabResult('ALT', 1200);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('normal AST (10-40)', () => {
    const result = interpretLabResult('AST', 25);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('elevated AST (>40)', () => {
    const result = interpretLabResult('AST', 80);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('critical AST (>=1000)', () => {
    const result = interpretLabResult('AST', 1500);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('normal ALP (44-147)', () => {
    const result = interpretLabResult('ALP', 90);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('elevated ALP (>147)', () => {
    const result = interpretLabResult('ALP', 200);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });
});

describe('Inflammatory Markers', () => {
  it('normal CRP (0-3.0)', () => {
    const result = interpretLabResult('CRP', 1.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('elevated CRP (>3.0)', () => {
    const result = interpretLabResult('CRP', 25);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('normal procalcitonin (0-0.1)', () => {
    const result = interpretLabResult('PCT', 0.05);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('elevated procalcitonin (>0.1)', () => {
    const result = interpretLabResult('PCT', 1.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });
});

describe('D-dimer Interpretation', () => {
  it('normal D-dimer (0-500)', () => {
    const result = interpretLabResult('DDIMER', 300);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('elevated D-dimer (>500)', () => {
    const result = interpretLabResult('DDIMER', 800);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });
});

describe('BNP (Heart Failure) Interpretation', () => {
  it('normal BNP (0-100)', () => {
    const result = interpretLabResult('BNP', 50);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('elevated BNP (>100)', () => {
    const result = interpretLabResult('BNP', 500);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('critical BNP (>=900)', () => {
    const result = interpretLabResult('BNP', 1000);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });
});

describe('Lab Panel Interpretation', () => {
  it('interprets a basic metabolic panel', () => {
    const result = interpretPanel({
      results: [
        { test: 'NA', value: 140 },
        { test: 'K', value: 4.0 },
        { test: 'GLU', value: 90 },
        { test: 'CREAT', value: 1.0 },
        { test: 'BUN', value: 15 },
      ],
    });
    expect(result.results.length).toBe(5);
    expect(result.criticalValues.length).toBe(0);
    expect(result.abnormalValues.length).toBe(0);
    expect(result.summary).toContain('5 lab results');
  });

  it('identifies critical values in panel', () => {
    const result = interpretPanel({
      results: [
        { test: 'K', value: 7.0 }, // critical
        { test: 'NA', value: 115 }, // critical
        { test: 'GLU', value: 90 }, // normal
      ],
    });
    expect(result.criticalValues.length).toBe(2);
    expect(result.summary).toContain('CRITICAL');
  });

  it('identifies abnormal values in panel', () => {
    const result = interpretPanel({
      results: [
        { test: 'HGB', value: 10.0 }, // abnormal low
        { test: 'WBC', value: 15.0 }, // abnormal high
        { test: 'PLT', value: 200 }, // normal
      ],
    });
    expect(result.abnormalValues.length).toBe(2);
    expect(result.summary).toContain('abnormal');
  });

  it('handles panel with unknown tests', () => {
    const result = interpretPanel({
      results: [
        { test: 'NA', value: 140 },
        { test: 'UNKNOWN_TEST', value: 5.0 },
      ],
    });
    // Unknown test should be filtered out
    expect(result.results.length).toBe(1);
    expect(result.summary).toContain('1 test(s) not found');
  });

  it('handles empty results panel', () => {
    const result = interpretPanel({ results: [] });
    expect(result.results.length).toBe(0);
    expect(result.criticalValues.length).toBe(0);
    expect(result.abnormalValues.length).toBe(0);
  });

  it('comprehensive panel with mixed results', () => {
    const result = interpretPanel({
      results: [
        { test: 'WBC', value: 1.5 },   // critical low
        { test: 'HGB', value: 14.0 },   // normal
        { test: 'PLT', value: 80 },     // abnormal low
        { test: 'GLU', value: 250 },     // abnormal high
        { test: 'K', value: 4.0 },       // normal
        { test: 'NA', value: 140 },      // normal
        { test: 'CREAT', value: 1.0 },   // normal
      ],
    });
    expect(result.criticalValues.length).toBe(1); // WBC
    expect(result.abnormalValues.length).toBe(2); // PLT, GLU
    expect(result.results.length).toBe(7);
  });
});

describe('interpretSingleLab Error Handling', () => {
  it('returns error for unknown test', () => {
    const result = interpretSingleLab({ test: 'UNKNOWN', value: 5 });
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('not found');
      expect(result.availableTests).toBeDefined();
      expect(result.availableTests.length).toBeGreaterThan(0);
    }
  });

  it('available tests list contains expected tests', () => {
    const result = interpretSingleLab({ test: 'NONEXISTENT', value: 5 });
    if ('error' in result) {
      expect(result.availableTests.some(t => t.includes('WBC'))).toBe(true);
      expect(result.availableTests.some(t => t.includes('HGB'))).toBe(true);
    }
  });
});

describe('listAvailableTests', () => {
  it('returns all lab tests', () => {
    const tests = listAvailableTests();
    expect(tests.length).toBe(labReferences.length);
    expect(tests.length).toBeGreaterThanOrEqual(20);
  });

  it('each test has required fields', () => {
    const tests = listAvailableTests();
    for (const test of tests) {
      expect(test).toHaveProperty('code');
      expect(test).toHaveProperty('name');
      expect(test).toHaveProperty('unit');
      expect(test).toHaveProperty('category');
      expect(test).toHaveProperty('normalRange');
    }
  });

  it('includes expected categories', () => {
    const tests = listAvailableTests();
    const categories = new Set(tests.map(t => t.category));
    expect(categories.has('Hematology')).toBe(true);
    expect(categories.has('Metabolic')).toBe(true);
    expect(categories.has('Renal')).toBe(true);
    expect(categories.has('Electrolytes')).toBe(true);
    expect(categories.has('Hepatic')).toBe(true);
    expect(categories.has('Cardiac')).toBe(true);
  });
});

describe('Lab Result Output Structure', () => {
  it('returns complete result structure for valid test', () => {
    const result = interpretLabResult('WBC', 7.5);
    expect(result).not.toBeNull();
    expect(result!.testCode).toBe('WBC');
    expect(result!.testName).toBe('White Blood Cell Count');
    expect(result!.value).toBe(7.5);
    expect(result!.unit).toBe('K/uL');
    expect(result!.urgency).toBe('normal');
    expect(result!.referenceRange).toContain('4.5');
    expect(result!.referenceRange).toContain('11');
    expect(result!.interpretation).toBeTruthy();
    expect(result!.clinicalSignificance).toBeTruthy();
    expect(result!.suggestedAction).toBeTruthy();
  });

  it('clinical significance matches urgency level', () => {
    const critical = interpretLabResult('K', 7.0);
    expect(critical!.clinicalSignificance).toContain('CRITICAL');

    const abnormal = interpretLabResult('K', 5.5);
    expect(abnormal!.clinicalSignificance).toContain('Abnormal');

    const normal = interpretLabResult('K', 4.0);
    expect(normal!.clinicalSignificance).toContain('normal');
  });
});

describe('Extreme Values', () => {
  it('handles very high WBC (100)', () => {
    const result = interpretLabResult('WBC', 100);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('handles zero value', () => {
    const result = interpretLabResult('WBC', 0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('handles very high glucose (1000)', () => {
    const result = interpretLabResult('GLU', 1000);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('handles very high creatinine (15)', () => {
    const result = interpretLabResult('CREAT', 15);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('handles negative value (physically impossible but should not crash)', () => {
    const result = interpretLabResult('WBC', -1);
    expect(result).not.toBeNull();
    // Should be critical or abnormal depending on range logic
  });
});

describe('HbA1c Specific Tests', () => {
  it('normal HbA1c (4.0-5.6)', () => {
    const result = interpretLabResult('HBA1C', 5.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('pre-diabetes HbA1c (5.7-6.4)', () => {
    const result = interpretLabResult('HBA1C', 6.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('diabetes range HbA1c (>=6.5)', () => {
    const result = interpretLabResult('HBA1C', 7.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('poorly controlled HbA1c (>=9.0)', () => {
    const result = interpretLabResult('HBA1C', 10.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });
});

describe('Creatinine and BUN', () => {
  it('normal creatinine', () => {
    const result = interpretLabResult('CREAT', 1.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('elevated creatinine', () => {
    const result = interpretLabResult('CREAT', 3.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('critical creatinine (>=10)', () => {
    const result = interpretLabResult('CREAT', 12.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('normal BUN', () => {
    const result = interpretLabResult('BUN', 15);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('elevated BUN', () => {
    const result = interpretLabResult('BUN', 40);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('critical BUN (>=100)', () => {
    const result = interpretLabResult('BUN', 110);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });
});

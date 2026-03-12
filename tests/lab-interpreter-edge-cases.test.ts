import { describe, it, expect } from 'vitest';
import { interpretLabResult, interpretLabPanel, resolveLabTest, labReferences } from '../src/data/lab-references';
import { interpretSingleLab, interpretPanel, listAvailableTests } from '../src/tools/lab-interpreter-tool';

/**
 * Edge cases and boundary conditions for lab interpretation.
 */

describe('Lab Test Resolution Edge Cases', () => {
  it('resolves test by code case-insensitively', () => {
    expect(resolveLabTest('wbc')).not.toBeNull();
    expect(resolveLabTest('WBC')).not.toBeNull();
    expect(resolveLabTest('Wbc')).not.toBeNull();
  });

  it('resolves test by full name', () => {
    expect(resolveLabTest('White Blood Cell Count')).not.toBeNull();
    expect(resolveLabTest('Hemoglobin')).not.toBeNull();
    expect(resolveLabTest('Platelet Count')).not.toBeNull();
  });

  it('resolves test by alias', () => {
    expect(resolveLabTest('leukocytes')).not.toBeNull();
    expect(resolveLabTest('hgb')).not.toBeNull();
    expect(resolveLabTest('platelets')).not.toBeNull();
    expect(resolveLabTest('blood sugar')).not.toBeNull();
    expect(resolveLabTest('troponin')).not.toBeNull();
    expect(resolveLabTest('d-dimer')).not.toBeNull();
  });

  it('returns null for unknown test', () => {
    expect(resolveLabTest('xyz123')).toBeNull();
    expect(resolveLabTest('')).toBeNull();
    expect(resolveLabTest('   ')).toBeNull();
  });

  it('resolves with leading/trailing spaces', () => {
    expect(resolveLabTest('  WBC  ')).not.toBeNull();
    expect(resolveLabTest(' hemoglobin ')).not.toBeNull();
  });
});

describe('Lab Interpretation Boundary Values', () => {
  // WBC boundaries: normal 4.5-11.0, critical <2.0 or >=30.0
  describe('WBC boundaries', () => {
    it('critical low: value < 2.0', () => {
      const result = interpretLabResult('WBC', 1.5);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });

    it('abnormal low: value between 2.0 and 4.4', () => {
      const result = interpretLabResult('WBC', 3.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('normal: value at lower boundary 4.5', () => {
      const result = interpretLabResult('WBC', 4.5);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('normal: value at upper boundary 11.0', () => {
      const result = interpretLabResult('WBC', 11.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('abnormal high: value 11.1', () => {
      const result = interpretLabResult('WBC', 11.1);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('critical high: value >= 30.0', () => {
      const result = interpretLabResult('WBC', 30.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });

    it('extreme value: WBC of 0', () => {
      const result = interpretLabResult('WBC', 0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });
  });

  // Potassium boundaries: normal 3.5-5.0, critical <2.5 or >=6.5
  describe('Potassium boundaries', () => {
    it('critical low: K < 2.5', () => {
      const result = interpretLabResult('K', 2.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });

    it('abnormal low: K between 2.5 and 3.4', () => {
      const result = interpretLabResult('K', 3.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('normal: K at 3.5', () => {
      const result = interpretLabResult('K', 3.5);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('normal: K at 5.0', () => {
      const result = interpretLabResult('K', 5.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('abnormal high: K at 5.1', () => {
      const result = interpretLabResult('K', 5.1);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('critical high: K >= 6.5', () => {
      const result = interpretLabResult('K', 6.5);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });

    it('extreme: K = 0', () => {
      const result = interpretLabResult('K', 0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });
  });

  // Glucose boundaries: normal 70-100, critical <40 or >=500
  describe('Glucose boundaries', () => {
    it('critical low: glucose < 40', () => {
      const result = interpretLabResult('GLU', 35);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });

    it('abnormal low: glucose 40-69', () => {
      const result = interpretLabResult('GLU', 55);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('normal: glucose at 70', () => {
      const result = interpretLabResult('GLU', 70);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('normal: glucose at 100', () => {
      const result = interpretLabResult('GLU', 100);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('abnormal high: glucose at 126', () => {
      const result = interpretLabResult('GLU', 126);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('critical high: glucose >= 500', () => {
      const result = interpretLabResult('GLU', 500);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });
  });

  // Sodium boundaries: normal 136-145, critical <120 or >=160
  describe('Sodium boundaries', () => {
    it('critical low: Na < 120', () => {
      const result = interpretLabResult('NA', 115);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });

    it('abnormal low: Na 120-135', () => {
      const result = interpretLabResult('NA', 130);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('normal: Na at 136', () => {
      const result = interpretLabResult('NA', 136);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('critical high: Na >= 160', () => {
      const result = interpretLabResult('NA', 160);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });
  });

  // Hemoglobin boundaries: normal 12.0-17.5, critical <7.0 or >=20.0
  describe('Hemoglobin boundaries', () => {
    it('critical low: Hgb < 7.0', () => {
      const result = interpretLabResult('HGB', 5.5);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });

    it('abnormal low: Hgb 7.0-11.9', () => {
      const result = interpretLabResult('HGB', 10.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('normal low boundary: Hgb at 12.0', () => {
      const result = interpretLabResult('HGB', 12.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('critical high: Hgb >= 20.0', () => {
      const result = interpretLabResult('HGB', 20.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });
  });

  // INR boundaries: normal 0.8-1.1, critical >=5.0
  describe('INR boundaries', () => {
    it('abnormal low: INR < 0.8', () => {
      const result = interpretLabResult('INR', 0.6);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('normal: INR at 1.0', () => {
      const result = interpretLabResult('INR', 1.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('abnormal high: INR at 3.5', () => {
      const result = interpretLabResult('INR', 3.5);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('critical high: INR >= 5.0', () => {
      const result = interpretLabResult('INR', 5.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });
  });

  // Troponin boundaries: normal 0-14, critical >=100
  describe('Troponin boundaries', () => {
    it('normal: troponin at 0', () => {
      const result = interpretLabResult('TROP', 0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('normal: troponin at 14', () => {
      const result = interpretLabResult('TROP', 14);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('abnormal: troponin at 50', () => {
      const result = interpretLabResult('TROP', 50);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('critical: troponin >= 100', () => {
      const result = interpretLabResult('TROP', 100);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });
  });

  // Calcium boundaries: normal 8.5-10.5, critical <6.0 or >=13.0
  describe('Calcium boundaries', () => {
    it('critical low: Ca < 6.0', () => {
      const result = interpretLabResult('CA', 5.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });

    it('abnormal low: Ca 6.0-8.4', () => {
      const result = interpretLabResult('CA', 7.5);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('normal: Ca at 9.5', () => {
      const result = interpretLabResult('CA', 9.5);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('critical high: Ca >= 13.0', () => {
      const result = interpretLabResult('CA', 13.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });
  });

  // Magnesium boundaries: normal 1.7-2.2, critical <1.0 or >=4.0
  describe('Magnesium boundaries', () => {
    it('critical low: Mg < 1.0', () => {
      const result = interpretLabResult('MG', 0.8);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });

    it('abnormal low: Mg 1.0-1.6', () => {
      const result = interpretLabResult('MG', 1.3);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('abnormal');
    });

    it('normal: Mg at 2.0', () => {
      const result = interpretLabResult('MG', 2.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('normal');
    });

    it('critical high: Mg >= 4.0', () => {
      const result = interpretLabResult('MG', 4.0);
      expect(result).not.toBeNull();
      expect(result!.urgency).toBe('critical');
    });
  });
});

describe('Lab Interpretation Output Structure', () => {
  it('includes all required fields for normal result', () => {
    const result = interpretLabResult('WBC', 7.0);
    expect(result).not.toBeNull();
    expect(result!.testCode).toBe('WBC');
    expect(result!.testName).toBeDefined();
    expect(result!.value).toBe(7.0);
    expect(result!.unit).toBeDefined();
    expect(result!.urgency).toBe('normal');
    expect(result!.referenceRange).toBeDefined();
    expect(result!.interpretation).toBeDefined();
    expect(result!.clinicalSignificance).toBeDefined();
    expect(result!.suggestedAction).toBeDefined();
  });

  it('clinical significance says CRITICAL for critical values', () => {
    const result = interpretLabResult('K', 7.0);
    expect(result).not.toBeNull();
    expect(result!.clinicalSignificance).toContain('CRITICAL');
  });

  it('clinical significance says Abnormal for abnormal values', () => {
    const result = interpretLabResult('K', 5.5);
    expect(result).not.toBeNull();
    expect(result!.clinicalSignificance).toContain('Abnormal');
  });

  it('clinical significance says Within normal for normal values', () => {
    const result = interpretLabResult('K', 4.0);
    expect(result).not.toBeNull();
    expect(result!.clinicalSignificance).toContain('normal');
  });

  it('returns null for unknown test', () => {
    const result = interpretLabResult('XYZTEST', 42);
    expect(result).toBeNull();
  });
});

describe('interpretSingleLab Tool Edge Cases', () => {
  it('returns error for unknown test with available tests list', () => {
    const result = interpretSingleLab({ test: 'unknown_test', value: 42 });
    expect('error' in result).toBeTruthy();
    if ('error' in result) {
      expect(result.error).toContain('not found');
      expect(result.availableTests.length).toBeGreaterThan(0);
    }
  });

  it('handles negative values', () => {
    const result = interpretSingleLab({ test: 'WBC', value: -1 });
    expect('urgency' in result).toBeTruthy();
    if ('urgency' in result) {
      expect(result.urgency).toBe('critical');
    }
  });

  it('handles zero values', () => {
    const result = interpretSingleLab({ test: 'HGB', value: 0 });
    expect('urgency' in result).toBeTruthy();
    if ('urgency' in result) {
      expect(result.urgency).toBe('critical');
    }
  });

  it('handles extremely large values', () => {
    const result = interpretSingleLab({ test: 'GLU', value: 99999 });
    expect('urgency' in result).toBeTruthy();
    if ('urgency' in result) {
      expect(result.urgency).toBe('critical');
    }
  });
});

describe('interpretPanel Edge Cases', () => {
  it('handles empty results array', () => {
    const result = interpretPanel({ results: [] });
    expect(result.results).toEqual([]);
    expect(result.criticalValues).toEqual([]);
    expect(result.abnormalValues).toEqual([]);
    expect(result.summary).toContain('0');
  });

  it('handles panel with all normal values', () => {
    const result = interpretPanel({
      results: [
        { test: 'WBC', value: 7.0 },
        { test: 'HGB', value: 14.0 },
        { test: 'PLT', value: 250 },
      ],
    });
    expect(result.criticalValues).toEqual([]);
    expect(result.abnormalValues).toEqual([]);
    expect(result.summary).toContain('normal');
  });

  it('handles panel with all critical values', () => {
    const result = interpretPanel({
      results: [
        { test: 'K', value: 7.0 },
        { test: 'NA', value: 110 },
        { test: 'GLU', value: 20 },
      ],
    });
    expect(result.criticalValues.length).toBe(3);
    expect(result.summary).toContain('CRITICAL');
  });

  it('correctly separates critical from abnormal', () => {
    const result = interpretPanel({
      results: [
        { test: 'K', value: 7.0 },     // critical
        { test: 'WBC', value: 3.0 },    // abnormal
        { test: 'HGB', value: 14.0 },   // normal
      ],
    });
    expect(result.criticalValues.length).toBe(1);
    expect(result.abnormalValues.length).toBe(1);
  });

  it('filters out unknown tests gracefully', () => {
    const result = interpretPanel({
      results: [
        { test: 'WBC', value: 7.0 },
        { test: 'UNKNOWN', value: 42 },
        { test: 'HGB', value: 14.0 },
      ],
    });
    expect(result.results.length).toBe(2); // Only the 2 known tests
    expect(result.summary).toContain('not found');
  });

  it('handles duplicate tests in panel', () => {
    const result = interpretPanel({
      results: [
        { test: 'WBC', value: 7.0 },
        { test: 'WBC', value: 3.0 },
      ],
    });
    expect(result.results.length).toBe(2);
  });
});

describe('listAvailableTests', () => {
  it('returns array of test definitions', () => {
    const tests = listAvailableTests();
    expect(Array.isArray(tests)).toBeTruthy();
    expect(tests.length).toBeGreaterThan(0);
  });

  it('each test has required fields', () => {
    const tests = listAvailableTests();
    for (const test of tests) {
      expect(test.code).toBeDefined();
      expect(test.name).toBeDefined();
      expect(test.unit).toBeDefined();
      expect(test.category).toBeDefined();
      expect(test.normalRange).toBeDefined();
    }
  });

  it('includes all expected test categories', () => {
    const tests = listAvailableTests();
    const categories = new Set(tests.map(t => t.category));
    expect(categories.has('Hematology')).toBeTruthy();
    expect(categories.has('Metabolic')).toBeTruthy();
    expect(categories.has('Renal')).toBeTruthy();
    expect(categories.has('Electrolytes')).toBeTruthy();
    expect(categories.has('Hepatic')).toBeTruthy();
    expect(categories.has('Cardiac')).toBeTruthy();
    expect(categories.has('Coagulation')).toBeTruthy();
  });

  it('normal range format is consistent', () => {
    const tests = listAvailableTests();
    for (const test of tests) {
      // Should contain a hyphen separating low-high
      expect(test.normalRange).toContain('-');
    }
  });
});

describe('Lab Reference Database Integrity', () => {
  it('all lab references have unique test codes', () => {
    const codes = labReferences.map(r => r.testCode);
    const uniqueCodes = new Set(codes);
    expect(codes.length).toBe(uniqueCodes.size);
  });

  it('all lab references have at least one interpretation', () => {
    for (const ref of labReferences) {
      expect(Object.keys(ref.interpretation).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('normal range low is less than high for all tests', () => {
    for (const ref of labReferences) {
      expect(ref.normalRange.low).toBeLessThanOrEqual(ref.normalRange.high);
    }
  });

  it('critical range values are outside normal range when defined', () => {
    for (const ref of labReferences) {
      if (ref.criticalRange?.low !== undefined) {
        expect(ref.criticalRange.low).toBeLessThan(ref.normalRange.low);
      }
      if (ref.criticalRange?.high !== undefined) {
        expect(ref.criticalRange.high).toBeGreaterThan(ref.normalRange.high);
      }
    }
  });
});

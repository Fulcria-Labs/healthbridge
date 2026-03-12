import { describe, it, expect } from 'vitest';
import { interpretLabResult, interpretLabPanel, resolveLabTest, labReferences } from '../src/data/lab-references';
import { interpretSingleLab, interpretPanel, listAvailableTests } from '../src/tools/lab-interpreter-tool';

describe('Lab Test Resolution', () => {
  it('resolves by test code', () => {
    expect(resolveLabTest('WBC')).not.toBeNull();
    expect(resolveLabTest('HGB')).not.toBeNull();
    expect(resolveLabTest('K')).not.toBeNull();
  });

  it('resolves by test name', () => {
    expect(resolveLabTest('White Blood Cell Count')).not.toBeNull();
    expect(resolveLabTest('Hemoglobin')).not.toBeNull();
    expect(resolveLabTest('Potassium')).not.toBeNull();
  });

  it('resolves by alias', () => {
    expect(resolveLabTest('leukocytes')).not.toBeNull();
    expect(resolveLabTest('hb')).not.toBeNull();
    expect(resolveLabTest('blood sugar')).not.toBeNull();
    expect(resolveLabTest('troponin')).not.toBeNull();
  });

  it('is case-insensitive', () => {
    expect(resolveLabTest('wbc')).not.toBeNull();
    expect(resolveLabTest('HGB')).not.toBeNull();
    expect(resolveLabTest('potassium')).not.toBeNull();
  });

  it('returns null for unknown tests', () => {
    expect(resolveLabTest('unknowntest')).toBeNull();
  });
});

describe('Lab Result Interpretation', () => {
  it('interprets normal WBC', () => {
    const result = interpretLabResult('WBC', 7.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
    expect(result!.testCode).toBe('WBC');
  });

  it('interprets critical low WBC', () => {
    const result = interpretLabResult('WBC', 1.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
    expect(result!.clinicalSignificance).toContain('CRITICAL');
  });

  it('interprets high WBC', () => {
    const result = interpretLabResult('WBC', 15.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets critical high WBC', () => {
    const result = interpretLabResult('WBC', 35.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('interprets normal hemoglobin', () => {
    const result = interpretLabResult('HGB', 14.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets low hemoglobin (anemia)', () => {
    const result = interpretLabResult('HGB', 9.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
    expect(result!.interpretation).toContain('Anemia');
  });

  it('interprets critical low hemoglobin', () => {
    const result = interpretLabResult('HGB', 5.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
    expect(result!.suggestedAction).toContain('transfusion');
  });

  it('interprets normal glucose', () => {
    const result = interpretLabResult('GLU', 85);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets critical low glucose', () => {
    const result = interpretLabResult('GLU', 30);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
    expect(result!.suggestedAction).toContain('EMERGENCY');
  });

  it('interprets high glucose (diabetes range)', () => {
    const result = interpretLabResult('GLU', 200);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets normal potassium', () => {
    const result = interpretLabResult('K', 4.2);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets critical high potassium', () => {
    const result = interpretLabResult('K', 7.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
    expect(result!.suggestedAction).toContain('EMERGENCY');
  });

  it('interprets critical low potassium', () => {
    const result = interpretLabResult('K', 2.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('interprets troponin', () => {
    const result = interpretLabResult('TROP', 50);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
    expect(result!.interpretation).toContain('troponin');
  });

  it('interprets critical troponin', () => {
    const result = interpretLabResult('TROP', 200);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('interprets normal TSH', () => {
    const result = interpretLabResult('TSH', 2.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets elevated HbA1c', () => {
    const result = interpretLabResult('HBA1C', 7.2);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets high INR', () => {
    const result = interpretLabResult('INR', 5.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('returns null for unknown test', () => {
    const result = interpretLabResult('UNKNOWN', 42);
    expect(result).toBeNull();
  });
});

describe('Lab Panel Interpretation', () => {
  it('interprets a basic metabolic panel', () => {
    const results = interpretLabPanel([
      { test: 'GLU', value: 95 },
      { test: 'CREAT', value: 1.0 },
      { test: 'BUN', value: 15 },
      { test: 'NA', value: 140 },
      { test: 'K', value: 4.0 },
    ]);
    expect(results.length).toBe(5);
    expect(results.every(r => r.urgency === 'normal')).toBe(true);
  });

  it('identifies critical values in panel', () => {
    const results = interpretLabPanel([
      { test: 'K', value: 7.0 },
      { test: 'NA', value: 115 },
      { test: 'GLU', value: 35 },
    ]);
    expect(results.filter(r => r.urgency === 'critical').length).toBe(3);
  });

  it('handles mixed normal and abnormal', () => {
    const results = interpretLabPanel([
      { test: 'WBC', value: 7.0 },
      { test: 'HGB', value: 8.5 },
      { test: 'PLT', value: 300 },
    ]);
    const normal = results.filter(r => r.urgency === 'normal');
    const abnormal = results.filter(r => r.urgency === 'abnormal');
    expect(normal.length).toBe(2);
    expect(abnormal.length).toBe(1);
  });

  it('skips unknown tests', () => {
    const results = interpretLabPanel([
      { test: 'WBC', value: 7.0 },
      { test: 'UNKNOWN', value: 42 },
    ]);
    expect(results.length).toBe(1);
  });
});

describe('Lab Interpreter Tool', () => {
  it('interpretSingleLab returns result for valid test', () => {
    const result = interpretSingleLab({ test: 'WBC', value: 7.0 });
    expect('error' in result).toBe(false);
    if (!('error' in result)) {
      expect(result.testCode).toBe('WBC');
    }
  });

  it('interpretSingleLab returns error for invalid test', () => {
    const result = interpretSingleLab({ test: 'INVALID', value: 42 });
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.availableTests.length).toBeGreaterThan(0);
    }
  });

  it('interpretPanel returns summary with critical values', () => {
    const result = interpretPanel({
      results: [
        { test: 'K', value: 7.0 },
        { test: 'WBC', value: 7.0 },
      ],
    });
    expect(result.criticalValues.length).toBe(1);
    expect(result.summary).toContain('CRITICAL');
  });

  it('interpretPanel summary counts correctly', () => {
    const result = interpretPanel({
      results: [
        { test: 'WBC', value: 7.0 },
        { test: 'HGB', value: 14.0 },
        { test: 'PLT', value: 200 },
      ],
    });
    expect(result.summary).toContain('3 normal');
  });

  it('listAvailableTests returns all tests', () => {
    const tests = listAvailableTests();
    expect(tests.length).toBe(labReferences.length);
    expect(tests[0]).toHaveProperty('code');
    expect(tests[0]).toHaveProperty('name');
    expect(tests[0]).toHaveProperty('unit');
    expect(tests[0]).toHaveProperty('category');
    expect(tests[0]).toHaveProperty('normalRange');
  });
});

describe('Lipid Panel Tests', () => {
  it('interprets desirable total cholesterol', () => {
    const result = interpretLabResult('TCHOL', 180);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets high total cholesterol', () => {
    const result = interpretLabResult('TCHOL', 260);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets optimal LDL', () => {
    const result = interpretLabResult('LDL', 65);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets very high LDL', () => {
    const result = interpretLabResult('LDL', 200);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets low HDL', () => {
    const result = interpretLabResult('HDL', 35);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets protective HDL', () => {
    const result = interpretLabResult('HDL', 65);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets normal triglycerides', () => {
    const result = interpretLabResult('TG', 120);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets critical triglycerides (pancreatitis risk)', () => {
    const result = interpretLabResult('TG', 600);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('resolves lipid panel aliases', () => {
    expect(resolveLabTest('cholesterol')).not.toBeNull();
    expect(resolveLabTest('ldl')).not.toBeNull();
    expect(resolveLabTest('hdl')).not.toBeNull();
    expect(resolveLabTest('triglycerides')).not.toBeNull();
  });
});

describe('Calcium and Magnesium Tests', () => {
  it('interprets normal calcium', () => {
    const result = interpretLabResult('CA', 9.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets critical high calcium', () => {
    const result = interpretLabResult('CA', 14.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('interprets low calcium', () => {
    const result = interpretLabResult('CA', 7.5);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets normal magnesium', () => {
    const result = interpretLabResult('MG', 2.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets critical low magnesium', () => {
    const result = interpretLabResult('MG', 0.8);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('resolves calcium and magnesium aliases', () => {
    expect(resolveLabTest('calcium')).not.toBeNull();
    expect(resolveLabTest('magnesium')).not.toBeNull();
  });
});

describe('ALP, D-dimer, and Procalcitonin Tests', () => {
  it('interprets normal ALP', () => {
    const result = interpretLabResult('ALP', 100);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets elevated ALP', () => {
    const result = interpretLabResult('ALP', 250);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets normal D-dimer', () => {
    const result = interpretLabResult('DDIMER', 300);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets elevated D-dimer', () => {
    const result = interpretLabResult('DDIMER', 1500);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets normal procalcitonin', () => {
    const result = interpretLabResult('PCT', 0.05);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets elevated procalcitonin (sepsis range)', () => {
    const result = interpretLabResult('PCT', 5.0);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('resolves new test aliases', () => {
    expect(resolveLabTest('alk phos')).not.toBeNull();
    expect(resolveLabTest('d-dimer')).not.toBeNull();
    expect(resolveLabTest('procalcitonin')).not.toBeNull();
  });

  it('interprets full expanded panel', () => {
    const results = interpretLabPanel([
      { test: 'TCHOL', value: 200 },
      { test: 'LDL', value: 100 },
      { test: 'HDL', value: 55 },
      { test: 'TG', value: 150 },
      { test: 'CA', value: 9.5 },
      { test: 'MG', value: 2.0 },
      { test: 'ALP', value: 80 },
    ]);
    expect(results.length).toBe(7);
    expect(results.every(r => r.urgency === 'normal')).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { resolveLabTest, interpretLabResult, interpretLabPanel, labReferences } from '../src/data/lab-references';

describe('New Lab Tests - Resolution', () => {
  it('resolves ESR by code', () => {
    expect(resolveLabTest('ESR')).not.toBeNull();
    expect(resolveLabTest('ESR')!.testCode).toBe('ESR');
  });
  it('resolves ESR by alias', () => {
    expect(resolveLabTest('sed rate')).not.toBeNull();
  });
  it('resolves Ferritin by code', () => {
    expect(resolveLabTest('FERR')).not.toBeNull();
    expect(resolveLabTest('ferritin')).not.toBeNull();
  });
  it('resolves Albumin by code', () => {
    expect(resolveLabTest('ALB')).not.toBeNull();
    expect(resolveLabTest('albumin')).not.toBeNull();
  });
  it('resolves Total Bilirubin by code', () => {
    expect(resolveLabTest('TBILI')).not.toBeNull();
    expect(resolveLabTest('bilirubin')).not.toBeNull();
  });
  it('resolves GGT by code', () => {
    expect(resolveLabTest('GGT')).not.toBeNull();
    expect(resolveLabTest('gamma gt')).not.toBeNull();
  });
  it('resolves Vitamin D by code', () => {
    expect(resolveLabTest('VITD')).not.toBeNull();
    expect(resolveLabTest('vitamin d')).not.toBeNull();
  });
  it('resolves Vitamin B12 by code', () => {
    expect(resolveLabTest('B12')).not.toBeNull();
    expect(resolveLabTest('cobalamin')).not.toBeNull();
  });
  it('resolves Folate by code', () => {
    expect(resolveLabTest('FOLATE')).not.toBeNull();
    expect(resolveLabTest('folic acid')).not.toBeNull();
  });
  it('resolves Phosphorus by code', () => {
    expect(resolveLabTest('PHOS')).not.toBeNull();
    expect(resolveLabTest('phosphate')).not.toBeNull();
  });
  it('resolves Uric Acid by code', () => {
    expect(resolveLabTest('URIC')).not.toBeNull();
    expect(resolveLabTest('uric acid')).not.toBeNull();
  });
  it('resolves Lactate by code', () => {
    expect(resolveLabTest('LAC')).not.toBeNull();
    expect(resolveLabTest('lactic acid')).not.toBeNull();
  });
  it('resolves Chloride by code', () => {
    expect(resolveLabTest('CL')).not.toBeNull();
    expect(resolveLabTest('chloride')).not.toBeNull();
  });
});

describe('ESR Interpretation', () => {
  it('normal ESR', () => {
    const r = interpretLabResult('ESR', 10);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
  it('mildly elevated ESR', () => {
    const r = interpretLabResult('ESR', 35);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('markedly elevated ESR >100', () => {
    const r = interpretLabResult('sed rate', 110);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
});

describe('Ferritin Interpretation', () => {
  it('low ferritin (iron deficiency)', () => {
    const r = interpretLabResult('ferritin', 8);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('normal ferritin', () => {
    const r = interpretLabResult('ferritin', 100);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
  it('elevated ferritin', () => {
    const r = interpretLabResult('ferritin', 500);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('critical ferritin >1000', () => {
    const r = interpretLabResult('FERR', 1200);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('critical');
  });
});

describe('Albumin Interpretation', () => {
  it('critically low albumin', () => {
    const r = interpretLabResult('ALB', 1.2);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('critical');
  });
  it('low albumin', () => {
    const r = interpretLabResult('albumin', 2.8);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('normal albumin', () => {
    const r = interpretLabResult('albumin', 4.2);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
});

describe('Total Bilirubin Interpretation', () => {
  it('normal bilirubin', () => {
    const r = interpretLabResult('TBILI', 0.8);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
  it('mildly elevated bilirubin', () => {
    const r = interpretLabResult('bilirubin', 2.0);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('critical bilirubin >=15', () => {
    const r = interpretLabResult('TBILI', 18.0);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('critical');
  });
});

describe('GGT Interpretation', () => {
  it('normal GGT', () => {
    const r = interpretLabResult('GGT', 40);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
  it('elevated GGT', () => {
    const r = interpretLabResult('gamma gt', 150);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
});

describe('Vitamin D Interpretation', () => {
  it('vitamin D deficiency', () => {
    const r = interpretLabResult('vitamin d', 12);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('vitamin D insufficiency', () => {
    const r = interpretLabResult('VITD', 25);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('adequate vitamin D', () => {
    const r = interpretLabResult('VITD', 50);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
});

describe('Vitamin B12 Interpretation', () => {
  it('B12 deficiency', () => {
    const r = interpretLabResult('B12', 150);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('normal B12', () => {
    const r = interpretLabResult('cobalamin', 500);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
  it('elevated B12', () => {
    const r = interpretLabResult('B12', 1200);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
});

describe('Folate Interpretation', () => {
  it('folate deficiency', () => {
    const r = interpretLabResult('FOLATE', 1.5);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('normal folate', () => {
    const r = interpretLabResult('folic acid', 8.0);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
});

describe('Phosphorus Interpretation', () => {
  it('critical low phosphorus', () => {
    const r = interpretLabResult('PHOS', 0.7);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('critical');
  });
  it('low phosphorus', () => {
    const r = interpretLabResult('phosphate', 1.8);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('normal phosphorus', () => {
    const r = interpretLabResult('PHOS', 3.5);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
  it('critical high phosphorus', () => {
    const r = interpretLabResult('PHOS', 9.0);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('critical');
  });
});

describe('Uric Acid Interpretation', () => {
  it('normal uric acid', () => {
    const r = interpretLabResult('URIC', 5.5);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
  it('elevated uric acid (gout risk)', () => {
    const r = interpretLabResult('uric acid', 9.0);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('critical uric acid >=13', () => {
    const r = interpretLabResult('URIC', 15.0);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('critical');
  });
});

describe('Lactate Interpretation', () => {
  it('normal lactate', () => {
    const r = interpretLabResult('LAC', 1.2);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
  it('elevated lactate', () => {
    const r = interpretLabResult('lactic acid', 3.0);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('critical lactate >=4', () => {
    const r = interpretLabResult('LAC', 5.5);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('critical');
  });
});

describe('Chloride Interpretation', () => {
  it('critical low chloride', () => {
    const r = interpretLabResult('CL', 75);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('critical');
  });
  it('low chloride', () => {
    const r = interpretLabResult('chloride', 90);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('normal chloride', () => {
    const r = interpretLabResult('CL', 100);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('normal');
  });
  it('high chloride', () => {
    const r = interpretLabResult('CL', 112);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('abnormal');
  });
  it('critical high chloride', () => {
    const r = interpretLabResult('CL', 125);
    expect(r).not.toBeNull();
    expect(r!.urgency).toBe('critical');
  });
});

describe('Lab Panel with New Tests', () => {
  it('interprets metabolic panel with new tests', () => {
    const results = interpretLabPanel([
      { test: 'albumin', value: 2.5 },
      { test: 'bilirubin', value: 3.5 },
      { test: 'GGT', value: 300 },
      { test: 'phosphate', value: 3.0 },
    ]);
    expect(results.length).toBe(4);
    expect(results.filter(r => r.urgency === 'abnormal').length).toBe(3);
    expect(results.filter(r => r.urgency === 'normal').length).toBe(1);
  });

  it('interprets anemia workup panel', () => {
    const results = interpretLabPanel([
      { test: 'HGB', value: 9.5 },
      { test: 'ferritin', value: 8 },
      { test: 'B12', value: 150 },
      { test: 'folate', value: 1.5 },
    ]);
    expect(results.length).toBe(4);
    expect(results.every(r => r.urgency === 'abnormal')).toBe(true);
  });

  it('interprets sepsis screening panel', () => {
    const results = interpretLabPanel([
      { test: 'WBC', value: 18.0 },
      { test: 'lactate', value: 4.5 },
      { test: 'PCT', value: 3.0 },
      { test: 'CRP', value: 150 },
    ]);
    expect(results.length).toBe(4);
    const critical = results.filter(r => r.urgency === 'critical');
    expect(critical.length).toBeGreaterThanOrEqual(1);
  });

  it('interprets liver function panel', () => {
    const results = interpretLabPanel([
      { test: 'ALT', value: 250 },
      { test: 'AST', value: 300 },
      { test: 'bilirubin', value: 4.0 },
      { test: 'albumin', value: 2.8 },
      { test: 'GGT', value: 400 },
    ]);
    expect(results.length).toBe(5);
    expect(results.every(r => r.urgency === 'abnormal')).toBe(true);
  });
});

describe('Lab Database Integrity', () => {
  it('has at least 37 lab tests', () => {
    expect(labReferences.length).toBeGreaterThanOrEqual(37);
  });

  it('all lab tests have valid structure', () => {
    for (const ref of labReferences) {
      expect(ref.testCode).toBeTruthy();
      expect(ref.testName).toBeTruthy();
      expect(ref.unit).toBeDefined();
      expect(ref.normalRange.low).toBeDefined();
      expect(ref.normalRange.high).toBeDefined();
      expect(ref.normalRange.high).toBeGreaterThan(ref.normalRange.low);
      expect(ref.category).toBeTruthy();
      expect(Object.keys(ref.interpretation).length).toBeGreaterThan(0);
    }
  });

  it('all lab tests have unique codes', () => {
    const codes = labReferences.map(r => r.testCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('all interpretations have required fields', () => {
    for (const ref of labReferences) {
      for (const [key, interp] of Object.entries(ref.interpretation)) {
        expect(interp.range, `${ref.testCode}.${key}.range`).toBeTruthy();
        expect(interp.meaning, `${ref.testCode}.${key}.meaning`).toBeTruthy();
        expect(interp.action, `${ref.testCode}.${key}.action`).toBeTruthy();
      }
    }
  });
});

import { describe, it, expect } from 'vitest';
import { labReferences, resolveLabTest, interpretLabResult, interpretLabPanel } from '../src/data/lab-references';

describe('New Lab Tests - Coagulation', () => {
  it('resolves fibrinogen test', () => {
    const ref = resolveLabTest('FIBR');
    expect(ref).not.toBeNull();
    expect(ref!.testName).toBe('Fibrinogen');
    expect(ref!.unit).toBe('mg/dL');
    expect(ref!.category).toBe('Coagulation');
  });

  it('fibrinogen aliases resolve correctly', () => {
    expect(resolveLabTest('fibrinogen')).not.toBeNull();
    expect(resolveLabTest('factor I')).not.toBeNull();
  });

  it('interprets critical low fibrinogen', () => {
    const result = interpretLabResult('FIBR', 80);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
    expect(result!.suggestedAction).toContain('Cryoprecipitate');
  });

  it('interprets low fibrinogen', () => {
    const result = interpretLabResult('FIBR', 150);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets normal fibrinogen', () => {
    const result = interpretLabResult('FIBR', 300);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });
});

describe('New Lab Tests - Liver/GI', () => {
  it('resolves LDH test', () => {
    const ref = resolveLabTest('LDH');
    expect(ref).not.toBeNull();
    expect(ref!.testName).toBe('Lactate Dehydrogenase');
  });

  it('interprets elevated LDH', () => {
    const result = interpretLabResult('LDH', 300);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
    expect(result!.interpretation).toContain('LDH');
  });

  it('interprets markedly elevated LDH', () => {
    const result = interpretLabResult('LDH', 600);
    expect(result).not.toBeNull();
    expect(result!.suggestedAction).toContain('tumor lysis');
  });

  it('resolves amylase test', () => {
    const ref = resolveLabTest('AMYLASE');
    expect(ref).not.toBeNull();
    expect(ref!.testName).toBe('Amylase');
    expect(ref!.category).toBe('Pancreatic');
  });

  it('interprets critical high amylase (pancreatitis)', () => {
    const result = interpretLabResult('AMYLASE', 400);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
    expect(result!.suggestedAction).toContain('pancreatitis');
  });

  it('resolves lipase test', () => {
    const ref = resolveLabTest('LIPASE');
    expect(ref).not.toBeNull();
    expect(ref!.testName).toBe('Lipase');
    expect(ref!.category).toBe('Pancreatic');
  });

  it('interprets normal lipase', () => {
    const result = interpretLabResult('LIPASE', 30);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets critical high lipase', () => {
    const result = interpretLabResult('LIPASE', 250);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
    expect(result!.suggestedAction).toContain('pancreatitis');
  });
});

describe('New Lab Tests - Cardiac Extended', () => {
  it('resolves NT-proBNP test', () => {
    const ref = resolveLabTest('NTPROBNP');
    expect(ref).not.toBeNull();
    expect(ref!.testName).toBe('NT-proBNP');
    expect(ref!.category).toBe('Cardiac');
  });

  it('NT-proBNP aliases resolve', () => {
    expect(resolveLabTest('nt-probnp')).not.toBeNull();
    expect(resolveLabTest('pro bnp')).not.toBeNull();
  });

  it('interprets normal NT-proBNP', () => {
    const result = interpretLabResult('NTPROBNP', 80);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
    expect(result!.interpretation).toContain('excluded');
  });

  it('interprets critical high NT-proBNP', () => {
    const result = interpretLabResult('NTPROBNP', 2000);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('resolves CK-MB test', () => {
    const ref = resolveLabTest('CKMB');
    expect(ref).not.toBeNull();
    expect(ref!.testName).toBe('CK-MB');
    expect(ref!.category).toBe('Cardiac');
  });

  it('interprets elevated CK-MB', () => {
    const result = interpretLabResult('CKMB', 15);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets critical CK-MB', () => {
    const result = interpretLabResult('CKMB', 30);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });
});

describe('New Lab Tests - Endocrine', () => {
  it('resolves cortisol test', () => {
    const ref = resolveLabTest('CORTISOL');
    expect(ref).not.toBeNull();
    expect(ref!.testName).toBe('Cortisol (AM)');
    expect(ref!.category).toBe('Endocrine');
  });

  it('cortisol aliases resolve', () => {
    expect(resolveLabTest('serum cortisol')).not.toBeNull();
    expect(resolveLabTest('morning cortisol')).not.toBeNull();
  });

  it('interprets critical low cortisol (adrenal insufficiency)', () => {
    const result = interpretLabResult('CORTISOL', 2);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
    expect(result!.suggestedAction).toContain('hydrocortisone');
  });

  it('interprets normal cortisol', () => {
    const result = interpretLabResult('CORTISOL', 15);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('resolves PTH test', () => {
    const ref = resolveLabTest('PTH');
    expect(ref).not.toBeNull();
    expect(ref!.testName).toBe('Parathyroid Hormone');
    expect(ref!.category).toBe('Endocrine');
  });

  it('PTH aliases resolve', () => {
    expect(resolveLabTest('parathyroid hormone')).not.toBeNull();
    expect(resolveLabTest('intact pth')).not.toBeNull();
  });

  it('interprets low PTH (hypoparathyroidism)', () => {
    const result = interpretLabResult('PTH', 8);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets elevated PTH', () => {
    const result = interpretLabResult('PTH', 100);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
    expect(result!.suggestedAction).toContain('hyperparathyroidism');
  });
});

describe('New Lab Tests - Inflammatory Markers', () => {
  it('resolves ferritin test', () => {
    const ref = resolveLabTest('FERR');
    expect(ref).not.toBeNull();
    expect(ref!.testName).toBe('Ferritin');
    expect(ref!.category).toBe('Hematology');
  });

  it('interprets low ferritin (iron deficiency)', () => {
    const result = interpretLabResult('FERR', 10);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets critical high ferritin', () => {
    const result = interpretLabResult('FERR', 1500);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('critical');
  });

  it('resolves procalcitonin test', () => {
    const ref = resolveLabTest('PCT');
    expect(ref).not.toBeNull();
    expect(ref!.testName).toBe('Procalcitonin');
    expect(ref!.category).toBe('Inflammatory');
  });

  it('procalcitonin aliases resolve', () => {
    expect(resolveLabTest('procalcitonin')).not.toBeNull();
    expect(resolveLabTest('pct')).not.toBeNull();
  });

  it('interprets normal procalcitonin (bacterial unlikely)', () => {
    const result = interpretLabResult('PCT', 0.05);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets elevated procalcitonin (bacterial infection)', () => {
    const result = interpretLabResult('PCT', 15);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });
});

describe('New Lab Tests - Iron Studies', () => {
  it('resolves serum iron test', () => {
    const ref = resolveLabTest('IRON');
    expect(ref).not.toBeNull();
    expect(ref!.testName).toBe('Serum Iron');
    expect(ref!.category).toBe('Hematology');
  });

  it('iron aliases resolve', () => {
    expect(resolveLabTest('iron')).not.toBeNull();
    expect(resolveLabTest('serum iron')).not.toBeNull();
    expect(resolveLabTest('fe')).not.toBeNull();
  });

  it('interprets low iron', () => {
    const result = interpretLabResult('IRON', 40);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
  });

  it('interprets normal iron', () => {
    const result = interpretLabResult('IRON', 100);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('normal');
  });

  it('interprets elevated iron', () => {
    const result = interpretLabResult('IRON', 200);
    expect(result).not.toBeNull();
    expect(result!.urgency).toBe('abnormal');
    expect(result!.suggestedAction).toContain('hemochromatosis');
  });
});

describe('New Lab Panel Interpretation', () => {
  it('interprets pancreatic panel (amylase + lipase)', () => {
    const results = interpretLabPanel([
      { test: 'AMYLASE', value: 350 },
      { test: 'LIPASE', value: 250 },
    ]);
    expect(results.length).toBe(2);
    expect(results.every(r => r.urgency === 'critical')).toBe(true);
  });

  it('interprets cardiac workup panel', () => {
    const results = interpretLabPanel([
      { test: 'NTPROBNP', value: 1500 },
      { test: 'CKMB', value: 20 },
      { test: 'TROP', value: 0.5 },
    ]);
    expect(results.length).toBeGreaterThanOrEqual(2);
    const ntprobnp = results.find(r => r.testCode === 'NTPROBNP');
    expect(ntprobnp?.urgency).toBe('abnormal');
  });

  it('interprets endocrine panel', () => {
    const results = interpretLabPanel([
      { test: 'CORTISOL', value: 2 },
      { test: 'PTH', value: 8 },
      { test: 'TSH', value: 15 },
    ]);
    expect(results.length).toBe(3);
    const cortisol = results.find(r => r.testCode === 'CORTISOL');
    expect(cortisol?.urgency).toBe('critical');
  });

  it('interprets sepsis workup panel', () => {
    const results = interpretLabPanel([
      { test: 'PCT', value: 12 },
      { test: 'LAC', value: 5 },
      { test: 'WBC', value: 25 },
    ]);
    expect(results.length).toBe(3);
    expect(results.every(r => r.urgency !== 'normal')).toBe(true);
  });

  it('interprets iron studies panel', () => {
    const results = interpretLabPanel([
      { test: 'IRON', value: 30 },
      { test: 'FERR', value: 8 },
      { test: 'HGB', value: 9 },
    ]);
    expect(results.length).toBe(3);
    expect(results.every(r => r.urgency === 'abnormal')).toBe(true);
  });
});

describe('Lab Database Integrity - New Tests', () => {
  it('all lab tests have unique codes', () => {
    const codes = labReferences.map(r => r.testCode);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('all lab tests have required fields', () => {
    for (const ref of labReferences) {
      expect(ref.testCode).toBeTruthy();
      expect(ref.testName).toBeTruthy();
      // unit can be empty for dimensionless tests (e.g., INR)
      expect(ref.unit).toBeDefined();
      expect(ref.category).toBeTruthy();
      expect(ref.normalRange).toBeDefined();
      expect(ref.normalRange.low).toBeDefined();
      expect(ref.normalRange.high).toBeDefined();
      expect(Object.keys(ref.interpretation).length).toBeGreaterThan(0);
    }
  });

  it('lab database has at least 42 tests', () => {
    expect(labReferences.length).toBeGreaterThanOrEqual(42);
  });

  it('new tests can be resolved by aliases', () => {
    const aliasPairs = [
      ['fibrinogen', 'FIBR'],
      ['lactate dehydrogenase', 'LDH'],
      ['amylase', 'AMYLASE'],
      ['lipase', 'LIPASE'],
      ['nt-probnp', 'NTPROBNP'],
      ['ck-mb', 'CKMB'],
      ['cortisol', 'CORTISOL'],
      ['parathyroid hormone', 'PTH'],
      ['ferritin', 'FERR'],
      ['procalcitonin', 'PCT'],
      ['serum iron', 'IRON'],
    ];

    for (const [alias, expectedCode] of aliasPairs) {
      const ref = resolveLabTest(alias);
      expect(ref).not.toBeNull();
      expect(ref!.testCode).toBe(expectedCode);
    }
  });
});

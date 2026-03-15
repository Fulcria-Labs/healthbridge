import { describe, it, expect } from 'vitest';
import { calculateSingleOpioidMME, calculateTotalMEDD, convertOpioidDose, listOpioids } from '../src/data/opioid-medd.js';

describe('Single Opioid MME Calculator', () => {
  describe('Basic Conversions', () => {
    it('should calculate morphine 30mg oral = 30 MME', () => {
      const result = calculateSingleOpioidMME({ drug: 'morphine', dailyDose: 30 });
      expect('dailyMME' in result).toBe(true);
      if ('dailyMME' in result) {
        expect(result.dailyMME).toBe(30);
        expect(result.mmeFactor).toBe(1);
      }
    });

    it('should calculate oxycodone 20mg = 30 MME (factor 1.5)', () => {
      const result = calculateSingleOpioidMME({ drug: 'oxycodone', dailyDose: 20 });
      if ('dailyMME' in result) {
        expect(result.dailyMME).toBe(30);
        expect(result.mmeFactor).toBe(1.5);
      }
    });

    it('should calculate hydromorphone 4mg oral = 16 MME (factor 4)', () => {
      const result = calculateSingleOpioidMME({ drug: 'hydromorphone', dailyDose: 4 });
      if ('dailyMME' in result) {
        expect(result.dailyMME).toBe(16);
      }
    });

    it('should calculate hydrocodone 10mg = 10 MME (factor 1)', () => {
      const result = calculateSingleOpioidMME({ drug: 'hydrocodone', dailyDose: 10 });
      if ('dailyMME' in result) {
        expect(result.dailyMME).toBe(10);
        expect(result.mmeFactor).toBe(1);
      }
    });

    it('should calculate codeine 120mg = 18 MME (factor 0.15)', () => {
      const result = calculateSingleOpioidMME({ drug: 'codeine', dailyDose: 120 });
      if ('dailyMME' in result) {
        expect(result.dailyMME).toBe(18);
      }
    });

    it('should calculate tramadol 200mg = 40 MME (factor 0.2)', () => {
      const result = calculateSingleOpioidMME({ drug: 'tramadol', dailyDose: 200 });
      if ('dailyMME' in result) {
        expect(result.dailyMME).toBe(40);
      }
    });

    it('should calculate fentanyl patch 25 mcg/hr = 60 MME', () => {
      const result = calculateSingleOpioidMME({ drug: 'fentanyl patch', dailyDose: 25 });
      if ('dailyMME' in result) {
        expect(result.dailyMME).toBe(60);
        expect(result.mmeFactor).toBe(2.4);
      }
    });

    it('should calculate tapentadol 200mg = 80 MME (factor 0.4)', () => {
      const result = calculateSingleOpioidMME({ drug: 'tapentadol', dailyDose: 200 });
      if ('dailyMME' in result) {
        expect(result.dailyMME).toBe(80);
      }
    });
  });

  describe('Methadone Tiered Conversion', () => {
    it('should use factor 4 for methadone ≤20mg', () => {
      const result = calculateSingleOpioidMME({ drug: 'methadone', dailyDose: 10 });
      if ('dailyMME' in result) {
        expect(result.mmeFactor).toBe(4);
        expect(result.dailyMME).toBe(40);
      }
    });

    it('should use factor 8 for methadone 21-40mg', () => {
      const result = calculateSingleOpioidMME({ drug: 'methadone', dailyDose: 30 });
      if ('dailyMME' in result) {
        expect(result.mmeFactor).toBe(8);
        expect(result.dailyMME).toBe(240);
      }
    });

    it('should use factor 10 for methadone 41-60mg', () => {
      const result = calculateSingleOpioidMME({ drug: 'methadone', dailyDose: 50 });
      if ('dailyMME' in result) {
        expect(result.mmeFactor).toBe(10);
        expect(result.dailyMME).toBe(500);
      }
    });

    it('should use factor 12 for methadone >60mg', () => {
      const result = calculateSingleOpioidMME({ drug: 'methadone', dailyDose: 80 });
      if ('dailyMME' in result) {
        expect(result.mmeFactor).toBe(12);
        expect(result.dailyMME).toBe(960);
      }
    });
  });

  describe('Buprenorphine', () => {
    it('should report MME as not applicable for buprenorphine', () => {
      const result = calculateSingleOpioidMME({ drug: 'buprenorphine', dailyDose: 16 });
      if ('dailyMME' in result) {
        expect(result.dailyMME).toBe(0);
        expect(result.riskLevel).toContain('Partial agonist');
      }
    });
  });

  describe('Risk Levels', () => {
    it('should flag <50 MME as lower risk', () => {
      const result = calculateSingleOpioidMME({ drug: 'morphine', dailyDose: 30 });
      if ('dailyMME' in result) {
        expect(result.riskLevel).toBe('Lower risk');
      }
    });

    it('should flag 50-89 MME as moderate risk', () => {
      const result = calculateSingleOpioidMME({ drug: 'morphine', dailyDose: 60 });
      if ('dailyMME' in result) {
        expect(result.riskLevel).toBe('Moderate risk');
        expect(result.cdcThresholdWarning).toContain('90 MME');
      }
    });

    it('should flag ≥90 MME as HIGH RISK', () => {
      const result = calculateSingleOpioidMME({ drug: 'morphine', dailyDose: 100 });
      if ('dailyMME' in result) {
        expect(result.riskLevel).toBe('HIGH RISK');
        expect(result.cdcThresholdWarning).toContain('EXCEEDS');
      }
    });
  });

  describe('Brand Name Resolution', () => {
    it('should resolve OxyContin to oxycodone', () => {
      const result = calculateSingleOpioidMME({ drug: 'oxycontin', dailyDose: 20 });
      if ('dailyMME' in result) {
        expect(result.resolvedName).toBe('oxycodone');
      }
    });

    it('should resolve Vicodin to hydrocodone', () => {
      const result = calculateSingleOpioidMME({ drug: 'vicodin', dailyDose: 20 });
      if ('dailyMME' in result) {
        expect(result.resolvedName).toBe('hydrocodone');
      }
    });

    it('should resolve Dilaudid to hydromorphone', () => {
      const result = calculateSingleOpioidMME({ drug: 'dilaudid', dailyDose: 4 });
      if ('dailyMME' in result) {
        expect(result.resolvedName).toBe('hydromorphone');
      }
    });

    it('should resolve Norco to hydrocodone', () => {
      const result = calculateSingleOpioidMME({ drug: 'norco', dailyDose: 20 });
      if ('dailyMME' in result) {
        expect(result.resolvedName).toBe('hydrocodone');
      }
    });

    it('should resolve Duragesic to fentanyl patch', () => {
      const result = calculateSingleOpioidMME({ drug: 'duragesic', dailyDose: 50 });
      if ('dailyMME' in result) {
        expect(result.resolvedName).toBe('fentanyl patch');
      }
    });

    it('should resolve Suboxone to buprenorphine', () => {
      const result = calculateSingleOpioidMME({ drug: 'suboxone', dailyDose: 8 });
      if ('dailyMME' in result) {
        expect(result.resolvedName).toBe('buprenorphine');
      }
    });
  });

  describe('Unknown Opioids', () => {
    it('should return error for unknown drug', () => {
      const result = calculateSingleOpioidMME({ drug: 'aspirin', dailyDose: 325 });
      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.availableOpioids.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Parenteral Opioids', () => {
    it('should calculate morphine IV 10mg = 30 MME (factor 3)', () => {
      const result = calculateSingleOpioidMME({ drug: 'morphine iv', dailyDose: 10 });
      if ('dailyMME' in result) {
        expect(result.dailyMME).toBe(30);
        expect(result.route).toBe('parenteral');
      }
    });

    it('should calculate hydromorphone IV 2mg = 40 MME (factor 20)', () => {
      const result = calculateSingleOpioidMME({ drug: 'hydromorphone iv', dailyDose: 2 });
      if ('dailyMME' in result) {
        expect(result.dailyMME).toBe(40);
      }
    });
  });
});

describe('Total MEDD Calculator', () => {
  it('should sum MMEs across multiple opioids', () => {
    const result = calculateTotalMEDD([
      { drug: 'oxycodone', dailyDose: 20 },
      { drug: 'morphine', dailyDose: 30 },
    ]);
    expect(result.totalDailyMME).toBe(60); // 30 + 30
    expect(result.opioids).toHaveLength(2);
  });

  it('should flag total >90 MME as HIGH RISK', () => {
    const result = calculateTotalMEDD([
      { drug: 'oxycodone', dailyDose: 40 },
      { drug: 'hydrocodone', dailyDose: 40 },
    ]);
    expect(result.totalDailyMME).toBe(100); // 60 + 40
    expect(result.riskLevel).toBe('HIGH RISK');
    expect(result.cdcThresholdWarning).toContain('EXCEEDS');
  });

  it('should recommend naloxone at ≥50 MME', () => {
    const result = calculateTotalMEDD([
      { drug: 'morphine', dailyDose: 60 },
    ]);
    expect(result.naloxoneRecommendation).toContain('PRESCRIBE NALOXONE');
  });

  it('should handle errors for unknown opioids', () => {
    const result = calculateTotalMEDD([
      { drug: 'morphine', dailyDose: 30 },
      { drug: 'aspirin', dailyDose: 325 },
    ]);
    expect(result.errors).toHaveLength(1);
    expect(result.opioids).toHaveLength(1);
    expect(result.totalDailyMME).toBe(30);
  });

  it('should add methadone consideration when present', () => {
    const result = calculateTotalMEDD([
      { drug: 'methadone', dailyDose: 20 },
    ]);
    expect(result.prescribingConsiderations.some(c => c.includes('METHADONE'))).toBe(true);
  });

  it('should warn about multiple opioids', () => {
    const result = calculateTotalMEDD([
      { drug: 'oxycodone', dailyDose: 10 },
      { drug: 'hydrocodone', dailyDose: 10 },
    ]);
    expect(result.prescribingConsiderations.some(c => c.includes('Multiple opioids'))).toBe(true);
  });

  it('should calculate fentanyl patch + breakthrough correctly', () => {
    const result = calculateTotalMEDD([
      { drug: 'fentanyl patch', dailyDose: 25 },
      { drug: 'oxycodone', dailyDose: 20 },
    ]);
    expect(result.totalDailyMME).toBe(90); // 60 + 30
    expect(result.riskLevel).toBe('HIGH RISK');
  });
});

describe('Opioid Dose Conversion', () => {
  it('should convert morphine to oxycodone with 25% reduction', () => {
    const result = convertOpioidDose('morphine', 60, 'oxycodone', 25);
    expect('calculatedDose' in result).toBe(true);
    if ('calculatedDose' in result) {
      expect(result.calculatedDose).toBe(40); // 60 MME / 1.5 factor
      expect(result.reducedDose).toBe(30); // 40 * 0.75
      expect(result.mmeEquivalent).toBe(60);
    }
  });

  it('should convert oxycodone to morphine', () => {
    const result = convertOpioidDose('oxycodone', 20, 'morphine', 25);
    if ('calculatedDose' in result) {
      expect(result.calculatedDose).toBe(30); // 20 * 1.5 / 1
      expect(result.reducedDose).toBe(22.5);
    }
  });

  it('should convert to fentanyl patch with rounding note', () => {
    const result = convertOpioidDose('morphine', 90, 'fentanyl patch', 25);
    if ('calculatedDose' in result) {
      expect(result.calculatedDose).toBe(37.5); // 90 / 2.4
      expect(result.warnings.some(w => w.includes('patch size'))).toBe(true);
    }
  });

  it('should warn about methadone conversion', () => {
    const result = convertOpioidDose('morphine', 120, 'methadone', 25);
    if ('calculatedDose' in result) {
      expect(result.warnings.some(w => w.includes('METHADONE'))).toBe(true);
    }
  });

  it('should reject buprenorphine conversion', () => {
    const result = convertOpioidDose('morphine', 60, 'buprenorphine');
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('specialist');
    }
  });

  it('should reject unknown source drug', () => {
    const result = convertOpioidDose('aspirin', 325, 'morphine');
    expect('error' in result).toBe(true);
  });

  it('should reject unknown target drug', () => {
    const result = convertOpioidDose('morphine', 60, 'aspirin');
    expect('error' in result).toBe(true);
  });

  it('should apply custom reduction percentage', () => {
    const result = convertOpioidDose('morphine', 60, 'oxycodone', 50);
    if ('calculatedDose' in result) {
      expect(result.reducedDose).toBe(20); // 40 * 0.50
      expect(result.reductionPercent).toBe(50);
    }
  });

  it('should warn about low reduction percentage', () => {
    const result = convertOpioidDose('morphine', 60, 'oxycodone', 10);
    if ('calculatedDose' in result) {
      expect(result.warnings.some(w => w.includes('at least 25-50%'))).toBe(true);
    }
  });

  it('should handle hydromorphone to morphine conversion', () => {
    const result = convertOpioidDose('hydromorphone', 8, 'morphine', 25);
    if ('calculatedDose' in result) {
      expect(result.calculatedDose).toBe(32); // 8*4=32 MME / 1
      expect(result.reducedDose).toBe(24); // 32*0.75
    }
  });
});

describe('List Opioids', () => {
  it('should return all opioids in database', () => {
    const opioids = listOpioids();
    expect(opioids.length).toBeGreaterThan(10);
  });

  it('should include oral, parenteral, transdermal, and sublingual routes', () => {
    const opioids = listOpioids();
    const routes = new Set(opioids.map(o => o.route));
    expect(routes.has('oral')).toBe(true);
    expect(routes.has('parenteral')).toBe(true);
    expect(routes.has('transdermal')).toBe(true);
    expect(routes.has('sublingual')).toBe(true);
  });

  it('should include MME factors', () => {
    const opioids = listOpioids();
    const morphine = opioids.find(o => o.name === 'morphine');
    expect(morphine).toBeDefined();
    expect(morphine!.mmeFactor).toBe(1);
  });
});

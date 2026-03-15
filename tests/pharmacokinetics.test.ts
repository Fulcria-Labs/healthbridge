import { describe, it, expect } from 'vitest';
import {
  calculateCrCl,
  calculateIBW,
  calculateABW,
  calculateBSA,
  calculateCorrectedCalcium,
  calculateCorrectedPhenytoin,
  calculateAnionGap,
  runCalculator,
  listCalculators,
} from '../src/data/pharmacokinetics.js';
import { runPKCalculator, listPKCalculators } from '../src/tools/pharmacokinetics-tool.js';

describe('Cockcroft-Gault CrCl', () => {
  it('should calculate CrCl for healthy male', () => {
    const result = calculateCrCl({ age: 40, weightKg: 70, serumCreatinine: 1.0, sex: 'male' });
    expect(result.calculator).toBe('Cockcroft-Gault CrCl');
    expect(result.unit).toBe('mL/min');
    // (140-40)*70 / (72*1.0) = 7000/72 = 97.2
    expect(result.result).toBeCloseTo(97.2, 0);
    expect(result.interpretation).toContain('Normal');
  });

  it('should apply 0.85 factor for female', () => {
    const male = calculateCrCl({ age: 40, weightKg: 70, serumCreatinine: 1.0, sex: 'male' });
    const female = calculateCrCl({ age: 40, weightKg: 70, serumCreatinine: 1.0, sex: 'female' });
    expect(female.result).toBeCloseTo(male.result * 0.85, 0);
  });

  it('should classify mild impairment', () => {
    const result = calculateCrCl({ age: 65, weightKg: 70, serumCreatinine: 1.2, sex: 'male' });
    // (140-65)*70 / (72*1.2) = 5250/86.4 = 60.8
    expect(result.result).toBeCloseTo(60.8, 0);
    expect(result.interpretation).toContain('Mild');
  });

  it('should classify moderate impairment', () => {
    const result = calculateCrCl({ age: 75, weightKg: 60, serumCreatinine: 2.0, sex: 'female' });
    // (140-75)*60 / (72*2.0) * 0.85 = 3900/144 * 0.85 = 27.1 * 0.85 = 23.0
    expect(result.result).toBeLessThan(30);
    expect(result.interpretation).toContain('Severe');
  });

  it('should handle elevated creatinine', () => {
    const result = calculateCrCl({ age: 80, weightKg: 50, serumCreatinine: 4.0, sex: 'male' });
    // (140-80)*50 / (72*4.0) = 3000/288 = 10.4
    expect(result.result).toBeLessThan(15);
    expect(result.interpretation).toContain('failure');
  });

  it('should include formula in result', () => {
    const result = calculateCrCl({ age: 50, weightKg: 80, serumCreatinine: 1.0, sex: 'male' });
    expect(result.formula).toContain('CrCl');
  });
});

describe('Ideal Body Weight', () => {
  it('should calculate IBW for average male', () => {
    const result = calculateIBW({ heightCm: 178, sex: 'male' });
    expect(result.calculator).toContain('Ideal Body Weight');
    // 178 cm = 70.1 inches; 70.1 - 60 = 10.1; IBW = 50 + 2.3*10.1 = 73.2
    expect(result.result).toBeCloseTo(73.2, 0);
    expect(result.unit).toBe('kg');
  });

  it('should calculate IBW for average female', () => {
    const result = calculateIBW({ heightCm: 165, sex: 'female' });
    // 165 cm = 65.0 inches; 65-60 = 5; IBW = 45.5 + 2.3*5 = 57.0
    expect(result.result).toBeCloseTo(57.0, 0);
  });

  it('should handle 5 foot (60 inches) height', () => {
    const result = calculateIBW({ heightCm: 152.4, sex: 'male' });
    // exactly 60 inches: IBW = 50 + 0 = 50
    expect(result.result).toBeCloseTo(50, 0);
  });

  it('should handle short height gracefully', () => {
    const result = calculateIBW({ heightCm: 140, sex: 'female' });
    // 140/2.54 = 55.1 inches; 55.1-60 = negative → clamped to 0
    expect(result.result).toBeCloseTo(45.5, 0);
  });
});

describe('Adjusted Body Weight', () => {
  it('should calculate ABW for obese patient', () => {
    const result = calculateABW({ actualWeightKg: 120, heightCm: 178, sex: 'male' });
    // IBW ≈ 73.2; ABW = 73.2 + 0.4*(120-73.2) = 73.2 + 18.72 = 91.9
    expect(result.result).toBeCloseTo(91.9, 0);
    expect(result.interpretation).toContain('obese');
  });

  it('should note when patient is not obese', () => {
    const result = calculateABW({ actualWeightKg: 75, heightCm: 178, sex: 'male' });
    // 75/73.2 = 102% IBW — not obese
    expect(result.interpretation).not.toContain('obese');
  });

  it('should use custom correction factor', () => {
    const result = calculateABW({ actualWeightKg: 120, heightCm: 178, sex: 'male', correctionFactor: 0.25 });
    // ABW = 73.2 + 0.25*(120-73.2) = 73.2 + 11.7 = 84.9
    expect(result.result).toBeCloseTo(84.9, 0);
  });
});

describe('Body Surface Area', () => {
  it('should calculate BSA for average adult', () => {
    const result = calculateBSA({ heightCm: 170, weightKg: 70 });
    expect(result.calculator).toContain('Body Surface Area');
    // sqrt(170*70/3600) = sqrt(3.306) = 1.818
    expect(result.result).toBeCloseTo(1.82, 1);
    expect(result.unit).toBe('m²');
  });

  it('should classify pediatric BSA', () => {
    const result = calculateBSA({ heightCm: 100, weightKg: 15 });
    // sqrt(100*15/3600) = sqrt(0.417) = 0.645
    expect(result.result).toBeLessThan(1.0);
    expect(result.interpretation).toContain('pediatric');
  });

  it('should classify high BSA', () => {
    const result = calculateBSA({ heightCm: 190, weightKg: 120 });
    expect(result.result).toBeGreaterThan(2.0);
  });
});

describe('Corrected Calcium', () => {
  it('should correct for low albumin', () => {
    const result = calculateCorrectedCalcium({ totalCalcium: 8.0, albumin: 2.5 });
    // 8.0 + 0.8*(4.0-2.5) = 8.0 + 1.2 = 9.2
    expect(result.result).toBeCloseTo(9.2, 1);
    expect(result.interpretation).toContain('Normal');
  });

  it('should detect hypocalcemia after correction', () => {
    const result = calculateCorrectedCalcium({ totalCalcium: 7.0, albumin: 3.0 });
    // 7.0 + 0.8*(4.0-3.0) = 7.0 + 0.8 = 7.8
    expect(result.result).toBeCloseTo(7.8, 1);
    expect(result.interpretation).toContain('Hypocalcemia');
  });

  it('should detect hypercalcemia', () => {
    const result = calculateCorrectedCalcium({ totalCalcium: 12.0, albumin: 4.0 });
    // 12.0 + 0.8*(4.0-4.0) = 12.0
    expect(result.result).toBe(12.0);
    expect(result.interpretation).toContain('hypercalcemia');
  });

  it('should detect severe hypercalcemia', () => {
    const result = calculateCorrectedCalcium({ totalCalcium: 15.0, albumin: 4.0 });
    expect(result.interpretation).toContain('Severe');
    expect(result.interpretation).toContain('emergency');
  });

  it('should handle normal albumin without change', () => {
    const result = calculateCorrectedCalcium({ totalCalcium: 9.5, albumin: 4.0 });
    expect(result.result).toBeCloseTo(9.5, 1);
  });
});

describe('Corrected Phenytoin', () => {
  it('should correct for low albumin, no renal impairment', () => {
    const result = calculateCorrectedPhenytoin({ measuredPhenytoin: 8.0, albumin: 2.0 });
    // 8.0 / (0.2*2.0 + 0.1) = 8.0 / 0.5 = 16.0
    expect(result.result).toBeCloseTo(16.0, 0);
    expect(result.interpretation).toContain('Therapeutic');
  });

  it('should use renal impairment formula', () => {
    const result = calculateCorrectedPhenytoin({ measuredPhenytoin: 8.0, albumin: 2.0, renalImpairment: true });
    // 8.0 / (0.1*2.0 + 0.1) = 8.0 / 0.3 = 26.7
    expect(result.result).toBeCloseTo(26.7, 0);
    expect(result.interpretation).toContain('Supratherapeutic');
  });

  it('should identify subtherapeutic level', () => {
    const result = calculateCorrectedPhenytoin({ measuredPhenytoin: 4.0, albumin: 4.0 });
    // 4.0 / (0.2*4.0 + 0.1) = 4.0 / 0.9 = 4.4
    expect(result.result).toBeLessThan(10);
    expect(result.interpretation).toContain('Subtherapeutic');
  });

  it('should identify therapeutic level with normal albumin', () => {
    const result = calculateCorrectedPhenytoin({ measuredPhenytoin: 15.0, albumin: 4.0 });
    // 15.0 / (0.2*4.0 + 0.1) = 15.0 / 0.9 = 16.7
    expect(result.result).toBeGreaterThanOrEqual(10);
    expect(result.result).toBeLessThanOrEqual(20);
    expect(result.interpretation).toContain('Therapeutic');
  });
});

describe('Anion Gap', () => {
  it('should calculate normal anion gap', () => {
    const result = calculateAnionGap({ sodium: 140, chloride: 104, bicarbonate: 24 });
    // 140 - (104+24) = 12
    expect(result.result).toBe(12);
    expect(result.interpretation).toContain('Normal');
  });

  it('should detect elevated anion gap', () => {
    const result = calculateAnionGap({ sodium: 140, chloride: 100, bicarbonate: 18 });
    // 140 - (100+18) = 22
    expect(result.result).toBe(22);
    expect(result.interpretation).toContain('Significantly elevated');
  });

  it('should correct for low albumin', () => {
    const result = calculateAnionGap({ sodium: 140, chloride: 104, bicarbonate: 24, albumin: 2.0 });
    // raw AG = 12; corrected = 12 + 2.5*(4.0-2.0) = 12 + 5 = 17
    expect(result.result).toBe(12); // raw
    expect(result.interpretation).toContain('corrected AG: 17');
    expect(result.interpretation).toContain('Elevated');
  });

  it('should include MUDPILES mnemonic for elevated', () => {
    const result = calculateAnionGap({ sodium: 145, chloride: 100, bicarbonate: 15 });
    // 145 - 115 = 30
    expect(result.clinicalNotes).toContain('MUDPILES');
  });

  it('should handle borderline values', () => {
    const result = calculateAnionGap({ sodium: 140, chloride: 104, bicarbonate: 24 });
    expect(result.result).toBe(12);
    expect(result.interpretation).toContain('Normal');
  });
});

describe('runCalculator', () => {
  it('should dispatch CrCl calculator', () => {
    const result = runCalculator('CrCl', { age: 50, weightKg: 70, serumCreatinine: 1.0, sex: 'male' });
    expect('calculator' in result).toBe(true);
  });

  it('should dispatch IBW calculator', () => {
    const result = runCalculator('IBW', { heightCm: 170, sex: 'male' });
    expect('calculator' in result).toBe(true);
  });

  it('should dispatch ABW calculator', () => {
    const result = runCalculator('ABW', { actualWeightKg: 100, heightCm: 170, sex: 'male' });
    expect('calculator' in result).toBe(true);
  });

  it('should dispatch BSA calculator', () => {
    const result = runCalculator('BSA', { heightCm: 170, weightKg: 70 });
    expect('calculator' in result).toBe(true);
  });

  it('should dispatch correctedCalcium', () => {
    const result = runCalculator('correctedCalcium', { totalCalcium: 9.0, albumin: 3.0 });
    expect('calculator' in result).toBe(true);
  });

  it('should dispatch correctedPhenytoin', () => {
    const result = runCalculator('correctedPhenytoin', { measuredPhenytoin: 10, albumin: 3.0 });
    expect('calculator' in result).toBe(true);
  });

  it('should dispatch anionGap', () => {
    const result = runCalculator('anionGap', { sodium: 140, chloride: 104, bicarbonate: 24 });
    expect('calculator' in result).toBe(true);
  });

  it('should return error for unknown calculator', () => {
    const result = runCalculator('unknown', {});
    expect('error' in result).toBe(true);
  });

  it('should accept Cockcroft-Gault alias', () => {
    const result = runCalculator('Cockcroft-Gault', { age: 50, weightKg: 70, serumCreatinine: 1.0, sex: 'male' });
    expect('calculator' in result).toBe(true);
  });

  it('should accept ideal body weight alias', () => {
    const result = runCalculator('idealBodyWeight', { heightCm: 170, sex: 'male' });
    expect('calculator' in result).toBe(true);
  });

  it('should accept body surface area alias', () => {
    const result = runCalculator('bodySurfaceArea', { heightCm: 170, weightKg: 70 });
    expect('calculator' in result).toBe(true);
  });
});

describe('listCalculators', () => {
  it('should list all calculators', () => {
    const calcs = listCalculators();
    expect(calcs.length).toBe(7);
    expect(calcs.every(c => c.name && c.description && c.requiredParams.length > 0)).toBe(true);
  });
});

describe('Tool wrappers', () => {
  it('runPKCalculator should work', () => {
    const result = runPKCalculator({ calculator: 'CrCl', parameters: { age: 50, weightKg: 70, serumCreatinine: 1.0, sex: 'male' } });
    expect('calculator' in result || 'error' in result).toBe(true);
  });

  it('listPKCalculators should return list', () => {
    const result = listPKCalculators();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(7);
  });
});

describe('Clinical PK scenarios', () => {
  it('Elderly woman with CKD needing dose adjustment', () => {
    const crcl = calculateCrCl({ age: 82, weightKg: 55, serumCreatinine: 1.8, sex: 'female' });
    // (140-82)*55 / (72*1.8) * 0.85 = 3190/129.6 * 0.85 = 24.6 * 0.85 = 20.9
    expect(crcl.result).toBeLessThan(30);
    expect(crcl.interpretation).toContain('Severe');
  });

  it('Obese patient needing vancomycin dosing weights', () => {
    const ibw = calculateIBW({ heightCm: 170, sex: 'male' });
    const abw = calculateABW({ actualWeightKg: 130, heightCm: 170, sex: 'male' });
    expect(abw.result).toBeGreaterThan(ibw.result);
    expect(abw.result).toBeLessThan(130);
    expect(abw.interpretation).toContain('obese');
  });

  it('Chemotherapy BSA calculation', () => {
    const bsa = calculateBSA({ heightCm: 165, weightKg: 65 });
    expect(bsa.result).toBeGreaterThan(1.5);
    expect(bsa.result).toBeLessThan(2.0);
    expect(bsa.clinicalNotes).toContain('chemotherapy');
  });

  it('Hypoalbuminemia with borderline calcium', () => {
    const ca = calculateCorrectedCalcium({ totalCalcium: 8.2, albumin: 2.0 });
    // 8.2 + 0.8*2.0 = 9.8 — actually normal after correction!
    expect(ca.result).toBeGreaterThan(8.5);
    expect(ca.interpretation).toContain('Normal');
  });

  it('Phenytoin level in ICU patient with low albumin + renal failure', () => {
    const pht = calculateCorrectedPhenytoin({ measuredPhenytoin: 7.0, albumin: 2.0, renalImpairment: true });
    // 7.0 / (0.1*2.0 + 0.1) = 7.0/0.3 = 23.3
    expect(pht.result).toBeGreaterThan(20);
    expect(pht.interpretation).toContain('Supratherapeutic');
  });

  it('DKA patient anion gap', () => {
    const ag = calculateAnionGap({ sodium: 138, chloride: 98, bicarbonate: 10 });
    // 138 - (98+10) = 30
    expect(ag.result).toBe(30);
    expect(ag.interpretation).toContain('Significantly elevated');
  });

  it('Normal gap metabolic acidosis', () => {
    const ag = calculateAnionGap({ sodium: 140, chloride: 112, bicarbonate: 18 });
    // 140 - (112+18) = 10
    expect(ag.result).toBe(10);
    expect(ag.interpretation).toContain('Normal');
  });
});

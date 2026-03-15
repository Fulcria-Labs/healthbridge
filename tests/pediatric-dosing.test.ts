import { describe, it, expect } from 'vitest';
import { calculatePediatricDose, listPediatricDosingDrugs, pediatricDosingDatabase, AGE_CATEGORIES } from '../src/data/pediatric-dosing.js';
import { getPediatricDose, listPediatricDrugs } from '../src/tools/pediatric-dosing-tool.js';

describe('Pediatric Dosing Database', () => {
  it('should have entries in the database', () => {
    expect(pediatricDosingDatabase.length).toBeGreaterThan(10);
  });

  it('should have valid structure for all entries', () => {
    for (const entry of pediatricDosingDatabase) {
      expect(entry.drug).toBeTruthy();
      expect(entry.drugClass).toBeTruthy();
      expect(entry.indications.length).toBeGreaterThan(0);
      expect(entry.minAgeMonths).toBeGreaterThanOrEqual(0);
      expect(typeof entry.fdaApprovedPediatric).toBe('boolean');
      expect(entry.warnings.length).toBeGreaterThan(0);
    }
  });

  it('should have valid indications for all entries', () => {
    for (const entry of pediatricDosingDatabase) {
      for (const ind of entry.indications) {
        expect(ind.indication).toBeTruthy();
        expect(ind.route).toBeTruthy();
        expect(ind.dosePerKg).toBeGreaterThanOrEqual(0);
        expect(ind.maxSingleDoseMg).toBeGreaterThan(0);
        expect(ind.frequency).toBeTruthy();
        expect(ind.maxDailyDoseMg).toBeGreaterThan(0);
      }
    }
  });

  it('should have defined age categories', () => {
    expect(AGE_CATEGORIES.length).toBe(6);
    expect(AGE_CATEGORIES[0].label).toContain('Neonate');
    expect(AGE_CATEGORIES[5].label).toContain('Adolescent');
  });
});

describe('calculatePediatricDose', () => {
  describe('acetaminophen', () => {
    it('should calculate correct dose for a 10kg infant', () => {
      const result = calculatePediatricDose('acetaminophen', 10, 12);
      expect(result).not.toBeNull();
      expect(result!.drug).toBe('acetaminophen');
      expect(result!.weightKg).toBe(10);
      expect(result!.ageMonths).toBe(12);
      expect(result!.ageCategory).toContain('Toddler');
      expect(result!.ageAppropriate).toBe(true);
      expect(result!.indications.length).toBeGreaterThan(0);
      // 15 mg/kg * 10 kg = 150 mg
      const oralDose = result!.indications.find(i => i.route === 'oral');
      expect(oralDose).toBeTruthy();
      expect(oralDose!.calculatedDoseMg).toBe(150);
      expect(oralDose!.recommendedDoseMg).toBe(150);
    });

    it('should cap dose at max for heavy child', () => {
      const result = calculatePediatricDose('acetaminophen', 80, 180);
      expect(result).not.toBeNull();
      const oralDose = result!.indications.find(i => i.route === 'oral');
      // 15 * 80 = 1200, capped at 1000
      expect(oralDose!.calculatedDoseMg).toBe(1200);
      expect(oralDose!.recommendedDoseMg).toBe(1000);
    });

    it('should allow neonatal dosing', () => {
      const result = calculatePediatricDose('acetaminophen', 3.5, 0);
      expect(result).not.toBeNull();
      expect(result!.ageAppropriate).toBe(true);
      expect(result!.ageCategory).toContain('Neonate');
    });
  });

  describe('ibuprofen', () => {
    it('should calculate correct dose for a 20kg child', () => {
      const result = calculatePediatricDose('ibuprofen', 20, 60);
      expect(result).not.toBeNull();
      expect(result!.drug).toBe('ibuprofen');
      const oralDose = result!.indications[0];
      // 10 mg/kg * 20 kg = 200 mg
      expect(oralDose.calculatedDoseMg).toBe(200);
      expect(oralDose.recommendedDoseMg).toBe(200);
    });

    it('should flag age-inappropriate use in infants under 6 months', () => {
      const result = calculatePediatricDose('ibuprofen', 5, 3);
      expect(result).not.toBeNull();
      expect(result!.ageAppropriate).toBe(false);
      expect(result!.warnings.some(w => w.includes('not recommended'))).toBe(true);
    });

    it('should cap at max single dose', () => {
      const result = calculatePediatricDose('ibuprofen', 50, 144);
      expect(result).not.toBeNull();
      const oralDose = result!.indications[0];
      // 10 * 50 = 500, capped at 400
      expect(oralDose.calculatedDoseMg).toBe(500);
      expect(oralDose.recommendedDoseMg).toBe(400);
    });
  });

  describe('amoxicillin', () => {
    it('should show multiple indications', () => {
      const result = calculatePediatricDose('amoxicillin', 15, 36);
      expect(result).not.toBeNull();
      expect(result!.indications.length).toBeGreaterThan(1);
    });

    it('should filter by indication', () => {
      const result = calculatePediatricDose('amoxicillin', 15, 36, 'otitis');
      expect(result).not.toBeNull();
      expect(result!.indications.every(i => i.indication.toLowerCase().includes('otitis'))).toBe(true);
    });

    it('should calculate high-dose otitis media correctly', () => {
      const result = calculatePediatricDose('amoxicillin', 15, 12, 'otitis');
      expect(result).not.toBeNull();
      // High-dose: 45 mg/kg * 15 kg = 675
      const highDose = result!.indications.find(i => i.indication.includes('high-dose'));
      expect(highDose).toBeTruthy();
      expect(highDose!.calculatedDoseMg).toBe(675);
    });

    it('should calculate strep pharyngitis dose', () => {
      const result = calculatePediatricDose('amoxicillin', 20, 72, 'pharyngitis');
      expect(result).not.toBeNull();
      const dose = result!.indications[0];
      // 25 mg/kg * 20 = 500
      expect(dose.calculatedDoseMg).toBe(500);
    });
  });

  describe('ceftriaxone', () => {
    it('should calculate meningitis dose', () => {
      const result = calculatePediatricDose('ceftriaxone', 10, 6, 'meningitis');
      expect(result).not.toBeNull();
      const dose = result!.indications[0];
      // 50 mg/kg * 10 = 500
      expect(dose.calculatedDoseMg).toBe(500);
      expect(dose.route).toBe('IV');
    });

    it('should warn about neonatal calcium interaction', () => {
      const result = calculatePediatricDose('ceftriaxone', 3, 0);
      expect(result).not.toBeNull();
      expect(result!.warnings.some(w => w.includes('calcium'))).toBe(true);
    });
  });

  describe('ondansetron', () => {
    it('should calculate anti-emetic dose', () => {
      const result = calculatePediatricDose('ondansetron', 15, 36);
      expect(result).not.toBeNull();
      const oralDose = result!.indications.find(i => i.route === 'oral');
      // 0.15 mg/kg * 15 = 2.25
      expect(oralDose!.calculatedDoseMg).toBe(2.3); // rounded
    });
  });

  describe('prednisolone', () => {
    it('should calculate asthma exacerbation dose', () => {
      const result = calculatePediatricDose('prednisolone', 20, 48, 'asthma');
      expect(result).not.toBeNull();
      const dose = result!.indications[0];
      // 1 mg/kg * 20 = 20
      expect(dose.calculatedDoseMg).toBe(20);
      expect(dose.maxSingleDoseMg).toBe(60);
    });
  });

  describe('methylphenidate', () => {
    it('should flag if under 6 years', () => {
      const result = calculatePediatricDose('methylphenidate', 20, 48);
      expect(result).not.toBeNull();
      expect(result!.ageAppropriate).toBe(false);
    });

    it('should allow use at 6 years', () => {
      const result = calculatePediatricDose('methylphenidate', 25, 72);
      expect(result).not.toBeNull();
      expect(result!.ageAppropriate).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should return null for unknown drug', () => {
      const result = calculatePediatricDose('unknowndrug', 10, 12);
      expect(result).toBeNull();
    });

    it('should be case-insensitive', () => {
      const result = calculatePediatricDose('ACETAMINOPHEN', 10, 12);
      expect(result).not.toBeNull();
      expect(result!.drug).toBe('acetaminophen');
    });

    it('should warn about very low weight', () => {
      const result = calculatePediatricDose('acetaminophen', 2, 0);
      expect(result).not.toBeNull();
      expect(result!.warnings.some(w => w.includes('Very low weight'))).toBe(true);
    });

    it('should note high weight for age', () => {
      const result = calculatePediatricDose('acetaminophen', 50, 96);
      expect(result).not.toBeNull();
      expect(result!.warnings.some(w => w.includes('exceeds typical'))).toBe(true);
    });

    it('should return adult age category for >18', () => {
      const result = calculatePediatricDose('acetaminophen', 70, 240);
      expect(result).not.toBeNull();
      expect(result!.ageCategory).toContain('Adult');
    });
  });
});

describe('listPediatricDosingDrugs', () => {
  it('should list all drugs', () => {
    const drugs = listPediatricDosingDrugs();
    expect(drugs.length).toBeGreaterThan(10);
    expect(drugs.every(d => d.drug && d.drugClass && d.minAgeMonths >= 0)).toBe(true);
  });
});

describe('Tool wrapper - getPediatricDose', () => {
  it('should return result for valid drug', () => {
    const result = getPediatricDose({ drug: 'amoxicillin', weightKg: 15, ageMonths: 24 });
    expect(result).toHaveProperty('drug');
    expect(result).not.toHaveProperty('error');
  });

  it('should return error and drug list for unknown drug', () => {
    const result = getPediatricDose({ drug: 'fakemed', weightKg: 10, ageMonths: 12 });
    expect(result).toHaveProperty('error');
    expect(result).toHaveProperty('availableDrugs');
  });
});

describe('Tool wrapper - listPediatricDrugs', () => {
  it('should return drugs list', () => {
    const result = listPediatricDrugs();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('Dose calculations for all drugs', () => {
  it('should calculate valid doses for every drug in database', () => {
    const drugs = listPediatricDosingDrugs();
    for (const { drug } of drugs) {
      const result = calculatePediatricDose(drug, 20, 72);
      expect(result).not.toBeNull();
      expect(result!.drug).toBe(drug);
      for (const ind of result!.indications) {
        expect(ind.recommendedDoseMg).toBeGreaterThanOrEqual(0);
        expect(ind.recommendedDoseMg).toBeLessThanOrEqual(ind.maxSingleDoseMg);
      }
    }
  });
});

describe('Specific clinical scenarios', () => {
  it('Scenario: 8-month infant with ear infection', () => {
    const result = calculatePediatricDose('amoxicillin', 8, 8, 'otitis');
    expect(result).not.toBeNull();
    expect(result!.ageAppropriate).toBe(true);
    // Standard dose: 40 * 8 = 320 mg divided TID
    const std = result!.indications.find(i => i.indication.includes('standard'));
    expect(std!.calculatedDoseMg).toBe(320);
  });

  it('Scenario: 3-year-old with strep throat, PCN-allergic', () => {
    const result = calculatePediatricDose('azithromycin', 14, 36, 'pharyngitis');
    expect(result).not.toBeNull();
    expect(result!.ageAppropriate).toBe(true);
    // 12 * 14 = 168
    expect(result!.indications[0].calculatedDoseMg).toBe(168);
  });

  it('Scenario: 5-year-old with fever (35kg, obese)', () => {
    const result = calculatePediatricDose('acetaminophen', 35, 60);
    expect(result).not.toBeNull();
    const oral = result!.indications.find(i => i.route === 'oral');
    // 15 * 35 = 525 (under 1000 max)
    expect(oral!.calculatedDoseMg).toBe(525);
    expect(oral!.recommendedDoseMg).toBe(525);
  });

  it('Scenario: 10-year-old with UTI', () => {
    const result = calculatePediatricDose('cephalexin', 30, 120, 'UTI');
    expect(result).not.toBeNull();
    // 12.5 * 30 = 375
    const dose = result!.indications.find(i => i.indication === 'UTI');
    expect(dose!.calculatedDoseMg).toBe(375);
  });

  it('Scenario: 2-month-old with suspected UTI', () => {
    const result = calculatePediatricDose('trimethoprim-sulfamethoxazole', 5, 2);
    expect(result).not.toBeNull();
    expect(result!.ageAppropriate).toBe(true); // min 2 months
  });

  it('Scenario: 1-month-old should be flagged for TMP-SMX', () => {
    const result = calculatePediatricDose('trimethoprim-sulfamethoxazole', 4, 1);
    expect(result).not.toBeNull();
    expect(result!.ageAppropriate).toBe(false);
  });

  it('Scenario: Toddler with asthma exacerbation needs albuterol', () => {
    const result = calculatePediatricDose('albuterol', 12, 30);
    expect(result).not.toBeNull();
    const neb = result!.indications.find(i => i.route === 'inhaled' && i.indication.includes('nebulizer'));
    // 0.15 * 12 = 1.8 mg
    expect(neb!.calculatedDoseMg).toBe(1.8);
  });

  it('Scenario: Adolescent with seizure disorder', () => {
    const result = calculatePediatricDose('levetiracetam', 60, 168);
    expect(result).not.toBeNull();
    const oral = result!.indications.find(i => i.route === 'oral');
    // 10 * 60 = 600 (under 750 max)
    expect(oral!.calculatedDoseMg).toBe(600);
  });

  it('Scenario: allergic reaction in school-age child', () => {
    const result = calculatePediatricDose('diphenhydramine', 25, 84);
    expect(result).not.toBeNull();
    expect(result!.ageAppropriate).toBe(true);
    const oral = result!.indications.find(i => i.route === 'oral');
    // 1.25 * 25 = 31.25 → 31.3
    expect(oral!.calculatedDoseMg).toBe(31.3);
  });

  it('Scenario: infant allergic rhinitis - cetirizine', () => {
    const result = calculatePediatricDose('cetirizine', 8, 10);
    expect(result).not.toBeNull();
    expect(result!.ageAppropriate).toBe(true);
  });

  it('Scenario: toddler with GERD', () => {
    const result = calculatePediatricDose('omeprazole', 12, 18);
    expect(result).not.toBeNull();
    expect(result!.ageAppropriate).toBe(true);
    const dose = result!.indications[0];
    // 1 * 12 = 12 mg
    expect(dose.calculatedDoseMg).toBe(12);
  });
});

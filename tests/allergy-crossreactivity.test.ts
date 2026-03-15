import { describe, it, expect } from 'vitest';
import {
  checkCrossReactivity,
  checkAllCrossReactivities,
  listAllergyClasses,
  crossReactivityDatabase,
} from '../src/data/allergy-crossreactivity.js';
import {
  checkSingleCrossReactivity,
  checkBulkCrossReactivity,
  listAvailableAllergyClasses,
} from '../src/tools/allergy-crossreactivity-tool.js';

describe('Cross-Reactivity Database', () => {
  it('should have entries', () => {
    expect(crossReactivityDatabase.length).toBeGreaterThan(5);
  });

  it('should have valid structure', () => {
    for (const entry of crossReactivityDatabase) {
      expect(entry.allergyClass).toBeTruthy();
      expect(entry.drugs.length).toBeGreaterThan(0);
      expect(entry.crossReactivities.length).toBeGreaterThan(0);
      for (const cr of entry.crossReactivities) {
        expect(cr.targetClass).toBeTruthy();
        expect(cr.targetDrugs.length).toBeGreaterThan(0);
        expect(['high', 'moderate', 'low', 'negligible']).toContain(cr.riskLevel);
        expect(cr.evidence).toBeTruthy();
        expect(cr.recommendation).toBeTruthy();
      }
    }
  });
});

describe('checkCrossReactivity', () => {
  describe('Penicillin allergies', () => {
    it('should detect high risk for amoxicillin in penicillin-allergic patient', () => {
      const result = checkCrossReactivity('penicillin', 'amoxicillin');
      expect(result).not.toBeNull();
      expect(result!.crossReactivityFound).toBe(true);
      expect(result!.riskLevel).toBe('high');
    });

    it('should detect low risk for cephalexin with penicillin allergy', () => {
      const result = checkCrossReactivity('penicillin', 'cephalexin');
      expect(result).not.toBeNull();
      expect(result!.crossReactivityFound).toBe(true);
      expect(result!.riskLevel).toBe('low');
      expect(result!.riskPercent).toBe('1-2%');
    });

    it('should detect negligible risk for ceftriaxone with penicillin allergy', () => {
      const result = checkCrossReactivity('penicillin', 'ceftriaxone');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('negligible');
    });

    it('should detect negligible risk for meropenem with penicillin allergy', () => {
      const result = checkCrossReactivity('penicillin', 'meropenem');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('negligible');
    });

    it('should detect negligible risk for aztreonam with penicillin allergy', () => {
      const result = checkCrossReactivity('penicillin', 'aztreonam');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('negligible');
      expect(result!.riskPercent).toBe('0%');
    });

    it('should detect high risk for ampicillin in penicillin-allergic', () => {
      const result = checkCrossReactivity('penicillin', 'ampicillin');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('high');
    });

    it('should provide safe alternatives for cephalosporin cross-reactivity', () => {
      const result = checkCrossReactivity('penicillin', 'cephalexin');
      expect(result).not.toBeNull();
      expect(result!.safeAlternatives).toBeDefined();
      expect(result!.safeAlternatives.length).toBeGreaterThan(0);
    });
  });

  describe('Sulfonamide allergies', () => {
    it('should detect negligible risk for furosemide with sulfa allergy', () => {
      const result = checkCrossReactivity('sulfonamide antibiotics', 'furosemide');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('negligible');
    });

    it('should detect negligible risk for HCTZ with sulfa allergy', () => {
      const result = checkCrossReactivity('sulfamethoxazole', 'hydrochlorothiazide');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('negligible');
    });

    it('should detect moderate risk for dapsone with sulfa allergy', () => {
      const result = checkCrossReactivity('sulfamethoxazole', 'dapsone');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('moderate');
    });

    it('should detect same-class risk for sulfasalazine', () => {
      const result = checkCrossReactivity('sulfamethoxazole', 'sulfasalazine');
      expect(result).not.toBeNull();
      expect(result!.crossReactivityFound).toBe(true);
      expect(result!.riskLevel).toBe('high');
    });
  });

  describe('NSAID allergies', () => {
    it('should detect high cross-reactivity for ibuprofen with aspirin allergy', () => {
      const result = checkCrossReactivity('aspirin', 'ibuprofen');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('high');
      expect(result!.riskPercent).toBe('20-30%');
    });

    it('should detect low risk for celecoxib with aspirin allergy', () => {
      const result = checkCrossReactivity('aspirin', 'celecoxib');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('low');
    });

    it('should provide safe alternatives for aspirin allergy', () => {
      const result = checkCrossReactivity('aspirin', 'naproxen');
      expect(result).not.toBeNull();
      expect(result!.safeAlternatives).toBeDefined();
      expect(result!.safeAlternatives).toContain('celecoxib');
    });
  });

  describe('Opioid allergies', () => {
    it('should detect negligible risk for fentanyl with morphine allergy', () => {
      const result = checkCrossReactivity('morphine', 'fentanyl');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('negligible');
    });

    it('should detect moderate risk for hydromorphone with morphine allergy', () => {
      const result = checkCrossReactivity('morphine', 'hydromorphone');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('moderate');
    });
  });

  describe('Local anesthetic allergies', () => {
    it('should detect no cross-reactivity between ester and amide types', () => {
      const result = checkCrossReactivity('procaine', 'lidocaine');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('negligible');
      expect(result!.riskPercent).toBe('0%');
    });

    it('should detect high cross-reactivity within ester type', () => {
      const result = checkCrossReactivity('procaine', 'benzocaine');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('high');
    });
  });

  describe('ACE inhibitor allergies', () => {
    it('should detect high risk for other ACE-I with angioedema', () => {
      const result = checkCrossReactivity('lisinopril', 'enalapril');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('high');
    });

    it('should detect low risk for ARBs with ACE-I angioedema', () => {
      const result = checkCrossReactivity('ACE inhibitors', 'losartan');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('low');
    });
  });

  describe('Statin allergies', () => {
    it('should detect moderate cross-reactivity between statins', () => {
      const result = checkCrossReactivity('atorvastatin', 'simvastatin');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('moderate');
    });
  });

  describe('Fluoroquinolone allergies', () => {
    it('should detect moderate cross-reactivity', () => {
      const result = checkCrossReactivity('ciprofloxacin', 'levofloxacin');
      expect(result).not.toBeNull();
      expect(result!.riskLevel).toBe('moderate');
    });
  });

  describe('No cross-reactivity found', () => {
    it('should return null for unrelated drug classes', () => {
      const result = checkCrossReactivity('penicillin', 'metformin');
      expect(result).toBeNull();
    });

    it('should return null for unknown allergy', () => {
      const result = checkCrossReactivity('unknownallergy', 'aspirin');
      expect(result).toBeNull();
    });
  });
});

describe('checkAllCrossReactivities', () => {
  it('should screen multiple allergies against multiple drugs', () => {
    const result = checkAllCrossReactivities(
      ['penicillin', 'aspirin'],
      ['cephalexin', 'ibuprofen', 'metformin', 'fentanyl']
    );
    expect(result.alerts.length).toBeGreaterThan(0);
    expect(result.safeMedications).toContain('metformin');
    expect(result.safeMedications).toContain('fentanyl');
    expect(result.summary).toBeTruthy();
  });

  it('should identify safe medications', () => {
    const result = checkAllCrossReactivities(
      ['penicillin'],
      ['metformin', 'atorvastatin', 'lisinopril']
    );
    expect(result.alerts.length).toBe(0);
    expect(result.safeMedications.length).toBe(3);
    expect(result.summary).toContain('No cross-reactivity');
  });

  it('should flag HIGH risk in summary', () => {
    const result = checkAllCrossReactivities(
      ['aspirin'],
      ['ibuprofen', 'naproxen']
    );
    expect(result.summary).toContain('HIGH RISK');
    expect(result.alerts.length).toBe(2);
  });

  it('should handle single allergy single drug', () => {
    const result = checkAllCrossReactivities(
      ['morphine'],
      ['fentanyl']
    );
    expect(result.alerts.length).toBeGreaterThan(0);
    expect(result.alerts[0].riskLevel).toBe('negligible');
  });
});

describe('listAllergyClasses', () => {
  it('should list all allergy classes', () => {
    const classes = listAllergyClasses();
    expect(classes.length).toBeGreaterThan(5);
    expect(classes.every(c => c.allergyClass && c.drugs.length > 0)).toBe(true);
  });

  it('should include common allergy classes', () => {
    const classes = listAllergyClasses();
    const names = classes.map(c => c.allergyClass);
    expect(names.some(n => n.includes('penicillin'))).toBe(true);
    expect(names.some(n => n.includes('sulfonamide'))).toBe(true);
    expect(names.some(n => n.includes('NSAID'))).toBe(true);
  });
});

describe('Tool wrappers', () => {
  describe('checkSingleCrossReactivity', () => {
    it('should return result for known cross-reactivity', () => {
      const result = checkSingleCrossReactivity({
        allergy: 'penicillin',
        proposedDrug: 'cephalexin',
      });
      expect(result).toHaveProperty('crossReactivityFound', true);
    });

    it('should return no-match result for unrelated drugs', () => {
      const result = checkSingleCrossReactivity({
        allergy: 'penicillin',
        proposedDrug: 'metformin',
      });
      expect(result).toHaveProperty('crossReactivityFound', false);
      expect(result).toHaveProperty('availableAllergyClasses');
    });
  });

  describe('checkBulkCrossReactivity', () => {
    it('should return bulk screening results', () => {
      const result = checkBulkCrossReactivity({
        allergies: ['penicillin', 'sulfa'],
        medications: ['amoxicillin', 'ceftriaxone', 'bactrim', 'metformin'],
      });
      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('safeMedications');
      expect(result).toHaveProperty('summary');
    });
  });

  describe('listAvailableAllergyClasses', () => {
    it('should return list', () => {
      const result = listAvailableAllergyClasses();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

describe('Clinical cross-reactivity scenarios', () => {
  it('Patient with penicillin allergy needing antibiotics for pneumonia', () => {
    const result = checkAllCrossReactivities(
      ['penicillin'],
      ['azithromycin', 'ceftriaxone', 'levofloxacin']
    );
    // ceftriaxone should be flagged but negligible risk
    const ceftriaxoneAlert = result.alerts.find(a => a.drug === 'ceftriaxone');
    expect(ceftriaxoneAlert).toBeDefined();
    expect(ceftriaxoneAlert!.riskLevel).toBe('negligible');
    // azithromycin and levofloxacin should be safe
    expect(result.safeMedications).toContain('azithromycin');
    expect(result.safeMedications).toContain('levofloxacin');
  });

  it('Patient with morphine allergy needing pain control', () => {
    const result = checkAllCrossReactivities(
      ['morphine'],
      ['fentanyl', 'hydromorphone', 'tramadol', 'acetaminophen']
    );
    // fentanyl and tramadol should be negligible
    const fentanylAlert = result.alerts.find(a => a.drug === 'fentanyl');
    expect(fentanylAlert).toBeDefined();
    expect(fentanylAlert!.riskLevel).toBe('negligible');
    // hydromorphone moderate
    const hydroAlert = result.alerts.find(a => a.drug === 'hydromorphone');
    expect(hydroAlert).toBeDefined();
    expect(hydroAlert!.riskLevel).toBe('moderate');
    // acetaminophen safe
    expect(result.safeMedications).toContain('acetaminophen');
  });

  it('Patient with aspirin-exacerbated respiratory disease', () => {
    const result = checkAllCrossReactivities(
      ['aspirin'],
      ['celecoxib', 'ibuprofen', 'naproxen', 'acetaminophen']
    );
    // ibuprofen and naproxen high risk
    expect(result.alerts.filter(a => a.riskLevel === 'high').length).toBe(2);
    // celecoxib low risk
    const celecoxib = result.alerts.find(a => a.drug === 'celecoxib');
    expect(celecoxib).toBeDefined();
    expect(celecoxib!.riskLevel).toBe('low');
    // acetaminophen safe
    expect(result.safeMedications).toContain('acetaminophen');
  });

  it('Patient needing local anesthetic with ester allergy', () => {
    const result = checkAllCrossReactivities(
      ['procaine'],
      ['lidocaine', 'bupivacaine', 'benzocaine']
    );
    // lidocaine and bupivacaine negligible (amide class)
    expect(result.alerts.filter(a => a.riskLevel === 'negligible').length).toBeGreaterThanOrEqual(2);
    // benzocaine high risk (same ester class)
    const benzocaineAlert = result.alerts.find(a => a.drug === 'benzocaine');
    expect(benzocaineAlert).toBeDefined();
    expect(benzocaineAlert!.riskLevel).toBe('high');
  });

  it('Complex patient with multiple allergies', () => {
    const result = checkAllCrossReactivities(
      ['penicillin', 'sulfa', 'aspirin'],
      ['ceftriaxone', 'dapsone', 'celecoxib', 'azithromycin', 'metformin']
    );
    expect(result.alerts.length).toBeGreaterThan(0);
    expect(result.safeMedications).toContain('azithromycin');
    expect(result.safeMedications).toContain('metformin');
  });
});

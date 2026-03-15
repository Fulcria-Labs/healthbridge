import { describe, it, expect } from 'vitest';
import { findInteraction, findAllInteractions, resolveToGeneric, drugDirectory } from '../src/data/drug-interactions';

describe('New Drug Directory Entries', () => {
  it('includes gemfibrozil', () => {
    expect(drugDirectory.gemfibrozil).toBeDefined();
    expect(drugDirectory.gemfibrozil.drugClass).toBe('fibrate');
    expect(resolveToGeneric('lopid')).toBe('gemfibrozil');
  });

  it('includes fenofibrate', () => {
    expect(drugDirectory.fenofibrate).toBeDefined();
    expect(drugDirectory.fenofibrate.drugClass).toBe('fibrate');
    expect(resolveToGeneric('tricor')).toBe('fenofibrate');
  });

  it('includes tizanidine', () => {
    expect(drugDirectory.tizanidine).toBeDefined();
    expect(drugDirectory.tizanidine.drugClass).toBe('muscle-relaxant');
    expect(resolveToGeneric('zanaflex')).toBe('tizanidine');
  });

  it('includes acetaminophen with brand name tylenol', () => {
    expect(drugDirectory.acetaminophen).toBeDefined();
    expect(drugDirectory.acetaminophen.drugClass).toBe('analgesic');
    expect(resolveToGeneric('tylenol')).toBe('acetaminophen');
    expect(resolveToGeneric('paracetamol')).toBe('acetaminophen');
  });

  it('includes theophylline', () => {
    expect(drugDirectory.theophylline).toBeDefined();
    expect(drugDirectory.theophylline.drugClass).toBe('methylxanthine');
  });

  it('includes iron supplement', () => {
    expect(drugDirectory.iron_supplement).toBeDefined();
    expect(drugDirectory.iron_supplement.drugClass).toBe('mineral-supplement');
  });

  it('includes naltrexone', () => {
    expect(drugDirectory.naltrexone).toBeDefined();
    expect(drugDirectory.naltrexone.drugClass).toBe('opioid-antagonist');
    expect(resolveToGeneric('vivitrol')).toBe('naltrexone');
  });
});

describe('FDA Black Box: Benzodiazepine + Opioid', () => {
  it('flags diazepam + fentanyl as contraindicated', () => {
    const result = findInteraction('diazepam', 'fentanyl');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('contraindicated');
    expect(result!.description).toContain('FDA Black Box');
  });

  it('flags diazepam + fentanyl via brand names', () => {
    const result = findInteraction('valium', 'duragesic');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('contraindicated');
  });

  it('flags midazolam + hydrocodone as major', () => {
    const result = findInteraction('midazolam', 'hydrocodone');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('major');
    expect(result!.management).toContain('naloxone');
  });
});

describe('Statin + Fibrate Rhabdomyolysis', () => {
  it('flags simvastatin + gemfibrozil as contraindicated', () => {
    const result = findInteraction('simvastatin', 'gemfibrozil');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('contraindicated');
    expect(result!.clinicalEffect.toLowerCase()).toContain('rhabdomyolysis');
  });

  it('flags atorvastatin + gemfibrozil as major', () => {
    const result = findInteraction('atorvastatin', 'gemfibrozil');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('major');
    expect(result!.management.toLowerCase()).toContain('fenofibrate');
  });

  it('works with brand names (zocor + lopid)', () => {
    const result = findInteraction('zocor', 'lopid');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('contraindicated');
  });
});

describe('Ciprofloxacin CYP1A2 Interactions', () => {
  it('flags ciprofloxacin + tizanidine as contraindicated', () => {
    const result = findInteraction('ciprofloxacin', 'tizanidine');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('contraindicated');
    expect(result!.mechanism).toContain('CYP1A2');
    expect(result!.clinicalEffect).toContain('10-fold');
  });

  it('flags ciprofloxacin + theophylline as major', () => {
    const result = findInteraction('ciprofloxacin', 'theophylline');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('major');
    expect(result!.clinicalEffect.toLowerCase()).toContain('seizure');
  });

  it('works with brand names (cipro + zanaflex)', () => {
    const result = findInteraction('cipro', 'zanaflex');
    expect(result).not.toBeNull();
  });
});

describe('Serotonin Syndrome: Cyclobenzaprine + SSRI', () => {
  it('flags cyclobenzaprine + fluoxetine as major', () => {
    const result = findInteraction('cyclobenzaprine', 'fluoxetine');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('major');
    expect(result!.description.toLowerCase()).toContain('serotonin');
  });

  it('works with brand names (flexeril + prozac)', () => {
    const result = findInteraction('flexeril', 'prozac');
    expect(result).not.toBeNull();
  });
});

describe('Warfarin + Acetaminophen', () => {
  it('flags as moderate interaction', () => {
    const result = findInteraction('warfarin', 'acetaminophen');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('moderate');
    expect(result!.clinicalEffect).toContain('INR');
  });

  it('works with brand names (coumadin + tylenol)', () => {
    const result = findInteraction('coumadin', 'tylenol');
    expect(result).not.toBeNull();
  });

  it('notes acetaminophen is still preferred analgesic', () => {
    const result = findInteraction('warfarin', 'acetaminophen');
    expect(result!.management.toLowerCase()).toContain('preferred');
  });
});

describe('Gabapentinoid + Opioid FDA Warning', () => {
  it('flags pregabalin + morphine as major', () => {
    const result = findInteraction('pregabalin', 'morphine');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('major');
    expect(result!.description.toLowerCase()).toContain('fda');
  });
});

describe('Levothyroxine Absorption', () => {
  it('flags levothyroxine + iron supplement as moderate', () => {
    const result = findInteraction('levothyroxine', 'iron_supplement');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('moderate');
    expect(result!.management).toContain('4 hours');
  });
});

describe('Insulin + Beta-blocker', () => {
  it('flags insulin + metoprolol as moderate', () => {
    const result = findInteraction('insulin', 'metoprolol');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('moderate');
    expect(result!.clinicalEffect.toLowerCase()).toContain('hypoglycemia');
  });

  it('mentions sweating as preserved warning sign', () => {
    const result = findInteraction('insulin', 'metoprolol');
    expect(result!.management.toLowerCase()).toContain('sweating');
  });
});

describe('Naltrexone + Opioid', () => {
  it('flags naltrexone + morphine as contraindicated', () => {
    const result = findInteraction('naltrexone', 'morphine');
    expect(result).not.toBeNull();
    expect(result!.severity).toBe('contraindicated');
    expect(result!.clinicalEffect.toLowerCase()).toContain('withdrawal');
  });

  it('works with brand name (vivitrol + morphine)', () => {
    const result = findInteraction('vivitrol', 'morphine');
    expect(result).not.toBeNull();
  });
});

describe('Multi-drug interaction scenarios with new drugs', () => {
  it('detects multiple interactions in a polypharmacy list', () => {
    const meds = ['warfarin', 'acetaminophen', 'ciprofloxacin', 'tizanidine', 'levothyroxine', 'iron_supplement'];
    const results = findAllInteractions(meds);
    expect(results.length).toBeGreaterThanOrEqual(3);
    // Should find warfarin+acetaminophen, cipro+tizanidine, levothyroxine+iron
    const pairs = results.map(r => `${r.drug1}|${r.drug2}`);
    expect(pairs.some(p => p.includes('warfarin') && p.includes('acetaminophen'))).toBe(true);
    expect(pairs.some(p => p.includes('ciprofloxacin') && p.includes('tizanidine'))).toBe(true);
    expect(pairs.some(p => p.includes('levothyroxine') && p.includes('iron_supplement'))).toBe(true);
  });

  it('sorts results by severity (contraindicated first)', () => {
    const meds = ['ciprofloxacin', 'tizanidine', 'warfarin', 'acetaminophen'];
    const results = findAllInteractions(meds);
    if (results.length >= 2) {
      // Contraindicated (cipro+tizanidine) should come before moderate (warfarin+acetaminophen)
      const firstSeverity = results[0].severity;
      const lastSeverity = results[results.length - 1].severity;
      const order = { contraindicated: 0, major: 1, moderate: 2, minor: 3 };
      expect(order[firstSeverity]).toBeLessThanOrEqual(order[lastSeverity]);
    }
  });
});

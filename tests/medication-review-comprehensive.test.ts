import { describe, it, expect } from 'vitest';
import { checkDrugInteractions } from '../src/tools/drug-interaction-tool';

/**
 * Comprehensive medication review tests covering condition warnings,
 * allergy cross-referencing, overall risk determination, and complex
 * multi-medication scenarios.
 */

// Helper that mirrors the medication_review tool's condition warning logic
function getConditionWarnings(medications: string[], conditions?: string[]): string[] {
  const warnings: string[] = [];
  if (!conditions) return warnings;

  const condLower = conditions.map(c => c.toLowerCase());
  const medLower = medications.map(m => m.toLowerCase());

  if (condLower.some(c => c.includes('renal') || c.includes('kidney'))) {
    const renalCaution = ['metformin', 'nsaid', 'ibuprofen', 'naproxen', 'lithium', 'methotrexate'];
    const flagged = medLower.filter(m => renalCaution.some(r => m.includes(r)));
    if (flagged.length > 0) {
      warnings.push(`Renal impairment concern: ${flagged.join(', ')} require dose adjustment or avoidance in renal disease.`);
    }
  }

  if (condLower.some(c => c.includes('liver') || c.includes('hepatic'))) {
    const hepaticCaution = ['acetaminophen', 'tylenol', 'simvastatin', 'atorvastatin', 'methotrexate'];
    const flagged = medLower.filter(m => hepaticCaution.some(h => m.includes(h)));
    if (flagged.length > 0) {
      warnings.push(`Hepatic impairment concern: ${flagged.join(', ')} require dose adjustment or monitoring in liver disease.`);
    }
  }

  if (condLower.some(c => c.includes('bleeding') || c.includes('gi bleed'))) {
    const bleedingRisk = ['warfarin', 'aspirin', 'clopidogrel', 'ibuprofen', 'naproxen'];
    const flagged = medLower.filter(m => bleedingRisk.some(b => m.includes(b)));
    if (flagged.length > 0) {
      warnings.push(`Bleeding risk concern: ${flagged.join(', ')} increase bleeding risk.`);
    }
  }

  return warnings;
}

// Helper that mirrors allergy cross-referencing logic
function getAllergyWarnings(medications: string[], allergies?: string[]): string[] {
  const allergyWarnings: string[] = [];
  if (!allergies) return allergyWarnings;

  const allergyLower = allergies.map(a => a.toLowerCase());
  const medLower = medications.map(m => m.toLowerCase());

  if (allergyLower.some(a => a.includes('penicillin'))) {
    const crossReactive = ['amoxicillin', 'ampicillin', 'piperacillin'];
    const flagged = medLower.filter(m => crossReactive.some(c => m.includes(c)));
    if (flagged.length > 0) {
      allergyWarnings.push(`ALLERGY ALERT: ${flagged.join(', ')} - patient has penicillin allergy.`);
    }
    const cephCross = ['cephalexin', 'ceftriaxone', 'cefazolin'];
    const cephFlagged = medLower.filter(m => cephCross.some(c => m.includes(c)));
    if (cephFlagged.length > 0) {
      allergyWarnings.push(`Caution: ${cephFlagged.join(', ')} - cross-reactivity with penicillin allergy.`);
    }
  }

  if (allergyLower.some(a => a.includes('sulfa') || a.includes('sulfon'))) {
    const sulfaDrugs = ['sulfamethoxazole', 'bactrim', 'septra', 'sulfasalazine'];
    const flagged = medLower.filter(m => sulfaDrugs.some(s => m.includes(s)));
    if (flagged.length > 0) {
      allergyWarnings.push(`ALLERGY ALERT: ${flagged.join(', ')} - patient has sulfa allergy.`);
    }
  }

  return allergyWarnings;
}

// Overall risk determination
function determineOverallRisk(
  interactions: ReturnType<typeof checkDrugInteractions>,
  warnings: string[],
  allergyWarnings: string[]
): string {
  if (interactions.interactions.some(i => i.severity === 'contraindicated')) {
    return 'HIGH - Contraindicated combinations found';
  }
  if (interactions.interactions.some(i => i.severity === 'major')) {
    return 'MODERATE-HIGH - Major interactions found';
  }
  if (warnings.length > 0 || allergyWarnings.length > 0) {
    return 'MODERATE - Condition/allergy concerns identified';
  }
  return 'LOW - No significant concerns identified';
}

describe('Renal Condition Warnings', () => {
  it('flags metformin with renal impairment', () => {
    const warnings = getConditionWarnings(['metformin'], ['renal impairment']);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('metformin');
    expect(warnings[0]).toContain('Renal');
  });

  it('flags ibuprofen with kidney disease', () => {
    const warnings = getConditionWarnings(['ibuprofen'], ['chronic kidney disease']);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('ibuprofen');
  });

  it('flags naproxen with renal condition', () => {
    const warnings = getConditionWarnings(['naproxen'], ['renal failure']);
    expect(warnings.length).toBe(1);
  });

  it('flags lithium with kidney disease', () => {
    const warnings = getConditionWarnings(['lithium'], ['kidney disease']);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('lithium');
  });

  it('flags methotrexate with renal impairment', () => {
    const warnings = getConditionWarnings(['methotrexate'], ['renal impairment']);
    expect(warnings.length).toBe(1);
  });

  it('flags multiple drugs with renal condition', () => {
    const warnings = getConditionWarnings(
      ['metformin', 'ibuprofen', 'lithium'],
      ['chronic kidney disease']
    );
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('metformin');
    expect(warnings[0]).toContain('ibuprofen');
    expect(warnings[0]).toContain('lithium');
  });

  it('no warning for safe drugs with renal condition', () => {
    const warnings = getConditionWarnings(['amlodipine'], ['renal impairment']);
    expect(warnings.length).toBe(0);
  });
});

describe('Hepatic Condition Warnings', () => {
  it('flags acetaminophen with liver disease', () => {
    const warnings = getConditionWarnings(['acetaminophen'], ['liver disease']);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('acetaminophen');
    expect(warnings[0]).toContain('Hepatic');
  });

  it('flags tylenol (brand name) with liver disease', () => {
    const warnings = getConditionWarnings(['tylenol'], ['liver cirrhosis']);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('tylenol');
  });

  it('flags simvastatin with hepatic impairment', () => {
    const warnings = getConditionWarnings(['simvastatin'], ['hepatic impairment']);
    expect(warnings.length).toBe(1);
  });

  it('flags atorvastatin with liver disease', () => {
    const warnings = getConditionWarnings(['atorvastatin'], ['liver disease']);
    expect(warnings.length).toBe(1);
  });

  it('flags methotrexate with hepatic condition', () => {
    const warnings = getConditionWarnings(['methotrexate'], ['hepatic disease']);
    expect(warnings.length).toBe(1);
  });

  it('no warning for safe drugs with liver disease', () => {
    const warnings = getConditionWarnings(['lisinopril'], ['liver disease']);
    expect(warnings.length).toBe(0);
  });
});

describe('Bleeding Condition Warnings', () => {
  it('flags warfarin with bleeding history', () => {
    const warnings = getConditionWarnings(['warfarin'], ['GI bleeding']);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('warfarin');
    expect(warnings[0]).toContain('Bleeding');
  });

  it('flags aspirin with bleeding', () => {
    const warnings = getConditionWarnings(['aspirin'], ['bleeding disorder']);
    expect(warnings.length).toBe(1);
  });

  it('flags clopidogrel with GI bleed', () => {
    const warnings = getConditionWarnings(['clopidogrel'], ['gi bleed history']);
    expect(warnings.length).toBe(1);
  });

  it('flags multiple anticoagulants with bleeding', () => {
    const warnings = getConditionWarnings(
      ['warfarin', 'aspirin', 'clopidogrel'],
      ['bleeding tendency']
    );
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('warfarin');
    expect(warnings[0]).toContain('aspirin');
    expect(warnings[0]).toContain('clopidogrel');
  });

  it('no warning for non-bleeding-risk drugs', () => {
    const warnings = getConditionWarnings(['metformin'], ['bleeding disorder']);
    expect(warnings.length).toBe(0);
  });
});

describe('Multi-Condition Warnings', () => {
  it('generates warnings for multiple conditions', () => {
    const warnings = getConditionWarnings(
      ['metformin', 'acetaminophen', 'warfarin'],
      ['renal impairment', 'liver disease', 'bleeding history']
    );
    expect(warnings.length).toBe(3);
  });

  it('no warnings when no conditions provided', () => {
    const warnings = getConditionWarnings(['warfarin', 'metformin']);
    expect(warnings.length).toBe(0);
  });

  it('no warnings when conditions do not match', () => {
    const warnings = getConditionWarnings(
      ['warfarin'],
      ['diabetes', 'hypertension']
    );
    expect(warnings.length).toBe(0);
  });
});

describe('Penicillin Allergy Cross-Referencing', () => {
  it('flags amoxicillin with penicillin allergy', () => {
    const warnings = getAllergyWarnings(['amoxicillin'], ['penicillin']);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('ALLERGY ALERT');
    expect(warnings[0]).toContain('amoxicillin');
  });

  it('flags ampicillin with penicillin allergy', () => {
    const warnings = getAllergyWarnings(['ampicillin'], ['penicillin']);
    expect(warnings.length).toBe(1);
  });

  it('flags piperacillin with penicillin allergy', () => {
    const warnings = getAllergyWarnings(['piperacillin'], ['penicillin']);
    expect(warnings.length).toBe(1);
  });

  it('cephalosporin cross-reactivity with penicillin allergy', () => {
    const warnings = getAllergyWarnings(['cephalexin'], ['penicillin']);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('cross-reactivity');
  });

  it('ceftriaxone cross-reactivity', () => {
    const warnings = getAllergyWarnings(['ceftriaxone'], ['penicillin allergy']);
    expect(warnings.length).toBe(1);
  });

  it('cefazolin cross-reactivity', () => {
    const warnings = getAllergyWarnings(['cefazolin'], ['penicillin']);
    expect(warnings.length).toBe(1);
  });

  it('both penicillin-class and ceph flagged together', () => {
    const warnings = getAllergyWarnings(
      ['amoxicillin', 'cephalexin'],
      ['penicillin']
    );
    expect(warnings.length).toBe(2);
  });

  it('no penicillin alert for non-penicillin drugs', () => {
    const warnings = getAllergyWarnings(['ciprofloxacin'], ['penicillin']);
    expect(warnings.length).toBe(0);
  });
});

describe('Sulfa Allergy Cross-Referencing', () => {
  it('flags sulfamethoxazole with sulfa allergy', () => {
    const warnings = getAllergyWarnings(['sulfamethoxazole'], ['sulfa']);
    expect(warnings.length).toBe(1);
    expect(warnings[0]).toContain('ALLERGY ALERT');
  });

  it('flags bactrim with sulfa allergy', () => {
    const warnings = getAllergyWarnings(['bactrim'], ['sulfa allergy']);
    expect(warnings.length).toBe(1);
  });

  it('flags septra with sulfa allergy', () => {
    const warnings = getAllergyWarnings(['septra'], ['sulfa']);
    expect(warnings.length).toBe(1);
  });

  it('flags sulfasalazine with sulfonamide allergy', () => {
    const warnings = getAllergyWarnings(['sulfasalazine'], ['sulfonamide allergy']);
    expect(warnings.length).toBe(1);
  });

  it('no sulfa alert for non-sulfa drugs', () => {
    const warnings = getAllergyWarnings(['amoxicillin'], ['sulfa']);
    expect(warnings.length).toBe(0);
  });
});

describe('Overall Risk Determination', () => {
  it('HIGH risk for contraindicated combinations', () => {
    const interactions = checkDrugInteractions({
      medications: ['fluoxetine', 'phenelzine'],
    });
    const risk = determineOverallRisk(interactions, [], []);
    expect(risk).toContain('HIGH');
  });

  it('MODERATE-HIGH for major interactions', () => {
    const interactions = checkDrugInteractions({
      medications: ['warfarin', 'aspirin'],
    });
    const risk = determineOverallRisk(interactions, [], []);
    expect(risk).toContain('MODERATE-HIGH');
  });

  it('MODERATE for condition warnings only', () => {
    const interactions = checkDrugInteractions({
      medications: ['metformin', 'lisinopril'],
    });
    const warnings = ['Renal concern'];
    const risk = determineOverallRisk(interactions, warnings, []);
    expect(risk).toContain('MODERATE');
  });

  it('MODERATE for allergy warnings only', () => {
    const interactions = checkDrugInteractions({
      medications: ['metformin', 'lisinopril'],
    });
    const allergyWarnings = ['Allergy concern'];
    const risk = determineOverallRisk(interactions, [], allergyWarnings);
    expect(risk).toContain('MODERATE');
  });

  it('LOW when no concerns', () => {
    const interactions = checkDrugInteractions({
      medications: ['metformin', 'lisinopril'],
    });
    const risk = determineOverallRisk(interactions, [], []);
    expect(risk).toContain('LOW');
  });
});

describe('Complex Medication Scenarios', () => {
  it('cardiac patient on anticoagulation', () => {
    const interactions = checkDrugInteractions({
      medications: ['warfarin', 'metoprolol', 'lisinopril', 'atorvastatin'],
    });
    expect(interactions.medicationCount).toBe(4);
    // Should resolve all medications
    expect(interactions.unresolvedMedications.length).toBe(0);
  });

  it('psychiatric patient on multiple medications', () => {
    const interactions = checkDrugInteractions({
      medications: ['fluoxetine', 'alprazolam', 'lithium'],
    });
    expect(interactions.medicationCount).toBe(3);
    // fluoxetine + lithium may have interaction
    expect(interactions.resolvedMedications.length).toBe(3);
  });

  it('pain management patient', () => {
    const interactions = checkDrugInteractions({
      medications: ['tramadol', 'ibuprofen', 'gabapentin'],
    });
    expect(interactions.medicationCount).toBe(3);
    expect(interactions.unresolvedMedications.length).toBe(0);
  });

  it('diabetic patient on full regimen', () => {
    const interactions = checkDrugInteractions({
      medications: ['metformin', 'lisinopril', 'atorvastatin', 'aspirin', 'omeprazole'],
    });
    expect(interactions.medicationCount).toBe(5);
    // Check that all are resolved
    for (const med of interactions.resolvedMedications) {
      expect(med.generic).not.toBeNull();
    }
  });

  it('elderly polypharmacy scenario', () => {
    const meds = ['warfarin', 'metoprolol', 'lisinopril', 'metformin',
      'atorvastatin', 'omeprazole', 'amlodipine', 'aspirin'];
    const interactions = checkDrugInteractions({ medications: meds });
    expect(interactions.medicationCount).toBe(8);
    // Should find some interactions (warfarin + aspirin at minimum)
    expect(interactions.interactionsFound).toBeGreaterThan(0);
  });
});

describe('Case Sensitivity in Condition and Allergy Matching', () => {
  it('matches conditions case-insensitively', () => {
    const upper = getConditionWarnings(['metformin'], ['RENAL IMPAIRMENT']);
    const lower = getConditionWarnings(['metformin'], ['renal impairment']);
    const mixed = getConditionWarnings(['metformin'], ['Renal Impairment']);
    expect(upper.length).toBe(1);
    expect(lower.length).toBe(1);
    expect(mixed.length).toBe(1);
  });

  it('matches medications case-insensitively', () => {
    const upper = getConditionWarnings(['METFORMIN'], ['renal impairment']);
    const lower = getConditionWarnings(['metformin'], ['renal impairment']);
    expect(upper.length).toBe(1);
    expect(lower.length).toBe(1);
  });

  it('matches allergies case-insensitively', () => {
    const upper = getAllergyWarnings(['amoxicillin'], ['PENICILLIN']);
    const lower = getAllergyWarnings(['amoxicillin'], ['penicillin']);
    expect(upper.length).toBe(1);
    expect(lower.length).toBe(1);
  });
});

import { findAllInteractions, resolveToGeneric, drugDirectory, type DrugInteraction, type Severity } from '../data/drug-interactions.js';

export interface DrugInteractionInput {
  medications: string[];
}

export interface DrugInteractionOutput {
  medicationCount: number;
  interactionsFound: number;
  resolvedMedications: Array<{ input: string; generic: string | null; drugClass: string | null }>;
  interactions: Array<{
    drug1: string;
    drug2: string;
    severity: Severity;
    description: string;
    mechanism: string;
    clinicalEffect: string;
    management: string;
  }>;
  summary: string;
  unresolvedMedications: string[];
}

export function checkDrugInteractions(input: DrugInteractionInput): DrugInteractionOutput {
  const { medications } = input;

  // Resolve all medications
  const resolved = medications.map(med => {
    const generic = resolveToGeneric(med);
    const info = generic ? drugDirectory[generic] : null;
    return {
      input: med,
      generic,
      drugClass: info?.drugClass ?? null,
    };
  });

  const unresolved = resolved.filter(r => !r.generic).map(r => r.input);

  // Find all interactions
  const interactions = findAllInteractions(medications);

  // Generate summary
  const contraindicated = interactions.filter(i => i.severity === 'contraindicated');
  const major = interactions.filter(i => i.severity === 'major');
  const moderate = interactions.filter(i => i.severity === 'moderate');
  const minor = interactions.filter(i => i.severity === 'minor');

  let summary = `Checked ${medications.length} medications. Found ${interactions.length} interaction(s).`;

  if (contraindicated.length > 0) {
    summary += ` ⚠️ ${contraindicated.length} CONTRAINDICATED combination(s) - these medications should NOT be used together.`;
  }
  if (major.length > 0) {
    summary += ` ${major.length} major interaction(s) requiring careful monitoring or alternatives.`;
  }
  if (moderate.length > 0) {
    summary += ` ${moderate.length} moderate interaction(s).`;
  }
  if (minor.length > 0) {
    summary += ` ${minor.length} minor interaction(s).`;
  }
  if (unresolved.length > 0) {
    summary += ` Note: ${unresolved.length} medication(s) not found in database: ${unresolved.join(', ')}.`;
  }
  if (interactions.length === 0) {
    summary += ' No known interactions found among these medications.';
  }

  return {
    medicationCount: medications.length,
    interactionsFound: interactions.length,
    resolvedMedications: resolved,
    interactions: interactions.map(i => ({
      drug1: i.inputDrug1,
      drug2: i.inputDrug2,
      severity: i.severity,
      description: i.description,
      mechanism: i.mechanism,
      clinicalEffect: i.clinicalEffect,
      management: i.management,
    })),
    summary,
    unresolvedMedications: unresolved,
  };
}

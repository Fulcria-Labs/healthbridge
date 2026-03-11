import { interpretLabResult, interpretLabPanel, labReferences, type LabResult } from '../data/lab-references.js';

export interface SingleLabInput {
  test: string;
  value: number;
}

export interface PanelLabInput {
  results: Array<{ test: string; value: number }>;
}

export function interpretSingleLab(input: SingleLabInput): LabResult | { error: string; availableTests: string[] } {
  const result = interpretLabResult(input.test, input.value);
  if (!result) {
    return {
      error: `Test "${input.test}" not found in reference database.`,
      availableTests: labReferences.map(r => `${r.testCode} (${r.testName})`),
    };
  }
  return result;
}

export function interpretPanel(input: PanelLabInput): {
  results: LabResult[];
  criticalValues: LabResult[];
  abnormalValues: LabResult[];
  summary: string;
} {
  const results = interpretLabPanel(input.results);
  const criticalValues = results.filter(r => r.urgency === 'critical');
  const abnormalValues = results.filter(r => r.urgency === 'abnormal');

  let summary = `Interpreted ${results.length} lab results.`;

  if (criticalValues.length > 0) {
    summary += ` ⚠️ ${criticalValues.length} CRITICAL value(s): ${criticalValues.map(c => `${c.testCode} = ${c.value} ${c.unit}`).join(', ')}.`;
  }

  if (abnormalValues.length > 0) {
    summary += ` ${abnormalValues.length} abnormal value(s): ${abnormalValues.map(a => `${a.testCode} = ${a.value} ${a.unit}`).join(', ')}.`;
  }

  const normalCount = results.filter(r => r.urgency === 'normal').length;
  if (normalCount > 0) {
    summary += ` ${normalCount} normal value(s).`;
  }

  const unresolved = input.results.length - results.length;
  if (unresolved > 0) {
    summary += ` ${unresolved} test(s) not found in reference database.`;
  }

  return { results, criticalValues, abnormalValues, summary };
}

export function listAvailableTests(): Array<{ code: string; name: string; unit: string; category: string; normalRange: string }> {
  return labReferences.map(r => ({
    code: r.testCode,
    name: r.testName,
    unit: r.unit,
    category: r.category,
    normalRange: `${r.normalRange.low}-${r.normalRange.high} ${r.unit}`,
  }));
}

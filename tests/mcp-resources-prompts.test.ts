import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerResources } from '../src/resources';
import { registerPrompts } from '../src/prompts';

/**
 * Comprehensive tests for MCP Resources and Prompts.
 * Tests content structure, data integrity, and prompt generation.
 */

function createMockServer() {
  const resources: Array<{ name: string; uri: string; metadata?: any; callback: Function }> = [];
  const prompts: Array<{ name: string; description?: string; args?: any; callback: Function }> = [];

  return {
    resources,
    prompts,
    resource: vi.fn((...args: any[]) => {
      if (args.length === 4) {
        resources.push({ name: args[0], uri: args[1], metadata: args[2], callback: args[3] });
      } else {
        resources.push({ name: args[0], uri: args[1], callback: args[2] });
      }
    }),
    prompt: vi.fn((...args: any[]) => {
      if (args.length === 4) {
        prompts.push({ name: args[0], description: args[1], args: args[2], callback: args[3] });
      } else if (args.length === 3) {
        prompts.push({ name: args[0], description: args[1], callback: args[2] });
      } else {
        prompts.push({ name: args[0], callback: args[1] });
      }
    }),
  };
}

describe('MCP Resources - Drug Formulary', () => {
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    mockServer = createMockServer();
    registerResources(mockServer as any);
  });

  it('formulary resource exists', () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary');
    expect(formulary).toBeDefined();
  });

  it('formulary returns valid JSON with correct title', async () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary')!;
    const result = await formulary.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.title).toBe('HealthBridge Drug Formulary');
    expect(data.version).toBe('1.0.0');
  });

  it('formulary contains medication categories', async () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary')!;
    const result = await formulary.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.categories.length).toBeGreaterThan(0);
    const categoryNames = data.categories.map((c: any) => c.name);
    expect(categoryNames).toContain('Cardiovascular');
    expect(categoryNames).toContain('Analgesics / NSAIDs');
    expect(categoryNames).toContain('Psychiatric / CNS');
    expect(categoryNames).toContain('Antimicrobials');
    expect(categoryNames).toContain('Endocrine / Metabolic');
    expect(categoryNames).toContain('Immunosuppressants');
  });

  it('formulary categories contain medications', async () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary')!;
    const result = await formulary.callback();
    const data = JSON.parse(result.contents[0].text);
    for (const category of data.categories) {
      expect(category.medications.length).toBeGreaterThan(0);
    }
  });

  it('formulary includes interaction coverage info', async () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary')!;
    const result = await formulary.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.interactionCoverage).toBeDefined();
    expect(data.interactionCoverage.totalPairs).toBeGreaterThan(0);
    expect(data.interactionCoverage.severityDistribution).toBeDefined();
  });

  it('formulary mentions brand name support', async () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary')!;
    const result = await formulary.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.brandNameSupport).toBeDefined();
    expect(data.brandNameSupport).toContain('brand');
  });

  it('formulary has correct URI and mime type', async () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary')!;
    expect(formulary.uri).toBe('healthbridge://formulary/overview');
    const result = await formulary.callback();
    expect(result.contents[0].uri).toBe('healthbridge://formulary/overview');
    expect(result.contents[0].mimeType).toBe('application/json');
  });
});

describe('MCP Resources - Anticoagulation Guideline', () => {
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    mockServer = createMockServer();
    registerResources(mockServer as any);
  });

  it('anticoagulation guideline exists', () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-anticoagulation');
    expect(guideline).toBeDefined();
  });

  it('guideline contains workflow steps', async () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-anticoagulation')!;
    const result = await guideline.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.workflow).toBeDefined();
    expect(data.workflow.length).toBeGreaterThan(0);
    expect(data.workflow[0].step).toBe(1);
  });

  it('guideline contains decision tree', async () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-anticoagulation')!;
    const result = await guideline.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.decisionTree).toBeDefined();
  });

  it('guideline contains DOAC dosing information', async () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-anticoagulation')!;
    const result = await guideline.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.DOACDosing).toBeDefined();
    expect(data.DOACDosing.apixaban).toBeDefined();
    expect(data.DOACDosing.rivaroxaban).toBeDefined();
    expect(data.DOACDosing.dabigatran).toBeDefined();
  });
});

describe('MCP Resources - Sepsis Guideline', () => {
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    mockServer = createMockServer();
    registerResources(mockServer as any);
  });

  it('sepsis guideline exists', () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-sepsis');
    expect(guideline).toBeDefined();
  });

  it('guideline contains hour-1 bundle', async () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-sepsis')!;
    const result = await guideline.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.hour1Bundle).toBeDefined();
    expect(data.hour1Bundle.length).toBeGreaterThan(0);
  });

  it('guideline contains key labs list', async () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-sepsis')!;
    const result = await guideline.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.keyLabs).toBeDefined();
    expect(data.keyLabs).toContain('lactate');
    expect(data.keyLabs).toContain('WBC');
  });

  it('guideline defines sepsis and septic shock', async () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-sepsis')!;
    const result = await guideline.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.sepsisDefinition).toBeDefined();
    expect(data.septicShock).toBeDefined();
  });
});

describe('MCP Resources - Lab Reference Ranges', () => {
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    mockServer = createMockServer();
    registerResources(mockServer as any);
  });

  it('lab reference ranges resource exists', () => {
    const labRef = mockServer.resources.find(r => r.name === 'lab-reference-ranges');
    expect(labRef).toBeDefined();
  });

  it('contains test categories', async () => {
    const labRef = mockServer.resources.find(r => r.name === 'lab-reference-ranges')!;
    const result = await labRef.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.categories).toBeDefined();
    expect(data.categories['Complete Blood Count (CBC)']).toBeDefined();
    expect(data.categories['Basic Metabolic Panel (BMP)']).toBeDefined();
  });

  it('reports total test count', async () => {
    const labRef = mockServer.resources.find(r => r.name === 'lab-reference-ranges')!;
    const result = await labRef.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.totalTests).toBeGreaterThan(0);
  });

  it('includes critical values for key tests', async () => {
    const labRef = mockServer.resources.find(r => r.name === 'lab-reference-ranges')!;
    const result = await labRef.callback();
    const data = JSON.parse(result.contents[0].text);
    const bmp = data.categories['Basic Metabolic Panel (BMP)'];
    expect(bmp.criticalValues).toBeDefined();
    expect(bmp.criticalValues.potassium).toBeDefined();
  });
});

describe('MCP Resources - Risk Score Matrix', () => {
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    mockServer = createMockServer();
    registerResources(mockServer as any);
  });

  it('risk score matrix resource exists', () => {
    const matrix = mockServer.resources.find(r => r.name === 'risk-score-matrix');
    expect(matrix).toBeDefined();
  });

  it('contains score decision mappings', async () => {
    const matrix = mockServer.resources.find(r => r.name === 'risk-score-matrix')!;
    const result = await matrix.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.scores).toBeDefined();
    expect(data.scores['CHA2DS2-VASc']).toBeDefined();
    expect(data.scores['HEART']).toBeDefined();
    expect(data.scores['NEWS2']).toBeDefined();
  });

  it('score entries have pairsWell field', async () => {
    const matrix = mockServer.resources.find(r => r.name === 'risk-score-matrix')!;
    const result = await matrix.callback();
    const data = JSON.parse(result.contents[0].text);
    for (const [, score] of Object.entries(data.scores) as Array<[string, any]>) {
      if (score.pairsWell) {
        expect(Array.isArray(score.pairsWell)).toBeTruthy();
      }
    }
  });
});

describe('MCP Prompts - Registration', () => {
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    mockServer = createMockServer();
    registerPrompts(mockServer as any);
  });

  it('registers 4 prompts', () => {
    expect(mockServer.prompt).toHaveBeenCalledTimes(4);
  });

  it('registers preoperative assessment prompt', () => {
    const prompt = mockServer.prompts.find(p => p.name === 'preoperative_assessment');
    expect(prompt).toBeDefined();
    expect(prompt!.description).toContain('pre-operative');
  });

  it('registers ED triage prompt', () => {
    const prompt = mockServer.prompts.find(p => p.name === 'ed_triage');
    expect(prompt).toBeDefined();
    expect(prompt!.description).toContain('Emergency');
  });

  it('registers discharge med reconciliation prompt', () => {
    const prompt = mockServer.prompts.find(p => p.name === 'discharge_med_reconciliation');
    expect(prompt).toBeDefined();
    expect(prompt!.description).toContain('reconciliation');
  });

  it('registers chest pain evaluation prompt', () => {
    const prompt = mockServer.prompts.find(p => p.name === 'chest_pain_evaluation');
    expect(prompt).toBeDefined();
    expect(prompt!.description).toContain('chest pain');
  });
});

describe('MCP Prompts - Callback Outputs', () => {
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    mockServer = createMockServer();
    registerPrompts(mockServer as any);
  });

  it('preoperative assessment generates structured message', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'preoperative_assessment')!;
    const result = await prompt.callback({
      medications: 'warfarin, metformin, lisinopril',
      age: '72',
      conditions: 'hypertension, diabetes',
    });
    expect(result.messages.length).toBe(1);
    expect(result.messages[0].role).toBe('user');
    const text = result.messages[0].content.text;
    expect(text).toContain('72');
    expect(text).toContain('warfarin');
    expect(text).toContain('Medication Review');
    expect(text).toContain('Cardiac Risk');
    expect(text).toContain('Renal Function');
  });

  it('preoperative assessment works without conditions', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'preoperative_assessment')!;
    const result = await prompt.callback({
      medications: 'aspirin',
      age: '55',
    });
    expect(result.messages[0].content.text).toContain('55');
    expect(result.messages[0].content.text).not.toContain('Medical conditions');
  });

  it('ED triage generates structured message with vitals', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'ed_triage')!;
    const result = await prompt.callback({
      respiratory_rate: '22',
      spo2: '94',
      systolic_bp: '100',
      heart_rate: '110',
      temperature: '38.5',
      consciousness: 'alert',
      chief_complaint: 'chest pain',
    });
    const text = result.messages[0].content.text;
    expect(text).toContain('chest pain');
    expect(text).toContain('NEWS2');
    expect(text).toContain('qSOFA');
    expect(text).toContain('Triage Decision');
  });

  it('ED triage works without optional parameters', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'ed_triage')!;
    const result = await prompt.callback({
      respiratory_rate: '18',
      spo2: '98',
      systolic_bp: '120',
      heart_rate: '80',
      temperature: '37.0',
      consciousness: 'alert',
    });
    expect(result.messages[0].content.text).not.toContain('undefined');
  });

  it('discharge med reconciliation generates structured message', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'discharge_med_reconciliation')!;
    const result = await prompt.callback({
      admission_meds: 'metoprolol, lisinopril',
      discharge_meds: 'metoprolol, lisinopril, warfarin',
      allergies: 'penicillin',
      conditions: 'atrial fibrillation',
    });
    const text = result.messages[0].content.text;
    expect(text).toContain('metoprolol');
    expect(text).toContain('warfarin');
    expect(text).toContain('penicillin');
    expect(text).toContain('Interaction Check');
    expect(text).toContain('Changed Medications');
  });

  it('discharge reconciliation works without allergies/conditions', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'discharge_med_reconciliation')!;
    const result = await prompt.callback({
      admission_meds: 'metformin',
      discharge_meds: 'metformin, insulin',
    });
    const text = result.messages[0].content.text;
    expect(text).toContain('No known allergies');
  });

  it('chest pain evaluation generates structured message', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'chest_pain_evaluation')!;
    const result = await prompt.callback({
      age: '65',
      history_suspicion: 'moderately_suspicious',
      ecg: 'non_specific_changes',
      risk_factor_count: '3',
      troponin_level: '0.08',
      medications: 'aspirin, atorvastatin',
    });
    const text = result.messages[0].content.text;
    expect(text).toContain('65');
    expect(text).toContain('HEART Score');
    expect(text).toContain('ASCVD');
    expect(text).toContain('Troponin');
  });

  it('chest pain evaluation works without troponin or medications', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'chest_pain_evaluation')!;
    const result = await prompt.callback({
      age: '50',
      history_suspicion: 'slightly_suspicious',
      ecg: 'normal',
      risk_factor_count: '1',
    });
    const text = result.messages[0].content.text;
    expect(text).toContain('pending');
  });
});

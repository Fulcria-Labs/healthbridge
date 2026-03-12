import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerResources } from '../src/resources';
import { registerPrompts } from '../src/prompts';

// Mock McpServer for testing resource/prompt registration
function createMockServer() {
  const resources: Array<{ name: string; uri: string; metadata?: any; callback: Function }> = [];
  const prompts: Array<{ name: string; description?: string; args?: any; callback: Function }> = [];

  return {
    resources,
    prompts,
    resource: vi.fn((...args: any[]) => {
      // Handle both 3-arg and 4-arg overloads
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

describe('MCP Resources', () => {
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    mockServer = createMockServer();
    registerResources(mockServer as any);
  });

  it('registers 5 resources', () => {
    expect(mockServer.resource).toHaveBeenCalledTimes(5);
  });

  it('registers drug formulary resource', () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary');
    expect(formulary).toBeDefined();
    expect(formulary!.uri).toBe('healthbridge://formulary/overview');
  });

  it('registers anticoagulation guideline resource', () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-anticoagulation');
    expect(guideline).toBeDefined();
    expect(guideline!.uri).toBe('healthbridge://guidelines/anticoagulation');
  });

  it('registers sepsis guideline resource', () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-sepsis');
    expect(guideline).toBeDefined();
    expect(guideline!.uri).toBe('healthbridge://guidelines/sepsis');
  });

  it('registers lab reference ranges resource', () => {
    const labRef = mockServer.resources.find(r => r.name === 'lab-reference-ranges');
    expect(labRef).toBeDefined();
    expect(labRef!.uri).toBe('healthbridge://labs/reference-ranges');
  });

  it('registers risk score decision matrix resource', () => {
    const matrix = mockServer.resources.find(r => r.name === 'risk-score-matrix');
    expect(matrix).toBeDefined();
    expect(matrix!.uri).toBe('healthbridge://scores/decision-matrix');
  });

  it('formulary callback returns valid JSON with categories', async () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary')!;
    const result = await formulary.callback();
    expect(result.contents).toHaveLength(1);
    const data = JSON.parse(result.contents[0].text);
    expect(data.title).toBe('HealthBridge Drug Formulary');
    expect(data.categories).toBeDefined();
    expect(data.categories.length).toBeGreaterThan(5);
    expect(data.interactionCoverage).toBeDefined();
  });

  it('anticoagulation guideline contains workflow steps', async () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-anticoagulation')!;
    const result = await guideline.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.workflow).toBeDefined();
    expect(data.workflow.length).toBeGreaterThanOrEqual(4);
    expect(data.decisionTree).toBeDefined();
    expect(data.DOACDosing).toBeDefined();
  });

  it('sepsis guideline contains hour-1 bundle', async () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-sepsis')!;
    const result = await guideline.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.hour1Bundle).toBeDefined();
    expect(data.hour1Bundle.length).toBe(5);
    expect(data.workflow).toBeDefined();
  });

  it('lab reference ranges covers all categories', async () => {
    const labRef = mockServer.resources.find(r => r.name === 'lab-reference-ranges')!;
    const result = await labRef.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.categories).toBeDefined();
    expect(Object.keys(data.categories).length).toBeGreaterThanOrEqual(8);
    expect(data.totalTests).toBe(28);
  });

  it('risk score matrix maps scores to clinical decisions', async () => {
    const matrix = mockServer.resources.find(r => r.name === 'risk-score-matrix')!;
    const result = await matrix.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.scores).toBeDefined();
    expect(data.scores['CHA2DS2-VASc']).toBeDefined();
    expect(data.scores['HAS-BLED']).toBeDefined();
    expect(data.scores['NEWS2']).toBeDefined();
  });

  it('all resources have correct mimeType', async () => {
    for (const resource of mockServer.resources) {
      const result = await resource.callback();
      expect(result.contents[0].mimeType).toBe('application/json');
    }
  });

  it('all resources have metadata with description', () => {
    for (const resource of mockServer.resources) {
      expect(resource.metadata).toBeDefined();
      expect(resource.metadata.description).toBeTruthy();
    }
  });
});

describe('MCP Prompts', () => {
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
    expect(prompt!.description).toContain('triage');
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

  it('preoperative assessment generates correct prompt structure', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'preoperative_assessment')!;
    const result = await prompt.callback({
      medications: 'warfarin, metoprolol, metformin',
      age: '72',
      conditions: 'atrial fibrillation, diabetes',
    });
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe('user');
    expect(result.messages[0].content.text).toContain('72-year-old');
    expect(result.messages[0].content.text).toContain('warfarin');
    expect(result.messages[0].content.text).toContain('medication_review');
  });

  it('ED triage generates prompt with vitals', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'ed_triage')!;
    const result = await prompt.callback({
      respiratory_rate: '22',
      spo2: '94',
      systolic_bp: '110',
      heart_rate: '95',
      temperature: '38.5',
      consciousness: 'alert',
      chief_complaint: 'chest pain',
    });
    expect(result.messages[0].content.text).toContain('NEWS2');
    expect(result.messages[0].content.text).toContain('qSOFA');
    expect(result.messages[0].content.text).toContain('chest pain');
  });

  it('discharge med reconciliation includes admission and discharge meds', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'discharge_med_reconciliation')!;
    const result = await prompt.callback({
      admission_meds: 'warfarin, lisinopril',
      discharge_meds: 'apixaban, lisinopril, amiodarone',
      allergies: 'penicillin',
      conditions: 'atrial fibrillation',
    });
    expect(result.messages[0].content.text).toContain('warfarin');
    expect(result.messages[0].content.text).toContain('apixaban');
    expect(result.messages[0].content.text).toContain('penicillin');
    expect(result.messages[0].content.text).toContain('medication_review');
  });

  it('chest pain evaluation includes HEART score workflow', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'chest_pain_evaluation')!;
    const result = await prompt.callback({
      age: '58',
      history_suspicion: 'moderately_suspicious',
      ecg: 'non_specific_changes',
      risk_factor_count: '3',
      troponin_level: '0.15',
    });
    expect(result.messages[0].content.text).toContain('HEART');
    expect(result.messages[0].content.text).toContain('58-year-old');
    expect(result.messages[0].content.text).toContain('troponin');
    expect(result.messages[0].content.text).toContain('ASCVD');
  });

  it('chest pain evaluation works without troponin', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'chest_pain_evaluation')!;
    const result = await prompt.callback({
      age: '45',
      history_suspicion: 'slightly_suspicious',
      ecg: 'normal',
      risk_factor_count: '1',
    });
    expect(result.messages[0].content.text).toContain('pending');
    expect(result.messages[0].content.text).toContain('HEART');
  });

  it('ED triage works without optional fields', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'ed_triage')!;
    const result = await prompt.callback({
      respiratory_rate: '18',
      spo2: '97',
      systolic_bp: '120',
      heart_rate: '80',
      temperature: '37.0',
      consciousness: 'alert',
    });
    expect(result.messages[0].content.text).toContain('NEWS2');
  });
});

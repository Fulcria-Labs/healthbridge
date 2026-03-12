import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerResources } from '../src/resources';
import { registerPrompts } from '../src/prompts';

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

describe('MCP Resource Content Validation', () => {
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    mockServer = createMockServer();
    registerResources(mockServer as any);
  });

  it('formulary contains all expected medication categories', async () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary')!;
    const result = await formulary.callback();
    const data = JSON.parse(result.contents[0].text);
    const categoryNames = data.categories.map((c: any) => c.name);
    expect(categoryNames).toContain('Cardiovascular');
    expect(categoryNames).toContain('Analgesics / NSAIDs');
    expect(categoryNames).toContain('Psychiatric / CNS');
    expect(categoryNames).toContain('Antimicrobials');
    expect(categoryNames).toContain('Endocrine / Metabolic');
    expect(categoryNames).toContain('Immunosuppressants');
    expect(categoryNames).toContain('Other');
  });

  it('formulary lists warfarin in cardiovascular category', async () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary')!;
    const result = await formulary.callback();
    const data = JSON.parse(result.contents[0].text);
    const cardio = data.categories.find((c: any) => c.name === 'Cardiovascular');
    expect(cardio.medications).toContain('warfarin');
    expect(cardio.medications).toContain('aspirin');
  });

  it('formulary has brandNameSupport info', async () => {
    const formulary = mockServer.resources.find(r => r.name === 'drug-formulary')!;
    const result = await formulary.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.brandNameSupport).toBeTruthy();
    expect(data.brandNameSupport).toContain('Coumadin');
  });

  it('anticoagulation guideline has DOAC dosing information', async () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-anticoagulation')!;
    const result = await guideline.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.DOACDosing.apixaban).toBeDefined();
    expect(data.DOACDosing.rivaroxaban).toBeDefined();
    expect(data.DOACDosing.dabigatran).toBeDefined();
    expect(data.DOACDosing.apixaban.standard).toContain('5mg');
  });

  it('anticoagulation guideline has contraindicated combinations', async () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-anticoagulation')!;
    const result = await guideline.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.contraindicatedCombinations.length).toBeGreaterThanOrEqual(3);
  });

  it('sepsis guideline has sepsis definition', async () => {
    const guideline = mockServer.resources.find(r => r.name === 'guideline-sepsis')!;
    const result = await guideline.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.sepsisDefinition).toBeTruthy();
    expect(data.septicShock).toBeTruthy();
    expect(data.keyLabs).toContain('lactate');
    expect(data.keyLabs).toContain('procalcitonin');
  });

  it('lab reference ranges lists critical values for key tests', async () => {
    const labRef = mockServer.resources.find(r => r.name === 'lab-reference-ranges')!;
    const result = await labRef.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.categories['Basic Metabolic Panel (BMP)'].criticalValues.potassium).toBeDefined();
    expect(data.categories['Basic Metabolic Panel (BMP)'].criticalValues.sodium).toBeDefined();
    expect(data.categories['Basic Metabolic Panel (BMP)'].criticalValues.glucose).toBeDefined();
  });

  it('risk score matrix has pairsWell relationships', async () => {
    const matrix = mockServer.resources.find(r => r.name === 'risk-score-matrix')!;
    const result = await matrix.callback();
    const data = JSON.parse(result.contents[0].text);
    expect(data.scores['CHA2DS2-VASc'].pairsWell).toContain('HAS-BLED');
    expect(data.scores['CHA2DS2-VASc'].pairsWell).toContain('eGFR');
    expect(data.scores['HEART'].pairsWell).toContain('TIMI');
  });

  it('all resources return valid JSON', async () => {
    for (const resource of mockServer.resources) {
      const result = await resource.callback();
      expect(() => JSON.parse(result.contents[0].text)).not.toThrow();
    }
  });

  it('all resources have correct URI scheme', () => {
    for (const resource of mockServer.resources) {
      expect(resource.uri).toMatch(/^healthbridge:\/\//);
    }
  });
});

describe('MCP Prompt Content Validation', () => {
  let mockServer: ReturnType<typeof createMockServer>;

  beforeEach(() => {
    mockServer = createMockServer();
    registerPrompts(mockServer as any);
  });

  it('preoperative assessment mentions medication_review tool', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'preoperative_assessment')!;
    const result = await prompt.callback({
      medications: 'metformin',
      age: '65',
    });
    expect(result.messages[0].content.text).toContain('medication_review');
    expect(result.messages[0].content.text).toContain('calculate_risk_score');
  });

  it('preoperative assessment includes conditions when provided', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'preoperative_assessment')!;
    const result = await prompt.callback({
      medications: 'warfarin, metformin',
      age: '70',
      conditions: 'atrial fibrillation, diabetes, hypertension',
    });
    expect(result.messages[0].content.text).toContain('atrial fibrillation');
    expect(result.messages[0].content.text).toContain('diabetes');
  });

  it('preoperative assessment omits conditions when not provided', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'preoperative_assessment')!;
    const result = await prompt.callback({
      medications: 'aspirin',
      age: '45',
    });
    expect(result.messages[0].content.text).toContain('45-year-old');
    expect(result.messages[0].content.text).toContain('aspirin');
  });

  it('ED triage includes medications when provided', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'ed_triage')!;
    const result = await prompt.callback({
      respiratory_rate: '20',
      spo2: '96',
      systolic_bp: '130',
      heart_rate: '88',
      temperature: '37.5',
      consciousness: 'alert',
      medications: 'warfarin, metformin',
    });
    expect(result.messages[0].content.text).toContain('warfarin');
    expect(result.messages[0].content.text).toContain('medication_review');
  });

  it('discharge med reconciliation handles no allergies', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'discharge_med_reconciliation')!;
    const result = await prompt.callback({
      admission_meds: 'aspirin, metoprolol',
      discharge_meds: 'aspirin, metoprolol, atorvastatin',
    });
    expect(result.messages[0].content.text).toContain('No known allergies');
  });

  it('discharge med reconciliation includes conditions when provided', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'discharge_med_reconciliation')!;
    const result = await prompt.callback({
      admission_meds: 'lisinopril',
      discharge_meds: 'lisinopril, furosemide',
      conditions: 'heart failure',
    });
    expect(result.messages[0].content.text).toContain('heart failure');
  });

  it('chest pain evaluation includes medication review when medications provided', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'chest_pain_evaluation')!;
    const result = await prompt.callback({
      age: '62',
      history_suspicion: 'highly_suspicious',
      ecg: 'significant_st_deviation',
      risk_factor_count: '4',
      troponin_level: '0.5',
      medications: 'aspirin, metoprolol, atorvastatin',
    });
    expect(result.messages[0].content.text).toContain('aspirin');
    expect(result.messages[0].content.text).toContain('medication_review');
    expect(result.messages[0].content.text).toContain('HEART');
    expect(result.messages[0].content.text).toContain('0.5');
  });

  it('chest pain evaluation without medications omits medication section', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'chest_pain_evaluation')!;
    const result = await prompt.callback({
      age: '50',
      history_suspicion: 'slightly_suspicious',
      ecg: 'normal',
      risk_factor_count: '0',
    });
    expect(result.messages[0].content.text).toContain('pending');
  });

  it('ED triage mentions all clinical tools', async () => {
    const prompt = mockServer.prompts.find(p => p.name === 'ed_triage')!;
    const result = await prompt.callback({
      respiratory_rate: '30',
      spo2: '88',
      systolic_bp: '80',
      heart_rate: '130',
      temperature: '39.5',
      consciousness: 'confusion',
      chief_complaint: 'shortness of breath and fever',
    });
    expect(result.messages[0].content.text).toContain('NEWS2');
    expect(result.messages[0].content.text).toContain('qSOFA');
    expect(result.messages[0].content.text).toContain('shortness of breath');
    expect(result.messages[0].content.text).toContain('calculate_risk_score');
  });

  it('all prompts return exactly one user message', async () => {
    const testParams: Record<string, any> = {
      preoperative_assessment: { medications: 'aspirin', age: '50' },
      ed_triage: { respiratory_rate: '18', spo2: '97', systolic_bp: '120', heart_rate: '75', temperature: '37.0', consciousness: 'alert' },
      discharge_med_reconciliation: { admission_meds: 'aspirin', discharge_meds: 'aspirin' },
      chest_pain_evaluation: { age: '50', history_suspicion: 'slightly_suspicious', ecg: 'normal', risk_factor_count: '0' },
    };

    for (const prompt of mockServer.prompts) {
      const params = testParams[prompt.name];
      if (params) {
        const result = await prompt.callback(params);
        expect(result.messages).toHaveLength(1);
        expect(result.messages[0].role).toBe('user');
        expect(result.messages[0].content.type).toBe('text');
        expect(result.messages[0].content.text).toBeTruthy();
      }
    }
  });
});

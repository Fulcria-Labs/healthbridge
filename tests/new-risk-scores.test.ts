import { describe, it, expect } from 'vitest';
import {
  calculateNIHSS,
  calculatePHQ9,
  calculateAUDITC,
  calculateGAD7,
} from '../src/data/risk-scores';
import { calculateRiskScore, listAvailableScores } from '../src/tools/risk-score-tool';

describe('NIHSS (NIH Stroke Scale)', () => {
  const baseInput = {
    consciousness: 0 as const, orientation_questions: 0 as const, commands: 0 as const,
    gaze: 0 as const, visual_fields: 0 as const, facial_palsy: 0 as const,
    motor_arm_left: 0 as const, motor_arm_right: 0 as const,
    motor_leg_left: 0 as const, motor_leg_right: 0 as const,
    ataxia: 0 as const, sensory: 0 as const, language: 0 as const,
    dysarthria: 0 as const, neglect: 0 as const,
  };

  it('calculates score 0 for no deficits', () => {
    const result = calculateNIHSS(baseInput);
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('No stroke symptoms');
    expect(result.scoreName).toBe('NIH Stroke Scale');
  });

  it('calculates minor stroke (score 1-4)', () => {
    const result = calculateNIHSS({ ...baseInput, facial_palsy: 1, dysarthria: 1 });
    expect(result.score).toBe(2);
    expect(result.riskLevel).toBe('Minor stroke');
  });

  it('calculates moderate stroke (score 5-15)', () => {
    const result = calculateNIHSS({
      ...baseInput, consciousness: 1, motor_arm_left: 3, motor_leg_left: 2, language: 1,
    });
    expect(result.score).toBe(7);
    expect(result.riskLevel).toBe('Moderate stroke');
  });

  it('calculates moderate-severe stroke (score 16-20)', () => {
    const result = calculateNIHSS({
      ...baseInput, consciousness: 2, gaze: 2, motor_arm_left: 4,
      motor_arm_right: 2, motor_leg_left: 4, language: 2, neglect: 2,
    });
    expect(result.score).toBe(18);
    expect(result.riskLevel).toBe('Moderate-to-severe stroke');
  });

  it('calculates severe stroke (score 21-42)', () => {
    const result = calculateNIHSS({
      consciousness: 3, orientation_questions: 2, commands: 2,
      gaze: 2, visual_fields: 3, facial_palsy: 3,
      motor_arm_left: 4, motor_arm_right: 4,
      motor_leg_left: 4, motor_leg_right: 4,
      ataxia: 2, sensory: 2, language: 3, dysarthria: 2, neglect: 2,
    });
    expect(result.score).toBe(42);
    expect(result.maxScore).toBe(42);
    expect(result.riskLevel).toBe('Severe stroke');
  });

  it('includes tPA consideration for eligible scores', () => {
    const result = calculateNIHSS({
      ...baseInput, motor_arm_left: 3, motor_leg_left: 3, language: 1,
    });
    expect(result.score).toBe(7);
    expect(result.recommendation.toLowerCase()).toContain('alteplase');
  });

  it('tracks all 15 components', () => {
    const result = calculateNIHSS(baseInput);
    expect(Object.keys(result.components).length).toBe(15);
  });

  it('is accessible via calculateRiskScore tool', () => {
    const result = calculateRiskScore('NIHSS', { ...baseInput });
    expect(result.scoreName).toBe('NIH Stroke Scale');
    expect(result.score).toBe(0);
  });
});

describe('PHQ-9 (Patient Health Questionnaire)', () => {
  const baseInput = {
    little_interest: 0 as const, feeling_down: 0 as const, sleep_trouble: 0 as const,
    feeling_tired: 0 as const, appetite_change: 0 as const,
    feeling_bad_about_self: 0 as const, concentration_trouble: 0 as const,
    psychomotor_change: 0 as const, suicidal_thoughts: 0 as const,
  };

  it('calculates minimal depression (score 0-4)', () => {
    const result = calculatePHQ9(baseInput);
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Minimal');
    expect(result.scoreName).toBe('PHQ-9');
  });

  it('calculates mild depression (score 5-9)', () => {
    const result = calculatePHQ9({
      ...baseInput, little_interest: 2, feeling_down: 1, sleep_trouble: 2,
    });
    expect(result.score).toBe(5);
    expect(result.riskLevel).toBe('Mild');
  });

  it('calculates moderate depression (score 10-14)', () => {
    const result = calculatePHQ9({
      ...baseInput, little_interest: 2, feeling_down: 2, sleep_trouble: 2,
      feeling_tired: 2, appetite_change: 2,
    });
    expect(result.score).toBe(10);
    expect(result.riskLevel).toBe('Moderate');
  });

  it('calculates moderately severe depression (score 15-19)', () => {
    const result = calculatePHQ9({
      ...baseInput, little_interest: 3, feeling_down: 3, sleep_trouble: 2,
      feeling_tired: 2, appetite_change: 2, feeling_bad_about_self: 2,
      concentration_trouble: 2,
    });
    expect(result.score).toBe(16);
    expect(result.riskLevel).toBe('Moderately severe');
  });

  it('calculates severe depression (score 20-27)', () => {
    const result = calculatePHQ9({
      little_interest: 3, feeling_down: 3, sleep_trouble: 3,
      feeling_tired: 3, appetite_change: 3, feeling_bad_about_self: 3,
      concentration_trouble: 3, psychomotor_change: 3, suicidal_thoughts: 3,
    });
    expect(result.score).toBe(27);
    expect(result.maxScore).toBe(27);
    expect(result.riskLevel).toBe('Severe');
  });

  it('flags suicidal ideation when item 9 is endorsed', () => {
    const result = calculatePHQ9({ ...baseInput, suicidal_thoughts: 1 });
    expect(result.interpretation.toLowerCase()).toContain('safety alert');
  });

  it('flags suicidal ideation at any endorsement level', () => {
    const result = calculatePHQ9({ ...baseInput, suicidal_thoughts: 3 });
    expect(result.interpretation.toLowerCase()).toContain('safety alert');
  });

  it('tracks all 9 components', () => {
    const result = calculatePHQ9(baseInput);
    expect(Object.keys(result.components).length).toBe(9);
  });

  it('is accessible via calculateRiskScore tool', () => {
    const result = calculateRiskScore('PHQ-9', { ...baseInput });
    expect(result.scoreName).toBe('PHQ-9');
  });
});

describe('AUDIT-C (Alcohol Use Screening)', () => {
  it('identifies abstinence (score 0)', () => {
    const result = calculateAUDITC({
      drinking_frequency: 0, typical_quantity: 0, binge_frequency: 0,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toMatch(/abstinent|low|none/i);
  });

  it('identifies low-risk drinking', () => {
    const result = calculateAUDITC({
      drinking_frequency: 1, typical_quantity: 0, binge_frequency: 0,
    });
    expect(result.score).toBe(1);
  });

  it('identifies positive screen for men (score >= 4)', () => {
    const result = calculateAUDITC({
      drinking_frequency: 2, typical_quantity: 1, binge_frequency: 1,
    });
    expect(result.score).toBe(4);
  });

  it('identifies positive screen for women (score >= 3)', () => {
    const result = calculateAUDITC({
      drinking_frequency: 1, typical_quantity: 1, binge_frequency: 1, sex: 'female',
    });
    expect(result.score).toBe(3);
  });

  it('calculates maximum score', () => {
    const result = calculateAUDITC({
      drinking_frequency: 4, typical_quantity: 4, binge_frequency: 4,
    });
    expect(result.score).toBe(12);
    expect(result.maxScore).toBe(12);
  });

  it('tracks all 3 components', () => {
    const result = calculateAUDITC({
      drinking_frequency: 0, typical_quantity: 0, binge_frequency: 0,
    });
    expect(Object.keys(result.components).length).toBe(3);
  });

  it('is accessible via calculateRiskScore tool', () => {
    const result = calculateRiskScore('AUDIT-C', {
      drinking_frequency: 2, typical_quantity: 1, binge_frequency: 1,
    });
    expect(result.scoreName).toContain('AUDIT');
  });
});

describe('GAD-7 (Generalized Anxiety Disorder)', () => {
  const baseInput = {
    feeling_nervous: 0 as const, uncontrollable_worry: 0 as const,
    excessive_worry: 0 as const, trouble_relaxing: 0 as const,
    restlessness: 0 as const, irritability: 0 as const, feeling_afraid: 0 as const,
  };

  it('calculates minimal anxiety (score 0-4)', () => {
    const result = calculateGAD7(baseInput);
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('Minimal');
    expect(result.scoreName).toBe('GAD-7');
  });

  it('calculates mild anxiety (score 5-9)', () => {
    const result = calculateGAD7({
      ...baseInput, feeling_nervous: 2, uncontrollable_worry: 1, trouble_relaxing: 2,
    });
    expect(result.score).toBe(5);
    expect(result.riskLevel).toBe('Mild');
  });

  it('calculates moderate anxiety (score 10-14)', () => {
    const result = calculateGAD7({
      ...baseInput, feeling_nervous: 2, uncontrollable_worry: 2, excessive_worry: 2,
      trouble_relaxing: 2, restlessness: 2,
    });
    expect(result.score).toBe(10);
    expect(result.riskLevel).toBe('Moderate');
  });

  it('calculates severe anxiety (score 15-21)', () => {
    const result = calculateGAD7({
      feeling_nervous: 3, uncontrollable_worry: 3, excessive_worry: 3,
      trouble_relaxing: 3, restlessness: 3, irritability: 3, feeling_afraid: 3,
    });
    expect(result.score).toBe(21);
    expect(result.maxScore).toBe(21);
    expect(result.riskLevel).toBe('Severe');
  });

  it('recommends further evaluation at score >= 10', () => {
    const result = calculateGAD7({
      ...baseInput, feeling_nervous: 2, uncontrollable_worry: 2,
      excessive_worry: 2, trouble_relaxing: 2, restlessness: 2,
    });
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.recommendation.toLowerCase()).toMatch(/evaluat|assess|refer/);
  });

  it('tracks all 7 components', () => {
    const result = calculateGAD7(baseInput);
    expect(Object.keys(result.components).length).toBe(7);
  });

  it('is accessible via calculateRiskScore tool', () => {
    const result = calculateRiskScore('GAD-7', { ...baseInput });
    expect(result.scoreName).toBe('GAD-7');
  });
});

describe('New scores in availableScores registry', () => {
  const scores = listAvailableScores();

  it('includes NIHSS', () => {
    expect(scores.find(s => s.name === 'NIHSS')).toBeDefined();
  });

  it('includes PHQ-9', () => {
    expect(scores.find(s => s.name === 'PHQ-9')).toBeDefined();
  });

  it('includes AUDIT-C', () => {
    expect(scores.find(s => s.name === 'AUDIT-C')).toBeDefined();
  });

  it('includes GAD-7', () => {
    expect(scores.find(s => s.name === 'GAD-7')).toBeDefined();
  });

  it('now has 25 total scores', () => {
    expect(scores.length).toBe(25);
  });
});

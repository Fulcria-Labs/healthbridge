#!/usr/bin/env node

/**
 * HealthBridge MCP Server
 *
 * A Clinical Decision Support MCP server for healthcare AI agents.
 * Provides tools for drug interaction checking, clinical risk score calculation,
 * lab result interpretation, and FHIR patient data summarization.
 *
 * Built for the "Agents Assemble" Healthcare AI Hackathon.
 * Uses SHARP on MCP framework for healthcare context propagation.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { checkDrugInteractions } from './tools/drug-interaction-tool.js';
import { calculateRiskScore, listAvailableScores, type ScoreName } from './tools/risk-score-tool.js';
import { interpretSingleLab, interpretPanel, listAvailableTests } from './tools/lab-interpreter-tool.js';
import { getPatientSummary } from './tools/patient-summary-tool.js';

const server = new McpServer({
  name: 'healthbridge',
  version: '1.0.0',
});

// Tool 1: Drug Interaction Checker
server.tool(
  'check_drug_interactions',
  'Check for drug-drug interactions among a list of medications. Supports generic and brand names. Returns severity levels (contraindicated, major, moderate, minor), mechanisms, clinical effects, and management recommendations.',
  {
    medications: z.array(z.string()).min(2).describe('List of medication names (generic or brand) to check for interactions. Minimum 2 medications required.'),
  },
  async ({ medications }) => {
    const result = checkDrugInteractions({ medications });
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      }],
    };
  }
);

// Tool 2: Clinical Risk Score Calculator
server.tool(
  'calculate_risk_score',
  'Calculate validated clinical risk scores. Available scores: CHA2DS2-VASc (stroke risk in AFib), HEART (cardiac events in chest pain), Wells-PE (pulmonary embolism probability), MELD/MELD-Na (liver disease severity), CURB-65 (pneumonia severity), GCS (consciousness level). Returns score, risk level, interpretation, and evidence-based recommendations.',
  {
    score_name: z.enum(['CHA2DS2-VASc', 'HEART', 'Wells-PE', 'MELD', 'CURB-65', 'GCS']).describe('The clinical risk score to calculate'),
    parameters: z.record(z.string(), z.unknown()).describe('Score-specific parameters. Use list_risk_scores tool to see required parameters for each score.'),
  },
  async ({ score_name, parameters }) => {
    try {
      const result = calculateRiskScore(score_name as ScoreName, parameters);
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            error: error instanceof Error ? error.message : 'Unknown error',
            availableScores: listAvailableScores(),
          }, null, 2),
        }],
        isError: true,
      };
    }
  }
);

// Tool 3: List Available Risk Scores
server.tool(
  'list_risk_scores',
  'List all available clinical risk scoring systems with their descriptions and required parameters.',
  {},
  async () => {
    const scores = listAvailableScores();
    const parameterGuide = {
      'CHA2DS2-VASc': {
        description: 'Stroke risk in atrial fibrillation',
        parameters: { age: 'number', sex: '"male" or "female"', chf: 'boolean', hypertension: 'boolean', stroke_tia_history: 'boolean', vascular_disease: 'boolean', diabetes: 'boolean' },
      },
      'HEART': {
        description: 'Major cardiac events in chest pain',
        parameters: { history: '"slightly_suspicious", "moderately_suspicious", or "highly_suspicious"', ecg: '"normal", "non_specific_changes", or "significant_st_deviation"', age: 'number', risk_factors: 'number (0-5+ count)', troponin: '"normal", "mildly_elevated", or "significantly_elevated"' },
      },
      'Wells-PE': {
        description: 'Pulmonary embolism probability',
        parameters: { clinical_signs_dvt: 'boolean', pe_most_likely_diagnosis: 'boolean', heart_rate_over_100: 'boolean', immobilization_or_surgery: 'boolean', previous_dvt_pe: 'boolean', hemoptysis: 'boolean', malignancy: 'boolean' },
      },
      'MELD': {
        description: 'End-stage liver disease severity',
        parameters: { creatinine: 'number (mg/dL)', bilirubin: 'number (mg/dL)', inr: 'number', sodium: 'number (mEq/L, optional for MELD-Na)', on_dialysis: 'boolean (optional)' },
      },
      'CURB-65': {
        description: 'Community-acquired pneumonia severity',
        parameters: { confusion: 'boolean', bun_over_19: 'boolean', respiratory_rate_over_30: 'boolean', systolic_bp_under_90: 'boolean', diastolic_bp_under_60: 'boolean', age_65_or_over: 'boolean' },
      },
      'GCS': {
        description: 'Glasgow Coma Scale',
        parameters: { eye_opening: '1-4', verbal_response: '1-5', motor_response: '1-6' },
      },
    };

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({ scores, parameterGuide }, null, 2),
      }],
    };
  }
);

// Tool 4: Lab Result Interpreter
server.tool(
  'interpret_lab_result',
  'Interpret a single laboratory test result. Returns reference range, urgency level (normal/borderline/abnormal/critical), clinical significance, and recommended actions. Supports CBC, BMP, liver function, cardiac markers, coagulation, thyroid, and inflammatory markers.',
  {
    test: z.string().describe('Lab test name or code (e.g., "WBC", "hemoglobin", "potassium", "troponin", "TSH", "HbA1c")'),
    value: z.number().describe('The numerical test result value'),
  },
  async ({ test, value }) => {
    const result = interpretSingleLab({ test, value });
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      }],
    };
  }
);

// Tool 5: Lab Panel Interpreter
server.tool(
  'interpret_lab_panel',
  'Interpret multiple laboratory test results at once. Returns individual interpretations plus a summary highlighting critical and abnormal values requiring attention.',
  {
    results: z.array(z.object({
      test: z.string().describe('Lab test name or code'),
      value: z.number().describe('The numerical test result value'),
    })).min(1).describe('Array of lab test results to interpret'),
  },
  async ({ results }) => {
    const result = interpretPanel({ results });
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      }],
    };
  }
);

// Tool 6: List Available Lab Tests
server.tool(
  'list_lab_tests',
  'List all laboratory tests available for interpretation with their reference ranges and categories.',
  {},
  async () => {
    const tests = listAvailableTests();
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(tests, null, 2),
      }],
    };
  }
);

// Tool 7: Patient Summary from FHIR
server.tool(
  'get_patient_summary',
  'Generate a clinical summary from FHIR patient data. Extracts demographics, active conditions, current medications, allergies, vitals, and generates clinical notes. Can use provided FHIR Bundle or synthetic demonstration data.',
  {
    use_synthetic_data: z.boolean().optional().default(true).describe('Use synthetic patient data for demonstration (default: true). Set to false and provide fhir_bundle for real data.'),
    fhir_bundle: z.any().optional().describe('Optional FHIR R4 Bundle containing patient data (Patient, Condition, MedicationStatement, Observation, AllergyIntolerance resources)'),
  },
  async ({ use_synthetic_data, fhir_bundle }) => {
    const result = getPatientSummary({
      useSyntheticData: use_synthetic_data,
      fhirBundle: fhir_bundle,
    });
    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify(result, null, 2),
      }],
    };
  }
);

// Tool 8: Comprehensive Medication Review
server.tool(
  'medication_review',
  'Perform a comprehensive medication review: check all drug interactions, identify high-risk combinations, and flag potential concerns based on patient conditions and allergies. Combines drug interaction checking with patient context.',
  {
    medications: z.array(z.string()).min(1).describe('List of current medications'),
    conditions: z.array(z.string()).optional().describe('Patient conditions (e.g., "renal impairment", "liver disease") for context'),
    allergies: z.array(z.string()).optional().describe('Known allergies for cross-reference'),
  },
  async ({ medications, conditions, allergies }) => {
    // Check drug interactions
    const interactions = medications.length >= 2
      ? checkDrugInteractions({ medications })
      : { interactions: [], summary: 'Single medication - no interactions to check.', interactionsFound: 0, medicationCount: 1, resolvedMedications: [], unresolvedMedications: [] };

    // Generate condition-specific warnings
    const warnings: string[] = [];

    if (conditions) {
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
    }

    // Cross-reference allergies
    const allergyWarnings: string[] = [];
    if (allergies) {
      const allergyLower = allergies.map(a => a.toLowerCase());
      const medLower = medications.map(m => m.toLowerCase());

      // Penicillin cross-reactivity
      if (allergyLower.some(a => a.includes('penicillin'))) {
        const crossReactive = ['amoxicillin', 'ampicillin', 'piperacillin'];
        const flagged = medLower.filter(m => crossReactive.some(c => m.includes(c)));
        if (flagged.length > 0) {
          allergyWarnings.push(`⚠️ ALLERGY ALERT: ${flagged.join(', ')} - patient has penicillin allergy. These are penicillin-class antibiotics.`);
        }
        // Cephalosporin cross-reactivity (~1-2%)
        const cephCross = ['cephalexin', 'ceftriaxone', 'cefazolin'];
        const cephFlagged = medLower.filter(m => cephCross.some(c => m.includes(c)));
        if (cephFlagged.length > 0) {
          allergyWarnings.push(`Caution: ${cephFlagged.join(', ')} - ~1-2% cross-reactivity with penicillin allergy. Assess severity of penicillin reaction.`);
        }
      }

      // Sulfa allergy
      if (allergyLower.some(a => a.includes('sulfa') || a.includes('sulfon'))) {
        const sulfaDrugs = ['sulfamethoxazole', 'bactrim', 'septra', 'sulfasalazine'];
        const flagged = medLower.filter(m => sulfaDrugs.some(s => m.includes(s)));
        if (flagged.length > 0) {
          allergyWarnings.push(`⚠️ ALLERGY ALERT: ${flagged.join(', ')} - patient has sulfa allergy.`);
        }
      }
    }

    return {
      content: [{
        type: 'text' as const,
        text: JSON.stringify({
          medicationReview: {
            medications,
            interactionCheck: interactions,
            conditionWarnings: warnings,
            allergyAlerts: allergyWarnings,
            overallRisk: interactions.interactions.some(i => i.severity === 'contraindicated')
              ? 'HIGH - Contraindicated combinations found'
              : interactions.interactions.some(i => i.severity === 'major')
                ? 'MODERATE-HIGH - Major interactions found'
                : warnings.length > 0 || allergyWarnings.length > 0
                  ? 'MODERATE - Condition/allergy concerns identified'
                  : 'LOW - No significant concerns identified',
          },
        }, null, 2),
      }],
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('HealthBridge MCP Server running on stdio');
}

main().catch(console.error);

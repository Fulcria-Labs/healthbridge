/**
 * Server Factory — Creates a configured HealthBridge MCP server instance.
 * Used by both stdio (index.ts) and HTTP (http-transport.ts) entry points.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { checkDrugInteractions } from './tools/drug-interaction-tool.js';
import { calculateRiskScore, listAvailableScores, type ScoreName } from './tools/risk-score-tool.js';
import { interpretSingleLab, interpretPanel, listAvailableTests } from './tools/lab-interpreter-tool.js';
import { getPatientSummary } from './tools/patient-summary-tool.js';
import { generateClinicalAlerts } from './tools/clinical-alerts-tool.js';
import { registerResources } from './resources.js';
import { registerPrompts } from './prompts.js';
import { getSHARPContext, hasFHIRAccess, fetchFHIRResource } from './sharp-context.js';

export function createHealthBridgeServer(): McpServer {
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
    'Calculate validated clinical risk scores. Available scores: CHA2DS2-VASc, HEART, Wells-PE, MELD, CURB-65, GCS, eGFR, qSOFA, SOFA, Child-Pugh, ASCVD, NEWS2, HAS-BLED, TIMI, ABCD2, BMI. Returns score, risk level, interpretation, and evidence-based recommendations.',
    {
      score_name: z.enum(['CHA2DS2-VASc', 'HEART', 'Wells-PE', 'MELD', 'CURB-65', 'GCS', 'eGFR', 'qSOFA', 'SOFA', 'Child-Pugh', 'ASCVD', 'NEWS2', 'HAS-BLED', 'TIMI', 'ABCD2', 'BMI']).describe('The clinical risk score to calculate'),
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
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({ scores }, null, 2),
        }],
      };
    }
  );

  // Tool 4: Lab Result Interpreter
  server.tool(
    'interpret_lab_result',
    'Interpret a single laboratory test result. Returns reference range, urgency level, clinical significance, and recommended actions.',
    {
      test: z.string().describe('Lab test name or code (e.g., "WBC", "hemoglobin", "potassium", "troponin", "TSH")'),
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
    'Interpret multiple laboratory test results at once. Returns individual interpretations plus a summary highlighting critical and abnormal values.',
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

  // Tool 7: Patient Summary from FHIR (SHARP-aware)
  server.tool(
    'get_patient_summary',
    'Generate a clinical summary from FHIR patient data. When SHARP context is available (via Prompt Opinion), fetches live patient data. Otherwise uses provided FHIR Bundle or synthetic demo data.',
    {
      use_synthetic_data: z.boolean().optional().default(true).describe('Use synthetic patient data for demonstration (default: true). Set to false and provide fhir_bundle for real data.'),
      fhir_bundle: z.any().optional().describe('Optional FHIR R4 Bundle. When SHARP context is present, this is ignored and live data is fetched.'),
    },
    async ({ use_synthetic_data, fhir_bundle }) => {
      // If SHARP context provides FHIR access, try to fetch live data
      if (hasFHIRAccess()) {
        const ctx = getSHARPContext()!;
        const patientResult = await fetchFHIRResource('Patient', ctx.patientId);
        if ('data' in patientResult && patientResult.fromFHIR) {
          // Fetch related resources
          const [conditions, meds, obs, allergies] = await Promise.all([
            fetchFHIRResource('Condition'),
            fetchFHIRResource('MedicationStatement'),
            fetchFHIRResource('Observation'),
            fetchFHIRResource('AllergyIntolerance'),
          ]);

          const bundle = {
            resourceType: 'Bundle' as const,
            type: 'collection' as const,
            entry: [
              { resource: patientResult.data },
              ...('data' in conditions && conditions.data?.entry ? conditions.data.entry : []),
              ...('data' in meds && meds.data?.entry ? meds.data.entry : []),
              ...('data' in obs && obs.data?.entry ? obs.data.entry : []),
              ...('data' in allergies && allergies.data?.entry ? allergies.data.entry : []),
            ],
          };

          const result = getPatientSummary({ useSyntheticData: false, fhirBundle: bundle });
          return {
            content: [{
              type: 'text' as const,
              text: JSON.stringify({
                ...result,
                _dataSource: 'fhir-server-via-sharp',
                _fhirServer: ctx.fhirServerUrl,
              }, null, 2),
            }],
          };
        }
      }

      // Fallback to local/synthetic data
      const result = getPatientSummary({
        useSyntheticData: use_synthetic_data,
        fhirBundle: fhir_bundle,
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify({
            ...result,
            _dataSource: hasFHIRAccess() ? 'fhir-fallback' : 'local',
          }, null, 2),
        }],
      };
    }
  );

  // Tool 8: Comprehensive Medication Review
  server.tool(
    'medication_review',
    'Perform a comprehensive medication review: check all drug interactions, identify high-risk combinations, and flag potential concerns based on patient conditions and allergies.',
    {
      medications: z.array(z.string()).min(1).describe('List of current medications'),
      conditions: z.array(z.string()).optional().describe('Patient conditions for context'),
      allergies: z.array(z.string()).optional().describe('Known allergies for cross-reference'),
    },
    async ({ medications, conditions, allergies }) => {
      const interactions = medications.length >= 2
        ? checkDrugInteractions({ medications })
        : { interactions: [], summary: 'Single medication - no interactions to check.', interactionsFound: 0, medicationCount: 1, resolvedMedications: [], unresolvedMedications: [] };

      const warnings: string[] = [];
      if (conditions) {
        const condLower = conditions.map(c => c.toLowerCase());
        const medLower = medications.map(m => m.toLowerCase());

        if (condLower.some(c => c.includes('renal') || c.includes('kidney'))) {
          const renalCaution = ['metformin', 'nsaid', 'ibuprofen', 'naproxen', 'lithium', 'methotrexate'];
          const flagged = medLower.filter(m => renalCaution.some(r => m.includes(r)));
          if (flagged.length > 0) warnings.push(`Renal impairment concern: ${flagged.join(', ')} require dose adjustment or avoidance.`);
        }
        if (condLower.some(c => c.includes('liver') || c.includes('hepatic'))) {
          const hepaticCaution = ['acetaminophen', 'tylenol', 'simvastatin', 'atorvastatin', 'methotrexate'];
          const flagged = medLower.filter(m => hepaticCaution.some(h => m.includes(h)));
          if (flagged.length > 0) warnings.push(`Hepatic impairment concern: ${flagged.join(', ')} require dose adjustment or monitoring.`);
        }
        if (condLower.some(c => c.includes('bleeding') || c.includes('gi bleed'))) {
          const bleedingRisk = ['warfarin', 'aspirin', 'clopidogrel', 'ibuprofen', 'naproxen'];
          const flagged = medLower.filter(m => bleedingRisk.some(b => m.includes(b)));
          if (flagged.length > 0) warnings.push(`Bleeding risk concern: ${flagged.join(', ')} increase bleeding risk.`);
        }
      }

      const allergyWarnings: string[] = [];
      if (allergies) {
        const allergyLower = allergies.map(a => a.toLowerCase());
        const medLower = medications.map(m => m.toLowerCase());
        if (allergyLower.some(a => a.includes('penicillin'))) {
          const crossReactive = ['amoxicillin', 'ampicillin', 'piperacillin'];
          const flagged = medLower.filter(m => crossReactive.some(c => m.includes(c)));
          if (flagged.length > 0) allergyWarnings.push(`ALLERGY ALERT: ${flagged.join(', ')} - patient has penicillin allergy.`);
          const cephCross = ['cephalexin', 'ceftriaxone', 'cefazolin'];
          const cephFlagged = medLower.filter(m => cephCross.some(c => m.includes(c)));
          if (cephFlagged.length > 0) allergyWarnings.push(`Caution: ${cephFlagged.join(', ')} - ~1-2% cross-reactivity with penicillin allergy.`);
        }
        if (allergyLower.some(a => a.includes('sulfa') || a.includes('sulfon'))) {
          const sulfaDrugs = ['sulfamethoxazole', 'bactrim', 'septra', 'sulfasalazine'];
          const flagged = medLower.filter(m => sulfaDrugs.some(s => m.includes(s)));
          if (flagged.length > 0) allergyWarnings.push(`ALLERGY ALERT: ${flagged.join(', ')} - patient has sulfa allergy.`);
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

  // Tool 9: Clinical Alerts Aggregator
  server.tool(
    'clinical_alerts',
    'Generate prioritized clinical alerts by aggregating lab results, medications, vitals, and patient context.',
    {
      age: z.number().optional().describe('Patient age in years'),
      sex: z.enum(['male', 'female']).optional().describe('Patient sex'),
      medications: z.array(z.string()).optional().describe('Current medications'),
      lab_results: z.array(z.object({
        test: z.string().describe('Lab test name or code'),
        value: z.number().describe('Numerical result value'),
      })).optional().describe('Recent lab results'),
      vitals: z.object({
        systolic_bp: z.number().optional(),
        diastolic_bp: z.number().optional(),
        heart_rate: z.number().optional(),
        respiratory_rate: z.number().optional(),
        temperature: z.number().optional(),
        spo2: z.number().optional(),
        weight_kg: z.number().optional(),
        height_cm: z.number().optional(),
      }).optional().describe('Current vital signs'),
      conditions: z.array(z.string()).optional().describe('Active medical conditions'),
      allergies: z.array(z.string()).optional().describe('Known allergies'),
    },
    async ({ age, sex, medications, lab_results, vitals, conditions, allergies }) => {
      const result = generateClinicalAlerts({
        age,
        sex,
        medications,
        labResults: lab_results,
        vitals: vitals ? {
          systolicBp: vitals.systolic_bp,
          diastolicBp: vitals.diastolic_bp,
          heartRate: vitals.heart_rate,
          respiratoryRate: vitals.respiratory_rate,
          temperature: vitals.temperature,
          spo2: vitals.spo2,
          weight_kg: vitals.weight_kg,
          height_cm: vitals.height_cm,
        } : undefined,
        conditions,
        allergies,
      });
      return {
        content: [{
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    }
  );

  // Register Resources and Prompts
  registerResources(server);
  registerPrompts(server);

  return server;
}

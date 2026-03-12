/**
 * HealthBridge MCP Prompts
 *
 * Pre-built clinical workflow prompts that guide AI agents through
 * multi-step clinical decision-making processes.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export function registerPrompts(server: McpServer): void {

  // Prompt 1: Pre-operative Assessment
  server.prompt(
    'preoperative_assessment',
    'Structured pre-operative assessment workflow: medication review, risk scoring, and lab interpretation for surgical patients',
    { medications: z.string().describe('Comma-separated list of current medications'),
      age: z.string().describe('Patient age'),
      conditions: z.string().optional().describe('Comma-separated list of medical conditions'),
    },
    async ({ medications, age, conditions }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Perform a pre-operative assessment for a ${age}-year-old patient.

Current medications: ${medications}
${conditions ? `Medical conditions: ${conditions}` : ''}

Follow this structured workflow:

1. **Medication Review**: Use the \`medication_review\` tool to check all drug interactions and identify medications that need perioperative management (e.g., anticoagulants to hold, medications with anesthesia interactions).

2. **Cardiac Risk**: Use \`calculate_risk_score\` with the HEART score if the patient has cardiac risk factors, or CHA₂DS₂-VASc if on anticoagulation for AFib.

3. **Renal Function**: Use \`calculate_risk_score\` with eGFR to assess kidney function for contrast/medication dosing.

4. **Bleeding Risk**: If on anticoagulation, use \`calculate_risk_score\` with HAS-BLED to assess bleeding risk.

5. **Summary**: Provide a structured pre-operative clearance summary with:
   - Medications to hold (and when to hold them)
   - Medications to continue
   - Required labs before surgery
   - Risk level assessment
   - Recommendations for the surgical team`,
          },
        },
      ],
    })
  );

  // Prompt 2: Emergency Department Triage
  server.prompt(
    'ed_triage',
    'Emergency department triage workflow using NEWS2 scoring and clinical assessment tools',
    { respiratory_rate: z.string().describe('Respiratory rate (breaths/min)'),
      spo2: z.string().describe('SpO2 (%)'),
      systolic_bp: z.string().describe('Systolic blood pressure (mmHg)'),
      heart_rate: z.string().describe('Heart rate (bpm)'),
      temperature: z.string().describe('Temperature (°C)'),
      consciousness: z.string().describe('Level: alert, confusion, voice, pain, or unresponsive'),
      chief_complaint: z.string().optional().describe('Chief complaint'),
      medications: z.string().optional().describe('Current medications (comma-separated)'),
    },
    async ({ respiratory_rate, spo2, systolic_bp, heart_rate, temperature, consciousness, chief_complaint, medications }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Perform an ED triage assessment for a patient presenting with:
${chief_complaint ? `Chief complaint: ${chief_complaint}` : ''}
Vitals: RR ${respiratory_rate}, SpO2 ${spo2}%, BP ${systolic_bp} systolic, HR ${heart_rate}, Temp ${temperature}°C, Consciousness: ${consciousness}
${medications ? `Current medications: ${medications}` : ''}

Follow this workflow:

1. **NEWS2 Score**: Use \`calculate_risk_score\` with NEWS2 and the provided vitals to determine acuity level.

2. **Sepsis Screen**: Use \`calculate_risk_score\` with qSOFA to screen for sepsis (RR ≥22, altered mental status, SBP ≤100).

3. **Medication Check**: If medications provided, use \`medication_review\` to identify any drug-related concerns.

4. **Triage Decision**: Based on NEWS2 aggregate score:
   - 0-4: Routine ward assessment
   - 5-6 OR 3 in any single parameter: Urgent clinical review
   - ≥7: Emergency response team

5. **Recommended Actions**: Specify immediate interventions, labs to order, and monitoring frequency.`,
          },
        },
      ],
    })
  );

  // Prompt 3: Discharge Medication Reconciliation
  server.prompt(
    'discharge_med_reconciliation',
    'Medication reconciliation workflow for hospital discharge: interaction checking, allergy verification, and patient safety review',
    { admission_meds: z.string().describe('Pre-admission medications (comma-separated)'),
      discharge_meds: z.string().describe('Planned discharge medications (comma-separated)'),
      allergies: z.string().optional().describe('Known allergies (comma-separated)'),
      conditions: z.string().optional().describe('Active conditions (comma-separated)'),
    },
    async ({ admission_meds, discharge_meds, allergies, conditions }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Perform discharge medication reconciliation.

Pre-admission medications: ${admission_meds}
Planned discharge medications: ${discharge_meds}
${allergies ? `Allergies: ${allergies}` : 'No known allergies'}
${conditions ? `Active conditions: ${conditions}` : ''}

Follow this workflow:

1. **Interaction Check**: Use \`medication_review\` on the discharge medication list with conditions and allergies.

2. **Changed Medications**: Identify medications that were:
   - Added during hospitalization (new)
   - Discontinued (on admission list but not discharge)
   - Changed (dose or formulation differences)

3. **Safety Checks**:
   - Flag any duplicate therapeutic classes
   - Verify no allergy conflicts
   - Check for medications requiring monitoring (INR for warfarin, levels for digoxin/lithium)

4. **Renal Dosing**: If renal impairment is a condition, use \`calculate_risk_score\` with eGFR and flag medications needing renal dose adjustment.

5. **Patient Education Summary**: Generate a plain-language summary of medication changes suitable for patient/family teaching.`,
          },
        },
      ],
    })
  );

  // Prompt 4: Chest Pain Evaluation
  server.prompt(
    'chest_pain_evaluation',
    'Structured chest pain evaluation using HEART score and lab interpretation',
    { age: z.string().describe('Patient age'),
      history_suspicion: z.string().describe('History: slightly_suspicious, moderately_suspicious, or highly_suspicious'),
      ecg: z.string().describe('ECG: normal, non_specific_changes, or significant_st_deviation'),
      risk_factor_count: z.string().describe('Number of risk factors (0-5+: HTN, DM, smoking, obesity, family hx)'),
      troponin_level: z.string().optional().describe('Troponin value in ng/mL (if available)'),
      medications: z.string().optional().describe('Current medications (comma-separated)'),
    },
    async ({ age, history_suspicion, ecg, risk_factor_count, troponin_level, medications }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Evaluate chest pain in a ${age}-year-old patient.

Clinical presentation:
- History suspicion level: ${history_suspicion}
- ECG findings: ${ecg}
- Cardiovascular risk factors: ${risk_factor_count}
${troponin_level ? `- Troponin: ${troponin_level} ng/mL` : '- Troponin: pending'}
${medications ? `- Current medications: ${medications}` : ''}

Follow this workflow:

1. **HEART Score**: Use \`calculate_risk_score\` with HEART to stratify risk.
${troponin_level ? `\n2. **Troponin Interpretation**: Use \`interpret_lab_result\` with test "troponin" and value ${troponin_level}.` : ''}

3. **ASCVD Risk**: Use \`calculate_risk_score\` with ASCVD for long-term cardiovascular risk context.

4. **Medication Review**: If on medications, use \`medication_review\` to check for drug interactions, especially with any planned anticoagulation or antiplatelet therapy.

5. **Clinical Decision**:
   - HEART 0-3: Consider early discharge with follow-up
   - HEART 4-6: Admit for observation, serial troponins, cardiology consult
   - HEART 7-10: Urgent invasive strategy, activate cath lab if STEMI

6. **Disposition**: Recommend disposition, required labs, and follow-up plan.`,
          },
        },
      ],
    })
  );
}

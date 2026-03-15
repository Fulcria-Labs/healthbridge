/**
 * Agent Card for Prompt Opinion Marketplace
 *
 * Defines HealthBridge's capabilities for discovery in the marketplace.
 * Compatible with both MCP tool listing and A2A agent card formats.
 */

export interface AgentCard {
  name: string;
  version: string;
  description: string;
  author: string;
  category: string;
  tags: string[];
  capabilities: {
    mcp: {
      tools: string[];
      resources: string[];
      prompts: string[];
    };
    fhir: {
      resourceTypes: string[];
      smartScopes: string[];
    };
    sharp: {
      contextAware: boolean;
      patientScoped: boolean;
    };
  };
  requirements: {
    fhirServer?: boolean;
    smartAuth?: boolean;
  };
}

export function getAgentCard(): AgentCard {
  return {
    name: 'healthbridge',
    version: '1.0.0',
    description:
      'Clinical Decision Support MCP Server providing drug interaction checking, ' +
      'clinical risk score calculators, lab result interpretation, and FHIR patient ' +
      'data summarization. SHARP-aware for seamless healthcare context propagation.',
    author: 'Fulcria Labs',
    category: 'clinical-decision-support',
    tags: [
      'healthcare',
      'clinical-decision-support',
      'drug-interactions',
      'risk-scores',
      'lab-interpretation',
      'fhir',
      'sharp',
      'mcp',
      'hipaa',
    ],
    capabilities: {
      mcp: {
        tools: [
          'check_drug_interactions',
          'calculate_risk_score',
          'list_risk_scores',
          'interpret_lab_result',
          'interpret_lab_panel',
          'list_lab_tests',
          'get_patient_summary',
          'medication_review',
          'clinical_alerts',
          'check_renal_dosing',
          'renal_dose_lookup',
          'list_renal_dosing_drugs',
          'pediatric_dosing',
          'list_pediatric_drugs',
          'check_allergy_cross_reactivity',
          'screen_allergies',
          'list_allergy_classes',
          'pk_calculator',
          'list_pk_calculators',
          'check_iv_compatibility',
          'screen_iv_compatibility',
          'list_iv_drugs',
          'check_pregnancy_safety',
          'screen_pregnancy_medications',
          'list_pregnancy_drugs',
          'calculate_opioid_mme',
          'calculate_total_medd',
          'convert_opioid_dose',
          'list_opioids',
        ],
        resources: [
          'healthbridge://formulary/overview',
          'healthbridge://guidelines/anticoagulation',
          'healthbridge://guidelines/sepsis',
          'healthbridge://labs/reference-ranges',
          'healthbridge://scores/decision-matrix',
        ],
        prompts: [
          'preoperative_assessment',
          'ed_triage',
          'discharge_med_reconciliation',
          'chest_pain_evaluation',
        ],
      },
      fhir: {
        resourceTypes: [
          'Patient',
          'Condition',
          'MedicationStatement',
          'Observation',
          'AllergyIntolerance',
        ],
        smartScopes: [
          'patient/Patient.read',
          'patient/Condition.read',
          'patient/MedicationStatement.read',
          'patient/Observation.read',
          'patient/AllergyIntolerance.read',
        ],
      },
      sharp: {
        contextAware: true,
        patientScoped: true,
      },
    },
    requirements: {
      fhirServer: false, // Works with synthetic data when no FHIR server is available
      smartAuth: false,   // SHARP context is optional; degrades gracefully
    },
  };
}

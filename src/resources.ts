/**
 * HealthBridge MCP Resources
 *
 * Exposes clinical reference data as MCP Resources that AI agents can read.
 * This demonstrates deep MCP integration beyond just tools.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerResources(server: McpServer): void {

  // Resource 1: Drug Formulary Overview
  server.resource(
    'drug-formulary',
    'healthbridge://formulary/overview',
    { description: 'Drug formulary with supported medications, categories, and interaction coverage' },
    async () => ({
      contents: [{
        uri: 'healthbridge://formulary/overview',
        mimeType: 'application/json',
        text: JSON.stringify({
          title: 'HealthBridge Drug Formulary',
          version: '1.0.0',
          lastUpdated: '2026-03-12',
          categories: [
            {
              name: 'Cardiovascular',
              medications: ['warfarin', 'aspirin', 'clopidogrel', 'rivaroxaban', 'apixaban', 'dabigatran',
                'amiodarone', 'digoxin', 'metoprolol', 'atenolol', 'propranolol', 'carvedilol',
                'lisinopril', 'enalapril', 'losartan', 'valsartan', 'amlodipine', 'diltiazem', 'verapamil',
                'simvastatin', 'atorvastatin', 'rosuvastatin', 'pravastatin'],
            },
            {
              name: 'Analgesics / NSAIDs',
              medications: ['ibuprofen', 'naproxen', 'aspirin', 'acetaminophen', 'celecoxib',
                'morphine', 'oxycodone', 'hydrocodone', 'fentanyl', 'tramadol', 'codeine'],
            },
            {
              name: 'Psychiatric / CNS',
              medications: ['fluoxetine', 'sertraline', 'paroxetine', 'citalopram', 'escitalopram',
                'venlafaxine', 'duloxetine', 'bupropion', 'mirtazapine', 'trazodone',
                'phenelzine', 'tranylcypromine', 'selegiline',
                'lithium', 'carbamazepine', 'phenytoin', 'valproic acid',
                'alprazolam', 'diazepam', 'lorazepam', 'midazolam'],
            },
            {
              name: 'Antimicrobials',
              medications: ['ciprofloxacin', 'levofloxacin', 'metronidazole', 'fluconazole',
                'erythromycin', 'clarithromycin', 'azithromycin', 'rifampin',
                'trimethoprim-sulfamethoxazole', 'isoniazid', 'linezolid'],
            },
            {
              name: 'Endocrine / Metabolic',
              medications: ['metformin', 'glipizide', 'glyburide', 'insulin',
                'levothyroxine', 'methimazole',
                'prednisone', 'dexamethasone', 'hydrocortisone'],
            },
            {
              name: 'Immunosuppressants',
              medications: ['methotrexate', 'cyclosporine', 'tacrolimus'],
            },
            {
              name: 'Other',
              medications: ['omeprazole', 'pantoprazole', 'theophylline', 'allopurinol', 'spironolactone'],
            },
          ],
          interactionCoverage: {
            totalPairs: 93,
            severityDistribution: {
              contraindicated: 'Combinations that must never be used together',
              major: 'Combinations requiring alternative therapy or close monitoring',
              moderate: 'Combinations requiring dose adjustment or additional monitoring',
              minor: 'Combinations with limited clinical significance',
            },
          },
          brandNameSupport: 'Resolves 45+ brand names to generic equivalents (e.g., Coumadin→warfarin, Plavix→clopidogrel)',
        }, null, 2),
      }],
    })
  );

  // Resource 2: Clinical Guidelines - Anticoagulation
  server.resource(
    'guideline-anticoagulation',
    'healthbridge://guidelines/anticoagulation',
    { description: 'Evidence-based anticoagulation management guidelines for atrial fibrillation' },
    async () => ({
      contents: [{
        uri: 'healthbridge://guidelines/anticoagulation',
        mimeType: 'application/json',
        text: JSON.stringify({
          title: 'Anticoagulation Management in Atrial Fibrillation',
          source: 'AHA/ACC/HRS 2023 Guidelines (simplified)',
          scope: 'Stroke prevention in non-valvular atrial fibrillation',
          workflow: [
            { step: 1, action: 'Calculate CHA₂DS₂-VASc score', tool: 'calculate_risk_score', params: { score_name: 'CHA2DS2-VASc' } },
            { step: 2, action: 'Assess bleeding risk with HAS-BLED', tool: 'calculate_risk_score', params: { score_name: 'HAS-BLED' } },
            { step: 3, action: 'Review current medications for interactions', tool: 'medication_review' },
            { step: 4, action: 'Check renal function (eGFR) for DOAC dosing', tool: 'calculate_risk_score', params: { score_name: 'eGFR' } },
          ],
          decisionTree: {
            'CHA2DS2-VASc_0_male_or_1_female': 'No anticoagulation recommended',
            'CHA2DS2-VASc_1_male': 'Consider anticoagulation (DOAC preferred over warfarin)',
            'CHA2DS2-VASc_2_or_more': 'Anticoagulation recommended (DOAC preferred over warfarin)',
          },
          DOACDosing: {
            apixaban: { standard: '5mg BID', reduced: '2.5mg BID if ≥2 of: age≥80, weight≤60kg, Cr≥1.5' },
            rivaroxaban: { standard: '20mg daily with food', renalAdjustment: '15mg daily if CrCl 15-50mL/min' },
            dabigatran: { standard: '150mg BID', reduced: '110mg BID if age≥80 or high bleeding risk' },
          },
          contraindicatedCombinations: [
            'Dual anticoagulation (e.g., warfarin + DOAC)',
            'Triple therapy >1 week without clear indication',
            'DOAC + strong CYP3A4 inhibitor (e.g., ketoconazole)',
          ],
        }, null, 2),
      }],
    })
  );

  // Resource 3: Clinical Guidelines - Sepsis
  server.resource(
    'guideline-sepsis',
    'healthbridge://guidelines/sepsis',
    { description: 'Surviving Sepsis Campaign guidelines for early recognition and management' },
    async () => ({
      contents: [{
        uri: 'healthbridge://guidelines/sepsis',
        mimeType: 'application/json',
        text: JSON.stringify({
          title: 'Sepsis Early Recognition and Management',
          source: 'Surviving Sepsis Campaign 2021 (simplified)',
          workflow: [
            { step: 1, action: 'Screen with qSOFA at bedside', tool: 'calculate_risk_score', params: { score_name: 'qSOFA' } },
            { step: 2, action: 'If qSOFA ≥2, obtain labs for SOFA scoring', tool: 'interpret_lab_panel' },
            { step: 3, action: 'Calculate full SOFA score', tool: 'calculate_risk_score', params: { score_name: 'SOFA' } },
            { step: 4, action: 'Check lactate level', tool: 'interpret_lab_result', params: { test: 'lactate' } },
            { step: 5, action: 'Assess NEWS2 for ongoing monitoring', tool: 'calculate_risk_score', params: { score_name: 'NEWS2' } },
          ],
          hour1Bundle: [
            'Measure lactate level (remeasure if >2 mmol/L)',
            'Obtain blood cultures before antibiotics',
            'Administer broad-spectrum antibiotics',
            'Begin rapid IV crystalloid (30mL/kg) for hypotension or lactate ≥4',
            'Apply vasopressors if hypotensive during/after fluid resuscitation (target MAP ≥65)',
          ],
          sepsisDefinition: 'Life-threatening organ dysfunction caused by dysregulated host response to infection. Organ dysfunction = increase of ≥2 SOFA points.',
          septicShock: 'Sepsis + vasopressor requirement to maintain MAP ≥65 + serum lactate >2 despite adequate resuscitation. Hospital mortality >40%.',
          keyLabs: ['lactate', 'WBC', 'procalcitonin', 'creatinine', 'bilirubin', 'platelets'],
        }, null, 2),
      }],
    })
  );

  // Resource 4: Lab Reference Ranges Summary
  server.resource(
    'lab-reference-ranges',
    'healthbridge://labs/reference-ranges',
    { description: 'Complete laboratory test reference ranges and critical values' },
    async () => ({
      contents: [{
        uri: 'healthbridge://labs/reference-ranges',
        mimeType: 'application/json',
        text: JSON.stringify({
          title: 'Laboratory Reference Ranges',
          note: 'Reference ranges are for adult patients. Pediatric, pregnancy, and geriatric ranges may differ.',
          categories: {
            'Complete Blood Count (CBC)': {
              tests: ['WBC', 'hemoglobin', 'hematocrit', 'platelets', 'MCV', 'RDW'],
              criticalValues: {
                WBC: { low: '<2.0 ×10³/µL', high: '>30.0 ×10³/µL' },
                hemoglobin: { low: '<7.0 g/dL', high: '>20.0 g/dL' },
                platelets: { low: '<50 ×10³/µL', high: '>1000 ×10³/µL' },
              },
            },
            'Basic Metabolic Panel (BMP)': {
              tests: ['sodium', 'potassium', 'chloride', 'bicarbonate', 'BUN', 'creatinine', 'glucose', 'calcium'],
              criticalValues: {
                potassium: { low: '<2.5 mEq/L', high: '>6.5 mEq/L' },
                sodium: { low: '<120 mEq/L', high: '>160 mEq/L' },
                glucose: { low: '<40 mg/dL', high: '>500 mg/dL' },
                calcium: { low: '<6.0 mg/dL', high: '>13.0 mg/dL' },
              },
            },
            'Liver Function': {
              tests: ['AST', 'ALT', 'alkaline phosphatase', 'bilirubin', 'albumin'],
            },
            'Cardiac Markers': {
              tests: ['troponin', 'BNP'],
              criticalValues: {
                troponin: { high: '>0.4 ng/mL (indicates myocardial injury)' },
              },
            },
            'Coagulation': {
              tests: ['PT', 'INR', 'aPTT'],
              criticalValues: {
                INR: { high: '>5.0 (high bleeding risk)' },
              },
            },
            'Thyroid': { tests: ['TSH', 'free T4'] },
            'Inflammatory': { tests: ['CRP', 'ESR', 'procalcitonin'] },
            'Lipid Panel': { tests: ['total cholesterol', 'LDL', 'HDL', 'triglycerides'] },
            'Minerals': { tests: ['calcium', 'magnesium', 'phosphorus'] },
          },
          totalTests: 28,
          tool: 'Use interpret_lab_result or interpret_lab_panel to get full interpretation with clinical significance.',
        }, null, 2),
      }],
    })
  );

  // Resource 5: Risk Score Decision Matrix
  server.resource(
    'risk-score-matrix',
    'healthbridge://scores/decision-matrix',
    { description: 'Clinical decision matrix mapping risk scores to recommended actions' },
    async () => ({
      contents: [{
        uri: 'healthbridge://scores/decision-matrix',
        mimeType: 'application/json',
        text: JSON.stringify({
          title: 'Risk Score Clinical Decision Matrix',
          description: 'Maps calculated risk scores to evidence-based clinical decisions',
          scores: {
            'CHA2DS2-VASc': {
              use: 'Stroke risk in atrial fibrillation',
              decisions: {
                '0 (male) / 1 (female)': 'No anticoagulation',
                '1 (male)': 'Consider anticoagulation',
                '≥2': 'Oral anticoagulation recommended',
              },
              pairsWell: ['HAS-BLED', 'eGFR'],
            },
            'HAS-BLED': {
              use: 'Bleeding risk on anticoagulation',
              decisions: {
                '0-2': 'Low bleeding risk - proceed with anticoagulation',
                '≥3': 'High bleeding risk - modify risk factors, consider closer monitoring',
              },
              pairsWell: ['CHA2DS2-VASc'],
              note: 'High HAS-BLED score is NOT a contraindication to anticoagulation',
            },
            'HEART': {
              use: 'Risk of MACE in chest pain',
              decisions: {
                '0-3': 'Low risk - consider early discharge',
                '4-6': 'Moderate risk - observation, serial troponins',
                '7-10': 'High risk - early invasive strategy',
              },
              pairsWell: ['TIMI'],
            },
            'NEWS2': {
              use: 'Acute deterioration detection',
              decisions: {
                '0-4': 'Ward-based care, routine monitoring',
                '5-6 or 3 in single parameter': 'Urgent review, increase monitoring frequency',
                '≥7': 'Emergency response, consider ICU transfer',
              },
              pairsWell: ['qSOFA', 'SOFA'],
            },
            'qSOFA + SOFA': {
              use: 'Sepsis screening and severity',
              decisions: {
                'qSOFA <2': 'Low suspicion - continue monitoring',
                'qSOFA ≥2': 'High suspicion - obtain labs, calculate SOFA',
                'SOFA increase ≥2': 'Organ dysfunction = sepsis diagnosis',
              },
              pairsWell: ['NEWS2', 'CURB-65'],
            },
          },
        }, null, 2),
      }],
    })
  );
}

# HealthBridge MCP Server

A Clinical Decision Support MCP Server for healthcare AI agents. Built for the [Agents Assemble](https://agents-assemble.devpost.com/) Healthcare AI Hackathon.

HealthBridge provides validated clinical tools, resources, and workflow prompts that AI agents can use to support healthcare professionals with drug interaction checking, clinical risk assessment, lab interpretation, and patient data analysis.

## MCP Capabilities

### Tools (9)

| Tool | Description |
|------|-------------|
| `check_drug_interactions` | Check drug-drug interactions among medications (93+ drug pairs, generic/brand name support) |
| `calculate_risk_score` | Calculate validated clinical risk scores (16 scores including CHA₂DS₂-VASc, HEART, SOFA, ASCVD, NEWS2, HAS-BLED, TIMI, ABCD2, BMI) |
| `interpret_lab_result` | Interpret single lab values with reference ranges and clinical significance |
| `interpret_lab_panel` | Interpret multiple lab results with critical value flagging |
| `get_patient_summary` | Generate clinical summaries from FHIR R4 patient data |
| `medication_review` | Comprehensive medication review with condition/allergy cross-referencing |
| `clinical_alerts` | Aggregated prioritized clinical alerts across all patient data — drug interactions, critical labs, risk scores, and medication safety |
| `list_risk_scores` | List available risk scoring systems with parameter guides |
| `list_lab_tests` | List supported lab tests with reference ranges |

### Resources (5)

| Resource | URI | Description |
|----------|-----|-------------|
| Drug Formulary | `healthbridge://formulary/overview` | Medication categories, interaction coverage, brand name support |
| Anticoagulation Guidelines | `healthbridge://guidelines/anticoagulation` | Evidence-based anticoagulation management workflow with DOAC dosing |
| Sepsis Guidelines | `healthbridge://guidelines/sepsis` | Surviving Sepsis Campaign hour-1 bundle and screening workflow |
| Lab Reference Ranges | `healthbridge://labs/reference-ranges` | Complete reference ranges and critical values for 28 lab tests |
| Risk Score Decision Matrix | `healthbridge://scores/decision-matrix` | Maps risk scores to evidence-based clinical decisions |

### Prompts (4)

| Prompt | Description |
|--------|-------------|
| `preoperative_assessment` | Structured pre-operative assessment: medication review, risk scoring, renal function |
| `ed_triage` | ED triage workflow using NEWS2 scoring, qSOFA sepsis screening, medication safety |
| `discharge_med_reconciliation` | Discharge medication reconciliation with interaction checking and patient education |
| `chest_pain_evaluation` | Chest pain evaluation using HEART score, troponin interpretation, ASCVD risk |

## Clinical Capabilities

### Drug Interaction Database
- 93+ clinically significant drug-drug interactions
- 4 severity levels: contraindicated, major, moderate, minor
- Generic and brand name resolution (45+ medications)
- Mechanism, clinical effect, and management recommendations

### Risk Score Calculators (16 Validated Scores)
- **CHA₂DS₂-VASc**: Stroke risk in atrial fibrillation
- **HAS-BLED**: Bleeding risk on anticoagulation (pairs with CHA₂DS₂-VASc)
- **HEART Score**: Major cardiac events in chest pain
- **TIMI**: UA/NSTEMI 14-day event risk
- **Wells Score**: Pulmonary embolism probability
- **MELD/MELD-Na**: End-stage liver disease severity
- **CURB-65**: Community-acquired pneumonia severity
- **Glasgow Coma Scale**: Consciousness level assessment
- **eGFR (CKD-EPI 2021)**: Kidney function / CKD staging
- **qSOFA**: Quick sepsis screening
- **SOFA**: Sequential Organ Failure Assessment (ICU mortality)
- **Child-Pugh**: Chronic liver disease classification
- **ASCVD Risk**: 10-year cardiovascular risk (Pooled Cohort Equations)
- **NEWS2**: National Early Warning Score 2 (acute deterioration detection, RCP 2017)
- **ABCD2**: Short-term stroke risk after TIA
- **BMI**: Body mass index with WHO classification

### Lab Result Interpretation
- 28 laboratory tests (CBC, BMP, liver, cardiac, coagulation, thyroid, inflammatory, lipid panel, minerals)
- Critical value identification with urgency levels
- Evidence-based action recommendations

### FHIR Integration
- FHIR R4 Bundle parsing (Patient, Condition, MedicationStatement, Observation, AllergyIntolerance)
- Synthetic patient data for demonstration
- Clinical note generation based on patient context

## Quick Start

```bash
npm install
npm run build
npm start       # Starts MCP server on stdio
```

## Development

```bash
npm run dev           # Run with tsx (hot reload)
npm test              # Run tests (1628 tests across 27 suites)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Architecture

```
src/
├── index.ts              # MCP server entry point (9 tools)
├── resources.ts          # MCP resources (5 clinical reference resources)
├── prompts.ts            # MCP prompts (4 clinical workflow templates)
├── data/
│   ├── drug-interactions.ts  # Drug interaction database (93+ pairs)
│   ├── lab-references.ts     # Lab reference ranges (28 tests)
│   └── risk-scores.ts        # Clinical risk calculators (16 scores)
├── tools/
│   ├── clinical-alerts-tool.ts  # Aggregated prioritized clinical alerts
│   ├── drug-interaction-tool.ts
│   ├── lab-interpreter-tool.ts
│   ├── patient-summary-tool.ts
│   └── risk-score-tool.ts
└── utils/
    └── fhir.ts               # FHIR R4 utilities
```

## Healthcare Data Safety & HIPAA Considerations

HealthBridge is designed with healthcare data security as a first-class concern:

- **No PHI in codebase**: All demonstration data uses synthetic patients only. No real Protected Health Information (PHI) is stored, transmitted, or logged.
- **Stateless processing**: Each tool invocation is stateless -- patient data is processed in-memory and never persisted to disk, databases, or external services.
- **No data exfiltration surface**: The server operates exclusively via MCP stdio transport. There are no HTTP endpoints, no network calls, no external API dependencies, and no telemetry.
- **Input validation**: All tool inputs are validated via Zod schemas. Injection attempts (XSS, SQL) are handled safely through string matching against known drug/lab databases.
- **Deterministic output**: Identical inputs always produce identical outputs, enabling audit trails and reproducibility.
- **FHIR R4 compliant**: Patient data handling follows HL7 FHIR R4 resource specifications.
- **Security test suite**: Dedicated `security-hipaa.test.ts` validates PHI isolation between calls, injection resistance, input boundary handling, and cross-tool data consistency (46 tests).
- **Minimum necessary principle**: Tools return only clinically relevant information. Patient identifiers from FHIR bundles are limited to name, age, and gender for clinical context.
- **SHARP on MCP**: Designed for healthcare context propagation through the MCP protocol, enabling secure agent-to-agent clinical data sharing.

## License

MIT - Fulcria Labs

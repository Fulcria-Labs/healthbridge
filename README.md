# HealthBridge MCP Server

A Clinical Decision Support MCP Server for healthcare AI agents. Built for the [Agents Assemble](https://agents-assemble.devpost.com/) Healthcare AI Hackathon.

HealthBridge provides validated clinical tools that AI agents can use to support healthcare professionals with drug interaction checking, clinical risk assessment, lab interpretation, and patient data analysis.

## Tools

| Tool | Description |
|------|-------------|
| `check_drug_interactions` | Check drug-drug interactions among medications (40+ drug pairs, generic/brand name support) |
| `calculate_risk_score` | Calculate validated clinical risk scores (CHA₂DS₂-VASc, HEART, Wells PE, MELD, CURB-65, GCS) |
| `interpret_lab_result` | Interpret single lab values with reference ranges and clinical significance |
| `interpret_lab_panel` | Interpret multiple lab results with critical value flagging |
| `get_patient_summary` | Generate clinical summaries from FHIR R4 patient data |
| `medication_review` | Comprehensive medication review with condition/allergy cross-referencing |
| `list_risk_scores` | List available risk scoring systems with parameter guides |
| `list_lab_tests` | List supported lab tests with reference ranges |

## Clinical Capabilities

### Drug Interaction Database
- 40+ clinically significant drug-drug interactions
- 4 severity levels: contraindicated, major, moderate, minor
- Generic and brand name resolution (45+ medications)
- Mechanism, clinical effect, and management recommendations

### Risk Score Calculators
- **CHA₂DS₂-VASc**: Stroke risk in atrial fibrillation
- **HEART Score**: Major cardiac events in chest pain
- **Wells Score**: Pulmonary embolism probability
- **MELD/MELD-Na**: End-stage liver disease severity
- **CURB-65**: Community-acquired pneumonia severity
- **Glasgow Coma Scale**: Consciousness level assessment

### Lab Result Interpretation
- 16 common laboratory tests (CBC, BMP, liver, cardiac, coagulation, thyroid, inflammatory)
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
npm test              # Run tests (112 tests)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Architecture

```
src/
├── index.ts              # MCP server entry point (8 tools)
├── data/
│   ├── drug-interactions.ts  # Drug interaction database
│   ├── lab-references.ts     # Lab reference ranges
│   └── risk-scores.ts        # Clinical risk calculators
├── tools/
│   ├── drug-interaction-tool.ts
│   ├── lab-interpreter-tool.ts
│   ├── patient-summary-tool.ts
│   └── risk-score-tool.ts
└── utils/
    └── fhir.ts               # FHIR R4 utilities
```

## Healthcare Data Safety

- All demonstration data uses **synthetic patients only** (no real PHI)
- Designed for SHARP on MCP healthcare context propagation
- FHIR R4 compliant data handling

## License

MIT - Fulcria Labs

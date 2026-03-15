# HealthBridge MCP Server

A Clinical Decision Support MCP Server for healthcare AI agents. Built for the [Agents Assemble](https://agents-assemble.devpost.com/) Healthcare AI Hackathon.

HealthBridge provides **29 validated clinical tools**, 5 reference resources, and 4 workflow prompts that AI agents can use to support healthcare professionals with drug interaction checking, clinical risk assessment, lab interpretation, pharmacokinetic calculations, pediatric dosing, renal dose adjustment, allergy cross-reactivity screening, IV compatibility checking, pregnancy/lactation safety, opioid MEDD calculation, and FHIR patient data analysis.

## MCP Capabilities

### Tools (29)

| # | Tool | Description |
|---|------|-------------|
| 1 | `check_drug_interactions` | Check drug-drug interactions among medications (327 drug interaction pairs, generic/brand name support, 197 medications) |
| 2 | `calculate_risk_score` | Calculate validated clinical risk scores (25 scores including CHA₂DS₂-VASc, HEART, SOFA, ASCVD, NEWS2, HAS-BLED, TIMI, ABCD2, BMI) |
| 3 | `list_risk_scores` | List available risk scoring systems with parameter guides |
| 4 | `interpret_lab_result` | Interpret single lab values with reference ranges and clinical significance (49 lab tests) |
| 5 | `interpret_lab_panel` | Interpret multiple lab results with critical value flagging and pattern detection (6 lab patterns) |
| 6 | `list_lab_tests` | List supported lab tests with reference ranges |
| 7 | `get_patient_summary` | Generate clinical summaries from FHIR R4 patient data (SHARP-aware for live FHIR server access) |
| 8 | `medication_review` | Comprehensive medication review with condition/allergy cross-referencing, duplicate therapy detection, and Beers Criteria (8 PIMs) |
| 9 | `clinical_alerts` | Aggregated prioritized clinical alerts across all patient data — drug interactions, critical labs, risk scores, and medication safety |
| 10 | `check_renal_dosing` | Check medication dosing adjustments for CKD based on eGFR (27 renal-dosed drugs per KDIGO guidelines) |
| 11 | `renal_dose_lookup` | Look up renal dosing for a single drug including eGFR-based adjustments, dialyzability, and monitoring |
| 12 | `list_renal_dosing_drugs` | List all medications in the renal dosing database |
| 13 | `pediatric_dosing` | Calculate weight-based and age-based medication doses for pediatric patients (16 drugs per Harriet Lane/AAP guidelines) |
| 14 | `list_pediatric_drugs` | List pediatric dosing database with drug classes and minimum ages |
| 15 | `check_allergy_cross_reactivity` | Check drug allergy cross-reactivity between a known allergy and a proposed medication (9 allergy classes) |
| 16 | `screen_allergies` | Bulk screen all patient allergies against all proposed medications for cross-reactivity |
| 17 | `list_allergy_classes` | List all drug allergy classes with member drugs |
| 18 | `pk_calculator` | Run pharmacokinetic calculations: CrCl, IBW, ABW, BSA, corrected calcium, corrected phenytoin, anion gap (7 calculators) |
| 19 | `list_pk_calculators` | List available pharmacokinetic calculators with parameters |
| 20 | `check_iv_compatibility` | Check Y-site and admixture compatibility between two IV medications (60+ compatibility pairs) |
| 21 | `screen_iv_compatibility` | Screen all pairwise IV compatibility among multiple drugs — essential for ICU multi-drug infusion planning |
| 22 | `list_iv_drugs` | List all IV medications in the compatibility database |
| 23 | `check_pregnancy_safety` | Check medication safety during pregnancy and lactation with FDA categories, trimester-specific risks, and teratogenic data (22 drugs) |
| 24 | `screen_pregnancy_medications` | Screen all patient medications for pregnancy safety — identifies contraindicated and high-risk drugs with alternatives |
| 25 | `list_pregnancy_drugs` | List all medications in the pregnancy safety database with categories and lactation ratings |
| 26 | `calculate_opioid_mme` | Calculate Morphine Milligram Equivalent (MME) for an opioid dose per CDC 2022 guidelines (15 opioids) |
| 27 | `calculate_total_medd` | Calculate total MEDD across all opioids with CDC threshold warnings and naloxone recommendations |
| 28 | `convert_opioid_dose` | Convert between opioid doses with equianalgesic ratios and cross-tolerance dose reduction |
| 29 | `list_opioids` | List all opioids in the MEDD database with MME conversion factors |

### Resources (5)

| Resource | URI | Description |
|----------|-----|-------------|
| Drug Formulary | `healthbridge://formulary/overview` | Medication categories, interaction coverage, brand name support |
| Anticoagulation Guidelines | `healthbridge://guidelines/anticoagulation` | Evidence-based anticoagulation management workflow with DOAC dosing |
| Sepsis Guidelines | `healthbridge://guidelines/sepsis` | Surviving Sepsis Campaign hour-1 bundle and screening workflow |
| Lab Reference Ranges | `healthbridge://labs/reference-ranges` | Complete reference ranges and critical values for 49 lab tests |
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
- **325+ clinically significant drug-drug interactions** across 197 medications
- 4 severity levels: contraindicated, major, moderate, minor
- Generic and brand name resolution (45+ brand names mapped)
- Mechanism, clinical effect, and management recommendations
- Duplicate therapy detection

### Risk Score Calculators (25 Validated Scores)
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

### Renal Dosing Adjustments
- **18 medications** with eGFR-based dose adjustments per KDIGO guidelines
- Drug classes: antibiotics, anticoagulants, diabetic agents, analgesics, cardiovascular
- Dialyzability information and supplemental dosing guidance
- CKD stage mapping (G1-G5) with specific recommendations

### Pediatric Dosing
- **16 medications** with weight-based and age-based dosing
- Based on Harriet Lane Handbook and AAP guidelines
- Age-appropriateness validation with safety warnings
- Indication-specific dosing (e.g., otitis media vs pharyngitis)
- Maximum daily dose limits

### Allergy Cross-Reactivity
- **9 allergy classes**: penicillin/cephalosporin, sulfonamide, NSAID, opioid, local anesthetic, ACE inhibitor, statin, fluoroquinolone, carbapenem
- Evidence-based cross-reactivity risk levels (high, moderate, low, negligible)
- Safe alternative recommendations per allergy class
- Bulk screening: check all allergies against all medications in one call

### Pharmacokinetic Calculators (7)
- **CrCl**: Cockcroft-Gault creatinine clearance
- **IBW**: Ideal body weight (Devine formula)
- **ABW**: Adjusted body weight for obese patients
- **BSA**: Body surface area (Mosteller formula)
- **Corrected Calcium**: Albumin-adjusted calcium
- **Corrected Phenytoin**: Sheiner-Tozer equation for low albumin/renal impairment
- **Anion Gap**: With delta-delta ratio calculation

### IV Compatibility Checker
- **60+ compatibility pairs** covering common ICU and inpatient IV medications
- Y-site and admixture compatibility status (compatible, incompatible, variable, unknown)
- Brand name resolution (Zosyn, Levophed, Lasix, Precedex, etc.)
- High-risk pair flagging (ceftriaxone + calcium, vancomycin + piperacillin-tazobactam)
- Bulk screening for multi-drug infusion planning
- Based on Trissel's Handbook of Injectable Drugs

### Pregnancy & Lactation Safety
- **22 medications** with FDA pregnancy categories (A, B, C, D, X)
- Trimester-specific risk assessment (1st, 2nd, 3rd trimester)
- Lactation safety ratings (safe, probably safe, use caution, contraindicated)
- Teratogenic risk details with evidence
- Safer alternative recommendations per drug
- Patient counseling points for each medication
- Bulk medication screening for prenatal reconciliation

### Opioid MEDD Calculator
- **15 opioids** across oral, parenteral, transdermal, and sublingual routes
- Morphine Milligram Equivalent (MME) conversion per CDC/CMS factors
- CDC 50 MME and 90 MME/day threshold warnings
- Methadone tiered conversion (non-linear, dose-dependent factors)
- Buprenorphine partial agonist handling
- Equianalgesic opioid rotation with cross-tolerance dose reduction
- Naloxone co-prescribing recommendations
- Brand name resolution (OxyContin, Vicodin, Dilaudid, Duragesic, Suboxone)

### Lab Result Interpretation
- **49 laboratory tests** (CBC, BMP, liver, cardiac, coagulation, thyroid, inflammatory, lipid panel, minerals, urinalysis)
- **6 lab patterns** detected across panels (e.g., DIC, hepatorenal syndrome)
- Critical value identification with urgency levels
- Evidence-based action recommendations

### FHIR Integration
- FHIR R4 Bundle parsing (Patient, Condition, MedicationStatement, Observation, AllergyIntolerance)
- SHARP-aware: fetches live patient data when FHIR server context is available
- Synthetic patient data for demonstration
- Clinical note generation based on patient context

### Medication Safety
- **8 Beers Criteria PIMs** (Potentially Inappropriate Medications in elderly)
- Duplicate therapy detection across drug classes
- Condition-contraindication cross-referencing (renal, hepatic, bleeding risk)
- Allergy alert integration with cross-reactivity data

## Quick Start

```bash
npm install
npm run build
npm start       # Starts MCP server on stdio
```

## Development

```bash
npm run dev           # Run with tsx (hot reload)
npm test              # Run tests (2544 tests across 43 suites)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## Architecture

```
src/
├── index.ts              # MCP server entry point (stdio)
├── server-factory.ts     # Server factory (29 tools registered)
├── http-transport.ts     # HTTP/SSE transport for marketplace
├── agent-card.ts         # Agent card metadata
├── sharp-context.ts      # SHARP healthcare context propagation
├── resources.ts          # MCP resources (5 clinical reference resources)
├── prompts.ts            # MCP prompts (4 clinical workflow templates)
├── data/
│   ├── drug-interactions.ts      # Drug interaction database (327 pairs)
│   ├── lab-references.ts         # Lab reference ranges (49 tests)
│   ├── risk-scores.ts            # Clinical risk calculators (25 scores)
│   ├── renal-dosing.ts           # Renal dose adjustments (27 drugs)
│   ├── pediatric-dosing.ts       # Pediatric dosing (16 drugs)
│   ├── pharmacokinetics.ts       # PK calculators (7 calculators)
│   ├── allergy-crossreactivity.ts # Allergy classes (9 classes)
│   ├── iv-compatibility.ts       # IV compatibility data (60+ pairs)
│   ├── pregnancy-safety.ts       # Pregnancy/lactation safety (22 drugs)
│   └── opioid-medd.ts            # Opioid MEDD calculator (15 opioids)
├── tools/
│   ├── clinical-alerts-tool.ts        # Aggregated prioritized clinical alerts
│   ├── drug-interaction-tool.ts       # Drug interaction checker
│   ├── lab-interpreter-tool.ts        # Lab result interpreter
│   ├── patient-summary-tool.ts        # FHIR patient summary
│   ├── risk-score-tool.ts             # Risk score calculators
│   ├── renal-dosing-tool.ts           # Renal dose adjustments
│   ├── pediatric-dosing-tool.ts       # Pediatric dosing calculator
│   ├── allergy-crossreactivity-tool.ts # Allergy cross-reactivity
│   ├── pharmacokinetics-tool.ts       # PK calculators
│   ├── iv-compatibility-tool.ts       # IV compatibility checker
│   ├── pregnancy-safety-tool.ts       # Pregnancy safety checker
│   └── opioid-medd-tool.ts            # Opioid MEDD calculator
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
- **Security test suite**: Dedicated `security-hipaa.test.ts` validates PHI isolation between calls, injection resistance, input boundary handling, and cross-tool data consistency.
- **Minimum necessary principle**: Tools return only clinically relevant information. Patient identifiers from FHIR bundles are limited to name, age, and gender for clinical context.
- **SHARP on MCP**: Designed for healthcare context propagation through the MCP protocol, enabling secure agent-to-agent clinical data sharing.

## Test Coverage

**2444 tests across 42 test suites**, covering:
- Drug interaction detection and brand name resolution
- All 25 risk score calculators with boundary conditions
- Lab interpretation with critical values and panel patterns
- FHIR R4 bundle parsing and edge cases
- Renal dosing across all CKD stages
- Pediatric dosing with age/weight validation
- Allergy cross-reactivity across all 9 classes
- All 7 PK calculators
- IV compatibility (Y-site, admixture, brand names, bulk screening)
- Pregnancy safety (all FDA categories, trimester-specific, brand names)
- Opioid MEDD (MME calculation, methadone tiering, dose conversion, CDC thresholds)
- Clinical alerts aggregation
- Security/HIPAA compliance
- Medication review with Beers criteria

## License

MIT - Fulcria Labs

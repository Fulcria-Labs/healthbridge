import { generatePatientSummary, createSyntheticPatient, type FHIRBundle } from '../utils/fhir.js';

export interface PatientSummaryInput {
  fhirBundle?: FHIRBundle;
  useSyntheticData?: boolean;
}

export interface PatientSummaryOutput {
  patient: {
    name: string;
    age: number | null;
    gender: string;
  };
  conditions: string[];
  medications: Array<{ name: string; dosage: string }>;
  allergies: Array<{ substance: string; criticality: string; reactions: string[] }>;
  vitals: Record<string, { value: number; unit: string; date: string }>;
  clinicalNotes: string[];
  dataSource: string;
}

export function getPatientSummary(input: PatientSummaryInput): PatientSummaryOutput {
  let bundle: FHIRBundle;
  let dataSource: string;

  if (input.fhirBundle) {
    bundle = input.fhirBundle;
    dataSource = 'Provided FHIR Bundle';
  } else {
    bundle = createSyntheticPatient();
    dataSource = 'Synthetic demonstration data (no real patient data used)';
  }

  const summary = generatePatientSummary(bundle);

  // Generate clinical notes based on the data
  const clinicalNotes: string[] = [];

  if (summary.conditions.length > 0) {
    clinicalNotes.push(`Active conditions: ${summary.conditions.join(', ')}`);
  }

  if (summary.medications.length > 0) {
    clinicalNotes.push(`Currently on ${summary.medications.length} medication(s)`);
  }

  // Check for specific clinical considerations
  const medNames = summary.medications.map(m => m.name.toLowerCase());
  const condNames = summary.conditions.map(c => c.toLowerCase());

  if (condNames.some(c => c.includes('atrial fibrillation')) && medNames.some(m => m.includes('warfarin'))) {
    clinicalNotes.push('Note: Patient on anticoagulation for atrial fibrillation. Monitor INR regularly.');
  }

  if (condNames.some(c => c.includes('diabetes')) && medNames.some(m => m.includes('metformin'))) {
    clinicalNotes.push('Note: Monitor HbA1c every 3-6 months. Check renal function before metformin continuation.');
  }

  if (condNames.some(c => c.includes('hypertension'))) {
    clinicalNotes.push('Note: Monitor blood pressure regularly. Target <130/80 mmHg for most patients.');
  }

  if (summary.allergies.length > 0) {
    const highCrit = summary.allergies.filter(a => a.criticality === 'high');
    if (highCrit.length > 0) {
      clinicalNotes.push(`⚠️ High-criticality allergies: ${highCrit.map(a => a.substance).join(', ')}`);
    }
  }

  return {
    ...summary,
    clinicalNotes,
    dataSource,
  };
}

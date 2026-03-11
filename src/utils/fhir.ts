/**
 * FHIR R4 utilities for working with healthcare data.
 * Handles patient records, conditions, medications, and observations.
 */

// Simplified FHIR R4 types for our use case
export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  name?: Array<{ use?: string; family?: string; given?: string[]; text?: string }>;
  gender?: string;
  birthDate?: string;
  address?: Array<{ line?: string[]; city?: string; state?: string; postalCode?: string }>;
  telecom?: Array<{ system?: string; value?: string }>;
}

export interface FHIRCondition {
  resourceType: 'Condition';
  id: string;
  code?: { coding?: Array<{ system?: string; code?: string; display?: string }>; text?: string };
  clinicalStatus?: { coding?: Array<{ code?: string }> };
  verificationStatus?: { coding?: Array<{ code?: string }> };
  onsetDateTime?: string;
  category?: Array<{ coding?: Array<{ code?: string; display?: string }> }>;
}

export interface FHIRMedicationStatement {
  resourceType: 'MedicationStatement';
  id: string;
  medicationCodeableConcept?: { coding?: Array<{ system?: string; code?: string; display?: string }>; text?: string };
  status?: string;
  dosage?: Array<{ text?: string; timing?: { repeat?: { frequency?: number; period?: number; periodUnit?: string } } }>;
}

export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  code?: { coding?: Array<{ system?: string; code?: string; display?: string }>; text?: string };
  valueQuantity?: { value?: number; unit?: string; system?: string; code?: string };
  effectiveDateTime?: string;
  status?: string;
  interpretation?: Array<{ coding?: Array<{ code?: string; display?: string }> }>;
}

export interface FHIRAllergyIntolerance {
  resourceType: 'AllergyIntolerance';
  id: string;
  code?: { coding?: Array<{ system?: string; code?: string; display?: string }>; text?: string };
  type?: string;
  category?: string[];
  criticality?: string;
  reaction?: Array<{ manifestation?: Array<{ coding?: Array<{ display?: string }>; text?: string }>; severity?: string }>;
}

export interface FHIRBundle {
  resourceType: 'Bundle';
  type: string;
  entry?: Array<{ resource: FHIRPatient | FHIRCondition | FHIRMedicationStatement | FHIRObservation | FHIRAllergyIntolerance }>;
}

export type FHIRResource = FHIRPatient | FHIRCondition | FHIRMedicationStatement | FHIRObservation | FHIRAllergyIntolerance;

/**
 * Calculate age from birthdate
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get display name from FHIR patient
 */
export function getPatientName(patient: FHIRPatient): string {
  if (!patient.name?.length) return 'Unknown';
  const name = patient.name[0];
  if (name.text) return name.text;
  const given = name.given?.join(' ') ?? '';
  return `${given} ${name.family ?? ''}`.trim() || 'Unknown';
}

/**
 * Extract active conditions from FHIR data
 */
export function getActiveConditions(conditions: FHIRCondition[]): string[] {
  return conditions
    .filter(c => {
      const status = c.clinicalStatus?.coding?.[0]?.code;
      return status === 'active' || status === 'recurrence' || !status;
    })
    .map(c => c.code?.text ?? c.code?.coding?.[0]?.display ?? 'Unknown condition');
}

/**
 * Extract current medications from FHIR data
 */
export function getCurrentMedications(meds: FHIRMedicationStatement[]): Array<{ name: string; dosage: string }> {
  return meds
    .filter(m => m.status === 'active' || m.status === 'intended' || !m.status)
    .map(m => ({
      name: m.medicationCodeableConcept?.text ?? m.medicationCodeableConcept?.coding?.[0]?.display ?? 'Unknown',
      dosage: m.dosage?.[0]?.text ?? 'Dosage not specified',
    }));
}

/**
 * Get latest observation value for a given code
 */
export function getLatestObservation(observations: FHIRObservation[], code: string): FHIRObservation | null {
  const matching = observations
    .filter(o =>
      o.code?.coding?.some(c => c.code === code || c.display?.toLowerCase().includes(code.toLowerCase())) ||
      o.code?.text?.toLowerCase().includes(code.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = a.effectiveDateTime ? new Date(a.effectiveDateTime).getTime() : 0;
      const dateB = b.effectiveDateTime ? new Date(b.effectiveDateTime).getTime() : 0;
      return dateB - dateA;
    });

  return matching[0] ?? null;
}

/**
 * Extract allergies from FHIR data
 */
export function getAllergies(allergies: FHIRAllergyIntolerance[]): Array<{
  substance: string;
  type: string;
  criticality: string;
  reactions: string[];
}> {
  return allergies.map(a => ({
    substance: a.code?.text ?? a.code?.coding?.[0]?.display ?? 'Unknown',
    type: a.type ?? 'unknown',
    criticality: a.criticality ?? 'unknown',
    reactions: a.reaction?.flatMap(r =>
      r.manifestation?.map(m => m.text ?? m.coding?.[0]?.display ?? 'Unknown') ?? []
    ) ?? [],
  }));
}

/**
 * Generate a clinical summary from a FHIR bundle
 */
export function generatePatientSummary(bundle: FHIRBundle): {
  patient: { name: string; age: number | null; gender: string };
  conditions: string[];
  medications: Array<{ name: string; dosage: string }>;
  allergies: Array<{ substance: string; criticality: string; reactions: string[] }>;
  vitals: Record<string, { value: number; unit: string; date: string }>;
} {
  const resources = bundle.entry?.map(e => e.resource) ?? [];

  const patient = resources.find((r): r is FHIRPatient => r.resourceType === 'Patient');
  const conditions = resources.filter((r): r is FHIRCondition => r.resourceType === 'Condition');
  const medications = resources.filter((r): r is FHIRMedicationStatement => r.resourceType === 'MedicationStatement');
  const observations = resources.filter((r): r is FHIRObservation => r.resourceType === 'Observation');
  const allergies = resources.filter((r): r is FHIRAllergyIntolerance => r.resourceType === 'AllergyIntolerance');

  const vitalCodes = [
    { code: 'blood-pressure', display: 'Blood Pressure' },
    { code: 'heart-rate', display: 'Heart Rate' },
    { code: 'respiratory-rate', display: 'Respiratory Rate' },
    { code: 'body-temperature', display: 'Temperature' },
    { code: 'oxygen-saturation', display: 'SpO2' },
    { code: 'body-weight', display: 'Weight' },
    { code: 'body-height', display: 'Height' },
    { code: 'bmi', display: 'BMI' },
  ];

  const vitals: Record<string, { value: number; unit: string; date: string }> = {};
  for (const vital of vitalCodes) {
    const obs = getLatestObservation(observations, vital.code);
    if (obs?.valueQuantity?.value !== undefined) {
      vitals[vital.display] = {
        value: obs.valueQuantity.value,
        unit: obs.valueQuantity.unit ?? '',
        date: obs.effectiveDateTime ?? 'unknown',
      };
    }
  }

  return {
    patient: {
      name: patient ? getPatientName(patient) : 'Unknown',
      age: patient?.birthDate ? calculateAge(patient.birthDate) : null,
      gender: patient?.gender ?? 'unknown',
    },
    conditions: getActiveConditions(conditions),
    medications: getCurrentMedications(medications),
    allergies: getAllergies(allergies).map(a => ({
      substance: a.substance,
      criticality: a.criticality,
      reactions: a.reactions,
    })),
    vitals,
  };
}

/**
 * Create a synthetic patient FHIR bundle for demonstration
 */
export function createSyntheticPatient(): FHIRBundle {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry: [
      {
        resource: {
          resourceType: 'Patient',
          id: 'synth-001',
          name: [{ use: 'official', family: 'Smith', given: ['John', 'A'] }],
          gender: 'male',
          birthDate: '1958-03-15',
        }
      },
      {
        resource: {
          resourceType: 'Condition',
          id: 'cond-001',
          code: { text: 'Atrial Fibrillation', coding: [{ system: 'http://snomed.info/sct', code: '49436004', display: 'Atrial fibrillation' }] },
          clinicalStatus: { coding: [{ code: 'active' }] },
          onsetDateTime: '2020-06-15',
        }
      },
      {
        resource: {
          resourceType: 'Condition',
          id: 'cond-002',
          code: { text: 'Essential Hypertension', coding: [{ system: 'http://snomed.info/sct', code: '59621000', display: 'Essential hypertension' }] },
          clinicalStatus: { coding: [{ code: 'active' }] },
          onsetDateTime: '2015-01-10',
        }
      },
      {
        resource: {
          resourceType: 'Condition',
          id: 'cond-003',
          code: { text: 'Type 2 Diabetes Mellitus', coding: [{ system: 'http://snomed.info/sct', code: '44054006', display: 'Type 2 diabetes mellitus' }] },
          clinicalStatus: { coding: [{ code: 'active' }] },
          onsetDateTime: '2018-09-20',
        }
      },
      {
        resource: {
          resourceType: 'MedicationStatement',
          id: 'med-001',
          medicationCodeableConcept: { text: 'Warfarin 5mg', coding: [{ display: 'Warfarin' }] },
          status: 'active',
          dosage: [{ text: '5mg once daily' }],
        }
      },
      {
        resource: {
          resourceType: 'MedicationStatement',
          id: 'med-002',
          medicationCodeableConcept: { text: 'Metformin 1000mg', coding: [{ display: 'Metformin' }] },
          status: 'active',
          dosage: [{ text: '1000mg twice daily' }],
        }
      },
      {
        resource: {
          resourceType: 'MedicationStatement',
          id: 'med-003',
          medicationCodeableConcept: { text: 'Lisinopril 20mg', coding: [{ display: 'Lisinopril' }] },
          status: 'active',
          dosage: [{ text: '20mg once daily' }],
        }
      },
      {
        resource: {
          resourceType: 'AllergyIntolerance',
          id: 'allergy-001',
          code: { text: 'Penicillin' },
          type: 'allergy',
          category: ['medication'],
          criticality: 'high',
          reaction: [{ manifestation: [{ text: 'Anaphylaxis' }], severity: 'severe' }],
        }
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-001',
          code: { coding: [{ display: 'Heart Rate' }], text: 'heart-rate' },
          valueQuantity: { value: 88, unit: 'bpm' },
          effectiveDateTime: '2026-03-10T10:30:00Z',
          status: 'final',
        }
      },
      {
        resource: {
          resourceType: 'Observation',
          id: 'obs-002',
          code: { coding: [{ display: 'Blood Pressure' }], text: 'blood-pressure' },
          valueQuantity: { value: 142, unit: 'mmHg' },
          effectiveDateTime: '2026-03-10T10:30:00Z',
          status: 'final',
        }
      },
    ],
  };
}

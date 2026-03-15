/**
 * Antibiotic Stewardship Tool
 *
 * MCP tools for antibiotic spectrum lookup, empiric therapy recommendations,
 * and de-escalation guidance. Supports antimicrobial stewardship programs.
 */

import {
  getAntibioticSpectrum,
  getEmpiricTherapy,
  getDeescalationSuggestions,
  listAntibiotics as listAntibioticsData,
  listInfectionTypes as listInfectionTypesData,
} from '../data/antibiotic-stewardship.js';

export function lookupAntibioticSpectrum(input: { antibiotic: string }) {
  return getAntibioticSpectrum(input.antibiotic);
}

export function lookupEmpiricTherapy(input: { infectionType: string }) {
  return getEmpiricTherapy(input.infectionType);
}

export function suggestDeescalation(input: {
  currentAntibiotic: string;
  organism: string;
  susceptibility: string;
}) {
  return getDeescalationSuggestions(input);
}

export function listAntibiotics() {
  return listAntibioticsData();
}

export function listInfectionTypes() {
  return listInfectionTypesData();
}

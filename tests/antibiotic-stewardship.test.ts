import { describe, it, expect } from 'vitest';
import {
  getAntibioticSpectrum,
  getEmpiricTherapy,
  getDeescalationSuggestions,
  listAntibiotics,
  listInfectionTypes,
} from '../src/data/antibiotic-stewardship.js';

// ==========================================================================
// Antibiotic Spectrum Tests
// ==========================================================================

describe('Antibiotic Spectrum Tool', () => {
  describe('Basic Spectrum Lookups', () => {
    it('should return spectrum for amoxicillin', () => {
      const result = getAntibioticSpectrum('amoxicillin');
      expect(result.found).toBe(true);
      expect(result.antibiotic!.name).toBe('amoxicillin');
      expect(result.antibiotic!.class).toBe('Aminopenicillin');
      expect(result.antibiotic!.gramPositive).toBe('good');
      expect(result.antibiotic!.gramNegative).toBe('moderate');
      expect(result.antibiotic!.atypical).toBe('none');
    });

    it('should return spectrum for vancomycin with excellent gram-positive coverage', () => {
      const result = getAntibioticSpectrum('vancomycin');
      expect(result.found).toBe(true);
      expect(result.antibiotic!.gramPositive).toBe('excellent');
      expect(result.antibiotic!.gramNegative).toBe('none');
      expect(result.antibiotic!.keyCoverage).toContain('MRSA');
    });

    it('should return spectrum for meropenem as a broad-spectrum carbapenem', () => {
      const result = getAntibioticSpectrum('meropenem');
      expect(result.found).toBe(true);
      expect(result.antibiotic!.class).toBe('Carbapenem');
      expect(result.antibiotic!.gramNegative).toBe('excellent');
      expect(result.antibiotic!.anaerobic).toBe('excellent');
      expect(result.antibiotic!.broadSpectrum).toBe(true);
    });

    it('should return spectrum for metronidazole with anaerobic-only coverage', () => {
      const result = getAntibioticSpectrum('metronidazole');
      expect(result.found).toBe(true);
      expect(result.antibiotic!.gramPositive).toBe('none');
      expect(result.antibiotic!.gramNegative).toBe('none');
      expect(result.antibiotic!.anaerobic).toBe('excellent');
      expect(result.antibiotic!.keyCoverage).toContain('Bacteroides fragilis');
    });

    it('should return spectrum for azithromycin with atypical coverage', () => {
      const result = getAntibioticSpectrum('azithromycin');
      expect(result.found).toBe(true);
      expect(result.antibiotic!.atypical).toBe('excellent');
      expect(result.antibiotic!.keyCoverage).toContain('Mycoplasma pneumoniae');
      expect(result.antibiotic!.keyCoverage).toContain('Legionella pneumophila');
    });

    it('should return spectrum for piperacillin-tazobactam', () => {
      const result = getAntibioticSpectrum('piperacillin-tazobactam');
      expect(result.found).toBe(true);
      expect(result.antibiotic!.gramNegative).toBe('excellent');
      expect(result.antibiotic!.anaerobic).toBe('excellent');
      expect(result.antibiotic!.broadSpectrum).toBe(true);
      expect(result.antibiotic!.keyCoverage).toContain('Pseudomonas aeruginosa');
    });

    it('should return spectrum for nitrofurantoin as narrow UTI agent', () => {
      const result = getAntibioticSpectrum('nitrofurantoin');
      expect(result.found).toBe(true);
      expect(result.antibiotic!.broadSpectrum).toBe(false);
      expect(result.antibiotic!.awareCategory).toBe('Access');
      expect(result.antibiotic!.commonUses).toContain('Uncomplicated cystitis (first-line)');
    });

    it('should return spectrum for doxycycline with MRSA and atypical coverage', () => {
      const result = getAntibioticSpectrum('doxycycline');
      expect(result.found).toBe(true);
      expect(result.antibiotic!.atypical).toBe('good');
      expect(result.antibiotic!.keyCoverage).toContain('MRSA (community-acquired)');
      expect(result.antibiotic!.keyCoverage).toContain('Rickettsia spp.');
    });

    it('should return spectrum for ceftriaxone as a third-gen cephalosporin', () => {
      const result = getAntibioticSpectrum('ceftriaxone');
      expect(result.found).toBe(true);
      expect(result.antibiotic!.class).toBe('Third-generation cephalosporin');
      expect(result.antibiotic!.gramNegative).toBe('excellent');
      expect(result.antibiotic!.notablGaps).toContain('Pseudomonas aeruginosa');
    });

    it('should return spectrum for linezolid as a Reserve agent', () => {
      const result = getAntibioticSpectrum('linezolid');
      expect(result.found).toBe(true);
      expect(result.antibiotic!.awareCategory).toBe('Reserve');
      expect(result.antibiotic!.keyCoverage).toContain('VRE (E. faecium and E. faecalis)');
      expect(result.antibiotic!.gramNegative).toBe('none');
    });
  });

  describe('Brand Name Resolution', () => {
    it('should resolve Zosyn to piperacillin-tazobactam', () => {
      const result = getAntibioticSpectrum('Zosyn');
      expect(result.found).toBe(true);
      expect(result.resolvedName).toBe('piperacillin-tazobactam');
    });

    it('should resolve Augmentin to amoxicillin-clavulanate', () => {
      const result = getAntibioticSpectrum('Augmentin');
      expect(result.found).toBe(true);
      expect(result.resolvedName).toBe('amoxicillin-clavulanate');
    });

    it('should resolve Rocephin to ceftriaxone', () => {
      const result = getAntibioticSpectrum('Rocephin');
      expect(result.found).toBe(true);
      expect(result.resolvedName).toBe('ceftriaxone');
    });

    it('should resolve Flagyl to metronidazole', () => {
      const result = getAntibioticSpectrum('Flagyl');
      expect(result.found).toBe(true);
      expect(result.resolvedName).toBe('metronidazole');
    });

    it('should resolve Vancocin to vancomycin', () => {
      const result = getAntibioticSpectrum('Vancocin');
      expect(result.found).toBe(true);
      expect(result.resolvedName).toBe('vancomycin');
    });

    it('should resolve Bactrim to trimethoprim-sulfamethoxazole', () => {
      const result = getAntibioticSpectrum('Bactrim');
      expect(result.found).toBe(true);
      expect(result.resolvedName).toBe('trimethoprim-sulfamethoxazole');
    });

    it('should resolve Levaquin to levofloxacin', () => {
      const result = getAntibioticSpectrum('Levaquin');
      expect(result.found).toBe(true);
      expect(result.resolvedName).toBe('levofloxacin');
    });

    it('should resolve Zyvox to linezolid', () => {
      const result = getAntibioticSpectrum('Zyvox');
      expect(result.found).toBe(true);
      expect(result.resolvedName).toBe('linezolid');
    });

    it('should resolve Merrem to meropenem', () => {
      const result = getAntibioticSpectrum('Merrem');
      expect(result.found).toBe(true);
      expect(result.resolvedName).toBe('meropenem');
    });

    it('should resolve Cubicin to daptomycin', () => {
      const result = getAntibioticSpectrum('Cubicin');
      expect(result.found).toBe(true);
      expect(result.resolvedName).toBe('daptomycin');
    });
  });

  describe('Unknown Antibiotics', () => {
    it('should return not found for unknown antibiotic', () => {
      const result = getAntibioticSpectrum('fakemycin');
      expect(result.found).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should return not found for empty string', () => {
      const result = getAntibioticSpectrum('');
      expect(result.found).toBe(false);
    });
  });

  describe('WHO AWaRe Classification', () => {
    it('should classify amoxicillin as Access', () => {
      const result = getAntibioticSpectrum('amoxicillin');
      expect(result.antibiotic!.awareCategory).toBe('Access');
    });

    it('should classify ceftriaxone as Watch', () => {
      const result = getAntibioticSpectrum('ceftriaxone');
      expect(result.antibiotic!.awareCategory).toBe('Watch');
    });

    it('should classify ceftazidime-avibactam as Reserve', () => {
      const result = getAntibioticSpectrum('ceftazidime-avibactam');
      expect(result.antibiotic!.awareCategory).toBe('Reserve');
    });

    it('should classify daptomycin as Reserve', () => {
      const result = getAntibioticSpectrum('daptomycin');
      expect(result.antibiotic!.awareCategory).toBe('Reserve');
    });

    it('should classify metronidazole as Access', () => {
      const result = getAntibioticSpectrum('metronidazole');
      expect(result.antibiotic!.awareCategory).toBe('Access');
    });
  });

  describe('Resistance Concerns', () => {
    it('should flag fluoroquinolone FDA Black Box warnings', () => {
      const result = getAntibioticSpectrum('levofloxacin');
      expect(result.antibiotic!.resistanceConcerns.some(r => r.includes('FDA Black Box'))).toBe(true);
    });

    it('should flag C. difficile risk for meropenem', () => {
      const result = getAntibioticSpectrum('meropenem');
      expect(result.antibiotic!.resistanceConcerns.some(r => r.includes('C. difficile'))).toBe(true);
    });

    it('should flag daptomycin pulmonary surfactant inactivation', () => {
      const result = getAntibioticSpectrum('daptomycin');
      expect(result.antibiotic!.resistanceConcerns.some(r => r.includes('surfactant'))).toBe(true);
    });

    it('should flag vancomycin nephrotoxicity', () => {
      const result = getAntibioticSpectrum('vancomycin');
      expect(result.antibiotic!.resistanceConcerns.some(r => r.includes('Nephrotoxicity') || r.includes('nephrotoxicity'))).toBe(true);
    });
  });

  describe('Broad vs Narrow Spectrum', () => {
    it('should classify meropenem as broad-spectrum', () => {
      expect(getAntibioticSpectrum('meropenem').antibiotic!.broadSpectrum).toBe(true);
    });

    it('should classify piperacillin-tazobactam as broad-spectrum', () => {
      expect(getAntibioticSpectrum('piperacillin-tazobactam').antibiotic!.broadSpectrum).toBe(true);
    });

    it('should classify cephalexin as narrow-spectrum', () => {
      expect(getAntibioticSpectrum('cephalexin').antibiotic!.broadSpectrum).toBe(false);
    });

    it('should classify vancomycin as narrow-spectrum (gram-positive only)', () => {
      expect(getAntibioticSpectrum('vancomycin').antibiotic!.broadSpectrum).toBe(false);
    });

    it('should classify nitrofurantoin as narrow-spectrum', () => {
      expect(getAntibioticSpectrum('nitrofurantoin').antibiotic!.broadSpectrum).toBe(false);
    });
  });
});

// ==========================================================================
// Empiric Therapy Tests
// ==========================================================================

describe('Empiric Therapy Tool', () => {
  describe('Community-Acquired Pneumonia', () => {
    it('should return CAP recommendations', () => {
      const result = getEmpiricTherapy('community-acquired pneumonia');
      expect(result.found).toBe(true);
      expect(result.recommendation!.infectionType).toContain('Community-Acquired Pneumonia');
      expect(result.recommendation!.firstLine.length).toBeGreaterThan(0);
    });

    it('should include amoxicillin as first-line for outpatient CAP', () => {
      const result = getEmpiricTherapy('community-acquired pneumonia');
      const firstLineNames = result.recommendation!.firstLine.map(r => r.name);
      expect(firstLineNames).toContain('amoxicillin');
    });

    it('should include doxycycline as first-line alternative for CAP', () => {
      const result = getEmpiricTherapy('community-acquired pneumonia');
      const firstLineNames = result.recommendation!.firstLine.map(r => r.name);
      expect(firstLineNames).toContain('doxycycline');
    });

    it('should reference IDSA/ATS guidelines', () => {
      const result = getEmpiricTherapy('community-acquired pneumonia');
      expect(result.recommendation!.guidelineSource).toContain('IDSA');
    });

    it('should resolve "CAP" alias', () => {
      const result = getEmpiricTherapy('CAP');
      expect(result.found).toBe(true);
      expect(result.recommendation!.infectionType).toContain('Pneumonia');
    });

    it('should resolve "pneumonia" alias', () => {
      const result = getEmpiricTherapy('pneumonia');
      expect(result.found).toBe(true);
    });
  });

  describe('UTI Recommendations', () => {
    it('should return uncomplicated UTI recommendations', () => {
      const result = getEmpiricTherapy('UTI');
      expect(result.found).toBe(true);
      expect(result.recommendation!.infectionType).toContain('Cystitis');
    });

    it('should include nitrofurantoin as first-line for uncomplicated UTI', () => {
      const result = getEmpiricTherapy('cystitis');
      const firstLineNames = result.recommendation!.firstLine.map(r => r.name);
      expect(firstLineNames).toContain('nitrofurantoin');
    });

    it('should include TMP-SMX as first-line for uncomplicated UTI', () => {
      const result = getEmpiricTherapy('UTI');
      const firstLineNames = result.recommendation!.firstLine.map(r => r.name);
      expect(firstLineNames).toContain('trimethoprim-sulfamethoxazole');
    });

    it('should warn against fluoroquinolones for uncomplicated UTI', () => {
      const result = getEmpiricTherapy('cystitis');
      expect(result.recommendation!.considerations.some(c => c.includes('Fluoroquinolones'))).toBe(true);
    });

    it('should return complicated UTI/pyelonephritis recommendations', () => {
      const result = getEmpiricTherapy('pyelonephritis');
      expect(result.found).toBe(true);
      expect(result.recommendation!.infectionType).toContain('Complicated UTI');
    });
  });

  describe('Skin/Soft Tissue Infections', () => {
    it('should return SSTI recommendations', () => {
      const result = getEmpiricTherapy('cellulitis');
      expect(result.found).toBe(true);
      expect(result.recommendation!.infectionType).toContain('Skin');
    });

    it('should include cephalexin for non-purulent SSTI', () => {
      const result = getEmpiricTherapy('skin-soft-tissue');
      const firstLineNames = result.recommendation!.firstLine.map(r => r.name);
      expect(firstLineNames).toContain('cephalexin');
    });

    it('should include TMP-SMX for purulent SSTI (MRSA coverage)', () => {
      const result = getEmpiricTherapy('SSTI');
      const firstLineNames = result.recommendation!.firstLine.map(r => r.name);
      expect(firstLineNames).toContain('trimethoprim-sulfamethoxazole');
    });

    it('should mention necrotizing fasciitis as surgical emergency', () => {
      const result = getEmpiricTherapy('skin infection');
      expect(result.recommendation!.considerations.some(c => c.includes('Necrotizing fasciitis'))).toBe(true);
    });
  });

  describe('Sepsis', () => {
    it('should return sepsis empiric recommendations', () => {
      const result = getEmpiricTherapy('sepsis');
      expect(result.found).toBe(true);
      expect(result.recommendation!.infectionType).toContain('Sepsis');
    });

    it('should recommend antibiotics within 1 hour', () => {
      const result = getEmpiricTherapy('sepsis');
      expect(result.recommendation!.considerations.some(c => c.includes('1 HOUR'))).toBe(true);
    });

    it('should include vancomycin + piperacillin-tazobactam as first-line', () => {
      const result = getEmpiricTherapy('sepsis');
      const firstLineNames = result.recommendation!.firstLine.map(r => r.name);
      expect(firstLineNames.some(n => n.includes('vancomycin'))).toBe(true);
    });

    it('should emphasize de-escalation at 48-72h', () => {
      const result = getEmpiricTherapy('sepsis');
      const durations = result.recommendation!.firstLine.map(r => r.duration || '');
      expect(durations.some(d => d.includes('48-72h'))).toBe(true);
    });

    it('should resolve "septic shock" alias', () => {
      const result = getEmpiricTherapy('septic shock');
      expect(result.found).toBe(true);
    });
  });

  describe('Meningitis', () => {
    it('should return meningitis empiric recommendations', () => {
      const result = getEmpiricTherapy('meningitis');
      expect(result.found).toBe(true);
      expect(result.recommendation!.firstLine.length).toBeGreaterThan(0);
    });

    it('should include ceftriaxone + vancomycin for standard empiric meningitis', () => {
      const result = getEmpiricTherapy('meningitis');
      const firstLineNames = result.recommendation!.firstLine.map(r => r.name);
      expect(firstLineNames.some(n => n.includes('ceftriaxone') && n.includes('vancomycin'))).toBe(true);
    });

    it('should mention dexamethasone for bacterial meningitis', () => {
      const result = getEmpiricTherapy('meningitis');
      expect(result.recommendation!.considerations.some(c => c.includes('Dexamethasone') || c.includes('dexamethasone'))).toBe(true);
    });
  });

  describe('Intra-Abdominal Infections', () => {
    it('should return IAI recommendations', () => {
      const result = getEmpiricTherapy('intra-abdominal');
      expect(result.found).toBe(true);
    });

    it('should emphasize source control', () => {
      const result = getEmpiricTherapy('intra-abdominal');
      expect(result.recommendation!.considerations.some(c => c.includes('SOURCE CONTROL') || c.includes('source control'))).toBe(true);
    });

    it('should resolve "appendicitis" alias', () => {
      const result = getEmpiricTherapy('appendicitis');
      expect(result.found).toBe(true);
    });

    it('should resolve "diverticulitis" alias', () => {
      const result = getEmpiricTherapy('diverticulitis');
      expect(result.found).toBe(true);
    });
  });

  describe('C. difficile', () => {
    it('should return CDI recommendations', () => {
      const result = getEmpiricTherapy('c diff');
      expect(result.found).toBe(true);
      expect(result.recommendation!.infectionType).toContain('Clostridioides difficile');
    });

    it('should include fidaxomicin as preferred first-line', () => {
      const result = getEmpiricTherapy('CDI');
      const firstLineNames = result.recommendation!.firstLine.map(r => r.name);
      expect(firstLineNames).toContain('fidaxomicin');
    });

    it('should mention stopping offending antibiotic', () => {
      const result = getEmpiricTherapy('c. diff');
      expect(result.recommendation!.considerations.some(c => c.includes('STOP') || c.includes('stop'))).toBe(true);
    });

    it('should mention fecal microbiota transplant for recurrence', () => {
      const result = getEmpiricTherapy('c difficile');
      expect(result.recommendation!.considerations.some(c => c.includes('Fecal microbiota'))).toBe(true);
    });
  });

  describe('Unknown Infection Types', () => {
    it('should return not found for unknown infection type', () => {
      const result = getEmpiricTherapy('alien brain fever');
      expect(result.found).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.availableTypes).toBeDefined();
    });
  });
});

// ==========================================================================
// De-escalation Tests
// ==========================================================================

describe('Antibiotic De-escalation Tool', () => {
  describe('Meropenem De-escalation', () => {
    it('should suggest ceftriaxone for meropenem with susceptible E. coli', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'meropenem',
        organism: 'E. coli',
        susceptibility: 'susceptible to ceftriaxone',
      });
      expect(result.narrowSpectrumAlternatives.length).toBeGreaterThan(0);
      expect(result.narrowSpectrumAlternatives.some(a => a.drug === 'ceftriaxone')).toBe(true);
      expect(result.deescalationPriority).toBe('high');
    });

    it('should suggest ertapenem for meropenem with ESBL E. coli', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'meropenem',
        organism: 'E. coli',
        susceptibility: 'ESBL-producing',
      });
      expect(result.narrowSpectrumAlternatives.some(a => a.drug === 'ertapenem')).toBe(true);
    });

    it('should include stewardship notes for carbapenem de-escalation', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'meropenem',
        organism: 'E. coli',
        susceptibility: 'susceptible to ceftriaxone',
      });
      expect(result.stewardshipNotes.length).toBeGreaterThan(0);
      expect(result.stewardshipNotes.some(n => n.includes('CRE') || n.includes('carbapenem') || n.includes('cost'))).toBe(true);
    });

    it('should suggest de-escalation for meropenem with susceptible Klebsiella', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'meropenem',
        organism: 'Klebsiella',
        susceptibility: 'susceptible to ceftriaxone',
      });
      expect(result.narrowSpectrumAlternatives.length).toBeGreaterThan(0);
      expect(result.deescalationPriority).toBe('high');
    });
  });

  describe('Vancomycin De-escalation', () => {
    it('should strongly recommend de-escalation from vancomycin for MSSA', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'vancomycin',
        organism: 'MSSA',
        susceptibility: 'methicillin-susceptible',
      });
      expect(result.deescalationPriority).toBe('high');
      expect(result.narrowSpectrumAlternatives.some(a => a.drug === 'cefazolin')).toBe(true);
      expect(result.reasoning).toContain('INFERIOR');
    });

    it('should suggest ampicillin for vancomycin with susceptible E. faecalis', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'vancomycin',
        organism: 'Enterococcus faecalis',
        susceptibility: 'ampicillin-susceptible',
      });
      expect(result.narrowSpectrumAlternatives.some(a => a.drug === 'ampicillin')).toBe(true);
      expect(result.deescalationPriority).toBe('high');
    });
  });

  describe('Piperacillin-Tazobactam De-escalation', () => {
    it('should suggest cefazolin for pip-tazo with MSSA', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'piperacillin-tazobactam',
        organism: 'MSSA',
        susceptibility: 'methicillin-susceptible',
      });
      expect(result.narrowSpectrumAlternatives.some(a => a.drug === 'cefazolin')).toBe(true);
      expect(result.deescalationPriority).toBe('high');
    });

    it('should suggest ceftriaxone for pip-tazo with susceptible E. coli', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'piperacillin-tazobactam',
        organism: 'E. coli',
        susceptibility: 'susceptible to ceftriaxone',
      });
      expect(result.narrowSpectrumAlternatives.some(a => a.drug === 'ceftriaxone')).toBe(true);
    });

    it('should suggest ampicillin for pip-tazo with susceptible Strep pneumoniae', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'piperacillin-tazobactam',
        organism: 'Streptococcus pneumoniae',
        susceptibility: 'penicillin-susceptible',
      });
      expect(result.narrowSpectrumAlternatives.length).toBeGreaterThan(0);
    });
  });

  describe('Cefepime De-escalation', () => {
    it('should suggest ceftriaxone for cefepime with susceptible E. coli', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'cefepime',
        organism: 'E. coli',
        susceptibility: 'susceptible to ceftriaxone',
      });
      expect(result.narrowSpectrumAlternatives.some(a => a.drug === 'ceftriaxone')).toBe(true);
    });

    it('should suggest ciprofloxacin step-down for cefepime with susceptible Pseudomonas', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'cefepime',
        organism: 'Pseudomonas aeruginosa',
        susceptibility: 'susceptible to ceftazidime',
      });
      expect(result.narrowSpectrumAlternatives.some(a => a.drug === 'ciprofloxacin')).toBe(true);
    });
  });

  describe('Dual Therapy De-escalation', () => {
    it('should suggest narrowing from vancomycin + pip-tazo combo', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'vancomycin + piperacillin-tazobactam',
        organism: 'E. coli',
        susceptibility: 'susceptible to ceftriaxone, MRSA ruled out',
      });
      expect(result.narrowSpectrumAlternatives.length).toBeGreaterThan(0);
      expect(result.deescalationPriority).toBe('high');
    });
  });

  describe('Generic De-escalation Guidance', () => {
    it('should return general guidance for unmatched organism/antibiotic', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'meropenem',
        organism: 'Acinetobacter baumannii',
        susceptibility: 'susceptible to colistin only',
      });
      expect(result.reasoning).toContain('No specific de-escalation mapping');
      expect(result.stewardshipNotes.length).toBeGreaterThan(0);
    });

    it('should provide general principles when no specific match', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'linezolid',
        organism: 'VRE',
        susceptibility: 'linezolid-susceptible',
      });
      expect(result.stewardshipNotes.some(n => n.includes('narrowest'))).toBe(true);
    });
  });

  describe('Stewardship Metadata', () => {
    it('should include caveats in de-escalation suggestions', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'meropenem',
        organism: 'E. coli',
        susceptibility: 'susceptible to ceftriaxone',
      });
      expect(result.caveats.length).toBeGreaterThan(0);
    });

    it('should include cost/ecological notes', () => {
      const result = getDeescalationSuggestions({
        currentAntibiotic: 'meropenem',
        organism: 'E. coli',
        susceptibility: 'susceptible to ceftriaxone',
      });
      expect(result.stewardshipNotes.some(n => n.includes('cost') || n.includes('Cost'))).toBe(true);
    });
  });
});

// ==========================================================================
// List Functions Tests
// ==========================================================================

describe('List Functions', () => {
  describe('listAntibiotics', () => {
    it('should return at least 25 antibiotics', () => {
      const antibiotics = listAntibiotics();
      expect(antibiotics.length).toBeGreaterThanOrEqual(25);
    });

    it('should include name, class, and AWaRe category for each', () => {
      const antibiotics = listAntibiotics();
      for (const abx of antibiotics) {
        expect(abx.name).toBeDefined();
        expect(abx.class).toBeDefined();
        expect(abx.awareCategory).toBeDefined();
        expect(['Access', 'Watch', 'Reserve']).toContain(abx.awareCategory);
      }
    });

    it('should include both broad and narrow spectrum agents', () => {
      const antibiotics = listAntibiotics();
      expect(antibiotics.some(a => a.broadSpectrum === true)).toBe(true);
      expect(antibiotics.some(a => a.broadSpectrum === false)).toBe(true);
    });
  });

  describe('listInfectionTypes', () => {
    it('should return at least 10 infection types', () => {
      const types = listInfectionTypes();
      expect(types.length).toBeGreaterThanOrEqual(10);
    });

    it('should include guideline source for each', () => {
      const types = listInfectionTypes();
      for (const t of types) {
        expect(t.guidelineSource).toBeDefined();
        expect(t.guidelineSource.length).toBeGreaterThan(0);
      }
    });

    it('should cover UTI, pneumonia, and sepsis', () => {
      const types = listInfectionTypes();
      const typeNames = types.map(t => t.infectionType.toLowerCase());
      expect(typeNames.some(t => t.includes('uti') || t.includes('cystitis'))).toBe(true);
      expect(typeNames.some(t => t.includes('pneumonia'))).toBe(true);
      expect(typeNames.some(t => t.includes('sepsis'))).toBe(true);
    });
  });
});

// ==========================================================================
// Clinical Accuracy Tests
// ==========================================================================

describe('Clinical Accuracy Checks', () => {
  it('should not recommend fluoroquinolones as first-line for uncomplicated UTI', () => {
    const result = getEmpiricTherapy('uti-uncomplicated');
    const firstLineNames = result.recommendation!.firstLine.map(r => r.name.toLowerCase());
    expect(firstLineNames.every(n => !n.includes('ciprofloxacin') && !n.includes('levofloxacin'))).toBe(true);
  });

  it('should classify daptomycin with pneumonia contraindication in resistance concerns', () => {
    const result = getAntibioticSpectrum('daptomycin');
    const allConcerns = result.antibiotic!.resistanceConcerns.join(' ').toLowerCase();
    expect(allConcerns).toContain('pneumonia');
    expect(allConcerns).toContain('surfactant');
  });

  it('should include ampicillin for Listeria coverage in meningitis >50y', () => {
    const result = getEmpiricTherapy('meningitis');
    const allRegimens = [...result.recommendation!.firstLine, ...result.recommendation!.alternatives];
    expect(allRegimens.some(r => r.name.toLowerCase().includes('ampicillin'))).toBe(true);
  });

  it('should flag nitrofurantoin as unsuitable for pyelonephritis', () => {
    const result = getAntibioticSpectrum('nitrofurantoin');
    const concerns = result.antibiotic!.resistanceConcerns.join(' ');
    expect(concerns).toContain('pyelonephritis');
  });

  it('should recommend vancomycin as INFERIOR to beta-lactams for MSSA', () => {
    const result = getDeescalationSuggestions({
      currentAntibiotic: 'vancomycin',
      organism: 'MSSA',
      susceptibility: 'methicillin-susceptible',
    });
    expect(result.reasoning).toContain('INFERIOR');
  });

  it('should not include Pseudomonas coverage for ertapenem', () => {
    const result = getAntibioticSpectrum('ertapenem');
    expect(result.antibiotic!.notablGaps).toContain('Pseudomonas aeruginosa');
  });

  it('should reference Surviving Sepsis Campaign for sepsis guidelines', () => {
    const result = getEmpiricTherapy('sepsis');
    expect(result.recommendation!.guidelineSource).toContain('Surviving Sepsis Campaign');
  });

  it('should mention MERINO trial caveat for pip-tazo in ESBL bacteremia', () => {
    const result = getDeescalationSuggestions({
      currentAntibiotic: 'meropenem',
      organism: 'E. coli',
      susceptibility: 'ESBL-producing',
    });
    expect(result.caveats.some(c => c.includes('MERINO'))).toBe(true);
  });

  it('should include oral step-down options in de-escalation', () => {
    const result = getDeescalationSuggestions({
      currentAntibiotic: 'meropenem',
      organism: 'E. coli',
      susceptibility: 'susceptible to ceftriaxone',
    });
    expect(result.narrowSpectrumAlternatives.some(a => a.route === 'oral')).toBe(true);
  });

  it('should include source control emphasis for intra-abdominal infections', () => {
    const result = getEmpiricTherapy('intra-abdominal');
    const allText = result.recommendation!.considerations.join(' ');
    expect(allText).toContain('SOURCE CONTROL');
  });
});

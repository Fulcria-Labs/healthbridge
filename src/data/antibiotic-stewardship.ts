/**
 * Antibiotic Stewardship Database
 *
 * Evidence-based antibiotic spectrum, empiric therapy guidelines (IDSA 2024),
 * and de-escalation recommendations for antimicrobial stewardship programs.
 *
 * References:
 *   - IDSA Practice Guidelines (various, 2019-2024)
 *   - Sanford Guide to Antimicrobial Therapy, 54th ed. (2024)
 *   - CDC Core Elements of Hospital Antibiotic Stewardship Programs (2024)
 *   - WHO AWaRe Classification 2023
 *   - Johns Hopkins ABX Guide
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GramCoverage = 'excellent' | 'good' | 'moderate' | 'limited' | 'none';

export interface AntibioticSpectrum {
  name: string;
  class: string;
  gramPositive: GramCoverage;
  gramNegative: GramCoverage;
  anaerobic: GramCoverage;
  atypical: GramCoverage;
  /** Key organisms covered */
  keyCoverage: string[];
  /** Notable gaps in coverage */
  notablGaps: string[];
  commonUses: string[];
  resistanceConcerns: string[];
  route: string[];
  /** WHO AWaRe category: Access, Watch, or Reserve */
  awareCategory: 'Access' | 'Watch' | 'Reserve';
  /** Whether this antibiotic is considered broad-spectrum */
  broadSpectrum: boolean;
  /** Common brand names */
  brandNames: string[];
}

export interface EmpiricRegimen {
  name: string;
  dose?: string;
  route: string;
  duration?: string;
  notes?: string;
}

export interface EmpiricTherapyRecommendation {
  infectionType: string;
  setting: string;
  firstLine: EmpiricRegimen[];
  alternatives: EmpiricRegimen[];
  considerations: string[];
  guidelineSource: string;
  /** When to broaden or narrow coverage */
  escalationCriteria?: string[];
  deEscalationTarget?: string;
}

export interface DeescalationSuggestion {
  currentAntibiotic: string;
  organism: string;
  susceptibility: string;
  narrowSpectrumAlternatives: Array<{
    drug: string;
    dose: string;
    route: string;
    rationale: string;
  }>;
  deescalationPriority: 'high' | 'moderate' | 'low';
  reasoning: string;
  /** Cost and ecological impact notes */
  stewardshipNotes: string[];
  /** Clinical considerations before switching */
  caveats: string[];
}

// ---------------------------------------------------------------------------
// Antibiotic Spectrum Database (25+ antibiotics)
// ---------------------------------------------------------------------------

const antibioticDatabase: Record<string, AntibioticSpectrum> = {
  amoxicillin: {
    name: 'amoxicillin',
    class: 'Aminopenicillin',
    gramPositive: 'good',
    gramNegative: 'moderate',
    anaerobic: 'limited',
    atypical: 'none',
    keyCoverage: ['Streptococcus pneumoniae', 'Streptococcus pyogenes', 'Enterococcus faecalis', 'Haemophilus influenzae (non-beta-lactamase)', 'E. coli (susceptible)', 'Listeria monocytogenes'],
    notablGaps: ['MRSA', 'Pseudomonas aeruginosa', 'beta-lactamase-producing organisms', 'Klebsiella (many resistant)', 'Bacteroides fragilis'],
    commonUses: ['Acute otitis media', 'Strep pharyngitis', 'Community-acquired pneumonia (mild)', 'Urinary tract infection (susceptible)', 'H. pylori (combination)', 'Endocarditis prophylaxis'],
    resistanceConcerns: ['Rising resistance in E. coli (40-60%)', 'H. influenzae beta-lactamase production (~30%)', 'Increasing pneumococcal resistance in some regions'],
    route: ['oral'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Amoxil', 'Trimox'],
  },

  'amoxicillin-clavulanate': {
    name: 'amoxicillin-clavulanate',
    class: 'Beta-lactam/beta-lactamase inhibitor',
    gramPositive: 'good',
    gramNegative: 'good',
    anaerobic: 'good',
    atypical: 'none',
    keyCoverage: ['Streptococcus pneumoniae', 'Haemophilus influenzae', 'Moraxella catarrhalis', 'E. coli', 'Klebsiella pneumoniae', 'Bacteroides fragilis', 'Staphylococcus aureus (MSSA)'],
    notablGaps: ['MRSA', 'Pseudomonas aeruginosa', 'Enterobacter spp.', 'Citrobacter freundii', 'Serratia marcescens', 'Atypical organisms'],
    commonUses: ['Acute sinusitis', 'Acute otitis media (treatment failure)', 'Community-acquired pneumonia', 'Animal/human bite wounds', 'Diabetic foot infection (mild)', 'Dental infections'],
    resistanceConcerns: ['ESBL-producing organisms not covered', 'Increasing E. coli resistance (15-25%)', 'C. difficile risk with prolonged use'],
    route: ['oral'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Augmentin'],
  },

  ampicillin: {
    name: 'ampicillin',
    class: 'Aminopenicillin',
    gramPositive: 'good',
    gramNegative: 'moderate',
    anaerobic: 'limited',
    atypical: 'none',
    keyCoverage: ['Enterococcus faecalis', 'Listeria monocytogenes', 'Streptococcus pneumoniae', 'Group B Streptococcus', 'E. coli (susceptible)', 'Proteus mirabilis'],
    notablGaps: ['MRSA', 'Pseudomonas', 'Klebsiella', 'beta-lactamase producers', 'Enterococcus faecium'],
    commonUses: ['Enterococcal infections', 'Listeria meningitis', 'GBS prophylaxis in labor', 'Endocarditis (enterococcal, with gentamicin)'],
    resistanceConcerns: ['High E. coli resistance (>50%)', 'Enterococcal resistance increasing', 'VRE not covered'],
    route: ['IV', 'oral'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Principen'],
  },

  'ampicillin-sulbactam': {
    name: 'ampicillin-sulbactam',
    class: 'Beta-lactam/beta-lactamase inhibitor',
    gramPositive: 'good',
    gramNegative: 'good',
    anaerobic: 'good',
    atypical: 'none',
    keyCoverage: ['MSSA', 'Enterococcus faecalis', 'Haemophilus influenzae', 'E. coli', 'Klebsiella (susceptible)', 'Bacteroides fragilis', 'Acinetobacter baumannii (sulbactam component)'],
    notablGaps: ['MRSA', 'Pseudomonas', 'ESBL producers', 'Enterobacter', 'Serratia', 'Atypical organisms'],
    commonUses: ['Intra-abdominal infections', 'Aspiration pneumonia', 'Skin/soft tissue infections', 'Pelvic inflammatory disease', 'Acinetobacter infections (high-dose sulbactam)'],
    resistanceConcerns: ['Increasing E. coli resistance', 'Not reliable for empiric gram-negative coverage in many hospitals', 'Acinetobacter resistance increasing'],
    route: ['IV'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Unasyn'],
  },

  'piperacillin-tazobactam': {
    name: 'piperacillin-tazobactam',
    class: 'Anti-pseudomonal penicillin/beta-lactamase inhibitor',
    gramPositive: 'good',
    gramNegative: 'excellent',
    anaerobic: 'excellent',
    atypical: 'none',
    keyCoverage: ['Pseudomonas aeruginosa', 'E. coli', 'Klebsiella pneumoniae', 'Proteus spp.', 'Bacteroides fragilis', 'Enterococcus faecalis', 'MSSA', 'Streptococcus spp.'],
    notablGaps: ['MRSA', 'ESBL producers (variable)', 'Enterococcus faecium', 'Stenotrophomonas maltophilia', 'Atypical organisms'],
    commonUses: ['Healthcare-associated pneumonia', 'Complicated intra-abdominal infections', 'Febrile neutropenia', 'Diabetic foot infection (moderate-severe)', 'Empiric broad-spectrum coverage'],
    resistanceConcerns: ['ESBL-producing Enterobacteriaceae', 'AmpC beta-lactamase producing organisms', 'Increasing Pseudomonas resistance in some ICUs', 'C. difficile risk'],
    route: ['IV'],
    awareCategory: 'Watch',
    broadSpectrum: true,
    brandNames: ['Zosyn'],
  },

  cephalexin: {
    name: 'cephalexin',
    class: 'First-generation cephalosporin',
    gramPositive: 'excellent',
    gramNegative: 'limited',
    anaerobic: 'limited',
    atypical: 'none',
    keyCoverage: ['MSSA', 'Streptococcus pyogenes', 'Streptococcus pneumoniae', 'E. coli (susceptible)', 'Proteus mirabilis', 'Klebsiella (susceptible)'],
    notablGaps: ['MRSA', 'Enterococcus', 'Pseudomonas', 'Haemophilus influenzae', 'Bacteroides fragilis', 'Atypical organisms'],
    commonUses: ['Uncomplicated skin/soft tissue infections', 'Cellulitis (non-purulent)', 'UTI (uncomplicated)', 'Surgical prophylaxis (oral step-down)'],
    resistanceConcerns: ['No MRSA coverage', 'Increasing gram-negative resistance', 'Not recommended for empiric UTI in many regions'],
    route: ['oral'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Keflex'],
  },

  cefazolin: {
    name: 'cefazolin',
    class: 'First-generation cephalosporin',
    gramPositive: 'excellent',
    gramNegative: 'moderate',
    anaerobic: 'limited',
    atypical: 'none',
    keyCoverage: ['MSSA', 'Streptococcus pyogenes', 'Streptococcus pneumoniae', 'E. coli (susceptible)', 'Proteus mirabilis', 'Klebsiella (susceptible)'],
    notablGaps: ['MRSA', 'Enterococcus', 'Pseudomonas', 'Bacteroides fragilis', 'Listeria', 'Atypical organisms'],
    commonUses: ['Surgical prophylaxis (first-line)', 'MSSA bacteremia', 'Skin/soft tissue infections (IV)', 'MSSA endocarditis', 'UTI (IV, susceptible organisms)'],
    resistanceConcerns: ['No MRSA activity', 'Limited gram-negative spectrum', 'Not appropriate for nosocomial infections'],
    route: ['IV'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Ancef', 'Kefzol'],
  },

  ceftriaxone: {
    name: 'ceftriaxone',
    class: 'Third-generation cephalosporin',
    gramPositive: 'good',
    gramNegative: 'excellent',
    anaerobic: 'limited',
    atypical: 'none',
    keyCoverage: ['Streptococcus pneumoniae', 'Neisseria meningitidis', 'Neisseria gonorrhoeae', 'Haemophilus influenzae', 'E. coli', 'Klebsiella pneumoniae', 'Proteus spp.', 'MSSA'],
    notablGaps: ['MRSA', 'Pseudomonas aeruginosa', 'Enterococcus', 'Bacteroides fragilis', 'ESBL producers', 'Listeria', 'Atypical organisms'],
    commonUses: ['Community-acquired pneumonia', 'Bacterial meningitis (empiric)', 'Gonorrhea', 'Pyelonephritis', 'Lyme disease (disseminated)', 'Spontaneous bacterial peritonitis'],
    resistanceConcerns: ['ESBL-producing Enterobacteriaceae (increasing)', 'No Pseudomonas coverage', 'Biliary sludging with prolonged use', 'C. difficile risk'],
    route: ['IV', 'IM'],
    awareCategory: 'Watch',
    broadSpectrum: true,
    brandNames: ['Rocephin'],
  },

  cefepime: {
    name: 'cefepime',
    class: 'Fourth-generation cephalosporin',
    gramPositive: 'good',
    gramNegative: 'excellent',
    anaerobic: 'limited',
    atypical: 'none',
    keyCoverage: ['Pseudomonas aeruginosa', 'Enterobacter spp.', 'Citrobacter spp.', 'Serratia marcescens', 'E. coli', 'Klebsiella pneumoniae', 'MSSA', 'Streptococcus pneumoniae'],
    notablGaps: ['MRSA', 'Enterococcus', 'Bacteroides fragilis', 'ESBL producers', 'Stenotrophomonas', 'Acinetobacter', 'Atypical organisms'],
    commonUses: ['Febrile neutropenia', 'Hospital-acquired pneumonia', 'Complicated UTI', 'Pseudomonal infections', 'AmpC-producing organism infections'],
    resistanceConcerns: ['ESBL producers may test susceptible but fail clinically', 'Increasing Pseudomonas resistance', 'Neurotoxicity at high doses/renal impairment', 'C. difficile risk'],
    route: ['IV'],
    awareCategory: 'Watch',
    broadSpectrum: true,
    brandNames: ['Maxipime'],
  },

  ceftazidime: {
    name: 'ceftazidime',
    class: 'Third-generation cephalosporin (anti-pseudomonal)',
    gramPositive: 'limited',
    gramNegative: 'excellent',
    anaerobic: 'none',
    atypical: 'none',
    keyCoverage: ['Pseudomonas aeruginosa', 'E. coli', 'Klebsiella pneumoniae', 'Proteus spp.', 'Enterobacter spp.', 'Haemophilus influenzae'],
    notablGaps: ['MRSA', 'MSSA (poor)', 'Enterococcus', 'Bacteroides fragilis', 'Streptococcus pneumoniae (limited)', 'Atypical organisms'],
    commonUses: ['Pseudomonal infections', 'Febrile neutropenia', 'Nosocomial pneumonia', 'Melioidosis'],
    resistanceConcerns: ['Poor gram-positive coverage', 'ESBL producers', 'Increasing Pseudomonas resistance', 'AmpC producers'],
    route: ['IV'],
    awareCategory: 'Watch',
    broadSpectrum: true,
    brandNames: ['Fortaz', 'Tazicef'],
  },

  meropenem: {
    name: 'meropenem',
    class: 'Carbapenem',
    gramPositive: 'good',
    gramNegative: 'excellent',
    anaerobic: 'excellent',
    atypical: 'none',
    keyCoverage: ['ESBL-producing Enterobacteriaceae', 'Pseudomonas aeruginosa', 'Bacteroides fragilis', 'MSSA', 'Streptococcus spp.', 'Enterobacter spp.', 'Serratia', 'Acinetobacter (susceptible)'],
    notablGaps: ['MRSA', 'Enterococcus faecium', 'Stenotrophomonas maltophilia', 'CRE (carbapenem-resistant)', 'Atypical organisms', 'C. difficile (not covered, high risk)'],
    commonUses: ['ESBL infections', 'Severe intra-abdominal infections', 'Bacterial meningitis', 'Febrile neutropenia (severe)', 'Multi-drug resistant gram-negative infections'],
    resistanceConcerns: ['RESERVE agent — restrict use to preserve efficacy', 'CRE is a global threat (NDM, KPC, OXA-48)', 'High C. difficile risk', 'Drives resistance when overused', 'Seizure threshold lowering (less than imipenem)'],
    route: ['IV'],
    awareCategory: 'Watch',
    broadSpectrum: true,
    brandNames: ['Merrem'],
  },

  'imipenem-cilastatin': {
    name: 'imipenem-cilastatin',
    class: 'Carbapenem',
    gramPositive: 'good',
    gramNegative: 'excellent',
    anaerobic: 'excellent',
    atypical: 'none',
    keyCoverage: ['ESBL producers', 'Pseudomonas aeruginosa', 'Acinetobacter (susceptible)', 'Bacteroides fragilis', 'MSSA', 'Enterococcus faecalis', 'Enterobacter spp.'],
    notablGaps: ['MRSA', 'Enterococcus faecium', 'Stenotrophomonas', 'CRE', 'Atypical organisms'],
    commonUses: ['Polymicrobial infections', 'ESBL infections', 'Severe nosocomial infections', 'Diabetic foot (severe)'],
    resistanceConcerns: ['Higher seizure risk than meropenem (avoid in CNS infections)', 'CRE emergence', 'C. difficile risk', 'Reserve for confirmed resistant infections'],
    route: ['IV'],
    awareCategory: 'Watch',
    broadSpectrum: true,
    brandNames: ['Primaxin'],
  },

  ertapenem: {
    name: 'ertapenem',
    class: 'Carbapenem',
    gramPositive: 'good',
    gramNegative: 'excellent',
    anaerobic: 'excellent',
    atypical: 'none',
    keyCoverage: ['ESBL-producing Enterobacteriaceae', 'Bacteroides fragilis', 'Streptococcus spp.', 'E. coli', 'Klebsiella', 'Proteus', 'MSSA'],
    notablGaps: ['Pseudomonas aeruginosa', 'Acinetobacter', 'MRSA', 'Enterococcus', 'Atypical organisms'],
    commonUses: ['Complicated intra-abdominal infections', 'Complicated UTI', 'Community-acquired pneumonia (severe)', 'Diabetic foot infection', 'ESBL-producing organism infections (step-down)'],
    resistanceConcerns: ['No Pseudomonas coverage (unique among carbapenems)', 'May select for Pseudomonas resistance', 'C. difficile risk'],
    route: ['IV', 'IM'],
    awareCategory: 'Watch',
    broadSpectrum: true,
    brandNames: ['Invanz'],
  },

  azithromycin: {
    name: 'azithromycin',
    class: 'Macrolide',
    gramPositive: 'moderate',
    gramNegative: 'limited',
    anaerobic: 'none',
    atypical: 'excellent',
    keyCoverage: ['Mycoplasma pneumoniae', 'Chlamydophila pneumoniae', 'Legionella pneumophila', 'Streptococcus pyogenes', 'Haemophilus influenzae', 'Moraxella catarrhalis', 'Chlamydia trachomatis', 'Bordetella pertussis'],
    notablGaps: ['MRSA', 'Enterococcus', 'Pseudomonas', 'Anaerobes', 'Most Enterobacteriaceae', 'Resistant Streptococcus pneumoniae (~30%)'],
    commonUses: ['Community-acquired pneumonia (atypical coverage)', 'Acute exacerbation of COPD', 'Chlamydia', 'Pertussis', 'Traveler\'s diarrhea', 'MAC prophylaxis in HIV'],
    resistanceConcerns: ['30%+ pneumococcal resistance in US', 'QTc prolongation risk', 'Increasing resistance globally', 'Limited efficacy as monotherapy for CAP'],
    route: ['oral', 'IV'],
    awareCategory: 'Watch',
    broadSpectrum: false,
    brandNames: ['Zithromax', 'Z-Pack'],
  },

  doxycycline: {
    name: 'doxycycline',
    class: 'Tetracycline',
    gramPositive: 'moderate',
    gramNegative: 'moderate',
    anaerobic: 'limited',
    atypical: 'good',
    keyCoverage: ['MRSA (community-acquired)', 'Mycoplasma pneumoniae', 'Chlamydophila pneumoniae', 'Rickettsia spp.', 'Borrelia burgdorferi', 'Vibrio cholerae', 'Brucella', 'Chlamydia trachomatis'],
    notablGaps: ['Pseudomonas', 'Proteus', 'Most Enterobacteriaceae', 'Bacteroides fragilis', 'Streptococcus pneumoniae (variable)'],
    commonUses: ['Community-acquired pneumonia', 'Lyme disease (early)', 'Rocky Mountain spotted fever', 'Chlamydia', 'MRSA skin infections (mild)', 'Acne vulgaris', 'Malaria prophylaxis', 'PID (combination)'],
    resistanceConcerns: ['Photosensitivity', 'Esophageal ulceration if not taken correctly', 'Avoid in children <8 years (teeth staining)', 'Variable MRSA susceptibility'],
    route: ['oral', 'IV'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Vibramycin', 'Doryx'],
  },

  levofloxacin: {
    name: 'levofloxacin',
    class: 'Respiratory fluoroquinolone',
    gramPositive: 'good',
    gramNegative: 'excellent',
    anaerobic: 'limited',
    atypical: 'excellent',
    keyCoverage: ['Streptococcus pneumoniae', 'Haemophilus influenzae', 'Moraxella catarrhalis', 'E. coli', 'Klebsiella', 'Pseudomonas aeruginosa (moderate)', 'Mycoplasma', 'Chlamydia', 'Legionella'],
    notablGaps: ['MRSA', 'Enterococcus', 'Bacteroides fragilis', 'Anaerobes', 'ESBL producers (variable)'],
    commonUses: ['Community-acquired pneumonia', 'Acute bacterial sinusitis (second-line)', 'Complicated UTI/pyelonephritis', 'Prostatitis', 'Anthrax (post-exposure)'],
    resistanceConcerns: ['FDA Black Box: tendon rupture, peripheral neuropathy, CNS effects, aortic aneurysm', 'Increasing E. coli resistance (30%+)', 'C. difficile risk', 'Reserve for patients without alternatives', 'QTc prolongation'],
    route: ['oral', 'IV'],
    awareCategory: 'Watch',
    broadSpectrum: true,
    brandNames: ['Levaquin'],
  },

  ciprofloxacin: {
    name: 'ciprofloxacin',
    class: 'Fluoroquinolone',
    gramPositive: 'limited',
    gramNegative: 'excellent',
    anaerobic: 'none',
    atypical: 'moderate',
    keyCoverage: ['E. coli', 'Klebsiella', 'Pseudomonas aeruginosa', 'Salmonella', 'Shigella', 'Proteus spp.', 'Enterobacter', 'Haemophilus influenzae'],
    notablGaps: ['MRSA', 'Streptococcus pneumoniae', 'Enterococcus', 'Anaerobes', 'Mycoplasma (inferior to levofloxacin)'],
    commonUses: ['Complicated UTI', 'Pyelonephritis', 'Pseudomonal infections (oral option)', 'Traveler\'s diarrhea', 'Anthrax', 'Osteomyelitis (gram-negative)'],
    resistanceConcerns: ['FDA Black Box warnings same as levofloxacin', 'E. coli resistance 30-40%', 'Poor pneumococcal coverage', 'C. difficile risk', 'QTc prolongation'],
    route: ['oral', 'IV'],
    awareCategory: 'Watch',
    broadSpectrum: true,
    brandNames: ['Cipro'],
  },

  metronidazole: {
    name: 'metronidazole',
    class: 'Nitroimidazole',
    gramPositive: 'none',
    gramNegative: 'none',
    anaerobic: 'excellent',
    atypical: 'none',
    keyCoverage: ['Bacteroides fragilis', 'Clostridium spp.', 'Clostridioides difficile', 'Fusobacterium', 'Prevotella', 'Giardia lamblia', 'Entamoeba histolytica', 'Trichomonas vaginalis'],
    notablGaps: ['All aerobes', 'Propionibacterium', 'Actinomyces', 'Some microaerophilic streptococci'],
    commonUses: ['C. difficile infection (mild)', 'Intra-abdominal infections (anaerobic component)', 'Brain abscess', 'Bacterial vaginosis', 'Giardiasis', 'H. pylori (combination)'],
    resistanceConcerns: ['Disulfiram-like reaction with alcohol', 'Peripheral neuropathy with prolonged use', 'Metallic taste', 'Low resistance rates among Bacteroides'],
    route: ['oral', 'IV'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Flagyl'],
  },

  vancomycin: {
    name: 'vancomycin',
    class: 'Glycopeptide',
    gramPositive: 'excellent',
    gramNegative: 'none',
    anaerobic: 'moderate',
    atypical: 'none',
    keyCoverage: ['MRSA', 'MSSA', 'Coagulase-negative staphylococci', 'Streptococcus pneumoniae (penicillin-resistant)', 'Enterococcus faecalis', 'Clostridioides difficile (oral only)', 'Viridans streptococci'],
    notablGaps: ['All gram-negatives', 'VRE (Enterococcus faecium)', 'Atypical organisms', 'Most anaerobic gram-negatives'],
    commonUses: ['MRSA bacteremia', 'MRSA pneumonia', 'MRSA skin/soft tissue infections (severe)', 'Bacterial meningitis (empiric, with ceftriaxone)', 'C. difficile (oral, severe)', 'Endocarditis (MRSA)', 'Surgical prophylaxis (beta-lactam allergy)'],
    resistanceConcerns: ['VRE emergence (E. faecium)', 'VISA/VRSA (rare but emerging)', 'Nephrotoxicity (especially with piperacillin-tazobactam)', 'Requires trough monitoring (AUC/MIC dosing preferred)', 'Red man syndrome with rapid infusion'],
    route: ['IV', 'oral (C. diff only)'],
    awareCategory: 'Watch',
    broadSpectrum: false,
    brandNames: ['Vancocin'],
  },

  linezolid: {
    name: 'linezolid',
    class: 'Oxazolidinone',
    gramPositive: 'excellent',
    gramNegative: 'none',
    anaerobic: 'moderate',
    atypical: 'none',
    keyCoverage: ['MRSA', 'VRE (E. faecium and E. faecalis)', 'Streptococcus pneumoniae', 'Nocardia', 'MSSA', 'Coagulase-negative staphylococci'],
    notablGaps: ['All gram-negatives', 'Pseudomonas', 'Enterobacteriaceae', 'Atypical organisms'],
    commonUses: ['VRE infections', 'MRSA pneumonia (preferred over vancomycin)', 'MRSA skin/soft tissue (oral option)', 'MRSA osteomyelitis (oral step-down)'],
    resistanceConcerns: ['Thrombocytopenia with >14 days use', 'Serotonin syndrome risk with SSRIs/MAOIs', 'Peripheral/optic neuropathy (prolonged use)', 'Cost', 'Resistance rare but increasing'],
    route: ['oral', 'IV'],
    awareCategory: 'Reserve',
    broadSpectrum: false,
    brandNames: ['Zyvox'],
  },

  'trimethoprim-sulfamethoxazole': {
    name: 'trimethoprim-sulfamethoxazole',
    class: 'Folate antagonist combination',
    gramPositive: 'moderate',
    gramNegative: 'good',
    anaerobic: 'none',
    atypical: 'moderate',
    keyCoverage: ['MRSA (community-acquired)', 'E. coli (susceptible)', 'Klebsiella', 'Proteus mirabilis', 'Stenotrophomonas maltophilia', 'Pneumocystis jirovecii', 'Nocardia', 'Listeria'],
    notablGaps: ['Pseudomonas', 'Enterococcus', 'Anaerobes', 'Group A Streptococcus', 'Streptococcus pneumoniae (variable)'],
    commonUses: ['Uncomplicated UTI', 'CA-MRSA skin infections', 'PCP prophylaxis and treatment', 'Stenotrophomonas infections', 'Nocardiosis', 'Traveler\'s diarrhea'],
    resistanceConcerns: ['Increasing E. coli resistance (20-30%)', 'Hyperkalemia', 'Bone marrow suppression', 'Sulfa allergy (common)', 'Stevens-Johnson syndrome (rare)'],
    route: ['oral', 'IV'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Bactrim', 'Septra'],
  },

  nitrofurantoin: {
    name: 'nitrofurantoin',
    class: 'Nitrofuran',
    gramPositive: 'moderate',
    gramNegative: 'moderate',
    anaerobic: 'none',
    atypical: 'none',
    keyCoverage: ['E. coli', 'Enterococcus faecalis', 'Staphylococcus saprophyticus', 'Klebsiella (some strains)', 'Enterobacter (some)'],
    notablGaps: ['Pseudomonas', 'Proteus spp.', 'Serratia', 'Klebsiella (many resistant)', 'All organisms outside urinary tract'],
    commonUses: ['Uncomplicated cystitis (first-line)', 'UTI prophylaxis'],
    resistanceConcerns: ['NOT for pyelonephritis (poor tissue penetration)', 'NOT for systemic infections', 'Pulmonary toxicity (chronic use)', 'Avoid if CrCl <30 mL/min', 'Low resistance rates maintain utility'],
    route: ['oral'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Macrobid', 'Macrodantin'],
  },

  gentamicin: {
    name: 'gentamicin',
    class: 'Aminoglycoside',
    gramPositive: 'limited',
    gramNegative: 'excellent',
    anaerobic: 'none',
    atypical: 'none',
    keyCoverage: ['E. coli', 'Klebsiella', 'Pseudomonas aeruginosa', 'Proteus spp.', 'Serratia marcescens', 'Enterobacter', 'Staphylococcus (synergy)'],
    notablGaps: ['Streptococcus', 'Anaerobes (obligate)', 'MRSA (alone)', 'Stenotrophomonas', 'Atypical organisms', 'Burkholderia'],
    commonUses: ['Serious gram-negative infections (synergy)', 'Enterococcal endocarditis (with ampicillin)', 'UTI (complicated)', 'Sepsis (empiric, with beta-lactam)', 'Surgical prophylaxis (GI/GU)'],
    resistanceConcerns: ['Nephrotoxicity', 'Ototoxicity (vestibular and cochlear)', 'Requires therapeutic drug monitoring', 'Once-daily dosing preferred for most indications', 'Avoid prolonged courses (>5-7 days)'],
    route: ['IV', 'IM'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Garamycin'],
  },

  clindamycin: {
    name: 'clindamycin',
    class: 'Lincosamide',
    gramPositive: 'good',
    gramNegative: 'none',
    anaerobic: 'good',
    atypical: 'none',
    keyCoverage: ['MSSA', 'CA-MRSA (many strains)', 'Streptococcus pyogenes', 'Streptococcus pneumoniae', 'Bacteroides (non-fragilis)', 'Clostridium perfringens', 'Peptostreptococcus'],
    notablGaps: ['Enterococcus', 'Gram-negatives', 'Pseudomonas', 'B. fragilis (increasing resistance)', 'VRE', 'Atypical organisms'],
    commonUses: ['CA-MRSA skin/soft tissue infections', 'Dental infections', 'Aspiration pneumonia', 'Necrotizing fasciitis (toxin suppression, with beta-lactam)', 'Bone/joint infections', 'Penicillin-allergic patients'],
    resistanceConcerns: ['High C. difficile risk', 'Inducible clindamycin resistance (D-test)', 'B. fragilis resistance increasing (20-30%)', 'Verify susceptibility before use'],
    route: ['oral', 'IV'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Cleocin'],
  },

  'ceftazidime-avibactam': {
    name: 'ceftazidime-avibactam',
    class: 'Cephalosporin/beta-lactamase inhibitor (novel)',
    gramPositive: 'limited',
    gramNegative: 'excellent',
    anaerobic: 'none',
    atypical: 'none',
    keyCoverage: ['KPC-producing CRE', 'ESBL-producing Enterobacteriaceae', 'OXA-48 producing CRE', 'AmpC producers', 'Pseudomonas aeruginosa', 'Klebsiella pneumoniae'],
    notablGaps: ['MRSA', 'Enterococcus', 'Anaerobes', 'NDM/MBL producers', 'Acinetobacter', 'Atypical organisms'],
    commonUses: ['CRE infections (KPC-type)', 'ESBL infections', 'Complicated UTI (resistant organisms)', 'Hospital-acquired pneumonia (resistant GNR)'],
    resistanceConcerns: ['RESERVE AGENT — strict stewardship required', 'No activity against metallo-beta-lactamase (NDM)', 'Emerging resistance in KPC producers', 'Very high cost'],
    route: ['IV'],
    awareCategory: 'Reserve',
    broadSpectrum: true,
    brandNames: ['Avycaz'],
  },

  daptomycin: {
    name: 'daptomycin',
    class: 'Lipopeptide',
    gramPositive: 'excellent',
    gramNegative: 'none',
    anaerobic: 'limited',
    atypical: 'none',
    keyCoverage: ['MRSA', 'VRE', 'MSSA', 'Coagulase-negative staphylococci', 'Streptococcus spp.', 'Enterococcus faecalis', 'Enterococcus faecium'],
    notablGaps: ['All gram-negatives', 'Inactivated by surfactant — DO NOT use for pneumonia', 'Atypical organisms'],
    commonUses: ['MRSA bacteremia', 'Right-sided endocarditis', 'Skin/soft tissue infections (complicated)', 'VRE bacteremia', 'MRSA bone/joint infections'],
    resistanceConcerns: ['INACTIVATED by pulmonary surfactant — contraindicated in pneumonia', 'Monitor CPK weekly (myopathy)', 'Eosinophilic pneumonia (rare)', 'Dose-dependent resistance possible'],
    route: ['IV'],
    awareCategory: 'Reserve',
    broadSpectrum: false,
    brandNames: ['Cubicin'],
  },

  fosfomycin: {
    name: 'fosfomycin',
    class: 'Phosphonic acid derivative',
    gramPositive: 'moderate',
    gramNegative: 'moderate',
    anaerobic: 'none',
    atypical: 'none',
    keyCoverage: ['E. coli (including ESBL)', 'Enterococcus faecalis', 'Klebsiella (some)', 'Staphylococcus saprophyticus'],
    notablGaps: ['Pseudomonas', 'Acinetobacter', 'Klebsiella (variable)', 'Proteus (variable)', 'Anaerobes', 'Staphylococcus aureus (variable)'],
    commonUses: ['Uncomplicated cystitis (single-dose)', 'UTI with ESBL-producing E. coli'],
    resistanceConcerns: ['Oral formulation only for lower UTI', 'Not for systemic infections (oral)', 'Diarrhea common', 'Resistance selection with subtherapeutic levels', 'Low resistance rates currently'],
    route: ['oral'],
    awareCategory: 'Access',
    broadSpectrum: false,
    brandNames: ['Monurol'],
  },
};

// Brand name aliases
const brandNameMap: Record<string, string> = {};
for (const [generic, abx] of Object.entries(antibioticDatabase)) {
  for (const brand of abx.brandNames) {
    brandNameMap[brand.toLowerCase()] = generic;
  }
}

function resolveAntibiotic(name: string): string | null {
  const lower = name.toLowerCase().trim();
  if (!lower || lower.length < 2) return null;
  if (antibioticDatabase[lower]) return lower;
  if (brandNameMap[lower]) return brandNameMap[lower];
  // Partial match — require at least 3 chars to avoid false positives
  if (lower.length >= 3) {
    for (const key of Object.keys(antibioticDatabase)) {
      if (key.includes(lower) || lower.includes(key)) return key;
    }
    for (const [brand, generic] of Object.entries(brandNameMap)) {
      if (brand.includes(lower) || lower.includes(brand)) return generic;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Empiric Therapy Database (IDSA guidelines)
// ---------------------------------------------------------------------------

const empiricTherapyDatabase: Record<string, EmpiricTherapyRecommendation> = {
  'community-acquired pneumonia': {
    infectionType: 'Community-Acquired Pneumonia (CAP)',
    setting: 'Outpatient, no comorbidities',
    firstLine: [
      { name: 'amoxicillin', dose: '1g PO TID', route: 'oral', duration: '5 days minimum', notes: 'IDSA/ATS 2019: preferred if no risk factors for MRSA/Pseudomonas' },
      { name: 'doxycycline', dose: '100mg PO BID', route: 'oral', duration: '5 days minimum', notes: 'Alternative first-line, covers atypicals' },
    ],
    alternatives: [
      { name: 'azithromycin', dose: '500mg day 1, then 250mg days 2-5', route: 'oral', duration: '5 days', notes: 'Only if local pneumococcal resistance <25%' },
      { name: 'amoxicillin-clavulanate + azithromycin', dose: '875/125mg PO BID + 500mg/250mg', route: 'oral', duration: '5 days', notes: 'Outpatient with comorbidities' },
      { name: 'levofloxacin', dose: '750mg PO daily', route: 'oral', duration: '5 days', notes: 'Reserve for patients unable to take other agents; FDA warnings' },
    ],
    considerations: [
      'Obtain sputum/blood cultures only if inpatient or severe CAP',
      'Procalcitonin may guide antibiotic duration',
      'Minimum 5 days; extend if not afebrile x48h and clinically stable',
      'Test for influenza/COVID in season — antivirals may be indicated',
      'For CURB-65 >=2 or PSI class IV-V: admit and use IV therapy',
    ],
    guidelineSource: 'IDSA/ATS 2019 CAP Guidelines',
    deEscalationTarget: 'amoxicillin or doxycycline (if culture/sensitivity allows)',
  },

  'community-acquired pneumonia inpatient': {
    infectionType: 'Community-Acquired Pneumonia (CAP) — Inpatient, non-ICU',
    setting: 'Inpatient, non-ICU',
    firstLine: [
      { name: 'ceftriaxone + azithromycin', dose: 'Ceftriaxone 1-2g IV daily + Azithromycin 500mg IV/PO daily', route: 'IV', duration: '5-7 days', notes: 'Standard inpatient CAP regimen' },
      { name: 'ampicillin-sulbactam + azithromycin', dose: 'Unasyn 1.5-3g IV q6h + Azithromycin 500mg IV/PO daily', route: 'IV', duration: '5-7 days', notes: 'Alternative beta-lactam' },
    ],
    alternatives: [
      { name: 'levofloxacin', dose: '750mg IV/PO daily', route: 'IV/oral', duration: '5 days', notes: 'Monotherapy option; reserve due to FDA warnings' },
      { name: 'ceftaroline', dose: '600mg IV q12h', route: 'IV', duration: '5-7 days', notes: 'If MRSA CAP suspected' },
    ],
    considerations: [
      'Blood cultures x2 before antibiotics',
      'Sputum culture if productive cough',
      'Legionella and pneumococcal urinary antigens if severe',
      'Switch to oral when clinically stable, afebrile x48h, able to tolerate PO',
      'MRSA nasal PCR can help rule out MRSA pneumonia',
    ],
    guidelineSource: 'IDSA/ATS 2019 CAP Guidelines',
    deEscalationTarget: 'amoxicillin or amoxicillin-clavulanate (if susceptible)',
  },

  'hospital-acquired pneumonia': {
    infectionType: 'Hospital-Acquired Pneumonia (HAP)',
    setting: 'Inpatient, >48h after admission',
    firstLine: [
      { name: 'piperacillin-tazobactam', dose: '4.5g IV q6h (extended infusion over 4h preferred)', route: 'IV', duration: '7 days', notes: 'If no risk factors for MDR organisms' },
      { name: 'cefepime', dose: '2g IV q8h', route: 'IV', duration: '7 days', notes: 'Alternative anti-pseudomonal beta-lactam' },
      { name: 'meropenem', dose: '1g IV q8h', route: 'IV', duration: '7 days', notes: 'If high risk for ESBL/resistant GNR' },
    ],
    alternatives: [
      { name: 'cefepime + vancomycin', dose: 'Cefepime 2g IV q8h + Vancomycin AUC/MIC-guided', route: 'IV', duration: '7 days', notes: 'Add vancomycin if MRSA risk factors or >10% local MRSA prevalence' },
      { name: 'piperacillin-tazobactam + vancomycin', dose: 'Zosyn 4.5g IV q6h + Vancomycin', route: 'IV', duration: '7 days', notes: 'Monitor renal function closely with this combination' },
    ],
    considerations: [
      'MRSA nasal PCR: negative predictive value >95% for MRSA HAP',
      'Obtain respiratory cultures (sputum, tracheal aspirate, BAL) before antibiotics',
      'De-escalate within 48-72h based on culture/sensitivity data',
      'Consider double pseudomonal coverage only if structural lung disease or prior Pseudomonas',
      'Shorter courses (7 days) non-inferior for most HAP',
    ],
    guidelineSource: 'IDSA/ATS 2016 HAP/VAP Guidelines',
    escalationCriteria: ['Septic shock', 'ESBL risk factors', 'Recent antibiotic exposure', 'ICU setting'],
    deEscalationTarget: 'Narrowest-spectrum agent based on culture results',
  },

  'uti-uncomplicated': {
    infectionType: 'Uncomplicated Cystitis (UTI)',
    setting: 'Outpatient, non-pregnant female',
    firstLine: [
      { name: 'nitrofurantoin', dose: '100mg PO BID', route: 'oral', duration: '5 days', notes: 'First-line per IDSA. Macrocrystalline (Macrobid) preferred.' },
      { name: 'trimethoprim-sulfamethoxazole', dose: '160/800mg (DS) PO BID', route: 'oral', duration: '3 days', notes: 'First-line if local E. coli resistance <20%' },
      { name: 'fosfomycin', dose: '3g PO x1 dose', route: 'oral', duration: 'Single dose', notes: 'Convenient dosing. Slightly less effective than other first-line.' },
    ],
    alternatives: [
      { name: 'cephalexin', dose: '500mg PO BID', route: 'oral', duration: '5-7 days', notes: 'If first-line agents contraindicated' },
      { name: 'amoxicillin-clavulanate', dose: '500/125mg PO BID', route: 'oral', duration: '5-7 days', notes: 'Reserve; more side effects and resistance selection' },
    ],
    considerations: [
      'Fluoroquinolones should NOT be used for uncomplicated cystitis (FDA guidance)',
      'Culture not required for classic uncomplicated cystitis',
      'If symptoms recur within 2 weeks, obtain urine culture',
      'Check local antibiogram for E. coli resistance rates',
      'Avoid nitrofurantoin if CrCl <30 mL/min',
    ],
    guidelineSource: 'IDSA 2011 Uncomplicated UTI Guidelines',
    deEscalationTarget: 'Narrowest agent per susceptibilities',
  },

  'uti-complicated': {
    infectionType: 'Complicated UTI / Pyelonephritis',
    setting: 'Outpatient or inpatient',
    firstLine: [
      { name: 'ciprofloxacin', dose: '500mg PO BID or 400mg IV q12h', route: 'oral/IV', duration: '7 days (oral) or 10-14 days', notes: 'Outpatient pyelonephritis if susceptible' },
      { name: 'levofloxacin', dose: '750mg PO/IV daily', route: 'oral/IV', duration: '5 days', notes: 'Short-course equivalent to longer FQ courses' },
      { name: 'ceftriaxone', dose: '1g IV daily', route: 'IV', duration: '10-14 days', notes: 'Inpatient pyelonephritis first-line' },
    ],
    alternatives: [
      { name: 'trimethoprim-sulfamethoxazole', dose: '160/800mg PO BID', route: 'oral', duration: '14 days', notes: 'If susceptibility confirmed on culture' },
      { name: 'ertapenem', dose: '1g IV daily', route: 'IV', duration: '10-14 days', notes: 'For ESBL-producing organism pyelonephritis' },
    ],
    considerations: [
      'Always obtain urine culture and blood cultures before starting antibiotics',
      'Imaging (CT/US) if no improvement in 48-72h to rule out abscess/obstruction',
      'ESBL risk factors: prior UTI with ESBL, recent antibiotics, healthcare exposure',
      'Step down to oral based on susceptibility data when clinically stable',
    ],
    guidelineSource: 'IDSA 2010 Complicated UTI / Pyelonephritis Guidelines',
    deEscalationTarget: 'Narrowest oral agent per susceptibilities (TMP-SMX or ciprofloxacin)',
  },

  'skin-soft-tissue': {
    infectionType: 'Skin and Soft Tissue Infection (SSTI)',
    setting: 'Outpatient or inpatient',
    firstLine: [
      { name: 'cephalexin', dose: '500mg PO QID', route: 'oral', duration: '5-7 days', notes: 'Non-purulent cellulitis (beta-hemolytic strep, MSSA)' },
      { name: 'trimethoprim-sulfamethoxazole', dose: '1-2 DS tablets PO BID', route: 'oral', duration: '5-7 days', notes: 'Purulent/abscess (CA-MRSA coverage)' },
      { name: 'doxycycline', dose: '100mg PO BID', route: 'oral', duration: '5-7 days', notes: 'Purulent SSTI, CA-MRSA coverage' },
    ],
    alternatives: [
      { name: 'clindamycin', dose: '300-450mg PO TID', route: 'oral', duration: '5-7 days', notes: 'Purulent SSTI; check D-test for inducible resistance' },
      { name: 'dicloxacillin', dose: '500mg PO QID', route: 'oral', duration: '5-7 days', notes: 'Non-purulent cellulitis, MSSA' },
      { name: 'vancomycin', dose: 'AUC/MIC-guided dosing', route: 'IV', duration: '7-14 days', notes: 'Severe SSTI requiring IV; add piperacillin-tazobactam if polymicrobial/deep tissue' },
    ],
    considerations: [
      'Purulent SSTI (abscess): I&D is primary treatment; antibiotics adjunctive',
      'Non-purulent cellulitis: empiric beta-hemolytic strep/MSSA coverage',
      'MRSA risk: prior MRSA, IV drug use, incarceration, contact sports',
      'Necrotizing fasciitis: surgical emergency — vancomycin + piperacillin-tazobactam + clindamycin',
      'Mark cellulitis borders to monitor progression',
    ],
    guidelineSource: 'IDSA 2014 SSTI Guidelines',
    escalationCriteria: ['Rapid spread', 'Systemic toxicity', 'Failure of oral therapy', 'Crepitus or tissue necrosis'],
    deEscalationTarget: 'Narrowest oral agent per culture (cephalexin or TMP-SMX)',
  },

  'intra-abdominal': {
    infectionType: 'Intra-Abdominal Infection (IAI)',
    setting: 'Inpatient',
    firstLine: [
      { name: 'ceftriaxone + metronidazole', dose: 'Ceftriaxone 2g IV daily + Metronidazole 500mg IV q8h', route: 'IV', duration: '4 days (post source control)', notes: 'Community-acquired, mild-moderate' },
      { name: 'ertapenem', dose: '1g IV daily', route: 'IV', duration: '4 days (post source control)', notes: 'Community-acquired; once-daily dosing advantage' },
    ],
    alternatives: [
      { name: 'piperacillin-tazobactam', dose: '3.375-4.5g IV q6h', route: 'IV', duration: '4 days post source control', notes: 'Healthcare-associated or severe; extended infusion preferred' },
      { name: 'meropenem', dose: '1g IV q8h', route: 'IV', duration: '4 days post source control', notes: 'If ESBL risk or prior antibiotic failure' },
      { name: 'ciprofloxacin + metronidazole', dose: 'Ciprofloxacin 400mg IV q12h + Metronidazole 500mg IV q8h', route: 'IV', duration: '4 days post source control', notes: 'Beta-lactam allergy; verify susceptibility' },
    ],
    considerations: [
      'SOURCE CONTROL is essential (drainage, debridement, surgery)',
      'STOP trial: 4 days post source control non-inferior to longer courses',
      'Obtain intraoperative cultures for targeted therapy',
      'ESBL risk: healthcare exposure, prior antibiotics, prior ESBL isolation',
      'Add vancomycin ONLY if risk for enterococcal involvement (biliary, post-operative)',
    ],
    guidelineSource: 'SIS/IDSA 2017 IAI Guidelines',
    deEscalationTarget: 'Oral amoxicillin-clavulanate or ciprofloxacin + metronidazole (if susceptible)',
  },

  'sepsis': {
    infectionType: 'Sepsis / Septic Shock (empiric)',
    setting: 'ICU or emergency department',
    firstLine: [
      { name: 'vancomycin + piperacillin-tazobactam', dose: 'Vancomycin load + Zosyn 4.5g IV q6h (extended infusion)', route: 'IV', duration: 'De-escalate at 48-72h', notes: 'Broad empiric; covers MRSA + Pseudomonas + anaerobes' },
      { name: 'vancomycin + cefepime', dose: 'Vancomycin load + Cefepime 2g IV q8h', route: 'IV', duration: 'De-escalate at 48-72h', notes: 'Alternative; lower C. difficile risk vs Zosyn' },
      { name: 'vancomycin + meropenem', dose: 'Vancomycin load + Meropenem 1g IV q8h', route: 'IV', duration: 'De-escalate at 48-72h', notes: 'If ESBL risk, structural lung disease, or prior resistant organisms' },
    ],
    alternatives: [
      { name: 'meropenem + linezolid', dose: 'Meropenem 1g IV q8h + Linezolid 600mg IV q12h', route: 'IV', duration: 'De-escalate at 48-72h', notes: 'Vancomycin allergy or VRE risk' },
    ],
    considerations: [
      'Surviving Sepsis Campaign: antibiotics within 1 HOUR of recognition',
      'Blood cultures x2 (from 2 different sites) BEFORE antibiotics, but do NOT delay treatment',
      'Source identification: imaging, urinalysis, chest X-ray',
      'DE-ESCALATE within 48-72h based on culture/sensitivity and clinical response',
      'Procalcitonin-guided discontinuation reduces antibiotic exposure',
      'Vancomycin + piperacillin-tazobactam: monitor for AKI',
    ],
    guidelineSource: 'Surviving Sepsis Campaign 2021',
    escalationCriteria: ['Septic shock unresponsive to resuscitation', 'Immunocompromised host', 'Known MDR organism history'],
    deEscalationTarget: 'Narrowest agent based on identified source and culture data',
  },

  'meningitis': {
    infectionType: 'Bacterial Meningitis (empiric)',
    setting: 'Inpatient (emergency)',
    firstLine: [
      { name: 'ceftriaxone + vancomycin', dose: 'Ceftriaxone 2g IV q12h + Vancomycin 15-20mg/kg IV q8-12h', route: 'IV', duration: '10-14 days (pathogen-dependent)', notes: 'Standard empiric for age 2-50 years' },
      { name: 'ceftriaxone + vancomycin + ampicillin', dose: 'Add Ampicillin 2g IV q4h', route: 'IV', duration: '14-21 days', notes: 'Age >50 or immunocompromised (Listeria coverage)' },
    ],
    alternatives: [
      { name: 'meropenem + vancomycin', dose: 'Meropenem 2g IV q8h + Vancomycin', route: 'IV', duration: '10-14 days', notes: 'Severe penicillin/cephalosporin allergy' },
    ],
    considerations: [
      'Dexamethasone 0.15mg/kg IV q6h x4 days — give BEFORE or WITH first antibiotic dose',
      'Do NOT delay antibiotics for LP if LP will be delayed',
      'CT before LP only if: immunocompromised, CNS disease history, new seizure, papilledema, altered consciousness, focal deficit',
      'Narrow therapy once CSF culture and sensitivity available',
      'Chemoprophylaxis for close contacts if N. meningitidis (rifampin, ciprofloxacin, or ceftriaxone)',
    ],
    guidelineSource: 'IDSA 2004 Bacterial Meningitis Guidelines (Updated 2024)',
    deEscalationTarget: 'Ceftriaxone alone if penicillin-susceptible pneumococcus; penicillin G if penicillin-susceptible meningococcus',
  },

  'endocarditis': {
    infectionType: 'Infective Endocarditis (empiric)',
    setting: 'Inpatient',
    firstLine: [
      { name: 'vancomycin + ceftriaxone', dose: 'Vancomycin 15-20mg/kg IV q8-12h + Ceftriaxone 2g IV q12h', route: 'IV', duration: '4-6 weeks', notes: 'Native valve empiric (covers MRSA, strep, HACEK)' },
    ],
    alternatives: [
      { name: 'daptomycin', dose: '8-10mg/kg IV daily', route: 'IV', duration: '4-6 weeks', notes: 'MRSA bacteremia/right-sided IE if vancomycin MIC >1' },
      { name: 'vancomycin + cefepime + gentamicin', dose: 'Add gentamicin 1mg/kg IV q8h x2 weeks', route: 'IV', duration: '6 weeks', notes: 'Prosthetic valve empiric' },
    ],
    considerations: [
      'Blood cultures x3 from separate venipunctures (ideally separated by 30+ minutes)',
      'Duke criteria for diagnosis',
      'TEE preferred over TTE for diagnosis (sensitivity 90% vs 60%)',
      'Narrow to pathogen-directed therapy once organism identified',
      'Surgery consultation for: heart failure, uncontrolled infection, abscess, prosthetic valve, fungal',
    ],
    guidelineSource: 'AHA/IDSA 2015 Infective Endocarditis Guidelines',
    deEscalationTarget: 'Pathogen-directed: cefazolin for MSSA, penicillin G for susceptible strep',
  },

  'bone-joint': {
    infectionType: 'Osteomyelitis / Septic Arthritis',
    setting: 'Inpatient or OPAT',
    firstLine: [
      { name: 'vancomycin', dose: 'AUC/MIC-guided dosing', route: 'IV', duration: '6 weeks (osteo) / 2-4 weeks (septic arthritis)', notes: 'Empiric pending cultures; excellent bone penetration' },
      { name: 'ceftriaxone', dose: '2g IV daily', route: 'IV', duration: '6 weeks', notes: 'If gram-negative suspected or for MSSA step-down with cefazolin' },
    ],
    alternatives: [
      { name: 'cefazolin', dose: '2g IV q8h', route: 'IV', duration: '6 weeks', notes: 'MSSA osteomyelitis — preferred over vancomycin for MSSA' },
      { name: 'daptomycin', dose: '6-8mg/kg IV daily', route: 'IV', duration: '6 weeks', notes: 'MRSA osteomyelitis if vancomycin intolerant' },
      { name: 'linezolid', dose: '600mg PO BID', route: 'oral', duration: '6 weeks', notes: 'Oral step-down for MRSA; monitor CBC (thrombocytopenia)' },
    ],
    considerations: [
      'Obtain bone biopsy culture whenever possible (gold standard)',
      'Blood cultures positive in ~50% of hematogenous osteomyelitis',
      'MRI is imaging modality of choice',
      'Surgical debridement improves outcomes in chronic osteomyelitis',
      'Oral step-down: OVIVA trial supports oral antibiotics for bone/joint infections with good bioavailability agents',
    ],
    guidelineSource: 'IDSA 2015 Osteomyelitis (Vertebral) / 2017 Prosthetic Joint Guidelines',
    deEscalationTarget: 'Culture-directed: cefazolin (MSSA), penicillin (strep), oral options per OVIVA criteria',
  },

  'diabetic-foot': {
    infectionType: 'Diabetic Foot Infection',
    setting: 'Outpatient (mild) or inpatient (moderate-severe)',
    firstLine: [
      { name: 'amoxicillin-clavulanate', dose: '875/125mg PO BID', route: 'oral', duration: '1-2 weeks', notes: 'Mild infection, no MRSA risk' },
      { name: 'ampicillin-sulbactam', dose: '3g IV q6h', route: 'IV', duration: '2-4 weeks', notes: 'Moderate infection' },
    ],
    alternatives: [
      { name: 'piperacillin-tazobactam + vancomycin', dose: 'Zosyn 4.5g IV q6h + Vancomycin', route: 'IV', duration: '2-4 weeks', notes: 'Severe, limb-threatening with MRSA risk' },
      { name: 'ertapenem', dose: '1g IV daily', route: 'IV', duration: '2-4 weeks', notes: 'Moderate-severe without Pseudomonas risk' },
      { name: 'clindamycin + ciprofloxacin', dose: 'Clindamycin 300mg PO TID + Ciprofloxacin 500mg PO BID', route: 'oral', duration: '1-2 weeks', notes: 'Penicillin allergy, mild-moderate' },
    ],
    considerations: [
      'Classify severity: mild (superficial), moderate (deeper/larger), severe (systemic signs/limb-threatening)',
      'Obtain wound culture (deep tissue preferred over swab)',
      'Assess for osteomyelitis: probe-to-bone test, MRI, ESR >70mm/h suggestive',
      'Vascular assessment critical — ischemia impairs healing and antibiotic delivery',
      'Offloading and wound care are essential adjuncts',
    ],
    guidelineSource: 'IDSA 2012 Diabetic Foot Infection Guidelines',
    deEscalationTarget: 'Oral agent per culture: amoxicillin-clavulanate, TMP-SMX, or doxycycline',
  },

  'c-difficile': {
    infectionType: 'Clostridioides difficile Infection (CDI)',
    setting: 'Inpatient or outpatient',
    firstLine: [
      { name: 'fidaxomicin', dose: '200mg PO BID', route: 'oral', duration: '10 days', notes: 'Preferred first-line per IDSA/SHEA 2021; lower recurrence rate vs vancomycin' },
      { name: 'vancomycin (oral)', dose: '125mg PO QID', route: 'oral', duration: '10 days', notes: 'Standard first-line if fidaxomicin unavailable (cost)' },
    ],
    alternatives: [
      { name: 'vancomycin taper', dose: '125mg QID x10-14d, BID x7d, daily x7d, q2-3d x2-8wk', route: 'oral', duration: '6-8 weeks', notes: 'For first recurrence' },
      { name: 'metronidazole', dose: '500mg PO TID', route: 'oral', duration: '10 days', notes: 'ONLY if vancomycin/fidaxomicin unavailable. Inferior efficacy.' },
    ],
    considerations: [
      'STOP offending antibiotic if possible',
      'Fidaxomicin superior to vancomycin for preventing recurrence (NNT ~10)',
      'Bezlotoxumab (Zinplava): anti-toxin B antibody for recurrence prevention',
      'Fecal microbiota transplant for >=3 recurrences',
      'Contact precautions: gown, gloves, soap and water hand hygiene (alcohol ineffective against spores)',
      'Fulminant CDI: vancomycin 500mg PO/NG QID + metronidazole 500mg IV q8h +/- vancomycin rectal enema',
    ],
    guidelineSource: 'IDSA/SHEA 2021 CDI Guidelines',
    deEscalationTarget: 'Complete full course; no de-escalation from CDI-specific therapy',
  },
};

// Infection type aliases for fuzzy matching
const infectionAliases: Record<string, string> = {
  'cap': 'community-acquired pneumonia',
  'pneumonia': 'community-acquired pneumonia',
  'community pneumonia': 'community-acquired pneumonia',
  'cap inpatient': 'community-acquired pneumonia inpatient',
  'pneumonia inpatient': 'community-acquired pneumonia inpatient',
  'hap': 'hospital-acquired pneumonia',
  'vap': 'hospital-acquired pneumonia',
  'ventilator pneumonia': 'hospital-acquired pneumonia',
  'nosocomial pneumonia': 'hospital-acquired pneumonia',
  'uti': 'uti-uncomplicated',
  'cystitis': 'uti-uncomplicated',
  'urinary tract infection': 'uti-uncomplicated',
  'bladder infection': 'uti-uncomplicated',
  'complicated uti': 'uti-complicated',
  'pyelonephritis': 'uti-complicated',
  'kidney infection': 'uti-complicated',
  'pyelo': 'uti-complicated',
  'cellulitis': 'skin-soft-tissue',
  'ssti': 'skin-soft-tissue',
  'skin infection': 'skin-soft-tissue',
  'soft tissue': 'skin-soft-tissue',
  'abscess': 'skin-soft-tissue',
  'wound infection': 'skin-soft-tissue',
  'intra-abdominal infection': 'intra-abdominal',
  'iai': 'intra-abdominal',
  'abdominal infection': 'intra-abdominal',
  'peritonitis': 'intra-abdominal',
  'appendicitis': 'intra-abdominal',
  'diverticulitis': 'intra-abdominal',
  'cholecystitis': 'intra-abdominal',
  'sepsis': 'sepsis',
  'septic shock': 'sepsis',
  'bacteremia': 'sepsis',
  'bloodstream infection': 'sepsis',
  'meningitis': 'meningitis',
  'bacterial meningitis': 'meningitis',
  'cns infection': 'meningitis',
  'endocarditis': 'endocarditis',
  'infective endocarditis': 'endocarditis',
  'ie': 'endocarditis',
  'osteomyelitis': 'bone-joint',
  'septic arthritis': 'bone-joint',
  'bone infection': 'bone-joint',
  'joint infection': 'bone-joint',
  'prosthetic joint': 'bone-joint',
  'diabetic foot': 'diabetic-foot',
  'diabetic foot infection': 'diabetic-foot',
  'dfi': 'diabetic-foot',
  'c diff': 'c-difficile',
  'c. diff': 'c-difficile',
  'c difficile': 'c-difficile',
  'cdiff': 'c-difficile',
  'cdi': 'c-difficile',
  'clostridioides difficile': 'c-difficile',
  'clostridium difficile': 'c-difficile',
};

function resolveInfectionType(input: string): string | null {
  const lower = input.toLowerCase().trim();
  if (!lower || lower.length < 2) return null;
  if (empiricTherapyDatabase[lower]) return lower;
  if (infectionAliases[lower]) return infectionAliases[lower];
  // Partial match — only match if the key/alias is at least 3 chars to avoid false positives
  for (const key of Object.keys(empiricTherapyDatabase)) {
    if (key.length >= 3 && (key.includes(lower) || lower.includes(key))) return key;
  }
  for (const [alias, key] of Object.entries(infectionAliases)) {
    if (alias.length >= 3 && (alias.includes(lower) || lower.includes(alias))) return key;
  }
  return null;
}

// ---------------------------------------------------------------------------
// De-escalation Database
// ---------------------------------------------------------------------------

interface DeescalationMapping {
  broadSpectrumAgent: string;
  organism: string;
  susceptibilityPattern: string;
  narrowOptions: Array<{
    drug: string;
    dose: string;
    route: string;
    rationale: string;
  }>;
  priority: 'high' | 'moderate' | 'low';
  reasoning: string;
  stewardshipNotes: string[];
  caveats: string[];
}

const deescalationMappings: DeescalationMapping[] = [
  // Meropenem de-escalation
  {
    broadSpectrumAgent: 'meropenem',
    organism: 'E. coli',
    susceptibilityPattern: 'susceptible to ceftriaxone',
    narrowOptions: [
      { drug: 'ceftriaxone', dose: '1-2g IV daily', route: 'IV', rationale: 'Narrower-spectrum, once-daily dosing, adequate gram-negative coverage' },
      { drug: 'ciprofloxacin', dose: '500mg PO BID', route: 'oral', rationale: 'Oral step-down with excellent bioavailability' },
      { drug: 'trimethoprim-sulfamethoxazole', dose: '160/800mg PO BID', route: 'oral', rationale: 'Narrow-spectrum oral option for UTI source' },
    ],
    priority: 'high',
    reasoning: 'Carbapenems should be reserved for resistant organisms. Non-ESBL E. coli can be treated with cephalosporins.',
    stewardshipNotes: ['Carbapenem de-escalation prevents CRE emergence', 'Cost reduction: meropenem ~$50-100/day vs ceftriaxone ~$5-15/day', 'Oral step-down reduces IV-related complications'],
    caveats: ['Confirm susceptibility on final culture', 'Ensure clinical improvement before switch', 'Monitor for 24-48h after de-escalation'],
  },
  {
    broadSpectrumAgent: 'meropenem',
    organism: 'E. coli',
    susceptibilityPattern: 'ESBL-producing, carbapenem-susceptible',
    narrowOptions: [
      { drug: 'ertapenem', dose: '1g IV daily', route: 'IV', rationale: 'Once-daily carbapenem, does not drive Pseudomonas resistance as much' },
      { drug: 'piperacillin-tazobactam', dose: '4.5g IV q6h (extended infusion)', route: 'IV', rationale: 'MERINO trial showed possible inferiority, but may be acceptable for UTI source with low inoculum' },
    ],
    priority: 'moderate',
    reasoning: 'Even within carbapenems, switching from meropenem to ertapenem is a stewardship win: preserves anti-pseudomonal carbapenems.',
    stewardshipNotes: ['Ertapenem lacks Pseudomonas coverage — reduces selective pressure', 'OPAT-friendly once-daily dosing'],
    caveats: ['MERINO trial: pip-tazo possibly inferior for ESBL bacteremia — use with caution for bloodstream infections', 'Ertapenem appropriate for non-Pseudomonal ESBL infections'],
  },
  {
    broadSpectrumAgent: 'meropenem',
    organism: 'Klebsiella pneumoniae',
    susceptibilityPattern: 'susceptible to ceftriaxone',
    narrowOptions: [
      { drug: 'ceftriaxone', dose: '1-2g IV daily', route: 'IV', rationale: 'Standard de-escalation for susceptible Klebsiella' },
      { drug: 'cefazolin', dose: '2g IV q8h', route: 'IV', rationale: 'Even narrower spectrum if organism susceptible (primarily for UTI source)' },
    ],
    priority: 'high',
    reasoning: 'Non-ESBL Klebsiella should not remain on carbapenem therapy.',
    stewardshipNotes: ['Significant cost savings', 'Reduced C. difficile risk', 'Preserves carbapenems for resistant infections'],
    caveats: ['Verify no AmpC production (Klebsiella aerogenes)', 'Monitor clinical response'],
  },

  // Piperacillin-tazobactam de-escalation
  {
    broadSpectrumAgent: 'piperacillin-tazobactam',
    organism: 'MSSA',
    susceptibilityPattern: 'methicillin-susceptible',
    narrowOptions: [
      { drug: 'cefazolin', dose: '2g IV q8h', route: 'IV', rationale: 'First-generation cephalosporin — optimal for MSSA bacteremia' },
      { drug: 'nafcillin', dose: '2g IV q4h', route: 'IV', rationale: 'Anti-staphylococcal penicillin; gold standard for MSSA endocarditis' },
      { drug: 'cephalexin', dose: '500mg PO QID', route: 'oral', rationale: 'Oral step-down for non-severe MSSA infections' },
    ],
    priority: 'high',
    reasoning: 'MSSA should never be treated long-term with piperacillin-tazobactam. Cefazolin is preferred for MSSA bacteremia (CEFAZOLIN vs anti-staphylococcal penicillin trial — non-inferior).',
    stewardshipNotes: ['Cefazolin q8h dosing is simpler than nafcillin q4h', 'Cefazolin has lower nephrotoxicity than nafcillin', 'Major cost reduction'],
    caveats: ['If MSSA endocarditis, use nafcillin or cefazolin for full course (4-6 weeks)', 'Ensure adequate source control'],
  },
  {
    broadSpectrumAgent: 'piperacillin-tazobactam',
    organism: 'E. coli',
    susceptibilityPattern: 'susceptible to ceftriaxone',
    narrowOptions: [
      { drug: 'ceftriaxone', dose: '1-2g IV daily', route: 'IV', rationale: 'Once-daily dosing, adequate gram-negative coverage' },
      { drug: 'ampicillin', dose: '2g IV q4h', route: 'IV', rationale: 'Narrowest IV option if ampicillin-susceptible' },
      { drug: 'ciprofloxacin', dose: '500mg PO BID', route: 'oral', rationale: 'Oral step-down if fluoroquinolone-susceptible' },
    ],
    priority: 'high',
    reasoning: 'Piperacillin-tazobactam provides unnecessarily broad coverage for susceptible E. coli.',
    stewardshipNotes: ['De-escalation preserves piperacillin-tazobactam efficacy', 'Oral step-down when clinically stable reduces hospitalization'],
    caveats: ['Confirm no mixed infection requiring anaerobic coverage', 'If intra-abdominal source, may still need anaerobic coverage with metronidazole'],
  },
  {
    broadSpectrumAgent: 'piperacillin-tazobactam',
    organism: 'Streptococcus pneumoniae',
    susceptibilityPattern: 'penicillin-susceptible',
    narrowOptions: [
      { drug: 'ampicillin', dose: '2g IV q4h', route: 'IV', rationale: 'Narrowest IV coverage for susceptible pneumococcus' },
      { drug: 'amoxicillin', dose: '1g PO TID', route: 'oral', rationale: 'Oral step-down when clinically stable' },
      { drug: 'penicillin G', dose: '2-4 million units IV q4h', route: 'IV', rationale: 'Narrowest-spectrum option for penicillin-susceptible pneumococcus' },
    ],
    priority: 'high',
    reasoning: 'Penicillin-susceptible pneumococcus should be treated with penicillin/ampicillin — the narrowest effective agent.',
    stewardshipNotes: ['Penicillin for susceptible pneumococcus is a stewardship gold standard', 'Dramatic cost reduction', 'Minimal ecological impact'],
    caveats: ['Verify penicillin MIC (susceptible: <=2 mcg/mL for non-meningitis, <=0.06 for meningitis)', 'If meningitis, use ceftriaxone unless confirmed very susceptible'],
  },

  // Vancomycin de-escalation
  {
    broadSpectrumAgent: 'vancomycin',
    organism: 'MSSA',
    susceptibilityPattern: 'methicillin-susceptible',
    narrowOptions: [
      { drug: 'cefazolin', dose: '2g IV q8h', route: 'IV', rationale: 'MSSA outcomes are BETTER with beta-lactams than vancomycin' },
      { drug: 'nafcillin', dose: '2g IV q4h', route: 'IV', rationale: 'Anti-staphylococcal penicillin, gold standard for MSSA' },
      { drug: 'cephalexin', dose: '500mg PO QID', route: 'oral', rationale: 'Oral step-down for mild MSSA infections' },
    ],
    priority: 'high',
    reasoning: 'CRITICAL de-escalation: vancomycin is INFERIOR to beta-lactams for MSSA. Higher treatment failure rates with vancomycin for MSSA bacteremia.',
    stewardshipNotes: ['Multiple studies show worse outcomes when vancomycin is used for MSSA', 'Reduces vancomycin exposure (less nephrotoxicity, less VRE selection)', 'Cost savings significant'],
    caveats: ['Severe penicillin allergy: continue vancomycin or use daptomycin', 'Confirm MSSA on final susceptibility, not just preliminary gram stain'],
  },
  {
    broadSpectrumAgent: 'vancomycin',
    organism: 'Enterococcus faecalis',
    susceptibilityPattern: 'ampicillin-susceptible',
    narrowOptions: [
      { drug: 'ampicillin', dose: '2g IV q4h', route: 'IV', rationale: 'Ampicillin is preferred over vancomycin for susceptible E. faecalis' },
      { drug: 'amoxicillin', dose: '500mg PO TID', route: 'oral', rationale: 'Oral step-down for UTI source' },
    ],
    priority: 'high',
    reasoning: 'Ampicillin-susceptible E. faecalis should always be de-escalated from vancomycin. Better efficacy and reduced VRE selection.',
    stewardshipNotes: ['Reduces vancomycin use and VRE emergence', 'Ampicillin is more effective than vancomycin for E. faecalis'],
    caveats: ['If endocarditis, add gentamicin synergy (if high-level gentamicin susceptible)', 'Not applicable to E. faecium (usually ampicillin-resistant)'],
  },

  // Cefepime de-escalation
  {
    broadSpectrumAgent: 'cefepime',
    organism: 'E. coli',
    susceptibilityPattern: 'susceptible to ceftriaxone',
    narrowOptions: [
      { drug: 'ceftriaxone', dose: '1-2g IV daily', route: 'IV', rationale: 'Third-generation cephalosporin adequate for susceptible E. coli, once-daily dosing' },
      { drug: 'ampicillin', dose: '2g IV q4-6h', route: 'IV', rationale: 'Narrowest option if ampicillin-susceptible' },
    ],
    priority: 'moderate',
    reasoning: 'Fourth-generation cephalosporin provides unnecessary anti-Pseudomonal coverage for susceptible E. coli.',
    stewardshipNotes: ['Preserves cefepime for infections requiring anti-pseudomonal coverage', 'Simpler once-daily dosing with ceftriaxone'],
    caveats: ['Ensure no concurrent Pseudomonas or Enterobacter infection', 'Verify susceptibility on final culture'],
  },
  {
    broadSpectrumAgent: 'cefepime',
    organism: 'Pseudomonas aeruginosa',
    susceptibilityPattern: 'susceptible to ceftazidime',
    narrowOptions: [
      { drug: 'ceftazidime', dose: '2g IV q8h', route: 'IV', rationale: 'Anti-pseudomonal cephalosporin with narrower gram-positive coverage' },
      { drug: 'ciprofloxacin', dose: '400mg IV q8h or 750mg PO BID', route: 'IV/oral', rationale: 'Oral option for Pseudomonal infections; excellent bioavailability' },
    ],
    priority: 'low',
    reasoning: 'Both are appropriate for Pseudomonas; ciprofloxacin oral step-down is the major stewardship advantage.',
    stewardshipNotes: ['Oral ciprofloxacin for susceptible Pseudomonas reduces IV days', 'Ceftazidime may be slightly narrower than cefepime'],
    caveats: ['Verify ciprofloxacin susceptibility — Pseudomonas resistance to fluoroquinolones is common', 'Maintain anti-pseudomonal coverage for full duration'],
  },

  // Broad-spectrum empiric to narrow
  {
    broadSpectrumAgent: 'vancomycin + piperacillin-tazobactam',
    organism: 'E. coli',
    susceptibilityPattern: 'susceptible to ceftriaxone, MRSA ruled out',
    narrowOptions: [
      { drug: 'ceftriaxone', dose: '1-2g IV daily', route: 'IV', rationale: 'Single agent, once-daily, no MRSA coverage needed' },
      { drug: 'ciprofloxacin', dose: '500mg PO BID', route: 'oral', rationale: 'Oral step-down when clinically stable' },
    ],
    priority: 'high',
    reasoning: 'Dual broad-spectrum empiric therapy should be narrowed as soon as culture data is available. This is a critical stewardship intervention.',
    stewardshipNotes: ['Removing vancomycin reduces nephrotoxicity risk', 'Removing piperacillin-tazobactam reduces C. difficile risk', 'Single agent with oral step-down is the goal'],
    caveats: ['Ensure clinical improvement trending', 'Confirm MRSA screen negative or cultures negative for gram-positives', 'If source not fully controlled, may need broader coverage'],
  },
];

// ---------------------------------------------------------------------------
// Public API Functions
// ---------------------------------------------------------------------------

export function getAntibioticSpectrum(name: string): {
  found: boolean;
  antibiotic?: AntibioticSpectrum;
  resolvedName?: string;
  error?: string;
} {
  const resolved = resolveAntibiotic(name);
  if (!resolved) {
    return {
      found: false,
      error: `Antibiotic "${name}" not found in database. Use listAntibiotics() to see available antibiotics.`,
    };
  }
  return {
    found: true,
    antibiotic: antibioticDatabase[resolved],
    resolvedName: resolved,
  };
}

export function getEmpiricTherapy(infectionType: string): {
  found: boolean;
  recommendation?: EmpiricTherapyRecommendation;
  resolvedType?: string;
  error?: string;
  availableTypes?: string[];
} {
  const resolved = resolveInfectionType(infectionType);
  if (!resolved) {
    return {
      found: false,
      error: `Infection type "${infectionType}" not found. Use listInfectionTypes() to see available infection types.`,
      availableTypes: Object.keys(empiricTherapyDatabase),
    };
  }
  return {
    found: true,
    recommendation: empiricTherapyDatabase[resolved],
    resolvedType: resolved,
  };
}

export function getDeescalationSuggestions(input: {
  currentAntibiotic: string;
  organism: string;
  susceptibility: string;
}): DeescalationSuggestion {
  const currentLower = input.currentAntibiotic.toLowerCase().trim();
  const organismLower = input.organism.toLowerCase().trim();
  const suscLower = input.susceptibility.toLowerCase().trim();

  // Find matching de-escalation mappings
  const matches = deescalationMappings.filter(m => {
    const agentMatch = currentLower.includes(m.broadSpectrumAgent) ||
      m.broadSpectrumAgent.includes(currentLower) ||
      currentLower.split(/[\s+,]/).some(part => m.broadSpectrumAgent.includes(part.trim()));
    const orgMatch = m.organism.toLowerCase().includes(organismLower) ||
      organismLower.includes(m.organism.toLowerCase()) ||
      // Handle common abbreviations
      (organismLower.includes('e. coli') && m.organism.toLowerCase().includes('e. coli')) ||
      (organismLower.includes('e.coli') && m.organism.toLowerCase().includes('e. coli')) ||
      (organismLower.includes('klebsiella') && m.organism.toLowerCase().includes('klebsiella')) ||
      (organismLower.includes('mssa') && m.organism.toLowerCase().includes('mssa')) ||
      (organismLower.includes('strep') && m.organism.toLowerCase().includes('streptococcus')) ||
      (organismLower.includes('enterococcus') && m.organism.toLowerCase().includes('enterococcus'));
    return agentMatch && orgMatch;
  });

  if (matches.length === 0) {
    // Return generic de-escalation guidance
    return {
      currentAntibiotic: input.currentAntibiotic,
      organism: input.organism,
      susceptibility: input.susceptibility,
      narrowSpectrumAlternatives: [],
      deescalationPriority: 'moderate',
      reasoning: `No specific de-escalation mapping found for ${input.currentAntibiotic} -> ${input.organism}. General principle: de-escalate to the narrowest effective agent based on susceptibility data.`,
      stewardshipNotes: [
        'General de-escalation principles apply:',
        '1. Use the narrowest-spectrum agent that covers the identified pathogen',
        '2. Switch from IV to oral when clinically stable (afebrile, improving, tolerating PO)',
        '3. Shorten duration to evidence-based minimums',
        '4. Discontinue unnecessary combination therapy',
      ],
      caveats: [
        'Review final culture and susceptibility results',
        'Consider infection source and severity',
        'Consult infectious disease if complex or resistant organism',
      ],
    };
  }

  // Prioritize best match (by susceptibility if multiple)
  let bestMatch = matches[0];
  for (const m of matches) {
    if (suscLower.includes('susceptible') && m.susceptibilityPattern.includes('susceptible')) {
      bestMatch = m;
      break;
    }
    if (suscLower.includes('esbl') && m.susceptibilityPattern.includes('ESBL')) {
      bestMatch = m;
      break;
    }
  }

  return {
    currentAntibiotic: input.currentAntibiotic,
    organism: input.organism,
    susceptibility: input.susceptibility,
    narrowSpectrumAlternatives: bestMatch.narrowOptions,
    deescalationPriority: bestMatch.priority,
    reasoning: bestMatch.reasoning,
    stewardshipNotes: bestMatch.stewardshipNotes,
    caveats: bestMatch.caveats,
  };
}

export function listAntibiotics(): Array<{
  name: string;
  class: string;
  broadSpectrum: boolean;
  awareCategory: string;
  route: string[];
}> {
  return Object.values(antibioticDatabase).map(a => ({
    name: a.name,
    class: a.class,
    broadSpectrum: a.broadSpectrum,
    awareCategory: a.awareCategory,
    route: a.route,
  }));
}

export function listInfectionTypes(): Array<{
  key: string;
  infectionType: string;
  setting: string;
  guidelineSource: string;
}> {
  return Object.entries(empiricTherapyDatabase).map(([key, rec]) => ({
    key,
    infectionType: rec.infectionType,
    setting: rec.setting,
    guidelineSource: rec.guidelineSource,
  }));
}

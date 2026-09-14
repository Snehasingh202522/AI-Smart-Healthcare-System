const DISEASE_SPECIALIZATION_MAP = {
  'common cold': ['General Physician', 'Pulmonologist'],
  'influenza': ['General Physician', 'Pulmonologist'],
  'flu': ['General Physician', 'Pulmonologist'],
  'fever': ['General Physician', 'Infectious Disease Specialist'],
  'headache': ['Neurologist', 'General Physician'],
  'migraine': ['Neurologist'],
  'hypertension': ['Cardiologist', 'General Physician'],
  'high blood pressure': ['Cardiologist', 'General Physician'],
  'diabetes': ['Endocrinologist', 'General Physician'],
  'asthma': ['Pulmonologist', 'General Physician'],
  'pneumonia': ['Pulmonologist', 'Infectious Disease Specialist'],
  'bronchitis': ['Pulmonologist', 'General Physician'],
  'heart disease': ['Cardiologist'],
  'chest pain': ['Cardiologist', 'General Physician'],
  'arthritis': ['Orthopedic Surgeon', 'Rheumatologist'],
  'joint pain': ['Orthopedic Surgeon', 'Rheumatologist'],
  'back pain': ['Orthopedic Surgeon', 'Neurologist'],
  'depression': ['Psychiatrist', 'General Physician'],
  'anxiety': ['Psychiatrist', 'General Physician'],
  'skin rash': ['Dermatologist', 'General Physician'],
  'eczema': ['Dermatologist'],
  'acne': ['Dermatologist'],
  'allergy': ['Allergist', 'General Physician'],
  'gastritis': ['Gastroenterologist', 'General Physician'],
  'stomach pain': ['Gastroenterologist', 'General Physician'],
  'kidney stones': ['Nephrologist', 'Urologist'],
  'urinary tract infection': ['Urologist', 'General Physician'],
  'uti': ['Urologist', 'General Physician'],
  'pregnancy': ['Gynecologist', 'Obstetrician'],
  'menstrual disorder': ['Gynecologist'],
  'eye infection': ['Ophthalmologist', 'General Physician'],
  'cataract': ['Ophthalmologist'],
  'ear infection': ['ENT Specialist', 'General Physician'],
  'sinusitis': ['ENT Specialist', 'General Physician'],
  'thyroid': ['Endocrinologist'],
  'obesity': ['Endocrinologist', 'General Physician'],
  'cancer': ['Oncologist'],
  'stroke': ['Neurologist'],
  'epilepsy': ['Neurologist'],
  'pediatric fever': ['Pediatrician', 'General Physician'],
  'default': ['General Physician'],
};

const normalizeDisease = (disease) => disease.toLowerCase().trim();

const getSpecializationsForDisease = (disease) => {
  const normalized = normalizeDisease(disease);

  if (DISEASE_SPECIALIZATION_MAP[normalized]) {
    return DISEASE_SPECIALIZATION_MAP[normalized];
  }

  for (const [key, specializations] of Object.entries(DISEASE_SPECIALIZATION_MAP)) {
    if (key !== 'default' && (normalized.includes(key) || key.includes(normalized))) {
      return specializations;
    }
  }

  return DISEASE_SPECIALIZATION_MAP.default;
};

const getSpecializationsForDiseases = (diseases = []) => {
  const allSpecializations = new Set();

  diseases.forEach((disease) => {
    getSpecializationsForDisease(disease).forEach((spec) => allSpecializations.add(spec));
  });

  if (allSpecializations.size === 0) {
    DISEASE_SPECIALIZATION_MAP.default.forEach((spec) => allSpecializations.add(spec));
  }

  return Array.from(allSpecializations);
};

module.exports = {
  DISEASE_SPECIALIZATION_MAP,
  getSpecializationsForDisease,
  getSpecializationsForDiseases,
};

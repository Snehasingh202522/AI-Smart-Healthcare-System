const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const SymptomHistory = require('../models/SymptomHistory');
const { geminiApiKey } = require('../config/env');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const VALID_SEVERITIES = ['low', 'medium', 'high'];

const parseJsonFromText = (text) => {
  if (!text) {
    throw new Error('Empty AI response');
  }

  // Strip markdown code fences (```json ... ```) if present.
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    return JSON.parse(jsonMatch[0]);
  }
};

const clampConfidence = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.min(1, Math.max(0, num));
};

// Normalize the raw model output into the shape stored on SymptomHistory.
const normalizeAnalysis = (raw) => {
  const needsMoreInfo = raw.needsMoreInfo === true;

  const possibleDiseases = Array.isArray(raw.possibleDiseases)
    ? raw.possibleDiseases
        .filter((d) => d && d.name)
        .slice(0, 5)
        .map((d) => ({ name: String(d.name), confidence: clampConfidence(d.confidence) }))
    : [];

  const followUpQuestions = Array.isArray(raw.followUpQuestions)
    ? raw.followUpQuestions.filter((q) => typeof q === 'string' && q.trim()).slice(0, 5)
    : [];

  return {
    needsMoreInfo,
    followUpQuestions,
    possibleDiseases,
    severity: VALID_SEVERITIES.includes(raw.severity) ? raw.severity : 'medium',
    recommendedSpecialist: raw.recommendedSpecialist || 'General Physician',
    homeCareAdvice:
      raw.homeCareAdvice ||
      (needsMoreInfo
        ? 'Please provide more detail about your symptoms for an accurate assessment.'
        : 'Please consult a doctor for proper diagnosis.'),
    emergencyWarning: {
      isEmergency: raw.emergencyWarning?.isEmergency === true,
      message: raw.emergencyWarning?.message || '',
    },
  };
};

const generateSymptomAnalysis = async (symptoms, age, gender, existingDiseases, currentMedications) => {
  if (!geminiApiKey) {
    throw new ApiError(500, 'AI service is not configured. Please contact administrator.');
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.4,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `You are a medical AI assistant. Analyze the following patient information and return ONLY a JSON object (no markdown, no commentary).

Patient Information:
- Age: ${age}
- Gender: ${gender}
- Symptoms: ${symptoms}
- Existing Diseases: ${existingDiseases.length > 0 ? existingDiseases.join(', ') : 'None'}
- Current Medications: ${currentMedications.length > 0 ? currentMedications.join(', ') : 'None'}

Return JSON with exactly this structure:
{
  "needsMoreInfo": false,
  "followUpQuestions": ["clarifying question", "..."],
  "possibleDiseases": [{ "name": "disease name", "confidence": 0.0 }],
  "severity": "low | medium | high",
  "recommendedSpecialist": "specialist type",
  "homeCareAdvice": "brief home care advice",
  "emergencyWarning": { "isEmergency": false, "message": "" }
}

Guidelines:
- If the symptoms are too vague, generic, or insufficient to reason about (e.g. "not feeling well", a single word, or no real clinical detail), set "needsMoreInfo" to true, provide 2-4 specific "followUpQuestions", and return an empty "possibleDiseases" array.
- Otherwise set "needsMoreInfo" to false, list the 3-5 most likely diseases with a "confidence" between 0 and 1, and factor in existing diseases and current medications.
- "severity" reflects how urgently medical attention is needed.
- If symptoms suggest a life-threatening condition, set "emergencyWarning.isEmergency" to true with a clear message.
- Keep "homeCareAdvice" practical and concise.
- Return ONLY valid JSON.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = parseJsonFromText(response.text());
    return normalizeAnalysis(raw);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new ApiError(500, 'Failed to analyze symptoms. Please try again later.');
  }
};

const symptomCheck = asyncHandler(async (req, res) => {
  const { symptoms, age, gender, existingDiseases = [], currentMedications = [] } = req.body;
  const patientId = req.user._id;

  let aiAnalysis;
  let status = 'analyzed';
  let errorMessage = '';

  try {
    aiAnalysis = await generateSymptomAnalysis(symptoms, age, gender, existingDiseases, currentMedications);
  } catch (error) {
    status = 'failed';
    errorMessage = error.message || 'AI analysis failed';
    
    // Return mock data as fallback
    aiAnalysis = {
      needsMoreInfo: false,
      followUpQuestions: [],
      possibleDiseases: [
        { name: 'Unable to determine', confidence: 0 },
      ],
      severity: 'medium',
      recommendedSpecialist: 'General Physician',
      homeCareAdvice: 'Please consult a doctor for proper diagnosis.',
      emergencyWarning: {
        isEmergency: false,
        message: '',
      },
    };
  }

  const symptomHistory = await SymptomHistory.create({
    patient: patientId,
    symptoms,
    age,
    gender,
    existingDiseases,
    currentMedications,
    aiAnalysis,
    status,
    errorMessage,
  });

  res.status(201).json(new ApiResponse(201, symptomHistory, 'Symptom analysis completed'));
});

const getSymptomHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const patientId = req.user._id;

  const skip = (page - 1) * limit;
  const history = await SymptomHistory.find({ patient: patientId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await SymptomHistory.countDocuments({ patient: patientId });

  res.status(200).json(
    new ApiResponse(
      200,
      { history, pagination: { page: parseInt(page), limit: parseInt(limit), total } },
      'Symptom history fetched successfully'
    )
  );
});

const getSymptomById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const symptomRecord = await SymptomHistory.findById(id);

  if (!symptomRecord) {
    throw new ApiError(404, 'Symptom analysis not found');
  }

  if (symptomRecord.patient.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to access this analysis');
  }

  res.status(200).json(new ApiResponse(200, symptomRecord, 'Symptom analysis fetched successfully'));
});

module.exports = {
  symptomCheck,
  getSymptomHistory,
  getSymptomById,
};

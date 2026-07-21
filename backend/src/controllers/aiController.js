const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const SymptomHistory = require('../models/SymptomHistory');
const { geminiApiKey } = require('../config/env');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateSymptomAnalysis = async (symptoms, age, gender, existingDiseases, currentMedications) => {
  if (!geminiApiKey) {
    throw new ApiError(500, 'AI service is not configured. Please contact administrator.');
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a medical AI assistant. Analyze the following symptoms and provide a structured medical assessment.

Patient Information:
- Age: ${age}
- Gender: ${gender}
- Symptoms: ${symptoms}
- Existing Diseases: ${existingDiseases.length > 0 ? existingDiseases.join(', ') : 'None'}
- Current Medications: ${currentMedications.length > 0 ? currentMedications.join(', ') : 'None'}

Please provide a JSON response with the following structure:
{
  "possibleDiseases": [
    {
      "name": "disease name",
      "confidence": 0.95
    }
  ],
  "severity": "low" or "medium" or "high",
  "recommendedSpecialist": "specialist type",
  "homeCareAdvice": "brief home care advice",
  "emergencyWarning": {
    "isEmergency": false,
    "message": ""
  }
}

Important guidelines:
- Provide only the most likely 3-5 possible diseases
- Confidence should be between 0 and 1
- Severity should be based on the urgency of medical attention needed
- If symptoms indicate a life-threatening condition, set isEmergency to true and provide a clear warning message
- Keep home care advice practical and concise
- Return ONLY valid JSON, no additional text`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
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

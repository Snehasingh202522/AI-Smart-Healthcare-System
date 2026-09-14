const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const SymptomHistory = require("../models/SymptomHistory");
const { geminiApiKey } = require("../config/env");

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
  apiVersion: "v1",
});

const VALID_SEVERITIES = ["low", "medium", "high"];

// ---------------- Helpers ----------------

const parseJsonFromText = (text) => {
  if (!text) throw new Error("Empty AI response");

  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid AI response format");
    return JSON.parse(match[0]);
  }
};

const clampConfidence = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(1, num));
};

const normalizeAnalysis = (raw) => {
  const needsMoreInfo = raw.needsMoreInfo === true;

  return {
    needsMoreInfo,

    followUpQuestions: Array.isArray(raw.followUpQuestions)
      ? raw.followUpQuestions
          .filter((q) => typeof q === "string" && q.trim())
          .slice(0, 5)
      : [],

    possibleDiseases: Array.isArray(raw.possibleDiseases)
      ? raw.possibleDiseases
          .filter((d) => d?.name)
          .slice(0, 5)
          .map((d) => ({
            name: String(d.name),
            confidence: clampConfidence(d.confidence),
          }))
      : [],

    severity: VALID_SEVERITIES.includes(raw.severity)
      ? raw.severity
      : "medium",

    recommendedSpecialist:
      raw.recommendedSpecialist || "General Physician",

    homeCareAdvice:
      raw.homeCareAdvice ||
      (needsMoreInfo
        ? "Please answer the follow-up questions for a more accurate assessment."
        : "Please consult a doctor for proper diagnosis."),

    emergencyWarning: {
      isEmergency: raw.emergencyWarning?.isEmergency === true,
      message: raw.emergencyWarning?.message || "",
    },
  };
};

// ---------------- Model Selection ----------------

const getPreferredFlashModels = async () => {
  const iterator = await ai.models.list();
  const available = [];

  for await (const m of iterator) {
    if (
      m.name &&
      m.supportedActions?.includes("generateContent") &&
      m.name.toLowerCase().includes("flash")
    ) {
      available.push(m.name.replace("models/", ""));
    }
  }

  console.log("Available Flash Models:", available);

  const preference = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash-lite",
  ];

  return preference.filter((m) => available.includes(m));
};

// ---------------- Gemini ----------------

const generateSymptomAnalysis = async (
  symptoms,
  age,
  gender,
  existingDiseases,
  currentMedications,
  followUpAnswers = {},
  askedQuestions = [],
  conversationContext = []
) => {
  if (!geminiApiKey) {
    throw new ApiError(
      500,
      "GEMINI_API_KEY is missing. Configure it in backend/.env"
    );
  }

  const text = (symptoms || "").toLowerCase().trim();
  const words = text.split(/\s+/).filter(Boolean);

  const hasDuration =
    /(day|days|week|weeks|month|months|today|yesterday|since|started|began)/i.test(text);

  const hasSeverity =
    /(mild|moderate|severe|high|low|painful|sharp|burning|fever|hurt|bad|terrible)/i.test(text);

  const hasLocation =
    /(head|chest|stomach|back|throat|arm|leg|neck|abdomen|pain in|ache in)/i.test(text);

  // Build comprehensive conversation context
  const conversationHistory = conversationContext.map((ctx, index) => 
    `Exchange ${index + 1}:\nQ: ${ctx.question}\nA: ${ctx.answer}`
  ).join('\n\n');

  const answerContext = Object.entries(followUpAnswers)
    .map(([question, answer]) => `Q: ${question}\nA: ${answer}`)
    .join('\n');

  // Extract collected information categories
  const collectedInfo = {
    duration: hasDuration || Object.values(followUpAnswers).some(a => 
      /(day|days|week|weeks|month|months|today|yesterday|since|started|began)/i.test(a)
    ),
    severity: hasSeverity || Object.values(followUpAnswers).some(a => 
      /(mild|moderate|severe|high|low|painful|sharp|burning|fever|hurt|bad|terrible)/i.test(a)
    ),
    location: hasLocation || Object.values(followUpAnswers).some(a => 
      /(head|chest|stomach|back|throat|arm|leg|neck|abdomen|pain in|ache in)/i.test(a)
    ),
    progression: Object.values(followUpAnswers).some(a => 
      /(better|worse|improving|getting|increasing|decreasing)/i.test(a)
    ),
    associatedSymptoms: Object.values(followUpAnswers).some(a => 
      /(fever|vomiting|nausea|breathing|chest pain|dizziness|fatigue|cough)/i.test(a)
    )
  };

  // Check if we have sufficient information for analysis
  const hasSufficientInfo = collectedInfo.duration && collectedInfo.severity && 
                           (collectedInfo.location || words.length >= 8);

  // Maximum follow-up rounds to prevent infinite loops
  const maxFollowUpRounds = 4;
  const currentRound = conversationContext.length;

  // If we have sufficient info or reached max rounds, generate final assessment
  if (hasSufficientInfo || currentRound >= maxFollowUpRounds) {
    const prompt = `
You are an experienced medical triage assistant.

Patient Details:
- Age: ${age}
- Gender: ${gender}
- Symptoms: ${symptoms}
- Existing Diseases: ${
    existingDiseases.length ? existingDiseases.join(", ") : "None"
  }
- Current Medications: ${
    currentMedications.length ? currentMedications.join(", ") : "None"
  }

Conversation History:
${conversationHistory || "No prior conversation"}

Additional Information Provided:
${answerContext || "No additional information"}

Return ONLY valid JSON.

{
  "needsMoreInfo": false,
  "followUpQuestions": [],
  "possibleDiseases":[
    {"name":"","confidence":0.0}
  ],
  "severity":"low",
  "recommendedSpecialist":"",
  "homeCareAdvice":"",
  "emergencyWarning":{
    "isEmergency":false,
    "message":""
  }
}

Rules:
- Return ONLY valid JSON.
- Give 3-5 possible diseases based on ALL information provided.
- Confidence must be between 0 and 1.
- Severity must be low, medium or high.
- Provide detailed home care advice based on the symptoms and all answers provided.
- Consider the conversation history - do not ask for information already provided.
- If symptoms suggest emergency (chest pain, difficulty breathing, severe pain, etc.), set isEmergency to true with appropriate message.
`;

    try {
      const models = await getPreferredFlashModels();

      if (!models.length) {
        throw new Error("No compatible Gemini Flash model found.");
      }

      let lastError;

      for (const modelName of models) {
        try {
          console.log("Trying Gemini Model:", modelName);

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
          });

          const raw = parseJsonFromText(response.text);
          return normalizeAnalysis(raw);
        } catch (err) {
          lastError = err;

          if (err.status === 503 || err.status === 429) {
            continue;
          }

          throw err;
        }
      }

      throw lastError;
    } catch (error) {
      console.error("Gemini Error:", error);

      throw new ApiError(
        500,
        `Failed to analyze symptoms: ${error.message}`
      );
    }
  }

  // Generate follow-up questions for missing information
  const potentialQuestions = [];

  if (!collectedInfo.duration) {
    potentialQuestions.push("When did these symptoms start?");
  }
  
  if (!collectedInfo.severity) {
    potentialQuestions.push("How severe are your symptoms (mild, moderate, or severe)?");
  }
  
  if (!collectedInfo.location) {
    potentialQuestions.push("Where exactly do you feel these symptoms?");
  }
  
  if (!collectedInfo.progression) {
    potentialQuestions.push("Are your symptoms getting better, worse, or staying the same?");
  }
  
  if (!collectedInfo.associatedSymptoms) {
    potentialQuestions.push("Do you have any other symptoms like fever, vomiting, or difficulty breathing?");
  }

  // Filter out questions that have already been asked semantically
  const newQuestions = potentialQuestions.filter(q => {
    const lowerQ = q.toLowerCase();
    return !askedQuestions.some(asked => {
      const lowerAsked = asked.toLowerCase();
      // Check for semantic similarity
      if (lowerAsked.includes('when') && lowerQ.includes('when')) return true;
      if (lowerAsked.includes('severe') && lowerQ.includes('severe')) return true;
      if (lowerAsked.includes('where') && lowerQ.includes('where')) return true;
      if (lowerAsked.includes('better') && lowerQ.includes('better')) return true;
      if (lowerAsked.includes('other symptoms') && lowerQ.includes('other symptoms')) return true;
      return false;
    });
  });

  // If no new questions but still need more info, ask for general details
  if (newQuestions.length === 0 && !hasSufficientInfo) {
    newQuestions.push("Can you provide any additional details about your symptoms?");
  }

  return {
    needsMoreInfo: true,
    followUpQuestions: newQuestions.slice(0, 2), // Ask max 2 new questions at a time
    possibleDiseases: [],
    severity: "medium",
    recommendedSpecialist: "General Physician",
    homeCareAdvice:
      "Please answer the follow-up questions for a more accurate assessment.",
    emergencyWarning: {
      isEmergency: false,
      message: "",
    },
  };
};
// ---------------- Controllers ----------------

const symptomCheck = asyncHandler(async (req, res) => {
  const {
    symptoms,
    age,
    gender,
    existingDiseases = [],
    currentMedications = [],
    followUpAnswers = {},
  } = req.body;

  const patientId = req.user._id;

  try {
    // Check if this is a follow-up (has followUpAnswers and previous entry exists)
    const isFollowUp = Object.keys(followUpAnswers).length > 0;
    let askedQuestions = [];
    let conversationContext = [];
    
    if (isFollowUp) {
      // Get the most recent entry to track conversation
      const recentEntry = await SymptomHistory.findOne({
        patient: patientId,
      }).sort({ createdAt: -1 });

      if (recentEntry) {
        askedQuestions = recentEntry.aiAnalysis.askedQuestions || [];
        conversationContext = recentEntry.aiAnalysis.conversationContext || [];
        
        // Add the latest exchange to conversation context
        const latestQuestions = recentEntry.aiAnalysis.followUpQuestions || [];
        if (latestQuestions.length > 0) {
          // Get the answers for the latest questions
          const newExchanges = latestQuestions.map(q => ({
            question: q,
            answer: followUpAnswers[q] || "No answer provided"
          }));
          conversationContext = [...conversationContext, ...newExchanges];
        }
      }
    }

    const aiAnalysis = await generateSymptomAnalysis(
      symptoms,
      age,
      gender,
      existingDiseases,
      currentMedications,
      followUpAnswers,
      askedQuestions,
      conversationContext
    );

    // Update asked questions with the new follow-up questions
    aiAnalysis.askedQuestions = [
      ...askedQuestions,
      ...(aiAnalysis.followUpQuestions || [])
    ];

    // Store conversation context for next round
    aiAnalysis.conversationContext = conversationContext;

    let history;

    if (isFollowUp) {
      // Update the most recent entry instead of creating a new one
      const recentEntry = await SymptomHistory.findOne({
        patient: patientId,
      }).sort({ createdAt: -1 });

      if (recentEntry && recentEntry.aiAnalysis.needsMoreInfo) {
        // Update existing entry with follow-up answers
        recentEntry.symptoms = symptoms;
        recentEntry.age = age;
        recentEntry.gender = gender;
        recentEntry.existingDiseases = existingDiseases;
        recentEntry.currentMedications = currentMedications;
        
        // Merge follow-up answers
        const existingAnswers = recentEntry.followUpAnswers || {};
        recentEntry.followUpAnswers = {
          ...existingAnswers,
          ...followUpAnswers
        };
        
        recentEntry.aiAnalysis = aiAnalysis;
        recentEntry.status = "analyzed";
        recentEntry.errorMessage = "";
        history = await recentEntry.save();
      } else {
        // Create new entry if no recent entry or it wasn't waiting for follow-up
        history = await SymptomHistory.create({
          patient: patientId,
          symptoms,
          age,
          gender,
          existingDiseases,
          currentMedications,
          followUpAnswers,
          aiAnalysis,
          status: "analyzed",
          errorMessage: "",
        });
      }
    } else {
      // Create new entry for initial symptom check
      history = await SymptomHistory.create({
        patient: patientId,
        symptoms,
        age,
        gender,
        existingDiseases,
        currentMedications,
        followUpAnswers,
        aiAnalysis,
        status: "analyzed",
        errorMessage: "",
      });
    }

    return res
      .status(201)
      .json(new ApiResponse(201, history, "Symptom analysis completed"));
  } catch (error) {
    // Only create failed entry if this is not a follow-up
    if (Object.keys(followUpAnswers).length === 0) {
      await SymptomHistory.create({
        patient: patientId,
        symptoms,
        age,
        gender,
        existingDiseases,
        currentMedications,
        followUpAnswers,
        aiAnalysis: {
          needsMoreInfo: false,
          followUpQuestions: [],
          askedQuestions: [],
          conversationContext: [],
          possibleDiseases: [],
          severity: "medium",
          recommendedSpecialist: "General Physician",
          homeCareAdvice:
            "Please consult a doctor for proper diagnosis.",
          emergencyWarning: {
            isEmergency: false,
            message: "",
          },
        },
        status: "failed",
        errorMessage: error.message,
      });
    }

    throw error;
  }
});

const getSymptomHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  // Resource-level authorization: patients can only see their own symptom history
  const patientId = req.user._id;
  const skip = (page - 1) * limit;

  const history = await SymptomHistory.find({
    patient: patientId,
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await SymptomHistory.countDocuments({
    patient: patientId,
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        history,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
        },
      },
      "Symptom history fetched successfully"
    )
  );
});

const getSymptomById = asyncHandler(async (req, res) => {
  const record = await SymptomHistory.findById(req.params.id);

  if (!record) {
    throw new ApiError(404, "Symptom analysis not found");
  }

  if (record.patient.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Not authorized to access this analysis"
    );
  }

  res.status(200).json(
    new ApiResponse(
      200,
      record,
      "Symptom analysis fetched successfully"
    )
  );
});

module.exports = {
  symptomCheck,
  getSymptomHistory,
  getSymptomById,
};
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Stethoscope,
  Plus,
  Trash2,
  Sparkles,
  MapPin,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { aiService } from "../services/authService";
import { useToast } from "../hooks/useToast";

import Card from "../components/common/Card";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import Badge from "../components/common/Badge";

const SymptomCheckerPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [existingDiseases, setExistingDiseases] = useState([""]);
  const [medications, setMedications] = useState([""]);

  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [followUpAnswers, setFollowUpAnswers] = useState({});
  const [needsMoreInfo, setNeedsMoreInfo] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [askedQuestions, setAskedQuestions] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      symptoms: "",
      age: user?.dateOfBirth
        ? new Date().getFullYear() -
          new Date(user.dateOfBirth).getFullYear()
        : "",
      gender: "",
    },
  });

  const addDisease = () =>
    setExistingDiseases([...existingDiseases, ""]);

  const removeDisease = (index) =>
    setExistingDiseases(existingDiseases.filter((_, i) => i !== index));

  const updateDisease = (index, value) => {
    const updated = [...existingDiseases];
    updated[index] = value;
    setExistingDiseases(updated);
  };

  const addMedication = () =>
    setMedications([...medications, ""]);

  const removeMedication = (index) =>
    setMedications(medications.filter((_, i) => i !== index));

  const updateMedication = (index, value) => {
    const updated = [...medications];
    updated[index] = value;
    setMedications(updated);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setNeedsMoreInfo(false);
    setFollowUpQuestions([]);
    setFollowUpAnswers({});
    setConversationHistory([]);
    setAskedQuestions([]);

    try {
      const payload = {
        ...data,
        existingDiseases: existingDiseases.filter((d) => d.trim()),
        currentMedications: medications.filter((m) => m.trim()),
      };

      setInitialData(payload);

      const response = await aiService.checkSymptoms(payload);

      // aiService returns response.data.data, so response is already the SymptomHistory object
      if (response?.aiAnalysis?.needsMoreInfo) {
        setNeedsMoreInfo(true);
        setFollowUpQuestions(
          response.aiAnalysis.followUpQuestions || []
        );
        setAskedQuestions(response.aiAnalysis.askedQuestions || []);
        setConversationHistory(response.aiAnalysis.conversationContext || []);
        toast.info("Please answer the follow-up questions.");
      } else {
        setResult(response);
        toast.success("Symptom analysis completed.");
      }
    } catch (err) {
      console.error("Symptom analysis error:", err);
      
      // Enhanced error handling
      let message = "Failed to analyze symptoms";
      
      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      } else if (err?.code === 'ERR_NETWORK') {
        message = "Network error. Please check your connection and try again.";
      } else if (err?.code === 'ECONNABORTED') {
        message = "Request timed out. The AI service may be busy. Please try again.";
      } else if (err?.response?.status === 429) {
        message = "Too many requests. Please wait a moment and try again.";
      } else if (err?.response?.status === 500) {
        message = "AI service error. Our team has been notified. Please try again later.";
      }

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSubmit = async () => {
    setLoading(true);

    try {
      // Add current exchange to conversation history
      const newConversationHistory = [
        ...conversationHistory,
        ...followUpQuestions.map(q => ({
          question: q,
          answer: followUpAnswers[q] || "No answer provided"
        }))
      ];

      const response = await aiService.checkSymptoms({
        ...initialData,
        followUpAnswers,
      });

      if (response?.aiAnalysis?.needsMoreInfo) {
        setNeedsMoreInfo(true);
        setFollowUpQuestions(
          response.aiAnalysis.followUpQuestions || []
        );
        setAskedQuestions(response.aiAnalysis.askedQuestions || []);
        setConversationHistory(response.aiAnalysis.conversationContext || newConversationHistory);
        toast.info("Please answer the follow-up questions.");
      } else {
        setNeedsMoreInfo(false);
        setFollowUpQuestions([]);
        setResult(response);
        toast.success("Analysis completed.");
      }
    } catch (err) {
      console.error("Follow-up analysis error:", err);
      
      let message = "Failed to complete analysis";
      
      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message) {
        message = err.message;
      } else if (err?.code === 'ERR_NETWORK') {
        message = "Network error. Please check your connection and try again.";
      } else if (err?.code === 'ECONNABORTED') {
        message = "Request timed out. Please try again.";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFindDoctors = () => {
    if (!result?.aiAnalysis) return;

    const specialist =
      result.aiAnalysis.recommendedSpecialist || "General Physician";

    if (!specialist) {
      toast.error("No specialist recommendation available.");
      return;
    }

    navigate("/patient/smart-doctor-recommendation", {
      state: {
        specialist: specialist,
        symptoms: initialData?.symptoms || "",
      },
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "low":
        return CheckCircle;
      case "medium":
        return Clock;
      case "high":
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Brain className="h-8 w-8 text-primary-600" />
          AI Symptom Checker
        </h2>

        <p className="text-gray-500">
          Describe your symptoms and get AI-assisted preliminary health insights.
        </p>
      </div>

      <Card>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Symptoms
            </label>

            <textarea
              rows={4}
              {...register("symptoms", {
                required: "Symptoms are required",
                minLength: {
                  value: 10,
                  message: "Minimum 10 characters",
                },
              })}
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Describe your symptoms..."
            />

            {errors.symptoms && (
              <p className="text-sm text-red-500 mt-1">
                {errors.symptoms.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Age
              </label>

              <input
                type="number"
                {...register("age", {
                  required: "Age is required",
                })}
                className="w-full rounded-lg border px-4 py-2"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Gender
              </label>

              <select
                {...register("gender", {
                  required: "Gender is required",
                })}
                className="w-full rounded-lg border px-4 py-2"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Existing Diseases
            </label>

            <div className="space-y-2">
              {existingDiseases.map((disease, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={disease}
                    onChange={(e) =>
                      updateDisease(index, e.target.value)
                    }
                    className="flex-1 rounded-lg border px-4 py-2"
                  />

                  {existingDiseases.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDisease(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDisease}
                icon={Plus}
              >
                Add Disease
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Current Medications
            </label>

            <div className="space-y-2">
              {medications.map((med, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={med}
                    onChange={(e) =>
                      updateMedication(index, e.target.value)
                    }
                    className="flex-1 rounded-lg border px-4 py-2"
                  />

                  {medications.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMedication(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMedication}
                icon={Plus}
              >
                Add Medication
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            icon={Sparkles}
          >
            Analyze Symptoms
          </Button>
        </form>
      </Card>
            {loading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">
              AI is analyzing your symptoms...
            </p>
          </div>
        </Card>
      )}

      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h4 className="font-semibold text-red-800">
                Analysis Failed
              </h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Follow-up Questions */}

      {needsMoreInfo && (
        <Card className="border-blue-200 bg-blue-50">
          <div className="space-y-5">
            <div className="flex gap-3">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  We need a little more information
                </h3>

                <p className="text-sm text-blue-700 mt-1">
                  Please answer these questions so the AI can give a
                  better recommendation.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {(followUpQuestions.length
                ? followUpQuestions
                : [
                    "When did the symptoms start?",
                    "How severe are they?",
                    "Do you have any other symptoms?",
                  ]
              ).map((question, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    {question}
                  </label>

                  <input
  type="text"
  className="w-full rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 px-4 py-2 text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
  placeholder="Type your answer..."
  value={followUpAnswers[question] || ""}
  onChange={(e) =>
    setFollowUpAnswers({
      ...followUpAnswers,
      [question]: e.target.value,
    })
  }
/>
                </div>
              ))}
            </div>

            <Button
              onClick={handleFollowUpSubmit}
              loading={loading}
              className="w-full"
            >
              Continue Analysis
            </Button>
          </div>
        </Card>
      )}

      {/* Final AI Result */}

      {result && !needsMoreInfo && (
        <div className="space-y-4">

          {/* Emergency Warning */}

          {result.aiAnalysis?.emergencyWarning?.isEmergency && (
            <Card className="border-2 border-red-500 bg-red-50">
              <div className="flex gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    Emergency Warning
                  </h3>

                  <p className="text-red-800 mt-1">
                    {result.aiAnalysis.emergencyWarning.message}
                  </p>

                  <p className="text-sm text-red-700 mt-2">
                    Please seek immediate medical attention.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Main Result Card */}

          <Card>
            <div className="flex items-center justify-between mb-5">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Brain className="h-5 w-5 text-primary-600" />
                Analysis Result
              </h3>

              <Badge className={getSeverityColor(result.aiAnalysis.severity)}>
                <div className="flex items-center gap-1">
                  {React.createElement(
                    getSeverityIcon(result.aiAnalysis.severity),
                    { className: "h-4 w-4" }
                  )}

                  <span className="capitalize">
                    {result.aiAnalysis.severity}
                  </span>
                </div>
              </Badge>
            </div>

            <div className="space-y-5">

              {/* Possible Diseases */}

              <div>
                <h4 className="font-semibold mb-3">
                  Possible Diseases
                </h4>

                <div className="space-y-3">
                  {(result.aiAnalysis.possibleDiseases || []).map(
                    (disease, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border rounded-lg p-3"
                      >
                        <span>{disease.name}</span>

                        <Badge className="bg-blue-100 text-blue-800">
                          {Math.round(
                            (disease.confidence || 0) * 100
                          )}
                          %
                        </Badge>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Specialist */}

              <div>
                <h4 className="font-semibold mb-2">
                  Recommended Specialist
                </h4>

                <div className="flex items-center gap-2 border rounded-lg p-3">
                  <Stethoscope className="h-5 w-5 text-primary-600" />
                  <span>
                    {result.aiAnalysis.recommendedSpecialist ||
                      "General Physician"}
                  </span>
                </div>
              </div>

              {/* Home Care */}

              <div>
                <h4 className="font-semibold mb-2">
                  Home Care Advice
                </h4>

                <div className="border rounded-lg p-3 text-gray-700">
                  {result.aiAnalysis.homeCareAdvice ||
                    "Follow your doctor's advice and monitor your symptoms."}
                </div>
              </div>

              {/* Find Doctor */}

              <Button
                onClick={handleFindDoctors}
                className="w-full"
                icon={MapPin}
              >
                Find Recommended Doctors Near Me
              </Button>
            </div>
          </Card>

          {/* Disclaimer */}

          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />

              <div>
                <h4 className="font-semibold text-yellow-900">
                  Medical Disclaimer
                </h4>

                <p className="text-sm text-yellow-800 mt-1">
                  This AI-assisted preliminary symptom assessment is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SymptomCheckerPage;
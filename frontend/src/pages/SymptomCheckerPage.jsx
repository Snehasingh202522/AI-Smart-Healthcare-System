import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Brain, AlertTriangle, CheckCircle, Clock, Stethoscope, Plus, Trash2, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { aiService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';

const SymptomCheckerPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [existingDiseases, setExistingDiseases] = useState(['']);
  const [medications, setMedications] = useState(['']);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      symptoms: '',
      age: user?.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : '',
      gender: '',
    },
  });

  const addDisease = () => setExistingDiseases([...existingDiseases, '']);
  const removeDisease = (index) => setExistingDiseases(existingDiseases.filter((_, i) => i !== index));
  const updateDisease = (index, value) => {
    const updated = [...existingDiseases];
    updated[index] = value;
    setExistingDiseases(updated);
  };

  const addMedication = () => setMedications([...medications, '']);
  const removeMedication = (index) => setMedications(medications.filter((_, i) => i !== index));
  const updateMedication = (index, value) => {
    const updated = [...medications];
    updated[index] = value;
    setMedications(updated);
  };

  const onSubmit = async (data) => {
  setLoading(true);
  setResult(null);

  try {
    const response = await aiService.checkSymptoms({
      ...data,
      existingDiseases: existingDiseases.filter((d) => d.trim()),
      currentMedications: medications.filter((m) => m.trim()),
    });

    console.log("API Response:", response);

    setResult(response.data);

    toast.success("Symptom analysis completed");
  } catch (error) {
    console.error("Backend Error:", error);

    toast.error(
      error?.response?.data?.message ||
      error?.message ||
      "Failed to analyze symptoms"
    );
  } finally {
    setLoading(false);
  }
};

  const handleFindDoctors = () => {
    if (!result?.aiAnalysis) return;

    const diseaseNames = result.aiAnalysis.possibleDiseases
      .filter((d) => d.name && d.name !== 'Unable to determine')
      .map((d) => d.name);

    const params = new URLSearchParams();
    if (diseaseNames.length > 0) {
      params.set('diseases', diseaseNames.join(','));
      params.set('disease', diseaseNames[0]);
    } else if (result.aiAnalysis.recommendedSpecialist) {
      params.set('disease', result.aiAnalysis.recommendedSpecialist);
    }

    navigate(`/patient/find-doctors?${params.toString()}`);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'low':
        return CheckCircle;
      case 'medium':
        return Clock;
      case 'high':
        return AlertTriangle;
      default:
        return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
          <Brain className="h-8 w-8 text-primary-600" />
          AI Symptom Checker
        </h2>
        <p className="mt-1 text-gray-500">
          Describe your symptoms and get AI-powered health insights
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Describe Your Symptoms
            </label>
            <textarea
              {...register('symptoms', {
                required: 'Symptoms description is required',
                minLength: { value: 10, message: 'Please provide more details (at least 10 characters)' },
              })}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder="e.g., I have been experiencing severe headache for the past 3 days, accompanied by nausea and sensitivity to light..."
            />
            {errors.symptoms && (
              <p className="mt-1 text-sm text-red-500">{errors.symptoms.message}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Age
              </label>
              <input
                type="number"
                {...register('age', {
                  required: 'Age is required',
                  min: { value: 0, message: 'Age must be at least 0' },
                  max: { value: 150, message: 'Age cannot exceed 150' },
                })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Your age"
              />
              {errors.age && (
                <p className="mt-1 text-sm text-red-500">{errors.age.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender
              </label>
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Existing Diseases (Optional)
            </label>
            <div className="space-y-2">
              {existingDiseases.map((disease, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={disease}
                    onChange={(e) => updateDisease(index, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="e.g., Diabetes, Hypertension"
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
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Medications (Optional)
            </label>
            <div className="space-y-2">
              {medications.map((medication, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={medication}
                    onChange={(e) => updateMedication(index, e.target.value)}
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    placeholder="e.g., Aspirin, Metformin"
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

          <Button type="submit" loading={loading} className="w-full" icon={Sparkles}>
            Analyze Symptoms
          </Button>
        </form>
      </Card>

      {loading && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              AI is analyzing your symptoms...
            </p>
            <p className="mt-2 text-sm text-gray-500">
              This may take a few moments
            </p>
          </div>
        </Card>
      )}

      {result && (
        <div className="space-y-4">
          {result.aiAnalysis.emergencyWarning?.isEmergency && (
            <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Emergency Warning
                  </h3>
                  <p className="mt-1 text-red-800 dark:text-red-200">
                    {result.aiAnalysis.emergencyWarning.message}
                  </p>
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                    Please seek immediate medical attention or call emergency services.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                <Brain className="h-5 w-5 text-primary-600" />
                Analysis Results
              </h3>
              <Badge className={getSeverityColor(result.aiAnalysis.severity)}>
                <div className="flex items-center gap-1">
                  {React.createElement(getSeverityIcon(result.aiAnalysis.severity), { className: 'h-4 w-4' })}
                  <span className="capitalize">{result.aiAnalysis.severity} Severity</span>
                </div>
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                  Possible Diseases
                </h4>
                <div className="space-y-2">
                  {result.aiAnalysis.possibleDiseases.map((disease, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <span className="text-gray-900 dark:text-white">{disease.name}</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {Math.round(disease.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                  Recommended Specialist
                </h4>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Stethoscope className="h-5 w-5 text-primary-600" />
                  <span className="text-gray-900 dark:text-white">
                    {result.aiAnalysis.recommendedSpecialist}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="mb-2 font-medium text-gray-900 dark:text-white">
                  Home Care Advice
                </h4>
                <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300">
                    {result.aiAnalysis.homeCareAdvice}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                className="w-full"
                icon={MapPin}
                onClick={handleFindDoctors}
              >
                Find Recommended Doctors Near Me
              </Button>
            </div>
          </Card>

          <Card className="bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                  Disclaimer
                </h4>
                <p className="mt-1 text-sm text-yellow-800 dark:text-yellow-200">
                  This AI-powered symptom checker is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment.
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

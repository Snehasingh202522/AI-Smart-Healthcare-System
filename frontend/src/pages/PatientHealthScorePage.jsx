import { useEffect, useState } from 'react';
import { Heart, TrendingUp, AlertCircle, Activity, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/authService';
import { aiService } from '../services/authService';
import { medicalReportService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Spinner from '../components/common/Spinner';

const PatientHealthScorePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [insufficientData, setInsufficientData] = useState(false);

  const calculateHealthScore = async () => {
    setLoading(true);
    try {
      // Fetch relevant health data
      const [appointmentsRes, symptomsRes, reportsRes] = await Promise.all([
        appointmentService.getPatientAppointments('', 1, 100),
        aiService.getSymptomHistory({ page: 1, limit: 100 }),
        medicalReportService.getPatientReports({ page: 1, limit: 100 }),
      ]);

      const appointments = appointmentsRes?.appointments || [];
      const symptomHistory = symptomsRes?.history || [];
      const reports = reportsRes?.reports || [];

      // Check if we have sufficient data
      const totalDataPoints = appointments.length + symptomHistory.length + reports.length;

      if (totalDataPoints < 3) {
        setInsufficientData(true);
        setLoading(false);
        return;
      }

      // Calculate health score based on available data
      let score = 75; // Base score
      const factors = [];
      const suggestions = [];

      // Factor 1: Appointment completion rate
      const completedAppointments = appointments.filter(a => a.status === 'completed').length;
      const totalAppointments = appointments.length;
      if (totalAppointments > 0) {
        const completionRate = (completedAppointments / totalAppointments) * 100;
        const appointmentScore = Math.min(completionRate / 10, 10); // Max 10 points
        score += appointmentScore;
        factors.push({
          name: 'Appointment Completion',
          value: `${completionRate.toFixed(0)}%`,
          impact: appointmentScore > 5 ? 'positive' : 'neutral',
        });
        if (completionRate < 70) {
          suggestions.push('Try to complete more scheduled appointments for better health tracking');
        }
      }

      // Factor 2: Symptom check frequency (regular monitoring)
      if (symptomHistory.length > 0) {
        const recentSymptoms = symptomHistory.filter(s => {
          const checkDate = new Date(s.createdAt);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return checkDate >= thirtyDaysAgo;
        }).length;

        const monitoringScore = Math.min(recentSymptoms * 2, 10); // Max 10 points
        score += monitoringScore;
        factors.push({
          name: 'Health Monitoring',
          value: `${recentSymptoms} checks in 30 days`,
          impact: monitoringScore > 5 ? 'positive' : 'neutral',
        });
        if (recentSymptoms < 2) {
          suggestions.push('Regular symptom monitoring helps track your health better');
        }
      }

      // Factor 3: Medical reports (proactive health management)
      if (reports.length > 0) {
        const recentReports = reports.filter(r => {
          const reportDate = new Date(r.createdAt);
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
          return reportDate >= ninetyDaysAgo;
        }).length;

        const reportsScore = Math.min(recentReports * 3, 10); // Max 10 points
        score += reportsScore;
        factors.push({
          name: 'Medical Documentation',
          value: `${recentReports} recent reports`,
          impact: reportsScore > 5 ? 'positive' : 'neutral',
        });
        if (recentReports < 1) {
          suggestions.push('Consider uploading recent medical reports for better health tracking');
        }
      }

      // Cap score at 100
      score = Math.min(Math.round(score), 100);

      // Determine risk level
      let riskLevel = 'Low';
      let riskColor = 'text-green-600';
      if (score < 60) {
        riskLevel = 'Moderate';
        riskColor = 'text-yellow-600';
      }
      if (score < 40) {
        riskLevel = 'Elevated';
        riskColor = 'text-orange-600';
      }

      setHealthData({
        score,
        riskLevel,
        riskColor,
        factors,
        suggestions,
        stats: {
          totalAppointments: appointments.length,
          completedAppointments,
          totalSymptomChecks: symptomHistory.length,
          totalReports: reports.length,
        },
        lastUpdated: new Date(),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to calculate health score');
      setInsufficientData(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateHealthScore();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (insufficientData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Health Score
          </h2>
          <p className="mt-1 text-gray-500">
            AI-powered health assessment
          </p>
        </div>

        <Card>
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
              Insufficient Data
            </h3>
            <p className="mt-2 text-gray-500">
              We need more health data to calculate your health score. Please:
            </p>
            <ul className="mt-4 space-y-2 text-left text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Book and complete appointments
              </li>
              <li className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Use the AI Symptom Checker regularly
              </li>
              <li className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Upload medical reports
              </li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Wellness Score
          </h2>
          <p className="mt-1 text-gray-500">
            AI-powered wellness assessment
          </p>
        </div>

        <button
          onClick={calculateHealthScore}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Refresh Score
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Wellness Score"
          value={healthData.score}
          icon={Heart}
          color="primary"
        />

        <StatCard
          title="Total Appointments"
          value={healthData.stats.totalAppointments}
          icon={Calendar}
          color="accent"
        />

        <StatCard
          title="Symptom Checks"
          value={healthData.stats.totalSymptomChecks}
          icon={Activity}
          color="warning"
        />

        <StatCard
          title="Medical Reports"
          value={healthData.stats.totalReports}
          icon={FileText}
          color="danger"
        />
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Overall Wellness Score
          </h3>

          <div className={`rounded-full px-4 py-2 ${getScoreBackground(healthData.score)}`}>
            <span className={`text-3xl font-bold ${getScoreColor(healthData.score)}`}>
              {healthData.score}
            </span>
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">/100</span>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Wellness Level: <span className={`font-semibold ${healthData.riskColor}`}>{healthData.riskLevel}</span>
          </p>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>Disclaimer:</strong> This wellness score is an indicator based on your available health data and is not a medical diagnosis. Please consult with healthcare professionals for medical advice.
          </p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            Contributing Factors
          </h3>

          <div className="space-y-3">
            {healthData.factors.map((factor, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {factor.name}
                  </p>
                  <p className="text-sm text-gray-500">{factor.value}</p>
                </div>

                <div
                  className={`h-2 w-2 rounded-full ${
                    factor.impact === 'positive'
                      ? 'bg-green-500'
                      : factor.impact === 'negative'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Activity className="h-5 w-5 text-primary-600" />
            Improvement Suggestions
          </h3>

          <div className="space-y-3">
            {healthData.suggestions.length > 0 ? (
              healthData.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 text-yellow-500 shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestion}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-gray-500">
                <Heart className="mx-auto h-8 w-8 text-green-500" />
                <p className="mt-2">Great job! Keep up the healthy habits.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Last Updated
          </h3>

          <p className="text-sm text-gray-500">
            {healthData.lastUpdated.toLocaleString()}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default PatientHealthScorePage;

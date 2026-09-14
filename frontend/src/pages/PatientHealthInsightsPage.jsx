import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  TrendingUp,
  Calendar,
  FileText,
  Activity,
  AlertTriangle,
  Clock,
  Heart,
  Pill,
  Stethoscope,
  Info,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  aiService,
  appointmentService,
  prescriptionService,
} from '../services/authService';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const PatientHealthInsightsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHealthInsights = async () => {
      try {
        setLoading(true);
        setError('');

        const results = await Promise.allSettled([
          aiService.getSymptomHistory({ limit: 10 }),
          appointmentService.getPatientAppointments('', 1, 20),
          prescriptionService.getPatientPrescriptions({ limit: 10 }),
        ]);

        const symptomResult = results[0];
        const appointmentResult = results[1];
        const prescriptionResult = results[2];

        let symptomHistory = [];

        if (symptomResult.status === 'fulfilled') {
          const data = symptomResult.value;

          if (Array.isArray(data)) {
            symptomHistory = data;
          } else if (Array.isArray(data?.history)) {
            symptomHistory = data.history;
          }
        } else {
          console.error(
            'Failed to fetch symptom history:',
            symptomResult.reason
          );
        }

        let appointments = [];

        if (appointmentResult.status === 'fulfilled') {
          const data = appointmentResult.value;

          if (Array.isArray(data)) {
            appointments = data;
          } else if (Array.isArray(data?.appointments)) {
            appointments = data.appointments;
          }
        } else {
          console.error(
            'Failed to fetch appointments:',
            appointmentResult.reason
          );
        }

        let prescriptions = [];

        if (prescriptionResult.status === 'fulfilled') {
          const data = prescriptionResult.value;

          if (Array.isArray(data)) {
            prescriptions = data;
          } else if (Array.isArray(data?.prescriptions)) {
            prescriptions = data.prescriptions;
          }
        } else {
          console.error(
            'Failed to fetch prescriptions:',
            prescriptionResult.reason
          );
        }

        const insightsData = generateHealthInsights(
          symptomHistory,
          appointments,
          prescriptions
        );

        setInsights(insightsData);

        const allFailed = results.every(
          (result) => result.status === 'rejected'
        );

        if (allFailed) {
          setError(
            'Unable to load your health data. Please try again later.'
          );
        }
      } catch (err) {
        console.error('Failed to fetch health insights:', err);
        setError(
          'Failed to load health insights. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHealthInsights();
  }, []);

  const generateHealthInsights = (
    symptomHistory,
    appointments,
    prescriptions
  ) => {
    const insights = {
      hasData: false,
      symptomPatterns: [],
      appointmentInsights: [],
      prescriptionReminders: [],
      wellnessObservations: [],
      healthTrends: [],
      recommendations: [],
    };

    const hasSymptoms =
      Array.isArray(symptomHistory) && symptomHistory.length > 0;

    const hasAppointments =
      Array.isArray(appointments) && appointments.length > 0;

    const hasPrescriptions =
      Array.isArray(prescriptions) && prescriptions.length > 0;

    if (!hasSymptoms && !hasAppointments && !hasPrescriptions) {
      return insights;
    }

    insights.hasData = true;

    // ================= SYMPTOM ANALYSIS =================

    if (hasSymptoms) {
      const symptomFrequency = {};

      const severityCounts = {
        low: 0,
        medium: 0,
        high: 0,
      };

      symptomHistory.forEach((entry) => {
        const symptoms = String(
          entry?.symptoms || ''
        ).toLowerCase();

        const severity =
          entry?.aiAnalysis?.severity || 'medium';

        if (severityCounts[severity] !== undefined) {
          severityCounts[severity]++;
        }

        const commonSymptoms = [
          'headache',
          'fever',
          'cough',
          'pain',
          'fatigue',
          'nausea',
          'dizziness',
          'sore throat',
          'throat',
          'cold',
          'vomiting',
          'breathing',
        ];

        commonSymptoms.forEach((symptom) => {
          if (symptoms.includes(symptom)) {
            symptomFrequency[symptom] =
              (symptomFrequency[symptom] || 0) + 1;
          }
        });
      });

      Object.entries(symptomFrequency).forEach(
        ([symptom, count]) => {
          if (count >= 2) {
            insights.symptomPatterns.push({
              type: 'recurring',
              symptom:
                symptom.charAt(0).toUpperCase() +
                symptom.slice(1),
              frequency: count,
              message: `You've reported ${symptom} ${count} times recently. Consider discussing recurring patterns with a doctor.`,
              severity: count >= 3 ? 'high' : 'medium',
            });
          }
        }
      );

      if (severityCounts.high > 0) {
        insights.wellnessObservations.push({
          type: 'severity',
          message: `You've had ${severityCounts.high} high-severity symptom report(s). Regular monitoring is recommended.`,
          icon: AlertTriangle,
          color: 'red',
        });
      }
    }

    // ================= APPOINTMENT ANALYSIS =================

    if (hasAppointments) {
      const completedAppointments = appointments.filter(
        (apt) => apt?.status === 'completed'
      );

      const upcomingAppointments = appointments.filter((apt) =>
        ['pending', 'confirmed', 'scheduled'].includes(
          apt?.status
        )
      );

      const missedAppointments = appointments.filter(
        (apt) =>
          apt?.status === 'no-show' ||
          apt?.status === 'cancelled'
      );

      completedAppointments.slice(0, 3).forEach((apt) => {
        if (!apt?.date) return;

        const appointmentDate = new Date(apt.date);

        if (Number.isNaN(appointmentDate.getTime())) return;

        const daysSinceCompletion = Math.floor(
          (new Date() - appointmentDate) /
            (1000 * 60 * 60 * 24)
        );

        if (
          daysSinceCompletion > 30 &&
          daysSinceCompletion < 60
        ) {
          const doctorName =
            apt?.doctor?.firstName ||
            apt?.doctorName ||
            'Doctor';

          insights.appointmentInsights.push({
            type: 'followup',
            message: `It's been ${daysSinceCompletion} days since your appointment with Dr. ${doctorName}. Consider scheduling a follow-up if symptoms persist.`,
            date: apt.date,
            doctor: apt.doctor,
          });
        }
      });

      if (missedAppointments.length > 0) {
        insights.wellnessObservations.push({
          type: 'missed',
          message: `You've missed ${missedAppointments.length} appointment(s). Try to keep scheduled appointments for better health management.`,
          icon: Clock,
          color: 'orange',
        });
      }

      upcomingAppointments.slice(0, 2).forEach((apt) => {
        if (!apt?.date) return;

        const appointmentDate = new Date(apt.date);

        if (Number.isNaN(appointmentDate.getTime())) return;

        const daysUntil = Math.floor(
          (appointmentDate - new Date()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysUntil >= 0 && daysUntil <= 7) {
          const doctorName =
            apt?.doctor?.firstName ||
            apt?.doctorName ||
            'Doctor';

          insights.appointmentInsights.push({
            type: 'upcoming',
            message:
              daysUntil === 0
                ? `You have an appointment today with Dr. ${doctorName}.`
                : `You have an appointment in ${daysUntil} day(s) with Dr. ${doctorName}.`,
            date: apt.date,
            doctor: apt.doctor,
            urgent: daysUntil <= 2,
          });
        }
      });
    }

    // ================= PRESCRIPTION ANALYSIS =================

    if (hasPrescriptions) {
      const recentPrescriptions = prescriptions.filter((pres) => {
        if (!pres?.createdAt) return false;

        const createdDate = new Date(pres.createdAt);

        if (Number.isNaN(createdDate.getTime())) return false;

        const daysSince = Math.floor(
          (new Date() - createdDate) /
            (1000 * 60 * 60 * 24)
        );

        return daysSince <= 30;
      });

      recentPrescriptions.forEach((pres) => {
        if (pres?.followUpDate) {
          const followUpDate = new Date(pres.followUpDate);

          if (!Number.isNaN(followUpDate.getTime())) {
            const daysUntilFollowup = Math.floor(
              (followUpDate - new Date()) /
                (1000 * 60 * 60 * 24)
            );

            if (
              daysUntilFollowup >= 0 &&
              daysUntilFollowup <= 7
            ) {
              insights.prescriptionReminders.push({
                type: 'followup',
                message: `Follow-up recommended by ${
                  daysUntilFollowup === 0
                    ? 'today'
                    : `in ${daysUntilFollowup} day(s)`
                } based on your recent prescription.`,
                prescription: pres,
                urgent: daysUntilFollowup <= 2,
              });
            }
          }
        }

        if (
          Array.isArray(pres?.medicines) &&
          pres.medicines.length > 0
        ) {
          insights.prescriptionReminders.push({
            type: 'medication',
            message: `You have ${pres.medicines.length} medication(s) from your recent prescription. Follow dosage instructions carefully.`,
            prescription: pres,
          });
        }
      });
    }

    // ================= HEALTH TRENDS =================

    if (hasSymptoms && symptomHistory.length >= 2) {
      const recentEntry = symptomHistory[0];
      const previousEntry = symptomHistory[1];

      const recentSeverity =
        recentEntry?.aiAnalysis?.severity || 'medium';

      const previousSeverity =
        previousEntry?.aiAnalysis?.severity || 'medium';

      const severityOrder = {
        low: 1,
        medium: 2,
        high: 3,
      };

      if (
        severityOrder[recentSeverity] <
        severityOrder[previousSeverity]
      ) {
        insights.healthTrends.push({
          type: 'improving',
          message:
            'Your symptom severity has improved compared to your last check-in.',
          icon: TrendingUp,
          color: 'green',
        });
      } else if (
        severityOrder[recentSeverity] >
        severityOrder[previousSeverity]
      ) {
        insights.healthTrends.push({
          type: 'worsening',
          message:
            'Your symptom severity has increased. Consider consulting a doctor.',
          icon: AlertTriangle,
          color: 'red',
        });
      }
    }

    // ================= RECOMMENDATIONS =================

    if (insights.symptomPatterns.length > 0) {
      insights.recommendations.push({
        type: 'consultation',
        message:
          'Based on recurring symptoms, consider scheduling a consultation with a specialist.',
        icon: Stethoscope,
        action: () =>
          navigate('/patient/find-doctors'),
      });
    }

    if (hasAppointments) {
      const upcomingAppointments = appointments.filter((apt) =>
        ['pending', 'confirmed', 'scheduled'].includes(
          apt?.status
        )
      );

      if (upcomingAppointments.length === 0) {
        insights.recommendations.push({
          type: 'checkup',
          message:
            'No upcoming appointments scheduled. Consider a routine check-up.',
          icon: Calendar,
          action: () =>
            navigate('/patient/find-doctors'),
        });
      }
    }

    if (hasSymptoms) {
      insights.recommendations.push({
        type: 'monitoring',
        message:
          'Continue monitoring your symptoms and use the AI Symptom Checker for regular health assessments.',
        icon: Activity,
        action: () =>
          navigate('/patient/symptom-checker'),
      });
    }

    return insights;
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#07152f]">
        <Spinner size="lg" />
      </div>
    );
  }

  // ================= ERROR =================

  if (error && !insights?.hasData) {
    return (
      <div className="min-h-[60vh] bg-[#07152f] p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-500/30 bg-[#0c1d3b] p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-red-500/10 p-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">
                Unable to Load Insights
              </h4>

              <p className="mt-1 text-sm text-slate-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= NO DATA =================

  if (!insights?.hasData) {
    return (
      <div className="min-h-screen space-y-6 bg-[#07152f] p-4 text-white md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <Brain className="h-7 w-7 text-cyan-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                AI Health Insights
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Personalized health insights based on your medical
                history and activity
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-[#0c1d3b] p-8 shadow-xl">
            <EmptyState
              icon={Activity}
              title="Not Enough Health Data"
              description="We need more health data to generate meaningful insights. Use the AI Symptom Checker, book appointments, and upload medical reports to build your health profile."
            >
              <Button
                onClick={() =>
                  navigate('/patient/symptom-checker')
                }
                icon={Sparkles}
              >
                Start with AI Symptom Checker
              </Button>
            </EmptyState>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07152f] px-4 py-5 text-white md:px-6 md:py-6">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ================= HEADER ================= */}

        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-[#0b2145] via-[#0d2850] to-[#0b1b38] p-5 shadow-xl md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/20">
                <Brain className="h-7 w-7 text-white" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Patient Dashboard
                </p>

                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  AI Health Insights
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Personalized insights based on your medical history
                  and activity
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2 md:flex">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-blue-100">
                AI-powered health overview
              </span>
            </div>
          </div>
        </div>

        {/* ================= DISCLAIMER ================= */}

        <div className="rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-500/10 to-cyan-500/5 p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-blue-500/10 p-2.5">
              <Info className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <h4 className="font-semibold text-white">
                Health Information Disclaimer
              </h4>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                These AI-generated insights are for informational
                purposes only and should not replace professional
                medical advice, diagnosis, or treatment. Always
                consult with qualified healthcare professionals for
                medical concerns.
              </p>
            </div>
          </div>
        </div>

        {/* ================= HEALTH TRENDS ================= */}

        {insights.healthTrends.length > 0 && (
          <section>
            <SectionTitle
              icon={TrendingUp}
              title="Health Trends"
            />

            <div className="mt-3 grid gap-4">
              {insights.healthTrends.map((trend, index) => {
                const TrendIcon = trend.icon;

                const isPositive = trend.color === 'green';
                const isNegative = trend.color === 'red';

                return (
                  <div
                    key={index}
                    className={`rounded-2xl border p-5 shadow-lg ${
                      isPositive
                        ? 'border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-[#0c1d3b]'
                        : isNegative
                        ? 'border-red-500/20 bg-gradient-to-r from-red-500/10 to-[#0c1d3b]'
                        : 'border-blue-500/20 bg-[#0c1d3b]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-xl p-3 ${
                          isPositive
                            ? 'bg-emerald-500/10'
                            : isNegative
                            ? 'bg-red-500/10'
                            : 'bg-blue-500/10'
                        }`}
                      >
                        <TrendIcon
                          className={`h-5 w-5 ${
                            isPositive
                              ? 'text-emerald-400'
                              : isNegative
                              ? 'text-red-400'
                              : 'text-blue-400'
                          }`}
                        />
                      </div>

                      <p className="pt-1 text-sm leading-6 text-slate-300">
                        {trend.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= SYMPTOM PATTERNS ================= */}

        {insights.symptomPatterns.length > 0 && (
          <section>
            <SectionTitle
              icon={Activity}
              title="Symptom Patterns"
            />

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {insights.symptomPatterns.map(
                (pattern, index) => {
                  const isHigh = pattern.severity === 'high';

                  return (
                    <div
                      key={index}
                      className={`relative overflow-hidden rounded-2xl border bg-[#0c1d3b] p-5 shadow-lg ${
                        isHigh
                          ? 'border-red-500/25'
                          : 'border-orange-500/20'
                      }`}
                    >
                      <div
                        className={`absolute left-0 top-0 h-full w-1 ${
                          isHigh
                            ? 'bg-red-500'
                            : 'bg-orange-400'
                        }`}
                      />

                      <div className="flex items-start gap-4 pl-2">
                        <div
                          className={`rounded-xl p-3 ${
                            isHigh
                              ? 'bg-red-500/10'
                              : 'bg-orange-500/10'
                          }`}
                        >
                          {isHigh ? (
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          ) : (
                            <Activity className="h-5 w-5 text-orange-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="font-semibold text-white">
                              {pattern.symptom}
                            </h4>

                            <Badge
                              className={
                                isHigh
                                  ? 'border border-red-400/20 bg-red-500/10 text-red-300'
                                  : 'border border-orange-400/20 bg-orange-500/10 text-orange-300'
                              }
                            >
                              {pattern.frequency} occurrences
                            </Badge>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {pattern.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

        {/* ================= APPOINTMENT INSIGHTS ================= */}

        {insights.appointmentInsights.length > 0 && (
          <section>
            <SectionTitle
              icon={Calendar}
              title="Appointment Insights"
            />

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {insights.appointmentInsights.map(
                (insight, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border p-5 shadow-lg ${
                      insight.urgent
                        ? 'border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-[#0c1d3b]'
                        : 'border-blue-500/20 bg-[#0c1d3b]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-xl p-3 ${
                          insight.urgent
                            ? 'bg-orange-500/10'
                            : 'bg-blue-500/10'
                        }`}
                      >
                        {insight.urgent ? (
                          <Clock className="h-5 w-5 text-orange-400" />
                        ) : (
                          <Calendar className="h-5 w-5 text-blue-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm leading-6 text-slate-300">
                          {insight.message}
                        </p>

                        {insight.urgent && (
                          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
                            <Clock className="h-3.5 w-3.5" />
                            Upcoming
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* ================= PRESCRIPTIONS ================= */}

        {insights.prescriptionReminders.length > 0 && (
          <section>
            <SectionTitle
              icon={Pill}
              title="Prescription Reminders"
            />

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {insights.prescriptionReminders.map(
                (reminder, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border p-5 shadow-lg ${
                      reminder.urgent
                        ? 'border-red-500/30 bg-gradient-to-r from-red-500/10 to-[#0c1d3b]'
                        : 'border-blue-500/20 bg-[#0c1d3b]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`rounded-xl p-3 ${
                          reminder.urgent
                            ? 'bg-red-500/10'
                            : 'bg-blue-500/10'
                        }`}
                      >
                        {reminder.urgent ? (
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        ) : (
                          <Pill className="h-5 w-5 text-blue-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="text-sm leading-6 text-slate-300">
                          {reminder.message}
                        </p>

                        {reminder.urgent && (
                          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Action Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* ================= WELLNESS ================= */}

        {insights.wellnessObservations.length > 0 && (
          <section>
            <SectionTitle
              icon={Heart}
              title="Wellness Observations"
            />

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {insights.wellnessObservations.map(
                (observation, index) => {
                  const ObservationIcon =
                    observation.icon;

                  const isRed = observation.color === 'red';
                  const isOrange =
                    observation.color === 'orange';

                  return (
                    <div
                      key={index}
                      className={`relative overflow-hidden rounded-2xl border bg-[#0c1d3b] p-5 shadow-lg ${
                        isRed
                          ? 'border-red-500/25'
                          : isOrange
                          ? 'border-orange-500/25'
                          : 'border-blue-500/20'
                      }`}
                    >
                      <div
                        className={`absolute left-0 top-0 h-full w-1 ${
                          isRed
                            ? 'bg-red-500'
                            : isOrange
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }`}
                      />

                      <div className="flex items-start gap-4 pl-2">
                        <div
                          className={`rounded-xl p-3 ${
                            isRed
                              ? 'bg-red-500/10'
                              : isOrange
                              ? 'bg-orange-500/10'
                              : 'bg-blue-500/10'
                          }`}
                        >
                          <ObservationIcon
                            className={`h-5 w-5 ${
                              isRed
                                ? 'text-red-400'
                                : isOrange
                                ? 'text-orange-400'
                                : 'text-blue-400'
                            }`}
                          />
                        </div>

                        <p className="pt-1 text-sm leading-6 text-slate-300">
                          {observation.message}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

        {/* ================= RECOMMENDATIONS ================= */}

        {insights.recommendations.length > 0 && (
          <section>
            <SectionTitle
              icon={Sparkles}
              title="Personalized Recommendations"
            />

            <div className="mt-3 grid gap-4">
              {insights.recommendations.map(
                (recommendation, index) => {
                  const RecommendationIcon =
                    recommendation.icon;

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-purple-500/10 p-5 shadow-lg"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="rounded-xl bg-blue-500/10 p-3">
                            <RecommendationIcon className="h-5 w-5 text-cyan-400" />
                          </div>

                          <p className="pt-1 text-sm leading-6 text-slate-300">
                            {recommendation.message}
                          </p>
                        </div>

                        {recommendation.action && (
                          <button
                            type="button"
                            onClick={recommendation.action}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-200 transition hover:bg-blue-500/20 hover:text-white"
                          >
                            Take Action
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}

        {/* ================= QUICK ACTIONS ================= */}

        <section className="pb-4">
          <div className="rounded-2xl border border-blue-500/20 bg-[#0c1d3b] p-5 shadow-xl md:p-6">
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-500/10 p-2.5">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-white">
                    Quick Health Actions
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Access your most important health tools
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <QuickAction
                icon={Brain}
                title="Symptom Checker"
                description="Check your symptoms"
                onClick={() =>
                  navigate('/patient/symptom-checker')
                }
              />

              <QuickAction
                icon={Stethoscope}
                title="Find Doctors"
                description="Find the right doctor"
                onClick={() =>
                  navigate('/patient/find-doctors')
                }
              />

              <QuickAction
                icon={Calendar}
                title="Appointments"
                description="Manage appointments"
                onClick={() =>
                  navigate('/patient/appointments')
                }
              />

              <QuickAction
                icon={FileText}
                title="Medical Reports"
                description="View your reports"
                onClick={() =>
                  navigate('/patient/medical-reports')
                }
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// ================= SECTION TITLE =================

const SectionTitle = ({ icon: Icon, title }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-blue-500/10 p-2">
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>

      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>
    </div>
  );
};

// ================= QUICK ACTION =================

const QuickAction = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-blue-500/15 bg-[#10264a] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-400/30 hover:bg-[#14305a] hover:shadow-lg"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 transition group-hover:bg-blue-500/20">
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-white">
          {title}
        </p>

        <p className="mt-0.5 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-400" />
    </button>
  );
};

export default PatientHealthInsightsPage;
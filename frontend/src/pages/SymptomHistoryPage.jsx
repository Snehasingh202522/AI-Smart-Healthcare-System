import { useEffect, useState } from 'react';
import { Brain, Calendar, AlertTriangle, Filter, Eye, Trash2 } from 'lucide-react';
import { aiService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { formatDateTime } from '../utils/helpers';

const SymptomHistoryPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await aiService.getSymptomHistory();
      setHistory(response?.history || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch symptom history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewDetails = (analysis) => {
    setSelectedAnalysis(analysis);
    setShowDetailModal(true);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'analyzed':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'emergency') return item.aiAnalysis?.emergencyWarning?.isEmergency;
    if (filter === 'high-severity') return item.aiAnalysis?.severity === 'high';
    if (filter === 'failed') return item.status === 'failed';
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Brain className="h-8 w-8 text-primary-600" />
            Symptom Analysis History
          </h2>
          <p className="mt-1 text-gray-500">
            View your past AI-powered symptom analyses
          </p>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="all">All Analyses</option>
              <option value="emergency">Emergency Cases</option>
              <option value="high-severity">High Severity</option>
              <option value="failed">Failed Analyses</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">
            {filteredHistory.length} analys{filteredHistory.length !== 1 ? 'es' : 'is'}
          </p>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center">
            <Brain className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No symptom analyses found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(filteredHistory || []).map((analysis) => (
              <div
                key={analysis._id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {analysis.symptoms.substring(0, 60)}...
                        </h4>
                        <Badge className={getStatusColor(analysis.status)}>
                          {analysis.status}
                        </Badge>
                        {analysis.aiAnalysis?.emergencyWarning?.isEmergency && (
                          <Badge className="bg-red-100 text-red-800">
                            <AlertTriangle className="h-3 w-3" />
                            Emergency
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDateTime(analysis.createdAt)}
                        </div>
                        <div>Age: {analysis.age}</div>
                        <div>Gender: {analysis.gender}</div>
                        {analysis.aiAnalysis?.severity && (
                          <div className="flex items-center gap-1">
                            Severity:{' '}
                            <Badge className={getSeverityColor(analysis.aiAnalysis.severity)}>
                              {analysis.aiAnalysis.severity}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 sm:items-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(analysis)}
                    icon={Eye}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showDetailModal && selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Analysis Details
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {selectedAnalysis.aiAnalysis?.emergencyWarning?.isEmergency && (
                <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 dark:bg-red-900/20">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-semibold text-red-900 dark:text-red-100">
                        Emergency Warning
                      </h4>
                      <p className="mt-1 text-sm text-red-800 dark:text-red-200">
                        {selectedAnalysis.aiAnalysis.emergencyWarning.message}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Symptoms
                </h4>
                <p className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
                  {selectedAnalysis.symptoms}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Age
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedAnalysis.age}
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Gender
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {selectedAnalysis.gender}
                  </p>
                </div>
              </div>

              {selectedAnalysis.existingDiseases?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Existing Diseases
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedAnalysis.existingDiseases || []).map((disease, index) => (
                      <Badge key={index} className="bg-gray-100 text-gray-800">
                        {disease}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedAnalysis.currentMedications?.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Current Medications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedAnalysis.currentMedications || []).map((medication, index) => (
                      <Badge key={index} className="bg-gray-100 text-gray-800">
                        {medication}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedAnalysis.aiAnalysis && (
                <>
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Possible Diseases
                    </h4>
                    <div className="space-y-2">
                      {(selectedAnalysis.aiAnalysis?.possibleDiseases || []).map((disease, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border border-gray-200 p-2 dark:border-gray-700"
                        >
                          <span className="text-sm text-gray-900 dark:text-white">
                            {disease.name}
                          </span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {Math.round(disease.confidence * 100)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Severity
                    </h4>
                    <Badge className={getSeverityColor(selectedAnalysis.aiAnalysis.severity)}>
                      {selectedAnalysis.aiAnalysis.severity?.toUpperCase()}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Recommended Specialist
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {selectedAnalysis.aiAnalysis.recommendedSpecialist}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Home Care Advice
                    </h4>
                    <p className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
                      {selectedAnalysis.aiAnalysis.homeCareAdvice}
                    </p>
                  </div>
                </>
              )}

              {selectedAnalysis.status === 'failed' && selectedAnalysis.errorMessage && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                  <h4 className="mb-1 text-sm font-medium text-red-900 dark:text-red-100">
                    Analysis Failed
                  </h4>
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {selectedAnalysis.errorMessage}
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                  Analyzed On
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(selectedAnalysis.createdAt)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SymptomHistoryPage;

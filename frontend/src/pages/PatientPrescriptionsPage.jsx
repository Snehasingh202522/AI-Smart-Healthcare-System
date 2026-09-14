import { useEffect, useState } from 'react';
import { FileText, Calendar, User, Pill, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { prescriptionService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import { formatDateTime } from '../utils/helpers';

const PatientPrescriptionsPage = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await prescriptionService.getPatientPrescriptions();
      const prescriptionsData =
        response?.prescriptions || [];
      setPrescriptions(prescriptionsData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Prescriptions
        </h2>
        <p className="mt-1 text-gray-500">
          View your medical prescriptions
        </p>
      </div>

      <Card>
        {prescriptions.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No prescriptions found</p>
            <p className="mt-1 text-sm text-gray-400">
              Prescriptions from your doctor will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div
                key={prescription._id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    firstName={prescription.doctor?.firstName}
                    lastName={prescription.doctor?.lastName}
                    size="lg"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                        </h4>

                        <p className="text-sm text-gray-500">
                          {prescription.doctor?.specialization || 'General Physician'}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {formatDateTime(prescription.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Diagnosis: {prescription.diagnosis}
                      </p>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Medicines:
                      </p>

                      <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        {prescription.medicines?.map((med, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Pill className="mt-0.5 h-4 w-4 text-primary-600 shrink-0" />
                            <div>
                              <span className="font-medium">{med.name}</span>
                              <span className="text-gray-500"> - {med.dosage}</span>
                              <div className="text-xs text-gray-500">
                                {med.frequency} for {med.duration}
                                {med.instructions && ` • ${med.instructions}`}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {prescription.notes && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Notes:</span> {prescription.notes}
                        </p>
                      </div>
                    )}

                    {prescription.followUpDate && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Follow-up: {formatDateTime(prescription.followUpDate)}
                        </span>
                      </div>
                    )}

                    {prescription.appointment && typeof prescription.appointment === 'object' && (
                      <div className="mt-2 text-xs text-gray-500">
                        Related to appointment on {formatDateTime(prescription.appointment.date)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
          <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Important Medical Disclaimer
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              This information is for reference only. Always follow your doctor's instructions
              and consult with healthcare professionals before making any changes to your medication.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PatientPrescriptionsPage;

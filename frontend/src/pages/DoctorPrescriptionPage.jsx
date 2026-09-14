import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, FileText, Trash2, Calendar, User, Pill } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { prescriptionService, appointmentService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import { formatDateTime } from '../utils/helpers';

const DoctorPrescriptionPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [appointments, setAppointments] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      patient: '',
      appointment: '',
      diagnosis: '',
      notes: '',
      followUpDate: '',
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    },
  });

  const medicines = watch('medicines');

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await prescriptionService.getDoctorPrescriptions();
      const prescriptionsData =
        response?.prescriptions ||
        [];
      setPrescriptions(prescriptionsData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      // Fetch all appointments to get list of patients
      const response = await appointmentService.getDoctorAppointments('', 1, 100);
      const appointmentsData =
        response?.appointments ||
        [];
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchAppointments();
  }, []);

  const addMedicine = () => {
    const currentMedicines = medicines || [];
    reset({
      ...watch(),
      medicines: [
        ...currentMedicines,
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' },
      ],
    });
  };

  const removeMedicine = (index) => {
    const currentMedicines = medicines || [];
    const newMedicines = currentMedicines.filter((_, i) => i !== index);
    reset({
      ...watch(),
      medicines: newMedicines,
    });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Ensure we have the required fields
      if (!data.patient) {
        toast.error('Patient is required');
        setSubmitting(false);
        return;
      }

      if (!data.diagnosis) {
        toast.error('Diagnosis is required');
        setSubmitting(false);
        return;
      }

      if (!data.medicines || data.medicines.length === 0 || !data.medicines[0].name) {
        toast.error('At least one medicine is required');
        setSubmitting(false);
        return;
      }

      await prescriptionService.createPrescription(data);
      toast.success('Prescription created successfully');
      reset();
      setShowForm(false);
      fetchPrescriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create prescription');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;

    try {
      await prescriptionService.deletePrescription(id);
      toast.success('Prescription deleted successfully');
      fetchPrescriptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete prescription');
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Prescriptions
          </h2>
          <p className="mt-1 text-gray-500">
            Manage patient prescriptions
          </p>
        </div>

        <Button onClick={() => setShowForm(true)} icon={Plus}>
          New Prescription
        </Button>
      </div>

      {showForm && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Prescription
            </h3>

            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Patient
                </label>

                <select
                  {...register('patient', { required: 'Patient is required' })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Select Patient</option>

                  {appointments.map((apt) => (
                    <option key={apt.patient._id} value={apt.patient._id}>
                      {apt.patient.firstName} {apt.patient.lastName} ({apt.patient.email})
                    </option>
                  ))}
                </select>

                {errors.patient && (
                  <p className="mt-1 text-sm text-red-500">{errors.patient.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Related Appointment (Optional)
                </label>

                <select
                  {...register('appointment')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="">Select Appointment</option>

                  {appointments.map((apt) => (
                    <option key={apt._id} value={apt._id}>
                      {formatDateTime(apt.date)} - {apt.reason}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Diagnosis"
              placeholder="Enter diagnosis"
              {...register('diagnosis', { required: 'Diagnosis is required' })}
              error={errors.diagnosis?.message}
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Medicines
              </label>

              <div className="space-y-3">
                {medicines?.map((medicine, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Medicine Name"
                        placeholder="e.g., Paracetamol"
                        {...register(`medicines.${index}.name`, {
                          required: 'Medicine name is required',
                        })}
                        error={errors.medicines?.[index]?.name?.message}
                      />

                      <Input
                        label="Dosage"
                        placeholder="e.g., 500mg"
                        {...register(`medicines.${index}.dosage`, {
                          required: 'Dosage is required',
                        })}
                        error={errors.medicines?.[index]?.dosage?.message}
                      />

                      <Input
                        label="Frequency"
                        placeholder="e.g., Twice daily"
                        {...register(`medicines.${index}.frequency`, {
                          required: 'Frequency is required',
                        })}
                        error={errors.medicines?.[index]?.frequency?.message}
                      />

                      <Input
                        label="Duration"
                        placeholder="e.g., 7 days"
                        {...register(`medicines.${index}.duration`, {
                          required: 'Duration is required',
                        })}
                        error={errors.medicines?.[index]?.duration?.message}
                      />
                    </div>

                    <Input
                      label="Instructions (Optional)"
                      placeholder="e.g., Take after meals"
                      {...register(`medicines.${index}.instructions`)}
                      className="mt-3"
                    />

                    {medicines.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMedicine(index)}
                        className="mt-3"
                        icon={Trash2}
                      >
                        Remove Medicine
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addMedicine}
                className="mt-3"
                icon={Plus}
              >
                Add Medicine
              </Button>
            </div>

            <Input
              label="Notes (Optional)"
              placeholder="Additional notes for the patient"
              {...register('notes')}
            />

            <Input
              label="Follow-up Date (Optional)"
              type="date"
              {...register('followUpDate')}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={submitting}>
                Create Prescription
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {prescriptions.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No prescriptions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <div
                key={prescription._id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar
                      firstName={prescription.patient?.firstName}
                      lastName={prescription.patient?.lastName}
                      size="lg"
                    />

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {prescription.patient?.firstName} {prescription.patient?.lastName}
                      </h4>

                      <p className="text-sm text-gray-500">
                        {prescription.patient?.email}
                      </p>

                      <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Diagnosis: {prescription.diagnosis}
                      </p>

                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Medicines:
                        </p>

                        <ul className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {prescription.medicines?.map((med, idx) => (
                            <li key={idx}>
                              <Pill className="inline h-4 w-4 mr-1" />
                              {med.name} - {med.dosage}, {med.frequency} for {med.duration}
                              {med.instructions && ` (${med.instructions})`}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {prescription.notes && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Notes: {prescription.notes}
                        </p>
                      )}

                      {prescription.followUpDate && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="inline h-4 w-4 mr-1" />
                          Follow-up: {formatDateTime(prescription.followUpDate)}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-gray-500">
                        Created: {formatDateTime(prescription.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(prescription._id)}
                    icon={Trash2}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default DoctorPrescriptionPage;

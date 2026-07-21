import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, User, Stethoscope, Plus, X, Filter, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { appointmentService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { formatDateTime } from '../utils/helpers';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [bookingLoading, setBookingLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      doctor: '',
      date: '',
      time: '',
      reason: '',
      notes: '',
      priority: 'medium',
    },
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentService.getPatientAppointments({ status: filter !== 'all' ? filter : undefined });
      setAppointments(response.data.appointments);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const onSubmit = async (data) => {
    setBookingLoading(true);
    try {
      await appointmentService.createAppointment(data);
      toast.success('Appointment booked successfully');
      reset();
      setShowBookingForm(false);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await appointmentService.cancelAppointment(id);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true;
    return apt.status === filter;
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h2>
          <p className="mt-1 text-gray-500">Manage your medical appointments</p>
        </div>
        <Button onClick={() => setShowBookingForm(true)} icon={Plus}>
          Book Appointment
        </Button>
      </div>

      {showBookingForm && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Book New Appointment</h3>
            <button
              onClick={() => setShowBookingForm(false)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Doctor ID"
                {...register('doctor', { required: 'Doctor ID is required' })}
                error={errors.doctor?.message}
                icon={Stethoscope}
                placeholder="Enter doctor ID"
              />
              <Input
                label="Date"
                type="date"
                {...register('date', { required: 'Date is required' })}
                error={errors.date?.message}
                icon={Calendar}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Time"
                type="time"
                {...register('time', { required: 'Time is required' })}
                error={errors.time?.message}
                icon={Clock}
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority
                </label>
                <select
                  {...register('priority')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <Input
              label="Reason for Visit"
              {...register('reason', {
                required: 'Reason is required',
                minLength: { value: 5, message: 'Reason must be at least 5 characters' },
              })}
              error={errors.reason?.message}
              placeholder="Describe the reason for your visit"
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Any additional information..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={bookingLoading}>
                Book Appointment
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowBookingForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="all">All Appointments</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">
            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No appointments found</p>
            {!showBookingForm && (
              <Button
                onClick={() => setShowBookingForm(true)}
                variant="outline"
                className="mt-4"
                icon={Plus}
              >
                Book Your First Appointment
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    firstName={appointment.doctor?.firstName}
                    lastName={appointment.doctor?.lastName}
                    size="lg"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                    </h4>
                    <p className="text-sm text-gray-500">{appointment.reason}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(appointment.date)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        {appointment.time}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                    <Badge className={getPriorityColor(appointment.priority)}>
                      {appointment.priority.charAt(0).toUpperCase() + appointment.priority.slice(1)}
                    </Badge>
                  </div>
                  {appointment.status === 'scheduled' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancel(appointment._id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AppointmentsPage;

import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Check, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import { formatDateTime } from '../utils/helpers';

const DoctorSchedulePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? '' : filter;
      const response = await appointmentService.getDoctorAppointments(status);
      const appointmentsData =
        response?.appointments || [];
      setAppointments(appointmentsData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await appointmentService.updateAppointmentStatus(id, newStatus);
      toast.success(`Appointment ${newStatus} successfully`);
      fetchAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'no-show':
        return 'bg-gray-100 text-gray-800';
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

  const isUpdating = (id) => updatingId === id;

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
            Doctor Schedule
          </h2>
          <p className="mt-1 text-gray-500">
            Manage your appointments and patient schedule
          </p>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="all">All Appointments</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
              <option value="no-show">No Show</option>
            </select>
          </div>

          <p className="text-sm text-gray-500">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment._id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    firstName={appointment.patient?.firstName}
                    lastName={appointment.patient?.lastName}
                    size="lg"
                  />

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </h4>

                    <p className="text-sm text-gray-500">
                      {appointment.patient?.email} • {appointment.patient?.phone || 'No phone'}
                    </p>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {appointment.reason}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDateTime(appointment.date)}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {appointment.time}
                      </div>
                    </div>

                    {appointment.patient?.dateOfBirth && (
                      <p className="mt-1 text-xs text-gray-500">
                        DOB: {new Date(appointment.patient.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}

                    {appointment.patient?.bloodGroup && (
                      <p className="mt-1 text-xs text-gray-500">
                        Blood Group: {appointment.patient.bloodGroup}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.charAt(0).toUpperCase() +
                        appointment.status.slice(1)}
                    </Badge>

                    <Badge className={getPriorityColor(appointment.priority)}>
                      {appointment.priority.charAt(0).toUpperCase() +
                        appointment.priority.slice(1)}
                    </Badge>
                  </div>

                  {appointment.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(appointment._id, 'confirmed')}
                        loading={isUpdating(appointment._id)}
                        icon={Check}
                      >
                        Accept
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(appointment._id, 'rejected')}
                        loading={isUpdating(appointment._id)}
                        icon={X}
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {appointment.status === 'confirmed' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(appointment._id, 'scheduled')}
                        loading={isUpdating(appointment._id)}
                        icon={Check}
                      >
                        Schedule
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(appointment._id, 'rejected')}
                        loading={isUpdating(appointment._id)}
                        icon={X}
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {appointment.status === 'scheduled' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(appointment._id, 'completed')}
                        loading={isUpdating(appointment._id)}
                        icon={Check}
                      >
                        Complete
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(appointment._id, 'cancelled')}
                        loading={isUpdating(appointment._id)}
                        icon={X}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {['completed', 'rejected', 'cancelled', 'no-show'].includes(appointment.status) && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <AlertCircle className="h-4 w-4" />
                      <span>No actions available</span>
                    </div>
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

export default DoctorSchedulePage;

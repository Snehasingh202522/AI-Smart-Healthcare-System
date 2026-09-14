import { useEffect, useState } from 'react';
import { BarChart3, Calendar, Users, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import appointmentService from '../services/appointmentService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Spinner from '../components/common/Spinner';

const DoctorAnalyticsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all appointments for this doctor
      const response = await appointmentService.getDoctorAppointments('', 1, 1000);
      const appointments = response?.appointments || [];

      // Calculate analytics
      const totalAppointments = appointments.length;
      const pendingAppointments = appointments.filter(a => a.status === 'pending').length;
      const confirmedAppointments = appointments.filter(a => a.status === 'confirmed').length;
      const scheduledAppointments = appointments.filter(a => a.status === 'scheduled').length;
      const completedAppointments = appointments.filter(a => a.status === 'completed').length;
      const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
      const rejectedAppointments = appointments.filter(a => a.status === 'rejected').length;

      // Calculate unique patients
      const uniquePatients = new Set(appointments.map(a => a.patient?._id)).size;

      // Calculate completion rate
      const completionRate = totalAppointments > 0
        ? ((completedAppointments / totalAppointments) * 100).toFixed(1)
        : 0;

      // Calculate appointment trends by month (last 6 months)
      const monthlyTrends = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        const monthAppointments = appointments.filter(a => {
          const aptDate = new Date(a.date);
          return aptDate >= monthStart && aptDate <= monthEnd;
        });

        monthlyTrends.push({
          month: monthName,
          total: monthAppointments.length,
          completed: monthAppointments.filter(a => a.status === 'completed').length,
        });
      }

      setAnalytics({
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        scheduledAppointments,
        completedAppointments,
        cancelledAppointments,
        rejectedAppointments,
        uniquePatients,
        completionRate,
        monthlyTrends,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch analytics');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h2>
          <p className="mt-1 text-gray-500">
            Your practice analytics and insights
          </p>
        </div>

        <Card>
          <div className="py-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No analytics data available</p>
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
            Analytics
          </h2>
          <p className="mt-1 text-gray-500">
            Your practice analytics and insights
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Appointments"
          value={analytics.totalAppointments}
          icon={Calendar}
          color="primary"
        />

        <StatCard
          title="Total Patients"
          value={analytics.uniquePatients}
          icon={Users}
          color="accent"
        />

        <StatCard
          title="Completion Rate"
          value={`${analytics.completionRate}%`}
          icon={TrendingUp}
          color="success"
        />

        <StatCard
          title="Pending"
          value={analytics.pendingAppointments}
          icon={Clock}
          color="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-primary-600" />
            Appointment Status Breakdown
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Completed</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics.completedAppointments}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Confirmed</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics.confirmedAppointments}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Scheduled</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics.scheduledAppointments}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics.pendingAppointments}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Cancelled</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics.cancelledAppointments}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Rejected</span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {analytics.rejectedAppointments}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            Monthly Trends (Last 6 Months)
          </h3>

          <div className="space-y-3">
            {analytics.monthlyTrends.map((trend, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{trend.month}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {trend.total} appointments
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2 rounded-full bg-primary-600"
                    style={{
                      width: `${analytics.totalAppointments > 0 ? (trend.total / Math.max(...analytics.monthlyTrends.map(t => t.total))) * 100 : 0}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{trend.completed} completed</span>
                  <span>{trend.total - trend.completed} other</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <BarChart3 className="h-5 w-5 text-primary-600" />
          Key Metrics
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-sm text-gray-500">Avg. per Month</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {(analytics.totalAppointments / 6).toFixed(1)}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-sm text-gray-500">Acceptance Rate</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.totalAppointments > 0
                ? ((analytics.completedAppointments + analytics.scheduledAppointments + analytics.confirmedAppointments) / analytics.totalAppointments * 100).toFixed(1)
                : 0}%
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-sm text-gray-500">Cancellation Rate</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.totalAppointments > 0
                ? (analytics.cancelledAppointments / analytics.totalAppointments * 100).toFixed(1)
                : 0}%
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-sm text-gray-500">Patient Loyalty</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.totalAppointments > 0
                ? (analytics.uniquePatients / analytics.totalAppointments * 100).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DoctorAnalyticsPage;

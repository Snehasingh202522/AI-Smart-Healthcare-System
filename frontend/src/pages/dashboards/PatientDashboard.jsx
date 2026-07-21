import { useEffect, useState } from 'react';
import {
  Calendar,
  Heart,
  FileText,
  Bell,
  Activity,
  User,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/authService';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import PlaceholderCard from '../../components/common/PlaceholderCard';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { getRoleColor, getRoleLabel, formatDateTime } from '../../utils/helpers';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardService.getPatientDashboard();
        setData(response.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
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
      <Card className="gradient-hero !border-0 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Welcome back, {user?.firstName}!
            </h2>
            <p className="mt-1 text-white/80">
              Here's an overview of your health dashboard
            </p>
          </div>
          <Avatar firstName={user?.firstName} lastName={user?.lastName} size="xl" />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Upcoming Appointments" value={data?.stats?.upcomingAppointments ?? 0} icon={Calendar} color="primary" />
        <StatCard title="Health Score" value={data?.stats?.healthScore ?? '—'} icon={Heart} color="accent" />
        <StatCard title="Medical Reports" value={data?.stats?.medicalReports ?? 0} icon={FileText} color="warning" />
        <StatCard title="Notifications" value={data?.stats?.notifications ?? 0} icon={Bell} color="danger" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Calendar className="h-5 w-5 text-primary-600" />
              Upcoming Appointments
            </h3>
            {data?.upcomingAppointments?.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingAppointments.map((apt) => (
                  <div key={apt._id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Dr. {apt.doctor?.firstName} {apt.doctor?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{formatDateTime(apt.date)} at {apt.time}</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">
                No upcoming appointments scheduled
              </div>
            )}
          </Card>

          <PlaceholderCard
            title="Health Score"
            description="AI-powered health assessment"
            icon={Heart}
            badge="Coming in Phase 3"
          />
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <User className="h-5 w-5 text-primary-600" />
              Profile
            </h3>
            <div className="flex items-center gap-3">
              <Avatar firstName={user?.firstName} lastName={user?.lastName} size="lg" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <Badge className={`mt-1 ${getRoleColor(user?.role)}`}>
                  {getRoleLabel(user?.role)}
                </Badge>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Bell className="h-5 w-5 text-primary-600" />
              Notifications
            </h3>
            <div className="space-y-3">
              {(data?.notifications || []).slice(0, 3).map((notif) => (
                <div key={notif.id} className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notif.read ? 'bg-gray-300' : 'bg-primary-500'}`} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Activity className="h-5 w-5 text-primary-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {(data?.recentActivity || []).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">{activity.action}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;

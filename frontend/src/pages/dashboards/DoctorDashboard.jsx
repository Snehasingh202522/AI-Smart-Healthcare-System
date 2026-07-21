import { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  FileText,
  Bell,
  Clock,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/authService';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import PlaceholderCard from '../../components/common/PlaceholderCard';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { getRoleColor, getRoleLabel } from '../../utils/helpers';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardService.getDoctorDashboard();
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
              Good day, Dr. {user?.lastName}!
            </h2>
            <p className="mt-1 text-white/80">
              Here's your practice overview for today
            </p>
          </div>
          <Avatar firstName={user?.firstName} lastName={user?.lastName} size="xl" />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's Appointments" value={data?.stats?.todayAppointments ?? 0} icon={Calendar} color="primary" />
        <StatCard title="Total Patients" value={data?.stats?.totalPatients ?? 0} icon={Users} color="accent" />
        <StatCard title="Pending Reviews" value={data?.stats?.pendingReviews ?? 0} icon={FileText} color="warning" />
        <StatCard title="Notifications" value={data?.stats?.notifications ?? 0} icon={Bell} color="danger" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PlaceholderCard
            title="Today's Schedule"
            description="Your appointment schedule will appear here"
            icon={Calendar}
            badge="Coming in Phase 2"
          />

          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Users className="h-5 w-5 text-primary-600" />
              Recent Patients
            </h3>
            <div className="py-8 text-center text-sm text-gray-500">
              Patient list will be available in Phase 2
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Stethoscope className="h-5 w-5 text-primary-600" />
              Profile Summary
            </h3>
            <div className="flex items-center gap-3">
              <Avatar firstName={user?.firstName} lastName={user?.lastName} size="lg" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Dr. {user?.firstName} {user?.lastName}
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
              {(data?.notifications || []).map((notif) => (
                <div key={notif.id} className="flex items-start gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notif.read ? 'bg-gray-300' : 'bg-primary-500'}`} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">{notif.message}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {(data?.quickActions || []).map((action) => (
                <button
                  key={action.id}
                  disabled={!action.enabled}
                  className="rounded-lg border border-gray-200 p-3 text-center text-xs font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

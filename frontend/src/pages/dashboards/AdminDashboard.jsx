import { useEffect, useState } from 'react';
import {
  Users,
  Stethoscope,
  UserCheck,
  Bell,
  BarChart3,
  Activity,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/authService';
import Card from '../../components/common/Card';
import StatCard from '../../components/common/StatCard';
import PlaceholderCard from '../../components/common/PlaceholderCard';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import { formatDateTime } from '../../utils/helpers';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await dashboardService.getAdminDashboard();
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
              Admin Dashboard
            </h2>
            <p className="mt-1 text-white/80">
              Welcome, {user?.firstName}. Manage your healthcare platform.
            </p>
          </div>
          <Avatar firstName={user?.firstName} lastName={user?.lastName} size="xl" />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Users" value={data?.stats?.totalUsers ?? 0} icon={Users} color="primary" />
        <StatCard title="Total Doctors" value={data?.stats?.totalDoctors ?? 0} icon={Stethoscope} color="accent" />
        <StatCard title="Total Patients" value={data?.stats?.totalPatients ?? 0} icon={UserCheck} color="warning" />
        <StatCard title="Notifications" value={data?.stats?.notifications ?? 0} icon={Bell} color="danger" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PlaceholderCard
            title="Analytics Dashboard"
            description="Platform analytics and insights will appear here"
            icon={BarChart3}
            badge="Coming in Phase 2"
          />

          <Card>
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
              <Activity className="h-5 w-5 text-primary-600" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {(data?.recentActivity || []).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{activity.action}</p>
                    <p className="text-xs text-gray-500">{formatDateTime(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
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

export default AdminDashboard;

import { useEffect, useState } from 'react';
import { Bell, Check, Trash2, Clock, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { formatDateTime } from '../utils/helpers';

const DoctorNotificationsPage = () => {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = filter === 'unread' ? { unreadOnly: true } : {};
      const response = await notificationService.getNotifications(params);
      const notificationsData =
        response?.notifications ||
        [];
      setNotifications(notificationsData);
      setUnreadCount(response?.unreadCount || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      toast.success('Notification deleted');
      fetchNotifications();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_booked':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'appointment_accepted':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'appointment_rejected':
        return <Trash2 className="h-5 w-5 text-red-500" />;
      case 'appointment_cancelled':
        return <Trash2 className="h-5 w-5 text-orange-500" />;
      case 'appointment_completed':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'prescription_created':
        return <User className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment_booked':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'appointment_accepted':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'appointment_rejected':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'appointment_cancelled':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800';
      case 'appointment_completed':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'prescription_created':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
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
            Notifications
          </h2>
          <p className="mt-1 text-gray-500">
            {unreadCount > 0 && `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            icon={Check}
          >
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
        </div>

        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
                  notification.read
                    ? 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                    : 'bg-white border-blue-200 dark:bg-gray-900 dark:border-blue-800'
                } ${getNotificationColor(notification.type)}`}
              >
                <div className="mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h4>

                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                    </div>

                    {!notification.read && (
                      <div className="ml-2 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(notification.createdAt)}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(notification._id)}
                      icon={Check}
                    >
                      Mark Read
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(notification._id)}
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

export default DoctorNotificationsPage;

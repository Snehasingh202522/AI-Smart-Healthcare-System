import { useEffect, useState } from 'react';
import { Users, Search, Filter, UserX, UserCheck } from 'lucide-react';
import { adminService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Input from '../components/common/Input';

const AdminUserManagementPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllUsers({
        role: roleFilter || undefined,
      });
      setUsers(response.users || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleDeactivate = async (userId) => {
    try {
      await adminService.deactivateUser(userId);
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to deactivate user');
      console.error(error);
    }
  };

  const handleActivate = async (userId) => {
    try {
      await adminService.activateUser(userId);
      toast.success('User activated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to activate user');
      console.error(error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(filter.toLowerCase()) ||
      user.lastName.toLowerCase().includes(filter.toLowerCase()) ||
      user.email.toLowerCase().includes(filter.toLowerCase())
  );

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
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Users className="h-8 w-8 text-primary-600" />
          User Management
        </h2>
        <p className="text-gray-500">
          Manage all platform users
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Search users..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              icon={Search}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border px-4 py-2"
          >
            <option value="">All Roles</option>
            <option value="patient">Patients</option>
            <option value="doctor">Doctors</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <div className="py-8 text-center text-gray-500">
              No users found
            </div>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user._id}>
              <div className="flex items-center gap-4">
                <Avatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size="lg"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.phone && (
                        <p className="text-sm text-gray-500">{user.phone}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        user.role === 'patient' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'doctor' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      <Badge className={
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {user.isActive ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeactivate(user._id)}
                        icon={UserX}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleActivate(user._id)}
                        icon={UserCheck}
                      >
                        Activate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUserManagementPage;
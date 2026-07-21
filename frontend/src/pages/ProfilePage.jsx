import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, Calendar, MapPin, Save, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { getRoleColor, getRoleLabel } from '../utils/helpers';

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await userService.updateProfile(data);
      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="relative">
            <Avatar firstName={user.firstName} lastName={user.lastName} size="xl" />
            <button
              className="absolute bottom-0 right-0 rounded-full bg-primary-600 p-2 text-white hover:bg-primary-700"
              title="Change avatar (coming soon)"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="mt-1 text-gray-500">{user.email}</p>
            <Badge className={`mt-2 ${getRoleColor(user.role)}`}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} icon={Save}>
              Edit Profile
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <User className="h-5 w-5 text-primary-600" />
            Personal Information
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Update your personal information below
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              {...register('firstName', {
                required: 'First name is required',
                minLength: { value: 2, message: 'First name must be at least 2 characters' },
                maxLength: { value: 50, message: 'First name cannot exceed 50 characters' },
              })}
              error={errors.firstName?.message}
              disabled={!isEditing}
              icon={User}
            />
            <Input
              label="Last Name"
              {...register('lastName', {
                required: 'Last name is required',
                minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                maxLength: { value: 50, message: 'Last name cannot exceed 50 characters' },
              })}
              error={errors.lastName?.message}
              disabled={!isEditing}
              icon={User}
            />
          </div>

          <Input
            label="Email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Please enter a valid email address',
              },
            })}
            error={errors.email?.message}
            disabled={!isEditing}
            icon={Mail}
          />

          <Input
            label="Phone Number"
            type="tel"
            {...register('phone', {
              pattern: {
                value: /^[+]?[\d\s-()]*$/,
                message: 'Please enter a valid phone number',
              },
            })}
            error={errors.phone?.message}
            disabled={!isEditing}
            icon={Phone}
          />

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={loading} disabled={!isDirty}>
                Save Changes
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Card>

      <Card>
        <div className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-primary-600" />
            Account Information
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Your account details and activity
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Member Since</p>
                <p className="text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Account Status</p>
                <p className="text-sm text-gray-500">
                  {user.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;

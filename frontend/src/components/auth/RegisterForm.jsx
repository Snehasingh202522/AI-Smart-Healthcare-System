import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import Input from '../common/Input';
import Button from '../common/Button';

const RegisterForm = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: 'patient' } });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const { dashboardRoute } = await registerUser(data);
      toast.success('Registration successful!');
      navigate(dashboardRoute);
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          icon={User}
          error={errors.firstName?.message}
          {...register('firstName', { required: 'First name is required' })}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          error={errors.lastName?.message}
          {...register('lastName', { required: 'Last name is required' })}
        />
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        icon={Mail}
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
        })}
      />

      <Input
        label="Phone (Optional)"
        type="tel"
        placeholder="+1 (555) 000-0000"
        icon={Phone}
        error={errors.phone?.message}
        {...register('phone')}
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          I am a
        </label>
        <select
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          {...register('role', { required: 'Please select a role' })}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Administrator</option>
        </select>
        {errors.role && <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>}
      </div>

      <Input
        label="Password"
        type="password"
        placeholder="Min. 8 characters"
        icon={Lock}
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 8, message: 'Password must be at least 8 characters' },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: 'Must contain uppercase, lowercase, and number',
          },
        })}
      />

      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        icon={Lock}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword', {
          required: 'Please confirm your password',
          validate: (value) => value === password || 'Passwords do not match',
        })}
      />

      <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
        <UserPlus className="h-5 w-5" />
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;

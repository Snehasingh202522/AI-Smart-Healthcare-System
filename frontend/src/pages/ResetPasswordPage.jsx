import { Link, useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, ArrowLeft } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { authService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import { DASHBOARD_ROUTES } from '../utils/constants';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const response = await authService.resetPassword(token, {
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Password reset successful!');
      navigate(DASHBOARD_ROUTES[response.data.user.role] || '/');
      window.location.reload();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="New Password"
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
          Reset Password
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Link>
    </AuthLayout>
  );
};

export default ResetPasswordPage;

import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { authService } from '../services/authService';
import { useToast } from '../hooks/useToast';

const ForgotPasswordPage = () => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          Send Reset Link
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

export default ForgotPasswordPage;

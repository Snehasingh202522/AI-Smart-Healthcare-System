import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import Input from '../common/Input';
import Button from '../common/Button';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const { dashboardRoute } = await login(data);
      toast.success('Login successful!');
      navigate(dashboardRoute);
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    }
  };

  return (
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

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        icon={Lock}
        error={errors.password?.message}
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 8, message: 'Password must be at least 8 characters' },
        })}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
          Remember me
        </label>
        <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
          Forgot password?
        </Link>
      </div>

      <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
        <LogIn className="h-5 w-5" />
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;

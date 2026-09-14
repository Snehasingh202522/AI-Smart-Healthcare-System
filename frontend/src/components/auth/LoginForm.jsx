import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn, User, Stethoscope, Shield } from 'lucide-react';
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
    setValue,
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

  const handleDemoPatientLogin = () => {
    setValue('email', 'demo.patient@healthcare-ai.demo');
    setValue('password', 'Demo123456');
    toast.info('Demo Patient credentials filled. Click Sign In to continue.');
  };

  const handleDemoDoctorLogin = () => {
    setValue('email', 'demo.doctor@healthcare-ai.demo');
    setValue('password', 'Demo123456');
    toast.info('Demo Doctor credentials filled. Click Sign In to continue.');
  };

  const handleDemoAdminLogin = () => {
    setValue('email', 'demo.admin@healthcare-ai.demo');
    setValue('password', 'Demo123456');
    toast.info('Demo Admin credentials filled. Click Sign In to continue.');
  };

  return (
    <div className="space-y-6">
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or try demo accounts</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleDemoPatientLogin}
          className="w-full"
          icon={User}
        >
          Demo Patient
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDemoDoctorLogin}
          className="w-full"
          icon={Stethoscope}
        >
          Demo Doctor
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDemoAdminLogin}
          className="w-full"
          icon={Shield}
        >
          Demo Admin
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;

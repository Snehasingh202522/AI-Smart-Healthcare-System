import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to access your healthcare dashboard"
    >
      <LoginForm />
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;

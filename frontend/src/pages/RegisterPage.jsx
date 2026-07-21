import { Link } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join HealthCare AI and take control of your health"
    >
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;

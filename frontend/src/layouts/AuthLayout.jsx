import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="mb-8 flex items-center gap-3">
            <Heart className="h-10 w-10" />
            <span className="text-3xl font-bold">HealthCare AI</span>
          </div>
          <h2 className="mb-4 text-4xl font-bold leading-tight">
            Your Health, Our Priority
          </h2>
          <p className="text-lg text-white/80">
            Join thousands of patients and healthcare professionals using our smart platform for better health outcomes.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {['50K+ Patients', '500+ Doctors', '98% Satisfaction'].map((stat) => (
              <div key={stat} className="rounded-lg bg-white/10 p-3 text-center backdrop-blur-sm">
                <p className="text-sm font-semibold">{stat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-gray-50 p-6 dark:bg-gray-950 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">HealthCare AI</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

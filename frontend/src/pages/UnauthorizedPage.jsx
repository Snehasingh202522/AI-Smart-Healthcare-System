import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import Button from '../components/common/Button';

const UnauthorizedPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          You don't have permission to access this page.
        </p>
        <Link to="/" className="mt-8 inline-block">
          <Button size="lg">
            <Home className="h-5 w-5" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

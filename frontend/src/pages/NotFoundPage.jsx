import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="text-center">
        <p className="text-8xl font-bold text-primary-600">404</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Page Not Found</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
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

export default NotFoundPage;

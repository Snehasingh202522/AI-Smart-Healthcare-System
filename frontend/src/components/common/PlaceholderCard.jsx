import { Clock } from 'lucide-react';
import Card from './Card';

const PlaceholderCard = ({ title, description, icon: Icon = Clock, badge }) => {
  return (
    <Card className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-3 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mb-1 font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      {badge && (
        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
          {badge}
        </span>
      )}
    </Card>
  );
};

export default PlaceholderCard;

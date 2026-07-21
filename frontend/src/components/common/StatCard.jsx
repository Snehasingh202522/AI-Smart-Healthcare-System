import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from './Card';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
  const colors = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400',
    accent: 'bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400',
    warning: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    danger: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {trend && (
            <div className={`mt-2 flex items-center gap-1 text-sm ${trend === 'up' ? 'text-accent-600' : 'text-red-500'}`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`rounded-lg p-3 ${colors[color]}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;

import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;

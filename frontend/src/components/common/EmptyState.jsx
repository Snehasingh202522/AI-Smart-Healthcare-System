import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 rounded-full bg-blue-50 p-6 dark:bg-blue-900/20">
        <Icon className="h-12 w-12 text-blue-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;

const Spinner = ({ size = 'md', className = '', text = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400`}
      />
      {text && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default Spinner;

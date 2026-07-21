const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400`}
      />
    </div>
  );
};

export default Spinner;

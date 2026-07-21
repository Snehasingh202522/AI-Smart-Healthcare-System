const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 ${
        hover ? 'card-hover cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

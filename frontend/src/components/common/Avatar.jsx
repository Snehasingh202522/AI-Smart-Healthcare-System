import { getInitials } from '../../utils/helpers';

const Avatar = ({ firstName, lastName, src, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-20 w-20 text-2xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={`rounded-full object-cover ${sizes[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 ${sizes[size]} ${className}`}
    >
      {getInitials(firstName, lastName)}
    </div>
  );
};

export default Avatar;

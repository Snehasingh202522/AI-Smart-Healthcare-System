export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRoleLabel = (role) => {
  const labels = {
    patient: 'Patient',
    doctor: 'Doctor',
    admin: 'Administrator',
  };
  return labels[role] || role;
};

export const getRoleColor = (role) => {
  const colors = {
    patient: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    doctor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
};

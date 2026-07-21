import toast from 'react-hot-toast';

const api = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast(message),
  loading: (message) => toast.loading(message),
  dismiss: (id) => toast.dismiss(id),
};

// Stable reference across renders so consumers can safely list it in effect deps.
// Supports both `const toast = useToast()` and `const { toast } = useToast()`.
const value = { ...api, toast: api };

export function useToast() {
  return value;
}

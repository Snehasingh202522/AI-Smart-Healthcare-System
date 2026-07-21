import toast from 'react-hot-toast';

export function useToast() {
  const api = {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    info: (message) => toast(message),
    loading: (message) => toast.loading(message),
    dismiss: (id) => toast.dismiss(id),
  };

  // Support both `const toast = useToast()` and `const { toast } = useToast()`.
  return { ...api, toast: api };
}

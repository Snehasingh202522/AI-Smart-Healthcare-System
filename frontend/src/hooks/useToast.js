export function useToast() {
  const toast = {
    success: (message) => {
      alert(`✅ ${message}`);
    },

    error: (message) => {
      alert(`❌ ${message}`);
    },

    info: (message) => {
      alert(`ℹ️ ${message}`);
    }
  };

  return toast;
}

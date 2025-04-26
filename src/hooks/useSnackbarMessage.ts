import { useState, useCallback } from 'react';

export type SnackbarType = 'success' | 'error' | 'warning';

export interface SnackbarState {
  open: boolean;
  type: SnackbarType;
  message: string;
  details?: string;
  autoHideDuration?: number | null;
}

export function useSnackbarMessage() {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    type: 'success',
    message: '',
    details: undefined,
    autoHideDuration: 2500,
  });

  const showSnackbar = useCallback(
    (type: SnackbarType, message: string, details?: string, autoHideDuration?: number | null) => {
      setSnackbar({ open: true, type, message, details, autoHideDuration });
    },
    []
  );

  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return { snackbar, showSnackbar, closeSnackbar };
} 
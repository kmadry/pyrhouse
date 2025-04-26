import { Snackbar, Alert, Box, Typography, SnackbarOrigin } from '@mui/material';
import React from 'react';

interface AppSnackbarProps {
  open: boolean;
  type: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
  onClose: () => void;
  autoHideDuration?: number | null;
  anchorOrigin?: SnackbarOrigin;
}

export const AppSnackbar: React.FC<AppSnackbarProps> = ({
  open,
  type,
  message,
  details,
  onClose,
  autoHideDuration = 3000,
  anchorOrigin = { vertical: 'top', horizontal: 'center' },
}) => (
  <Snackbar
    open={open}
    autoHideDuration={autoHideDuration}
    onClose={onClose}
    anchorOrigin={anchorOrigin}
  >
    <Alert severity={type} onClose={onClose} sx={{ borderRadius: 1, minWidth: 320 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="subtitle1" fontWeight="500">
          {type === 'error' ? 'Wystąpił błąd' : 'Sukces'}
        </Typography>
        <Typography variant="body1">{message}</Typography>
        {details && (
          <Typography variant="body2" color="text.secondary">{details}</Typography>
        )}
      </Box>
    </Alert>
  </Snackbar>
); 
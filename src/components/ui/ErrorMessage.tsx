import React from 'react';
import { Box, Typography } from '@mui/material';

export const ErrorMessage: React.FC<{ message: string; details?: string }> = ({ message, details }) => (
  <Box sx={{ mt: 2, p: 2, bgcolor: '#fce4ec', borderRadius: 2 }}>
    <Typography variant="h6" color="error" gutterBottom>
      Wystąpił błąd
    </Typography>
    <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#d32f2f' }}>
      {message}
    </pre>
    {details && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {details}
      </Typography>
    )}
  </Box>
);

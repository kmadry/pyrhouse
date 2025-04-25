import React from 'react';
import { Box, Typography } from '@mui/material';
import * as Icons from '@mui/icons-material';

interface ThemeSwitchProps {
  themeMode: 'light' | 'dark';
  onThemeChange: (mode: 'light' | 'dark') => void;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ themeMode, onThemeChange }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      p: 1,
      borderRadius: 1,
      '&:hover': {
        bgcolor: 'action.hover'
      }
    }}>
      <Icons.LightMode sx={{ color: themeMode === 'light' ? 'primary.main' : 'text.secondary' }} />
      <Box sx={{ 
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'action.selected',
        borderRadius: 2,
        p: 0.5,
        mx: 1,
        position: 'relative'
      }}>
        <Box
          onClick={() => onThemeChange('light')}
          data-theme-switch
          sx={{
            cursor: 'pointer',
            p: 1,
            borderRadius: 1,
            bgcolor: themeMode === 'light' ? 'primary.main' : 'transparent',
            color: themeMode === 'light' ? 'primary.contrastText' : 'text.secondary',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: themeMode === 'light' ? 'primary.dark' : 'action.hover'
            }
          }}
        >
          <Typography variant="body2">Jasny</Typography>
        </Box>
        <Box
          onClick={() => onThemeChange('dark')}
          data-theme-switch
          sx={{
            cursor: 'pointer',
            p: 1,
            borderRadius: 1,
            bgcolor: themeMode === 'dark' ? 'primary.main' : 'transparent',
            color: themeMode === 'dark' ? 'primary.contrastText' : 'text.secondary',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: themeMode === 'dark' ? 'primary.dark' : 'action.hover'
            }
          }}
        >
          <Typography variant="body2">Ciemny</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ThemeSwitch; 
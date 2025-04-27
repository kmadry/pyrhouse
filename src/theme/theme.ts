import { createTheme, ThemeOptions, responsiveFontSizes, Components, Theme } from '@mui/material/styles';
import { commonButtonStyles, commonCardStyles, commonInputStyles } from './commonStyles';

// Critical CSS components - te komponenty są ładowane jako pierwsze
const criticalComponents: Components<Omit<Theme, 'components'>> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }
    }
  },
  MuiButton: {
    styleOverrides: {
      root: {
        ...commonButtonStyles(),
        variants: []
      }
    }
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        ...commonCardStyles(),
        variants: []
      }
    }
  }
};

const baseTheme: ThemeOptions = {
  palette: {
    primary: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 },
    h6: { fontWeight: 500 },
    button: { textTransform: 'none' }
  },
  components: criticalComponents,
  shape: {
    borderRadius: 8
  }
};

// Tworzymy cache dla motywów
const themeCache = new Map();

export const createThemeWithMode = (mode: 'light' | 'dark') => {
  const cacheKey = mode;
  if (themeCache.has(cacheKey)) {
    return themeCache.get(cacheKey);
  }

  const theme = responsiveFontSizes(createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode,
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#000000' : '#ffffff',
        secondary: mode === 'light' ? '#666666' : '#a0a0a0',
      },
    },
  }));

  // Dodajemy style dla TextField po utworzeniu motywu
  theme.components = {
    ...theme.components,
    MuiTextField: {
      styleOverrides: {
        root: {
          ...commonInputStyles(theme),
          variants: []
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          minWidth: 120,
          // justifyContent: 'left',
        },
        icon: {
          display: 'flex',
          paddingLeft: 1,
          alignItems: 'left',
          justifyContent: 'left',
        },
        label: {
          display: 'flex',
          alignItems: 'center',
        },
      },
    },
  };

  themeCache.set(cacheKey, theme);
  return theme;
};

export const lightTheme = createThemeWithMode('light');
export const darkTheme = createThemeWithMode('dark'); 
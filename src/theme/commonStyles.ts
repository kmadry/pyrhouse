import { Theme } from '@mui/material/styles';

export const commonButtonStyles = () => ({
  py: 1.5,
  borderRadius: 2,
  fontWeight: 600,
  fontSize: '1rem',
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-2px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  }
});

export const commonCardStyles = () => ({
  borderRadius: 2,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'none',
  '&:hover': {
    transform: 'none',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  }
});

export const commonInputStyles = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    transition: 'all 0.2s ease',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      }
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 2,
      }
    }
  }
});

export const commonAnimations = {
  fadeIn: {
    '@keyframes fadeIn': {
      from: { opacity: 0 },
      to: { opacity: 1 }
    }
  },
  slideUp: {
    '@keyframes slideUp': {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 }
    }
  }
};

export const commonTransitions = {
  default: 'all 0.3s ease',
  fast: 'all 0.2s ease',
  slow: 'all 0.4s ease'
};

export const commonShadows = {
  light: '0 4px 12px rgba(0, 0, 0, 0.1)',
  medium: '0 6px 16px rgba(0, 0, 0, 0.15)',
  heavy: '0 8px 24px rgba(0, 0, 0, 0.2)'
};

export const commonStyles = (theme: Theme) => ({
  // Mixiny dla często używanych stylów
  hoverEffect: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[4],
    },
  },
  
  cardHover: {
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: theme.shadows[8],
    },
  },
  
  listItemHover: {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      transform: 'translateX(4px)',
    },
  },
  
  // Style dla kontenerów
  container: {
    padding: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
  
  // Style dla kart
  card: {
    borderRadius: theme.shape.borderRadius,
    transition: 'all 0.3s ease',
    padding: theme.spacing(2),
  },
  
  // Style dla przycisków
  button: {
    borderRadius: theme.shape.borderRadius,
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.2s ease',
  },
  
  // Style dla formularzy
  formControl: {
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.shape.borderRadius,
    },
  },
  
  // Style dla list
  list: {
    padding: theme.spacing(1),
    '& .MuiListItem-root': {
      borderRadius: theme.shape.borderRadius,
      margin: theme.spacing(0.5, 0),
    },
  },
  
  // Style dla nagłówków
  header: {
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(2),
    },
  },
  
  // Style dla sekcji
  section: {
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
      marginBottom: theme.spacing(3),
    },
  },
  
  // Style dla animacji
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in',
  },
  
  slideUp: {
    animation: 'slideUp 0.3s ease-out',
  },
  
  // Style dla responsywności
  responsiveContainer: {
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(1),
    },
  },
  
  // Style dla gridów
  gridContainer: {
    margin: theme.spacing(-1),
    '& > *': {
      padding: theme.spacing(1),
    },
  },
  
  // Style dla tooltipów
  tooltip: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[2],
    fontSize: '0.875rem',
  },
  
  // Style dla dialogów
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2),
    },
  },
  
  // Style dla snackbarów
  snackbar: {
    '& .MuiSnackbarContent-root': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}); 
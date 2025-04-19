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
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
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
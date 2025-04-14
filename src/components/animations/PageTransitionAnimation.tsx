import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, keyframes } from '@mui/material';
import { useAnimationPreference } from '../../hooks/useAnimationPreference';

// Animacja pulsowania
const pulseAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
`;

// Animacja zanikania
const fadeOutAnimation = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

interface PageTransitionAnimationProps {
  onAnimationComplete: () => void;
  targetPage?: string;
}

const PageTransitionAnimation: React.FC<PageTransitionAnimationProps> = ({ 
  onAnimationComplete,
  targetPage = 'nową stronę'
}) => {
  const { prefersAnimations } = useAnimationPreference();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!prefersAnimations) {
      onAnimationComplete();
      return;
    }

    // Symulacja postępu ładowania
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Zakończ animację po 1 sekundzie
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onAnimationComplete, 300); // Poczekaj na zakończenie animacji zanikania
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [prefersAnimations, onAnimationComplete]);

  if (!prefersAnimations || !isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        animation: `${fadeOutAnimation} 0.3s ease-out 0.7s forwards`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress 
          variant="determinate" 
          value={progress} 
          size={60}
          thickness={4}
          sx={{
            color: 'primary.main',
            animation: `${pulseAnimation} 1s ease-in-out infinite`,
          }}
        />
        <Typography 
          variant="body1" 
          color="white" 
          sx={{ 
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          Przechodzę do {targetPage}...
        </Typography>
      </Box>
    </Box>
  );
};

export default PageTransitionAnimation; 
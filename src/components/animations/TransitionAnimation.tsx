import { Box, keyframes } from '@mui/material';
import { useEffect, useState } from 'react';
import { useAnimationPreference } from '../../hooks/useAnimationPreference';

const irisWipe = keyframes`
  0% {
    clip-path: circle(0% at center);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    clip-path: circle(150% at center);
    opacity: 0;
  }
`;

interface TransitionAnimationProps {
  onAnimationComplete: () => void;
  duration?: number;
}

export const TransitionAnimation = ({ 
  onAnimationComplete, 
  duration = 1000 
}: TransitionAnimationProps) => {
  const [isVisible] = useState(true);
  const { prefersAnimations, isSystemReducedMotion } = useAnimationPreference();

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [onAnimationComplete, duration]);

  // Jeśli użytkownik nie preferuje animacji lub system ma włączoną redukcję ruchu,
  // nie renderujemy komponentu
  if (!prefersAnimations || isSystemReducedMotion || !isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        backgroundColor: 'black',
        animation: `${irisWipe} ${duration}ms ease-in-out forwards`,
      }}
    />
  );
}; 
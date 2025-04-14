import React, { useEffect, useState } from 'react';
import { Box, keyframes } from '@mui/material';
import { useAnimationPreference } from '../../hooks/useAnimationPreference';

const irisWipe = keyframes`
  0% {
    clip-path: circle(0% at center);
  }
  100% {
    clip-path: circle(150% at center);
  }
`;

interface QuestBoardTransitionProps {
  onAnimationComplete: () => void;
}

const QuestBoardTransition: React.FC<QuestBoardTransitionProps> = ({ onAnimationComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { prefersAnimations, isSystemReducedMotion } = useAnimationPreference();

  useEffect(() => {
    // Jeśli użytkownik nie preferuje animacji lub system ma włączoną redukcję ruchu,
    // natychmiast wywołujemy callback i nie pokazujemy animacji
    if (!prefersAnimations || isSystemReducedMotion) {
      onAnimationComplete();
      return;
    }
    
    // Najpierw pokazujemy animację
    setIsVisible(true);
    
    // Po zakończeniu animacji wywołujemy callback
    const timer = setTimeout(() => {
      setIsVisible(false);
      onAnimationComplete();
    }, 700);

    return () => clearTimeout(timer);
  }, [onAnimationComplete, prefersAnimations, isSystemReducedMotion]);

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
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 9999,
        animation: `${irisWipe} 1s cubic-bezier(0.7, 0, 0.2, 1) forwards`,
      }}
    />
  );
};

export default QuestBoardTransition; 
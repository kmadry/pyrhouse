import { useEffect, useState } from 'react';
import { Box, keyframes } from '@mui/material';
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

interface QuestBoardTransitionProps {
  onAnimationComplete: () => void;
}

const QuestBoardTransition = ({ onAnimationComplete }: QuestBoardTransitionProps) => {
  const [isVisible] = useState(true);
  const { prefersAnimations, isSystemReducedMotion } = useAnimationPreference();

  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

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
        animation: `${irisWipe} 1s ease-in-out forwards`,
      }}
    />
  );
};

export default QuestBoardTransition; 
import React, { useEffect, useState } from 'react';
import { Box, keyframes } from '@mui/material';
import { useAnimationPreference } from '../../hooks/useAnimationPreference';

// Animacja gwiazd (efekt prędkości nadświetlnej)
const starStreakAnimation = keyframes`
  0% {
    transform: translateZ(0) scale(1);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateZ(1000px) scale(0);
    opacity: 0;
  }
`;

// Animacja skoku w nadprzestrzeń
const hyperJumpAnimation = keyframes`
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  20% {
    transform: scale(1.1);
    filter: brightness(1.2);
  }
  40% {
    transform: scale(1);
    filter: brightness(1);
  }
  60% {
    transform: scale(1.2);
    filter: brightness(1.4);
  }
  80% {
    transform: scale(1);
    filter: brightness(1.2);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
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

interface HyperJumpAnimationProps {
  onAnimationComplete: () => void;
}

const HyperJumpAnimation: React.FC<HyperJumpAnimationProps> = ({ onAnimationComplete }) => {
  const { prefersAnimations } = useAnimationPreference();
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number }>>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Generuj losowe gwiazdy
  useEffect(() => {
    if (!prefersAnimations) {
      onAnimationComplete();
      return;
    }

    const newStars = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2,
    }));

    setStars(newStars);

    // Zakończ animację po 3 sekundach
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onAnimationComplete, 500); // Poczekaj na zakończenie animacji zanikania
    }, 3000);

    return () => clearTimeout(timer);
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
        backgroundColor: 'black',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: '1000px',
        animation: `${fadeOutAnimation} 0.5s ease-out 2.5s forwards`,
      }}
    >
      {/* Centralny element animacji */}
      <Box
        sx={{
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(0,0,0,0) 70%)',
          animation: `${hyperJumpAnimation} 2s ease-in-out infinite`,
          position: 'relative',
          zIndex: 2,
        }}
      />

      {/* Gwiazdy */}
      {stars.map((star) => (
        <Box
          key={star.id}
          sx={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            animation: `${starStreakAnimation} 2s ease-out ${star.delay}s infinite`,
            transformOrigin: 'center center',
          }}
        />
      ))}
    </Box>
  );
};

export default HyperJumpAnimation; 
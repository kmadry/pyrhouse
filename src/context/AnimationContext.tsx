import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HyperJumpAnimation from '../components/animations/HyperJumpAnimation';

interface AnimationContextType {
  triggerPageTransition: (path: string) => void;
  isTransitioning: boolean;
}

const AnimationContext = createContext<AnimationContextType>({
  triggerPageTransition: () => {},
  isTransitioning: false,
});

export const useAnimationContext = () => useContext(AnimationContext);

interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const triggerPageTransition = (path: string) => {
    if (path === location.pathname) return;
    
    setIsTransitioning(true);
    
    // Po zakończeniu animacji, przejdź do nowej ścieżki
    const handleAnimationComplete = () => {
      navigate(path);
      setIsTransitioning(false);
    };
    
    return (
      <HyperJumpAnimation onAnimationComplete={handleAnimationComplete} />
    );
  };

  return (
    <AnimationContext.Provider value={{ triggerPageTransition, isTransitioning }}>
      {children}
      {isTransitioning && <HyperJumpAnimation onAnimationComplete={() => setIsTransitioning(false)} />}
    </AnimationContext.Provider>
  );
}; 
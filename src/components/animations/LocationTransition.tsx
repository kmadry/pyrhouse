import { TransitionAnimation } from './TransitionAnimation';

interface LocationTransitionProps {
  onAnimationComplete: () => void;
}

export const LocationTransition = ({ onAnimationComplete }: LocationTransitionProps) => {
  return <TransitionAnimation onAnimationComplete={onAnimationComplete} />;
}; 
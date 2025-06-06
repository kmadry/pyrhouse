import { TransitionAnimation } from './TransitionAnimation';

interface QuestBoardTransitionProps {
  onAnimationComplete: () => void;
}

const QuestBoardTransition = ({ onAnimationComplete }: QuestBoardTransitionProps) => {
  return <TransitionAnimation onAnimationComplete={onAnimationComplete} />;
};

export default QuestBoardTransition; 
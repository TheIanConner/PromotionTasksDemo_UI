import { useEffect, useState } from "react";
import Confetti from "react-confetti";

interface TaskCelebrationProps {
  isActive: boolean;
  onComplete: () => void;
}

export default function TaskCelebration({
  isActive,
  onComplete,
}: TaskCelebrationProps) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (isActive) {
      // Get dimensions from parent element
      const parentElement = document.getElementById(
        "task-celebration-container"
      );
      if (parentElement) {
        const { width, height } = parentElement.getBoundingClientRect();
        setDimensions({ width, height });
      }

      // Auto-hide the celebration after 2 seconds
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <Confetti
      width={dimensions.width}
      height={dimensions.height}
      recycle={false}
      numberOfPieces={100}
      gravity={0.3}
    />
  );
}

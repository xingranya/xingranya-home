import React from 'react';
import { useReadingProgress } from '../../hooks/useReadingProgress';

export const ReadingProgressBar: React.FC = () => {
  const progress = useReadingProgress();

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-50 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-sakura-400 via-sakura-400 to-rose-400 dark:from-sakura-500 dark:via-sakura-300 dark:to-rose-300 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(255,143,166,0.5)]"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
};

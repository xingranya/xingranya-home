import React from 'react';
import { useReadingProgress } from '../../hooks/useReadingProgress';

export const ReadingProgressBar: React.FC = () => {
  const progress = useReadingProgress();

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-50 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 dark:from-sky-500 dark:via-blue-400 dark:to-indigo-400 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(56,189,248,0.5)]"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
};

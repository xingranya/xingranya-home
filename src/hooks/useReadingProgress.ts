import { useState, useEffect } from 'react';

export function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const currentScroll = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const p = Number((currentScroll / scrollHeight).toFixed(3));
        setProgress(Math.min(1, Math.max(0, p)));
      } else {
        setProgress(0);
      }
    };

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return progress;
}

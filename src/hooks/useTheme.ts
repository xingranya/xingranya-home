import { useState, useEffect } from 'react';
import type { ThemeMode } from '../types';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('perimsx-theme') as ThemeMode;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored;
      }
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      return root.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let resolvedDark = false;
      if (theme === 'dark') {
        resolvedDark = true;
      } else if (theme === 'light') {
        resolvedDark = false;
      } else {
        resolvedDark = mediaQuery.matches;
      }

      if (resolvedDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      setIsDark(resolvedDark);
    };

    applyTheme();
    localStorage.setItem('perimsx-theme', theme);

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return isDark ? 'light' : 'dark';
    });
  };

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
}

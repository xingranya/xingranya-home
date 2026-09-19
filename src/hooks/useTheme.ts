import { useState, useEffect } from 'react';
import type { ThemeMode } from '../types';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isDark, setIsDark] = useState(false);
  const [preferenceLoaded, setPreferenceLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('perimsx-theme') as ThemeMode | null;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setThemeState(stored);
      }
    } catch {
      // 隐私模式下仍可跟随系统主题。
    }
    setPreferenceLoaded(true);
  }, []);

  useEffect(() => {
    if (!preferenceLoaded) return;
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
    try {
      localStorage.setItem('perimsx-theme', theme);
    } catch {
      // 无法持久化时，本次访问内的主题切换仍然有效。
    }

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, preferenceLoaded]);

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

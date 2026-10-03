import { useSyncExternalStore } from 'react';
import type { ThemeMode } from '../types';

type ThemeSnapshot = { theme: ThemeMode; isDark: boolean };
const storageKey = 'perimsx-theme';
const serverSnapshot: ThemeSnapshot = { theme: 'system', isDark: false };
let snapshot = serverSnapshot;
let mediaQuery: MediaQueryList | null = null;
const listeners = new Set<() => void>();

function isTheme(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function applyTheme(theme: ThemeMode) {
  const isDark = theme === 'dark' || (theme === 'system' && Boolean(mediaQuery?.matches));
  document.documentElement.classList.toggle('dark', isDark);
  if (snapshot.theme === theme && snapshot.isDark === isDark) return;
  snapshot = { theme, isDark };
  listeners.forEach((listener) => listener());
}

function handleSystemChange() {
  if (snapshot.theme === 'system') applyTheme('system');
}

function handleStorage(event: StorageEvent) {
  if (event.key !== storageKey && event.key !== null) return;
  applyTheme(isTheme(event.newValue) ? event.newValue : 'system');
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemChange);
    window.addEventListener('storage', handleStorage);
    let preference = snapshot.theme;
    try {
      const stored = localStorage.getItem(storageKey);
      if (isTheme(stored)) preference = stored;
    } catch {
      // 无法读取存储时，保留本次访问中的主题选择。
    }
    applyTheme(preference);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size) return;
    mediaQuery?.removeEventListener('change', handleSystemChange);
    window.removeEventListener('storage', handleStorage);
    mediaQuery = null;
  };
}

function setTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // 无法持久化时，所有已挂载组件仍同步本次选择。
  }
  applyTheme(theme);
}

function toggleTheme() {
  setTheme(snapshot.isDark ? 'light' : 'dark');
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => serverSnapshot;

export function useTheme() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { ...state, setTheme, toggleTheme };
}

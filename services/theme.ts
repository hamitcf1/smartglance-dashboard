import { useState, useEffect } from 'react';

export type ThemeName = 'dark' | 'light' | 'dracula' | 'nord' | 'solarized';

const DEFAULT_THEME: ThemeName = 'dark';

export function useTheme() {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('smart-glance-theme-name');
    return (saved as ThemeName) || DEFAULT_THEME;
  });

  useEffect(() => {
    localStorage.setItem('smart-glance-theme-name', themeName);
    
    // Apply theme as data attribute to html element
    document.documentElement.setAttribute('data-theme', themeName);
    document.documentElement.style.colorScheme = themeName === 'light' ? 'light' : 'dark';
  }, [themeName]);

  return {
    themeName,
    setThemeName,
    availableThemes: ['dark', 'light', 'dracula', 'nord', 'solarized'] as const
  };
}

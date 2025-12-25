import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'auto';

interface ThemeConfig {
  theme: Theme;
  sunriseTime: number; // hours 0-24
  sunsetTime: number;  // hours 0-24
}

const DEFAULT_CONFIG: ThemeConfig = {
  theme: 'dark',
  sunriseTime: 6,
  sunsetTime: 18
};

export function useTheme() {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('smart-glance-theme');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('smart-glance-theme');
    const cfg = saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    
    if (cfg.theme === 'auto') {
      const now = new Date();
      const hours = now.getHours();
      return hours < cfg.sunriseTime || hours >= cfg.sunsetTime;
    }
    return cfg.theme === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('smart-glance-theme', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const updateTheme = () => {
      let dark = true;

      if (config.theme === 'auto') {
        const now = new Date();
        const hours = now.getHours();
        dark = hours < config.sunriseTime || hours >= config.sunsetTime;
      } else {
        dark = config.theme === 'dark';
      }

      setIsDarkMode(dark);
      
      // Update HTML class and document styling
      const html = document.documentElement;
      const body = document.body;
      
      if (dark) {
        html.classList.add('dark');
        html.style.colorScheme = 'dark';
        body.style.backgroundColor = '#0f172a';
        body.style.color = '#e2e8f0';
      } else {
        html.classList.remove('dark');
        html.style.colorScheme = 'light';
        body.style.backgroundColor = '#f1f5f9';
        body.style.color = '#1e293b';
        body.style.background = 'linear-gradient(to bottom, #f8fafc, #e2e8f0)';
      }
    };

    updateTheme();

    // Check every minute if auto mode is enabled
    let interval: NodeJS.Timeout | null = null;
    if (config.theme === 'auto') {
      interval = setInterval(updateTheme, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [config]);

  return {
    config,
    setConfig,
    isDarkMode,
    setTheme: (theme: Theme) => setConfig(prev => ({ ...prev, theme })),
    setSunriseTime: (hours: number) => setConfig(prev => ({ ...prev, sunriseTime: Math.max(0, Math.min(23, hours)) })),
    setSunsetTime: (hours: number) => setConfig(prev => ({ ...prev, sunsetTime: Math.max(0, Math.min(23, hours)) }))
  };
}

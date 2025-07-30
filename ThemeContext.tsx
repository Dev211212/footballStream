"use client";

import React, { createContext, useEffect, useState, useRef } from 'react';

export type Theme = 'light' | 'dark';

export const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'light',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const manualTheme = useRef(false);

  useEffect(() => {
    // Load theme from localStorage or device
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setThemeState(storedTheme);
      manualTheme.current = true;
    } else {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setThemeState(mq.matches ? 'dark' : 'light');
      manualTheme.current = false;
    }
  }, []);

  useEffect(() => {
    // Listen for device theme changes only if not set manually
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!manualTheme.current) {
        setThemeState(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Set theme on html element for Tailwind and persist
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    manualTheme.current = true;
    localStorage.setItem('theme', newTheme);
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

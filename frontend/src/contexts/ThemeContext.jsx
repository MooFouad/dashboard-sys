import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeProvider = ({ children }) => {
  // Theme mode can be 'light', 'dark', or 'auto'
  const [themeMode, setThemeMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'auto';
  });

  // Resolved theme is the actual theme being applied ('light' or 'dark')
  const [resolvedTheme, setResolvedTheme] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode === 'auto' || !savedMode) {
      return getSystemTheme();
    }
    return savedMode;
  });

  // Listen for system theme changes when in auto mode
  useEffect(() => {
    if (themeMode !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Update resolved theme when mode changes
  useEffect(() => {
    if (themeMode === 'auto') {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(themeMode);
    }

    // Save mode to localStorage
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Apply theme to document root
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove previous theme
    root.classList.remove('light', 'dark');

    // Add current theme
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = (mode) => {
    if (['light', 'dark', 'auto'].includes(mode)) {
      setThemeMode(mode);
    }
  };

  const toggleTheme = () => {
    setThemeMode(prevMode => {
      if (prevMode === 'light') return 'dark';
      if (prevMode === 'dark') return 'auto';
      return 'light';
    });
  };

  const value = {
    themeMode,
    theme: resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isAuto: themeMode === 'auto'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

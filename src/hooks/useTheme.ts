import { useState, useEffect, useCallback } from 'react';
import { ThemeConfig } from '../types';
import { loadTheme, validateTheme } from '../utils';

export const useTheme = (initialTheme: string = 'tron') => {
  const [currentTheme, setCurrentTheme] = useState<string>(initialTheme);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null);
  const [availableThemes, setAvailableThemes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThemeConfig = useCallback(async (themeId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const config = await loadTheme(themeId);

      if (!validateTheme(config)) {
        throw new Error(`Invalid theme configuration for ${themeId}`);
      }

      setThemeConfig(config);
      setCurrentTheme(themeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load theme';
      setError(errorMessage);
      console.error('Theme loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchTheme = useCallback((themeId: string) => {
    if (availableThemes.includes(themeId)) {
      loadThemeConfig(themeId);
    } else {
      setError(`Theme ${themeId} is not available`);
    }
  }, [availableThemes, loadThemeConfig]);

  const cycleTheme = useCallback(() => {
    if (availableThemes.length === 0) return;

    const currentIndex = availableThemes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    const nextTheme = availableThemes[nextIndex];
    switchTheme(nextTheme);
  }, [availableThemes, currentTheme, switchTheme]);

  // Load available themes
  useEffect(() => {
    const loadAvailableThemes = async () => {
      try {
        // In a real implementation, this would fetch from the file system
        // For now, we'll use a hardcoded list
        const themes = ['tron', 'sysadmin', 'developer'];
        setAvailableThemes(themes);
      } catch (err) {
        console.error('Failed to load available themes:', err);
      }
    };

    loadAvailableThemes();
  }, []);

  // Load initial theme
  useEffect(() => {
    if (availableThemes.length > 0) {
      loadThemeConfig(initialTheme);
    }
  }, [availableThemes, initialTheme, loadThemeConfig]);

  return {
    currentTheme,
    themeConfig,
    availableThemes,
    isLoading,
    error,
    switchTheme,
    cycleTheme,
  };
};
import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themeConfig: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  theme: string;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme: initialTheme, children }) => {
  const [currentTheme, setCurrentTheme] = useState<string>(initialTheme);
  const [themeConfig, setThemeConfig] = useState<any>(null);

  useEffect(() => {
    // Load theme configuration
    const loadTheme = async () => {
      try {
        const response = await fetch(`/themes/${currentTheme}.json`);
        const config = await response.json();
        setThemeConfig(config);

        // Apply theme CSS variables to document root
        if (config.colors) {
          const root = document.documentElement;
          root.style.setProperty('--primary-color', config.colors.primary || '#00ff88');
          root.style.setProperty('--secondary-color', config.colors.secondary || '#0088ff');
          root.style.setProperty('--background-primary', config.colors.background || '#0a0a0a');
          root.style.setProperty('--background-secondary', config.colors.panel || '#1a1a2e');
          root.style.setProperty('--text-color', config.colors.text || '#ffffff');
          root.style.setProperty('--border-color', `rgba(${hexToRgb(config.colors.primary || '#00ff88')}, 0.3)`);
          root.style.setProperty('--button-background', `rgba(${hexToRgb(config.colors.primary || '#00ff88')}, 0.1)`);
          root.style.setProperty('--button-hover-background', `rgba(${hexToRgb(config.colors.primary || '#00ff88')}, 0.2)`);
          root.style.setProperty('--panel-background', `rgba(${hexToRgb(config.colors.background || '#0a0a0a')}, 0.1)`);
          root.style.setProperty('--panel-background-primary', `rgba(${hexToRgb(config.colors.panel || '#1a1a2e')}, 0.8)`);
          root.style.setProperty('--panel-background-secondary', `rgba(${hexToRgb(config.colors.panel || '#1a1a2e')}, 0.9)`);
        }
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    };

    loadTheme();
  }, [currentTheme]);

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `${r}, ${g}, ${b}`;
    }
    return '0, 255, 136'; // fallback
  };

  const setTheme = (newTheme: string) => {
    setCurrentTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, setTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
};
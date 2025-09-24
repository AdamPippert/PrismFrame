import { useEffect, useCallback } from "react";
import { getCurrent } from "@tauri-apps/api/window";
import { useTheme } from "../contexts/ThemeContext";

interface HotkeyManagerProps {
  onThemeSwitch: (theme: string) => void;
}

const HotkeyManager: React.FC<HotkeyManagerProps> = ({ onThemeSwitch }) => {
  const { theme } = useTheme();

  const toggleFullscreen = useCallback(async () => {
    try {
      const window = getCurrent();
      const isFullscreen = await window.isFullscreen();
      await window.setFullscreen(!isFullscreen);
    } catch (error) {
      console.error("Failed to toggle fullscreen:", error);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Shift+T for theme switching
      if (event.ctrlKey && event.shiftKey && event.key === "T") {
        event.preventDefault();
        const themes = ["tron", "cyberpunk", "minimal", "sysadmin", "developer"];
        const currentIndex = themes.indexOf(theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        onThemeSwitch(nextTheme);
      }

      // Ctrl+Shift+F for fullscreen toggle
      if (event.ctrlKey && event.shiftKey && event.key === "F") {
        event.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [theme, onThemeSwitch, toggleFullscreen]);

  return null; // This component doesn't render anything
};

export default HotkeyManager;
import React from "react";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const themes = [
    { id: "classic-edex-ui", name: "Classic eDEX-UI" },
    { id: "cyberpunk", name: "Cyberpunk" },
    { id: "minimal", name: "Minimal" },
    { id: "sysadmin", name: "SysAdmin" },
    { id: "developer", name: "Developer" },
  ];

  return (
    <div className="theme-selector">
      <select
        value={currentTheme}
        onChange={(e) => onThemeChange(e.target.value)}
        className="theme-dropdown"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelector;
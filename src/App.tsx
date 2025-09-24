import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { getCurrent } from "@tauri-apps/api/window";
import TerminalTabs from "./components/TerminalTabs";
import SystemMonitor from "./components/SystemMonitor";
import ThemeSelector from "./components/ThemeSelector";
import HotkeyManager from "./components/HotkeyManager";
import FileExplorer from "./components/FileExplorer";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./styles/App.css";

function App() {
  const [currentTheme, setCurrentTheme] = useState("tron");
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    try {
      const window = getCurrent();
      const currentFullscreen = await window.isFullscreen();
      await window.setFullscreen(!currentFullscreen);
      setIsFullscreen(!currentFullscreen);
    } catch (error) {
      console.error("Failed to toggle fullscreen:", error);
    }
  };

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const info = await invoke("get_system_info");
        setSystemInfo(JSON.parse(info as string));
      } catch (error) {
        console.error("Failed to fetch system info:", error);
      }
    };

    const interval = setInterval(fetchSystemInfo, 1000);
    fetchSystemInfo();

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={currentTheme}>
      <HotkeyManager onThemeSwitch={setCurrentTheme} />
      <div className="app">
        <div className="header">
          <h1>PrismFrame</h1>
          <div className="header-controls">
            <button
              className="fullscreen-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen (Ctrl+Shift+F)" : "Enter Fullscreen (Ctrl+Shift+F)"}
            >
              {isFullscreen ? "⛶" : "⛶"}
            </button>
             <ThemeSelector currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
          </div>
        </div>

        <div className="main-content">
          <div className="left-panel">
            <SystemMonitor data={systemInfo} />
          </div>

           <div className="center-panel">
             <TerminalTabs />
           </div>

           <div className="right-panel">
             <FileExplorer />
           </div>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
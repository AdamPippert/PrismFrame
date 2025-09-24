// Theme types
export interface ThemeConfig {
  name: string;
  description?: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    panel: string;
    text: string;
    border: string;
    accent?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  fonts: {
    main: string;
    size: string;
  };
  terminal?: {
    background: string;
    foreground: string;
    cursor: string;
    selection: string;
  };
  layout?: {
    panels: string[];
    [key: string]: any;
  };
  animations?: {
    glow?: boolean;
    scanlines?: boolean;
    fade?: boolean;
    pulse?: boolean;
  };
}

// System monitoring types
export interface SystemInfo {
  cpu: {
    usage: number;
    cores: number;
    temperature?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    rx: number;
    tx: number;
  };
  disk?: {
    used: number;
    total: number;
    percentage: number;
  };
}

// Terminal types
export interface TerminalTab {
  id: string;
  title: string;
  processId?: number;
  cwd?: string;
  shell?: string;
}

// Hotkey types
export interface HotkeyBinding {
  id: string;
  key: string;
  modifiers: string[];
  action: string;
  description: string;
  enabled: boolean;
}

// Plugin types
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  permissions: string[];
  dependencies?: Record<string, string>;
}

// Application state types
export interface AppState {
  currentTheme: string;
  themes: Record<string, ThemeConfig>;
  systemInfo: SystemInfo | null;
  terminalTabs: TerminalTab[];
  activeTabId: string | null;
  hotkeys: HotkeyBinding[];
  plugins: PluginManifest[];
  settings: {
    fullscreen: boolean;
    showSystemMonitor: boolean;
    terminalFontSize: number;
    [key: string]: any;
  };
}

// IPC command types
export type IpcCommand =
  | { type: 'get_system_info' }
  | { type: 'execute_command'; command: string; cwd?: string }
  | { type: 'spawn_terminal'; shell?: string; cwd?: string }
  | { type: 'kill_process'; pid: number }
  | { type: 'get_themes' }
  | { type: 'load_theme'; themeId: string }
  | { type: 'get_settings' }
  | { type: 'save_settings'; settings: Partial<AppState['settings']> };

export type IpcResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};
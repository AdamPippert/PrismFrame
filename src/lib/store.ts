import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { AppState, SystemInfo, TerminalTab, HotkeyBinding, PluginManifest } from '../types';

interface AppStore extends AppState {
  // Actions
  setCurrentTheme: (theme: string) => void;
  setSystemInfo: (info: SystemInfo) => void;
  addTerminalTab: (tab: TerminalTab) => void;
  removeTerminalTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTerminalTab: (tabId: string, updates: Partial<TerminalTab>) => void;
  addHotkey: (hotkey: HotkeyBinding) => void;
  removeHotkey: (hotkeyId: string) => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  addPlugin: (plugin: PluginManifest) => void;
  removePlugin: (pluginId: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const initialState: AppState = {
  currentTheme: 'tron',
  themes: {},
  systemInfo: null,
  terminalTabs: [],
  activeTabId: null,
  hotkeys: [
    {
      id: 'theme-switch',
      key: 'T',
      modifiers: ['Control', 'Shift'],
      action: 'cycle_theme',
      description: 'Switch between themes',
      enabled: true,
    },
    {
      id: 'fullscreen-toggle',
      key: 'F',
      modifiers: ['Control', 'Shift'],
      action: 'toggle_fullscreen',
      description: 'Toggle fullscreen mode',
      enabled: true,
    },
    {
      id: 'new-tab',
      key: 'N',
      modifiers: ['Control', 'Shift'],
      action: 'new_terminal_tab',
      description: 'Create new terminal tab',
      enabled: true,
    },
    {
      id: 'close-tab',
      key: 'W',
      modifiers: ['Control', 'Shift'],
      action: 'close_terminal_tab',
      description: 'Close current terminal tab',
      enabled: true,
    },
    {
      id: 'next-tab',
      key: 'Tab',
      modifiers: ['Control'],
      action: 'next_terminal_tab',
      description: 'Switch to next terminal tab',
      enabled: true,
    },
  ],
  plugins: [],
  settings: {
    fullscreen: false,
    showSystemMonitor: true,
    terminalFontSize: 14,
  },
};

export const useAppStore = create<AppStore>()(
  subscribeWithSelector((set: any) => ({
    ...initialState,

    setCurrentTheme: (theme: string) => {
      set({ currentTheme: theme });
    },

    setSystemInfo: (info: SystemInfo) => {
      set({ systemInfo: info });
    },

    addTerminalTab: (tab: TerminalTab) => {
      set((state: AppStore) => ({
        terminalTabs: [...state.terminalTabs, tab],
        activeTabId: state.activeTabId || tab.id,
      }));
    },

    removeTerminalTab: (tabId: string) => {
      set((state: AppStore) => {
        const newTabs = state.terminalTabs.filter((tab: TerminalTab) => tab.id !== tabId);
        const newActiveId = state.activeTabId === tabId
          ? (newTabs.length > 0 ? newTabs[0].id : null)
          : state.activeTabId;

        return {
          terminalTabs: newTabs,
          activeTabId: newActiveId,
        };
      });
    },

    setActiveTab: (tabId: string) => {
      set({ activeTabId: tabId });
    },

    updateTerminalTab: (tabId: string, updates: Partial<TerminalTab>) => {
      set((state: AppStore) => ({
        terminalTabs: state.terminalTabs.map((tab: TerminalTab) =>
          tab.id === tabId ? { ...tab, ...updates } : tab
        ),
      }));
    },

    addHotkey: (hotkey: HotkeyBinding) => {
      set((state: AppStore) => ({
        hotkeys: [...state.hotkeys, hotkey],
      }));
    },

    removeHotkey: (hotkeyId: string) => {
      set((state: AppStore) => ({
        hotkeys: state.hotkeys.filter((hotkey: HotkeyBinding) => hotkey.id !== hotkeyId),
      }));
    },

    updateSettings: (settings: Partial<AppState['settings']>) => {
      set((state: AppStore) => ({
        settings: { ...state.settings, ...settings },
      }));
    },

    addPlugin: (plugin: PluginManifest) => {
      set((state: AppStore) => ({
        plugins: [...state.plugins, plugin],
      }));
    },

    removePlugin: (pluginId: string) => {
      set((state: AppStore) => ({
        plugins: state.plugins.filter((plugin: PluginManifest) => plugin.id !== pluginId),
      }));
    },

    setError: (error: string | null) => {
      set({ error });
    },

    setLoading: (loading: boolean) => {
      set({ loading });
    },
  }))
);

// Selectors for commonly used state
export const useCurrentTheme = () => useAppStore((state) => state.currentTheme);
export const useSystemInfo = () => useAppStore((state) => state.systemInfo);
export const useTerminalTabs = () => useAppStore((state) => state.terminalTabs);
export const useActiveTabId = () => useAppStore((state) => state.activeTabId);
export const useHotkeys = () => useAppStore((state) => state.hotkeys);
export const useSettings = () => useAppStore((state) => state.settings);
export const usePlugins = () => useAppStore((state) => state.plugins);

// Action selectors
export const useThemeActions = () => useAppStore((state) => ({
  setCurrentTheme: state.setCurrentTheme,
}));

export const useTerminalActions = () => useAppStore((state) => ({
  addTerminalTab: state.addTerminalTab,
  removeTerminalTab: state.removeTerminalTab,
  setActiveTab: state.setActiveTab,
  updateTerminalTab: state.updateTerminalTab,
}));

export const useHotkeyActions = () => useAppStore((state) => ({
  addHotkey: state.addHotkey,
  removeHotkey: state.removeHotkey,
}));

export const useSettingsActions = () => useAppStore((state) => ({
  updateSettings: state.updateSettings,
}));

export const usePluginActions = () => useAppStore((state) => ({
  addPlugin: state.addPlugin,
  removePlugin: state.removePlugin,
}));
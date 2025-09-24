import { useState, useEffect, useRef, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { TerminalTab } from '../types';

export const useTerminal = () => {
  const [tabs, setTabs] = useState<TerminalTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const terminalRefs = useRef<Map<string, any>>(new Map());

  const createTab = useCallback(async (shell?: string, cwd?: string) => {
    setIsLoading(true);
    try {
      const tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const pid = await invoke('spawn_terminal', { shell, cwd });

      const newTab: TerminalTab = {
        id: tabId,
        title: `Terminal ${tabs.length + 1}`,
        processId: pid as number,
        cwd,
        shell,
      };

      setTabs(prev => [...prev, newTab]);
      setActiveTabId(tabId);
    } catch (error) {
      console.error('Failed to create terminal tab:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tabs.length]);

  const closeTab = useCallback(async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab || !tab.processId) return;

    try {
      await invoke('kill_process', { pid: tab.processId });
      setTabs(prev => prev.filter(t => t.id !== tabId));

      // If closing active tab, switch to another tab
      if (activeTabId === tabId) {
        const remainingTabs = tabs.filter(t => t.id !== tabId);
        setActiveTabId(remainingTabs.length > 0 ? remainingTabs[0].id : null);
      }
    } catch (error) {
      console.error('Failed to close terminal tab:', error);
    }
  }, [tabs, activeTabId]);

  const switchTab = useCallback((tabId: string) => {
    if (tabs.find(t => t.id === tabId)) {
      setActiveTabId(tabId);
    }
  }, [tabs]);

  const executeCommand = useCallback(async (command: string, tabId?: string) => {
    const targetTabId = tabId || activeTabId;
    if (!targetTabId) return;

    const tab = tabs.find(t => t.id === targetTabId);
    if (!tab) return;

    try {
      await invoke('execute_command', {
        command,
        cwd: tab.cwd
      });
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  }, [tabs, activeTabId]);

  const updateTabTitle = useCallback((tabId: string, title: string) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, title } : tab
    ));
  }, []);

  // Initialize with one tab
  useEffect(() => {
    if (tabs.length === 0) {
      createTab();
    }
  }, [tabs.length, createTab]);

  return {
    tabs,
    activeTabId,
    isLoading,
    createTab,
    closeTab,
    switchTab,
    executeCommand,
    updateTabTitle,
    terminalRefs: terminalRefs.current,
  };
};
import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { SystemInfo } from '../types';
import { throttle } from '../utils';

export const useSystemMonitor = (updateInterval: number = 1000) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemInfo = useCallback(async () => {
    try {
      setError(null);
      const info = await invoke('get_system_info');
      const parsedInfo = JSON.parse(info as string) as SystemInfo;
      setSystemInfo(parsedInfo);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch system info';
      setError(errorMessage);
      setIsLoading(false);
    }
  }, []);

  const throttledFetch = useCallback(
    throttle(fetchSystemInfo, updateInterval),
    [fetchSystemInfo, updateInterval]
  );

  useEffect(() => {
    // Initial fetch
    fetchSystemInfo();

    // Set up interval for continuous monitoring
    const interval = setInterval(throttledFetch, updateInterval);

    return () => {
      clearInterval(interval);
    };
  }, [fetchSystemInfo, throttledFetch, updateInterval]);

  const refresh = useCallback(() => {
    fetchSystemInfo();
  }, [fetchSystemInfo]);

  return {
    systemInfo,
    isLoading,
    error,
    refresh,
  };
};
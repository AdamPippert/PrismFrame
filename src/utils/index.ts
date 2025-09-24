/**
 * Utility functions for Modern eDEX-UI
 */

// Theme utilities
export const loadTheme = async (themeId: string): Promise<any> => {
  try {
    const response = await fetch(`/themes/${themeId}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load theme: ${themeId}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Theme loading error:', error);
    throw error;
  }
};

export const validateTheme = (theme: any): boolean => {
  const required = ['name', 'colors', 'fonts'];
  return required.every(key => theme.hasOwnProperty(key));
};

// System info utilities
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatFrequency = (hz: number): string => {
  if (hz >= 1000000000) {
    return `${(hz / 1000000000).toFixed(1)} GHz`;
  } else if (hz >= 1000000) {
    return `${(hz / 1000000).toFixed(1)} MHz`;
  } else if (hz >= 1000) {
    return `${(hz / 1000).toFixed(1)} KHz`;
  }
  return `${hz} Hz`;
};

// Hotkey utilities
export const parseHotkey = (hotkey: string): { key: string; modifiers: string[] } => {
  const parts = hotkey.split('+');
  const key = parts.pop() || '';
  const modifiers = parts;
  return { key, modifiers };
};

export const formatHotkey = (key: string, modifiers: string[]): string => {
  return [...modifiers, key].join('+');
};

export const normalizeHotkey = (hotkey: string): string => {
  return hotkey.toLowerCase().replace(/\s+/g, '');
};

// Terminal utilities
export const detectShell = (): string => {
  const platform = navigator.platform.toLowerCase();
  if (platform.includes('win')) {
    return 'powershell.exe';
  } else if (platform.includes('darwin')) {
    return 'zsh';
  } else {
    return 'bash';
  }
};

export const generateTerminalTitle = (cwd?: string, shell?: string): string => {
  const shellName = shell || detectShell();
  const dir = cwd || '~';
  return `${shellName} - ${dir}`;
};

// Validation utilities
export const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Color utilities
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

// File system utilities
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const getFileIcon = (filename: string): string => {
  const ext = getFileExtension(filename).toLowerCase();
  const iconMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'react',
    'tsx': 'react',
    'py': 'python',
    'rs': 'rust',
    'go': 'go',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'html': 'html',
    'css': 'css',
    'scss': 'sass',
    'json': 'json',
    'md': 'markdown',
    'txt': 'text',
    'png': 'image',
    'jpg': 'image',
    'jpeg': 'image',
    'gif': 'image',
    'svg': 'image',
  };
  return iconMap[ext] || 'file';
};

// Error handling utilities
export const createErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === 'object' && error.message) {
    return error.message;
  }
  return 'An unknown error occurred';
};

export const logError = (error: any, context?: string): void => {
  const message = createErrorMessage(error);
  const contextMsg = context ? `[${context}] ` : '';
  console.error(`${contextMsg}Error: ${message}`, error);
};
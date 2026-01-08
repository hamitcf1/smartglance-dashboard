/**
 * Error Handling and Utility Functions
 * Provides consistent error handling across the application
 */

export interface ErrorResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Safe async wrapper to prevent unhandled promise rejections
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  defaultValue?: T
): Promise<ErrorResult<T>> {
  try {
    const result = await fn();
    return { success: true, data: result };
  } catch (error) {
    console.error('Async operation failed:', error);
    return {
      success: false,
      data: defaultValue,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000
): Promise<ErrorResult<T>> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fn();
      return { success: true, data: result };
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('Retry failed after', maxRetries, 'attempts:', lastError);
  return {
    success: false,
    error: lastError instanceof Error ? lastError.message : 'Max retries exceeded',
  };
}

/**
 * Debounce function with cancel capability
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): { (...args: Parameters<T>): void; cancel(): void } {
  let timeoutId: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delayMs);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let lastCallTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCallTime >= delayMs) {
      fn(...args);
      lastCallTime = now;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args);
        lastCallTime = Date.now();
        timeoutId = null;
      }, delayMs - (now - lastCallTime));
    }
  };
}

/**
 * Local storage with type safety
 */
export const safeLocalStorage = {
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue ?? null;
    } catch (error) {
      console.error(`Failed to get localStorage item: ${key}`, error);
      return defaultValue ?? null;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set localStorage item: ${key}`, error);
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove localStorage item: ${key}`, error);
      return false;
    }
  },

  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage', error);
      return false;
    }
  },
};

/**
 * Session storage with type safety
 */
export const safeSessionStorage = {
  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue ?? null;
    } catch (error) {
      console.error(`Failed to get sessionStorage item: ${key}`, error);
      return defaultValue ?? null;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Failed to set sessionStorage item: ${key}`, error);
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove sessionStorage item: ${key}`, error);
      return false;
    }
  },

  clear(): boolean {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear sessionStorage', error);
      return false;
    }
  },
};

/**
 * Validation utilities
 */
export const validators = {
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidPassword(password: string, minLength = 6): boolean {
    return password.length >= minLength;
  },

  isValidUsername(username: string, minLength = 3): boolean {
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    return username.length >= minLength && usernameRegex.test(username);
  },

  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Format utilities
 */
export const formatters = {
  formatDate(date: Date | string, format = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'Invalid date';

    if (format === 'short') {
      return d.toLocaleDateString();
    } else if (format === 'long') {
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (format === 'time') {
      return d.toLocaleTimeString();
    } else if (format === 'iso') {
      return d.toISOString();
    }
    return d.toString();
  },

  formatTime(ms: number): string {
    if (ms < 0) return '0s';
    if (ms < 1000) return Math.round(ms) + 'ms';
    if (ms < 60000) return Math.round(ms / 1000) + 's';
    if (ms < 3600000) return Math.round(ms / 60000) + 'm';
    return Math.round(ms / 3600000) + 'h';
  },

  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  formatNumber(num: number, decimals = 2): string {
    return num.toFixed(decimals);
  },
};

/**
 * Array utilities
 */
export const arrayUtils = {
  chunk<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  flatten<T>(arr: any[]): T[] {
    return arr.reduce((flat, toFlatten) => {
      return flat.concat(Array.isArray(toFlatten) ? arrayUtils.flatten<T>(toFlatten) : toFlatten);
    }, []);
  },

  unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  },

  groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
    return arr.reduce((acc, item) => {
      const k = String(item[key]);
      if (!acc[k]) acc[k] = [];
      acc[k].push(item);
      return acc;
    }, {} as Record<string, T[]>);
  },
};

/**
 * Object utilities
 */
export const objectUtils = {
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  },

  merge<T extends object>(target: T, ...sources: Partial<T>[]): T {
    return sources.reduce((acc, src) => Object.assign(acc, src), target) as T;
  },

  omit<T extends object>(obj: T, keys: (keyof T)[]): Partial<T> {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  },

  pick<T extends object>(obj: T, keys: (keyof T)[]): Partial<T> {
    return keys.reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {} as Partial<T>);
  },
};

/**
 * Sleep utility for async code
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Safe JSON parse/stringify
 */
export const safeJson = {
  parse<T = any>(json: string, defaultValue?: T): T {
    try {
      return JSON.parse(json);
    } catch {
      return defaultValue as T;
    }
  },

  stringify<T = any>(obj: T, defaultValue = '{}'): string {
    try {
      return JSON.stringify(obj);
    } catch {
      return defaultValue;
    }
  },
};

/**
 * Performance monitoring
 */
export const performanceUtils = {
  measure<T>(label: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },
};

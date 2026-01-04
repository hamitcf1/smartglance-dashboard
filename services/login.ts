/**
 * Simple login service that handles username/password authentication
 * Credentials are stored encrypted in localStorage
 */

const STORAGE_KEY = 'smart-glance-credentials';
const AUTH_KEY = 'smart-glance-auth-session';

// Simple encryption/decryption (Base64) - for production, use proper encryption
const encrypt = (text: string): string => {
  return btoa(text);
};

const decrypt = (text: string): string => {
  try {
    return atob(text);
  } catch {
    return '';
  }
};

export interface AuthSession {
  username: string;
  timestamp: number;
  expiresAt: number;
}

export const loginService = {
  /**
   * Set the master password/credentials
   */
  setCredentials(username: string, password: string): void {
    const credentials = { username, password };
    const encrypted = encrypt(JSON.stringify(credentials));
    localStorage.setItem(STORAGE_KEY, encrypted);
  },

  /**
   * Verify login credentials
   */
  verifyLogin(username: string, password: string): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return false;

      const decrypted = decrypt(stored);
      const credentials = JSON.parse(decrypted);

      return credentials.username === username && credentials.password === password;
    } catch {
      return false;
    }
  },

  /**
   * Create an authenticated session (24 hour expiry)
   */
  createSession(username: string): void {
    const now = Date.now();
    const session: AuthSession = {
      username,
      timestamp: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  },

  /**
   * Get current session if valid
   */
  getSession(): AuthSession | null {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (!stored) return null;

      const session: AuthSession = JSON.parse(stored);

      // Check if session has expired
      if (Date.now() > session.expiresAt) {
        loginService.clearSession();
        return null;
      }

      return session;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return loginService.getSession() !== null;
  },

  /**
   * Logout and clear session
   */
  clearSession(): void {
    localStorage.removeItem(AUTH_KEY);
  },

  /**
   * Check if credentials have been set up
   */
  hasCredentials(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  },

  /**
   * Reset all authentication data
   */
  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTH_KEY);
  },
};

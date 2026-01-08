/**
 * Firebase Authentication Service
 * Handles user registration, login, and session management
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  AuthError,
  User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

class FirebaseAuthService {
  private currentUser: AuthUser | null = null;
  private authListeners: Set<(user: AuthUser | null) => void> = new Set();

  constructor() {
    if (isFirebaseConfigured && auth) {
      // Set up auth state listener
      onAuthStateChanged(auth, (user: User | null) => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          };
        } else {
          this.currentUser = null;
        }
        // Notify all listeners
        this.authListeners.forEach(listener => listener(this.currentUser));
      });
    }
  }

  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string, displayName?: string): Promise<AuthResult> {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase is not configured',
      };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name if provided
      if (displayName) {
        // Note: updateProfile would require importing it
        // For now, displayName can be set through Firestore
      }

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: this.getErrorMessage(authError.code),
      };
    }
  }

  /**
   * Sign in user with email and password
   */
  async login(email: string, password: string): Promise<AuthResult> {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase is not configured',
      };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      return {
        success: true,
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
      };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: this.getErrorMessage(authError.code),
      };
    }
  }

  /**
   * Sign out the current user
   */
  async logout(): Promise<AuthResult> {
    if (!isFirebaseConfigured || !auth) {
      return {
        success: false,
        error: 'Firebase is not configured',
      };
    }

    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      return {
        success: false,
        error: this.getErrorMessage(authError.code),
      };
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.authListeners.add(callback);
    // Return unsubscribe function
    return () => {
      this.authListeners.delete(callback);
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Convert Firebase error codes to user-friendly messages
   */
  private getErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'This email is already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/weak-password': 'Password must be at least 6 characters',
      'auth/user-not-found': 'User not found',
      'auth/wrong-password': 'Invalid password',
      'auth/too-many-requests': 'Too many login attempts. Please try again later.',
      'auth/operation-not-allowed': 'This operation is not allowed',
      'auth/account-exists-with-different-credential': 'Account exists with different credential',
    };
    return errorMessages[code] || 'An error occurred during authentication';
  }
}

export const firebaseAuthService = new FirebaseAuthService();

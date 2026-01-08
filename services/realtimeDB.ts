/**
 * Realtime Database Service
 * Manages dashboard layout, widget configurations, and real-time synchronization
 */

import {
  ref,
  set,
  get,
  update,
  onValue,
  off,
  Unsubscribe,
} from 'firebase/database';
import { rtdb, isFirebaseConfigured } from './firebase';
import { WidgetInstance, WidgetConfig } from '../types';

export interface DashboardState {
  widgets: WidgetInstance[];
  configs: Record<string, WidgetConfig>;
  updatedAt: number;
}

class RealtimeDBService {
  private listeners: Map<string, Unsubscribe> = new Map();
  private localCache: Map<string, any> = new Map();

  /**
   * Save dashboard state for user
   */
  async saveDashboardState(uid: string, widgets: WidgetInstance[], configs: Record<string, WidgetConfig>): Promise<boolean> {
    if (!isFirebaseConfigured || !rtdb) {
      console.warn('Realtime Database is not configured');
      return false;
    }

    try {
      const dashboardRef = ref(rtdb, `dashboards/${uid}`);
      const state: DashboardState = {
        widgets,
        configs,
        updatedAt: Date.now(),
      };

      await set(dashboardRef, state);
      this.localCache.set(uid, state);
      return true;
    } catch (error) {
      console.error('Error saving dashboard state:', error);
      return false;
    }
  }

  /**
   * Get dashboard state for user
   */
  async getDashboardState(uid: string): Promise<DashboardState | null> {
    if (!isFirebaseConfigured || !rtdb) {
      console.warn('Realtime Database is not configured');
      return null;
    }

    try {
      const dashboardRef = ref(rtdb, `dashboards/${uid}`);
      const snapshot = await get(dashboardRef);

      if (snapshot.exists()) {
        const state = snapshot.val() as DashboardState;
        this.localCache.set(uid, state);
        return state;
      }
      return null;
    } catch (error) {
      console.error('Error getting dashboard state:', error);
      return null;
    }
  }

  /**
   * Update widgets in dashboard
   */
  async updateWidgets(uid: string, widgets: WidgetInstance[]): Promise<boolean> {
    if (!isFirebaseConfigured || !rtdb) {
      console.warn('Realtime Database is not configured');
      return false;
    }

    try {
      const dashboardRef = ref(rtdb, `dashboards/${uid}`);
      await update(dashboardRef, {
        widgets,
        updatedAt: Date.now(),
      });

      // Update cache
      const cached = this.localCache.get(uid) || {};
      this.localCache.set(uid, { ...cached, widgets, updatedAt: Date.now() });
      return true;
    } catch (error) {
      console.error('Error updating widgets:', error);
      return false;
    }
  }

  /**
   * Update widget configurations
   */
  async updateConfigs(uid: string, configs: Record<string, WidgetConfig>): Promise<boolean> {
    if (!isFirebaseConfigured || !rtdb) {
      console.warn('Realtime Database is not configured');
      return false;
    }

    try {
      const dashboardRef = ref(rtdb, `dashboards/${uid}`);
      await update(dashboardRef, {
        configs,
        updatedAt: Date.now(),
      });

      // Update cache
      const cached = this.localCache.get(uid) || {};
      this.localCache.set(uid, { ...cached, configs, updatedAt: Date.now() });
      return true;
    } catch (error) {
      console.error('Error updating configs:', error);
      return false;
    }
  }

  /**
   * Update a single widget configuration
   */
  async updateWidgetConfig(uid: string, widgetId: string, config: WidgetConfig): Promise<boolean> {
    if (!isFirebaseConfigured || !rtdb) {
      console.warn('Realtime Database is not configured');
      return false;
    }

    try {
      const configRef = ref(rtdb, `dashboards/${uid}/configs/${widgetId}`);
      await set(configRef, config);

      // Update cache
      const cached = this.localCache.get(uid) || {};
      const updatedConfigs = { ...(cached.configs || {}), [widgetId]: config };
      this.localCache.set(uid, { ...cached, configs: updatedConfigs, updatedAt: Date.now() });
      return true;
    } catch (error) {
      console.error('Error updating widget config:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time dashboard updates
   */
  onDashboardChange(uid: string, callback: (state: DashboardState) => void): () => void {
    if (!isFirebaseConfigured || !rtdb) {
      console.warn('Realtime Database is not configured');
      return () => {}; // Return empty unsubscribe function
    }

    try {
      const dashboardRef = ref(rtdb, `dashboards/${uid}`);

      const unsubscribe = onValue(
        dashboardRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const state = snapshot.val() as DashboardState;
            this.localCache.set(uid, state);
            callback(state);
          }
        },
        (error) => {
          console.error('Error listening to dashboard changes:', error);
        }
      );

      // Store unsubscribe function
      this.listeners.set(uid, unsubscribe);

      // Return unsubscribe function
      return () => {
        unsubscribe();
        this.listeners.delete(uid);
      };
    } catch (error) {
      console.error('Error setting up dashboard listener:', error);
      return () => {};
    }
  }

  /**
   * Unsubscribe from dashboard updates
   */
  unsubscribe(uid: string): void {
    const unsubscribe = this.listeners.get(uid);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(uid);
    }
  }

  /**
   * Unsubscribe from all listeners
   */
  unsubscribeAll(): void {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }

  /**
   * Clear local cache
   */
  clearCache(): void {
    this.localCache.clear();
  }

  /**
   * Get cached state (synchronous)
   */
  getCachedState(uid: string): DashboardState | null {
    return this.localCache.get(uid) || null;
  }
}

export const realtimeDBService = new RealtimeDBService();

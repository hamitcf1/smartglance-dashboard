/**
 * Firestore User Data Service
 * Manages user profile, settings, and widget templates
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { UserSettings } from '../types';

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  widgets: any[];
  configs: Record<string, any>;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  settings: UserSettings;
  defaultTemplate: string;
  createdAt: Date;
  updatedAt: Date;
}

class FirestoreUserService {
  private static readonly USERS_COLLECTION = 'users';
  private static readonly TEMPLATES_COLLECTION = 'templates';

  /**
   * Create or update user profile
   */
  async createOrUpdateUserProfile(uid: string, data: Partial<UserProfile>): Promise<boolean> {
    if (!isFirebaseConfigured || !db) {
      console.warn('Firestore is not configured');
      return false;
    }

    try {
      const userRef = doc(db, FirestoreUserService.USERS_COLLECTION, uid);
      const now = Timestamp.now();

      await setDoc(userRef, {
        ...data,
        uid,
        updatedAt: now,
        createdAt: data.createdAt || now,
      }, { merge: true });

      return true;
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      return false;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!isFirebaseConfigured || !db) {
      console.warn('Firestore is not configured');
      return null;
    }

    try {
      const userRef = doc(db, FirestoreUserService.USERS_COLLECTION, uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(uid: string, settings: Partial<UserSettings>): Promise<boolean> {
    if (!isFirebaseConfigured || !db) {
      console.warn('Firestore is not configured');
      return false;
    }

    try {
      const userRef = doc(db, FirestoreUserService.USERS_COLLECTION, uid);
      await updateDoc(userRef, {
        settings,
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
  }

  /**
   * Save a dashboard template for user
   */
  async saveTemplate(
    uid: string,
    template: Omit<DashboardTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string | null> {
    if (!isFirebaseConfigured || !db) {
      console.warn('Firestore is not configured');
      return null;
    }

    try {
      const now = Timestamp.now();
      const templateId = `${uid}_${Date.now()}`;
      const templateRef = doc(db, FirestoreUserService.USERS_COLLECTION, uid, FirestoreUserService.TEMPLATES_COLLECTION, templateId);

      await setDoc(templateRef, {
        ...template,
        id: templateId,
        createdAt: now,
        updatedAt: now,
      });

      return templateId;
    } catch (error) {
      console.error('Error saving template:', error);
      return null;
    }
  }

  /**
   * Get all templates for user
   */
  async getUserTemplates(uid: string): Promise<DashboardTemplate[]> {
    if (!isFirebaseConfigured || !db) {
      console.warn('Firestore is not configured');
      return [];
    }

    try {
      const templatesRef = collection(db, FirestoreUserService.USERS_COLLECTION, uid, FirestoreUserService.TEMPLATES_COLLECTION);
      const snapshot = await getDocs(templatesRef);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as DashboardTemplate;
      });
    } catch (error) {
      console.error('Error getting user templates:', error);
      return [];
    }
  }

  /**
   * Get a specific template
   */
  async getTemplate(uid: string, templateId: string): Promise<DashboardTemplate | null> {
    if (!isFirebaseConfigured || !db) {
      console.warn('Firestore is not configured');
      return null;
    }

    try {
      const templateRef = doc(db, FirestoreUserService.USERS_COLLECTION, uid, FirestoreUserService.TEMPLATES_COLLECTION, templateId);
      const docSnap = await getDoc(templateRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as DashboardTemplate;
      }
      return null;
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(uid: string, templateId: string, updates: Partial<DashboardTemplate>): Promise<boolean> {
    if (!isFirebaseConfigured || !db) {
      console.warn('Firestore is not configured');
      return false;
    }

    try {
      const templateRef = doc(db, FirestoreUserService.USERS_COLLECTION, uid, FirestoreUserService.TEMPLATES_COLLECTION, templateId);
      await updateDoc(templateRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      return true;
    } catch (error) {
      console.error('Error updating template:', error);
      return false;
    }
  }

  /**
   * Delete a template
   */
  async deleteTemplate(uid: string, templateId: string): Promise<boolean> {
    if (!isFirebaseConfigured || !db) {
      console.warn('Firestore is not configured');
      return false;
    }

    try {
      const templateRef = doc(db, FirestoreUserService.USERS_COLLECTION, uid, FirestoreUserService.TEMPLATES_COLLECTION, templateId);
      await deleteDoc(templateRef);
      return true;
    } catch (error) {
      console.error('Error deleting template:', error);
      return false;
    }
  }
}

// Add missing import
import { deleteDoc } from 'firebase/firestore';

export const firestoreUserService = new FirestoreUserService();

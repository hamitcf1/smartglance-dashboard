# SmartGlance Dashboard - Setup Instructions

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Firebase Setup](#firebase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Running the App](#running-the-app)
5. [Troubleshooting](#troubleshooting)
6. [Features Overview](#features-overview)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Firebase account (free tier available)

### Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Firebase** (see [Firebase Setup](#firebase-setup))

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Fill in your Firebase credentials in .env
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   Navigate to `http://localhost:5173`

---

## 🔥 Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Create a project"**
3. Enter project name: `smartglance-dashboard`
4. Choose your region (closest to you)
5. Click **"Create project"**
6. Wait for setup to complete

### Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"**
3. Select **Email/Password** provider
4. Click the toggle to **Enable**
5. Click **"Save"**

### Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click **"Create database"**
3. Select **Start in production mode**
4. Choose your region (same as project)
5. Click **"Create"**

#### Update Firestore Security Rules

1. Click **"Rules"** tab
2. Replace with:
   ```firestore
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth.uid == userId;
         match /templates/{templateId} {
           allow read, write: if request.auth.uid == userId;
         }
       }
     }
   }
   ```
3. Click **"Publish"**

### Step 4: Create Realtime Database

1. Go to **Realtime Database**
2. Click **"Create Database"**
3. Choose your region
4. Start with **Test mode** (we'll secure later)
5. Click **"Enable"**

#### Update Realtime Database Rules

1. Click **"Rules"** tab
2. Replace with:
   ```json
   {
     "rules": {
       "dashboards": {
         "$uid": {
           ".read": "auth.uid === $uid",
           ".write": "auth.uid === $uid"
         }
       }
     }
   }
   ```
3. Click **"Publish"**

### Step 5: Get Firebase Credentials

1. Go to **Project Settings** (gear icon)
2. Click on your web app (or **"Add app"** if none)
3. Copy the configuration object:
   ```javascript
   {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
     databaseURL: "..." // Important for Realtime DB
   }
   ```

---

## 📝 Environment Configuration

### Create `.env` File

1. Copy the template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials:
   ```env
   # From your Firebase Project Settings
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=smartglance-xxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=smartglance-xxx
   VITE_FIREBASE_STORAGE_BUCKET=smartglance-xxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc...
   VITE_FIREBASE_DATABASE_URL=https://smartglance-xxx.firebaseio.com
   ```

3. Save the file (don't commit to git!)

### Verify Configuration

```bash
# Restart dev server after changing .env
npm run dev
```

You should see app load without Firebase errors.

---

## ▶️ Running the App

### Development Mode
```bash
npm run dev
```
- Opens dev server at `http://localhost:5173`
- Hot reload on file changes
- Debug tools available in browser DevTools

### Production Build
```bash
npm run build
npm run preview
```

### Testing Firebase Integration

1. **Register Account**
   - Go to app and click "Register"
   - Enter email and password
   - Account created in Firebase

2. **Test Dashboard Sync**
   - Add/remove widgets
   - Verify changes save automatically (see "Syncing..." indicator)
   - Open app in another tab
   - Changes should sync immediately

3. **Test Data Persistence**
   - Log out
   - Log back in with same email
   - Dashboard should be restored exactly as before

4. **Test Multi-Device Sync**
   - Log in on different device
   - Make changes on one device
   - Verify they appear on other device instantly

---

## 🆘 Troubleshooting

### "Firebase is not configured"

**Problem**: App shows "Firebase is not configured"

**Solution**:
1. Check `.env` file exists in project root
2. Verify all 7 variables are filled in
3. Check values match Firebase Console exactly
4. Stop dev server: `Ctrl+C`
5. Restart: `npm run dev`
6. Clear browser cache: `Ctrl+Shift+Delete`
7. Reload page: `Ctrl+F5`

### "Permission denied" Error

**Problem**: Dashboard doesn't save, see permission errors

**Solution**:
1. Check Firestore rules are published:
   - Firebase Console → Firestore → Rules
   - Should show your security rules
   - Verify "Published" indicator
2. Check Realtime DB rules:
   - Firebase Console → Realtime Database → Rules
   - Should show your security rules
   - Verify "Published" indicator
3. Verify user is logged in:
   - Check browser console for auth errors
   - Try logging out and back in

### Dashboard Not Syncing

**Problem**: Changes don't save to dashboard

**Solution**:
1. Check browser console (F12 → Console tab)
   - Look for error messages
   - Check network requests to Firebase
2. Verify database has data:
   - Firebase Console → Realtime Database
   - Check if `dashboards/{uid}` exists
3. Check internet connection
4. Try refreshing page
5. Check Firebase rules allow write access

### Slow Performance

**Problem**: App is slow, taking long to load

**Solution**:
1. **First load** (creating profile): Normal to take 2-3 seconds
2. **Subsequent loads**: Should be instant
3. Check network tab in DevTools (F12)
4. Check if Firebase database is responding
5. Try disabling browser extensions
6. Clear browser cache and try again

### Email/Password Won't Work

**Problem**: Can't register or login

**Solution**:
1. Check email is valid format
2. Check password is at least 6 characters
3. For registration: passwords must match
4. Try a different email address
5. Check Firebase Authentication is enabled:
   - Firebase Console → Authentication
   - Email/Password provider should show "Enabled"

### Data Lost After Logout

**Problem**: Settings/dashboard disappear after logout

**Solution**:
1. Settings are now in **Firestore** (not localStorage)
2. Check Firestore has your data:
   - Firebase Console → Firestore Database
   - Check `users/{uid}` document exists
3. Check Firestore rules allow read/write
4. Clear browser cache: `Ctrl+Shift+Delete`
5. Log out and back in

### Still Getting Errors?

1. **Check browser console** (F12):
   - Look for error messages
   - Screenshot the error
2. **Check Firebase Console**:
   - Look at Firestore and Realtime DB
   - Check usage graphs
3. **Verify all steps**:
   - Re-read Firebase Setup section
   - Double-check `.env` values
   - Ensure all services are enabled
4. **Try disabling extensions**:
   - Browser extensions can interfere
   - Try incognito window

---

## ✨ Features Overview

### Authentication
- Email/password registration
- Secure login
- Automatic session management
- One-click logout

### Dashboard Sync
- Real-time synchronization across devices
- Automatic saves (1-second debounce)
- Offline support (coming soon)
- Multi-device access

### Widgets
- 17+ built-in widgets
- Add/remove/resize widgets
- Drag-and-drop reordering
- Per-widget settings
- Real-time configuration sync

### Data Persistence
- **Firestore**: User profiles & settings
- **Realtime DB**: Dashboard layout
- Automatic backups
- Data isolation per user

### User Settings
- Store display preferences
- Temperature unit (Celsius/Fahrenheit)
- User profile customization
- Theme selection

---

## 📚 Learn More

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Realtime Database](https://firebase.google.com/docs/database)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

---

## 🔒 Security Notes

1. **Never commit `.env`** to Git
2. **Keep API keys private**
3. **Firebase rules** are configured for security
4. **Monitor usage** to avoid exceeding free tier
5. **Enable 2FA** for your Firebase account

---

## 💬 Support

If you encounter issues:

1. Read the [Troubleshooting](#troubleshooting) section
2. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
3. Review [BUG_FIXES_AND_IMPROVEMENTS.md](./BUG_FIXES_AND_IMPROVEMENTS.md)
4. Check browser console for detailed errors
5. Verify Firebase Console configuration

---

## 🎉 You're Ready!

Your SmartGlance Dashboard is now set up with Firebase! Enjoy cloud-synchronized dashboards across all your devices.

**Happy dashboard building!** 🚀

# Firebase Setup Guide

## Prerequisites

This project now uses Firebase for:
- **Authentication**: User registration and login
- **Firestore**: User profiles and dashboard templates
- **Realtime Database**: Real-time dashboard state synchronization

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter project name (e.g., "SmartGlance Dashboard")
4. Click "Continue"
5. Disable Google Analytics (optional)
6. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click **Get started**
3. Select **Email/Password** provider
4. Enable it and click **Save**

## Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select your region (closest to your location)
5. Click **Create**

### Firestore Security Rules

Replace default rules with these (in **Rules** tab):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - each user can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Templates subcollection
      match /templates/{templateId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

Click **Publish**

## Step 4: Create Realtime Database

1. Go to **Realtime Database**
2. Click **Create Database**
3. Choose your region
4. Start with **Test mode**
5. Click **Enable**

### Realtime Database Security Rules

Replace default rules with these (in **Rules** tab):

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

Click **Publish**

## Step 5: Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Under "Your apps" section, click on your web app (or create one)
3. Copy the config object

Your config should look like:
```javascript
{
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
  databaseURL: "https://your-project.firebaseio.com"
}
```

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in the values from Step 5:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
   VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   ```

3. Save the file

## Step 7: Install Dependencies

```bash
npm install
```

## Step 8: Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. Create a new account
4. Verify that:
   - You can log in
   - Dashboard layout is saved to Realtime Database
   - Settings are saved to Firestore
   - Logging out and back in restores your dashboard

## Troubleshooting

### "Firebase is not configured" message

- Check that `.env` file exists and has all values filled
- Verify values are correct in Firebase Console
- Restart the development server after updating `.env`

### "Permission denied" errors

- Check Firestore and Realtime Database rules in Firebase Console
- Ensure rules are published
- Make sure authentication is working

### Data not persisting

- Verify Firestore and Realtime Database are created
- Check browser console for errors
- Ensure user is authenticated before making changes

## Features

### User Authentication
- Register new accounts with email/password
- Secure login with Firebase
- Automatic session management
- Password reset support (coming soon)

### Dashboard Persistence
- Your dashboard layout is saved in Realtime Database
- Widget configurations are stored
- Changes sync across devices in real-time

### User Templates
- Save multiple dashboard templates
- Switch between templates
- Share templates (coming soon)

### User Settings
- Store preferences in Firestore
- Temperature unit preference
- Display settings
- Timezone configuration

## Security Notes

1. **Never commit `.env`** to version control
2. Keep your Firebase API key private
3. Use production mode rules in production
4. Enable authentication for all database access
5. Review Firebase Security Rules regularly

## Next Steps

1. Set up Gmail/Calendar integration
2. Configure Gemini API for smart briefing
3. Add template sharing features
4. Implement offline sync

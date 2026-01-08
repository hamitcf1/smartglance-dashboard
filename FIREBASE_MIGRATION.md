# SmartGlance Dashboard - Firebase Integration Guide

## 🎯 What's New

Your SmartGlance Dashboard has been upgraded with **Firebase** for cloud synchronization:

### ✨ Key Features
- **Firebase Authentication**: Secure email/password authentication
- **Realtime Database**: Real-time synchronization of dashboard layout
- **Firestore**: Persistent user profiles and settings
- **Multi-Device Sync**: Your dashboard stays the same across all devices
- **Cloud Backup**: All your data is securely backed up in the cloud

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Firebase Project

Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions.

### 3. Configure Environment
Create `.env` file in project root:
```env
VITE_FIREBASE_API_KEY=your_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test Firebase
- Register a new account
- Verify dashboard layout is saved
- Log out and log back in
- Your dashboard should be restored

## 📚 Architecture

### Authentication Flow
```
Login/Register → Firebase Auth → User Authenticated → Load Dashboard
```

### Data Persistence
```
Dashboard Layout Changes
          ↓
      (debounced)
          ↓
   Realtime Database (RTDB)
          ↓
   Real-time sync across devices
```

### User Settings
```
Settings Changes
          ↓
      (debounced)
          ↓
      Firestore
          ↓
   Persistent storage per user
```

## 🔧 Services

### firebaseAuth.ts
Handles user authentication:
- `register()` - Create new account
- `login()` - Sign in user
- `logout()` - Sign out
- `onAuthStateChange()` - Listen to auth changes

### realtimeDB.ts
Manages dashboard state:
- `saveDashboardState()` - Save widgets and configs
- `getDashboardState()` - Load dashboard
- `updateWidgets()` - Sync widget layout
- `onDashboardChange()` - Real-time updates

### firestoreUser.ts
Manages user data:
- `createOrUpdateUserProfile()` - User profile
- `getUserProfile()` - Load profile
- `updateUserSettings()` - Save preferences
- `saveTemplate()` - Save custom templates

## 🐛 Troubleshooting

### Firebase Not Configured
```
Error: Firebase is not configured
```
**Solution**: Check `.env` file has all values filled and restart dev server.

### Permission Denied
```
Error: Permission denied
```
**Solution**: Check Firestore and Realtime DB security rules in Firebase Console.

### Data Not Syncing
```
Dashboard changes not persisting
```
**Solution**:
1. Check browser console for errors
2. Verify Firebase rules allow read/write
3. Ensure user is authenticated

### Slow Sync
Dashboard updates take long to sync:
- Check network connection
- Verify Firebase billing is enabled
- Check if database has too much data

## 📖 File Structure

```
services/
  ├── firebase.ts           # Firebase initialization
  ├── firebaseAuth.ts       # Authentication service
  ├── realtimeDB.ts         # Dashboard state service
  └── firestoreUser.ts      # User data service
```

## 🔒 Security

### Firestore Rules
Only users can access their own data:
```firestore
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

### Realtime Database Rules
Only users can access their own dashboard:
```json
{
  "dashboards": {
    "$uid": {
      ".read": "auth.uid === $uid",
      ".write": "auth.uid === $uid"
    }
  }
}
```

## 💡 Best Practices

1. **Never commit `.env`** to git
2. **Use production mode** in Firebase for production
3. **Enable backups** in Firebase Console
4. **Monitor usage** - Firebase has free tier limits
5. **Test security rules** before deploying

## 🆘 Getting Help

1. Check browser console (F12) for errors
2. Review Firebase Console logs
3. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for setup issues
4. Verify security rules are published

## 🎓 Next Steps

### Coming Soon
- [ ] Template sharing
- [ ] Collaborative dashboards
- [ ] Offline sync
- [ ] Widget marketplace
- [ ] Advanced analytics

### User Features
- [ ] Password reset
- [ ] Two-factor authentication
- [ ] Social login (Google, GitHub)
- [ ] Account deletion

## 📝 Notes

- Dashboard syncs automatically with 1-second debounce
- Settings save with 1-second debounce
- Real-time updates are instant across devices
- Offline changes are synced when connection restored

## ⚠️ Important

### Free Tier Limits
Firebase offers generous free tier:
- **Authentication**: 50k sign-ups/month
- **Realtime DB**: 100 connections, 1GB storage
- **Firestore**: 25k reads/day, 20k writes/day

### Monitor Your Usage
Check Firebase Console regularly:
1. Go to **Overview** tab
2. Check current usage vs free tier
3. Set up billing alerts (optional)

## 🎉 Enjoy!

Your dashboard is now cloud-enabled and will work seamlessly across all your devices!

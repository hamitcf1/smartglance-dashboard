# SmartGlance Firebase - Quick Reference Guide

## 🚀 Getting Started (5 Minutes)

### 1. Install & Setup
```bash
npm install
cp .env.example .env
# Edit .env with your Firebase credentials
npm run dev
```

### 2. Create Firebase Project
- Go to [console.firebase.google.com](https://console.firebase.google.com)
- Create new project
- Enable: Authentication (Email), Firestore, Realtime DB
- Copy credentials to `.env`

### 3. Test It
- Register account in app
- Add/remove widgets
- Log out and back in
- Dashboard should be restored ✅

---

## 📚 Service APIs

### Authentication Service
```typescript
import { firebaseAuthService } from './services/firebaseAuth';

// Register
await firebaseAuthService.register('user@email.com', 'password123');

// Login
await firebaseAuthService.login('user@email.com', 'password123');

// Logout
await firebaseAuthService.logout();

// Listen to auth changes
const unsubscribe = firebaseAuthService.onAuthStateChange(user => {
  console.log('User:', user);
});

// Get current user
const user = firebaseAuthService.getCurrentUser();

// Check if authenticated
if (firebaseAuthService.isAuthenticated()) {
  // User is logged in
}
```

### Realtime Database Service
```typescript
import { realtimeDBService } from './services/realtimeDB';

// Save dashboard state
await realtimeDBService.saveDashboardState(
  userId,
  widgets,
  configs
);

// Load dashboard state
const state = await realtimeDBService.getDashboardState(userId);

// Subscribe to real-time updates
const unsubscribe = realtimeDBService.onDashboardChange(
  userId,
  (state) => {
    setWidgets(state.widgets);
    setConfigs(state.configs);
  }
);

// Update single widget config
await realtimeDBService.updateWidgetConfig(
  userId,
  'widget-id',
  { setting: 'value' }
);

// Unsubscribe from updates
unsubscribe();
```

### Firestore User Service
```typescript
import { firestoreUserService } from './services/firestoreUser';

// Create/update user profile
await firestoreUserService.createOrUpdateUserProfile(userId, {
  email: 'user@email.com',
  displayName: 'John Doe',
  settings: { userName: 'John' }
});

// Get user profile
const profile = await firestoreUserService.getUserProfile(userId);

// Update user settings
await firestoreUserService.updateUserSettings(userId, {
  userName: 'Jane',
  useCelsius: false
});

// Save template
const templateId = await firestoreUserService.saveTemplate(userId, {
  name: 'Work Dashboard',
  description: 'My work setup',
  widgets: [],
  configs: {},
  isDefault: false
});

// Get all templates
const templates = await firestoreUserService.getUserTemplates(userId);

// Get specific template
const template = await firestoreUserService.getTemplate(userId, templateId);

// Update template
await firestoreUserService.updateTemplate(userId, templateId, {
  name: 'Updated Name'
});

// Delete template
await firestoreUserService.deleteTemplate(userId, templateId);
```

---

## 🛠️ Utility Functions

### Safe Async
```typescript
import { safeAsync } from './utils/helpers';

const { success, data, error } = await safeAsync(
  () => someAsyncOperation(),
  defaultValue
);
```

### Debounce
```typescript
import { debounce } from './utils/helpers';

const debouncedSave = debounce(
  (data) => saveToFirebase(data),
  1000 // 1 second
);

debouncedSave(data);
debouncedSave.cancel(); // Cancel pending
```

### Validation
```typescript
import { validators } from './utils/helpers';

validators.isValidEmail('user@email.com'); // true
validators.isValidPassword('password123'); // true
validators.isValidUrl('https://example.com'); // true
```

### Formatting
```typescript
import { formatters } from './utils/helpers';

formatters.formatDate(new Date()); // 1/8/2026
formatters.formatTime(5000); // 5s
formatters.formatBytes(1048576); // 1 MB
```

---

## 🐛 Debugging

### Check Auth State
```typescript
// In browser console:
JSON.stringify(firebaseAuthService.getCurrentUser());
```

### View Dashboard State
```typescript
// In browser console:
console.log(realtimeDBService.getCachedState('userId'));
```

### Check Firestore Data
```
Firebase Console → Firestore Database → users
```

### Check Realtime DB
```
Firebase Console → Realtime Database
```

### View Errors
```
Browser DevTools → Console (F12)
```

---

## ⚙️ Environment Variables

Required in `.env`:
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_DATABASE_URL=
```

---

## 🔐 Security Rules

### Firestore Rules
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

### Realtime DB Rules
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

---

## 🚨 Common Issues

### Firebase Not Configured
```
Error: Firebase is not configured
```
**Fix**: Check `.env` file has all 7 values

### Permission Denied
```
Error: Permission denied
```
**Fix**: Check Firebase rules are published

### Data Not Syncing
```
Changes not appearing on other devices
```
**Fix**: Verify Realtime DB is enabled and rules allow access

### Slow Load
```
First load takes 2-3 seconds
```
**Fix**: Normal - creating Firestore profile. Subsequent loads instant.

---

## 📊 Free Tier Limits

| Metric | Limit | Action |
|--------|-------|--------|
| Users | 50k/month | Monitor in Console |
| Firestore reads | 25k/day | Optimize queries |
| Firestore writes | 20k/day | Use debouncing |
| RTDB connections | 100 concurrent | Usually sufficient |
| Storage | 1GB | Manage carefully |

---

## 🎯 File Structure

```
services/
  ├── firebase.ts          # Init & config
  ├── firebaseAuth.ts      # Auth service
  ├── realtimeDB.ts        # State sync
  ├── firestoreUser.ts     # User data
  └── theme.ts             # Theme service

utils/
  └── helpers.ts           # Utilities

components/
  └── Login.tsx            # Firebase login

App.tsx                     # Main app
```

---

## 🔄 Data Flow

```
User Action
    ↓
State Change (React)
    ↓
Debounce (1s)
    ↓
Firebase Write
    ├─ Realtime DB
    └─ Firestore
    ↓
Real-time Listener
    ↓
State Update
    ↓
UI Render
```

---

## 📱 Multi-Device Sync

1. User makes change on Device A
2. Change debounced for 1 second
3. Sent to Firestore/RTDB
4. Real-time listener on Device B receives update
5. Device B UI updates instantly

All devices stay in sync automatically!

---

## 🧪 Testing

### Test Auth Flow
```
1. Register → Check Firestore users collection
2. Login → Check auth state
3. Logout → Check auth cleared
```

### Test Data Sync
```
1. Add widget on Device A
2. Check Realtime DB updated
3. Open app on Device B
4. Widget should appear automatically
```

### Test Error Handling
```
1. Turn off internet
2. Make changes
3. Changes queued
4. Turn on internet
5. Changes sync automatically
```

---

## 📖 Documentation Links

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Full setup
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Firebase config
- [BUG_FIXES_AND_IMPROVEMENTS.md](./BUG_FIXES_AND_IMPROVEMENTS.md) - Improvements
- [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) - Full details

---

## 💬 Need Help?

1. Check `SETUP_GUIDE.md` for setup issues
2. Check browser console (F12) for errors
3. Check Firebase Console for data/rules
4. Review `BUG_FIXES_AND_IMPROVEMENTS.md` for solutions

---

## ✨ Tips & Tricks

### Optimize Reads
```typescript
// Bad: Reads entire user object
const user = await getUserProfile(uid);

// Good: Subscribe to specific widget
onDashboardChange(uid, (state) => {
  // Only gets what changed
});
```

### Batch Updates
```typescript
// Instead of multiple writes, batch them:
await Promise.all([
  updateWidgets(uid, widgets),
  updateConfigs(uid, configs)
]);
```

### Offline Support
```typescript
// App automatically caches data
// Changes queue and sync when online
// No special code needed!
```

---

## 🎓 Learning Path

1. Read `SETUP_GUIDE.md` - Get it running
2. Read `FIREBASE_SETUP.md` - Understand config
3. Look at `App.tsx` - See integration
4. Check `firebaseAuth.ts` - Learn auth
5. Check `realtimeDB.ts` - Learn sync
6. Explore `firestoreUser.ts` - Learn data management

---

**Last Updated**: January 2026  
**Version**: 2.0 (Firebase)  
**Status**: ✅ Production Ready

# ⚡ Quick Start - Services Widget & Login

## 🎯 First Time Setup

1. **Open browser console** (F12)
2. **Paste this and press Enter:**
   ```javascript
   localStorage.clear(); location.reload();
   ```

3. **Set your login credentials** on the login screen
4. **Go through onboarding** (includes Services widget)
5. **Dashboard loads with Services widget visible** ✅

## 📋 Onboarding Steps

1. ✅ **Enter Name** - Your dashboard username
2. ✅ **Select Theme** - Choose your preferred theme
3. ✅ **Pick Widgets** - Services widget is available here
4. ✅ **Configure Links** - Set up quick links
5. ✅ **YouTube Setup** - Add your channels
6. ✅ **Complete** - Dashboard is ready!

## 🔗 Services Widget Features

**What you get:**
- 9 pre-configured .arr services
- Real-time status checking
- Click to open services in browser
- Add more services from settings
- Remove services you don't use

**Quick Actions:**
- 🟢 Green = Active
- 🔴 Red = Down
- ⏳ Click to re-check
- 🔗 Click link icon to open

## 🔐 Login Features

**First Login:**
- Sets your username/password
- Encrypts and saves to localStorage
- Creates a 24-hour session

**Next Logins:**
- Enter same username/password
- Session refreshes for 24 hours

**Logout:**
- Button in header (⇠ sign)
- Clears session but keeps credentials
- Credentials remain for future logins

## 🚨 Important Notes

⚠️ **Your configuration is now protected**
- Only you can access it (on this device)
- Password is saved locally (not sent anywhere)
- If you forget password: `localStorage.removeItem('smart-glance-credentials')`

## 🆘 Need Help?

**Widget not showing?**
```javascript
// Reset layout only:
localStorage.setItem('smart-glance-layout', JSON.stringify([
  { id: 'clock', type: 'clock', size: 'medium' },
  { id: 'search', type: 'search', size: 'medium' },
  { id: 'weather', type: 'weather', size: 'small' },
  { id: 'links', type: 'links', size: 'small' },
  { id: 'briefing', type: 'briefing', size: 'large' },
  { id: 'news', type: 'news', size: 'large' },
  { id: 'youtube', type: 'youtube', size: 'large' },
  { id: 'email', type: 'email', size: 'medium' },
  { id: 'calendar', type: 'calendar', size: 'large' },
  { id: 'water', type: 'water', size: 'small' },
  { id: 'work', type: 'work', size: 'large' },
  { id: 'work-reports', type: 'work-reports', size: 'large' },
  { id: 'chat', type: 'chat', size: 'large' },
  { id: 'currency', type: 'currency', size: 'medium' },
  { id: 'countdown', type: 'countdown', size: 'medium' },
  { id: 'services', type: 'services', size: 'large' },
  { id: 'darkmode', type: 'darkmode', size: 'small' },
]));
location.reload();
```

**Stuck at login?**
```javascript
// Check if credentials exist:
localStorage.getItem('smart-glance-credentials') ? 'Yes' : 'No'

// Clear everything:
localStorage.clear();
location.reload();
```

---

**That's it! Your dashboard is now secure and monitoring your services.** 🎉

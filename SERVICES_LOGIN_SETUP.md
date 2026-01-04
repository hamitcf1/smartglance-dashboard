# SmartGlance Services Widget & Login Module Setup

## ✅ What's New

### 1. **Services Widget** 🔗
A new monitoring widget for your .arr services with pre-configured endpoints:
- **QbitTorrent** - `http://100.110.161.50:8081/`
- **Jellyfin** - `http://100.110.161.50:8096/`
- **Sonarr** - `http://100.110.161.50:8989/`
- **Radarr** - `http://100.110.161.50:7878/`
- **Bazarr** - `http://100.110.161.50:6767/`
- **n8n** - `http://100.110.161.50:5678/`
- **Plex** - `http://100.110.161.50:32400/`
- **Seer** - `http://100.110.161.50:5055/`
- **Glance** - `http://100.110.161.50:9090/`

**Features:**
- ✅ Real-time service status checking
- 🔄 Manual refresh per service
- 🔗 Quick links to access each service
- ➕ Add custom services from widget settings
- 🗑️ Remove services you don't need

### 2. **Login/Authentication Module** 🔐
Protect your dashboard with username/password authentication:
- First login sets your credentials
- Auto-saves credentials encrypted in localStorage
- 24-hour session expiry
- Logout button in header
- Prevents accidental resets of your configuration

**Key Benefits:**
- Your dashboard configuration is protected
- Only you can access it (on your device)
- Session expires after 24 hours for security
- Credentials never sent to external servers

## 🚀 Getting Started

### Option 1: Complete Fresh Start (Recommended)

Open your browser's **Developer Console** (F12) and run:

```javascript
localStorage.clear(); 
location.reload();
```

This will:
- Clear all saved data
- Trigger the login screen
- Allow you to set up a new username/password
- Show the onboarding with Services widget included
- Start fresh with all widgets enabled

### Option 2: Reset Dashboard Only

Run the reset script:

```javascript
// Copy and paste this in browser console:
const resetDashboard = () => {
  localStorage.clear();
  const DEFAULT_WIDGETS = [
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
  ];
  localStorage.setItem('smart-glance-layout', JSON.stringify(DEFAULT_WIDGETS));
  localStorage.setItem('smart-glance-settings', JSON.stringify({
    userName: 'User',
    useCelsius: true,
    showNews: true,
    showWeather: true,
    showBriefing: true,
    showLinks: true,
  }));
  localStorage.setItem('smart-glance-configs', JSON.stringify({}));
  localStorage.setItem('smart-glance-theme-name', 'dark');
  console.log('✅ Dashboard reset successfully!');
  location.reload();
};
resetDashboard();
```

## 📋 Files Modified/Created

### New Files:
- `components/widgets/ServicesWidget.tsx` - Services monitoring widget
- `components/Login.tsx` - Login UI component
- `services/login.ts` - Authentication service
- `reset-all.js` - Complete reset script

### Modified Files:
- `App.tsx` - Added login flow & Services widget integration
- `types.ts` - Added `ServicesConfig` & `ServiceItem` types
- `components/Onboarding.tsx` - Added Services widget to onboarding
- `reset-dashboard.js` - Added Services widget to default layout

## 🔒 Login Security Notes

**How it works:**
1. First login: Creates credentials and encrypts them with Base64
2. Subsequent logins: Verifies credentials match stored data
3. Sessions: Creates 24-hour session tokens
4. Logout: Clears session, keeps credentials for next login

**Important:**
- ⚠️ For production use, upgrade to proper encryption (AES-256)
- 🔐 Credentials are Base64 encoded (simple encryption)
- 📱 Each device has its own independent credentials
- 🗑️ Logout doesn't delete credentials, just the session

## 🎮 Using the Services Widget

**Check Service Status:**
1. Look for the 🔗 Services widget on dashboard
2. Green checkmark = Service is active
3. Red X = Service is down/unreachable
4. Click the icon to manually check status

**Add Custom Service:**
1. Click the ⚙️ settings icon on Services widget
2. Enter service name and URL
3. Click "Add Service"
4. Service is checked automatically

**Remove Service:**
1. Click settings ⚙️
2. Find service in "Manage Services" section
3. Click trash icon to remove

## 🔧 Troubleshooting

**"Login screen keeps appearing"**
- Check browser console for errors
- Clear cache: `localStorage.clear()`
- Reload the page

**"Services widget not showing"**
- Run the reset script above
- Check that 'services' is in your widget layout
- Use Edit Mode to add it if removed

**"Can't remember password"**
- Clear credentials: `localStorage.removeItem('smart-glance-credentials')`
- Reload page and set new login

**"Services showing as inactive"**
- Check if services are actually running
- Verify network connectivity
- Services have 3-second timeout - might fail if slow
- Try manual check by clicking status icon

## 💡 Tips

- **Protect important configs**: Use this login to keep your setup safe
- **Add more services**: Use Settings to add any HTTP service
- **Monitor everything**: Check status of any web-based service
- **Session timeout**: Automatically logs out after 24 hours for security

## 📚 Additional Resources

- Check browser console for any errors: F12 → Console
- Settings are stored in localStorage
- All data is local - nothing sent to external servers
- Edit Mode (pencil icon) allows reordering widgets

---

**Questions or issues?** Check the console logs (F12) for error messages.

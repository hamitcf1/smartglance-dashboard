# 🔧 Your API Errors - Quick Fix Guide

## Your Issues

### 1. 📧 Gmail Error: "no registered origin" + "401: invalid_client"
**Email (hamitfindik2@gmail.com)**

**Root Cause:** Your OAuth Client ID in Google Cloud Console doesn't have your localhost:3001 origin registered.

**⚡ Quick Fix (5 minutes):**
1. Go to https://console.cloud.google.com/
2. Click the project dropdown (top-left)
3. Find and select **smartglance** (or your project name)
4. Click **APIs & Services** (left sidebar)
5. Click **Credentials** (left sidebar)
6. Find the OAuth 2.0 Client ID that matches `176240506899-iikl16rufcmrqntoa0884dv15pn10365.apps.googleusercontent.com`
7. Click the pencil icon to edit
8. Under **Authorized JavaScript origins**, click **+ Add URI**
9. Type: `http://localhost:3001` (or just add 3001 to existing origins)
10. Under **Authorized redirect URIs**, click **+ Add URI**
11. Type: `http://localhost:3001/`
12. Scroll to bottom and click **Save**
13. Wait 1-2 minutes for changes to propagate
14. Close your browser (CTRL+W on all tabs)
15. Refresh browser and try Gmail sign-in again

---

### 2. 🤖 Daily Briefing: "Welcome back! I couldn't generate..."

**Root Cause:** Gemini API key exists but might have quota issues OR the API isn't enabled.

**⚡ Quick Fix:**
1. Go to https://aistudio.google.com/app/apikeys
2. Look for your API key: `AIzaSyCA1qFRgNsIubQm18jnWzqdU3MjxOdOsPA`
3. If it's there and has a **checkmark**, the key is valid
4. **Optional:** If not working, regenerate the key:
   - Click the three dots next to the key
   - Click **Regenerate**
   - Copy the new key
   - Update `.env.local` with the new key:
     ```
     GEMINI_API_KEY=your-new-key-here
     ```
   - Restart the app

5. **Alternative (if still not working):**
   - Create key in Google Cloud instead:
   - Go to https://console.cloud.google.com/
   - Find your project
   - Click **APIs & Services** → **Library**
   - Search for "Generative AI API"
   - Click **Enable**
   - Go back to **Credentials**
   - Click **+ Create Credentials** → **API Key**
   - Copy the new key and update `.env.local`

---

### 3. 📺 YouTube Widget (if not showing videos)

**Should work automatically, but if not:**
1. Go to https://console.cloud.google.com/
2. Click **APIs & Services** → **Library**
3. Search for "YouTube Data API v3"
4. Click **Enable**
5. Your existing YouTube API key should work now

---

## Your Current Setup

- **App URL:** http://localhost:3001 ✅
- **Gemini API Key:** AIzaSyCA1qFRgNsIubQm18jnWzqdU3MjxOdOsPA
- **YouTube API Key:** AIzaSyB2565u1hAf0_boDDKiFQ1YJDNrRSd5fso
- **Google OAuth Client ID:** 176240506899-iikl16rufcmrqntoa0884dv15pn10365.apps.googleusercontent.com

---

## Testing After Fixes

After making changes:

1. **Gmail:** Click "Connect Gmail" button in Email widget → Select your account (hamitfindik2@gmail.com)
2. **Daily Briefing:** Click refresh button (top-right) → Should show your personalized briefing
3. **YouTube:** Should automatically load your channel's videos

---

## Still Not Working?

1. **Check Browser Console:** Press F12 → Console tab → Look for red errors
2. **Clear Cache:** Ctrl+Shift+Delete → Clear all browsing data
3. **Hard Refresh:** Ctrl+Shift+R (on Windows) or Cmd+Shift+R (on Mac)
4. **Restart App:**
   - Press `q` to quit the development server
   - Run `npm run dev` again

---

## Common Mistakes

❌ **Wrong:** Added `localhost:3001` to origins (missing `http://`)
✅ **Right:** `http://localhost:3001`

❌ **Wrong:** Added `http://localhost:3001` to redirect URIs (should have `/`)
✅ **Right:** `http://localhost:3001/`

❌ **Wrong:** Only added 3001, but also running on 3000
✅ **Right:** Add both `http://localhost:3000` AND `http://localhost:3001`

---

## Need More Help?

See [API_SETUP.md](API_SETUP.md) for complete documentation.

# API Configuration Guide

## Current Issues & Solutions

### 1. ❌ Gmail/Calendar OAuth - "no registered origin" Error

**Problem:** Your OAuth credentials in Google Cloud Console don't have your app's origin registered.

**Solution:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (web application)
5. Click it to edit
6. Under **Authorized JavaScript origins**, add these:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `http://127.0.0.1:3000`
   - `http://127.0.0.1:3001`
   - (If deploying) Your production domain, e.g., `https://yourdomain.com`

7. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/`
   - `http://localhost:3001/`
   - `http://127.0.0.1:3000/`
   - `http://127.0.0.1:3001/`

8. Click **Save**
9. Restart your app: Press `q` to quit, then `npm run dev`

### 2. ❌ Gemini API - Daily Briefing Not Generating

**Problem:** The Gemini API key exists but may have quota issues or the API isn't enabled.

**Solution:**

1. Verify your Gemini API key is valid:
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikeys)
   - Check if your key is listed and active
   
2. Test the API key:
   - Open browser console (F12) and check for network errors
   - Look for 429 (quota exceeded) or 403 (permission denied) errors
   
3. If using an API key from Google Cloud instead:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** → **Library**
   - Search for "Generative AI API"
   - Click **Enable**

### 3. ⚠️ YouTube API - May Need Authorization

If YouTube widget shows errors, verify:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Library**
3. Search for "YouTube Data API v3"
4. Click **Enable**
5. Your API key should work within quota limits

---

## Recommended Setup Order

1. **Fix OAuth First** (Gmail/Calendar will work after this):
   - Add localhost origins to OAuth credentials
   - Restart app

2. **Fix Gemini** (Daily Briefing will work after):
   - Verify API key is valid and enabled
   - Check for quota issues in Cloud Console

3. **Verify YouTube** (should work if not hitting quota):
   - Ensure API is enabled
   - Check API key restrictions

---

## Quick Checklist

- [ ] OAuth origins registered (localhost:3000, 3001)
- [ ] OAuth redirect URIs registered
- [ ] Gemini API enabled or API key valid
- [ ] YouTube API enabled
- [ ] App restarted after changes
- [ ] Cleared browser cache (Ctrl+Shift+Delete)

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "no registered origin" | OAuth origin not in Cloud Console | Add `http://localhost:3001` to authorized origins |
| 401: invalid_client | OAuth credentials invalid | Verify Client ID in .env.local matches Cloud Console |
| "couldn't generate briefing" | Gemini API disabled or invalid key | Enable API or check key in [AI Studio](https://aistudio.google.com/app/apikeys) |
| YouTube widget empty | API disabled or quota exceeded | Enable YouTube API, check quota usage |
| CORS errors | Frontend security issue | Usually fixed when OAuth origins are correctly set |

---

## Where to Get Keys

| Service | Key | Get From |
|---------|-----|----------|
| Gemini | API Key | https://aistudio.google.com/app/apikeys |
| YouTube | API Key | https://console.cloud.google.com/ (create in Cloud Console) |
| Gmail/Calendar | OAuth Client ID | https://console.cloud.google.com/ (OAuth 2.0 credentials) |

---

## Testing APIs

After setup, test each API:

1. **Gemini**: Daily briefing should generate on refresh
2. **Gmail**: Click "Sign in with Google" button in Email widget
3. **YouTube**: Videos should load in YouTube widget

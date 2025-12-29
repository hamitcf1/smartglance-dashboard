# Gmail & Calendar Widget Troubleshooting Guide

## Issue 1: Gmail Widget - "Failed to fetch profile: 403"

### Root Cause
The Gmail API is rejecting the profile fetch request with a 403 (Forbidden) error. This typically occurs because:

1. **Invalid or Expired Access Token** - The token no longer has valid permissions
2. **Missing OAuth Scopes** - The token wasn't granted the required Gmail permissions
3. **OAuth Credentials Not Properly Configured** - The Client ID doesn't have the right API scopes enabled

### Solution Checklist

#### Step 1: Verify Your OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID (Web Application)
5. Click on it to view details

#### Step 2: Ensure Required APIs are Enabled
1. Go to **APIs & Services** → **Library**
2. Search for and enable:
   - ✅ **Gmail API**
   - ✅ **Calendar API**
   - ✅ **Google+ API** (for profile info)
3. Click **Enable** for each

#### Step 3: Verify OAuth Consent Screen Configuration
1. Go to **APIs & Services** → **OAuth consent screen**
2. Ensure you're in **Development** or **Production** mode
3. Under **Scopes**, verify these are included:
   - ✅ `https://www.googleapis.com/auth/gmail.readonly`
   - ✅ `https://www.googleapis.com/auth/calendar.readonly`
   - ✅ `https://www.googleapis.com/auth/userinfo.email`
   - ✅ `https://www.googleapis.com/auth/userinfo.profile`

#### Step 4: Check Authorized Origins
1. In your OAuth Client ID settings
2. Under **Authorized JavaScript origins**, ensure you have:
   - ✅ `http://localhost:3000`
   - ✅ `http://127.0.0.1:3000`
3. Under **Authorized redirect URIs**:
   - ✅ `http://localhost:3000/`
   - ✅ `http://127.0.0.1:3000/`

#### Step 5: Clear Cache and Reconnect
1. Click **Disconnect Gmail** in the Gmail widget settings
2. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Click **Connect Gmail** again
4. When prompted, grant **all requested permissions**
   - Make sure to select "Allow" for Gmail access

### If Still Failing

**Check Browser Console (F12)**:
- Look at the Network tab → find Gmail API requests
- Check the response for the actual error message
- Screenshot the error and refer to Google's [Gmail API error codes](https://developers.google.com/gmail/api/guides/handle-errors)

**Common Error Responses**:
- `403 Insufficient Permissions` → Scopes not granted
- `401 Unauthorized` → Token expired (reconnect)
- `400 Invalid Argument` → Malformed request

---

## Issue 2: Calendar Widget - "No upcoming events"

### Root Cause
The Calendar API request is failing silently, or:

1. **Token Permission Issues** - Same as Gmail widget above
2. **No Primary Calendar** - Your Google account might not have a primary calendar set up
3. **Events Outside Date Range** - Events exist but are in the past or far future
4. **API Error Being Swallowed** - Errors aren't being shown to the user

### Solution Checklist

#### Step 1: Verify Calendar Configuration
1. Go to [Google Calendar](https://calendar.google.com/)
2. Ensure you have at least one calendar created
3. Ensure you have events in the **next 7 days**
4. If no events, create a test event

#### Step 2: Follow Same Steps as Gmail Above
Steps 1-4 from the Gmail troubleshooting apply to Calendar as well.

#### Step 3: Clear Cache and Reconnect
1. Click **Disconnect Calendar** in widget settings
2. Hard refresh browser
3. Click **Connect Calendar**
4. Grant all requested permissions

#### Step 4: Check for Events in Range
The widget looks for events within:
- **Start**: Today at 00:00 UTC
- **End**: 7 days from today at 23:59 UTC

Verify you have events in this range by:
1. Open Google Calendar in a new tab
2. Check the next 7 days
3. If no events, create a test event for tomorrow

### If Still No Events Showing

**Check Browser Console (F12)**:
- Go to **Console** tab
- Look for error messages related to calendar API
- Check **Network** tab → Calendar API requests
- Verify the response status and body

**Enable Debug Logging**:
The improved Calendar widget now logs errors to console. Check for messages like:
```
Calendar fetch failed for primary 403 ...
Error fetching calendar primary: ...
```

---

## Common OAuth Errors Explained

| Error | Meaning | Fix |
|-------|---------|-----|
| `403 Forbidden` | Your token doesn't have permission for this API | Add scope to OAuth consent screen |
| `401 Unauthorized` | Token is expired or invalid | Disconnect and reconnect |
| `400 Bad Request` | Request is malformed | Usually a dev error, check console |
| `429 Too Many Requests` | Rate limit exceeded | Wait and try again later |
| `invalid_client` | Client ID doesn't match | Verify GOOGLE_CLIENT_ID in .env |

---

## Testing Your Setup

### Quick Test Script
Open your browser console (F12) and run:

```javascript
// Test if Google Sign-In is loaded
console.log('Google loaded:', window.google ? 'Yes' : 'No');

// Test if OAuth2 client is initialized
console.log('OAuth2 available:', window.google?.accounts?.oauth2 ? 'Yes' : 'No');

// Check current config
const configStr = localStorage.getItem('smart-glance-email-config');
console.log('Email config:', JSON.parse(configStr || '{}'));
```

---

## Environment Variables

Make sure your `.env` file contains:

```dotenv
GOOGLE_CLIENT_ID=your_actual_client_id_here
GEMINI_API_KEY=your_gemini_key_here
YOUTUBE_API_KEY=your_youtube_key_here
```

If you don't have these, see [API_SETUP.md](./API_SETUP.md)

---

## Next Steps

1. **Follow the checklist above** - 95% of issues are resolved by ensuring APIs are enabled and scopes are correct
2. **Clear browser cache** - Hard refresh after making changes
3. **Reconnect your accounts** - Disconnect and reconnect after setup changes
4. **Check browser console** - Look for detailed error messages
5. **Verify events exist** - Make sure you have calendar events in the next 7 days

---

## Still Having Issues?

**Enable detailed console logging:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click on the Gmail/Calendar API request that's failing
4. Check the response body for the actual error message
5. Share that error message for more specific help

The improved error handling in the widgets now logs detailed error messages. Check your browser console (F12) for messages that start with:
- `"Profile fetch failed"`
- `"Email list fetch failed"`
- `"Calendar fetch failed"`

These will include the HTTP status code and response body to help diagnose the issue.

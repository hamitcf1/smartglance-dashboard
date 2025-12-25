# SmartGlance Dashboard - Complete Setup Guide

## 🎯 Overview

SmartGlance is a customizable personal dashboard with multiple widgets:
- **Clock, Search, Weather, News** - Basic dashboard widgets
- **Smart Briefing** - AI-powered daily briefing using Google Gemini
- **Quick Links** - Save your favorite URLs
- **YouTube Feed** - Subscribe to and watch latest videos from channels
- **Gmail Integration** - View unread emails and notifications
- **Google Calendar** - See upcoming events
- **Water Intake Tracker** - Track your daily water consumption
- **Dark Mode Toggle** - Schedule light/dark themes with sunrise/sunset times

---

## 🔑 API Keys & Credentials Setup

### 1. **Google Gemini API Key** (for Smart Briefing)

1. Go to: https://aistudio.google.com/app/apikeys
2. Click **"Create API Key"**
3. Copy your API key
4. Paste in `.env.local`:
   ```
   GEMINI_API_KEY=your-key-here
   ```

### 2. **YouTube Data API Key**

1. Go to: https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Search for "YouTube Data API v3" → Enable it
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key
6. Paste in `.env.local`:
   ```
   YOUTUBE_API_KEY=your-key-here
   ```

**Optional:** Restrict the key to YouTube API only:
- Click the API key in credentials
- Under "API restrictions" → Select "YouTube Data API v3"

### 3. **Google OAuth2 Client ID** (for Gmail & Calendar)

1. Go to: https://console.cloud.google.com/
2. Use the same project or create new one
3. Go to **APIs & Services** → **OAuth consent screen**
4. Select **External** → **Create**
5. Fill in app name "SmartGlance" and your email
6. Skip optional sections, finish
7. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
8. Select **Web application**
9. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000`
   - `http://localhost:3000/`
   - `https://yourdomain.com` (when you deploy)
10. Copy the **Client ID**
11. Paste in `.env.local`:
    ```
    GOOGLE_CLIENT_ID=your-client-id-here
    ```

---

## ⚙️ Environment Setup

Your `.env.local` should look like:

```dotenv
# Gemini AI
GEMINI_API_KEY=AIza...

# YouTube API
YOUTUBE_API_KEY=AIza...

# Google OAuth2
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

---

## 🚀 Running the App

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser

---

## 📱 Widget Guide

### **YouTube Feed Widget**
- ✅ Requires: YouTube API Key
- Add channels by searching in widget settings
- Shows latest videos with thumbnails
- Click video to open on YouTube

### **Gmail Widget**
- ✅ Requires: Google OAuth2 Client ID
- Click "Sign in with Google"
- Shows unread emails preview
- Displays sender, subject, and snippet

### **Calendar Widget**
- ✅ Requires: Google OAuth2 Client ID
- Click "Sign in with Google"
- Shows upcoming events (next 7 days)
- Color-coded by calendar
- Displays date and time

### **Water Intake Tracker**
- ✅ No API needed
- Set daily goal (1-16 cups)
- Click "Add Cup" or "Remove"
- Resets automatically at midnight
- Visual progress ring

### **Dark Mode Widget**
- ✅ No API needed
- Choose: Light, Dark, or Auto (Schedule)
- Auto mode switches based on sunrise/sunset
- Customize sunrise/sunset times (24-hour format)
- Shows time until next mode change

### **Weather Widget**
- ✅ Shows city name with map pin icon
- Auto-location or manual search
- Current temperature, conditions, wind speed

### **Other Widgets**
- **Clock** - Shows current time and date
- **Search** - Quick Google search
- **Smart Briefing** - AI-powered greeting and daily tips
- **News** - Hacker News stories
- **Quick Links** - Save custom URLs

---

## 🎨 Customization

### Add Widgets to Dashboard
1. Open browser dev tools (F12)
2. Go to Console
3. Add a widget to localStorage:
   ```javascript
   const current = JSON.parse(localStorage.getItem('smart-glance-layout'));
   current.push({ id: 'water', type: 'water', size: 'small' });
   localStorage.setItem('smart-glance-layout', JSON.stringify(current));
   ```
4. Refresh the page

### Widget Sizes
- `small` - 1 column (phone size)
- `medium` - 2 columns
- `large` - 4 columns (full width)

---

## 🐛 Troubleshooting

### **"YouTube API key not configured"**
- Add `YOUTUBE_API_KEY` to `.env.local`
- Restart dev server

### **Gmail widget shows "Sign in with Google" but clicking does nothing**
- Verify `GOOGLE_CLIENT_ID` is set correctly
- Check that localhost:3000 is in OAuth redirect URIs
- Make sure Google Sign-In library loaded (check Network tab)

### **Calendar not showing events**
- Grant Calendar permission when prompted
- Check that you have events in the next 7 days
- Ensure event times are set (not all-day events)

### **Water Tracker doesn't persist**
- Make sure localStorage is enabled
- Check browser privacy settings aren't blocking storage

### **Dark mode not switching**
- In Auto mode, check your sunrise/sunset times
- Times are in 24-hour format (0-23)
- Ensure your system clock is correct

---

## 📦 Build for Production

```bash
npm run build
npm run preview
```

Output is in `dist/` folder - ready to deploy to any static host.

---

## 🔒 Security Notes

- **Never commit** API keys to git
- `.env.local` is in `.gitignore` - it won't be committed
- For production, use environment variables from your hosting platform
- OAuth tokens are stored in localStorage - this is acceptable for a SPA

---

## 🎓 Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Hooks Guide](https://react.dev/reference/react)
- [Google APIs Console](https://console.cloud.google.com/)
- [dnd-kit Documentation](https://docs.dndkit.com/) - Drag and drop library

---

## 💡 Future Ideas

- **Crypto Ticker** - Bitcoin, Ethereum prices
- **Pomodoro Timer** - Productivity timer
- **To-Do List** - Task management
- **Stock Market** - Real-time stock prices
- **Social Media Stats** - Twitter, GitHub followers
- **Habit Tracker** - Daily habit tracking
- **Spotify Widget** - Now playing
- **Air Quality** - AQI index

---

Enjoy your personalized dashboard! 🎉

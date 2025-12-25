# SmartGlance Dashboard — Complete Overview

## What You Have

A modern, production-ready personal dashboard with:

### Core Features ✅
- **Work Time Tracking**: Log sessions, calculate earnings
- **Reports**: Weekly/monthly charts with Chart.js
- **Responsive**: Mobile, tablet, desktop optimized
- **Customizable**: Drag to reorder, resize, add/remove widgets
- **Persistent**: All data saved locally
- **Dark Mode**: Beautiful theme with auto-detection
- **Accessible**: ARIA labels, keyboard nav, screen reader support

### Available Widgets
- Clock, Search, Weather, Quick Links
- Smart Briefing (Gemini AI)
- News (Hacker News)
- YouTube, Email (Gmail), Calendar (Google)
- Water Tracker
- **Work Tracker** (log hours, earnings)
- **Work Reports** (weekly charts)
- Dark Mode Toggle

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## How to Use

### 1. **Edit Mode** (Customize Your Dashboard)
   - Click the **Edit** button (pencil icon) in the header
   - Click any widget name to add it
   - Click the red **trash icon** on a widget to remove it
   - **Drag** widgets to reorder
   - **Drag-to-resize**: Grab the handle (⊗ bottom-right) and drag

### 2. **Work Tracker** (Track Hours & Earnings)
   - Add the **💼 Work Tracker** widget
   - Click **Start** to begin timer
   - Click **Stop** when done (saves session)
   - Or manually add hours with the input field
   - Configure hourly rate in settings (gear icon)

### 3. **Work Reports** (View Progress)
   - Add the **📈 Work Reports** widget
   - See weekly totals in a chart
   - Updates automatically as you log sessions

---

## File Structure

```
smartglance-dashboard/
├── components/
│   ├── widgets/               # Individual widgets
│   │   ├── WorkTrackerWidget.tsx
│   │   ├── WorkReportsWidget.tsx
│   │   ├── WeatherWidget.tsx
│   │   └── ...
│   ├── Widget.tsx            # Base widget container
│   ├── SortableWidget.tsx    # Drag/resize wrapper
│   └── SettingsModal.tsx
├── services/
│   ├── gemini.ts            # AI integration
│   ├── theme.ts             # Dark mode
│   └── youtube.ts           # YouTube API
├── App.tsx                   # Main app
├── types.ts                  # TypeScript types
├── index.tsx
├── index.html
└── package.json
```

---

## Storage & Data

All data stored in **localStorage** (your browser):
- `smart-glance-settings`: User preferences
- `smart-glance-layout`: Widget positions & sizes
- `smart-glance-configs`: Widget data (work sessions, etc.)

**To reset**: Open DevTools → Application → Clear localStorage → Reload

---

## Keyboard Shortcuts & Accessibility

- **Tab**: Navigate between widgets
- **Shift+Tab**: Reverse navigation
- **Enter/Space**: Activate buttons
- **Drag handle**: Reorder widgets (accessible via keyboard)
- **Settings toggle**: Opens/closes widget config
- **All controls**: Keyboard-accessible

---

## Recent Improvements

✅ **Fixed drag-to-resize** (now works perfectly)  
✅ **Improved accessibility** (ARIA labels, focus management)  
✅ **Mobile responsiveness** (sm, md, lg, xl breakpoints)  
✅ **Code quality** (TypeScript, clean components)  
✅ **Charts integration** (weekly reports)  
✅ **Better error handling** (null checks, safe access)  
✅ **Performance optimized** (460KB bundle, 144KB gzipped)  

---

## Configuration

### Set Your Name
1. Click the **Settings** button (gear icon) in the header
2. Enter your name
3. Changes save automatically

### Change Hourly Rate
1. Open a **Work Tracker** widget
2. Click the **Settings** (gear icon)
3. Update your hourly rate
4. Save

### Enable Dark Mode
1. Add the **🌙 Dark Mode** widget
2. Toggle the switch
3. Auto-detects your system preference

### Google Integrations (Optional)
For Weather, Smart Briefing, YouTube, Gmail, Calendar:
1. Get API keys from [Google Cloud Console](https://console.cloud.google.com)
2. Add to `.env`:
   ```env
   VITE_GEMINI_API_KEY=your_key_here
   VITE_GOOGLE_API_KEY=your_key_here
   ```
3. Reload the app

---

## Tech Stack

- **React 18** + TypeScript
- **TailwindCSS** (styling)
- **Vite** (build tool)
- **dnd-kit** (drag & drop)
- **Chart.js** (reports)
- **Lucide Icons**

---

## Development

### Add a New Widget

1. Create `components/widgets/MyWidget.tsx`
2. Export a component with props:
   ```tsx
   export const MyWidget = ({
     config,
     onConfigChange,
     isSettingsOpen,
     onToggleSettings,
     dragHandleProps
   }) => { ... }
   ```
3. Add type in `types.ts`:
   ```tsx
   type: 'mywidget';
   ```
4. Add case in `App.tsx` renderWidget switch
5. Add to `DEFAULT_WIDGETS` and add-widget list

### Run Dev Server
```bash
npm run dev
```
Hot reloads automatically on file changes.

### Build & Deploy
```bash
npm run build
# Deploy dist/ folder to your hosting
```

---

## Roadmap

- [ ] Client-side SQLite with IndexedDB sync
- [ ] Screenshot widget
- [ ] Project-based invoicing
- [ ] Export/import (CSV, JSON)
- [ ] Cloud sync (Google Drive/GitHub)
- [ ] Integrations (Toggl, Slack)
- [ ] Unit & E2E tests
- [ ] PWA support

---

## Troubleshooting

### App not loading?
- Clear browser cache: Cmd+Shift+Delete → Clear All
- Check DevTools console for errors

### Widgets not saving?
- localStorage might be disabled → check browser privacy settings
- Try a different browser to test

### Drag/resize not working?
- Only available in **Edit Mode** (click Edit button)
- Works on desktop and touch devices

### API keys not working?
- Verify keys in `.env` file
- Restart dev server after changes
- Check quotas in Google Cloud Console

---

## Support & Questions

- Check `README.md` for detailed usage
- Check `IMPROVEMENTS.md` for technical details
- Open an issue on GitHub
- Review component code (well-commented)

---

## License

MIT — Use freely, modify, distribute!

**Built with ❤️ for productivity & simplicity.**

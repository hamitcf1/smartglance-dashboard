# SmartGlance Dashboard

A modern, responsive personal dashboard built with React, TypeScript, TailwindCSS, and Firebase. Features cloud synchronization, real-time data persistence, and 17+ customizable widgets.

## ✨ New Features (Firebase Integration)

- **☁️ Cloud Synchronization**: Dashboard syncs in real-time across all your devices
- **🔐 Secure Authentication**: Firebase email/password authentication
- **💾 Permanent Data Storage**: Uses Firestore & Realtime Database
- **📱 Multi-Device Support**: Access your dashboard from any device
- **🔄 Auto-Sync**: Changes save automatically with intelligent debouncing
- **👤 User Profiles**: Individual profiles and settings per user
- **📊 Dashboard Templates**: Save and load multiple dashboard configurations (coming soon)

## 🎯 Core Features

- **🎨 Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **⏱️ Work Tracker**: Log work sessions, track hours, and calculate earnings in real-time
- **📊 Work Reports**: View weekly and monthly totals with interactive charts
- **🎯 Drag & Drop**: Reorder widgets by dragging them
- **↔️ Drag-to-Resize**: Resize widgets by dragging the bottom-right handle
- **🌙 Dark Mode**: Beautiful dark theme with auto-detection
- **⚙️ Edit Mode**: Customize your dashboard layout
- **♿ Accessible**: ARIA labels, keyboard navigation, and focus management
- **📱 Mobile-First**: Optimized for all screen sizes
- **📺 17+ Widgets**: Clock, Weather, News, YouTube, Email, Calendar, Water Tracker, and more

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Firebase account (free tier available at [firebase.google.com](https://firebase.google.com))

### Installation

```bash
npm install
```

### Configuration

**Important**: Set up Firebase before running the app!

1. Follow the [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete Firebase setup
2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Fill in your Firebase credentials (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

### Development

```bash
npm run dev
```

The app will open at [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
npm run preview
```

## 📚 Documentation

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete setup instructions
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Firebase configuration guide
- **[FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md)** - Migration from localStorage to Firebase
- **[BUG_FIXES_AND_IMPROVEMENTS.md](./BUG_FIXES_AND_IMPROVEMENTS.md)** - Detailed improvements and bug fixes

## 🔐 Authentication

### Register
1. Click "Register" on login page
2. Enter email and password (min 6 chars)
3. Account created in Firebase
4. Automatic dashboard setup

### Login
1. Enter email and password
2. Previous dashboard is restored
3. Changes sync in real-time

### Logout
- Click logout button in header
- Session ends securely
- Password never stored locally

## 📊 Dashboard Features

### Widgets Included

1. **Clock** - Current time with timezone
2. **Search** - Quick web search
3. **Weather** - Current weather & forecast
4. **Quick Links** - Custom bookmarks
5. **Smart Briefing** - AI-powered daily briefing
6. **News** - Hackernews feed
7. **YouTube** - Channel subscriptions
8. **Email** - Gmail integration
9. **Calendar** - Google Calendar integration
10. **Water Tracker** - Daily hydration goals
11. **Work Tracker** - Time & earnings tracker
12. **Work Reports** - Analytics & charts
13. **Chat** - AI chat widget
14. **Currency** - Exchange rates
15. **Countdown** - Event countdowns
16. **Services** - Status checker
17. **Dark Mode** - Theme toggle

### Customization

1. **Edit Mode**: Click pencil icon to enter edit mode
2. **Add Widgets**: Select from available widgets
3. **Remove Widgets**: Click trash icon on widget
4. **Resize Widgets**: Drag bottom-right corner
5. **Reorder**: Drag widgets to new positions
6. **Reset**: Restore default layout

### Auto-Save

- Dashboard saves automatically (1-second debounce)
- Settings saved to Firestore
- Layout saved to Realtime Database
- Changes sync across devices instantly

## 🔄 Data Flow

```
User Action
    ↓
State Update (React)
    ↓
Debounce (1 second)
    ↓
Firebase Sync
    ├─ Realtime DB (Layout & Widgets)
    └─ Firestore (Settings & Profile)
    ↓
Real-time Listeners
    ↓
All Devices Updated

4. View your total hours and earnings in the widget header
5. Configure your hourly rate in the widget settings (gear icon)

### Work Reports Widget

- Add the **📈 Work Reports** widget to see a chart of your weekly totals
- Charts automatically update as you log sessions

### Customizing Your Dashboard

**Edit Mode** (click the Edit Mode button):
- **Add widgets**: Click widget names to add them
- **Remove widgets**: Click the red trash icon on a widget
- **Cycle size**: Click the size-cycle button (top-left of each widget)
- **Drag to resize**: Grab the handle (bottom-right) and drag horizontally to resize widgets
- **Drag to reorder**: Click and hold the drag handle (⋮) inside a widget and move it

### Available Widgets

- **Clock**: Display current time
- **Search**: Quick search bar
- **Weather**: Current weather and forecast
- **Quick Links**: Bookmarks and shortcuts
- **Smart Briefing**: AI-powered daily summary (via Gemini API)
- **News**: Hacker News feed
- **YouTube**: Latest videos from subscribed channels
- **Email**: Gmail integration (requires OAuth)
- **Calendar**: Google Calendar events
- **Water Tracker**: Daily water intake tracker
- **Work Tracker**: Log work sessions and track earnings
- **Work Reports**: Weekly/monthly charts
- **Dark Mode**: Toggle dark/light theme

## Storage

All data is stored locally in your browser using **localStorage**:
- `smart-glance-settings`: User preferences (name, temperature unit)
- `smart-glance-layout`: Widget order and sizes
- `smart-glance-configs`: Widget-specific data (work sessions, weather, etc.)

**Note**: Data is device-specific and not synced across devices. Future upgrades will add cloud sync and SQLite-based storage.

## API Keys & Integrations

### Google Gemini (Smart Briefing)

Add your API key to `.env`:

```env
VITE_GEMINI_API_KEY=your_key_here
```

Get your key from [Google AI Studio](https://aistudio.google.com).

### Google OAuth (Gmail, Calendar)

For full email and calendar integration, set up OAuth 2.0 credentials in Google Cloud Console. Instructions are in the respective widget settings.

## Performance

- **Lazy loading**: Widgets load data on-demand
- **Memoization**: Components optimize re-renders
- **Efficient grid**: CSS Grid for responsive layout with auto-placement

## Accessibility

- ARIA labels and regions for screen readers
- Keyboard navigation and focus management
- Focus-visible styling on interactive elements
- Touch-friendly hit targets (minimum 44px)
- Semantic HTML structure

## Code Quality

- **TypeScript**: Full type safety
- **ESLint & Prettier**: Code formatting and linting
- **React Best Practices**: Hooks, memoization, and proper key usage
- **Clean Component Structure**: Modular, reusable components

## Tech Stack

- **React 18**: UI library
- **TypeScript**: Type safety
- **TailwindCSS**: Styling
- **Vite**: Build tool
- **dnd-kit**: Drag & drop
- **Chart.js & react-chartjs-2**: Charts
- **Lucide React**: Icons

## Project Structure

```
/components
  /widgets          - Individual widget components
  Widget.tsx        - Base widget container
  SortableWidget.tsx - Drag/resize wrapper
  SettingsModal.tsx - Global settings

/services
  gemini.ts         - Gemini API integration
  theme.ts          - Dark mode
  youtube.ts        - YouTube API

/types.ts           - TypeScript interfaces
/App.tsx            - Main app component
```

## Roadmap

- [ ] Client-side SQLite (sql.js) with IndexedDB persistence
- [ ] Screenshot widget
- [ ] Project-based time tracking and invoicing
- [ ] Export/import data (CSV, JSON)
- [ ] Cloud sync (Google Drive, GitHub)
- [ ] More integrations (Toggl, Slack, etc.)
- [ ] Tests and CI/CD pipeline

## Contributing

Contributions welcome! Please open issues or PRs for bugs, features, or improvements.

## License

MIT


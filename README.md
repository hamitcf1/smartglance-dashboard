# SmartGlance Dashboard

A modern, responsive personal dashboard built with React, TypeScript, and TailwindCSS. Track your work hours, earnings, view reports, and manage widgets with a beautiful, customizable interface.

## Features

- **🎨 Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **⏱️ Work Tracker**: Log work sessions, track hours, and calculate earnings in real-time
- **📊 Work Reports**: View weekly and monthly totals with interactive charts
- **🎯 Drag & Drop**: Reorder widgets by dragging them
- **↔️ Drag-to-Resize**: Resize widgets by dragging the bottom-right handle (edit mode)
- **🌙 Dark Mode**: Beautiful dark theme with auto-detection
- **⚙️ Edit Mode**: Customize your dashboard layout
- **💾 Persistent Storage**: All data saved locally via localStorage
- **♿ Accessible**: ARIA labels, keyboard navigation, and focus management
- **📱 Mobile-First**: Optimized for all screen sizes

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will open at [http://localhost:5173](http://localhost:5173) (or the next available port).

### Build

```bash
npm run build
npm run preview
```

## Usage

### Work Tracker Widget

1. Click the **Edit Mode** button (pencil icon) in the header
2. Add the **💼 Work Tracker** widget
3. Use the timer:
   - Click **Start** to begin tracking
   - Click **Stop** to save the session
   - Or manually add hours using the input field
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


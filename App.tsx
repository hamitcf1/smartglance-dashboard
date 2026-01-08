import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, LayoutGrid, Edit2, Trash2, X, LogOut, Save } from 'lucide-react';
import { useTheme } from './services/theme';
import { firebaseAuthService } from './services/firebaseAuth';
import { realtimeDBService } from './services/realtimeDB';
import { firestoreUserService } from './services/firestoreUser';
import { Login } from './components/Login';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';

import { ClockWidget } from './components/widgets/ClockWidget';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { SmartBriefingWidget } from './components/widgets/SmartBriefingWidget';
import { NewsWidget } from './components/widgets/NewsWidget';
import { QuickLinksWidget } from './components/widgets/QuickLinksWidget';
import { SearchWidget } from './components/widgets/SearchWidget';
import { YouTubeWidget } from './components/widgets/YouTubeWidget';
import { EmailWidget } from './components/widgets/EmailWidget';
import { CalendarWidget } from './components/widgets/CalendarWidget';
import { WaterTrackerWidget } from './components/widgets/WaterTrackerWidget';
import { DarkModeWidget } from './components/widgets/DarkModeWidget';
import { WorkTrackerWidget } from './components/widgets/WorkTrackerWidget';
import { WorkReportsWidget } from './components/widgets/WorkReportsWidget';
import { ChatWidget } from './components/widgets/ChatWidget';
import { CurrencyWidget } from './components/widgets/CurrencyWidget';
import { CountdownWidget } from './components/widgets/CountdownWidget';
import { ServicesWidget } from './components/widgets/ServicesWidget';
import { SettingsModal } from './components/SettingsModal';
import { SortableWidget } from './components/SortableWidget';
import { Onboarding } from './components/Onboarding';
import { UserSettings, WidgetInstance, WidgetConfig } from './types';

// Default layout
const DEFAULT_WIDGETS: WidgetInstance[] = [
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

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'User',
  useCelsius: true,
  showNews: true,
  showWeather: true,
  showBriefing: true,
  showLinks: true,
};

export default function App() {
  // --- Authentication State ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // --- Onboarding State ---
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // --- State ---
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [widgets, setWidgets] = useState<WidgetInstance[]>(DEFAULT_WIDGETS);
  const [configs, setConfigs] = useState<Record<string, WidgetConfig>>({});

  const [activeId, setActiveId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { themeName } = useTheme();
  
  // Track open settings per widget
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);

  // --- Initialize Firebase Auth Listener ---
  useEffect(() => {
    const unsubscribe = firebaseAuthService.onAuthStateChange((user) => {
      if (user) {
        setCurrentUser(user);
        loadUserData(user.uid);
      } else {
        setCurrentUser(null);
        setIsDataLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Load user data from Firebase ---
  const loadUserData = async (uid: string) => {
    setIsDataLoading(true);
    try {
      // Load from Realtime DB
      const dbState = await realtimeDBService.getDashboardState(uid);
      if (dbState) {
        // Only update if different
        if (JSON.stringify(widgets) !== JSON.stringify(dbState.widgets)) {
          setWidgets(dbState.widgets);
        }
        if (JSON.stringify(configs) !== JSON.stringify(dbState.configs)) {
          setConfigs(dbState.configs);
        }
      } else {
        // First time user - set defaults
        await realtimeDBService.saveDashboardState(uid, DEFAULT_WIDGETS, {});
        setWidgets(DEFAULT_WIDGETS);
        setConfigs({});
      }

      // Load user profile from Firestore
      const profile = await firestoreUserService.getUserProfile(uid);
      if (profile) {
        if (JSON.stringify(settings) !== JSON.stringify(profile.settings)) {
          setSettings(profile.settings);
        }
        setHasCompletedOnboarding(true);
      } else {
        // New user - create profile
        const defaultProfile = {
          uid,
          email: currentUser?.email || '',
          displayName: currentUser?.displayName || 'User',
          settings: DEFAULT_SETTINGS,
          defaultTemplate: 'default',
        };
        await firestoreUserService.createOrUpdateUserProfile(uid, defaultProfile);
        setSettings(DEFAULT_SETTINGS);
        setHasCompletedOnboarding(false);
      }

      // Subscribe to real-time updates
      const unsubscribe = realtimeDBService.onDashboardChange(uid, (state) => {
        if (JSON.stringify(widgets) !== JSON.stringify(state.widgets)) {
          setWidgets(state.widgets);
        }
        if (JSON.stringify(configs) !== JSON.stringify(state.configs)) {
          setConfigs(state.configs);
        }
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  // --- Initialize theme on mount ---
  useEffect(() => {
    const saved = localStorage.getItem('smart-glance-theme-name') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  // --- Auto-save to Firebase (debounced) ---
  useEffect(() => {
    if (!currentUser || isDataLoading) return;

    const saveTimer = setTimeout(async () => {
      setIsSyncing(true);
      try {
        await realtimeDBService.saveDashboardState(currentUser.uid, widgets, configs);
      } catch (error) {
        console.error('Error syncing dashboard state:', error);
      } finally {
        setIsSyncing(false);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(saveTimer);
  }, [widgets, configs, currentUser, isDataLoading]);

  // --- Auto-save settings to Firestore ---
  useEffect(() => {
    if (!currentUser || isDataLoading) return;

    const saveTimer = setTimeout(async () => {
      try {
        await firestoreUserService.updateUserSettings(currentUser.uid, settings);
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [settings, currentUser, isDataLoading]);

  // --- Authentication Handler ---
  const handleLogin = async (email: string, password: string, isRegister = false) => {
    setIsAuthLoading(true);
    setAuthError('');

    try {
      const result = isRegister 
        ? await firebaseAuthService.register(email, password)
        : await firebaseAuthService.login(email, password);

      if (result.success) {
        // Auth state listener will handle the rest
      } else {
        setAuthError(result.error || 'Authentication failed');
      }
    } catch (error) {
      setAuthError('An unexpected error occurred');
      console.error('Auth error:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        realtimeDBService.unsubscribe(currentUser.uid);
        await firebaseAuthService.logout();
        setCurrentUser(null);
        setAuthError('');
      } catch (error) {
        setAuthError('Error during logout');
        console.error('Logout error:', error);
      }
    }
  };

  // --- Onboarding Handler ---
  const handleOnboardingComplete = async (
    newSettings: UserSettings,
    newWidgets: WidgetInstance[],
    newConfigs: Record<string, WidgetConfig>
  ) => {
    setSettings(newSettings);
    setWidgets(newWidgets);
    setConfigs(newConfigs);
    setHasCompletedOnboarding(true);

    // Save to Firebase
    if (currentUser) {
      try {
        await firestoreUserService.updateUserSettings(currentUser.uid, newSettings);
        await realtimeDBService.saveDashboardState(currentUser.uid, newWidgets, newConfigs);
      } catch (error) {
        console.error('Error saving onboarding data:', error);
      }
    }
  };

  // --- Handlers ---
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const updateWidgetConfig = (id: string, newConfig: Partial<WidgetConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...newConfig }
    }));
  };

  const updateWidgetSize = (id: string, newSize: 'small' | 'medium' | 'large') => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, size: newSize } : w));
  };

  const toggleWidgetSettings = (id: string) => {
    setOpenSettingsId(prev => prev === id ? null : id);
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const addWidget = (type: string) => {
    const newId = `${type}-${Date.now()}`;
    const newWidget: WidgetInstance = {
      id: newId,
      type: type as any,
      size: 'medium'
    };
    setWidgets(prev => [...prev, newWidget]);
  };

  const resetDashboard = () => {
    if (window.confirm('Reset dashboard to default? This cannot be undone.')) {
      setWidgets(DEFAULT_WIDGETS);
      setConfigs({});
      setIsEditMode(false);
    }
  };

  // --- Drag and Drop ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  // --- Rendering ---
  const renderWidget = (widget: WidgetInstance, isDragOverlay = false) => {
    const commonProps = {
      isSettingsOpen: openSettingsId === widget.id,
      onToggleSettings: () => toggleWidgetSettings(widget.id),
      onSizeChange: (s: any) => updateWidgetSize(widget.id, s),
      widgetSize: widget.size,
    };

    switch (widget.type) {
      case 'clock':
        return <ClockWidget {...commonProps} />;
      case 'search':
        return <SearchWidget {...commonProps} />;
      case 'weather':
        return (
          <WeatherWidget 
            {...commonProps}
            config={configs[widget.id] || {}}
            onConfigChange={(c) => updateWidgetConfig(widget.id, c)}
            refreshTrigger={refreshTrigger}
            useCelsius={settings.useCelsius}
          />
        );
      case 'links':
        return (
          <QuickLinksWidget 
            {...commonProps}
            config={configs[widget.id] || {}}
            onConfigChange={(c) => updateWidgetConfig(widget.id, c)}
          />
        );
      case 'briefing':
        return (
          <SmartBriefingWidget 
            {...commonProps}
            userName={settings.userName}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'news':
        return (
          <NewsWidget 
            {...commonProps}
            config={configs[widget.id] || {}}
            onConfigChange={(c) => updateWidgetConfig(widget.id, c)}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'youtube':
        return (
          <YouTubeWidget 
            {...commonProps}
            config={configs[widget.id] || {}}
            onConfigChange={(c) => updateWidgetConfig(widget.id, c)}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'email':
        return (
          <EmailWidget 
            {...commonProps}
            config={configs[widget.id] || {}}
            onConfigChange={(c) => updateWidgetConfig(widget.id, c)}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'calendar':
        return (
          <CalendarWidget 
            {...commonProps}
            config={configs[widget.id] || {}}
            onConfigChange={(c) => updateWidgetConfig(widget.id, c)}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'water':
        return (
          <WaterTrackerWidget 
            {...commonProps}
            config={configs[widget.id] || {}}
            onConfigChange={(c) => updateWidgetConfig(widget.id, c)}
          />
        );
      case 'work':
        return (
          <WorkTrackerWidget
            {...commonProps}
            config={configs[widget.id] || {}}
            onConfigChange={(c) => updateWidgetConfig(widget.id, c)}
          />
        );
      case 'work-reports':
        return (
          <WorkReportsWidget
            {...commonProps}
            config={configs[widget.id] || {}}
            onToggleSettings={() => toggleWidgetSettings(widget.id)}
          />
        );
      case 'darkmode':
        return (
          <DarkModeWidget 
            {...commonProps}
          />
        );
      case 'chat':
        return (
          <ChatWidget
            {...commonProps}
          />
        );
      case 'currency':
        return (
          <CurrencyWidget
            {...commonProps}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'countdown':
        return (
          <CountdownWidget
            {...commonProps}
          />
        );
      case 'services':
        return (
          <ServicesWidget
            {...commonProps}
            config={configs[widget.id] || {}}
            onConfigChange={(c) => updateWidgetConfig(widget.id, c)}
            refreshTrigger={refreshTrigger}
          />
        );
      default:
        return null;
    }
  };

  // Show loading screen
  if (!currentUser && isDataLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
      >
        <div className="text-center">
          <div className="animate-spin mb-4">⏳</div>
          <p>Loading SmartGlance...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!currentUser) {
    return <Login onLogin={handleLogin} isLoading={isAuthLoading} error={authError} />;
  }

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-6 h-6" style={{ color: 'var(--primary)' }} />
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            SmartGlance
          </h1>
        </div>
        <div className="flex gap-2 items-center">
          {isSyncing && (
            <div className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              Syncing...
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full transition-colors relative group"
            style={{ color: 'var(--text-secondary)', backgroundColor: 'transparent' }}
            title="Refresh Widgets"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: isRefreshing ? 'var(--primary)' : 'inherit' }} />
          </button>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="p-2 rounded-full transition-colors relative group"
            style={{ 
              color: isEditMode ? 'var(--primary)' : 'var(--text-secondary)',
              backgroundColor: isEditMode ? 'var(--primary)' : 'transparent',
              backgroundOpacity: isEditMode ? '0.2' : '1'
            }}
            title="Edit Mode"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsGlobalSettingsOpen(true)}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="App Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <main className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 auto-rows-min pb-20">
          <SortableContext 
            items={widgets.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            {widgets.map((widget) => (
              <SortableWidget key={widget.id} id={widget.id} widget={widget} isEditMode={isEditMode} onRemove={() => removeWidget(widget.id)} onSizeChange={(s) => updateWidgetSize(widget.id, s as any)}>
                {renderWidget(widget)}
              </SortableWidget>
            ))}
          </SortableContext>
        </main>

        <DragOverlay>
          {activeId ? (
            <div className="h-full">
              {renderWidget(widgets.find(w => w.id === activeId)!, true)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Edit Mode Panel */}
      {isEditMode && (
        <div 
          className="fixed bottom-20 left-0 right-0 border-t p-6 max-w-7xl mx-auto z-40"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>Add Widgets</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Select a widget to add to your dashboard</p>
              </div>
              <button
                onClick={() => setIsEditMode(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: 'var(--surface-alt)',
                  color: 'var(--text-secondary)'
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {['youtube', 'email', 'calendar', 'water', 'work', 'work-reports', 'chat', 'currency', 'darkmode'].map(type => {
                const isAdded = widgets.some(w => w.type === type);
                const labels: Record<string, string> = {
                  youtube: '📺 YouTube',
                  email: '📧 Gmail',
                  calendar: '📅 Calendar',
                  water: '💧 Water',
                  work: '💼 Work Tracker',
                  'work-reports': '📈 Work Reports',
                  chat: '💬 Chat',
                  currency: '💱 Currency',
                  darkmode: '🌙 Dark Mode'
                };

                return (
                  <button
                    key={type}
                    onClick={() => addWidget(type)}
                    disabled={isAdded}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed border"
                    style={{
                      backgroundColor: isAdded ? 'var(--surface-alt)' : 'var(--primary)',
                      color: isAdded ? 'var(--text-secondary)' : 'white',
                      borderColor: isAdded ? 'var(--border)' : 'var(--primary)',
                      opacity: isAdded ? 0.6 : 1
                    }}
                  >
                    {labels[type]} {isAdded && '✓'}
                  </button>
                );
              })}
            </div>

            <button
              onClick={resetDashboard}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors border"
              style={{
                backgroundColor: 'var(--surface-alt)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)'
              }}
            >
              Reset to Default Layout
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer 
        className="fixed bottom-0 left-0 right-0 p-4 text-center text-sm backdrop-blur-sm border-t pointer-events-none"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-secondary)'
        }}
      >
        <p>© {new Date().getFullYear()} SmartGlance. Powered by Google Gemini & Firebase.</p>
      </footer>

      {/* Global Settings Modal */}
      {isGlobalSettingsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setIsGlobalSettingsOpen(false)}
          onSave={setSettings}
          onRestartOnboarding={() => setHasCompletedOnboarding(false)}
        />
      )}
    </div>
  );
}

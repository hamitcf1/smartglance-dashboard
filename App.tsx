import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, LayoutGrid, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useTheme } from './services/theme';
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
  { id: 'darkmode', type: 'darkmode', size: 'small' },
];

const DEFAULT_SETTINGS: UserSettings = {
  userName: 'User',
  useCelsius: true,
  // These are now controlled by widget existence/layout, but kept for modal
  showNews: true,
  showWeather: true,
  showBriefing: true,
  showLinks: true,
};

export default function App() {
  // --- Onboarding State ---
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem('smart-glance-onboarding-complete') === 'true';
  });

  // --- State ---
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('smart-glance-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [widgets, setWidgets] = useState<WidgetInstance[]>(() => {
    const saved = localStorage.getItem('smart-glance-layout');
    // Simply return what's saved, or default if nothing saved
    // Do NOT auto-add missing widgets - respect user deletions
    return saved ? JSON.parse(saved) : DEFAULT_WIDGETS;
  });

  const [configs, setConfigs] = useState<Record<string, WidgetConfig>>(() => {
    const saved = localStorage.getItem('smart-glance-configs');
    return saved ? JSON.parse(saved) : {};
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Track open settings per widget
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('smart-glance-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('smart-glance-layout', JSON.stringify(widgets));
  }, [widgets]);

  useEffect(() => {
    localStorage.setItem('smart-glance-configs', JSON.stringify(configs));
  }, [configs]);

  // --- Onboarding Handler ---
  const handleOnboardingComplete = (
    newSettings: UserSettings,
    newWidgets: WidgetInstance[],
    newConfigs: Record<string, WidgetConfig>
  ) => {
    setSettings(newSettings);
    setWidgets(newWidgets);
    setConfigs(newConfigs);
    setHasCompletedOnboarding(true);
  };

  // --- Handlers ---
  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000); // Visual feedback duration
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
      default:
        return null;
    }
  };

  const { isDarkMode } = useTheme();

  const bgClasses = isDarkMode
    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white'
    : 'bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900';

  const headerIconClasses = isDarkMode 
    ? 'text-indigo-400'
    : 'text-indigo-600';

  const buttonHoverClasses = isDarkMode
    ? 'hover:bg-white/10 text-slate-400 hover:text-white'
    : 'hover:bg-slate-300/50 text-slate-600 hover:text-slate-900';

  // Show onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className={`min-h-screen ${bgClasses} p-4 sm:p-8`}>
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <LayoutGrid className={`w-6 h-6 ${headerIconClasses}`} />
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
            SmartGlance
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className={`p-2 rounded-full transition-colors relative group ${buttonHoverClasses}`}
            title="Refresh Widgets"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`p-2 rounded-full transition-colors relative group ${
              isEditMode 
                ? 'bg-indigo-600/20 text-indigo-400' 
                : buttonHoverClasses
            }`}
            title="Edit Mode"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsGlobalSettingsOpen(true)}
            className={`p-2 rounded-full transition-colors ${buttonHoverClasses}`}
            title="App Settings"
          >
            <Settings className="w-5 h-5" />
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
        <div className={`fixed bottom-20 left-0 right-0 ${isDarkMode ? 'bg-slate-800/95 border-white/10' : 'bg-slate-200/95 border-slate-300/50'} border-t p-6 max-w-7xl mx-auto`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Add Widgets</h3>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Select a widget to add to your dashboard</p>
              </div>
              <button
                onClick={() => setIsEditMode(false)}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-300'}`}
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {['youtube', 'email', 'calendar', 'water', 'work', 'work-reports', 'darkmode'].map(type => {
                const isAdded = widgets.some(w => w.type === type);
                const labels: Record<string, string> = {
                  youtube: '📺 YouTube',
                  email: '📧 Gmail',
                  calendar: '📅 Calendar',
                  water: '💧 Water',
                  work: '💼 Work Tracker',
                  'work-reports': '📈 Work Reports',
                  darkmode: '🌙 Dark Mode'
                };

                return (
                  <button
                    key={type}
                    onClick={() => addWidget(type)}
                    disabled={isAdded}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isAdded
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {labels[type]} {isAdded && '✓'}
                  </button>
                );
              })}
            </div>

            <button
              onClick={resetDashboard}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-colors"
            >
              Reset to Default Layout
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 text-center text-slate-600 text-sm bg-slate-900/80 backdrop-blur-sm border-t border-white/5 pointer-events-none">
        <p>© {new Date().getFullYear()} SmartGlance. Powered by Google Gemini.</p>
      </footer>

      {/* Global Settings Modal */}
      {isGlobalSettingsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setIsGlobalSettingsOpen(false)}
          onSave={setSettings}
        />
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, MapPin, Clock, Heart, Youtube, Check } from 'lucide-react';
import { UserSettings, WidgetInstance, QuickLink, YouTubeConfig } from '../types';

interface OnboardingProps {
  onComplete: (settings: UserSettings, widgets: WidgetInstance[], configs: Record<string, any>) => void;
}

const AVAILABLE_WIDGETS = [
  { type: 'clock', label: '🕐 Clock', description: 'Digital & Analog time display' },
  { type: 'weather', label: '🌤️ Weather', description: 'Live weather information' },
  { type: 'news', label: '📰 News', description: 'Hacker News feed' },
  { type: 'briefing', label: '✨ Smart Briefing', description: 'AI-powered daily briefing' },
  { type: 'links', label: '🔗 Quick Links', description: 'Customizable shortcuts' },
  { type: 'search', label: '🔍 Search', description: 'Quick web search' },
  { type: 'youtube', label: '📺 YouTube', description: 'Channel subscriptions' },
  { type: 'email', label: '📧 Email', description: 'Gmail integration' },
  { type: 'calendar', label: '📅 Calendar', description: 'Calendar view' },
  { type: 'water', label: '💧 Water Tracker', description: 'Hydration tracking' },
  { type: 'work', label: '💼 Work Tracker', description: 'Work sessions & billing' },
  { type: 'work-reports', label: '📈 Work Reports', description: 'Work analytics' },
  { type: 'countdown', label: '⏳ Countdown', description: 'Event countdown timer' },
  { type: 'darkmode', label: '🌙 Dark Mode', description: 'Theme toggle' },
  { type: 'chat', label: '💬 Gemini Chat', description: 'AI conversation with Gemini' },
  { type: 'currency', label: '💱 Currency Rates', description: 'USD, EUR, GBP, Gold, Silver' },
  { type: 'services', label: '🔗 Services', description: '.arr services status monitor' },
];

const COMMON_TIMEZONES = [
  { label: 'UTC', value: 'UTC' },
  { label: 'New York (EST)', value: 'America/New_York' },
  { label: 'London (GMT)', value: 'Europe/London' },
  { label: 'Paris (CET)', value: 'Europe/Paris' },
  { label: 'Istanbul (EET)', value: 'Europe/Istanbul' },
  { label: 'Dubai (GST)', value: 'Asia/Dubai' },
  { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
  { label: 'Sydney (AEDT)', value: 'Australia/Sydney' },
  { label: 'Los Angeles (PST)', value: 'America/Los_Angeles' },
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light' | 'dracula' | 'nord' | 'solarized'>('dark');
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([
    'clock', 'search', 'weather', 'links', 'briefing', 'news'
  ]);
  const [timezone, setTimezone] = useState('UTC');
  const [useCelsius, setUseCelsius] = useState(true);
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([
    { id: '1', name: 'Google', url: 'https://google.com' },
    { id: '2', name: 'GitHub', url: 'https://github.com' },
  ]);
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [youtubeChannels, setYoutubeChannels] = useState<Array<{ id: string; name: string }>>([
    { id: 'UC1234567890', name: 'Example Channel' },
  ]);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelId, setNewChannelId] = useState('');
  const [youtubeSearchQuery, setYoutubeSearchQuery] = useState('');
  const [youtubeSearchResults, setYoutubeSearchResults] = useState<Array<{ id: string; name: string; thumbnail?: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Apply theme when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleWidget = (type: string) => {
    setSelectedWidgets(prev =>
      prev.includes(type)
        ? prev.filter(w => w !== type)
        : [...prev, type]
    );
  };

  const addQuickLink = () => {
    if (newLinkName.trim() && newLinkUrl.trim()) {
      setQuickLinks(prev => [...prev, {
        id: Date.now().toString(),
        name: newLinkName,
        url: newLinkUrl
      }]);
      setNewLinkName('');
      setNewLinkUrl('');
    }
  };

  const removeQuickLink = (id: string) => {
    setQuickLinks(prev => prev.filter(l => l.id !== id));
  };

  const addYoutubeChannel = () => {
    if (newChannelName.trim() && newChannelId.trim()) {
      setYoutubeChannels(prev => [...prev, {
        id: newChannelId,
        name: newChannelName
      }]);
      setNewChannelName('');
      setNewChannelId('');
    }
  };

  const removeYoutubeChannel = (id: string) => {
    setYoutubeChannels(prev => prev.filter(c => c.id !== id));
  };

  const extractChannelIdFromUrl = (url: string): string | null => {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/channel\/|youtube\.com\/c\/|youtube\.com\/user\/)([a-zA-Z0-9_-]+)/,
      /youtube\.com\/@([a-zA-Z0-9_-]+)/,
      /youtube\.com\/(?:channel\/)?([a-zA-Z0-9_-]+)/,
      /^(UC[a-zA-Z0-9_-]{22})/, // Direct channel ID format
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const searchYoutubeChannels = async (query: string) => {
    if (!query.trim()) {
      setYoutubeSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Usando a simple mock search with YouTube's public data
      // For real implementation, you'd need YouTube Data API v3
      const response = await fetch(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAg%3D%3D`,
        { mode: 'no-cors' }
      );
      
      // Since we can't directly parse YouTube without API, show helpful message
      setYoutubeSearchResults([
        {
          id: 'manual-' + Date.now(),
          name: `Copy the channel URL from YouTube and paste it below`,
          thumbnail: '🔗'
        }
      ]);
    } catch (error) {
      console.error('Search failed:', error);
      setYoutubeSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleYoutubeSearchResult = (channelId: string, channelName: string) => {
    setNewChannelId(channelId);
    setNewChannelName(channelName);
    setYoutubeSearchQuery('');
    setYoutubeSearchResults([]);
  };

  const handleComplete = () => {
    const settings: UserSettings = {
      userName: name || 'User',
      useCelsius,
      showNews: selectedWidgets.includes('news'),
      showWeather: selectedWidgets.includes('weather'),
      showBriefing: selectedWidgets.includes('briefing'),
      showLinks: selectedWidgets.includes('links'),
    };

    const widgets: WidgetInstance[] = selectedWidgets.map((type, idx) => ({
      id: type,
      type: type as any,
      size: ['large', 'briefing', 'news', 'youtube', 'calendar', 'work', 'work-reports', 'services'].includes(type) ? 'large' : 'small',
    }));

    const configs: Record<string, any> = {
      weather: { useAutoLocation: true },
      links: { links: quickLinks },
      youtube: { channels: youtubeChannels, videoCount: 6 },
    };

    // Save theme selection
    localStorage.setItem('smart-glance-theme-name', theme);
    localStorage.setItem('smart-glance-onboarding-complete', 'true');
    onComplete(settings, widgets, configs);
  };

  const handleSkip = () => {
    const defaultSettings: UserSettings = {
      userName: 'User',
      useCelsius: true,
      showNews: true,
      showWeather: true,
      showBriefing: true,
      showLinks: true,
    };
    
    const defaultWidgets: WidgetInstance[] = [
      { id: 'clock', type: 'clock', size: 'medium' },
      { id: 'search', type: 'search', size: 'medium' },
      { id: 'weather', type: 'weather', size: 'small' },
      { id: 'links', type: 'links', size: 'small' },
      { id: 'briefing', type: 'briefing', size: 'large' },
      { id: 'news', type: 'news', size: 'large' },
    ];

    localStorage.setItem('smart-glance-onboarding-complete', 'true');
    onComplete(defaultSettings, defaultWidgets, {});
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: 'var(--bg)'
      }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Welcome to <span style={{ color: 'var(--primary)' }}>SmartGlance</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Personalize your dashboard in {5 - (step - 1)} step{5 - (step - 1) === 1 ? '' : 's'}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor: s <= step ? 'var(--primary)' : 'var(--border)'
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div 
          className="backdrop-blur-md border rounded-2xl p-8 mb-8 min-h-96"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          {/* Step 1: Name & Username */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>What's your name?</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Let's personalize your SmartGlance experience</p>
              </div>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  focusRingColor: 'var(--primary)'
                }}
                autoFocus
              />

              <div 
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderColor: 'var(--border)'
                }}
              >
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  💡 <strong style={{ color: 'var(--text)' }}>Tip:</strong> You can change your name in settings anytime
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Theme Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Choose a theme</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Select your preferred color scheme</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['dark', 'light', 'dracula', 'nord', 'solarized'] as const).map(t => {
                  const themeNames: Record<string, string> = {
                    dark: '🌙 Dark (Default)',
                    light: '☀️ Light',
                    dracula: '🧛 Dracula',
                    nord: '❄️ Nord',
                    solarized: '🌅 Solarized'
                  };
                  
                  return (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className="p-4 rounded-lg border-2 transition-all text-left"
                      style={{
                        backgroundColor: theme === t ? 'var(--primary)' : 'var(--surface-alt)',
                        borderColor: theme === t ? 'var(--primary)' : 'var(--border)',
                        color: theme === t ? 'white' : 'var(--text)',
                        opacity: 1,
                        boxShadow: theme === t ? `0 0 12px var(--primary)` : 'none'
                      }}
                    >
                      <h3 className="font-semibold" style={{ color: theme === t ? 'white' : 'var(--text)' }}>{themeNames[t]}</h3>
                      {theme === t && <Check className="w-5 h-5 mt-2" style={{ color: 'white' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Widget Selection */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Choose your widgets</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Select the ones you'd like to see on your dashboard</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {AVAILABLE_WIDGETS.map(widget => (
                  <button
                    key={widget.type}
                    onClick={() => toggleWidget(widget.type)}
                    className="p-4 rounded-lg border-2 transition-all text-left"
                    style={{
                      backgroundColor: selectedWidgets.includes(widget.type) ? 'var(--primary)' : 'var(--surface-alt)',
                      borderColor: selectedWidgets.includes(widget.type) ? 'var(--primary)' : 'var(--border)',
                      color: selectedWidgets.includes(widget.type) ? 'white' : 'var(--text)',
                      boxShadow: selectedWidgets.includes(widget.type) ? `0 0 12px var(--primary)` : 'none'
                    }}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold" style={{ color: selectedWidgets.includes(widget.type) ? 'white' : 'var(--text)' }}>{widget.label}</h3>
                      {selectedWidgets.includes(widget.type) && (
                        <Check className="w-5 h-5" style={{ color: 'white' }} />
                      )}
                    </div>
                    <p className="text-xs" style={{ color: selectedWidgets.includes(widget.type) ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)' }}>{widget.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Location & Timezone */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Location & Time</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Configure your timezone and temperature units</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    <Clock className="w-4 h-4 inline mr-2" />
                    Select Your Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{
                      backgroundColor: 'var(--surface-alt)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    {COMMON_TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text)' }}>
                    Temperature Unit
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setUseCelsius(true)}
                      className="flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium"
                      style={{
                        backgroundColor: useCelsius ? 'var(--primary)' : 'var(--surface-alt)',
                        borderColor: useCelsius ? 'var(--primary)' : 'var(--border)',
                        color: useCelsius ? 'white' : 'var(--text)'
                      }}
                    >
                      °C Celsius
                    </button>
                    <button
                      onClick={() => setUseCelsius(false)}
                      className="flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium"
                      style={{
                        backgroundColor: !useCelsius ? 'var(--primary)' : 'var(--surface-alt)',
                        borderColor: !useCelsius ? 'var(--primary)' : 'var(--border)',
                        color: !useCelsius ? 'white' : 'var(--text)'
                      }}
                    >
                      °F Fahrenheit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Quick Links */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Quick Links</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Add shortcuts to your favorite websites</p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Link name (e.g., Google)"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--surface-alt)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)'
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="URL (e.g., https://google.com)"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--surface-alt)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)'
                    }}
                  />
                  <button
                    onClick={addQuickLink}
                    className="px-6 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'white'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {quickLinks.map(link => (
                  <div 
                    key={link.id} 
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--surface-alt)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: 'var(--text)' }}>{link.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{link.url}</p>
                    </div>
                    <button
                      onClick={() => removeQuickLink(link.id)}
                      className="ml-2 p-2 rounded-lg transition-colors hover:bg-red-600/20"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: YouTube Channels */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>YouTube Channels</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Add your favorite YouTube channels (optional)</p>
              </div>

              <div 
                className="border rounded-lg p-3 text-sm"
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                <p>💡 <strong style={{ color: 'var(--text)' }}>Tip:</strong> You can either search by channel name or paste a YouTube channel URL</p>
              </div>

              <div className="space-y-3">
                {/* Search by Channel Name */}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Search by Channel Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., YouTube Creators, MrBeast"
                      value={youtubeSearchQuery}
                      onChange={(e) => {
                        setYoutubeSearchQuery(e.target.value);
                        if (e.target.value.trim()) {
                          searchYoutubeChannels(e.target.value);
                        } else {
                          setYoutubeSearchResults([]);
                        }
                      }}
                      className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--surface-alt)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)'
                      }}
                    />
                    <button
                      onClick={() => searchYoutubeChannels(youtubeSearchQuery)}
                      disabled={!youtubeSearchQuery.trim() || isSearching}
                      className="px-4 py-2 rounded-lg font-medium transition-colors"
                      style={{
                        backgroundColor: 'var(--surface-alt)',
                        color: 'var(--text)',
                        opacity: !youtubeSearchQuery.trim() || isSearching ? 0.5 : 1
                      }}
                    >
                      {isSearching ? '🔍' : 'Search'}
                    </button>
                  </div>

                  {youtubeSearchResults.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {youtubeSearchResults.map(result => (
                        <button
                          key={result.id}
                          onClick={() => handleYoutubeSearchResult(result.id, result.name)}
                          className="w-full p-3 rounded-lg text-left transition-colors border"
                          style={{
                            backgroundColor: 'var(--surface-alt)',
                            borderColor: 'var(--primary)',
                            color: 'var(--text)'
                          }}
                        >
                          <p className="font-medium text-sm">{result.name}</p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{result.id}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Or Paste Channel URL */}
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>Or Paste Channel URL</label>
                  <input
                    type="text"
                    placeholder="e.g., youtube.com/@channelname or youtube.com/channel/UCxxx"
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      const extractedId = extractChannelIdFromUrl(pastedText);
                      if (extractedId) {
                        setNewChannelId(extractedId);
                        setYoutubeSearchQuery('');
                        setYoutubeSearchResults([]);
                      }
                    }}
                    onChange={(e) => {
                      const extractedId = extractChannelIdFromUrl(e.target.value);
                      if (extractedId) {
                        setNewChannelId(extractedId);
                      }
                    }}
                    className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--surface-alt)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)'
                    }}
                  />
                </div>

                {/* Manual Entry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Channel name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--surface-alt)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Channel ID (UCxxxxxx...)"
                    value={newChannelId}
                    onChange={(e) => setNewChannelId(e.target.value)}
                    className="px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--surface-alt)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      border: '1px solid var(--border)'
                    }}
                  />
                </div>

                <button
                  onClick={addYoutubeChannel}
                  disabled={!newChannelName.trim() || !newChannelId.trim()}
                  className="w-full px-6 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    opacity: !newChannelName.trim() || !newChannelId.trim() ? 0.5 : 1
                  }}
                >
                  Add Channel
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                {youtubeChannels.map(channel => (
                  <div 
                    key={channel.id} 
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{
                      backgroundColor: 'var(--surface-alt)',
                      borderColor: 'var(--border)'
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium" style={{ color: 'var(--text)' }}>{channel.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{channel.id}</p>
                    </div>
                    <button
                      onClick={() => removeYoutubeChannel(channel.id)}
                      className="ml-2 p-2 rounded-lg transition-colors hover:bg-red-600/20"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => {
              if (step > 1) setStep(step - 1);
            }}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors border"
            style={{
              color: step === 1 ? 'var(--text-secondary)' : 'var(--text)',
              borderColor: step === 1 ? 'var(--border)' : 'var(--border)',
              opacity: step === 1 ? 0.5 : 1,
              cursor: step === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleSkip}
            className="px-6 py-3 transition-colors font-medium"
            style={{
              color: 'var(--text-secondary)'
            }}
          >
            Skip Setup
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white'
              }}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white'
              }}
            >
              Complete
              <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

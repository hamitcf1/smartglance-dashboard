import React, { useState } from 'react';
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
  { type: 'darkmode', label: '🌙 Dark Mode', description: 'Theme toggle' },
  { type: 'chat', label: '💬 Gemini Chat', description: 'AI conversation with Gemini' },
  { type: 'currency', label: '💱 Currency Rates', description: 'USD, EUR, GBP, Gold, Silver' },
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
      size: ['large', 'briefing', 'news', 'youtube', 'calendar', 'work', 'work-reports'].includes(type) ? 'large' : 'small',
    }));

    const configs: Record<string, any> = {
      weather: { useAutoLocation: true },
      links: { links: quickLinks },
      youtube: { channels: youtubeChannels, videoCount: 6 },
    };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">SmartGlance</span>
          </h1>
          <p className="text-slate-400">Personalize your dashboard in {5 - (step - 1)} step{5 - (step - 1) === 1 ? '' : 's'}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-8 min-h-96">
          {/* Step 1: Name & Username */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">What's your name?</h2>
                <p className="text-slate-400">Let's personalize your SmartGlance experience</p>
              </div>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
              />

              <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-600/50">
                <p className="text-sm text-slate-300">
                  💡 <strong>Tip:</strong> You can change your name in settings anytime
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Widget Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Choose your widgets</h2>
                <p className="text-slate-400">Select the ones you'd like to see on your dashboard</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {AVAILABLE_WIDGETS.map(widget => (
                  <button
                    key={widget.type}
                    onClick={() => toggleWidget(widget.type)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedWidgets.includes(widget.type)
                        ? 'bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/50'
                        : 'bg-slate-700/30 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-white">{widget.label}</h3>
                      {selectedWidgets.includes(widget.type) && (
                        <Check className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{widget.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Location & Timezone */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Location & Time</h2>
                <p className="text-slate-400">Configure your timezone and temperature units</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Select Your Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {COMMON_TIMEZONES.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Temperature Unit
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setUseCelsius(true)}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                        useCelsius
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      °C Celsius
                    </button>
                    <button
                      onClick={() => setUseCelsius(false)}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all font-medium ${
                        !useCelsius
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      °F Fahrenheit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Quick Links */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Quick Links</h2>
                <p className="text-slate-400">Add shortcuts to your favorite websites</p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Link name (e.g., Google)"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="URL (e.g., https://google.com)"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={addQuickLink}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {quickLinks.map(link => (
                  <div key={link.id} className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{link.name}</p>
                      <p className="text-xs text-slate-400 truncate">{link.url}</p>
                    </div>
                    <button
                      onClick={() => removeQuickLink(link.id)}
                      className="ml-2 p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: YouTube Channels */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">YouTube Channels</h2>
                <p className="text-slate-400">Add your favorite YouTube channels (optional)</p>
              </div>

              <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-3 text-sm text-slate-300">
                <p>💡 <strong>Tip:</strong> You can either search by channel name or paste a YouTube channel URL</p>
              </div>

              <div className="space-y-3">
                {/* Search by Channel Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Search by Channel Name</label>
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
                      className="flex-1 px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => searchYoutubeChannels(youtubeSearchQuery)}
                      disabled={!youtubeSearchQuery.trim() || isSearching}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
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
                          className="w-full p-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-left transition-colors"
                        >
                          <p className="font-medium text-white text-sm">{result.name}</p>
                          <p className="text-xs text-slate-400">{result.id}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Or Paste Channel URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2">Or Paste Channel URL</label>
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
                    className="w-full px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Manual Entry */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Channel name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Channel ID (UCxxxxxx...)"
                    value={newChannelId}
                    onChange={(e) => setNewChannelId(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={addYoutubeChannel}
                  disabled={!newChannelName.trim() || !newChannelId.trim()}
                  className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  Add Channel
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                {youtubeChannels.map(channel => (
                  <div key={channel.id} className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white">{channel.name}</p>
                      <p className="text-xs text-slate-400">{channel.id}</p>
                    </div>
                    <button
                      onClick={() => removeYoutubeChannel(channel.id)}
                      className="ml-2 p-2 hover:bg-red-600/20 rounded-lg transition-colors"
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
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              step === 1
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-white hover:bg-slate-700/50 border border-slate-600'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleSkip}
            className="px-6 py-3 text-slate-400 hover:text-white transition-colors font-medium"
          >
            Skip Setup
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
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

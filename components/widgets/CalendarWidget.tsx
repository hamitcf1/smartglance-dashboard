import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Loader2, LogOut, Clock } from 'lucide-react';
import { Widget } from '../Widget';
import { CalendarConfig } from '../../types';

interface CalendarWidgetProps {
  refreshTrigger: number;
  config: CalendarConfig;
  onConfigChange: (config: Partial<CalendarConfig>) => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  onSizeChange: (size: string) => void;
  widgetSize: string;
  dragHandleProps?: any;
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  calendar: string;
  color: string;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  refreshTrigger,
  config,
  onConfigChange,
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize,
  dragHandleProps
}) => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isConnected = config.isConnected || false;
  const tokenClientRef = useRef<any>(null);

  const initializeGoogleAuth = useCallback(() => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      setError('❌ OAuth Configuration Missing\n\nSee API_SETUP.md for setup instructions');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // init id client if available
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({ client_id: process.env.GOOGLE_CLIENT_ID || '' });
        } catch (e) {}
      }

      // init oauth2 token client for calendar access
      if ((window as any).google?.accounts?.oauth2) {
        tokenClientRef.current = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          callback: (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              onConfigChange({ isConnected: true, accessToken: tokenResponse.access_token, calendarIds: ['primary'] });
              setError(null);
              fetchEvents(tokenResponse.access_token, ['primary']);
            } else {
              setError('Failed to obtain access token from Google');
            }
          }
        });
      }
    };

    script.onerror = () => {
      setError('⚠️ Failed to load Google Sign-In\n\nCheck your internet connection');
    };
  }, [onConfigChange]);

  const handleGoogleSignIn = async (response: any) => {
    // ID token flow fallback - prefer token client for API access
    try {
      if (!response?.credential) {
        setError('❌ OAuth Error: Invalid response');
        return;
      }
      setError(null);
    } catch (err) {
      console.error('Sign-in error:', err);
      setError('❌ Failed to sign in');
    }
  };

  const fetchEvents = useCallback(async (accessToken: string, calendarIds: string[]) => {
    setLoading(true);
    try {
      const now = new Date();
      const timeMin = now.toISOString();
      const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const allEvents: Event[] = [];

      for (const calendarId of calendarIds) {
        try {
          const res = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${timeMin}&timeMax=${timeMax}&maxResults=10&orderBy=startTime&singleEvents=true`,
            {
              headers: { Authorization: `Bearer ${accessToken}` }
            }
          );

          if (!res.ok) {
            const errorBody = await res.text().catch(() => '');
            console.error(`Calendar fetch failed for ${calendarId}`, res.status, errorBody);
            if (res.status === 401 || res.status === 403) {
              setError('Calendar access expired or permission denied. Please reconnect your account.');
              onConfigChange({ isConnected: false, accessToken: undefined, calendarIds: [] });
              setLoading(false);
              return;
            }
            continue;
          }
          const data = await res.json();

          if (data.items) {
            allEvents.push(...data.items.map((event: any) => ({
              id: event.id,
              title: event.summary || 'No Title',
              start: event.start?.dateTime || event.start?.date || '',
              end: event.end?.dateTime || event.end?.date || '',
              calendar: event.organizer?.displayName || 'Calendar',
              color: event.colorId || '#1f2937'
            })));
          }
        } catch (err) {
          console.error(`Error fetching calendar ${calendarId}:`, err);
          continue;
        }
      }

      // Sort by start time
      const sorted = allEvents.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      ).slice(0, 8);

      setEvents(sorted);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    const token = config.accessToken;
    if (!token) {
      onConfigChange({ isConnected: false, accessToken: undefined, calendarIds: [] });
      setEvents([]);
      return;
    }

    try {
      if ((window as any).google?.accounts?.oauth2?.revoke) {
        (window as any).google.accounts.oauth2.revoke(token, () => {
          onConfigChange({ isConnected: false, accessToken: undefined, calendarIds: [] });
          setEvents([]);
        });
        return;
      }
    } catch (e) {}

    fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, { method: 'POST', headers: { 'Content-type': 'application/x-www-form-urlencoded' } })
      .finally(() => {
        onConfigChange({ isConnected: false, accessToken: undefined, calendarIds: [] });
        setEvents([]);
      });
  };

  useEffect(() => {
    if (!isConnected) {
      initializeGoogleAuth();
    } else if (config.accessToken && config.calendarIds?.length) {
      fetchEvents(config.accessToken, config.calendarIds);
    }
  }, [refreshTrigger, isConnected, config.accessToken]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  const SettingsPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-slate-400">Widget Size</label>
        <select
          value={widgetSize}
          onChange={(e) => onSizeChange(e.target.value)}
          className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      {isConnected && (
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect Calendar
        </button>
      )}
    </div>
  );

  return (
    <Widget
      title="Calendar"
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center h-32 space-y-3">
          {error ? (
            <>
              <Calendar className="w-8 h-8 text-red-400" />
              <p className="text-xs text-red-400 text-center px-2">{error}</p>
            </>
          ) : (
            <>
              <Calendar className="w-8 h-8 text-slate-400" />
              <p className="text-xs text-slate-400">Connect your Google Calendar</p>
              <button
                id="google-calendar-signin"
                className="px-4 py-2 bg-white text-gray-800 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
                onClick={() => {
                  if (tokenClientRef.current) {
                    try {
                      tokenClientRef.current.requestAccessToken({ prompt: 'consent' });
                    } catch (e) {
                      setError('Failed to request access token. Check console for details.');
                      console.error(e);
                    }
                  } else {
                    setError('Auth client not initialized yet. Try reloading the page.');
                  }
                }}
              >
                Connect Calendar
              </button>
            </>
          )}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm h-32 flex items-center">{error}</div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {events.length > 0 ? (
            events.map(event => (
              <a
                key={event.id}
                href="https://calendar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`block p-2 rounded transition-colors cursor-pointer border-l-4 ${
                  isUpcoming(event.start)
                    ? 'hover:bg-slate-700/50 border-indigo-500 bg-slate-800/30'
                    : 'hover:bg-slate-700/30 border-slate-600 bg-slate-900/30 opacity-60'
                }`}
              >
                <p className="text-xs font-medium text-white truncate">{event.title}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(event.start)}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(event.start)}</span>
                </div>
              </a>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400">
              <p className="text-xs">No upcoming events</p>
            </div>
          )}
        </div>
      )}
    </Widget>
  );
};

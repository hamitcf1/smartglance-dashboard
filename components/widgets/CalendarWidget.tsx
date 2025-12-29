import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Loader2, LogOut, Clock, MapPin, AlertCircle } from 'lucide-react';
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
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Widget Size</label>
        <select
          value={widgetSize}
          onChange={(e) => onSizeChange(e.target.value)}
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--surface-alt)',
            borderColor: 'var(--border)',
            color: 'var(--text)'
          }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Show Events For</label>
        <div className="space-y-2">
          <button
            className="w-full px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left"
            style={{
              backgroundColor: 'var(--surface-alt)',
              color: 'var(--text)',
              borderColor: 'var(--border)',
              border: '1px solid var(--border)'
            }}
          >
            Next 7 Days (Primary Calendar)
          </button>
        </div>
      </div>

      {isConnected && (
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-sm transition-colors font-medium"
          style={{
            backgroundColor: 'var(--primary)',
            color: 'white'
          }}
        >
          <LogOut className="w-4 h-4" />
          Disconnect Calendar
        </button>
      )}
    </div>
  );

  return (
    <Widget
      title="📅 Calendar"
      className="h-full flex flex-col"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      {!isConnected ? (
        <div className="flex flex-col items-center justify-center h-full space-y-3">
          {error ? (
            <>
              <Calendar className="w-8 h-8" style={{ color: 'var(--primary)' }} />
              <p className="text-xs text-center px-2" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </>
          ) : (
            <>
              <Calendar className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Connect your Google Calendar</p>
              <button
                id="google-calendar-signin"
                className="px-4 py-2 rounded text-sm font-medium transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }}
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
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 h-full p-3" style={{ backgroundColor: 'var(--surface-alt)', borderRadius: '8px' }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Header Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div 
              className="p-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface-alt)',
                borderColor: 'var(--border)'
              }}
            >
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Next Event</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {events.length > 0 ? 'Today' : 'None'}
              </p>
            </div>
            <div 
              className="p-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--surface-alt)',
                borderColor: 'var(--border)'
              }}
            >
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total Events</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                {events.length}
              </p>
            </div>
          </div>

          {/* Events List */}
          <div className="flex-1 overflow-y-auto">
            {events.length > 0 ? (
              <div className="space-y-2">
                {events.map(event => (
                  <a
                    key={event.id}
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border transition-all hover:scale-102"
                    style={{
                      backgroundColor: isUpcoming(event.start) ? 'var(--surface)' : 'var(--surface-alt)',
                      borderColor: isUpcoming(event.start) ? 'var(--primary)' : 'var(--border)',
                      border: `1px solid ${isUpcoming(event.start) ? 'var(--primary)' : 'var(--border)'}`
                    }}
                  >
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                      {event.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{formatDate(event.start)}</span>
                    </div>
                    {event.start.includes('T') && (
                      <div className="flex items-center gap-2 mt-1 text-xs">
                        <Clock className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{formatTime(event.start)}</span>
                      </div>
                    )}
                    {isUpcoming(event.start) && (
                      <div className="mt-2 text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--primary)', color: 'white', width: 'fit-content' }}>
                        Upcoming
                      </div>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24">
                <div className="text-center">
                  <AlertCircle className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>No events in the next 7 days</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Widget>
  );
};

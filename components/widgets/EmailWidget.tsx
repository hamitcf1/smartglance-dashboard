import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mail, Loader2, LogOut } from 'lucide-react';
import { Widget } from '../Widget';
import { EmailConfig } from '../../types';

interface EmailWidgetProps {
  refreshTrigger: number;
  config: EmailConfig;
  onConfigChange: (config: Partial<EmailConfig>) => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  onSizeChange: (size: string) => void;
  widgetSize: string;
  dragHandleProps?: any;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
}

export const EmailWidget: React.FC<EmailWidgetProps> = ({
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
  const [emails, setEmails] = useState<Email[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isConnected = config.isConnected || false;
  const tokenClientRef = useRef<any>(null);

  const initializeGoogleAuth = useCallback(() => {
    if (!process.env.GOOGLE_CLIENT_ID) {
      setError('❌ OAuth Configuration Missing\n\nSee API_SETUP.md for setup instructions');
      return;
    }

    // Load Google Sign-In / OAuth2 library
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize optional ID token client (not used for API calls)
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: process.env.GOOGLE_CLIENT_ID || ''
          });
        } catch (e) {
          // ignore
        }
      }

      // Initialize OAuth2 token client for access tokens (required for Gmail/Calendar API)
      if ((window as any).google?.accounts?.oauth2) {
        tokenClientRef.current = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: process.env.GOOGLE_CLIENT_ID || '',
          scope: 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          callback: (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              onConfigChange({ isConnected: true, accessToken: tokenResponse.access_token });
              setError(null);
              fetchEmails(tokenResponse.access_token);
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
    // Keep for backwards compatibility with ID token flows; prefer token client for API access
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

  const fetchEmails = useCallback(async (accessToken: string) => {
    setLoading(true);
    try {
      // Get recent emails directly (skip profile fetch - often fails with 403)
      const listRes = await fetch(
        'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=10',
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      if (!listRes.ok) {
        const errorBody = await listRes.text().catch(() => '');
        console.error('Email list fetch failed', listRes.status, errorBody);
        if (listRes.status === 401 || listRes.status === 403) {
          setError('Gmail access expired or permission denied. Please reconnect your account.');
          onConfigChange({ isConnected: false, accessToken: undefined, unreadCount: 0 });
          setLoading(false);
          return;
        }
        throw new Error(`Failed to fetch emails: ${listRes.status}`);
      }
      const listData = await listRes.json();

      if (!listData.messages) {
        setEmails([]);
        onConfigChange({ unreadCount: 0 });
        return;
      }

      // Fetch full details for each email
      const emailDetails = await Promise.all(
        listData.messages.slice(0, 5).map(async (msg: any) => {
          const msgRes = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` }
            }
          );
          return msgRes.json();
        })
      );

      const formattedEmails = emailDetails.map((msg: any) => {
        const headers = msg.payload.headers;
        const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || '';

        return {
          id: msg.id,
          from: getHeader('From').split('<')[0].trim(),
          subject: getHeader('Subject'),
          snippet: msg.snippet,
          date: getHeader('Date'),
          unread: msg.labelIds?.includes('UNREAD') || false
        };
      });

      setEmails(formattedEmails);
      onConfigChange({ unreadCount: listData.messages.length });
    } catch (err: any) {
      console.error('Error fetching emails:', err);
      const msg = err?.message || String(err);
      setError(`Failed to load emails: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [onConfigChange]);

  const handleLogout = () => {
    const token = config.accessToken;
    if (!token) {
      onConfigChange({ isConnected: false, accessToken: undefined, unreadCount: 0 });
      setEmails([]);
      return;
    }

    // Attempt to revoke via Google JS API
    try {
      if ((window as any).google?.accounts?.oauth2?.revoke) {
        (window as any).google.accounts.oauth2.revoke(token, () => {
          onConfigChange({ isConnected: false, accessToken: undefined, unreadCount: 0 });
          setEmails([]);
        });
        return;
      }
    } catch (e) {
      // fallthrough to fetch revoke
    }

    // Fallback: call token revoke endpoint
    fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, { method: 'POST', headers: { 'Content-type': 'application/x-www-form-urlencoded' } })
      .finally(() => {
        onConfigChange({ isConnected: false, accessToken: undefined, unreadCount: 0 });
        setEmails([]);
      });
  };

  useEffect(() => {
    if (!isConnected) {
      initializeGoogleAuth();
    } else if (config.accessToken) {
      fetchEmails(config.accessToken);
    }
  }, [refreshTrigger, isConnected, config.accessToken]);

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
          Disconnect Gmail
        </button>
      )}
    </div>
  );

  return (
    <Widget
      title="Gmail"
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
              <Mail className="w-8 h-8 text-red-400" />
              <p className="text-xs text-red-400 text-center px-2">{error}</p>
            </>
          ) : (
            <>
              <Mail className="w-8 h-8 text-slate-400" />
              <p className="text-xs text-slate-400">Connect your Gmail account</p>
              <button
                id="google-signin-button"
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
                Connect Gmail
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
        <div className="space-y-3">
          <div className="mb-2 pb-2 border-b border-white/10">
            <p className="text-sm font-semibold text-indigo-400">{config.unreadCount || 0} Unread</p>
          </div>

          {emails.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {emails.map(email => (
                <a
                  key={email.id}
                  href="https://mail.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:bg-slate-700/50 p-2 rounded transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{email.from}</p>
                      <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{email.subject}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{email.snippet}</p>
                    </div>
                    {email.unread && (
                      <div className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">
              <p className="text-xs">No unread emails</p>
            </div>
          )}
        </div>
      )}
    </Widget>
  );
};

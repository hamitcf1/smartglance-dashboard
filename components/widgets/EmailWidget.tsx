import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mail, Loader2, LogOut, Inbox, Star, Send } from 'lucide-react';
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

type EmailCategory = 'all' | 'unread' | 'starred' | 'sent';

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
  const [category, setCategory] = useState<EmailCategory>('unread');
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

  const fetchEmails = useCallback(async (accessToken: string, cat: EmailCategory = 'unread') => {
    setLoading(true);
    try {
      // Build query based on category
      let query = '';
      switch (cat) {
        case 'unread':
          query = 'is:unread';
          break;
        case 'starred':
          query = 'is:starred';
          break;
        case 'sent':
          query = 'from:me';
          break;
        case 'all':
        default:
          query = '';
      }

      const queryParam = query ? `&q=${encodeURIComponent(query)}` : '';
      const listRes = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=15${queryParam}`,
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
        listData.messages.slice(0, 10).map(async (msg: any) => {
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
      fetchEmails(config.accessToken, category);
    }
  }, [refreshTrigger, isConnected, config.accessToken, category]);

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
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Default Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as EmailCategory)}
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--surface-alt)',
            borderColor: 'var(--border)',
            color: 'var(--text)'
          }}
        >
          <option value="all">All Emails</option>
          <option value="unread">Unread</option>
          <option value="starred">Starred</option>
          <option value="sent">Sent</option>
        </select>
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
          Disconnect Gmail
        </button>
      )}
    </div>
  );

  const categoryTabs = [
    { id: 'unread' as const, label: 'Unread', icon: Inbox },
    { id: 'all' as const, label: 'All', icon: Mail },
    { id: 'starred' as const, label: 'Starred', icon: Star },
    { id: 'sent' as const, label: 'Sent', icon: Send }
  ];

  return (
    <Widget
      title="📧 Gmail"
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
              <Mail className="w-8 h-8" style={{ color: 'var(--primary)' }} />
              <p className="text-xs text-center px-2" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            </>
          ) : (
            <>
              <Mail className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Connect your Gmail account</p>
              <button
                id="google-signin-button"
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
                Connect Gmail
              </button>
            </>
          )}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : error ? (
        <div className="flex items-center h-full" style={{ color: 'var(--text-secondary)' }}>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          {/* Category Tabs */}
          <div className="flex gap-1 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
            {categoryTabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCategory(tab.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
                  style={{
                    backgroundColor: category === tab.id ? 'var(--primary)' : 'var(--surface-alt)',
                    color: category === tab.id ? 'white' : 'var(--text-secondary)',
                    borderColor: 'var(--border)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Emails List */}
          <div className="flex-1 overflow-y-auto">
            {emails.length > 0 ? (
              <div className="space-y-2">
                {emails.map(email => (
                  <a
                    key={email.id}
                    href="https://mail.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border transition-all hover:scale-102"
                    style={{
                      backgroundColor: email.unread ? 'var(--surface)' : 'var(--surface-alt)',
                      borderColor: email.unread ? 'var(--primary)' : 'var(--border)',
                      border: `1px solid ${email.unread ? 'var(--primary)' : 'var(--border)'}`
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
                          {email.from}
                        </p>
                        <p className="text-xs line-clamp-1 mt-0.5" style={{ color: 'var(--text)' }}>
                          {email.subject}
                        </p>
                        <p className="text-xs line-clamp-2 mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {email.snippet}
                        </p>
                      </div>
                      {email.unread && (
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: 'var(--primary)' }}></div>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24" style={{ color: 'var(--text-secondary)' }}>
                <p className="text-xs">No emails in this category</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Widget>
  );
};

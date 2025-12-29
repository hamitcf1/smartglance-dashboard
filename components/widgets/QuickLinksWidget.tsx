import React, { useState } from 'react';
import { Widget } from '../Widget';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { QuickLinksConfig, QuickLink } from '../../types';

// Helper to generate IDs
const uid = () => Math.random().toString(36).substr(2, 9);

const DEFAULT_LINKS: QuickLink[] = [
  { id: '1', name: 'Google', url: 'https://google.com' },
  { id: '2', name: 'GitHub', url: 'https://github.com' },
  { id: '3', name: 'YouTube', url: 'https://youtube.com' },
  { id: '4', name: 'Gmail', url: 'https://mail.google.com' },
];

// Get favicon URL from a website
const getFaviconUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    return '';
  }
};

// Get random pastel color for fallback
const getColorForLink = (name: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B88B', '#A8E6CF'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

interface QuickLinksWidgetProps {
  config: QuickLinksConfig;
  onConfigChange: (config: Partial<QuickLinksConfig>) => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  onSizeChange: (size: string) => void;
  widgetSize: string;
  dragHandleProps?: any;
}

export const QuickLinksWidget: React.FC<QuickLinksWidgetProps> = ({ 
  config, 
  onConfigChange,
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize,
  dragHandleProps
}) => {
  const links = config.links || DEFAULT_LINKS;
  const [newLinkName, setNewLinkName] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [faviconErrors, setFaviconErrors] = useState<Set<string>>(new Set());

  const addLink = () => {
    if (newLinkName && newLinkUrl) {
      let formattedUrl = newLinkUrl;
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
      const newLink: QuickLink = {
        id: uid(),
        name: newLinkName,
        url: formattedUrl
      };
      onConfigChange({ links: [...links, newLink] });
      setNewLinkName('');
      setNewLinkUrl('');
    }
  };

  const removeLink = (id: string) => {
    onConfigChange({ links: links.filter(l => l.id !== id) });
  };

  const handleFaviconError = (linkId: string) => {
    setFaviconErrors(prev => new Set([...prev, linkId]));
  };

  const SettingsPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Widget Size</label>
        <select 
          value={widgetSize} 
          onChange={(e) => onSizeChange(e.target.value)}
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 transition-colors"
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

      <div className="space-y-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Add New Link</label>
        <input 
          type="text" 
          placeholder="Name (e.g., Reddit)" 
          className="w-full border rounded px-3 py-2 text-xs mb-2 focus:outline-none focus:ring-2 transition-colors"
          style={{
            backgroundColor: 'var(--surface-alt)',
            borderColor: 'var(--border)',
            color: 'var(--text)'
          }}
          value={newLinkName}
          onChange={e => setNewLinkName(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="URL (e.g., reddit.com)" 
          className="w-full border rounded px-3 py-2 text-xs mb-2 focus:outline-none focus:ring-2 transition-colors"
          style={{
            backgroundColor: 'var(--surface-alt)',
            borderColor: 'var(--border)',
            color: 'var(--text)'
          }}
          value={newLinkUrl}
          onChange={e => setNewLinkUrl(e.target.value)}
        />
        <button 
          onClick={addLink}
          disabled={!newLinkName || !newLinkUrl}
          className="w-full text-white rounded py-2 text-xs font-medium transition-all flex items-center justify-center gap-2 border"
          style={{
            backgroundColor: newLinkName && newLinkUrl ? 'var(--primary)' : 'var(--surface-alt)',
            borderColor: newLinkName && newLinkUrl ? 'var(--primary)' : 'var(--border)',
            opacity: !newLinkName || !newLinkUrl ? 0.5 : 1
          }}
        >
          <Plus className="w-3.5 h-3.5" /> Add Link
        </button>
      </div>

      <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Manage Links</label>
        <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
          {links.map(link => (
            <div 
              key={link.id} 
              className="flex items-center justify-between px-2 py-2 rounded border transition-all"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)'
              }}
            >
              <span className="text-xs truncate max-w-[120px]" style={{ color: 'var(--text-secondary)' }}>{link.name}</span>
              <button 
                onClick={() => removeLink(link.id)}
                className="p-1 rounded transition-all hover:scale-110"
                style={{
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary)' + '22'
                }}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Widget 
      title="🔗 Quick Links" 
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-4 h-full flex flex-col">
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1">
          {links.map((link) => {
            const shouldShowFallback = faviconErrors.has(link.id);
            const bgColor = getColorForLink(link.name);
            
            return (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center justify-center p-3 rounded-2xl border transition-all hover:scale-105 relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderColor: 'var(--border)'
                }}
              >
                {/* Hover gradient background */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{
                    background: bgColor,
                    zIndex: 0
                  }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-2">
                  {/* Favicon Container */}
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 flex-shrink-0 border"
                    style={{
                      backgroundColor: bgColor + '22',
                      borderColor: bgColor + '44'
                    }}
                  >
                    {!shouldShowFallback ? (
                      <img 
                        src={getFaviconUrl(link.url)}
                        alt={link.name}
                        className="w-6 h-6"
                        onError={() => handleFaviconError(link.id)}
                      />
                    ) : (
                      <div 
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: bgColor }}
                      >
                        {link.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Link Name */}
                  <span 
                    className="text-xs font-semibold text-center line-clamp-2 w-full transition-colors"
                    style={{ color: 'var(--text)' }}
                  >
                    {link.name}
                  </span>

                  {/* External Link Icon */}
                  <ExternalLink 
                    className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                    style={{ color: 'var(--primary)' }}
                  />
                </div>
              </a>
            );
          })}

          {/* Add Link Button */}
          {links.length < 12 && (
            <button 
              onClick={onToggleSettings}
              className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed transition-all hover:scale-105 group"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'transparent'
              }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-all"
                style={{
                  backgroundColor: 'var(--primary)' + '22',
                  color: 'var(--primary)'
                }}
              >
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Add</span>
            </button>
          )}
        </div>

        {/* Footer Info */}
        {links.length === 0 && (
          <div 
            className="text-center py-6 rounded-lg border"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)'
            }}
          >
            <p className="text-xs mb-2">No links yet</p>
            <button 
              onClick={onToggleSettings}
              className="text-xs font-medium px-3 py-1 rounded-lg border transition-all"
              style={{
                borderColor: 'var(--primary)',
                color: 'var(--primary)'
              }}
            >
              Add your first link
            </button>
          </div>
        )}
      </div>
    </Widget>
  );
};
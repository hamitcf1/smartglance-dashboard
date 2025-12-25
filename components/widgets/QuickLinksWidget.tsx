import React, { useState, useEffect } from 'react';
import { Widget } from '../Widget';
import { Globe, Plus, Trash2 } from 'lucide-react';
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
    // Use Google Favicon API as fallback
    return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=64`;
  } catch {
    return '';
  }
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

      <div className="space-y-2">
        <label className="text-xs text-slate-400">Add New Link</label>
        <input 
          type="text" 
          placeholder="Name (e.g., Reddit)" 
          className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1 text-sm text-white mb-2 focus:outline-none"
          value={newLinkName}
          onChange={e => setNewLinkName(e.target.value)}
        />
        <input 
          type="text" 
          placeholder="URL (e.g., reddit.com)" 
          className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1 text-sm text-white mb-2 focus:outline-none"
          value={newLinkUrl}
          onChange={e => setNewLinkUrl(e.target.value)}
        />
        <button 
          onClick={addLink}
          disabled={!newLinkName || !newLinkUrl}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded py-1 text-sm transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add Link
        </button>
      </div>

      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-xs text-slate-400">Manage Links</label>
        <div className="space-y-1">
          {links.map(link => (
            <div key={link.id} className="flex items-center justify-between bg-slate-800/50 p-2 rounded group">
              <span className="text-sm text-slate-300 truncate max-w-[120px]">{link.name}</span>
              <button 
                onClick={() => removeLink(link.id)}
                className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20"
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
      title="Quick Links" 
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group aspect-square md:aspect-auto"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform overflow-hidden">
              <img 
                src={getFaviconUrl(link.url)}
                alt={link.name}
                className="w-5 h-5"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Globe className="w-4 h-4 text-indigo-300 hidden" />
            </div>
            <span className="text-xs text-slate-400 group-hover:text-white transition-colors text-center line-clamp-1 w-full">{link.name}</span>
          </a>
        ))}
        {/* Add button placeholder if empty or just generally accessible via settings */}
        {links.length === 0 && (
          <button onClick={onToggleSettings} className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-white/10 hover:border-white/30 transition-colors text-slate-500 hover:text-white">
            <Plus className="w-6 h-6 mb-1" />
            <span className="text-xs">Add Link</span>
          </button>
        )}
      </div>
    </Widget>
  );
};
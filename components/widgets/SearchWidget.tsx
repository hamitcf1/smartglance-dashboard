import React, { useState } from 'react';
import { Search, Zap, ArrowRight } from 'lucide-react';
import { Widget } from '../Widget';

interface SearchWidgetProps {
  isSettingsOpen?: boolean;
  onToggleSettings?: () => void;
  onSizeChange?: (size: string) => void;
  widgetSize?: string;
  dragHandleProps?: any;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({ 
  isSettingsOpen, 
  onToggleSettings, 
  onSizeChange, 
  widgetSize,
  dragHandleProps 
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  };

  const handleQuickSearch = (term: string) => {
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(term)}`;
  };

  const QUICK_SEARCHES = [
    { icon: '📺', label: 'YouTube', query: 'site:youtube.com' },
    { icon: '🔧', label: 'GitHub', query: 'site:github.com' },
    { icon: '🎓', label: 'Stack Overflow', query: 'site:stackoverflow.com' },
    { icon: '📚', label: 'MDN', query: 'site:mdn.org' },
  ];

  const SettingsPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Widget Size</label>
        <select 
          value={widgetSize} 
          onChange={(e) => onSizeChange?.(e.target.value)}
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

      <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--surface-alt)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
        <p className="text-xs leading-relaxed">
          Type your search query and press <span className="font-mono bg-black/30 px-1.5 rounded">Enter</span> or click the search button to search Google.
        </p>
      </div>
    </div>
  );

  return (
    <Widget 
      title="🔍 Search"
      className="h-full flex flex-col justify-center"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="space-y-6">
        {/* Main Search Input */}
        <form onSubmit={handleSearch} className="relative group w-full">
          {/* Animated background gradient */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur"
            style={{
              background: 'var(--primary)',
              zIndex: -1,
              filter: 'blur(12px)'
            }}
          />
          
          <div className="relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all"
            style={{
              backgroundColor: isFocused ? 'var(--surface)' : 'var(--surface-alt)',
              borderColor: isFocused ? 'var(--primary)' : 'var(--border)',
              boxShadow: isFocused ? '0 0 20px var(--primary)33' : 'none'
            }}
          >
            <Search 
              className="w-5 h-5 flex-shrink-0 transition-colors" 
              style={{ color: isFocused ? 'var(--primary)' : 'var(--text-secondary)' }}
            />
            <input
              type="text"
              className="flex-1 bg-transparent text-lg focus:outline-none transition-colors"
              style={{ color: 'var(--text)', caretColor: 'var(--primary)' }}
              placeholder="Search Google..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
            {query && (
              <button
                onClick={handleSearch}
                className="p-1.5 rounded-lg transition-all hover:scale-110"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white'
                }}
                title="Search"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Quick Search Suggestions */}
        <div className="space-y-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Quick Search</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_SEARCHES.map((search) => (
              <button
                key={search.label}
                onClick={() => handleQuickSearch(search.query)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:scale-105"
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                <span className="text-lg">{search.icon}</span>
                <span className="text-xs font-medium">{search.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px var(--primary)33; }
          50% { box-shadow: 0 0 30px var(--primary)66; }
        }
      `}</style>
    </Widget>
  );
};
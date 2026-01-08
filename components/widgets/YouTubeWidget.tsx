import React, { useState, useEffect, useCallback } from 'react';
import { Youtube, Loader2, Plus, Trash2, Search } from 'lucide-react';
import { Widget } from '../Widget';
import { YouTubeConfig } from '../../types';
import { fetchChannelVideos, searchChannelByName } from '../../services/youtube';

interface YouTubeWidgetProps {
  refreshTrigger: number;
  config: YouTubeConfig;
  onConfigChange: (config: Partial<YouTubeConfig>) => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  onSizeChange: (size: string) => void;
  widgetSize: string;
  dragHandleProps?: any;
}

interface Video {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  url: string;
  publishedAt: string;
}

export const YouTubeWidget: React.FC<YouTubeWidgetProps> = ({
  refreshTrigger,
  config,
  onConfigChange,
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize,
  dragHandleProps
}) => {
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string }>>([]);

  const channels = config.channels || [];
  const videoCount = config.videoCount || 5;

  const loadVideos = useCallback(async () => {
    if (channels.length === 0) {
      setVideos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const allVideos: Video[] = [];

      for (const channel of channels) {
        const videos = await fetchChannelVideos(channel.id, 3);
        allVideos.push(...videos);
      }

      // Sort by publish date and limit
      const sorted = allVideos.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ).slice(0, videoCount);

      setVideos(sorted);
    } catch (err) {
      setError('Failed to load videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [channels, videoCount]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos, refreshTrigger]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const results = await searchChannelByName(searchTerm);
      setSearchResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const addChannel = (id: string, name: string) => {
    if (!channels.find(c => c.id === id)) {
      // Only call onConfigChange if channels actually changed
      onConfigChange && typeof onConfigChange === 'function' && onConfigChange({
        channels: [...channels, { id, name }]
      });
    }
    setSearchResults([]);
    setSearchTerm('');
  };

  const removeChannel = (id: string) => {
    const newChannels = channels.filter(c => c.id !== id);
    if (newChannels.length !== channels.length) {
      onConfigChange && typeof onConfigChange === 'function' && onConfigChange({
        channels: newChannels
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}m ago`;
  };

  const SettingsPanel = (
    <div className="space-y-4 max-h-96 overflow-y-auto">
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

      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-xs text-slate-400">Videos per Channel</label>
        <input
          type="number"
          min="1"
          max="10"
          value={videoCount}
          onChange={(e) => onConfigChange({ videoCount: parseInt(e.target.value) })}
          className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
        />
      </div>

      <div className="space-y-3 pt-2 border-t border-white/10">
        <label className="text-xs text-slate-400">Your Channels</label>

        {channels.length > 0 && (
          <div className="space-y-2 mb-3">
            {channels.map(channel => (
              <div key={channel.id} className="flex items-center justify-between bg-slate-800 p-2 rounded text-sm">
                <span className="truncate">{channel.name}</span>
                <button
                  onClick={() => removeChannel(channel.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 border-t border-white/10 pt-2">
          <input
            type="text"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={!searchTerm || searching}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-1 mt-2 bg-slate-900 p-2 rounded border border-slate-700">
            {searchResults.map(result => (
              <button
                key={result.id}
                onClick={() => addChannel(result.id, result.name)}
                className="w-full text-left flex items-center justify-between hover:bg-slate-800 p-2 rounded text-xs text-slate-300"
              >
                <span className="truncate">{result.name}</span>
                <Plus className="w-4 h-4 text-indigo-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Widget
      title="YouTube Feed"
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      {channels.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-slate-400">
          <Youtube className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs">Add channels in settings</span>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm h-32 flex items-center">{error}</div>
      ) : videos.length > 0 ? (
        <div className="space-y-3 overflow-y-auto max-h-96">
          {videos.map(video => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <div className="flex gap-3 cursor-pointer group">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-20 h-12 rounded object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-white line-clamp-2 group-hover:text-indigo-400">
                    {video.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{video.channelTitle}</p>
                  <p className="text-xs text-slate-500">{formatDate(video.publishedAt)}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 text-slate-400">
          <span className="text-xs">No videos found</span>
        </div>
      )}
    </Widget>
  );
};

import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import { Widget } from '../Widget';
import { HackerNewsItem, NewsConfig } from '../../types';

interface NewsWidgetProps {
  refreshTrigger: number;
  config: NewsConfig;
  onConfigChange: (config: Partial<NewsConfig>) => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  onSizeChange: (size: string) => void;
  widgetSize: string;
  dragHandleProps?: any;
}

export const NewsWidget: React.FC<NewsWidgetProps> = ({ 
  refreshTrigger, 
  config, 
  onConfigChange,
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize,
  dragHandleProps
}) => {
  const [stories, setStories] = useState<HackerNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const category = config.category || 'top';

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const endpoint = category === 'new' ? 'newstories' : category === 'best' ? 'beststories' : 'topstories';
        const topStoriesRes = await fetch(`https://hacker-news.firebaseio.com/v0/${endpoint}.json`);
        const topIds = await topStoriesRes.json();
        const top5Ids = topIds.slice(0, 5);

        const storyPromises = top5Ids.map((id: number) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
        );

        const storyData = await Promise.all(storyPromises);
        setStories(storyData);
      } catch (error) {
        console.error("Failed to fetch news", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [refreshTrigger, category]);

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

      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-xs text-slate-400">Story Feed</label>
        <div className="flex flex-col gap-2">
          {['top', 'new', 'best'].map((cat) => (
            <button
              key={cat}
              onClick={() => onConfigChange({ category: cat as any })}
              className={`px-3 py-2 rounded text-left text-sm transition-colors ${category === cat ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)} Stories
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Widget 
      title={
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-orange-400" />
          <span>{category.charAt(0).toUpperCase() + category.slice(1)} Stories</span>
        </div>
      }
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col gap-3">
        {loading ? (
           Array.from({ length: 5 }).map((_, i) => (
             <div key={i} className="animate-pulse flex flex-col gap-1">
               <div className="h-4 bg-white/10 rounded w-3/4"></div>
               <div className="h-3 bg-white/5 rounded w-1/4"></div>
             </div>
           ))
        ) : (
          stories.map(story => (
            <a 
              key={story.id}
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <h3 className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-1">
                {story.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-xs text-slate-500">{story.score} points</span>
                 <span className="text-xs text-slate-600">•</span>
                 <span className="text-xs text-slate-500">by {story.by}</span>
                 <ExternalLink className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </div>
            </a>
          ))
        )}
      </div>
    </Widget>
  );
};
import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Widget } from '../Widget';
import { generateDailyBriefing } from '../../services/gemini';

interface SmartBriefingProps {
  userName: string;
  refreshTrigger: number;
  isSettingsOpen?: boolean;
  onToggleSettings?: () => void;
  onSizeChange?: (size: string) => void;
  widgetSize?: string;
  dragHandleProps?: any;
}

export const SmartBriefingWidget: React.FC<SmartBriefingProps> = ({ 
  userName, 
  refreshTrigger,
  isSettingsOpen, 
  onToggleSettings, 
  onSizeChange, 
  widgetSize,
  dragHandleProps 
}) => {
  const [briefing, setBriefing] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBriefing = async () => {
      setLoading(true);
      const timeString = new Date().toLocaleString();
      const text = await generateDailyBriefing(userName, timeString);
      setBriefing(text);
      setLoading(false);
    };

    fetchBriefing();
  }, [userName, refreshTrigger]);

  const SettingsPanel = (
    <div className="space-y-4">
       <div className="space-y-2">
        <label className="text-xs text-slate-400">Widget Size</label>
        <select 
          value={widgetSize} 
          onChange={(e) => onSizeChange?.(e.target.value)}
          className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
      <p className="text-xs text-slate-500 mt-2">Content is generated based on your profile and time of day.</p>
    </div>
  );

  return (
    <Widget 
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Daily Briefing</span>
        </div>
      }
      className="h-full min-h-[200px]"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      {loading ? (
        <div className="h-full flex flex-col items-center justify-center space-y-3 animate-pulse">
          <div className="h-2 bg-white/10 rounded w-3/4"></div>
          <div className="h-2 bg-white/10 rounded w-full"></div>
          <div className="h-2 bg-white/10 rounded w-5/6"></div>
          <span className="text-xs text-slate-500">Gemini is thinking...</span>
        </div>
      ) : (
        <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
           {briefing.split('\n').map((line, i) => {
             if (!line.trim()) return <br key={i} />;
             const parts = line.split(/(\*\*.*?\*\*)/g);
             return (
               <p key={i} className="mb-2">
                 {parts.map((part, j) => {
                   if (part.startsWith('**') && part.endsWith('**')) {
                     return <strong key={j} className="text-indigo-200">{part.slice(2, -2)}</strong>;
                   }
                   return part;
                 })}
               </p>
             );
           })}
        </div>
      )}
    </Widget>
  );
};
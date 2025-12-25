import React, { useState, useEffect } from 'react';
import { Widget } from '../Widget';

interface ClockWidgetProps {
  isSettingsOpen?: boolean;
  onToggleSettings?: () => void;
  onSizeChange?: (size: string) => void;
  widgetSize?: string;
  dragHandleProps?: any;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ 
  isSettingsOpen, 
  onToggleSettings, 
  onSizeChange, 
  widgetSize,
  dragHandleProps 
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

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
    </div>
  );

  return (
    <Widget 
      className="relative overflow-hidden group h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all pointer-events-none"></div>
      <div className="flex flex-col justify-center h-full z-10 relative">
        <h2 className="text-6xl md:text-7xl font-bold tracking-tighter text-white">
          {formatTime(time)}
        </h2>
        <p className="text-xl text-slate-400 mt-2 font-light">
          {formatDate(time)}
        </p>
      </div>
    </Widget>
  );
};
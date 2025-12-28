import React, { useState, useEffect, useMemo } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { Widget } from '../Widget';

interface ClockWidgetProps {
  isSettingsOpen?: boolean;
  onToggleSettings?: () => void;
  onSizeChange?: (size: string) => void;
  widgetSize?: string;
  dragHandleProps?: any;
}

interface TimezoneConfig {
  timezones: string[];
  viewMode: 'digital' | 'analog';
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ 
  isSettingsOpen, 
  onToggleSettings, 
  onSizeChange, 
  widgetSize,
  dragHandleProps 
}) => {
  const [time, setTime] = useState(new Date());
  const [config, setConfig] = useState<TimezoneConfig>(() => {
    const saved = localStorage.getItem('smart-glance-clock-config');
    return saved ? JSON.parse(saved) : { timezones: [], viewMode: 'digital' };
  });

  useEffect(() => {
    localStorage.setItem('smart-glance-clock-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, timezone?: string) => {
    try {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone,
        hour12: true
      });
    } catch {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getTimeInTimezone = (timezone: string) => {
    try {
      return new Date(time.toLocaleString('en-US', { timeZone: timezone }));
    } catch {
      return time;
    }
  };

  const COMMON_TIMEZONES = [
    { label: 'System', value: '' },
    { label: 'UTC', value: 'UTC' },
    { label: 'New York', value: 'America/New_York' },
    { label: 'London', value: 'Europe/London' },
    { label: 'Paris', value: 'Europe/Paris' },
    { label: 'Istanbul', value: 'Europe/Istanbul' },
    { label: 'Dubai', value: 'Asia/Dubai' },
    { label: 'Tokyo', value: 'Asia/Tokyo' },
    { label: 'Sydney', value: 'Australia/Sydney' },
    { label: 'Los Angeles', value: 'America/Los_Angeles' },
  ];

  const activeTimezones = config.timezones.length > 0 ? config.timezones : [''];

  const AnalogClock = ({ tzTime, size = 'base' }: { tzTime: Date; size?: string }) => {
    const hours = tzTime.getHours() % 12;
    const minutes = tzTime.getMinutes();
    const seconds = tzTime.getSeconds();

    const hourDegrees = (hours * 30) + (minutes * 0.5);
    const minuteDegrees = (minutes * 6) + (seconds * 0.1);
    const secondDegrees = seconds * 6;

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-20 h-20 rounded-full border-4 border-indigo-500/50 bg-slate-700/50">
          {/* Hour marks */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-2 bg-slate-400 left-1/2 top-1 -translate-x-1/2 origin-bottom"
              style={{ transform: `translateX(-50%) rotate(${i * 30}deg)` }}
            />
          ))}
          {/* Hour hand */}
          <div
            className="absolute w-1 h-6 bg-white left-1/2 bottom-1/2 -translate-x-1/2 origin-bottom rounded-full"
            style={{ transform: `translateX(-50%) rotate(${hourDegrees}deg)` }}
          />
          {/* Minute hand */}
          <div
            className="absolute w-0.5 h-8 bg-slate-300 left-1/2 bottom-1/2 -translate-x-1/2 origin-bottom rounded-full"
            style={{ transform: `translateX(-50%) rotate(${minuteDegrees}deg)` }}
          />
          {/* Second hand */}
          <div
            className="absolute w-0.5 h-7 bg-red-400 left-1/2 bottom-1/2 -translate-x-1/2 origin-bottom rounded-full"
            style={{ transform: `translateX(-50%) rotate(${secondDegrees}deg)` }}
          />
          {/* Center dot */}
          <div className="absolute w-2 h-2 bg-white rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-xs text-slate-400 mt-1">{formatTime(tzTime)}</p>
      </div>
    );
  };

  const SettingsPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-semibold">Display Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setConfig(c => ({ ...c, viewMode: 'digital' }))}
            className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
              config.viewMode === 'digital'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Digital
          </button>
          <button
            onClick={() => setConfig(c => ({ ...c, viewMode: 'analog' }))}
            className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
              config.viewMode === 'analog'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Analog
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-semibold">Timezones</label>
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
          {COMMON_TIMEZONES.map(tz => (
            <label key={tz.value} className="flex items-center gap-2 p-2 rounded hover:bg-slate-700/50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={config.timezones.includes(tz.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setConfig(c => ({
                      ...c,
                      timezones: [...c.timezones, tz.value].filter(t => t !== '')
                    }));
                  } else {
                    setConfig(c => ({
                      ...c,
                      timezones: c.timezones.filter(t => t !== tz.value)
                    }));
                  }
                }}
                className="w-3 h-3 rounded border-slate-500 text-indigo-500 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs text-slate-300">{tz.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-semibold">Widget Size</label>
        <select 
          value={widgetSize} 
          onChange={(e) => onSizeChange?.(e.target.value)}
          className="w-full bg-slate-700 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
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
      className="relative overflow-hidden group h-full flex flex-col"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-all pointer-events-none"></div>
      
      {/* Main Clock Display */}
      <div className="flex-1 flex flex-col justify-center z-10 relative">
        {config.viewMode === 'digital' ? (
          <>
            <h2 className="text-6xl md:text-7xl font-bold tracking-tighter text-white">
              {formatTime(time)}
            </h2>
            <p className="text-xl text-slate-400 mt-2 font-light">
              {formatDate(time)}
            </p>
          </>
        ) : (
          <AnalogClock tzTime={time} />
        )}
      </div>

      {/* Timezone List */}
      {activeTimezones.length > 0 && (
        <div className="border-t border-white/10 p-4 pt-3 z-10 space-y-2 max-h-24 overflow-y-auto custom-scrollbar">
          {activeTimezones.map((tz) => {
            const tzTime = tz ? getTimeInTimezone(tz) : time;
            const tzLabel = COMMON_TIMEZONES.find(t => t.value === tz)?.label || tz || 'Local';
            return (
              <div key={tz || 'local'} className="flex items-center justify-between gap-3 px-2 py-1 rounded bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="text-xs text-slate-300 truncate">{tzLabel}</span>
                </div>
                <span className="text-sm font-semibold text-white whitespace-nowrap">
                  {config.viewMode === 'analog' ? tzTime.getHours().toString().padStart(2, '0') + ':' + tzTime.getMinutes().toString().padStart(2, '0') : formatTime(tzTime)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Widget>
  );
};
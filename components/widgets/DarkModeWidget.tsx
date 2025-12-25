import React, { useState, useEffect } from 'react';
import { Moon, Sun, Settings2 } from 'lucide-react';
import { Widget } from '../Widget';
import { useTheme } from '../../services/theme';

interface DarkModeWidgetProps {
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  onSizeChange: (size: string) => void;
  widgetSize: string;
  dragHandleProps?: any;
}

export const DarkModeWidget: React.FC<DarkModeWidgetProps> = ({
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize,
  dragHandleProps
}) => {
  const { config, setTheme, setSunriseTime, setSunsetTime, isDarkMode } = useTheme();
  const [sunriseInput, setSunriseInput] = useState(config.sunriseTime.toString());
  const [sunsetInput, setSunsetInput] = useState(config.sunsetTime.toString());

  useEffect(() => {
    setSunriseInput(config.sunriseTime.toString());
    setSunsetInput(config.sunsetTime.toString());
  }, [config.sunriseTime, config.sunsetTime]);

  const handleSunriseChange = () => {
    const hours = parseFloat(sunriseInput);
    if (!isNaN(hours)) {
      setSunriseTime(hours);
    }
  };

  const handleSunsetChange = () => {
    const hours = parseFloat(sunsetInput);
    if (!isNaN(hours)) {
      setSunsetTime(hours);
    }
  };

  const getTimeLabel = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours % 1) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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

      <div className="space-y-3 pt-2 border-t border-white/10">
        <label className="text-xs text-slate-400">Theme Mode</label>
        <div className="space-y-2">
          {(['light', 'dark', 'auto'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setTheme(mode)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors capitalize ${
                config.theme === mode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'light' && <Sun className="w-4 h-4" />}
              {mode === 'dark' && <Moon className="w-4 h-4" />}
              {mode === 'auto' && <Settings2 className="w-4 h-4" />}
              {mode === 'auto' ? 'Schedule' : mode}
            </button>
          ))}
        </div>
      </div>

      {config.theme === 'auto' && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <label className="text-xs text-slate-400">Schedule Times</label>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-yellow-400" />
              <label className="text-xs text-slate-400 flex-1">Sunrise</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  step="0.5"
                  value={sunriseInput}
                  onChange={(e) => setSunriseInput(e.target.value)}
                  onBlur={handleSunriseChange}
                  className="w-12 bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                />
                <span className="text-xs text-slate-400 w-10">{getTimeLabel(config.sunriseTime)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <label className="text-xs text-slate-400 flex-1">Sunset</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  min="0"
                  max="23"
                  step="0.5"
                  value={sunsetInput}
                  onChange={(e) => setSunsetInput(e.target.value)}
                  onBlur={handleSunsetChange}
                  className="w-12 bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none"
                />
                <span className="text-xs text-slate-400 w-10">{getTimeLabel(config.sunsetTime)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const getTimeUntilChange = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentDecimal = hours + minutes / 60;

    let nextChange: number;
    let changeType: string;

    if (config.theme === 'dark') {
      return null;
    }

    if (config.theme === 'light') {
      return null;
    }

    // Auto mode
    if (currentDecimal < config.sunriseTime) {
      nextChange = config.sunriseTime;
      changeType = 'light';
    } else if (currentDecimal < config.sunsetTime) {
      nextChange = config.sunsetTime;
      changeType = 'dark';
    } else {
      // Next sunrise tomorrow
      nextChange = config.sunriseTime + 24;
      changeType = 'light';
    }

    const hoursUntil = nextChange - currentDecimal;
    const h = Math.floor(hoursUntil);
    const m = Math.round((hoursUntil % 1) * 60);

    return { h, m, changeType };
  };

  const timeUntilChange = getTimeUntilChange();

  return (
    <Widget
      title="Theme"
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col items-center justify-center h-full space-y-4 py-6">
        {/* Current Mode Display */}
        <div className="relative w-20 h-20">
          {isDarkMode ? (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 rounded-full">
              <Moon className="w-10 h-10 text-indigo-300" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full">
              <Sun className="w-10 h-10 text-white" />
            </div>
          )}
        </div>

        {/* Mode Label */}
        <div className="text-center">
          <p className="text-sm font-semibold text-white capitalize">
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </p>
          <p className="text-xs text-slate-400 mt-1 capitalize">
            {config.theme === 'auto' ? 'Auto Schedule' : config.theme}
          </p>
        </div>

        {/* Time Until Change */}
        {timeUntilChange && config.theme === 'auto' && (
          <div className="bg-slate-800/50 border border-white/10 rounded-lg px-3 py-2 text-center">
            <p className="text-xs text-slate-300">
              Switch to <span className="font-semibold text-indigo-400">{timeUntilChange.changeType}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              in {timeUntilChange.h}h {timeUntilChange.m}m
            </p>
          </div>
        )}

        {/* Quick Toggle */}
        {config.theme !== 'auto' && (
          <button
            onClick={() => setTheme(config.theme === 'dark' ? 'light' : 'dark')}
            className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Toggle Mode
          </button>
        )}
      </div>
    </Widget>
  );
};

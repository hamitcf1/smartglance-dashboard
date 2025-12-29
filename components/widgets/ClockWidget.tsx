import React, { useState, useEffect } from 'react';
import { MapPin, Zap } from 'lucide-react';
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
    const timer = setInterval(() => setTime(new Date()), 500);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, timezone?: string) => {
    try {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone,
        hour12: false
      });
    } catch {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatTimeShort = (date: Date, timezone?: string) => {
    try {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: timezone,
        hour12: false
      });
    } catch {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getTimeInTimezone = (timezone: string) => {
    try {
      return new Date(time.toLocaleString('en-US', { timeZone: timezone }));
    } catch {
      return time;
    }
  };

  const COMMON_TIMEZONES = [
    { label: 'Local', value: '' },
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

  // Modern Analog Clock with smooth animations
  const ModernAnalogClock = ({ tzTime, size = 'medium' }: { tzTime: Date; size?: string }) => {
    const hours = tzTime.getHours() % 12;
    const minutes = tzTime.getMinutes();
    const seconds = tzTime.getSeconds();
    const milliseconds = tzTime.getMilliseconds();

    // Smooth transitions using milliseconds
    const hourDegrees = (hours * 30) + (minutes * 0.5);
    const minuteDegrees = (minutes * 6) + (seconds * 0.1) + (milliseconds * 0.0001);
    const secondDegrees = (seconds * 6) + (milliseconds * 0.006);

    const clockSizes = {
      small: 'w-32 h-32',
      medium: 'w-40 h-40',
      large: 'w-52 h-52'
    };

    return (
      <div className="flex items-center justify-center">
        <div className={`${clockSizes[size as keyof typeof clockSizes]} relative`}>
          {/* Outer ring with gradient */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(var(--primary), var(--text-secondary), var(--primary))',
              padding: '3px'
            }}
          >
            <div 
              className="w-full h-full rounded-full flex items-center justify-center"
              style={{
                backgroundColor: 'var(--surface)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Hour markers */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30) * (Math.PI / 180);
                const isMainMarker = i % 3 === 0;
                const radius = size === 'large' ? 95 : size === 'medium' ? 75 : 60;
                const x = Math.sin(angle) * radius;
                const y = -Math.cos(angle) * radius;
                const size_px = isMainMarker ? 8 : 4;
                
                return (
                  <div
                    key={i}
                    className="absolute rounded-full transition-all"
                    style={{
                      width: `${size_px}px`,
                      height: `${size_px}px`,
                      backgroundColor: isMainMarker ? 'var(--primary)' : 'var(--text-secondary)',
                      left: `50%`,
                      top: `50%`,
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                      opacity: isMainMarker ? 1 : 0.6
                    }}
                  />
                );
              })}

              {/* Hour hand */}
              <div
                className="absolute origin-bottom left-1/2 rounded-full transition-transform"
                style={{
                  width: '6px',
                  height: size === 'large' ? '35%' : size === 'medium' ? '28%' : '22%',
                  backgroundColor: 'var(--primary)',
                  bottom: '50%',
                  transform: `translateX(-50%) rotate(${hourDegrees}deg)`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                }}
              />

              {/* Minute hand */}
              <div
                className="absolute origin-bottom left-1/2 rounded-full transition-transform"
                style={{
                  width: '4px',
                  height: size === 'large' ? '45%' : size === 'medium' ? '36%' : '28%',
                  backgroundColor: 'var(--text)',
                  bottom: '50%',
                  transform: `translateX(-50%) rotate(${minuteDegrees}deg)`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              />

              {/* Second hand */}
              <div
                className="absolute origin-bottom left-1/2 transition-transform"
                style={{
                  width: '2px',
                  height: size === 'large' ? '50%' : size === 'medium' ? '40%' : '32%',
                  backgroundColor: 'var(--primary)',
                  opacity: 0.7,
                  bottom: '50%',
                  transform: `translateX(-50%) rotate(${secondDegrees}deg)`,
                }}
              />

              {/* Center dot */}
              <div 
                className="absolute rounded-full"
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: 'var(--primary)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SettingsPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Display Mode</label>
        <div className="flex gap-2">
          <button
            onClick={() => setConfig(c => ({ ...c, viewMode: 'digital' }))}
            className="flex-1 px-3 py-2 rounded text-xs font-medium transition-all border"
            style={{
              backgroundColor: config.viewMode === 'digital' ? 'var(--primary)' : 'var(--surface-alt)',
              color: config.viewMode === 'digital' ? 'white' : 'var(--text)',
              borderColor: config.viewMode === 'digital' ? 'var(--primary)' : 'var(--border)'
            }}
          >
            Digital
          </button>
          <button
            onClick={() => setConfig(c => ({ ...c, viewMode: 'analog' }))}
            className="flex-1 px-3 py-2 rounded text-xs font-medium transition-all border"
            style={{
              backgroundColor: config.viewMode === 'analog' ? 'var(--primary)' : 'var(--surface-alt)',
              color: config.viewMode === 'analog' ? 'white' : 'var(--text)',
              borderColor: config.viewMode === 'analog' ? 'var(--primary)' : 'var(--border)'
            }}
          >
            Analog
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Timezones</label>
        <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
          {COMMON_TIMEZONES.map(tz => (
            <label 
              key={tz.value} 
              className="flex items-center gap-2 p-2 rounded cursor-pointer transition-colors"
              style={{
                backgroundColor: 'var(--surface-alt)',
                color: 'var(--text-secondary)'
              }}
            >
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
                className="w-3 h-3 rounded cursor-pointer"
              />
              <span className="text-xs">{tz.label}</span>
            </label>
          ))}
        </div>
      </div>

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
    </div>
  );

  return (
    <Widget 
      className="relative overflow-hidden h-full flex flex-col"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex-1 flex flex-col justify-center items-center py-4 relative">
        {/* Animated background gradient */}
        <div 
          className="absolute inset-0 opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, var(--primary), transparent)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />

        {/* Main Display */}
        <div className="z-10 flex flex-col items-center justify-center w-full h-full">
          {config.viewMode === 'digital' ? (
            // Digital Clock Display
            <div className="flex flex-col items-center gap-3 px-4">
              <div className="text-center">
                <div 
                  className="text-7xl sm:text-8xl font-bold font-mono tracking-tighter tabular-nums"
                  style={{ color: 'var(--text)' }}
                >
                  {time.getHours().toString().padStart(2, '0')}
                  <span className="animate-pulse">:</span>
                  {time.getMinutes().toString().padStart(2, '0')}
                </div>
                <div 
                  className="text-sm font-mono mt-2 opacity-75"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {time.getSeconds().toString().padStart(2, '0')} sec
                </div>
              </div>
              <div 
                className="text-lg font-light tracking-wide"
                style={{ color: 'var(--text-secondary)' }}
              >
                {formatDate(time)}
              </div>
            </div>
          ) : (
            // Analog Clock Display
            <div className="flex flex-col items-center gap-4">
              <ModernAnalogClock tzTime={time} size={widgetSize || 'medium'} />
              <div 
                className="text-xs font-mono font-light tracking-widest"
                style={{ color: 'var(--text-secondary)' }}
              >
                {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}:{time.getSeconds().toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timezone List */}
      {activeTimezones.length > 0 && (
        <div 
          className="border-t p-3 z-10 space-y-2 max-h-32 overflow-y-auto custom-scrollbar"
          style={{ borderColor: 'var(--border)' }}
        >
          {activeTimezones.map((tz) => {
            const tzTime = tz ? getTimeInTimezone(tz) : time;
            const tzLabel = COMMON_TIMEZONES.find(t => t.value === tz)?.label || tz || 'Local';
            return (
              <div 
                key={tz || 'local'} 
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg border transition-all hover:border-current"
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                  <span className="text-xs truncate">{tzLabel}</span>
                </div>
                <span 
                  className="text-sm font-mono font-semibold whitespace-nowrap"
                  style={{ color: 'var(--primary)' }}
                >
                  {config.viewMode === 'analog' ? formatTimeShort(tzTime) : formatTime(tzTime)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </Widget>
  );
};
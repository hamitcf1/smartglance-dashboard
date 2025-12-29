import React, { useState, useEffect } from 'react';
import { Plus, Play, StopCircle, Trash2, Clock, Briefcase } from 'lucide-react';
import { Widget } from '../Widget';
import { WorkConfig } from '../../types';

interface WorkTrackerWidgetProps {
  config: WorkConfig;
  onConfigChange: (config: Partial<WorkConfig>) => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  onSizeChange?: (size: string) => void;
  widgetSize?: string;
  dragHandleProps?: any;
}

function formatDuration(hours: number) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
}

export const WorkTrackerWidget: React.FC<WorkTrackerWidgetProps> = ({
  config = {},
  onConfigChange,
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize = 'large',
  dragHandleProps
}) => {
  const hourlyRate = typeof config.hourlyRate === 'number' ? config.hourlyRate : 20;
  const sessions = config.sessions || [];
  const currentStart = config.currentStart || null;

  const [manualHours, setManualHours] = useState<string>('1');
  const [manualNote, setManualNote] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time
  useEffect(() => {
    if (!currentStart) {
      setElapsedTime(0);
      return;
    }
    const interval = setInterval(() => {
      const elapsed = (new Date().getTime() - new Date(currentStart).getTime()) / 1000 / 60 / 60;
      setElapsedTime(elapsed);
    }, 100);
    return () => clearInterval(interval);
  }, [currentStart]);

  const startTimer = () => {
    if (currentStart) return;
    onConfigChange({ currentStart: new Date().toISOString() });
  };

  const stopTimer = () => {
    if (!currentStart) return;
    const end = new Date().toISOString();
    const startDate = new Date(currentStart);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = Math.max(0, durationMs / (1000 * 60 * 60));
    const newSession = {
      id: `${Date.now()}`,
      start: currentStart,
      end,
      durationHours,
      note: ''
    };
    onConfigChange({ sessions: [...sessions, newSession], currentStart: null });
  };

  const addManual = () => {
    const hours = parseFloat(manualHours) || 0;
    if (hours <= 0) return;
    const newSession = {
      id: `${Date.now()}`,
      start: new Date().toISOString(),
      end: new Date().toISOString(),
      durationHours: hours,
      note: manualNote || ''
    };
    onConfigChange({ sessions: [...sessions, newSession] });
    setManualHours('1');
    setManualNote('');
  };

  const removeSession = (id: string) => {
    onConfigChange({ sessions: sessions.filter((s: any) => s.id !== id) });
  };

  const resetHistory = () => {
    if (!window.confirm('Clear all work history?')) return;
    onConfigChange({ sessions: [] });
  };

  const totalHours = sessions.reduce((sum: number, s: any) => sum + (s.durationHours || 0), 0);
  const totalEarnings = totalHours * hourlyRate;
  const currentEarnings = elapsedTime * hourlyRate;

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

      <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Hourly Rate</label>
        <input
          type="number"
          value={hourlyRate}
          onChange={(e) => onConfigChange({ hourlyRate: parseFloat(e.target.value) || 0 })}
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 transition-colors"
          style={{
            backgroundColor: 'var(--surface-alt)',
            borderColor: 'var(--border)',
            color: 'var(--text)'
          }}
        />
      </div>

      <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={resetHistory}
          className="w-full border rounded px-3 py-2 text-xs font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--surface-alt)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)'
          }}
        >
          Clear History
        </button>
      </div>
    </div>
  );

  return (
    <Widget
      title="💼 Work Tracker"
      className="h-full flex flex-col"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col h-full">
        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div 
            className="p-3 rounded-xl border text-center"
            style={{
              backgroundColor: 'var(--surface-alt)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Total</span>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              {totalHours.toFixed(1)}h
            </div>
          </div>

          <div 
            className="p-3 rounded-xl border text-center"
            style={{
              backgroundColor: 'var(--surface-alt)',
              borderColor: 'var(--border)'
            }}
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Briefcase className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Earnings</span>
            </div>
            <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              ${totalEarnings.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex gap-2 mb-4">
          {currentStart ? (
            <>
              <button 
                onClick={stopTimer} 
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all border hover:scale-105 text-white"
                style={{
                  backgroundColor: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  boxShadow: '0 4px 12px var(--primary)44'
                }}
              >
                <StopCircle className="w-4 h-4" />
                <span>Stop</span>
              </button>
              <div 
                className="flex-1 rounded-lg px-3 py-2.5 flex items-center justify-center border font-mono text-sm font-semibold"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)'
                }}
              >
                {formatDuration(elapsedTime)}
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={startTimer} 
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all border hover:scale-105 text-white"
                style={{
                  backgroundColor: 'var(--primary)',
                  borderColor: 'var(--primary)',
                  boxShadow: '0 4px 12px var(--primary)44'
                }}
              >
                <Play className="w-4 h-4" />
                <span>Start</span>
              </button>
              <div 
                className="flex-1 flex items-center gap-2 rounded-lg px-3 py-2.5 border"
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderColor: 'var(--border)'
                }}
              >
                <input
                  type="number"
                  step="0.25"
                  value={manualHours}
                  onChange={(e) => setManualHours(e.target.value)}
                  className="bg-transparent w-full text-xs outline-none font-mono"
                  style={{ color: 'var(--text)' }}
                  placeholder="hours"
                />
                <button 
                  onClick={addManual} 
                  className="rounded px-2 py-1 text-xs font-medium flex items-center gap-1 transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: 'white'
                  }}
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
          {sessions.length === 0 ? (
            <div className="text-center py-8 flex items-center justify-center h-full">
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                No sessions yet. Start the timer or add manually.
              </p>
            </div>
          ) : (
            sessions.slice().reverse().map((s: any) => (
              <div 
                key={s.id} 
                className="flex items-center justify-between p-3 rounded-lg border transition-all hover:border-current"
                style={{
                  backgroundColor: 'var(--surface-alt)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)'
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {s.note || new Date(s.start).toLocaleString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="text-xs flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatDuration(s.durationHours || 0)}
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <div 
                    className="text-sm font-semibold"
                    style={{ color: 'var(--primary)' }}
                  >
                    ${((s.durationHours || 0) * hourlyRate).toFixed(2)}
                  </div>
                  <button 
                    onClick={() => removeSession(s.id)} 
                    className="rounded p-1 transition-all hover:scale-110"
                    style={{
                      color: 'var(--primary)',
                      backgroundColor: 'var(--primary)' + '22'
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Widget>
  );
};

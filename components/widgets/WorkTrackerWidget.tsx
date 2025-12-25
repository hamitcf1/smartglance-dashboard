import React, { useState } from 'react';
import { Plus, Play, StopCircle, Trash2 } from 'lucide-react';
import { Widget } from '../Widget';
import { WorkConfig } from '../../types';

interface WorkTrackerWidgetProps {
  config: WorkConfig;
  onConfigChange: (config: Partial<WorkConfig>) => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  onSizeChange: (size: string) => void;
  widgetSize: string;
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
  widgetSize,
  dragHandleProps
}) => {
  const hourlyRate = typeof config.hourlyRate === 'number' ? config.hourlyRate : 20;
  const sessions = config.sessions || [];
  const currentStart = config.currentStart || null;

  const [manualHours, setManualHours] = useState<string>('1');
  const [manualNote, setManualNote] = useState<string>('');

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
        <label className="text-xs text-slate-400">Hourly Rate</label>
        <input
          type="number"
          value={hourlyRate}
          onChange={(e) => onConfigChange({ hourlyRate: parseFloat(e.target.value) || 0 })}
          className="w-full bg-slate-800 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none"
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-white/10">
        <button
          onClick={resetHistory}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-white/10 rounded px-2 py-1 text-sm text-slate-300 transition-colors"
        >
          Clear History
        </button>
      </div>
    </div>
  );

  return (
    <Widget
      title="Work Tracker"
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-400">Total Hours</div>
            <div className="text-2xl font-bold">{totalHours.toFixed(2)}h</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">Earnings</div>
            <div className="text-2xl font-bold text-emerald-400">${totalEarnings.toFixed(2)}</div>
          </div>
        </div>

        <div className="mt-4 border-t border-white/5 pt-4 flex-1 overflow-auto custom-scrollbar">
          <div className="flex gap-2 mb-3">
            {currentStart ? (
              <button onClick={stopTimer} className="flex-1 bg-rose-600 hover:bg-rose-700 rounded py-2 text-white flex items-center justify-center gap-2">
                <StopCircle className="w-4 h-4" /> Stop
              </button>
            ) : (
              <button onClick={startTimer} className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded py-2 text-white flex items-center justify-center gap-2">
                <Play className="w-4 h-4" /> Start
              </button>
            )}
            <div className="w-40 bg-slate-800 rounded px-2 py-2 flex items-center gap-2">
              <input
                type="number"
                step="0.25"
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                className="bg-transparent w-full text-sm outline-none text-white"
              />
              <button onClick={addManual} className="bg-slate-700 hover:bg-slate-600 rounded px-2 py-1 text-sm text-white flex items-center gap-2">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {sessions.length === 0 ? (
              <div className="text-center text-slate-500 py-8">No sessions yet. Start the timer or add manually.</div>
            ) : (
              sessions.slice().reverse().map((s: any) => (
                <div key={s.id} className="flex items-center justify-between bg-slate-800/40 rounded p-2">
                  <div>
                    <div className="text-sm font-medium">{s.note || new Date(s.start).toLocaleString()}</div>
                    <div className="text-xs text-slate-400">{formatDuration(s.durationHours || 0)}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold">${((s.durationHours || 0) * hourlyRate).toFixed(2)}</div>
                    <button onClick={() => removeSession(s.id)} className="text-rose-400 hover:text-rose-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Widget>
  );
};

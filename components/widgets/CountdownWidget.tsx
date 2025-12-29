import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Calendar, Clock } from 'lucide-react';
import { Widget } from '../Widget';

interface CountdownEvent {
  id: string;
  name: string;
  targetDate: string; // ISO date string
  color: 'indigo' | 'emerald' | 'rose' | 'amber' | 'cyan';
}

interface CountdownWidgetProps {
  isSettingsOpen?: boolean;
  onToggleSettings?: () => void;
  onSizeChange?: (size: string) => void;
  widgetSize?: string;
  dragHandleProps?: any;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize,
  dragHandleProps
}) => {
  const [events, setEvents] = useState<CountdownEvent[]>(() => {
    const saved = localStorage.getItem('smart-glance-countdown-events');
    return saved ? JSON.parse(saved) : [];
  });

  const [newEventName, setNewEventName] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventColor, setNewEventColor] = useState<CountdownEvent['color']>('indigo');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Auto-save events
  useEffect(() => {
    localStorage.setItem('smart-glance-countdown-events', JSON.stringify(events));
  }, [events]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeRemaining = (targetDate: string): TimeRemaining => {
    const target = new Date(targetDate).getTime();
    const now = currentTime.getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
  };

  const addEvent = () => {
    if (!newEventName.trim() || !newEventDate) {
      alert('Please fill in both event name and date');
      return;
    }

    const newEvent: CountdownEvent = {
      id: Date.now().toString(),
      name: newEventName,
      targetDate: newEventDate,
      color: newEventColor
    };

    setEvents([...events, newEvent]);
    setNewEventName('');
    setNewEventDate('');
    setNewEventColor('indigo');
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const getColorClasses = (color: CountdownEvent['color']) => {
    const colors: Record<CountdownEvent['color'], string> = {
      indigo: 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300',
      emerald: 'bg-emerald-600/20 border-emerald-500/50 text-emerald-300',
      rose: 'bg-rose-600/20 border-rose-500/50 text-rose-300',
      amber: 'bg-amber-600/20 border-amber-500/50 text-amber-300',
      cyan: 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300',
    };
    return colors[color];
  };

  const SettingsPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-semibold">Widget Size</label>
        <select
          value={widgetSize}
          onChange={(e) => onSizeChange?.(e.target.value)}
          className="w-full bg-slate-700 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="space-y-3 pt-3 border-t border-slate-600">
        <h3 className="text-xs text-slate-300 font-semibold">Add New Event</h3>

        <input
          type="text"
          placeholder="Event name"
          value={newEventName}
          onChange={(e) => setNewEventName(e.target.value)}
          className="w-full bg-slate-700 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <input
          type="datetime-local"
          value={newEventDate}
          onChange={(e) => setNewEventDate(e.target.value)}
          className="w-full bg-slate-700 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        />

        <select
          value={newEventColor}
          onChange={(e) => setNewEventColor(e.target.value as CountdownEvent['color'])}
          className="w-full bg-slate-700 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="indigo">Indigo</option>
          <option value="emerald">Emerald</option>
          <option value="rose">Rose</option>
          <option value="amber">Amber</option>
          <option value="cyan">Cyan</option>
        </select>

        <button
          onClick={addEvent}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium transition-colors border border-indigo-500/30"
        >
          <Plus className="w-3 h-3" />
          Add Event
        </button>
      </div>
    </div>
  );

  return (
    <Widget
      title="⏳ Countdown"
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      {events.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-xs text-slate-400 text-center">
            No countdown events yet.<br />Add one in settings!
          </p>
        </div>
      ) : (
        <div className="space-y-3 pr-2">
          {events.map(event => {
            const timeRemaining = calculateTimeRemaining(event.targetDate);
            const colorClass = getColorClasses(event.color);

            return (
              <div
                key={event.id}
                className={`p-3 rounded-lg border ${colorClass} space-y-2`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{event.name}</h4>
                    <p className="text-xs opacity-75 mt-1">
                      {new Date(event.targetDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {timeRemaining.isExpired ? (
                  <div className="text-center py-2">
                    <p className="font-bold text-base">🎉 Event Started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1 pt-2">
                    <div className="bg-slate-900/50 rounded p-1 text-center">
                      <p className="font-bold text-xs">{timeRemaining.days}</p>
                      <p className="text-[10px] opacity-70">days</p>
                    </div>
                    <div className="bg-slate-900/50 rounded p-1 text-center">
                      <p className="font-bold text-xs">{String(timeRemaining.hours).padStart(2, '0')}</p>
                      <p className="text-[10px] opacity-70">hrs</p>
                    </div>
                    <div className="bg-slate-900/50 rounded p-1 text-center">
                      <p className="font-bold text-xs">{String(timeRemaining.minutes).padStart(2, '0')}</p>
                      <p className="text-[10px] opacity-70">min</p>
                    </div>
                    <div className="bg-slate-900/50 rounded p-1 text-center">
                      <p className="font-bold text-xs">{String(timeRemaining.seconds).padStart(2, '0')}</p>
                      <p className="text-[10px] opacity-70">sec</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Widget>
  );
};

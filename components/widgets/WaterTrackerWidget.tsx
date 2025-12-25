import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Minus } from 'lucide-react';
import { Widget } from '../Widget';
import { WaterConfig } from '../../types';

interface WaterTrackerWidgetProps {
  config: WaterConfig;
  onConfigChange: (config: Partial<WaterConfig>) => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  onSizeChange: (size: string) => void;
  widgetSize: string;
  dragHandleProps?: any;
}

export const WaterTrackerWidget: React.FC<WaterTrackerWidgetProps> = ({
  config,
  onConfigChange,
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize,
  dragHandleProps
}) => {
  const dailyGoal = config.dailyGoal || 8;
  const consumed = config.consumed || 0;
  const lastReset = config.lastReset || new Date().toISOString().split('T')[0];
  
  const today = new Date().toISOString().split('T')[0];
  
  // Reset if date changed
  useEffect(() => {
    if (lastReset !== today) {
      onConfigChange({
        consumed: 0,
        lastReset: today
      });
    }
  }, [today, lastReset, onConfigChange]);

  const addCup = () => {
    onConfigChange({ consumed: consumed + 1 });
  };

  const removeCup = () => {
    if (consumed > 0) {
      onConfigChange({ consumed: consumed - 1 });
    }
  };

  const percentage = (consumed / dailyGoal) * 100;
  const isGoalMet = consumed >= dailyGoal;

  // Calculate progress ring
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
        <label className="text-xs text-slate-400">Daily Goal (cups)</label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (dailyGoal > 1) {
                onConfigChange({ dailyGoal: dailyGoal - 1 });
              }
            }}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded px-2 py-1 text-sm text-white transition-colors"
          >
            <Minus className="w-4 h-4 mx-auto" />
          </button>
          <div className="flex-1 bg-slate-800 border border-white/10 rounded px-2 py-1 flex items-center justify-center">
            <span className="text-sm font-semibold">{dailyGoal} cups</span>
          </div>
          <button
            onClick={() => {
              if (dailyGoal < 16) {
                onConfigChange({ dailyGoal: dailyGoal + 1 });
              }
            }}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded px-2 py-1 text-sm text-white transition-colors"
          >
            <Plus className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-white/10">
        <button
          onClick={() => onConfigChange({ consumed: 0 })}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-white/10 rounded px-2 py-1 text-sm text-slate-300 transition-colors"
        >
          Reset Today
        </button>
      </div>
    </div>
  );

  return (
    <Widget
      title="Water Intake"
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col items-center justify-center h-full py-6">
        {/* Circular Progress Ring */}
        <div className="relative w-32 h-32 mb-6">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke="#1e293b"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="45"
              fill="none"
              stroke={isGoalMet ? '#10b981' : '#6366f1'}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">{consumed}</span>
              <span className="text-sm text-slate-400">{dailyGoal}</span>
            </div>
            <span className="text-xs text-slate-500 mt-1">cups</span>
          </div>
        </div>

        {/* Status Message */}
        <div className="text-center mb-6">
          {isGoalMet ? (
            <p className="text-sm font-semibold text-green-400">🎉 Goal Met!</p>
          ) : (
            <p className="text-sm text-slate-400">{dailyGoal - consumed} more cups</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 w-full px-4">
          <button
            onClick={removeCup}
            disabled={consumed === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded py-2 text-white transition-colors"
          >
            <Minus className="w-4 h-4" />
            <span className="text-sm">Remove</span>
          </button>
          <button
            onClick={addCup}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 rounded py-2 text-white transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Add Cup</span>
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 w-full px-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Droplets className="w-3 h-3 text-blue-400" />
            <span>{Math.round(percentage)}% Complete</span>
          </div>
        </div>
      </div>
    </Widget>
  );
};

import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, Zap } from 'lucide-react';
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

  const percentage = Math.min((consumed / dailyGoal) * 100, 100);
  const isGoalMet = consumed >= dailyGoal;
  const remaining = Math.max(0, dailyGoal - consumed);

  const SettingsPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Widget Size</label>
        <select
          value={widgetSize}
          onChange={(e) => onSizeChange(e.target.value)}
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
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Daily Goal (cups)</label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (dailyGoal > 1) {
                onConfigChange({ dailyGoal: dailyGoal - 1 });
              }
            }}
            className="flex-1 hover:scale-105 border rounded px-2 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--surface-alt)',
              borderColor: 'var(--border)',
              color: 'var(--text)'
            }}
          >
            <Minus className="w-4 h-4 mx-auto" />
          </button>
          <div 
            className="flex-1 border rounded px-2 py-2 flex items-center justify-center font-semibold"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--primary)',
              color: 'var(--primary)'
            }}
          >
            <span className="text-sm">{dailyGoal} cups</span>
          </div>
          <button
            onClick={() => {
              if (dailyGoal < 16) {
                onConfigChange({ dailyGoal: dailyGoal + 1 });
              }
            }}
            className="flex-1 hover:scale-105 border rounded px-2 py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: 'var(--surface-alt)',
              borderColor: 'var(--border)',
              color: 'var(--text)'
            }}
          >
            <Plus className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => onConfigChange({ consumed: 0 })}
          className="w-full border rounded px-3 py-2 text-xs font-medium transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--surface-alt)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)'
          }}
        >
          Reset Today
        </button>
      </div>
    </div>
  );

  return (
    <Widget
      title="💧 Water Intake"
      className="h-full flex flex-col justify-between"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col items-center justify-center py-6 flex-1">
        {/* Animated Liquid Progress Container */}
        <div className="relative w-32 h-40 mb-6 rounded-full overflow-hidden border-4" style={{ borderColor: 'var(--primary)' }}>
          {/* Outer glow */}
          <div 
            className="absolute inset-0 opacity-20 blur-lg"
            style={{
              background: 'var(--primary)',
              animation: 'pulse 3s ease-in-out infinite'
            }}
          />
          
          {/* Water fill container */}
          <div 
            className="absolute bottom-0 left-0 right-0 transition-all duration-700"
            style={{
              height: `${percentage}%`,
              background: `linear-gradient(180deg, var(--primary), var(--primary))`,
              opacity: isGoalMet ? 1 : 0.85
            }}
          >
            {/* Wave effect */}
            <div 
              className="absolute top-0 left-0 right-0 h-1 opacity-30"
              style={{ backgroundColor: 'white' }}
            />
          </div>

          {/* Background */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: 'var(--surface)', zIndex: -1 }}
          />

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                {consumed}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                /{dailyGoal}
              </span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>cups</span>
          </div>
        </div>

        {/* Status Message with animation */}
        <div className="text-center mb-4 h-8 flex items-center">
          {isGoalMet ? (
            <div className="flex items-center gap-1" style={{ color: 'var(--primary)' }}>
              <Zap className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-semibold">Goal Met! 🎉</span>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {remaining} cup{remaining === 1 ? '' : 's'} remaining
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full px-6 mb-6">
          <div className="h-2 rounded-full overflow-hidden border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-alt)' }}>
            <div 
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${percentage}%`,
                background: `linear-gradient(90deg, var(--primary), var(--primary))`,
                boxShadow: '0 0 8px var(--primary)66'
              }}
            />
          </div>
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
            {Math.round(percentage)}% complete
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full px-6">
          <button
            onClick={removeCup}
            disabled={consumed === 0}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all border hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--surface-alt)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)'
            }}
          >
            <Minus className="w-4 h-4" />
            <span>Remove</span>
          </button>
          <button
            onClick={addCup}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all border hover:scale-105 text-white"
            style={{
              backgroundColor: 'var(--primary)',
              borderColor: 'var(--primary)',
              boxShadow: '0 4px 12px var(--primary)44'
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Cup</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </Widget>
  );
};

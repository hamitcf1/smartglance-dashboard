import React from 'react';
import { Widget } from '../Widget';
import { useTheme } from '../../services/theme';

interface DarkModeWidgetProps {
  isSettingsOpen?: boolean;
  onToggleSettings?: () => void;
  onSizeChange?: (size: string) => void;
  widgetSize?: string;
  dragHandleProps?: any;
}

export const DarkModeWidget: React.FC<DarkModeWidgetProps> = ({
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize,
  dragHandleProps
}) => {
  const { themeName, setThemeName, availableThemes } = useTheme();

  const themeNames: Record<string, { label: string; icon: string }> = {
    dark: { label: 'Dark', icon: '🌙' },
    light: { label: 'Light', icon: '☀️' },
    dracula: { label: 'Dracula', icon: '🧛' },
    nord: { label: 'Nord', icon: '❄️' },
    solarized: { label: 'Solarized', icon: '🌅' }
  };

  const SettingsPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Widget Size</label>
        <select
          value={widgetSize}
          onChange={(e) => onSizeChange?.(e.target.value)}
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2"
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
      </div>      <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
        Switch themes instantly. Changes apply immediately to the entire dashboard.
      </p>
    </div>
  );

  return (
    <Widget
      title="🎨 Theme"
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col gap-3 h-full justify-between">
        <div className="space-y-2">
          <p className="text-xs mb-3">
            Current: <span className="font-semibold capitalize" style={{ color: 'var(--primary)' }}>{themeName}</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            {availableThemes.map(theme => {
              const info = themeNames[theme];
              const isActive = themeName === theme;
              
              return (
                <button
                  key={theme}
                  onClick={() => setThemeName(theme)}
                  className="p-2 rounded-lg text-xs font-medium transition-all text-center border"
                  style={{
                    backgroundColor: isActive ? 'var(--primary)' : 'var(--surface-alt)',
                    color: isActive ? 'white' : 'var(--text)',
                    borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                    borderWidth: isActive ? '2px' : '1px'
                  }}
                >
                  <div className="text-lg mb-1">{info.icon}</div>
                  <div>{info.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="p-3 rounded-lg text-xs text-center border"
          style={{
            backgroundColor: 'var(--surface-alt)',
            color: 'var(--text-secondary)',
            borderColor: 'var(--border)'
          }}
        >
          ✓ Theme applied to all widgets
        </div>
      </div>
    </Widget>
  );
};

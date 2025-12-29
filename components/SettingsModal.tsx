import React from 'react';
import { X, RotateCw } from 'lucide-react';
import { UserSettings } from '../types';
import { useTheme, ThemeName } from '../services/theme';

interface SettingsModalProps {
  settings: UserSettings;
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
  onRestartOnboarding?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose, onSave, onRestartOnboarding }) => {
  const [localSettings, setLocalSettings] = React.useState<UserSettings>(settings);
  const { themeName, setThemeName, availableThemes } = useTheme();
  const isDarkMode = themeName !== 'light';

  const handleChange = (key: keyof UserSettings, value: string | boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="border rounded-2xl w-full max-w-md shadow-2xl p-6 relative" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Settings</h2>
          <button onClick={onClose} className="transition-colors" style={{ color: 'var(--text-secondary)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: 'var(--text)' }}>Display Name</label>
            <input
              type="text"
              value={localSettings.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
              className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition-colors border"
              style={{
                backgroundColor: 'var(--surface-alt)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }}
            />
          </div>

          <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--primary)', backgroundOpacity: 0.1, borderColor: 'var(--primary)', borderOpacity: 0.3 }}>
            <button
              onClick={() => {
                onRestartOnboarding?.();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white'
              }}
            >
              <RotateCw className="w-4 h-4" />
              Restart Setup Wizard
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--primary)' }}>
              Go through the onboarding process again to reconfigure your dashboard
            </p>
          </div>

          <div className="space-y-4">
             <h3 className="text-sm font-medium" style={{ color: 'var(--text)' }}>Global Preferences</h3>
             
             {/* Note: Individual Widget visibility is now largely handled by adding/removing widgets in the grid (future feature), 
                 but keeping these toggles for backward compatibility or simple hiding logic if preferred */}
             
             <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Show Weather</span>
                <Toggle 
                  checked={localSettings.showWeather} 
                  onChange={(checked) => handleChange('showWeather', checked)} 
                  isDarkMode={themeName !== 'light'}
                />
             </div>
             
             <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Show News Feed</span>
                <Toggle 
                  checked={localSettings.showNews} 
                  onChange={(checked) => handleChange('showNews', checked)} 
                  isDarkMode={themeName !== 'light'}
                />
             </div>
             
             <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Show Smart Briefing</span>
                <Toggle 
                  checked={localSettings.showBriefing} 
                  onChange={(checked) => handleChange('showBriefing', checked)} 
                  isDarkMode={themeName !== 'light'}
                />
             </div>

             <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Show Quick Links</span>
                <Toggle 
                  checked={localSettings.showLinks} 
                  onChange={(checked) => handleChange('showLinks', checked)} 
                  isDarkMode={themeName !== 'light'}
                />
             </div>

             <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Use Celsius</span>
                <Toggle 
                  checked={localSettings.useCelsius} 
                  onChange={(checked) => handleChange('useCelsius', checked)} 
                  isDarkMode={themeName !== 'light'}
                />
             </div>

             <div className="pt-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
                <label className="text-sm font-medium block" style={{ color: 'var(--text)' }}>Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableThemes.map(t => {
                    const themeNames: Record<string, string> = {
                      dark: '🌙 Dark',
                      light: '☀️ Light',
                      dracula: '🧛 Dracula',
                      nord: '❄️ Nord',
                      solarized: '🌅 Solarized'
                    };
                    return (
                      <button
                        key={t}
                        onClick={() => setThemeName(t)}
                        className="p-2 rounded-lg text-xs font-medium transition-all border"
                        style={{
                          backgroundColor: themeName === t ? 'var(--primary)' : 'var(--surface-alt)',
                          color: themeName === t ? 'white' : 'var(--text)',
                          borderColor: themeName === t ? 'var(--primary)' : 'var(--border)',
                          borderWidth: themeName === t ? '2px' : '1px'
                        }}
                      >
                        {themeNames[t]}
                      </button>
                    );
                  })}
                </div>
             </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${isDarkMode ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-300/20 text-slate-700 hover:bg-slate-300/30'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-medium shadow-lg shadow-indigo-500/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const Toggle: React.FC<{ checked: boolean; onChange: (val: boolean) => void; isDarkMode: boolean }> = ({ checked, onChange, isDarkMode }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${checked ? 'bg-indigo-600' : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}
  >
    <div 
      className={`w-4 h-4 rounded-full ${isDarkMode ? 'bg-white' : 'bg-slate-900'} absolute top-1 shadow-sm transition-all duration-300 ease-in-out ${
        checked ? 'left-[calc(100%-1.25rem)] scale-110' : 'left-1 scale-100'
      }`} 
    />
  </button>
);
import React from 'react';
import { X } from 'lucide-react';
import { UserSettings } from '../types';
import { useTheme } from '../services/theme';

interface SettingsModalProps {
  settings: UserSettings;
  onClose: () => void;
  onSave: (settings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose, onSave }) => {
  const [localSettings, setLocalSettings] = React.useState<UserSettings>(settings);
  const { isDarkMode } = useTheme();

  const handleChange = (key: keyof UserSettings, value: string | boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-slate-50 border-slate-200'} border rounded-2xl w-full max-w-md shadow-2xl p-6 relative`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h2>
          <button onClick={onClose} className={`transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Display Name</label>
            <input
              type="text"
              value={localSettings.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
              className={`w-full rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors ${isDarkMode ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-slate-300 text-slate-900'}`}
            />
          </div>

          <div className="space-y-4">
             <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Global Preferences</h3>
             
             {/* Note: Individual Widget visibility is now largely handled by adding/removing widgets in the grid (future feature), 
                 but keeping these toggles for backward compatibility or simple hiding logic if preferred */}
             
             <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Show Weather</span>
                <Toggle 
                  checked={localSettings.showWeather} 
                  onChange={(checked) => handleChange('showWeather', checked)} 
                  isDarkMode={isDarkMode}
                />
             </div>
             
             <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Show News Feed</span>
                <Toggle 
                  checked={localSettings.showNews} 
                  onChange={(checked) => handleChange('showNews', checked)} 
                  isDarkMode={isDarkMode}
                />
             </div>
             
             <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Show Smart Briefing</span>
                <Toggle 
                  checked={localSettings.showBriefing} 
                  onChange={(checked) => handleChange('showBriefing', checked)} 
                  isDarkMode={isDarkMode}
                />
             </div>

             <div className="flex items-center justify-between">
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Show Quick Links</span>
                <Toggle 
                  checked={localSettings.showLinks} 
                  onChange={(checked) => handleChange('showLinks', checked)} 
                  isDarkMode={isDarkMode}
                />
             </div>

             <div className={`flex items-center justify-between pt-4 ${isDarkMode ? 'border-white/10' : 'border-slate-200'} border-t`}>
                <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Use Celsius</span>
                <Toggle 
                  checked={localSettings.useCelsius} 
                  onChange={(checked) => handleChange('useCelsius', checked)} 
                  isDarkMode={isDarkMode}
                />
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
import React, { ReactNode } from 'react';
import { Settings, X, GripVertical } from 'lucide-react';

interface WidgetProps {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  // New props for DnD and Settings
  settingsContent?: ReactNode;
  onSettingsToggle?: () => void;
  isSettingsOpen?: boolean;
  dragHandleProps?: any;
}

export const Widget: React.FC<WidgetProps> = ({ 
  title, 
  children, 
  className = '', 
  action,
  settingsContent,
  onSettingsToggle,
  isSettingsOpen,
  dragHandleProps
}) => {
  return (
    <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col shadow-lg transition-all hover:bg-white/10 relative group h-full ${className}`}>
      {/* Header / Toolbar */}
      <div className="flex justify-between items-center p-5 pb-2">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          {dragHandleProps && (
            <button 
              {...dragHandleProps}
              className="p-1 -ml-2 rounded cursor-grab active:cursor-grabbing text-slate-500 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Drag to move"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          {title && <div className="text-sm font-medium text-indigo-300 uppercase tracking-wider">{title}</div>}
        </div>
        
        <div className="flex items-center gap-1">
          {action}
          {settingsContent && (
            <button
              onClick={onSettingsToggle}
              className={`p-1.5 rounded-full transition-colors ${isSettingsOpen ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-white opacity-0 group-hover:opacity-100'}`}
              title="Widget Settings"
            >
              {isSettingsOpen ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-5 pt-2 relative overflow-hidden">
        {isSettingsOpen && settingsContent ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-200 h-full overflow-y-auto custom-scrollbar">
            <h4 className="text-xs font-semibold text-slate-500 uppercase mb-3 border-b border-white/10 pb-2">Configuration</h4>
            {settingsContent}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
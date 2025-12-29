import React, { ReactNode } from 'react';

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
    <div 
      className={`backdrop-blur-md border rounded-2xl flex flex-col shadow-lg transition-all relative group h-full focus-within:ring-2 focus-within:ring-indigo-400 ${className}`}
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
      role="region"
      aria-label={typeof title === 'string' ? title : 'Widget'}
    >
      {/* Header / Toolbar */}
      <div className="flex justify-between items-center p-4 sm:p-5 pb-2">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          {dragHandleProps && (
            <button 
              {...dragHandleProps}
              className="p-1 -ml-2 rounded cursor-grab active:cursor-grabbing text-slate-500 hover:text-indigo-400 hover:bg-slate-700/30 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Drag to move"
              aria-label="Drag to reorder widget"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm4-8h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2z"/></svg>
            </button>
          )}
          {title && <div className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--primary)' }}>{title}</div>}
        </div>
        
        <div className="flex items-center gap-1">
          {action}
          {settingsContent && (
            <button
              onClick={onSettingsToggle}
              className={`p-1.5 rounded-full transition-colors ${isSettingsOpen ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-white opacity-0 group-hover:opacity-100'}`}
              title="Widget Settings"
              aria-label={isSettingsOpen ? 'Close settings' : 'Open settings'}
              aria-expanded={isSettingsOpen}
            >
              {isSettingsOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-5 pt-2 relative overflow-hidden">
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
import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Loader2, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { Widget } from '../Widget';
import { ServicesConfig } from '../../types';

interface ServiceItem {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  isChecking: boolean;
}

interface ServicesWidgetProps {
  config: ServicesConfig;
  onConfigChange: (config: Partial<ServicesConfig>) => void;
  isSettingsOpen?: boolean;
  onToggleSettings?: () => void;
  onSizeChange?: (size: string) => void;
  widgetSize?: string;
  dragHandleProps?: any;
  refreshTrigger?: number;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 'qbittorrent', name: 'QbitTorrent', url: 'http://100.110.161.50:8081/', isActive: false, isChecking: false },
  { id: 'jellyfin', name: 'Jellyfin', url: 'http://100.110.161.50:8096/', isActive: false, isChecking: false },
  { id: 'sonarr', name: 'Sonarr', url: 'http://100.110.161.50:8989/', isActive: false, isChecking: false },
  { id: 'radarr', name: 'Radarr', url: 'http://100.110.161.50:7878/', isActive: false, isChecking: false },
  { id: 'bazarr', name: 'Bazarr', url: 'http://100.110.161.50:6767/', isActive: false, isChecking: false },
  { id: 'n8n', name: 'n8n', url: 'http://100.110.161.50:5678/', isActive: false, isChecking: false },
  { id: 'plex', name: 'Plex', url: 'http://100.110.161.50:32400/', isActive: false, isChecking: false },
  { id: 'seer', name: 'Seer', url: 'http://100.110.161.50:5055/', isActive: false, isChecking: false },
  { id: 'glance', name: 'Glance', url: 'http://100.110.161.50:9090/', isActive: false, isChecking: false },
];

export const ServicesWidget: React.FC<ServicesWidgetProps> = ({
  config,
  onConfigChange,
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize,
  dragHandleProps,
  refreshTrigger = 0,
}) => {
  const [services, setServices] = useState<ServiceItem[]>(() => {
    return config.services || DEFAULT_SERVICES;
  });

  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceUrl, setNewServiceUrl] = useState('');

  // Check service status by making a simple HEAD/GET request
  const checkServiceStatus = useCallback(async (service: ServiceItem) => {
    setServices(prev =>
      prev.map(s =>
        s.id === service.id ? { ...s, isChecking: true } : s
      )
    );

    try {
      // Use no-cors mode and a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(service.url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors',
      });

      clearTimeout(timeoutId);

      setServices(prev =>
        prev.map(s =>
          s.id === service.id ? { ...s, isActive: true, isChecking: false } : s
        )
      );
    } catch (error) {
      setServices(prev =>
        prev.map(s =>
          s.id === service.id ? { ...s, isActive: false, isChecking: false } : s
        )
      );
    }
  }, []);

  // Check all services on mount and on refresh trigger
  useEffect(() => {
    services.forEach(service => {
      checkServiceStatus(service);
    });
  }, [refreshTrigger, checkServiceStatus]);

  // Update config when services change
  useEffect(() => {
    onConfigChange({ services });
  }, [services, onConfigChange]);

  const handleAddService = () => {
    if (!newServiceName.trim() || !newServiceUrl.trim()) {
      alert('Please enter both service name and URL');
      return;
    }

    const newService: ServiceItem = {
      id: newServiceName.toLowerCase().replace(/\s+/g, '-'),
      name: newServiceName,
      url: newServiceUrl.endsWith('/') ? newServiceUrl : newServiceUrl + '/',
      isActive: false,
      isChecking: false,
    };

    setServices([...services, newService]);
    setNewServiceName('');
    setNewServiceUrl('');
    
    // Check the new service immediately
    checkServiceStatus(newService);
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const handleManualCheck = (service: ServiceItem) => {
    checkServiceStatus(service);
  };

  const SettingsPanel = (
    <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
      <div className="space-y-2">
        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
          Widget Size
        </label>
        <select
          value={widgetSize}
          onChange={(e) => onSizeChange?.(e.target.value)}
          className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--surface-alt)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
          }}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
        <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
          Add Custom Service
        </h4>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Service Name"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--surface-alt)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          />
          <input
            type="text"
            placeholder="Service URL (e.g., http://192.168.1.1:3000/)"
            value={newServiceUrl}
            onChange={(e) => setNewServiceUrl(e.target.value)}
            className="w-full border rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--surface-alt)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          />
          <button
            onClick={handleAddService}
            className="w-full p-2 rounded text-xs font-semibold transition-colors text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus className="inline mr-2" size={14} />
            Add Service
          </button>
        </div>
      </div>

      <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
        <h4 className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>
          Manage Services
        </h4>
        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
          {services.map(service => (
            <div
              key={service.id}
              className="flex items-center justify-between p-2 rounded text-xs"
              style={{ backgroundColor: 'var(--surface-alt)', borderColor: 'var(--border)', borderWidth: '1px' }}
            >
              <div className="flex-1 truncate">
                <div className="font-medium">{service.name}</div>
                <div style={{ color: 'var(--text-secondary)' }} className="truncate text-xs">
                  {service.url}
                </div>
              </div>
              <button
                onClick={() => handleRemoveService(service.id)}
                className="ml-2 p-1 text-red-400 hover:text-red-300 transition-colors"
                title="Remove service"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Widget
      title="🔗 Services"
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      <div className="flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar">
        {services.length === 0 ? (
          <div
            className="flex items-center justify-center h-full text-xs"
            style={{ color: 'var(--text-secondary)' }}
          >
            <p>No services configured. Add one in settings.</p>
          </div>
        ) : (
          services.map(service => (
            <div
              key={service.id}
              className="flex items-center gap-3 p-3 rounded-lg border transition-colors hover:opacity-80"
              style={{
                backgroundColor: service.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderColor: service.isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
              }}
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold">{service.name}</h4>
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs truncate"
                  style={{ color: 'var(--primary)' }}
                >
                  {service.url}
                </a>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleManualCheck(service)}
                  disabled={service.isChecking}
                  className="p-1 rounded hover:opacity-70 transition-opacity"
                  title="Check service status"
                >
                  {service.isChecking ? (
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--primary)' }} />
                  ) : service.isActive ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </button>

                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded hover:opacity-70 transition-opacity"
                  title="Open service"
                  style={{ color: 'var(--primary)' }}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </Widget>
  );
};

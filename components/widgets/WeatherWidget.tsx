import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, CloudRain, Sun, Wind, Loader2, MapPin, Search, Eye } from 'lucide-react';
import { Widget } from '../Widget';
import { WeatherData, WeatherConfig } from '../../types';

interface WeatherWidgetProps {
  useCelsius: boolean;
  refreshTrigger: number;
  config: WeatherConfig;
  onConfigChange: (config: Partial<WeatherConfig>) => void;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  onSizeChange: (size: string) => void;
  widgetSize: string;
  dragHandleProps?: any;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  useCelsius, 
  refreshTrigger, 
  config, 
  onConfigChange,
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize,
  dragHandleProps
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [citySearch, setCitySearch] = useState('');
  const [searchingCity, setSearchingCity] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,is_day,wind_speed_10m&temperature_unit=celsius`
      );
      if (!res.ok) throw new Error('Failed to fetch weather');
      const data = await res.json();
      
      setWeather({
        temperature: data.current.temperature_2m,
        weatherCode: data.current.weather_code,
        isDay: data.current.is_day,
        windSpeed: data.current.wind_speed_10m
      });
    } catch (err) {
      setError('Weather unavailable');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCitySearch = async () => {
    if (!citySearch.trim()) return;
    setSearchingCity(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(citySearch)}&count=1&language=en&format=json`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const { latitude, longitude, name, country } = data.results[0];
        onConfigChange({
          lat: latitude,
          lon: longitude,
          city: `${name}, ${country || ''}`,
          useAutoLocation: false
        });
        setCitySearch('');
        onToggleSettings();
      } else {
        alert('City not found');
      }
    } catch (e) {
      console.error(e);
      alert('Search failed');
    } finally {
      setSearchingCity(false);
    }
  };

  useEffect(() => {
    if (config.useAutoLocation !== false) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
          },
          () => {
            fetchWeather(37.7749, -122.4194);
          }
        );
      } else {
        fetchWeather(37.7749, -122.4194);
      }
    } else if (config.lat && config.lon) {
      fetchWeather(config.lat, config.lon);
    } else {
      fetchWeather(37.7749, -122.4194);
    }
  }, [fetchWeather, refreshTrigger, config.useAutoLocation, config.lat, config.lon]);

  const getWeatherIcon = (code: number, isDay: number) => {
    if (code === 0 || code === 1) return isDay ? <Sun className="w-16 h-16" style={{ color: 'var(--primary)' }} /> : <Sun className="w-16 h-16" style={{ color: 'var(--text-secondary)' }} />;
    if (code > 1 && code < 48) return <Cloud className="w-16 h-16" style={{ color: 'var(--text-secondary)' }} />;
    if (code >= 51) return <CloudRain className="w-16 h-16" style={{ color: 'var(--primary)' }} />;
    return <Sun className="w-16 h-16" style={{ color: 'var(--primary)' }} />;
  };

  const getConditionText = (code: number) => {
    if (code === 0) return 'Clear';
    if (code === 1 || code === 2 || code === 3) return 'Cloudy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71) return 'Snowy';
    if (code >= 95) return 'Storm';
    return 'Cloudy';
  };

  const displayTemp = weather 
    ? (useCelsius ? weather.temperature : (weather.temperature * 9/5) + 32).toFixed(1)
    : '--';

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

      <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <label className="text-xs font-semibold" style={{ color: 'var(--text)' }}>Location</label>
        
        <button 
          onClick={() => onConfigChange({ useAutoLocation: true })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all border"
          style={{
            backgroundColor: config.useAutoLocation !== false ? 'var(--primary)' : 'var(--surface-alt)',
            borderColor: config.useAutoLocation !== false ? 'var(--primary)' : 'var(--border)',
            color: config.useAutoLocation !== false ? 'white' : 'var(--text-secondary)'
          }}
        >
          <MapPin className="w-3.5 h-3.5" /> Auto Location
        </button>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search city..." 
            className="w-full border rounded-lg px-3 py-2 pl-8 text-xs focus:outline-none focus:ring-2 transition-colors"
            style={{
              backgroundColor: 'var(--surface-alt)',
              borderColor: 'var(--border)',
              color: 'var(--text)'
            }}
            value={citySearch}
            onChange={e => setCitySearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5" style={{ color: 'var(--text-secondary)' }} />
          <button 
            onClick={handleCitySearch}
            disabled={!citySearch || searchingCity}
            className="absolute right-1 top-1 px-2 py-1 rounded text-xs font-medium transition-all"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              opacity: !citySearch || searchingCity ? 0.5 : 1
            }}
          >
            {searchingCity ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
          </button>
        </div>
        
        {!config.useAutoLocation && config.city && (
          <div className="text-xs text-center rounded-lg p-2" style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)' }}>
            {config.city}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Widget 
      title="🌤️ Weather" 
      className="h-full flex flex-col justify-between"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      ) : weather ? (
        <div className="flex flex-col h-full justify-between space-y-4">
          {/* Main Weather Display */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {config.city && (
                <div className="flex items-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {config.city}
                  </span>
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold" style={{ color: 'var(--text)' }}>
                  {displayTemp}°
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {useCelsius ? 'C' : 'F'}
                </span>
              </div>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                {getConditionText(weather.weatherCode)}
              </p>
            </div>

            {/* Weather Icon */}
            <div className="flex-shrink-0 mt-1">
              {getWeatherIcon(weather.weatherCode, weather.isDay)}
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div 
              className="p-3 rounded-lg border flex items-center gap-2"
              style={{
                backgroundColor: 'var(--surface-alt)',
                borderColor: 'var(--border)'
              }}
            >
              <Wind className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Wind</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {weather.windSpeed} km/h
                </div>
              </div>
            </div>

            <div 
              className="p-3 rounded-lg border flex items-center gap-2"
              style={{
                backgroundColor: 'var(--surface-alt)',
                borderColor: 'var(--border)'
              }}
            >
              <Eye className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Feels</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {displayTemp}°
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Widget>
  );
};
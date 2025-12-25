import React, { useState, useEffect, useCallback } from 'react';
import { Cloud, CloudRain, Sun, Wind, Loader2, Thermometer, MapPin, Search } from 'lucide-react';
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

  // Search for city coordinates
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
        onToggleSettings(); // Close settings on success
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
    if (config.useAutoLocation !== false) { // Default to true if undefined
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchWeather(position.coords.latitude, position.coords.longitude);
          },
          () => {
            fetchWeather(37.7749, -122.4194); // Default SF
          }
        );
      } else {
        fetchWeather(37.7749, -122.4194);
      }
    } else if (config.lat && config.lon) {
      fetchWeather(config.lat, config.lon);
    } else {
      // Fallback
      fetchWeather(37.7749, -122.4194);
    }
  }, [fetchWeather, refreshTrigger, config.useAutoLocation, config.lat, config.lon]);

  const getWeatherIcon = (code: number, isDay: number) => {
    if (code === 0 || code === 1) return isDay ? <Sun className="w-10 h-10 text-yellow-400" /> : <Sun className="w-10 h-10 text-slate-300" />;
    if (code > 1 && code < 48) return <Cloud className="w-10 h-10 text-slate-400" />;
    if (code >= 51) return <CloudRain className="w-10 h-10 text-blue-400" />;
    return <Sun className="w-10 h-10 text-yellow-400" />;
  };

  const getConditionText = (code: number) => {
    if (code === 0) return 'Clear Sky';
    if (code === 1 || code === 2 || code === 3) return 'Partly Cloudy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71) return 'Snow';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  };

  const displayTemp = weather 
    ? (useCelsius ? weather.temperature : (weather.temperature * 9/5) + 32).toFixed(1)
    : '--';

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

      <div className="space-y-3 pt-2 border-t border-white/10">
        <label className="text-xs text-slate-400">Location</label>
        
        <button 
          onClick={() => onConfigChange({ useAutoLocation: true })}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${config.useAutoLocation !== false ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          <MapPin className="w-4 h-4" /> Use Current Location
        </button>

        <div className="relative">
          <input 
            type="text" 
            placeholder="Search City..." 
            className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 pl-9 text-sm text-white focus:outline-none focus:border-indigo-500"
            value={citySearch}
            onChange={e => setCitySearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCitySearch()}
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <button 
            onClick={handleCitySearch}
            disabled={!citySearch || searchingCity}
            className="absolute right-2 top-2 p-0.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
          >
            {searchingCity ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Go'}
          </button>
        </div>
        
        {!config.useAutoLocation && config.city && (
          <div className="text-xs text-center text-indigo-300">
            Selected: {config.city}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Widget 
      title="Current Weather" 
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm h-32 flex items-center">{error}</div>
      ) : weather ? (
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mt-2">
             <div className="flex flex-col">
                {config.city && <span className="text-sm text-slate-300 mb-2 flex items-center gap-1"><MapPin className="w-4 h-4" />{config.city}</span>}
                <span className="text-4xl font-bold text-white flex items-start">
                   {displayTemp}
                   <span className="text-lg text-slate-400 font-normal mt-1 ml-1">°{useCelsius ? 'C' : 'F'}</span>
                </span>
                <span className="text-slate-400 mt-1">{getConditionText(weather.weatherCode)}</span>
             </div>
             {getWeatherIcon(weather.weatherCode, weather.isDay)}
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
             <div className="flex items-center gap-2 text-sm text-slate-300">
                <Wind className="w-4 h-4" />
                <span>{weather.windSpeed} km/h</span>
             </div>
             <div className="flex items-center gap-2 text-sm text-slate-300">
                <Thermometer className="w-4 h-4" />
                <span>Feels {displayTemp}°</span>
             </div>
          </div>
        </div>
      ) : null}
    </Widget>
  );
};
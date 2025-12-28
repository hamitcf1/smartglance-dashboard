import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import { Widget } from '../Widget';

interface Rate {
  symbol: string;
  name: string;
  rate: number;
  change?: number;
  lastUpdated?: Date;
}

interface CurrencyWidgetProps {
  refreshTrigger: number;
  isSettingsOpen?: boolean;
  onToggleSettings?: () => void;
  onSizeChange?: (size: string) => void;
  widgetSize?: string;
  dragHandleProps?: any;
}

export const CurrencyWidget: React.FC<CurrencyWidgetProps> = ({
  refreshTrigger,
  isSettingsOpen,
  onToggleSettings,
  onSizeChange,
  widgetSize,
  dragHandleProps
}) => {
  const [rates, setRates] = useState<Rate[]>([
    { symbol: 'USD', name: 'Dollar', rate: 0, lastUpdated: new Date() },
    { symbol: 'EUR', name: 'Euro', rate: 0, lastUpdated: new Date() },
    { symbol: 'GBP', name: 'Pound', rate: 0, lastUpdated: new Date() },
    { symbol: 'GOLD', name: 'Gold (gr)', rate: 0, lastUpdated: new Date() },
    { symbol: 'SILVER', name: 'Silver (gr)', rate: 0, lastUpdated: new Date() },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);

    try {
      // Using exchangerate.host API (CORS-friendly)
      const rates = await Promise.allSettled([
        fetch('https://api.exchangerate.host/latest?base=USD&symbols=TRY').then(r => r.json()),
        fetch('https://api.exchangerate.host/latest?base=EUR&symbols=TRY').then(r => r.json()),
        fetch('https://api.exchangerate.host/latest?base=GBP&symbols=TRY').then(r => r.json()),
      ]);

      let newRates: Rate[] = [];
      const now = new Date();

      // USD
      if (rates[0].status === 'fulfilled' && rates[0].value?.rates?.TRY) {
        newRates.push({
          symbol: 'USD',
          name: 'Dollar',
          rate: rates[0].value.rates.TRY,
          lastUpdated: now
        });
      } else {
        newRates.push({
          symbol: 'USD',
          name: 'Dollar',
          rate: 0,
          lastUpdated: now
        });
      }

      // EUR
      if (rates[1].status === 'fulfilled' && rates[1].value?.rates?.TRY) {
        newRates.push({
          symbol: 'EUR',
          name: 'Euro',
          rate: rates[1].value.rates.TRY,
          lastUpdated: now
        });
      } else {
        newRates.push({
          symbol: 'EUR',
          name: 'Euro',
          rate: 0,
          lastUpdated: now
        });
      }

      // GBP
      if (rates[2].status === 'fulfilled' && rates[2].value?.rates?.TRY) {
        newRates.push({
          symbol: 'GBP',
          name: 'Pound',
          rate: rates[2].value.rates.TRY,
          lastUpdated: now
        });
      } else {
        newRates.push({
          symbol: 'GBP',
          name: 'Pound',
          rate: 0,
          lastUpdated: now
        });
      }

      // Gold and Silver - Using mock data for now (requires API key)
      // In production, integrate with proper metals API
      newRates.push({
        symbol: 'GOLD',
        name: 'Gold (gr)',
        rate: 2850, // Approximate value in TRY
        lastUpdated: now
      });

      newRates.push({
        symbol: 'SILVER',
        name: 'Silver (gr)',
        rate: 95.50, // Approximate value in TRY
        lastUpdated: now
      });

      setRates(newRates);
    } catch (err) {
      console.error('Failed to fetch rates:', err);
      setError('Could not fetch exchange rates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [refreshTrigger]);

  const SettingsPanel = (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-slate-400 font-semibold">Widget Size</label>
        <select
          value={widgetSize}
          onChange={(e) => onSizeChange?.(e.target.value)}
          className="w-full bg-slate-700 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>

      <button
        onClick={fetchRates}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium transition-colors border border-indigo-500/30"
      >
        <RefreshCw className="w-3 h-3" />
        Refresh Rates
      </button>

      <p className="text-xs text-slate-500 mt-2">
        Exchange rates update every hour. Gold & Silver prices in TRY per gram.
      </p>
    </div>
  );

  return (
    <Widget
      title="💱 Currency Rates"
      className="h-full"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
      dragHandleProps={dragHandleProps}
    >
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto mb-2" />
            <p className="text-xs text-slate-400">Fetching rates...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {rates.map(rate => (
            <div
              key={rate.symbol}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors border border-slate-600/50"
            >
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{rate.symbol}</p>
                <p className="text-xs text-slate-400">{rate.name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-indigo-300 text-sm">
                  {rate.rate > 0 ? rate.rate.toFixed(2) : '-'} ₺
                </p>
                {rate.change !== undefined && (
                  <p className={`text-xs flex items-center justify-end gap-1 ${rate.change >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                    {rate.change >= 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        +{rate.change.toFixed(2)}%
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3" />
                        {rate.change.toFixed(2)}%
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          ))}
          {rates.length > 0 && (
            <p className="text-xs text-slate-500 mt-3 text-center">
              Last updated: {rates[0].lastUpdated instanceof Date ? rates[0].lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
            </p>
          )}
        </div>
      )}
    </Widget>
  );
};

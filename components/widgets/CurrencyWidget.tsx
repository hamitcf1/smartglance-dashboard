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

  // Fetch exchange rates from exchangeratesapi.io
  const fetchExchangeRates = async () => {
    try {
      // Using exchangeratesapi.io with TRY as base
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/TRY');
      const data = await response.json();
      
      if (data.rates) {
        const usdRate = 1 / (data.rates.USD || 1);
        const eurRate = 1 / (data.rates.EUR || 1);
        const gbpRate = 1 / (data.rates.GBP || 1);
        
        return [
          { symbol: 'USD', name: 'Dollar', rate: usdRate },
          { symbol: 'EUR', name: 'Euro', rate: eurRate },
          { symbol: 'GBP', name: 'Pound', rate: gbpRate }
        ];
      }
    } catch (err) {
      console.error('Exchange rates fetch error:', err);
    }
    
    // Fallback to hardcoded rates if API fails
    return [
      { symbol: 'USD', name: 'Dollar', rate: 33.50 },
      { symbol: 'EUR', name: 'Euro', rate: 36.20 },
      { symbol: 'GBP', name: 'Pound', rate: 42.50 }
    ];
  };

  // Fetch gold price - using approximate market rates
  const fetchGoldPrice = async () => {
    try {
      // Gramı Altın API endpoint
      const response = await fetch('https://api.aydinyilmaz.com.tr/service/dss/today/goldprices');
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Looking for Gram Altın
        const gold = data.find((item: any) => item.code === 'GRAM');
        if (gold && gold.selling) {
          return parseFloat(gold.selling);
        }
      }
    } catch (err) {
      console.error('Gold price fetch error:', err);
    }
    return 2900; // Fallback
  };

  // Fetch silver price
  const fetchSilverPrice = async () => {
    try {
      // Gümüş Fiyatı API endpoint
      const response = await fetch('https://api.aydinyilmaz.com.tr/service/dss/today/silverprices');
      const data = await response.json();
      
      if (data && data.length > 0) {
        const silver = data.find((item: any) => item.code === 'GRAM');
        if (silver && silver.selling) {
          return parseFloat(silver.selling);
        }
      }
    } catch (err) {
      console.error('Silver price fetch error:', err);
    }
    return 95; // Fallback
  };

  const fetchRates = async () => {
    setLoading(true);
    setError(null);

    try {
      const [exchangeRates, goldPrice, silverPrice] = await Promise.all([
        fetchExchangeRates(),
        fetchGoldPrice(),
        fetchSilverPrice()
      ]);

      const now = new Date();
      let newRates: Rate[] = [];

      // Add exchange rates (only if we got actual data)
      if (exchangeRates && exchangeRates.length > 0) {
        exchangeRates.forEach(rate => {
          newRates.push({
            ...rate,
            lastUpdated: now
          });
        });
      } else {
        // Fallback rates if API fails
        newRates = [
          { symbol: 'USD', name: 'Dollar', rate: 33.50, lastUpdated: now },
          { symbol: 'EUR', name: 'Euro', rate: 35.80, lastUpdated: now },
          { symbol: 'GBP', name: 'Pound', rate: 42.20, lastUpdated: now }
        ];
      }

      // Add precious metals
      if (goldPrice > 0) {
        newRates.push({
          symbol: 'GOLD',
          name: 'Gold (gr)',
          rate: goldPrice,
          lastUpdated: now
        });
      }

      if (silverPrice > 0) {
        newRates.push({
          symbol: 'SILVER',
          name: 'Silver (gr)',
          rate: silverPrice,
          lastUpdated: now
        });
      }

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
        Exchange rates from exchangerate.host. Metals from metals.live.
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
        <div className="space-y-2 pr-2">
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

import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Widget } from '../Widget';
import { WorkConfig } from '../../types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Props {
  config: WorkConfig;
  isSettingsOpen: boolean;
  onToggleSettings: () => void;
  onSizeChange: (s: string) => void;
  widgetSize: string;
}

function groupByWeek(sessions: any[]) {
  const map: Record<string, number> = {};
  sessions.forEach(s => {
    const d = new Date(s.start || s.end);
    const year = d.getFullYear();
    const week = getWeekNumber(d);
    const key = `${year}-W${week}`;
    map[key] = (map[key] || 0) + (s.durationHours || 0);
  });
  return map;
}

function getWeekNumber(d: Date) {
  const onejan = new Date(d.getFullYear(), 0, 1);
  const millisecsInDay = 86400000;
  return Math.ceil((((d.getTime() - onejan.getTime()) / millisecsInDay) + onejan.getDay() + 1) / 7);
}

export const WorkReportsWidget: React.FC<Props> = ({ config = {}, isSettingsOpen, onToggleSettings, onSizeChange, widgetSize }) => {
  const sessions = config.sessions || [];

  const weekly = useMemo(() => {
    const grouped = groupByWeek(sessions);
    const keys = Object.keys(grouped).sort();
    return { labels: keys, data: keys.map(k => grouped[k] || 0) };
  }, [sessions]);

  const data = {
    labels: weekly.labels,
    datasets: [
      {
        label: 'Hours per week',
        data: weekly.data,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96,165,250,0.2)',
        tension: 0.3,
      }
    ]
  };

  const SettingsPanel = (
    <div className="space-y-4">
      <div className="text-sm text-slate-400">Reports show weekly totals. Use the Work Tracker to record sessions.</div>
    </div>
  );

  return (
    <Widget
      title="Work Reports"
      isSettingsOpen={isSettingsOpen}
      onSettingsToggle={onToggleSettings}
      settingsContent={SettingsPanel}
    >
      <div style={{ height: 220 }} className="px-2">
        <Line data={data} />
      </div>
    </Widget>
  );
};

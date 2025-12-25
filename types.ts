export interface UserSettings {
  userName: string;
  useCelsius: boolean;
  // Deprecated individual show flags in favor of Widget registry
  // kept for backward compatibility if needed, but App.tsx will mostly use widget layout
  showNews: boolean;
  showWeather: boolean;
  showBriefing: boolean;
  showLinks: boolean;
}

export interface HackerNewsItem {
  id: number;
  title: string;
  url?: string;
  by: string;
  time: number;
  score: number;
  descendants?: number;
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  isDay: number;
  windSpeed: number;
}

export interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon?: string; // name of the lucide icon, or custom logic
}

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetInstance {
  id: string;
  type: 'clock' | 'weather' | 'news' | 'briefing' | 'links' | 'search' | 'youtube' | 'email' | 'calendar' | 'water' | 'darkmode';
  size: WidgetSize;
}

export interface WidgetConfig {
  [key: string]: any;
}

export interface WeatherConfig extends WidgetConfig {
  city?: string;
  lat?: number;
  lon?: number;
  useAutoLocation: boolean;
}

export interface NewsConfig extends WidgetConfig {
  category: 'top' | 'new' | 'best';
}

export interface QuickLinksConfig extends WidgetConfig {
  links: QuickLink[];
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  url: string;
}

export interface YouTubeConfig extends WidgetConfig {
  channels: Array<{ id: string; name: string }>;
  videoCount: number;
}

export interface EmailConfig extends WidgetConfig {
  accessToken?: string;
  isConnected: boolean;
  unreadCount: number;
}

export interface CalendarConfig extends WidgetConfig {
  accessToken?: string;
  isConnected: boolean;
  calendarIds: string[];
}

export interface WaterConfig extends WidgetConfig {
  dailyGoal: number; // in cups
  consumed: number; // in cups
  lastReset: string; // ISO date string
}

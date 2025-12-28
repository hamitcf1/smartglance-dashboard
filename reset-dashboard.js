// Script to reset dashboard and add all widgets
const DEFAULT_WIDGETS = [
  { id: 'clock', type: 'clock', size: 'medium' },
  { id: 'search', type: 'search', size: 'medium' },
  { id: 'weather', type: 'weather', size: 'small' },
  { id: 'links', type: 'links', size: 'small' },
  { id: 'briefing', type: 'briefing', size: 'large' },
  { id: 'news', type: 'news', size: 'large' },
  { id: 'youtube', type: 'youtube', size: 'large' },
  { id: 'email', type: 'email', size: 'medium' },
  { id: 'calendar', type: 'calendar', size: 'large' },
  { id: 'water', type: 'water', size: 'small' },
  { id: 'work', type: 'work', size: 'large' },
  { id: 'work-reports', type: 'work-reports', size: 'large' },
  { id: 'darkmode', type: 'darkmode', size: 'small' },
];

localStorage.clear();
localStorage.setItem('smart-glance-layout', JSON.stringify(DEFAULT_WIDGETS));
localStorage.setItem('smart-glance-settings', JSON.stringify({
  userName: 'User',
  useCelsius: true,
  showNews: true,
  showWeather: true,
  showBriefing: true,
  showLinks: true,
}));

console.log('Dashboard reset! Refresh the page now.');

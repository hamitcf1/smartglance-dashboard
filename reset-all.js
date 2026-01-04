// Complete reset script for SmartGlance dashboard with Services widget
// Run this in the browser console or as a Node script

const resetDashboard = () => {
  // Clear all localStorage
  localStorage.clear();

  // Set default layout with Services widget
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
    { id: 'chat', type: 'chat', size: 'large' },
    { id: 'currency', type: 'currency', size: 'medium' },
    { id: 'countdown', type: 'countdown', size: 'medium' },
    { id: 'services', type: 'services', size: 'large' },
    { id: 'darkmode', type: 'darkmode', size: 'small' },
  ];

  localStorage.setItem('smart-glance-layout', JSON.stringify(DEFAULT_WIDGETS));
  
  localStorage.setItem('smart-glance-settings', JSON.stringify({
    userName: 'User',
    useCelsius: true,
    showNews: true,
    showWeather: true,
    showBriefing: true,
    showLinks: true,
  }));

  localStorage.setItem('smart-glance-configs', JSON.stringify({}));
  localStorage.setItem('smart-glance-theme-name', 'dark');
  
  // Clear authentication - remove login requirement for first setup
  // Uncomment below if you want to reset login
  // localStorage.removeItem('smart-glance-credentials');
  // localStorage.removeItem('smart-glance-auth-session');
  
  console.log('✅ Dashboard reset successfully!');
  console.log('📊 Services widget has been added to your layout.');
  console.log('🔄 Refresh the page to see the changes.');
};

// Run the reset
resetDashboard();

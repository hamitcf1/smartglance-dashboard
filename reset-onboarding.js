// Script to reset onboarding and see the setup flow
// Paste this in browser console to test:

localStorage.removeItem('smart-glance-onboarding-complete');
localStorage.removeItem('smart-glance-settings');
localStorage.removeItem('smart-glance-layout');
localStorage.removeItem('smart-glance-configs');
localStorage.removeItem('smart-glance-clock-config');
localStorage.removeItem('smart-glance-theme');

// Refresh the page
location.reload();

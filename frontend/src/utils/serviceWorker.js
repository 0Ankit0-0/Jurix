/**
 * Service Worker registration utilities
 */

/**
 * Register service worker
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              showUpdateNotification();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  } else {
    console.warn('Service Worker not supported');
  }
};

/**
 * Unregister service worker
 */
export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log('Service Worker unregistered');
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
};

/**
 * Show update notification
 */
const showUpdateNotification = () => {
  // Create a toast notification or custom UI to inform user of update
  if (window.showToast) {
    window.showToast('A new version is available. Refresh to update.', {
      action: {
        text: 'Refresh',
        onClick: () => window.location.reload()
      }
    });
  } else {
    // Fallback to browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('App Update Available', {
        body: 'A new version is available. Please refresh to update.',
        icon: '/web-app-manifest-192x192.png'
      });
    }
  }
};

/**
 * Check for updates
 */
export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      console.log('Service Worker update check completed');
    } catch (error) {
      console.error('Service Worker update check failed:', error);
    }
  }
};

/**
 * Get cache storage info
 */
export const getCacheInfo = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      const cacheInfo = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheInfo[cacheName] = keys.length;
      }

      return cacheInfo;
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return null;
    }
  }
  return null;
};

/**
 * Clear all caches
 */
export const clearAllCaches = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear caches:', error);
      return false;
    }
  }
  return false;
};

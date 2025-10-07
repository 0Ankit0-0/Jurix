/**
 * Performance monitoring and analytics utilities
 */

/**
 * Log page view
 * @param {string} pageName - Name of the page
 */
export const logPageView = (pageName) => {
  if (import.meta.env.DEV) {
    console.log(`📄 Page View: ${pageName}`);
  }
  
  // Add analytics tracking here (Google Analytics, etc.)
  // Example: gtag('event', 'page_view', { page_title: pageName });
};

/**
 * Log user action
 * @param {string} action - Action name
 * @param {Object} data - Additional data
 */
export const logUserAction = (action, data = {}) => {
  if (import.meta.env.DEV) {
    console.log(`🎯 User Action: ${action}`, data);
  }
  
  // Add analytics tracking here
  // Example: gtag('event', action, data);
};

/**
 * Log error
 * @param {Error} error - Error object
 * @param {Object} context - Error context
 */
export const logError = (error, context = {}) => {
  console.error('❌ Error:', error, context);
  
  // Add error tracking here (Sentry, etc.)
  // Example: Sentry.captureException(error, { extra: context });
};

/**
 * Log API call
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {number} duration - Call duration in ms
 * @param {boolean} success - Whether call was successful
 */
export const logApiCall = (endpoint, method, duration, success) => {
  if (import.meta.env.DEV) {
    const emoji = success ? '✅' : '❌';
    console.log(`${emoji} API ${method} ${endpoint} - ${duration}ms`);
  }
  
  // Add performance tracking here
};

/**
 * Track component render
 * @param {string} componentName - Component name
 * @param {Object} props - Component props
 */
export const trackComponentRender = (componentName, props = {}) => {
  if (import.meta.env.DEV) {
    console.log(`🔄 Render: ${componentName}`, props);
  }
};

/**
 * Measure and log performance
 * @param {string} label - Performance label
 * @param {Function} fn - Function to measure
 * @returns {*} Function result
 */
export const measurePerformance = async (label, fn) => {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logError(error, { label, duration });
    throw error;
  }
};

/**
 * Create performance observer
 * @param {string} type - Observer type (e.g., 'navigation', 'resource')
 * @param {Function} callback - Callback function
 */
export const createPerformanceObserver = (type, callback) => {
  if (!('PerformanceObserver' in window)) {
    return null;
  }
  
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        callback(entry);
      }
    });
    
    observer.observe({ entryTypes: [type] });
    return observer;
  } catch (error) {
    console.warn('Failed to create PerformanceObserver:', error);
    return null;
  }
};

/**
 * Monitor Core Web Vitals
 */
export const monitorWebVitals = () => {
  if (!('PerformanceObserver' in window)) {
    return;
  }
  
  // Largest Contentful Paint (LCP)
  createPerformanceObserver('largest-contentful-paint', (entry) => {
    if (import.meta.env.DEV) {
      console.log('📊 LCP:', entry.renderTime || entry.loadTime);
    }
  });
  
  // First Input Delay (FID)
  createPerformanceObserver('first-input', (entry) => {
    if (import.meta.env.DEV) {
      console.log('📊 FID:', entry.processingStart - entry.startTime);
    }
  });
  
  // Cumulative Layout Shift (CLS)
  let clsScore = 0;
  createPerformanceObserver('layout-shift', (entry) => {
    if (!entry.hadRecentInput) {
      clsScore += entry.value;
      if (import.meta.env.DEV) {
        console.log('📊 CLS:', clsScore);
      }
    }
  });
};

/**
 * Get memory usage (Chrome only)
 * @returns {Object|null} Memory usage info
 */
export const getMemoryUsage = () => {
  if (performance.memory) {
    return {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      usedPercentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
    };
  }
  return null;
};

/**
 * Log memory usage
 */
export const logMemoryUsage = () => {
  const memory = getMemoryUsage();
  if (memory && import.meta.env.DEV) {
    console.log('💾 Memory Usage:', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
      percentage: `${memory.usedPercentage.toFixed(2)}%`,
    });
  }
};
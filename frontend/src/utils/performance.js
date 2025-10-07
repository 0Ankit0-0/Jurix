/**
 * Performance optimization utilities
 */

/**
 * Lazy load component with retry logic
 * @param {Function} importFunc - Dynamic import function
 * @param {number} retries - Number of retries
 * @returns {Promise} Lazy loaded component
 */
export const lazyWithRetry = (importFunc, retries = 3) => {
  return new Promise((resolve, reject) => {
    const attemptImport = (retriesLeft) => {
      importFunc()
        .then(resolve)
        .catch((error) => {
          if (retriesLeft === 0) {
            reject(error);
            return;
          }
          
          console.log(`Retrying import... (${retriesLeft} attempts left)`);
          setTimeout(() => attemptImport(retriesLeft - 1), 1000);
        });
    };
    
    attemptImport(retries);
  });
};

/**
 * Preload image
 * @param {string} src - Image source URL
 * @returns {Promise} Promise that resolves when image is loaded
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preload multiple images
 * @param {Array} srcs - Array of image source URLs
 * @returns {Promise} Promise that resolves when all images are loaded
 */
export const preloadImages = (srcs) => {
  return Promise.all(srcs.map(preloadImage));
};

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @param {number} offset - Offset in pixels
 * @returns {boolean} True if in viewport
 */
export const isInViewport = (element, offset = 0) => {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= -offset &&
    rect.left >= -offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  );
};

/**
 * Measure component render time
 * @param {string} componentName - Name of component
 * @param {Function} callback - Callback to execute
 */
export const measureRenderTime = (componentName, callback) => {
  const start = performance.now();
  callback();
  const end = performance.now();
  console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
};

/**
 * Get page load metrics
 * @returns {Object} Page load metrics
 */
export const getPageLoadMetrics = () => {
  if (!window.performance || !window.performance.timing) {
    return null;
  }
  
  const timing = window.performance.timing;
  const navigation = window.performance.navigation;
  
  return {
    // Page load time
    pageLoadTime: timing.loadEventEnd - timing.navigationStart,
    
    // Domain lookup time
    domainLookupTime: timing.domainLookupEnd - timing.domainLookupStart,
    
    // TCP connection time
    tcpConnectTime: timing.connectEnd - timing.connectStart,
    
    // Request time
    requestTime: timing.responseEnd - timing.requestStart,
    
    // Response time
    responseTime: timing.responseEnd - timing.responseStart,
    
    // DOM processing time
    domProcessingTime: timing.domComplete - timing.domLoading,
    
    // DOM content loaded time
    domContentLoadedTime: timing.domContentLoadedEventEnd - timing.navigationStart,
    
    // Navigation type
    navigationType: navigation.type,
    
    // Redirect count
    redirectCount: navigation.redirectCount,
  };
};

/**
 * Log performance metrics to console
 */
export const logPerformanceMetrics = () => {
  const metrics = getPageLoadMetrics();
  if (metrics) {
    console.group('📊 Performance Metrics');
    console.log(`Page Load Time: ${metrics.pageLoadTime}ms`);
    console.log(`Domain Lookup: ${metrics.domainLookupTime}ms`);
    console.log(`TCP Connect: ${metrics.tcpConnectTime}ms`);
    console.log(`Request Time: ${metrics.requestTime}ms`);
    console.log(`Response Time: ${metrics.responseTime}ms`);
    console.log(`DOM Processing: ${metrics.domProcessingTime}ms`);
    console.log(`DOM Content Loaded: ${metrics.domContentLoadedTime}ms`);
    console.groupEnd();
  }
};

/**
 * Optimize image loading with IntersectionObserver
 * @param {HTMLElement} img - Image element
 * @param {string} src - Image source
 * @param {Object} options - IntersectionObserver options
 */
export const lazyLoadImage = (img, src, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = src;
        observer.unobserve(image);
      }
    });
  }, defaultOptions);
  
  observer.observe(img);
  
  return () => observer.disconnect();
};

/**
 * Request idle callback wrapper
 * @param {Function} callback - Callback to execute
 * @param {Object} options - Options
 */
export const requestIdleCallback = (callback, options = {}) => {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  
  // Fallback for browsers that don't support requestIdleCallback
  return setTimeout(() => {
    callback({
      didTimeout: false,
      timeRemaining: () => 50,
    });
  }, 1);
};

/**
 * Cancel idle callback wrapper
 * @param {number} id - Callback ID
 */
export const cancelIdleCallback = (id) => {
  if ('cancelIdleCallback' in window) {
    window.cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
};
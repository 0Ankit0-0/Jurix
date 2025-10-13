import React from 'react';

/**
 * Lazy loading with retry logic for better error handling
 * @param {Function} importFn - Dynamic import function
 * @param {number} retries - Number of retry attempts
 * @returns {Component} Lazy loaded component with retry
 */
export const lazyWithRetry = (importFn, retries = 3) => {
  const loadComponent = () => {
    let promise = importFn();
    for (let attempt = 1; attempt <= retries; attempt++) {
      promise = promise.catch(error => {
        console.warn(`Lazy load attempt ${attempt} failed, retrying...`, error);
        return new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000)).then(() => importFn());
      });
    }
    return promise;
  };

  return React.lazy(loadComponent);
};

/**
 * Preload critical resources
 * @param {Array} resources - Array of resources to preload
 */
export const preloadResources = (resources) => {
  resources.forEach(resource => {
    if (resource.type === 'script') {
      const script = document.createElement('script');
      script.src = resource.url;
      script.async = true;
      document.head.appendChild(script);
    } else if (resource.type === 'style') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = resource.url;
      document.head.appendChild(link);
    } else if (resource.type === 'image') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = resource.url;
      document.head.appendChild(link);
    }
  });
};

/**
 * Lazy load images with intersection observer
 * @param {string} selector - CSS selector for images
 * @param {Object} options - Observer options
 */
export const lazyLoadImage = (selector, options = {}) => {
  const images = document.querySelectorAll(selector);
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px 100px 0px',
    threshold: 0.1,
    ...options
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        img.onload = () => img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, observerOptions);

  images.forEach(img => observer.observe(img));
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Throttle limit in ms
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Memoize expensive computations
 * @param {Function} fn - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

/**
 * Check if element is in viewport
 * @param {Element} element - DOM element
 * @returns {boolean} True if in viewport
 */
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

/**
 * Optimize window resize events
 * @param {Function} callback - Callback function
 * @param {number} delay - Debounce delay
 */
export const optimizeResize = (callback, delay = 100) => {
  let ticking = false;
  const debouncedCallback = debounce(callback, delay);

  const update = () => {
    debouncedCallback();
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener('resize', requestTick);
  window.addEventListener('orientationchange', requestTick);

  return () => {
    window.removeEventListener('resize', requestTick);
    window.removeEventListener('orientationchange', requestTick);
  };
};

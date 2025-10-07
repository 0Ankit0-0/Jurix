/**
 * Form validation utilities
 */

import { VALIDATION } from './constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} { isValid, error }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid, error, strength }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 0 };
  }
  
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`,
      strength: 0
    };
  }
  
  let strength = 0;
  
  // Check for lowercase
  if (/[a-z]/.test(password)) strength++;
  
  // Check for uppercase
  if (/[A-Z]/.test(password)) strength++;
  
  // Check for numbers
  if (/\d/.test(password)) strength++;
  
  // Check for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  // Check length bonus
  if (password.length >= 12) strength++;
  
  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][Math.min(strength - 1, 4)];
  
  return { 
    isValid: strength >= 2, 
    error: strength < 2 ? 'Password is too weak. Use a mix of letters, numbers, and symbols.' : null,
    strength,
    strengthLabel
  };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} { isValid, error }
 */
export const validateUsername = (username) => {
  if (!username) {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < VALIDATION.USERNAME_MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `Username must be at least ${VALIDATION.USERNAME_MIN_LENGTH} characters`
    };
  }
  
  if (username.length > VALIDATION.USERNAME_MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `Username must be less than ${VALIDATION.USERNAME_MAX_LENGTH} characters`
    };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { 
      isValid: false, 
      error: 'Username can only contain letters, numbers, underscores, and hyphens'
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @param {string} fieldName - Name of the field
 * @returns {Object} { isValid, error }
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate minimum length
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Name of the field
 * @returns {Object} { isValid, error }
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
  if (!value || value.length < minLength) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least ${minLength} characters`
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate maximum length
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Name of the field
 * @returns {Object} { isValid, error }
 */
export const validateMaxLength = (value, maxLength, fieldName = 'This field') => {
  if (value && value.length > maxLength) {
    return { 
      isValid: false, 
      error: `${fieldName} must be less than ${maxLength} characters`
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum size in bytes
 * @returns {Object} { isValid, error }
 */
export const validateFileSize = (file, maxSize) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return { 
      isValid: false, 
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array} acceptedTypes - Array of accepted MIME types
 * @returns {Object} { isValid, error }
 */
export const validateFileType = (file, acceptedTypes) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (!acceptedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Please select a valid file.'
    };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {Object} { isValid, error }
 */
export const validateUrl = (url) => {
  if (!url) {
    return { isValid: false, error: 'URL is required' };
  }
  
  try {
    new URL(url);
    return { isValid: true, error: null };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate phone number (basic)
 * @param {string} phone - Phone number to validate
 * @returns {Object} { isValid, error }
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 10) {
    return { isValid: false, error: 'Invalid phone number format' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Validate form with multiple fields
 * @param {Object} formData - Form data object
 * @param {Object} rules - Validation rules object
 * @returns {Object} { isValid, errors }
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = formData[field];
    
    for (const rule of fieldRules) {
      const result = rule(value);
      if (!result.isValid) {
        errors[field] = result.error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });
  
  return { isValid, errors };
};
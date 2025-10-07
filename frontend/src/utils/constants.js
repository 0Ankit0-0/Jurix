/**
 * Application-wide constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5001/api',
  TIMEOUT: 15000,
  UPLOAD_TIMEOUT: 30000,
  SIMULATION_TIMEOUT: 120000,
};

// Case Status
export const CASE_STATUS = {
  DRAFT: 'draft',
  EVIDENCE_COLLECTION: 'evidence_collection',
  READY_FOR_SIMULATION: 'ready_for_simulation',
  SIMULATION_IN_PROGRESS: 'simulation_in_progress',
  SIMULATION_COMPLETE: 'simulation_complete',
  ARCHIVED: 'archived',
};

export const CASE_STATUS_LABELS = {
  [CASE_STATUS.DRAFT]: 'Draft',
  [CASE_STATUS.EVIDENCE_COLLECTION]: 'Collecting Evidence',
  [CASE_STATUS.READY_FOR_SIMULATION]: 'Ready for Simulation',
  [CASE_STATUS.SIMULATION_IN_PROGRESS]: 'Simulation in Progress',
  [CASE_STATUS.SIMULATION_COMPLETE]: 'Simulation Complete',
  [CASE_STATUS.ARCHIVED]: 'Archived',
};

// Case Types
export const CASE_TYPES = [
  'All',
  'Criminal Law',
  'Civil Law',
  'Corporate Law',
  'Family Law',
  'IP Law',
  'Contract Law',
  'Constitutional Law',
  'Tax Law',
  'Labor Law',
  'Environmental Law',
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'alphabetical', label: 'A-Z' },
];

// View Modes
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  PAGE_SIZE_OPTIONS: [6, 12, 24, 48],
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALL: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  DASHBOARD_VIEW: 'dashboard-view',
  DASHBOARD_FILTER: 'dashboard-filter-type',
  DASHBOARD_SORT: 'dashboard-sort',
};

// Routes
export const ROUTES = {
  HOME: '/home',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  SIGNUP: '/signup',
  PROFILE: '/profile',
  CASE_CREATE: '/case',
  CHATBOT: '/chatbot',
  PUBLIC_CASES: '/public-cases',
  CASE_DISCUSSIONS: (caseId) => `/case/${caseId}/discussions`,
  REPLAY_SIMULATION: (id) => `/replay/${id}`,
};

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEARCH: ['ctrl', 'k'],
  TOGGLE_VIEW: ['ctrl', 'shift', 'g'],
  TOGGLE_FILTERS: ['ctrl', 'shift', 'f'],
  NEW_CASE: ['ctrl', 'n'],
  SAVE: ['ctrl', 's'],
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  CASE_TITLE_MIN_LENGTH: 5,
  CASE_TITLE_MAX_LENGTH: 200,
  CASE_DESCRIPTION_MIN_LENGTH: 20,
  CASE_DESCRIPTION_MAX_LENGTH: 5000,
};

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: {
    SHORT: 2000,
    MEDIUM: 4000,
    LONG: 6000,
  },
  POSITION: 'top-right',
};

// Animation Durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints (matches Tailwind)
export const BREAKPOINTS = {
  XS: 475,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
  TIMEOUT: 'Request timeout. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logged out successfully.',
  SIGNUP: 'Account created successfully!',
  CASE_CREATED: 'Case created successfully!',
  CASE_UPDATED: 'Case updated successfully!',
  CASE_DELETED: 'Case deleted successfully!',
  EVIDENCE_UPLOADED: 'Evidence uploaded successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};
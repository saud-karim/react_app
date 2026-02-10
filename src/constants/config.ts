// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  TIMEOUT: 30000,
};

// App Information
export const APP_INFO = {
  NAME: process.env.EXPO_PUBLIC_APP_NAME || 'EDARA',
  VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
};

// App Constants
export const APP_CONSTANTS = {
  DEFAULT_LANGUAGE: 'ar',
  SUPPORTED_LANGUAGES: ['ar', 'en'],
  ITEMS_PER_PAGE: 10,
};

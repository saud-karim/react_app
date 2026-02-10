import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { storage } from '../utils/storage';
import { API_CONFIG, STORAGE_KEYS, APP_CONSTANTS } from '../constants/config';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor - add auth token and language header
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        // Add auth token
        const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add language header
        const language = await storage.getItem(STORAGE_KEYS.LANGUAGE) || APP_CONSTANTS.DEFAULT_LANGUAGE;
        config.headers['Accept-Language'] = language;

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - clear storage
            await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            await storage.removeItem(STORAGE_KEYS.USER_DATA);
        }
        return Promise.reject(error);
    }
);

export default api;

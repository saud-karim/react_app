import api from './api';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/config';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    UpdateProfileRequest,
    ChangePasswordRequest,
    ApiResponse,
    User,
} from '../types';

export const authService = {
    // Login
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/login', data);
        if (response.data.success && response.data.data.token) {
            await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.data.token);
            await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    // Register
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/register', data);
        return response.data;
    },

    // Logout
    async logout(): Promise<ApiResponse<null>> {
        const response = await api.post<ApiResponse<null>>('/logout');
        await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        await storage.removeItem(STORAGE_KEYS.USER_DATA);
        return response.data;
    },

    // Get current user
    async getProfile(): Promise<ApiResponse<{ user: User }>> {
        const response = await api.get<ApiResponse<{ user: User }>>('/me');
        return response.data;
    },

    // Update profile
    async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<{ user: User }>> {
        const response = await api.put<ApiResponse<{ user: User }>>('/me', data);
        if (response.data.success) {
            await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
        }
        return response.data;
    },

    // Change password
    async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<null>> {
        const response = await api.put<ApiResponse<null>>('/me/password', data);
        return response.data;
    },

    // Upload avatar
    async uploadAvatar(uri: string): Promise<ApiResponse<{ avatar_url: string }>> {
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('avatar', {
            uri,
            name: filename,
            type,
        } as any);

        const response = await api.post<ApiResponse<{ avatar_url: string }>>('/me/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Delete avatar
    async deleteAvatar(): Promise<ApiResponse<null>> {
        const response = await api.delete<ApiResponse<null>>('/me/avatar');
        return response.data;
    },

    // Check if token exists
    async isAuthenticated(): Promise<boolean> {
        const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        return !!token;
    },

    // Get stored user
    async getStoredUser(): Promise<User | null> {
        const userData = await storage.getItem(STORAGE_KEYS.USER_DATA);
        return userData ? JSON.parse(userData) : null;
    },

    // Get stored token
    async getToken(): Promise<string | null> {
        return await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    },
};

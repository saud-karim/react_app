import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Storage adapter that works on all platforms
export const storage = {
    async setItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            // Use localStorage for web
            localStorage.setItem(key, value);
        } else {
            // Use SecureStore for native platforms
            await SecureStore.setItemAsync(key, value);
        }
    },

    async getItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            // Use localStorage for web
            return localStorage.getItem(key);
        } else {
            // Use SecureStore for native platforms
            return await SecureStore.getItemAsync(key);
        }
    },

    async removeItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            // Use localStorage for web
            localStorage.removeItem(key);
        } else {
            // Use SecureStore for native platforms
            await SecureStore.deleteItemAsync(key);
        }
    },
};
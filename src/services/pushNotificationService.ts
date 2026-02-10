import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from '../api/api';
import { storage } from '../utils/storage';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface PushNotificationData {
    type: 'event' | 'deal' | 'news' | 'broadcast';
    id?: number;
    title: string;
    body: string;
    data?: any;
}

class PushNotificationService {
    private expoPushToken: string | null = null;

    async initialize(): Promise<void> {
        try {
            // Skip push notifications on web or in Expo Go
            if (Platform.OS === 'web' || !Device.isDevice) {
                console.log('Push notifications not supported on web or in Expo Go development mode');
                return;
            }

            // Request permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Push notification permission not granted');
                return;
            }

            // Only try to get push token if we have a valid project ID
            try {
                const token = await Notifications.getExpoPushTokenAsync({
                    projectId: 'e176357c-c9a8-46aa-b772-ae9c13d1488e', // Your actual Expo project ID
                });
                this.expoPushToken = token.data;
                
                // Store token locally
                await storage.setItem('pushToken', this.expoPushToken);
                
                // Send token to backend
                await this.registerTokenWithBackend(this.expoPushToken);
            } catch (tokenError) {
                console.warn('Could not get Expo push token (this is normal in Expo Go):', tokenError);
            }

            // Configure notification channel for Android
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }
        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    }

    private async registerTokenWithBackend(token: string): Promise<void> {
        try {
            await api.post('/notifications/register-token', {
                token,
                platform: Platform.OS,
                device_info: {
                    model: Device.modelName,
                    os_version: Device.osVersion,
                }
            });
        } catch (error) {
            console.error('Error registering push token:', error);
        }
    }

    async scheduleLocalNotification(
        title: string,
        body: string,
        data?: any,
        trigger?: Notifications.NotificationTriggerInput
    ): Promise<string> {
        return await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
                sound: 'default',
            },
            trigger: trigger || null,
        });
    }

    async cancelNotification(notificationId: string): Promise<void> {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    }

    async cancelAllNotifications(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    async getBadgeCount(): Promise<number> {
        return await Notifications.getBadgeCountAsync();
    }

    async setBadgeCount(count: number): Promise<void> {
        await Notifications.setBadgeCountAsync(count);
    }

    async clearBadge(): Promise<void> {
        await Notifications.setBadgeCountAsync(0);
    }

    // Notification listeners
    addNotificationReceivedListener(
        listener: (notification: Notifications.Notification) => void
    ): Notifications.Subscription {
        return Notifications.addNotificationReceivedListener(listener);
    }

    addNotificationResponseReceivedListener(
        listener: (response: Notifications.NotificationResponse) => void
    ): Notifications.Subscription {
        return Notifications.addNotificationResponseReceivedListener(listener);
    }

    // Handle notification actions
    handleNotificationResponse(response: Notifications.NotificationResponse, navigation: any): void {
        const { notification } = response;
        const data = notification.request.content.data as unknown as PushNotificationData;

        if (data?.type && data?.id) {
            switch (data.type) {
                case 'event':
                    navigation.navigate('EventDetails', { id: data.id });
                    break;
                case 'deal':
                    navigation.navigate('DealDetails', { id: data.id });
                    break;
                case 'news':
                    navigation.navigate('NewsDetails', { id: data.id });
                    break;
                case 'broadcast':
                    navigation.navigate('Notifications');
                    break;
                default:
                    navigation.navigate('Home');
            }
        }
    }

    // Test notification (for development)
    async sendTestNotification(): Promise<void> {
        await this.scheduleLocalNotification(
            'Test Notification',
            'This is a test notification from EDARA app',
            { type: 'test' },
            { 
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: 1 
            }
        );
    }

    // Update notification preferences
    async updateNotificationPreferences(preferences: {
        events: boolean;
        deals: boolean;
        news: boolean;
        broadcasts: boolean;
    }): Promise<void> {
        try {
            await api.post('/notifications/preferences', preferences);
            await storage.setItem('notificationPreferences', JSON.stringify(preferences));
        } catch (error) {
            console.error('Error updating notification preferences:', error);
        }
    }

    async getNotificationPreferences(): Promise<{
        events: boolean;
        deals: boolean;
        news: boolean;
        broadcasts: boolean;
    }> {
        try {
            const stored = await storage.getItem('notificationPreferences');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error getting notification preferences:', error);
        }

        // Default preferences
        return {
            events: true,
            deals: true,
            news: true,
            broadcasts: true,
        };
    }

    getExpoPushToken(): string | null {
        return this.expoPushToken;
    }
}

export const pushNotificationService = new PushNotificationService();
import { pushNotificationService } from './pushNotificationService';
import { autoUpdateService } from './autoUpdateService';
import { cacheService } from './cacheService';

class AppServices {
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            console.log('Initializing app services...');

            // Initialize cache service first
            await cacheService.initialize({
                defaultTTL: 10 * 60 * 1000, // 10 minutes
                maxSize: 200,
                version: '1.0.0',
            });

            // Initialize push notifications
            await pushNotificationService.initialize();

            // Initialize auto-update service
            await autoUpdateService.initialize();

            this.initialized = true;
            console.log('App services initialized successfully');
        } catch (error) {
            console.error('Error initializing app services:', error);
        }
    }

    async cleanup(): Promise<void> {
        if (!this.initialized) return;

        try {
            autoUpdateService.destroy();
            this.initialized = false;
            console.log('App services cleaned up');
        } catch (error) {
            console.error('Error cleaning up app services:', error);
        }
    }

    isInitialized(): boolean {
        return this.initialized;
    }

    // Service getters
    get pushNotifications() {
        return pushNotificationService;
    }

    get autoUpdate() {
        return autoUpdateService;
    }

    get cache() {
        return cacheService;
    }
}

export const appServices = new AppServices();
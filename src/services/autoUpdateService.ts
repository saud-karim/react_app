import { AppState, AppStateStatus } from 'react-native';
import { eventsService } from '../api/eventsService';
import { dealsService } from '../api/dealsService';
import { newsService } from '../api/newsService';
import { notificationsService } from '../api/notificationsService';
import { storage } from '../utils/storage';

export interface UpdateConfig {
    events: boolean;
    deals: boolean;
    news: boolean;
    notifications: boolean;
    interval: number; // in minutes
}

export interface DataUpdateListener {
    onEventsUpdated?: (events: any[]) => void;
    onDealsUpdated?: (deals: any[]) => void;
    onNewsUpdated?: (news: any[]) => void;
    onNotificationsUpdated?: (notifications: any[]) => void;
    onUpdateError?: (error: Error) => void;
}

class AutoUpdateService {
    private updateInterval: NodeJS.Timeout | null = null;
    private appStateSubscription: any = null;
    private listeners: DataUpdateListener[] = [];
    private config: UpdateConfig = {
        events: true,
        deals: true,
        news: true,
        notifications: true,
        interval: 5, // 5 minutes default
    };
    private lastUpdateTimes: Record<string, number> = {};
    private isUpdating = false;

    async initialize(): Promise<void> {
        try {
            // Load configuration
            await this.loadConfig();
            
            // Start auto-update
            this.startAutoUpdate();
            
            // Listen to app state changes
            this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
            
            console.log('Auto-update service initialized');
        } catch (error) {
            console.error('Error initializing auto-update service:', error);
        }
    }

    private async loadConfig(): Promise<void> {
        try {
            const stored = await storage.getItem('autoUpdateConfig');
            if (stored) {
                this.config = { ...this.config, ...JSON.parse(stored) };
            }

            const lastUpdates = await storage.getItem('lastUpdateTimes');
            if (lastUpdates) {
                this.lastUpdateTimes = JSON.parse(lastUpdates);
            }
        } catch (error) {
            console.error('Error loading auto-update config:', error);
        }
    }

    async updateConfig(newConfig: Partial<UpdateConfig>): Promise<void> {
        this.config = { ...this.config, ...newConfig };
        await storage.setItem('autoUpdateConfig', JSON.stringify(this.config));
        
        // Restart with new interval
        this.stopAutoUpdate();
        this.startAutoUpdate();
    }

    private startAutoUpdate(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        // Initial update
        this.performUpdate();

        // Set up periodic updates
        this.updateInterval = setInterval(() => {
            this.performUpdate();
        }, this.config.interval * 60 * 1000); // Convert minutes to milliseconds
    }

    private stopAutoUpdate(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    private handleAppStateChange = (nextAppState: AppStateStatus): void => {
        if (nextAppState === 'active') {
            // App became active, check for updates
            const now = Date.now();
            const lastUpdate = Math.max(...Object.values(this.lastUpdateTimes));
            const timeSinceLastUpdate = now - lastUpdate;
            
            // If more than half the update interval has passed, update immediately
            if (timeSinceLastUpdate > (this.config.interval * 30 * 1000)) {
                this.performUpdate();
            }
        }
    };

    private async performUpdate(): Promise<void> {
        if (this.isUpdating) return;

        // Check if user is authenticated before updating
        try {
            const token = await storage.getItem('authToken');
            if (!token) {
                console.log('Auto-update skipped: User not authenticated');
                return;
            }
        } catch (error) {
            console.log('Auto-update skipped: Could not check authentication');
            return;
        }
        
        this.isUpdating = true;
        const now = Date.now();

        try {
            const updatePromises: Promise<void>[] = [];

            if (this.config.events) {
                updatePromises.push(this.updateEvents());
            }

            if (this.config.deals) {
                updatePromises.push(this.updateDeals());
            }

            if (this.config.news) {
                updatePromises.push(this.updateNews());
            }

            if (this.config.notifications) {
                updatePromises.push(this.updateNotifications());
            }

            await Promise.allSettled(updatePromises);
            
            // Save last update time
            await storage.setItem('lastUpdateTimes', JSON.stringify(this.lastUpdateTimes));
            
        } catch (error) {
            console.error('Error during auto-update:', error);
            this.notifyListeners('onUpdateError', error);
        } finally {
            this.isUpdating = false;
        }
    }

    private async updateEvents(): Promise<void> {
        try {
            const response = await eventsService.getEvents();
            if (response.success) {
                this.lastUpdateTimes.events = Date.now();
                this.notifyListeners('onEventsUpdated', response.data.events);
            }
        } catch (error) {
            console.error('Error updating events:', error);
        }
    }

    private async updateDeals(): Promise<void> {
        try {
            const response = await dealsService.getDeals();
            if (response.success) {
                this.lastUpdateTimes.deals = Date.now();
                this.notifyListeners('onDealsUpdated', response.data.deals);
            }
        } catch (error) {
            console.error('Error updating deals:', error);
        }
    }

    private async updateNews(): Promise<void> {
        try {
            const response = await newsService.getNews();
            if (response.success) {
                this.lastUpdateTimes.news = Date.now();
                this.notifyListeners('onNewsUpdated', response.data.news);
            }
        } catch (error) {
            console.error('Error updating news:', error);
        }
    }

    private async updateNotifications(): Promise<void> {
        try {
            const response = await notificationsService.getNotifications();
            if (response.success) {
                this.lastUpdateTimes.notifications = Date.now();
                this.notifyListeners('onNotificationsUpdated', response.data.notifications);
            }
        } catch (error) {
            console.error('Error updating notifications:', error);
        }
    }

    private notifyListeners(method: keyof DataUpdateListener, data: any): void {
        this.listeners.forEach(listener => {
            if (listener[method]) {
                (listener[method] as Function)(data);
            }
        });
    }

    addListener(listener: DataUpdateListener): () => void {
        this.listeners.push(listener);
        
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    async forceUpdate(): Promise<void> {
        await this.performUpdate();
    }

    getLastUpdateTime(type: 'events' | 'deals' | 'news' | 'notifications'): number | null {
        return this.lastUpdateTimes[type] || null;
    }

    getConfig(): UpdateConfig {
        return { ...this.config };
    }

    isAutoUpdateEnabled(): boolean {
        return this.updateInterval !== null;
    }

    destroy(): void {
        this.stopAutoUpdate();
        
        if (this.appStateSubscription) {
            this.appStateSubscription.remove();
        }
        
        this.listeners = [];
        console.log('Auto-update service destroyed');
    }
}

export const autoUpdateService = new AutoUpdateService();
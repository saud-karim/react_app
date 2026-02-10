import { storage } from '../utils/storage';
import { STORAGE_KEYS, APP_CONSTANTS } from '../constants/config';

// Helper to get current language
export const getCurrentLanguage = async (): Promise<string> => {
    try {
        const language = await storage.getItem(STORAGE_KEYS.LANGUAGE);
        return language || APP_CONSTANTS.DEFAULT_LANGUAGE;
    } catch (error) {
        return APP_CONSTANTS.DEFAULT_LANGUAGE;
    }
};

export interface CacheItem<T = any> {
    data: T;
    timestamp: number;
    expiresAt: number;
    version: string;
}

export interface CacheConfig {
    defaultTTL: number; // Time to live in milliseconds
    maxSize: number; // Maximum number of items
    version: string; // Cache version for invalidation
}

class CacheService {
    private memoryCache = new Map<string, CacheItem>();
    private config: CacheConfig = {
        defaultTTL: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
        version: '1.0.0',
    };

    async initialize(config?: Partial<CacheConfig>): Promise<void> {
        if (config) {
            this.config = { ...this.config, ...config };
        }

        // Load persistent cache from storage
        await this.loadPersistentCache();
        
        // Clean expired items
        await this.cleanExpiredItems();
        
        console.log('Cache service initialized');
    }

    private async loadPersistentCache(): Promise<void> {
        try {
            const keys = await this.getAllCacheKeys();
            
        for (const key of keys) {
            const item = await this.getFromStorage(key);
            if (item && this.isValidCacheItem(item)) {
                this.memoryCache.set(key, item);
            }
        }
        } catch (error) {
            console.error('Error loading persistent cache:', error);
        }
    }

    private async getAllCacheKeys(): Promise<string[]> {
        try {
            // For web storage, we need to manually get all keys
            if (typeof window !== 'undefined' && window.localStorage) {
                const keys: string[] = [];
                for (let i = 0; i < window.localStorage.length; i++) {
                    const key = window.localStorage.key(i);
                    if (key && key.startsWith('cache_')) {
                        keys.push(key);
                    }
                }
                return keys;
            }
            return [];
        } catch (error) {
            console.error('Error getting cache keys:', error);
            return [];
        }
    }

    private isValidCacheItem(item: CacheItem): boolean {
        const now = Date.now();
        return (
            item.version === this.config.version &&
            item.expiresAt > now
        );
    }

    async set<T>(
        key: string, 
        data: T, 
        ttl: number = this.config.defaultTTL,
        persistent: boolean = true
    ): Promise<void> {
        const now = Date.now();
        const cacheItem: CacheItem<T> = {
            data,
            timestamp: now,
            expiresAt: now + ttl,
            version: this.config.version,
        };

        // Add to memory cache
        this.memoryCache.set(key, cacheItem);

        // Persist to storage if requested
        if (persistent) {
            await this.saveToStorage(key, cacheItem);
        }

        // Enforce max size
        await this.enforceMaxSize();
    }

    async get<T>(key: string): Promise<T | null> {
        // Check memory cache first
        let item: CacheItem | undefined = this.memoryCache.get(key);

        // If not in memory, check storage
        if (!item) {
            const storageItem = await this.getFromStorage(key);
            if (storageItem) {
                item = storageItem;
                this.memoryCache.set(key, item);
            }
        }

        // Validate cache item
        if (!item || !this.isValidCacheItem(item)) {
            await this.delete(key);
            return null;
        }

        return item.data as T;
    }

    async has(key: string): Promise<boolean> {
        const item = await this.get(key);
        return item !== null;
    }

    async delete(key: string): Promise<void> {
        this.memoryCache.delete(key);
        await this.removeFromStorage(key);
    }

    async clear(): Promise<void> {
        this.memoryCache.clear();
        
        const keys = await this.getAllCacheKeys();
        for (const key of keys) {
            await this.removeFromStorage(key);
        }
    }

    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttl: number = this.config.defaultTTL,
        persistent: boolean = true
    ): Promise<T> {
        // Try to get from cache first
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Fetch new data
        const data = await fetcher();
        
        // Cache the result
        await this.set(key, data, ttl, persistent);
        
        return data;
    }

    private async saveToStorage(key: string, item: CacheItem): Promise<void> {
        try {
            await storage.setItem(`cache_${key}`, JSON.stringify(item));
        } catch (error) {
            console.error('Error saving to cache storage:', error);
        }
    }

    private async getFromStorage(key: string): Promise<CacheItem | null> {
        try {
            const stored = await storage.getItem(`cache_${key}`);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error getting from cache storage:', error);
            return null;
        }
    }

    private async removeFromStorage(key: string): Promise<void> {
        try {
            await storage.removeItem(`cache_${key}`);
        } catch (error) {
            console.error('Error removing from cache storage:', error);
        }
    }

    private async enforceMaxSize(): Promise<void> {
        if (this.memoryCache.size <= this.config.maxSize) {
            return;
        }

        // Sort by timestamp (oldest first)
        const entries = Array.from(this.memoryCache.entries())
            .sort(([, a], [, b]) => a.timestamp - b.timestamp);

        // Remove oldest items
        const itemsToRemove = entries.slice(0, this.memoryCache.size - this.config.maxSize);
        
        for (const [key] of itemsToRemove) {
            await this.delete(key);
        }
    }

    private async cleanExpiredItems(): Promise<void> {
        const now = Date.now();
        const expiredKeys: string[] = [];

        // Check memory cache
        for (const [key, item] of this.memoryCache.entries()) {
            if (item.expiresAt <= now) {
                expiredKeys.push(key);
            }
        }

        // Check storage cache
        const storageKeys = await this.getAllCacheKeys();
        for (const storageKey of storageKeys) {
            const key: string = storageKey.replace('cache_', '');
            const item = await this.getFromStorage(key);
            if (item && item.expiresAt <= now) {
                expiredKeys.push(key);
            }
        }

        // Remove expired items
        for (const key of expiredKeys) {
            await this.delete(key);
        }

        console.log(`Cleaned ${expiredKeys.length} expired cache items`);
    }

    // Cache statistics
    getStats(): {
        memorySize: number;
        maxSize: number;
        version: string;
        defaultTTL: number;
    } {
        return {
            memorySize: this.memoryCache.size,
            maxSize: this.config.maxSize,
            version: this.config.version,
            defaultTTL: this.config.defaultTTL,
        };
    }

    // Invalidate cache by pattern
    async invalidatePattern(pattern: RegExp): Promise<void> {
        const keysToDelete: string[] = [];

        // Check memory cache
        for (const key of this.memoryCache.keys()) {
            if (pattern.test(key)) {
                keysToDelete.push(key);
            }
        }

        // Check storage cache
        const storageKeys = await this.getAllCacheKeys();
        for (const storageKey of storageKeys) {
            const key: string = storageKey.replace('cache_', '');
            if (pattern.test(key)) {
                keysToDelete.push(key);
            }
        }

        // Delete matching keys
        for (const key of keysToDelete) {
            await this.delete(key);
        }

        console.log(`Invalidated ${keysToDelete.length} cache items matching pattern`);
    }

    // Update cache version (invalidates all cache)
    async updateVersion(newVersion: string): Promise<void> {
        this.config.version = newVersion;
        await this.clear();
        console.log(`Cache version updated to ${newVersion}`);
    }

    // Preload cache with data
    async preload(items: Array<{ key: string; data: any; ttl?: number }>): Promise<void> {
        const promises = items.map(({ key, data, ttl }) => 
            this.set(key, data, ttl)
        );
        
        await Promise.all(promises);
        console.log(`Preloaded ${items.length} cache items`);
    }
}

export const cacheService = new CacheService();

// Cache key generators for different data types
export const CacheKeys = {
    events: (categoryId?: number, language?: string) => {
        const lang = language || 'ar';
        return categoryId ? `events_category_${categoryId}_${lang}` : `events_all_${lang}`;
    },
    
    eventDetails: (id: number, language?: string) => {
        const lang = language || 'ar';
        return `event_${id}_${lang}`;
    },
    
    deals: (categoryId?: number, language?: string) => {
        const lang = language || 'ar';
        return categoryId ? `deals_category_${categoryId}_${lang}` : `deals_all_${lang}`;
    },
    
    dealDetails: (id: number, language?: string) => {
        const lang = language || 'ar';
        return `deal_${id}_${lang}`;
    },
    
    news: (categoryId?: number, language?: string) => {
        const lang = language || 'ar';
        return categoryId ? `news_category_${categoryId}_${lang}` : `news_all_${lang}`;
    },
    
    newsDetails: (id: number, language?: string) => {
        const lang = language || 'ar';
        return `news_${id}_${lang}`;
    },
    
    notifications: (language?: string) => {
        const lang = language || 'ar';
        return `notifications_${lang}`;
    },
    
    categories: (type?: string, language?: string) => {
        const lang = language || 'ar';
        return type ? `categories_${type}_${lang}` : `categories_all_${lang}`;
    },
    
    userProfile: () => 'user_profile',
    
    searchResults: (query: string, language?: string) => {
        const lang = language || 'ar';
        return `search_${query.toLowerCase().replace(/\s+/g, '_')}_${lang}`;
    },
};
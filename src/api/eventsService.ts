import api from './api';
import { ApiResponse, Event, Category, Pagination } from '../types';
import { cacheService, CacheKeys, getCurrentLanguage } from '../services/cacheService';

interface EventsResponse {
    events: Event[];
    pagination: Pagination;
}

interface EventDetailsResponse {
    event: Event;
}

interface MyEventsResponse {
    events: Event[];
    summary: {
        total_registered: number;
        attended: number;
    };
}

interface EventRegistrationResponse {
    registration: {
        event_id: number;
        user_id: number;
        registered_at: string;
        status: string;
    };
}

export const eventsService = {
    // Get all events
    async getEvents(params?: {
        category_id?: number;
        per_page?: number;
        page?: number;
    }): Promise<ApiResponse<EventsResponse>> {
        const language = await getCurrentLanguage();
        const cacheKey = CacheKeys.events(params?.category_id, language);
        
        return await cacheService.getOrSet(
            cacheKey,
            async () => {
                const response = await api.get<ApiResponse<EventsResponse>>('/events', { params });
                return response.data;
            },
            5 * 60 * 1000 // 5 minutes cache
        );
    },

    // Get event details
    async getEventDetails(id: number): Promise<ApiResponse<EventDetailsResponse>> {
        // Don't cache event details to ensure fresh registration status
        const response = await api.get<ApiResponse<EventDetailsResponse>>(`/events/${id}`);
        return response.data;
    },

    // Register for event
    async registerForEvent(id: number): Promise<ApiResponse<EventRegistrationResponse>> {
        try {
            const response = await api.post<ApiResponse<EventRegistrationResponse>>(`/events/${id}/register`);
            
            // Invalidate related caches for all languages
            await cacheService.invalidatePattern(/^events_/);
            await cacheService.delete('my_events');
            
            return response.data;
        } catch (error: any) {
            // Handle specific error cases
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || 'Cannot register for this event';
                throw new Error(errorMessage);
            }
            if (error.response?.status === 403) {
                const errorMessage = error.response.data?.message || 'You are not allowed to register for this event';
                throw new Error(errorMessage);
            }
            throw error;
        }
    },

    // Unregister from event
    async unregisterFromEvent(id: number): Promise<ApiResponse<null>> {
        try {
            const response = await api.delete<ApiResponse<null>>(`/events/${id}/register`);
            
            // Invalidate related caches for all languages
            await cacheService.invalidatePattern(/^events_/);
            await cacheService.delete('my_events');
            
            return response.data;
        } catch (error: any) {
            // Handle specific error cases
            if (error.response?.status === 400) {
                const errorMessage = error.response.data?.message || 'Cannot unregister from this event';
                throw new Error(errorMessage);
            }
            throw error;
        }
    },

    // Get event categories
    async getCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
        const language = await getCurrentLanguage();
        const cacheKey = CacheKeys.categories('events', language);
        
        return await cacheService.getOrSet(
            cacheKey,
            async () => {
                const response = await api.get<ApiResponse<{ categories: Category[] }>>('/events/categories');
                return response.data;
            },
            30 * 60 * 1000 // 30 minutes cache
        );
    },

    // Get my events
    async getMyEvents(): Promise<ApiResponse<MyEventsResponse>> {
        const cacheKey = 'my_events';
        
        return await cacheService.getOrSet(
            cacheKey,
            async () => {
                const response = await api.get<ApiResponse<MyEventsResponse>>('/my-events');
                return response.data;
            },
            2 * 60 * 1000 // 2 minutes cache
        );
    },

    // Get event media
    async getEventMedia(id: number): Promise<ApiResponse<{ images: any[]; videos: any[] }>> {
        const language = await getCurrentLanguage();
        const cacheKey = `event_media_${id}_${language}`;
        
        return await cacheService.getOrSet(
            cacheKey,
            async () => {
                const response = await api.get<ApiResponse<{ images: any[]; videos: any[] }>>(`/events/${id}/media`);
                return response.data;
            },
            15 * 60 * 1000 // 15 minutes cache
        );
    },
};

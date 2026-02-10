import api from './api';
import { ApiResponse, Deal, Category } from '../types';
import { cacheService, CacheKeys, getCurrentLanguage } from '../services/cacheService';

interface DealsResponse {
    deals: Deal[];
    total: number;
}

interface DealDetailsResponse {
    deal: Deal;
}

export const dealsService = {
    // Get all deals
    async getDeals(params?: {
        category_id?: number;
        search?: string;
    }): Promise<ApiResponse<DealsResponse>> {
        const language = await getCurrentLanguage();
        const cacheKey = CacheKeys.deals(params?.category_id, language);
        
        return await cacheService.getOrSet(
            cacheKey,
            async () => {
                const response = await api.get<ApiResponse<DealsResponse>>('/deals', { params });
                return response.data;
            },
            5 * 60 * 1000 // 5 minutes cache
        );
    },

    // Get deal details
    async getDealDetails(id: number): Promise<ApiResponse<DealDetailsResponse>> {
        const language = await getCurrentLanguage();
        const cacheKey = CacheKeys.dealDetails(id, language);
        
        return await cacheService.getOrSet(
            cacheKey,
            async () => {
                const response = await api.get<ApiResponse<DealDetailsResponse>>(`/deals/${id}`);
                return response.data;
            },
            10 * 60 * 1000 // 10 minutes cache
        );
    },

    // Get deal categories
    async getCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
        const language = await getCurrentLanguage();
        const cacheKey = CacheKeys.categories('deals', language);
        
        return await cacheService.getOrSet(
            cacheKey,
            async () => {
                const response = await api.get<ApiResponse<{ categories: Category[] }>>('/deals/categories');
                return response.data;
            },
            30 * 60 * 1000 // 30 minutes cache
        );
    },
};

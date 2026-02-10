import api from './api';
import { ApiResponse, News, Category, Pagination } from '../types';
import { cacheService, CacheKeys, getCurrentLanguage } from '../services/cacheService';

interface NewsResponse {
    news: News[];
    pagination: Pagination;
}

interface NewsDetailsResponse {
    news: News;
}

export const newsService = {
    // Get all news
    async getNews(params?: {
        category_id?: number;
        per_page?: number;
        page?: number;
    }): Promise<ApiResponse<NewsResponse>> {
        const language = await getCurrentLanguage();
        const cacheKey = CacheKeys.news(params?.category_id, language);
        
        return await cacheService.getOrSet(
            cacheKey,
            async () => {
                const response = await api.get<ApiResponse<NewsResponse>>('/news', { params });
                return response.data;
            },
            5 * 60 * 1000 // 5 minutes cache
        );
    },

    // Get news details
    async getNewsDetails(id: number): Promise<ApiResponse<NewsDetailsResponse>> {
        const language = await getCurrentLanguage();
        const cacheKey = CacheKeys.newsDetails(id, language);
        
        return await cacheService.getOrSet(
            cacheKey,
            async () => {
                const response = await api.get<ApiResponse<NewsDetailsResponse>>(`/news/${id}`);
                return response.data;
            },
            10 * 60 * 1000 // 10 minutes cache
        );
    },

    // Get news categories
    async getCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
        const language = await getCurrentLanguage();
        const cacheKey = CacheKeys.categories('news', language);
        
        return await cacheService.getOrSet(
            cacheKey,
            async () => {
                const response = await api.get<ApiResponse<{ categories: Category[] }>>('/news/categories');
                return response.data;
            },
            30 * 60 * 1000 // 30 minutes cache
        );
    },
};

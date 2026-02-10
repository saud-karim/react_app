import api from './api';
import { ApiResponse, Notification, Pagination } from '../types';

interface NotificationsResponse {
    notifications: Notification[];
    unread_count: number;
    pagination: Pagination;
}

export const notificationsService = {
    // Get all notifications
    async getNotifications(params?: {
        per_page?: number;
        page?: number;
    }): Promise<ApiResponse<NotificationsResponse>> {
        const response = await api.get<ApiResponse<NotificationsResponse>>('/notifications', { params });
        return response.data;
    },

    // Get unread count
    async getUnreadCount(): Promise<ApiResponse<{ unread_count: number }>> {
        const response = await api.get<ApiResponse<{ unread_count: number }>>('/notifications/unread-count');
        return response.data;
    },

    // Mark notification as read
    async markAsRead(id: number): Promise<ApiResponse<null>> {
        const response = await api.post<ApiResponse<null>>(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all as read
    async markAllAsRead(): Promise<ApiResponse<null>> {
        const response = await api.post<ApiResponse<null>>('/notifications/read-all');
        return response.data;
    },

    // Delete notification
    async deleteNotification(id: number): Promise<ApiResponse<null>> {
        const response = await api.delete<ApiResponse<null>>(`/notifications/${id}`);
        return response.data;
    },
};

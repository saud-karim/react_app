import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { notificationsService } from '../api/notificationsService';
import { Notification } from '../types';
import { Icon } from '../components/icons/Icon';
import { AppHeader } from '../components/navigation/AppHeader';
import { getDateLocale } from '../utils/dateUtils';

export const NotificationsScreen: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await notificationsService.getNotifications();
            if (response.success) {
                setNotifications(response.data.notifications);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const onRefresh = async () => {
        setIsRefreshing(true);
        await loadNotifications();
        setIsRefreshing(false);
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            const response = await notificationsService.markAsRead(id);
            if (response.success) {
                setNotifications(notifications.map(n =>
                    n.id === id ? { ...n, is_read: true } : n
                ));
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await notificationsService.markAllAsRead();
            if (response.success) {
                setNotifications(notifications.map(n => ({ ...n, is_read: true })));
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert(
            t('delete'),
            t('deleteNotificationConfirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await notificationsService.deleteNotification(id);
                            if (response.success) {
                                setNotifications(notifications.filter(n => n.id !== id));
                            }
                        } catch (error) {
                            console.error('Error deleting notification:', error);
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return t('now');
        if (hours < 24) return t('hoursAgo').replace('{hours}', hours.toString());
        if (hours < 48) return t('yesterday');
        return date.toLocaleDateString(getDateLocale(i18n.language));
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'event_reminder': return 'calendar';
            case 'deal_announcement': return 'gift';
            case 'news': return 'newspaper';
            case 'broadcast': return 'bell';
            default: return 'bell';
        }
    };

    const renderNotification = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
            onPress={() => handleMarkAsRead(item.id)}
            onLongPress={() => handleDelete(item.id)}
        >
            <View style={styles.iconContainer}>
                <Icon name={getNotificationIcon(item.type)} size={20} color="#6b7280" />
            </View>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>
                        {item.title}
                    </Text>
                    {!item.is_read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.time}>{formatDate(item.created_at)}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ef4444" />
            </View>
        );
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <View style={styles.container}>
            <AppHeader 
                title={t('notifications')}
                showBackButton={true}
                showNotifications={false}
                showProfile={false}
            />
            <View style={styles.content}>
            {/* Header Actions */}
            {notifications.length > 0 && unreadCount > 0 && (
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={handleMarkAllAsRead}
                    >
                        <Text style={styles.markAllText}>{t('markAllAsRead')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Notifications List */}
            <FlatList
                data={notifications}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderNotification}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="bell" size={48} color="#9ca3af" />
                        <Text style={styles.emptyText}>{t('noNotifications')}</Text>
                    </View>
                }
            />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        backgroundColor: '#fff',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        alignItems: 'flex-end',
    },
    markAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    markAllText: {
        fontSize: 14,
        color: '#2563eb',
        fontWeight: '500',
    },
    listContent: {
        padding: 16,
    },
    notificationCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    unreadCard: {
        backgroundColor: '#fef2f2',
        borderLeftWidth: 3,
        borderLeftColor: '#ef4444',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '500',
        color: '#374151',
        flex: 1,
    },
    unreadTitle: {
        fontWeight: '700',
        color: '#1f2937',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        marginLeft: 8,
    },
    body: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
        marginBottom: 6,
    },
    time: {
        fontSize: 12,
        color: '#9ca3af',
    },
    emptyContainer: {
        padding: 48,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 16,
    },
});

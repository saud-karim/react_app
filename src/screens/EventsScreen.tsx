import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import i18n from '../localization/i18n';
import { eventsService } from '../api/eventsService';
import { Event, Category } from '../types';
import { theme } from '../theme';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/icons/Icon';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { Header } from '../components/layout/Header';
import { formatMonthShort, getDateLocale } from '../utils/dateUtils';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type EventsScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export const EventsScreen: React.FC<EventsScreenProps> = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const [events, setEvents] = useState<Event[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadEvents();
        loadCategories();
    }, []);

    // Listen for language changes to reload data
    useEffect(() => {
        const handleLanguageChanged = () => {
            console.log('Language changed, reloading events data...');
            loadEvents();
            loadCategories();
        };

        i18n.on('languageChanged', handleLanguageChanged);
        
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

    const loadEvents = async () => {
        try {
            console.log('Loading events...');
            const response = await eventsService.getEvents();
            console.log('Events API response:', response);
            
            if (response.success && response.data.events) {
                console.log('Setting events:', response.data.events.length, 'events');
                setEvents(response.data.events);
            } else {
                console.error('Invalid events response structure:', response);
                setEvents([]);
            }
        } catch (error) {
            console.error('Error loading events:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await eventsService.getCategories();
            if (response.success && response.data.categories) {
                setCategories([
                    { 
                        id: 0, 
                        name: t('allCategories'),
                        name_ar: 'الكل', 
                        name_en: 'All' 
                    }, 
                    ...response.data.categories
                ]);
                // Set default selection to first category (All Events)
                setSelectedCategory(0);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadEvents();
        setRefreshing(false);
    };

    const filteredEvents = selectedCategory && selectedCategory !== 0
        ? events.filter(event => event.category?.id === selectedCategory)
        : events;

    const renderEventCard = ({ item }: { item: Event }) => (
        <TouchableOpacity
            style={styles.eventCard}
            onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
            activeOpacity={0.95}
        >
            <View style={styles.eventContent}>
                {/* Event Image with Gradient Overlay and Date */}
                {item.images.length > 0 && (
                    <View style={styles.eventImageContainer}>
                        <Image
                            source={{ uri: item.images[0].url }}
                            style={styles.eventCardImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.imageGradient}
                        />
                        
                        {/* Date Container on Image - Top Left */}
                        <LinearGradient
                            colors={[theme.colors.primary[500], theme.colors.primary[700]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.dateContainerOnImage}
                        >
                            <Text style={styles.dateDay}>
                                {new Date(item.start_date).getDate()}
                            </Text>
                            <Text style={styles.dateMonth}>
                                {formatMonthShort(item.start_date, getDateLocale(i18n.language))}
                            </Text>
                        </LinearGradient>
                        
                        {/* Category Badge on Image - Top Right */}
                        {item.category && (
                            <View style={styles.categoryBadgeOnImage}>
                                <Text style={styles.categoryBadgeText}>
                                    {item.category.name}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
                
                <View style={styles.eventMainContent}>
                    <Text style={styles.eventTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={styles.eventDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                    
                    <View style={styles.eventMeta}>
                        <View style={styles.metaItem}>
                            <View style={styles.metaIconContainer}>
                                <Icon name="clock" size={14} color={theme.colors.primary[600]} />
                            </View>
                            <Text style={styles.metaText}>
                                {new Date(item.start_date).toLocaleTimeString(getDateLocale(i18n.language), {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </Text>
                        </View>
                        
                        <View style={styles.metaItem}>
                            <View style={styles.metaIconContainer}>
                                <Icon name="mapPin" size={14} color={theme.colors.error[500]} />
                            </View>
                            <Text style={styles.metaText} numberOfLines={1}>
                                {item.location || t('noLocation')}
                            </Text>
                        </View>
                        
                        <View style={styles.metaItem}>
                            <View style={styles.metaIconContainer}>
                                <Icon name="users" size={14} color={theme.colors.success[600]} />
                            </View>
                            <Text style={styles.metaText}>
                                {item.current_attendees} {t('attendees')}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.eventFooter}>
                        {item.is_registered && (
                            <View style={styles.registeredBadge}>
                                <Icon name="check" size={12} color={theme.colors.success[600]} />
                                <Text style={styles.registeredText}>{t('registered')}</Text>
                            </View>
                        )}
                        <View style={styles.chevronContainer}>
                            <Icon name="chevronLeft" size={16} color={theme.colors.primary[600]} />
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderCategoryChip = ({ item }: { item: Category }) => {
        const isSelected = selectedCategory === item.id;
        
        return (
            <TouchableOpacity
                style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive,
                    { 
                        backgroundColor: isSelected 
                            ? theme.colors.primary[500] 
                            : theme.colors.background.secondary,
                        borderColor: isSelected 
                            ? theme.colors.primary[500] 
                            : theme.colors.border.light,
                    }
                ]}
                onPress={() => setSelectedCategory(item.id)}
                activeOpacity={0.8}
            >
                <Text style={[
                    styles.categoryChipText,
                    { 
                        color: isSelected 
                            ? theme.colors.background.primary 
                            : theme.colors.text.secondary 
                    }
                ]}>
                    {item.name}
                </Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
                <Text style={styles.loadingText}>{t('loading')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Count */}
            <View style={styles.headerSection}>
                <Text style={styles.eventsCount}>
                    {filteredEvents.length} {t('events')}
                </Text>
            </View>

            {/* Categories Filter */}
            <View style={styles.categoriesSection}>
                <FlatList
                    data={categories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                    renderItem={renderCategoryChip}
                    keyExtractor={(item) => item.id.toString()}
                />
            </View>

            {/* Events List */}
            <FlatList
                data={filteredEvents}
                renderItem={renderEventCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.eventsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary[500]]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <LinearGradient
                            colors={[theme.colors.primary[100], theme.colors.primary[50]]}
                            style={styles.emptyIconContainer}
                        >
                            <Icon name="calendar" size={48} color={theme.colors.primary[400]} />
                        </LinearGradient>
                        <Text style={styles.emptyTitle}>{t('noEvents')}</Text>
                        <Text style={styles.emptyText}>
                            {selectedCategory !== 0 ? t('noEventsInCategory') : t('noEventsAvailable')}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
    loadingText: {
        marginTop: theme.spacing[4],
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fonts.medium,
    },
    headerSection: {
        paddingHorizontal: theme.spacing[6],
        paddingTop: theme.spacing[6],
        paddingBottom: theme.spacing[3],
    },
    eventsCount: {
        fontSize: theme.typography.sizes['2xl'],
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
    },
    categoriesSection: {
        paddingVertical: theme.spacing[3],
    },
    categoriesList: {
        paddingHorizontal: theme.spacing[6],
        gap: theme.spacing[2],
    },
    categoryChip: {
        paddingHorizontal: theme.spacing[5],
        paddingVertical: theme.spacing[2],
        marginRight: theme.spacing[2],
        borderRadius: theme.borderRadius.full,
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryChipActive: {
        shadowColor: theme.colors.primary[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    categoryChipText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.semibold,
    },
    eventsList: {
        paddingHorizontal: theme.spacing[6],
        paddingTop: theme.spacing[2],
        paddingBottom: theme.spacing[8],
    },
    eventCard: {
        marginBottom: theme.spacing[4],
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    eventImageContainer: {
        width: '100%',
        height: 160,
        position: 'relative',
    },
    eventCardImage: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
    },
    categoryBadgeOnImage: {
        position: 'absolute',
        top: 12,
        right: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    categoryBadgeText: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.semibold,
        color: '#FFFFFF',
    },
    dateContainerOnImage: {
        position: 'absolute',
        top: 12,
        left: 12,
        width: 52,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    dateDay: {
        fontSize: 20,
        fontFamily: theme.typography.fonts.bold,
        color: '#FFFFFF',
    },
    dateMonth: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.semibold,
        color: '#FFFFFF',
        textTransform: 'uppercase',
        marginTop: -2,
    },
    eventContent: {
        flexDirection: 'column',
    },
    eventMainContent: {
        padding: theme.spacing[4],
    },
    eventTitle: {
        fontSize: theme.typography.sizes.lg,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[2],
        lineHeight: 24,
    },
    eventDescription: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.regular,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        marginBottom: theme.spacing[3],
    },
    eventMeta: {
        gap: theme.spacing[2],
        marginBottom: theme.spacing[3],
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[2],
    },
    metaIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 10,
        backgroundColor: theme.colors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    metaText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.text.secondary,
        flex: 1,
    },
    eventFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: theme.spacing[3],
        borderTopWidth: 1,
        borderTopColor: theme.colors.background.tertiary,
    },
    registeredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[1],
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[1],
        backgroundColor: `${theme.colors.success[500]}15`,
        borderRadius: 8,
    },
    registeredText: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.semibold,
        color: theme.colors.success[600],
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: `${theme.colors.primary[500]}10`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.spacing[16],
        paddingHorizontal: theme.spacing[8],
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing[4],
    },
    emptyTitle: {
        fontSize: theme.typography.sizes.xl,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[2],
        textAlign: 'center',
    },
    emptyText: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.regular,
        color: theme.colors.text.tertiary,
        textAlign: 'center',
        lineHeight: 24,
    },
});
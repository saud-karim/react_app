import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    RefreshControl,
    Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { eventsService } from '../api/eventsService';
import { newsService } from '../api/newsService';
import { dealsService } from '../api/dealsService';
import { Event, News, Deal } from '../types';
import { theme } from '../theme';
import { Icon } from '../components/icons/Icon';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

export const HomeScreen: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const [events, setEvents] = useState<Event[]>([]);
    const [news, setNews] = useState<News[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    // Listen for language changes to reload data
    useEffect(() => {
        const handleLanguageChanged = () => {
            console.log('Language changed, reloading home data...');
            loadData();
        };

        i18n.on('languageChanged', handleLanguageChanged);
        
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

    const loadData = async () => {
        try {
            const [eventsRes, newsRes, dealsRes] = await Promise.all([
                eventsService.getEvents({ page: 1, per_page: 5 }),
                newsService.getNews({ page: 1, per_page: 5 }),
                dealsService.getDeals(),
            ]);

            if (eventsRes.success) setEvents(eventsRes.data.events || []);
            if (newsRes.success) setNews(newsRes.data.news || []);
            if (dealsRes.success) setDeals(dealsRes.data.deals || []);
            if (dealsRes.success) setDeals(dealsRes.data.deals || []);
        } catch (error) {
            console.error('Error loading home data:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Hero Section with Gradient */}
            <LinearGradient
                colors={[theme.colors.primary[500], theme.colors.primary[700]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroSection}
            >
                <View style={styles.heroContent}>
                    <View style={styles.heroTextContainer}>
                        <Text style={styles.heroTitle}>{t('welcome')}</Text>
                        <Text style={styles.heroSubtitle}>{t('exploreContent')}</Text>
                    </View>
                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{events.length}</Text>
                            <Text style={styles.statLabel}>{t('events')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{news.length}</Text>
                            <Text style={styles.statLabel}>{t('news')}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{deals.length}</Text>
                            <Text style={styles.statLabel}>{t('deals')}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Events Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <LinearGradient
                            colors={[theme.colors.primary[500], theme.colors.primary[700]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconGradient}
                        >
                            <Icon name="calendar" size={20} color="#FFFFFF" />
                        </LinearGradient>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={styles.sectionTitle}>{t('events')}</Text>
                            <Text style={styles.sectionCount}>{events.length} {t('available')}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => navigation.navigate('EventsTab' as never)}
                    >
                        <Text style={styles.viewAllText}>{t('viewAll')}</Text>
                        <Icon name="chevronLeft" size={16} color={theme.colors.primary[600]} />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                    snapToInterval={CARD_WIDTH + 16}
                    decelerationRate="fast"
                >
                    {events.map((event, index) => (
                        <TouchableOpacity
                            key={event.id}
                            style={[styles.card, index === 0 && styles.firstCard]}
                            onPress={() => navigation.navigate('EventDetails' as never, { eventId: event.id } as never)}
                            activeOpacity={0.95}
                        >
                            <View style={styles.cardImageWrapper}>
                                {event.images && event.images.length > 0 ? (
                                    <Image
                                        source={{ uri: event.images[0].url }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={[theme.colors.primary[500], theme.colors.primary[700]]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.cardImage}
                                    >
                                        <Icon name="calendar" size={60} color="rgba(255,255,255,0.3)" />
                                    </LinearGradient>
                                )}
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                                    style={styles.imageOverlay}
                                />
                                <View style={styles.cardBadge}>
                                    <Icon name="calendar" size={12} color="#FFFFFF" />
                                    <Text style={styles.cardBadgeText}>{t('events')}</Text>
                                </View>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle} numberOfLines={2}>
                                    {event.title}
                                </Text>
                                {event.location && (
                                    <View style={styles.cardInfo}>
                                        <View style={styles.infoIcon}>
                                            <Icon name="mapPin" size={12} color={theme.colors.primary[600]} />
                                        </View>
                                        <Text style={styles.cardInfoText} numberOfLines={1}>{event.location}</Text>
                                    </View>
                                )}
                                <View style={styles.cardFooter}>
                                    <View style={styles.cardInfo}>
                                        <View style={styles.infoIcon}>
                                            <Icon name="users" size={12} color={theme.colors.text.tertiary} />
                                        </View>
                                        <Text style={styles.cardInfoText}>{event.current_attendees} {t('attendees')}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* News Section */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <LinearGradient
                            colors={[theme.colors.warning[500], theme.colors.warning[700]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconGradient}
                        >
                            <Icon name="news" size={20} color="#FFFFFF" />
                        </LinearGradient>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={styles.sectionTitle}>{t('news')}</Text>
                            <Text style={styles.sectionCount}>{news.length} {t('available')}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => navigation.navigate('NewsTab' as never)}
                    >
                        <Text style={styles.viewAllText}>{t('viewAll')}</Text>
                        <Icon name="chevronLeft" size={16} color={theme.colors.warning[600]} />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                    snapToInterval={CARD_WIDTH + 16}
                    decelerationRate="fast"
                >
                    {news.map((item, index) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.card, index === 0 && styles.firstCard]}
                            onPress={() => navigation.navigate('NewsDetails' as never, { newsId: item.id } as never)}
                            activeOpacity={0.95}
                        >
                            <View style={styles.cardImageWrapper}>
                                {item.images && item.images.length > 0 ? (
                                    <Image
                                        source={{ uri: item.images[0].url }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={[theme.colors.warning[500], theme.colors.warning[700]]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.cardImage}
                                    >
                                        <Icon name="news" size={60} color="rgba(255,255,255,0.3)" />
                                    </LinearGradient>
                                )}
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                                    style={styles.imageOverlay}
                                />
                                <View style={[styles.cardBadge, { backgroundColor: theme.colors.warning[600] }]}>
                                    <Icon name="news" size={12} color="#FFFFFF" />
                                    <Text style={styles.cardBadgeText}>{t('news')}</Text>
                                </View>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle} numberOfLines={2}>
                                    {item.title}
                                </Text>
                                <View style={styles.cardFooter}>
                                    <View style={styles.cardInfo}>
                                        <View style={styles.infoIcon}>
                                            <Icon name="eye" size={12} color={theme.colors.text.tertiary} />
                                        </View>
                                        <Text style={styles.cardInfoText}>{item.views_count} {t('views')}</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Deals Section */}
            <View style={[styles.section, { marginBottom: theme.spacing[8] }]}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                        <LinearGradient
                            colors={[theme.colors.success[500], theme.colors.success[700]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconGradient}
                        >
                            <Icon name="gift" size={20} color="#FFFFFF" />
                        </LinearGradient>
                        <View style={styles.sectionTitleContainer}>
                            <Text style={styles.sectionTitle}>{t('deals')}</Text>
                            <Text style={styles.sectionCount}>{deals.length} {t('available')}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.viewAllButton}
                        onPress={() => navigation.navigate('DealsTab' as never)}
                    >
                        <Text style={styles.viewAllText}>{t('viewAll')}</Text>
                        <Icon name="chevronLeft" size={16} color={theme.colors.success[600]} />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                    snapToInterval={CARD_WIDTH + 16}
                    decelerationRate="fast"
                >
                    {deals.map((deal, index) => (
                        <TouchableOpacity
                            key={deal.id}
                            style={[styles.card, index === 0 && styles.firstCard]}
                            onPress={() => navigation.navigate('DealDetails' as never, { dealId: deal.id } as never)}
                            activeOpacity={0.95}
                        >
                            <View style={styles.cardImageWrapper}>
                                {deal.company_logo ? (
                                    <Image
                                        source={{ uri: deal.company_logo }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <LinearGradient
                                        colors={[theme.colors.success[500], theme.colors.success[700]]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.cardImage}
                                    >
                                        <Icon name="gift" size={60} color="rgba(255,255,255,0.3)" />
                                    </LinearGradient>
                                )}
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.85)']}
                                    style={styles.imageOverlay}
                                />
                                {deal.is_expired ? (
                                    <View style={[styles.cardBadge, { backgroundColor: theme.colors.error[500] }]}>
                                        <Icon name="x" size={12} color="#FFFFFF" />
                                        <Text style={styles.cardBadgeText}>{t('expired')}</Text>
                                    </View>
                                ) : (
                                    <View style={[styles.cardBadge, { backgroundColor: theme.colors.success[600] }]}>
                                        <Icon name="gift" size={12} color="#FFFFFF" />
                                        <Text style={styles.cardBadgeText}>{t('deals')}</Text>
                                    </View>
                                )}
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle} numberOfLines={2}>
                                    {deal.title}
                                </Text>
                                <View style={styles.dealValueContainer}>
                                    <LinearGradient
                                        colors={[theme.colors.success[500], theme.colors.success[700]]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.dealValueBadge}
                                    >
                                        <Icon name="tag" size={14} color="#FFFFFF" />
                                        <Text style={styles.dealValueText}>
                                            {deal.deal_type === 'percentage' && `${deal.deal_value}%`}
                                            {deal.deal_type === 'fixed_amount' && `${deal.deal_value} ج.م`}
                                            {deal.deal_type === 'free_item' && t('freeItem')}
                                        </Text>
                                    </LinearGradient>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    heroSection: {
        paddingHorizontal: theme.spacing[6],
        paddingTop: theme.spacing[8],
        paddingBottom: theme.spacing[8],
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    heroContent: {
        gap: theme.spacing[6],
    },
    heroTextContainer: {
        gap: theme.spacing[2],
    },
    heroTitle: {
        fontSize: 32,
        fontFamily: theme.typography.fonts.bold,
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    heroSubtitle: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.regular,
        color: 'rgba(255, 255, 255, 0.95)',
        lineHeight: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        padding: theme.spacing[4],
        backdropFilter: 'blur(10px)',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: theme.spacing[1],
    },
    statNumber: {
        fontSize: 28,
        fontFamily: theme.typography.fonts.bold,
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.medium,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    statDivider: {
        width: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: theme.spacing[2],
    },
    section: {
        marginTop: theme.spacing[6],
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing[6],
        marginBottom: theme.spacing[4],
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[3],
    },
    iconGradient: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    sectionTitleContainer: {
        gap: 2,
    },
    sectionTitle: {
        fontSize: theme.typography.sizes['2xl'],
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
    },
    sectionCount: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.text.tertiary,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[1],
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[3],
        backgroundColor: theme.colors.background.secondary,
        borderRadius: 12,
    },
    viewAllText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.semibold,
        color: theme.colors.primary[600],
    },
    horizontalScroll: {
        paddingLeft: theme.spacing[6],
        paddingRight: theme.spacing[6],
    },
    card: {
        width: CARD_WIDTH,
        marginRight: theme.spacing[4],
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    firstCard: {
        marginLeft: 0,
    },
    cardImageWrapper: {
        position: 'relative',
        width: '100%',
        height: 220,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    cardBadge: {
        position: 'absolute',
        top: theme.spacing[3],
        right: theme.spacing[3],
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[1],
        backgroundColor: theme.colors.primary[600],
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[2],
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    cardBadgeText: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.semibold,
        color: '#FFFFFF',
    },
    cardContent: {
        padding: theme.spacing[5],
        gap: theme.spacing[3],
    },
    cardTitle: {
        fontSize: theme.typography.sizes.xl,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
        lineHeight: 28,
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[2],
    },
    infoIcon: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: theme.colors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardInfoText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.text.secondary,
        flex: 1,
    },
    cardFooter: {
        paddingTop: theme.spacing[2],
        borderTopWidth: 1,
        borderTopColor: theme.colors.background.tertiary,
    },
    dealValueContainer: {
        marginTop: theme.spacing[1],
    },
    dealValueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[2],
        alignSelf: 'flex-start',
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[2],
        borderRadius: 12,
        shadowColor: '#4facfe',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    dealValueText: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.bold,
        color: '#FFFFFF',
    },
});

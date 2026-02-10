import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Image,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import i18n from '../localization/i18n';
import { newsService } from '../api/newsService';
import { News, Category } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatDateShort, formatMonthShort, getDateLocale } from '../utils/dateUtils';
import { theme } from '../theme';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/icons/Icon';

const { width } = Dimensions.get('window');

type NewsScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export const NewsScreen: React.FC<NewsScreenProps> = ({ navigation }) => {
    const { t, i18n } = useTranslation();
    const [news, setNews] = useState<News[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadNews();
        loadCategories();
    }, []);

    // Listen for language changes to reload data
    useEffect(() => {
        const handleLanguageChanged = () => {
            console.log('Language changed, reloading news data...');
            loadNews();
            loadCategories();
        };

        i18n.on('languageChanged', handleLanguageChanged);
        
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

    const loadNews = async () => {
        try {
            console.log('Loading news...');
            const params = selectedCategory ? { category_id: selectedCategory } : undefined;
            const response = await newsService.getNews(params);
            console.log('News API response:', response);
            
            if (response.success && response.data.news) {
                console.log('Setting news:', response.data.news.length, 'news items');
                setNews(response.data.news);
            } else {
                console.error('Invalid news response structure:', response);
                setNews([]);
            }
        } catch (error) {
            console.error('Error loading news:', error);
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await newsService.getCategories();
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
                // Set default selection to first category (All News)
                setSelectedCategory(0);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNews();
        setRefreshing(false);
    };

    const filteredNews = selectedCategory && selectedCategory !== 0
        ? news.filter(item => item.category?.id === selectedCategory)
        : news;

    const renderNewsCard = ({ item }: { item: News }) => (
        <TouchableOpacity
            style={styles.newsCard}
            onPress={() => navigation.navigate('NewsDetails', { newsId: item.id })}
            activeOpacity={0.95}
        >
            <View style={styles.newsContent}>
                {/* News Image with Gradient Overlay and Date */}
                {item.images.length > 0 && (
                    <View style={styles.newsImageContainer}>
                        <Image
                            source={{ uri: item.images[0].url }}
                            style={styles.newsCardImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.imageGradient}
                        />
                        
                        {/* Date Container on Image - Top Left */}
                        <LinearGradient
                            colors={[theme.colors.warning[500], theme.colors.warning[700]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.dateContainerOnImage}
                        >
                            <Text style={styles.dateDay}>
                                {new Date(item.publish_date).getDate()}
                            </Text>
                            <Text style={styles.dateMonth}>
                                {formatMonthShort(item.publish_date, getDateLocale(i18n.language))}
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
                
                <View style={styles.newsMainContent}>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={styles.newsDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                    
                    <View style={styles.newsMeta}>
                        <View style={styles.metaItem}>
                            <View style={styles.metaIconContainer}>
                                <Icon name="eye" size={14} color={theme.colors.warning[600]} />
                            </View>
                            <Text style={styles.metaText}>
                                {item.views_count} {t('views')}
                            </Text>
                        </View>
                        
                        <View style={styles.metaItem}>
                            <View style={styles.metaIconContainer}>
                                <Icon name="calendar" size={14} color={theme.colors.primary[600]} />
                            </View>
                            <Text style={styles.metaText}>
                                {formatDateShort(item.publish_date, i18n.language)}
                            </Text>
                        </View>
                        
                        {item.images.length > 0 && (
                            <View style={styles.metaItem}>
                                <View style={styles.metaIconContainer}>
                                    <Icon name="image" size={14} color={theme.colors.success[600]} />
                                </View>
                                <Text style={styles.metaText}>
                                    {item.images.length} {t('images')}
                                </Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.newsFooter}>
                        <View style={styles.newsBadge}>
                            <Icon name="news" size={12} color={theme.colors.warning[600]} />
                            <Text style={styles.newsText}>{t('news')}</Text>
                        </View>
                        <View style={styles.chevronContainer}>
                            <Icon name="chevronLeft" size={16} color={theme.colors.warning[600]} />
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
                            ? theme.colors.warning[500] 
                            : theme.colors.background.secondary,
                        borderColor: isSelected 
                            ? theme.colors.warning[500] 
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
                <ActivityIndicator size="large" color={theme.colors.warning[500]} />
                <Text style={styles.loadingText}>{t('loading')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Count */}
            <View style={styles.headerSection}>
                <Text style={styles.newsCount}>
                    {filteredNews.length} {t('news')}
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

            {/* News List */}
            <FlatList
                data={filteredNews}
                renderItem={renderNewsCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.newsList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.warning[500]]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <LinearGradient
                            colors={[theme.colors.warning[100], theme.colors.warning[50]]}
                            style={styles.emptyIconContainer}
                        >
                            <Icon name="news" size={48} color={theme.colors.warning[400]} />
                        </LinearGradient>
                        <Text style={styles.emptyTitle}>{t('noNews')}</Text>
                        <Text style={styles.emptyText}>
                            {selectedCategory !== 0 ? t('noNewsInCategory') : t('noNewsAvailable')}
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
    newsCount: {
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
        shadowColor: theme.colors.warning[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    categoryChipText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.semibold,
    },
    newsList: {
        paddingHorizontal: theme.spacing[6],
        paddingTop: theme.spacing[2],
        paddingBottom: theme.spacing[8],
    },
    newsCard: {
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
    newsImageContainer: {
        width: '100%',
        height: 160,
        position: 'relative',
    },
    newsCardImage: {
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
    newsContent: {
        flexDirection: 'column',
    },
    newsMainContent: {
        padding: theme.spacing[4],
    },
    newsTitle: {
        fontSize: theme.typography.sizes.lg,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[2],
        lineHeight: 24,
    },
    newsDescription: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.regular,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        marginBottom: theme.spacing[3],
    },
    newsMeta: {
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
    newsFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: theme.spacing[3],
        borderTopWidth: 1,
        borderTopColor: theme.colors.background.tertiary,
    },
    newsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[1],
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[1],
        backgroundColor: `${theme.colors.warning[500]}15`,
        borderRadius: 8,
    },
    newsText: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.semibold,
        color: theme.colors.warning[600],
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: `${theme.colors.warning[500]}10`,
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

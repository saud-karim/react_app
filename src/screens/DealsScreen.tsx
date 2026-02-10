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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import i18n from '../localization/i18n';
import { dealsService } from '../api/dealsService';
import { Deal, Category } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../theme';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/icons/Icon';



type DealsScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export const DealsScreen: React.FC<DealsScreenProps> = ({ navigation }) => {
    const { t } = useTranslation();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    // Listen for language changes to reload data
    useEffect(() => {
        const handleLanguageChanged = () => {
            console.log('Language changed, reloading deals data...');
            loadData();
        };

        i18n.on('languageChanged', handleLanguageChanged);
        
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, []);

    useEffect(() => {
        loadDeals();
    }, [selectedCategory]);

    const loadData = async () => {
        try {
            const [dealsRes, categoriesRes] = await Promise.all([
                dealsService.getDeals(),
                dealsService.getCategories(),
            ]);

            if (dealsRes.success) setDeals(dealsRes.data.deals);
            if (categoriesRes.success) {
                setCategories([
                    { 
                        id: 0, 
                        name: t('allCategories'),
                        name_ar: 'الكل', 
                        name_en: 'All' 
                    }, 
                    ...categoriesRes.data.categories
                ]);
                // Set default selection to first category (All Deals)
                setSelectedCategory(0);
            }
        } catch (error) {
            console.error('Error loading deals:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadDeals = async () => {
        try {
            const params = selectedCategory ? { category_id: selectedCategory } : undefined;
            const response = await dealsService.getDeals(params);
            if (response.success) setDeals(response.data.deals);
        } catch (error) {
            console.error('Error loading deals:', error);
        }
    };

    const onRefresh = async () => {
        setIsRefreshing(true);
        await loadData();
        setIsRefreshing(false);
    };

    const renderDeal = ({ item }: { item: Deal }) => (
        <TouchableOpacity
            style={styles.dealCard}
            onPress={() => navigation.navigate('DealDetails', { dealId: item.id })}
            activeOpacity={0.95}
        >
            <View style={styles.dealContent}>
                {/* Deal Image with Gradient Overlay */}
                {item.images.length > 0 && (
                    <View style={styles.dealImageContainer}>
                        <Image
                            source={{ uri: item.images[0].url }}
                            style={styles.dealCardImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={styles.imageGradient}
                        />
                        {item.is_expired && <View style={styles.expiredOverlay} />}
                        
                        {/* Expiry Date Container on Image - Top Left */}
                        <LinearGradient
                            colors={item.is_expired 
                                ? [theme.colors.error[500], theme.colors.error[700]]
                                : [theme.colors.success[500], theme.colors.success[700]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.dateContainerOnImage}
                        >
                            <Text style={styles.dateDay}>
                                {new Date(item.end_date).getDate()}
                            </Text>
                            <Text style={styles.dateMonth}>
                                {new Date(item.end_date).toLocaleDateString('ar', { month: 'short' })}
                            </Text>
                        </LinearGradient>
                        
                        {/* Discount Badge on Image - Top Right */}
                        <View style={[styles.discountBadgeOnImage, {
                            backgroundColor: item.is_expired 
                                ? 'rgba(0,0,0,0.6)' 
                                : 'rgba(0,0,0,0.5)',
                        }]}>
                            <Icon name="tag" size={12} color="#FFFFFF" />
                            <Text style={styles.discountBadgeText}>
                                {item.deal_type === 'percentage' && `${item.deal_value}%`}
                                {item.deal_type === 'fixed_amount' && `${item.deal_value} ج.م`}
                                {item.deal_type === 'free_item' && t('freeItem')}
                            </Text>
                        </View>
                    </View>
                )}
                
                <View style={styles.dealMainContent}>
                    <Text style={styles.dealTitle} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text style={styles.dealDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                    
                    <View style={styles.dealMeta}>
                        <View style={styles.metaItem}>
                            <View style={styles.metaIconContainer}>
                                <Icon name="user" size={14} color={theme.colors.success[600]} />
                            </View>
                            <Text style={styles.metaText}>
                                {item.company_name}
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
                        
                        {item.original_price > 0 && (
                            <View style={styles.metaItem}>
                                <View style={styles.metaIconContainer}>
                                    <Icon name="dollarSign" size={14} color={theme.colors.warning[600]} />
                                </View>
                                <Text style={styles.metaText}>
                                    {item.original_price} ج.م
                                </Text>
                            </View>
                        )}
                    </View>
                    
                    <View style={styles.dealFooter}>
                        {item.is_expired ? (
                            <View style={styles.expiredBadge}>
                                <Icon name="x" size={12} color={theme.colors.error[600]} />
                                <Text style={styles.expiredText}>{t('expired')}</Text>
                            </View>
                        ) : (
                            <View style={styles.activeBadge}>
                                <Icon name="check" size={12} color={theme.colors.success[600]} />
                                <Text style={styles.activeText}>{t('available')}</Text>
                            </View>
                        )}
                        <View style={styles.chevronContainer}>
                            <Icon name="chevronLeft" size={16} color={theme.colors.success[600]} />
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
                            ? theme.colors.success[500] 
                            : theme.colors.background.secondary,
                        borderColor: isSelected 
                            ? theme.colors.success[500] 
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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.success[500]} />
                <Text style={styles.loadingText}>{t('loading')}...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header with Count */}
            <View style={styles.headerSection}>
                <Text style={styles.dealsCount}>
                    {deals.length} {t('deals')}
                </Text>
            </View>

            {/* Categories Filter */}
            <View style={styles.categoriesSection}>
                <FlatList
                    horizontal
                    data={categories}
                    keyExtractor={(item) => String(item.id || 'all')}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContent}
                    renderItem={renderCategoryChip}
                />
            </View>

            {/* Deals List */}
            <FlatList
                data={deals}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderDeal}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={isRefreshing} 
                        onRefresh={onRefresh}
                        colors={[theme.colors.success[500]]}
                        tintColor={theme.colors.success[500]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <LinearGradient
                            colors={[theme.colors.success[100], theme.colors.success[50]]}
                            style={styles.emptyIconContainer}
                        >
                            <Icon name="gift" size={48} color={theme.colors.success[400]} />
                        </LinearGradient>
                        <Text style={styles.emptyTitle}>{t('noDeals')}</Text>
                        <Text style={styles.emptyText}>
                            {selectedCategory !== 0 ? t('noDealsInCategory') : t('noDealsAvailable')}
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
    dealsCount: {
        fontSize: theme.typography.sizes['2xl'],
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
    },
    categoriesSection: {
        paddingVertical: theme.spacing[3],
    },
    categoriesContent: {
        paddingHorizontal: theme.spacing[6],
        gap: theme.spacing[2],
    },
    categoryChip: {
        paddingHorizontal: theme.spacing[5],
        paddingVertical: theme.spacing[2],
        borderRadius: theme.borderRadius.full,
        marginRight: theme.spacing[2],
        borderWidth: 1.5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryChipActive: {
        shadowColor: theme.colors.success[500],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    categoryChipText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.semibold,
    },
    listContent: {
        paddingHorizontal: theme.spacing[6],
        paddingTop: theme.spacing[2],
        paddingBottom: theme.spacing[8],
    },
    dealCard: {
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
    dealImageContainer: {
        width: '100%',
        height: 160,
        position: 'relative',
    },
    dealCardImage: {
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
    expiredOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    discountBadgeOnImage: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[1],
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    discountBadgeText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.bold,
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
    dealContent: {
        flexDirection: 'column',
    },
    dealMainContent: {
        padding: theme.spacing[4],
    },
    dealTitle: {
        fontSize: theme.typography.sizes.lg,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[2],
        lineHeight: 24,
    },
    dealDescription: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.regular,
        color: theme.colors.text.secondary,
        lineHeight: 20,
        marginBottom: theme.spacing[3],
    },
    dealMeta: {
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
    dealFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: theme.spacing[3],
        borderTopWidth: 1,
        borderTopColor: theme.colors.background.tertiary,
    },
    expiredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[1],
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[1],
        backgroundColor: `${theme.colors.error[500]}15`,
        borderRadius: 8,
    },
    expiredText: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.semibold,
        color: theme.colors.error[600],
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[1],
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[1],
        backgroundColor: `${theme.colors.success[500]}15`,
        borderRadius: 8,
    },
    activeText: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.semibold,
        color: theme.colors.success[600],
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: `${theme.colors.success[500]}10`,
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

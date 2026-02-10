import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { dealsService } from '../api/dealsService';
import { Deal } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '../components/icons/Icon';
import { AppHeader } from '../components/navigation/AppHeader';
import { formatDate } from '../utils/dateUtils';
import { theme } from '../theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DealDetails'>;

export const DealDetailsScreen: React.FC<Props> = ({ route }) => {
    const { t, i18n } = useTranslation();
    const { dealId } = route.params;
    const [deal, setDeal] = useState<Deal | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scrollViewRef = React.useRef<ScrollView>(null);

    useEffect(() => {
        loadDeal();
    }, [dealId]);

    const loadDeal = async () => {
        try {
            const response = await dealsService.getDealDetails(dealId);
            if (response.success) {
                setDeal(response.data.deal);
            }
        } catch (error) {
            console.error('Error loading deal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getDiscountText = (deal: Deal) => {
        switch (deal.deal_type) {
            case 'percentage':
                return `${deal.deal_value}% ${t('discount')}`;
            case 'fixed_amount':
                return `${deal.deal_value} ج.م ${t('discount')}`;
            case 'free_item':
                return t('freeItem');
            default:
                return t('deals');
        }
    };

    const getDiscountColor = (deal: Deal) => {
        switch (deal.deal_type) {
            case 'percentage':
                return theme.colors.success[500];
            case 'fixed_amount':
                return theme.colors.error[500];
            case 'free_item':
                return theme.colors.warning[500];
            default:
                return theme.colors.primary[500];
        }
    };

    const handleScrollLeft = () => {
        if (currentImageIndex > 0 && scrollViewRef.current) {
            const newIndex = currentImageIndex - 1;
            scrollViewRef.current.scrollTo({ x: newIndex * Dimensions.get('window').width, animated: true });
            setCurrentImageIndex(newIndex);
        }
    };

    const handleScrollRight = () => {
        if (deal && deal.images && currentImageIndex < deal.images.length - 1 && scrollViewRef.current) {
            const newIndex = currentImageIndex + 1;
            scrollViewRef.current.scrollTo({ x: newIndex * Dimensions.get('window').width, animated: true });
            setCurrentImageIndex(newIndex);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.success[500]} />
            </View>
        );
    }

    if (!deal) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>{t('error')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader 
                title={t('dealDetails')}
                showBackButton={true}
                showNotifications={false}
                showMenu={false}
            />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Image Section */}
                <View style={styles.heroImageContainer}>
                    {deal.images && deal.images.length > 0 ? (
                        <>
                            <ScrollView 
                                ref={scrollViewRef}
                                horizontal 
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                style={styles.heroScrollView}
                                onScroll={(e) => {
                                    const index = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
                                    setCurrentImageIndex(index);
                                }}
                                scrollEventThrottle={16}
                            >
                                {deal.images.map((image, index) => (
                                    <View key={image.id} style={styles.heroImageWrapper}>
                                        <Image
                                            source={{ uri: image.url }}
                                            style={styles.heroImage}
                                            resizeMode="cover"
                                        />
                                        <LinearGradient
                                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                                            style={styles.heroGradient}
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                            
                            {/* Navigation Arrows - Only show if more than 1 image */}
                            {deal.images.length > 1 && (
                                <>
                                    {/* Left Arrow */}
                                    {currentImageIndex > 0 && (
                                        <TouchableOpacity 
                                            style={styles.leftArrow}
                                            onPress={handleScrollLeft}
                                            activeOpacity={0.7}
                                        >
                                            <Icon name="chevronLeft" size={24} color={theme.colors.background.primary} />
                                        </TouchableOpacity>
                                    )}
                                    
                                    {/* Right Arrow */}
                                    {currentImageIndex < deal.images.length - 1 && (
                                        <TouchableOpacity 
                                            style={styles.rightArrow}
                                            onPress={handleScrollRight}
                                            activeOpacity={0.7}
                                        >
                                            <Icon name="chevronRight" size={24} color={theme.colors.background.primary} />
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                            
                            {/* Image Counter */}
                            {deal.images.length > 1 && (
                                <View style={styles.imageCounter}>
                                    <Icon name="image" size={14} color={theme.colors.background.primary} />
                                    <Text style={styles.imageCounterText}>
                                        {deal.images.length}
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : deal.company_logo ? (
                        <Image
                            source={{ uri: deal.company_logo }}
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.heroPlaceholder}>
                            <Text style={styles.heroPlaceholderText}>
                                {deal.company_name?.charAt(0) || 'D'}
                            </Text>
                        </View>
                    )}
                    
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.heroGradient}
                    />
                    
                    {/* Discount Badge */}
                    <View style={[styles.discountBadge, {
                        backgroundColor: `${getDiscountColor(deal)}95`,
                    }]}>
                        <Text style={styles.discountText}>{getDiscountText(deal)}</Text>
                    </View>
                    
                    {/* Company Name */}
                    <View style={styles.companyBadge}>
                        <Text style={styles.companyText}>{deal.company_name}</Text>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.contentSection}>
                    {/* Title and Description */}
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>{deal.title}</Text>
                        <Text style={styles.description}>{deal.description}</Text>
                    </View>

                    {/* Info Cards */}
                    <View style={styles.infoCardsSection}>
                        <View style={styles.infoCard}>
                            <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.error[500]}15` }]}>
                                <Icon name="calendar" size={20} color={theme.colors.error[500]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('expiresOn')}</Text>
                                <Text style={styles.infoValue}>
                                    {formatDate(deal.end_date, i18n.language, {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.warning[500]}15` }]}>
                                <Icon name="mapPin" size={20} color={theme.colors.warning[500]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('location')}</Text>
                                <Text style={styles.infoValue}>{deal.location}</Text>
                            </View>
                        </View>

                        {deal.original_price > 0 && (
                            <View style={styles.infoCard}>
                                <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.success[500]}15` }]}>
                                    <Icon name="dollarSign" size={20} color={theme.colors.success[500]} />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>{t('originalPrice')}</Text>
                                    <Text style={styles.infoValue}>{deal.original_price} ج.م</Text>
                                </View>
                            </View>
                        )}

                        <View style={styles.infoCard}>
                            <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.primary[500]}15` }]}>
                                <Icon name="tag" size={20} color={theme.colors.primary[500]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('dealType')}</Text>
                                <Text style={styles.infoValue}>{getDiscountText(deal)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Additional Sections */}
                    {deal.terms_conditions && (
                        <View style={styles.additionalSection}>
                            <Text style={styles.sectionTitle}>{t('termsConditions')}</Text>
                            <View style={styles.sectionCard}>
                                <Text style={styles.sectionText}>{deal.terms_conditions}</Text>
                            </View>
                        </View>
                    )}

                    {deal.how_to_redeem && (
                        <View style={styles.additionalSection}>
                            <Text style={styles.sectionTitle}>{t('howToRedeem')}</Text>
                            <View style={styles.sectionCard}>
                                <Text style={styles.sectionText}>{deal.how_to_redeem}</Text>
                            </View>
                        </View>
                    )}

                    {/* Contact Info */}
                    {deal.contact_info && (
                        <View style={styles.contactSection}>
                            <Text style={styles.sectionTitle}>{t('contactInfo')}</Text>
                            {deal.contact_info.phone && (
                                <TouchableOpacity style={styles.contactCard}>
                                    <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.success[500]}15` }]}>
                                        <Icon name="phone" size={20} color={theme.colors.success[500]} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>{t('phone')}</Text>
                                        <Text style={styles.infoValue}>{deal.contact_info.phone}</Text>
                                    </View>
                                    <Icon name="externalLink" size={20} color={theme.colors.text.tertiary} />
                                </TouchableOpacity>
                            )}
                            {deal.contact_info.email && (
                                <TouchableOpacity style={styles.contactCard}>
                                    <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.primary[500]}15` }]}>
                                        <Icon name="mail" size={20} color={theme.colors.primary[500]} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>{t('email')}</Text>
                                        <Text style={styles.infoValue}>{deal.contact_info.email}</Text>
                                    </View>
                                    <Icon name="externalLink" size={20} color={theme.colors.text.tertiary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Action Button */}
            <View style={styles.actionSection}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: getDiscountColor(deal) }]}
                >
                    <Icon name="gift" size={20} color={theme.colors.background.primary} />
                    <Text style={styles.actionButtonText}>{t('useDeal')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.error[500],
        fontFamily: theme.typography.fonts.medium,
    },
    scrollView: {
        flex: 1,
    },
    
    // Hero Section
    heroImageContainer: {
        width: '100%',
        height: 280,
        position: 'relative',
    },
    heroScrollView: {
        width: '100%',
        height: '100%',
    },
    heroImageWrapper: {
        width: Dimensions.get('window').width,
        height: 280,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.success[500],
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroPlaceholderText: {
        fontSize: 64,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.background.primary,
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
    leftArrow: {
        position: 'absolute',
        left: 16,
        top: '50%',
        marginTop: -20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightArrow: {
        position: 'absolute',
        right: 16,
        top: '50%',
        marginTop: -20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageCounter: {
        position: 'absolute',
        top: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[2],
        borderRadius: theme.borderRadius.full,
    },
    imageCounterText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.background.primary,
        marginLeft: theme.spacing[1],
    },
    discountBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[2],
        borderRadius: theme.borderRadius.full,
    },
    discountText: {
        fontSize: theme.typography.sizes.lg,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.background.primary,
    },
    companyBadge: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[2],
        borderRadius: theme.borderRadius.full,
    },
    companyText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
    },
    
    // Content Section
    contentSection: {
        flex: 1,
        backgroundColor: theme.colors.background.primary,
    },
    headerSection: {
        padding: theme.spacing[6],
        paddingBottom: theme.spacing[4],
    },
    title: {
        fontSize: theme.typography.sizes['3xl'],
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
        lineHeight: 40,
        marginBottom: theme.spacing[4],
    },
    description: {
        fontSize: theme.typography.sizes.lg,
        fontFamily: theme.typography.fonts.regular,
        color: theme.colors.text.secondary,
        lineHeight: 28,
    },
    
    // Info Cards
    infoCardsSection: {
        paddingHorizontal: theme.spacing[6],
        gap: theme.spacing[3],
        marginBottom: theme.spacing[6],
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[4],
        borderRadius: theme.borderRadius.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing[4],
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.text.tertiary,
        marginBottom: theme.spacing[1],
    },
    infoValue: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.semibold,
        color: theme.colors.text.primary,
    },
    
    // Additional Sections
    additionalSection: {
        paddingHorizontal: theme.spacing[6],
        marginBottom: theme.spacing[6],
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.xl,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[4],
    },
    sectionCard: {
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[4],
        borderRadius: theme.borderRadius.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionText: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.regular,
        color: theme.colors.text.secondary,
        lineHeight: 24,
    },
    
    // Contact Section
    contactSection: {
        paddingHorizontal: theme.spacing[6],
        marginBottom: theme.spacing[6],
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[4],
        borderRadius: theme.borderRadius.xl,
        marginBottom: theme.spacing[3],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    
    // Action Section
    actionSection: {
        padding: theme.spacing[6],
        paddingTop: theme.spacing[4],
        backgroundColor: theme.colors.background.primary,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border.light,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing[4],
        borderRadius: theme.borderRadius.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        fontSize: theme.typography.sizes.lg,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.background.primary,
        marginLeft: theme.spacing[2],
    },
});

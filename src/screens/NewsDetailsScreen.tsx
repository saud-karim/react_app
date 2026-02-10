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
import { Video, ResizeMode } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { newsService } from '../api/newsService';
import { News } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatDateWithWeekday } from '../utils/dateUtils';
import { AppHeader } from '../components/navigation/AppHeader';
import { theme } from '../theme';
import { Icon } from '../components/icons/Icon';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'NewsDetails'>;

export const NewsDetailsScreen: React.FC<Props> = ({ route }) => {
    const { t, i18n } = useTranslation();
    const { newsId } = route.params;
    const [news, setNews] = useState<News | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState<number | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scrollViewRef = React.useRef<ScrollView>(null);

    useEffect(() => {
        loadNews();
    }, [newsId]);

    const loadNews = async () => {
        try {
            const response = await newsService.getNewsDetails(newsId);
            if (response.success) {
                setNews(response.data.news);
            }
        } catch (error) {
            console.error('Error loading news:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return formatDateWithWeekday(dateString, i18n.language);
    };

    const handleScrollLeft = () => {
        if (currentImageIndex > 0 && scrollViewRef.current) {
            const newIndex = currentImageIndex - 1;
            scrollViewRef.current.scrollTo({ x: newIndex * Dimensions.get('window').width, animated: true });
            setCurrentImageIndex(newIndex);
        }
    };

    const handleScrollRight = () => {
        if (news && currentImageIndex < news.images.length - 1 && scrollViewRef.current) {
            const newIndex = currentImageIndex + 1;
            scrollViewRef.current.scrollTo({ x: newIndex * Dimensions.get('window').width, animated: true });
            setCurrentImageIndex(newIndex);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.warning[500]} />
            </View>
        );
    }

    if (!news) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>{t('error')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader 
                title={t('newsDetails')}
                showBackButton={true}
                showNotifications={false}
                showMenu={false}
            />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Image Section with Horizontal Scroll */}
                {news.images && news.images.length > 0 && (
                    <View style={styles.heroImageContainer}>
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
                            {news.images.map((image, index) => (
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
                        {news.images.length > 1 && (
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
                                {currentImageIndex < news.images.length - 1 && (
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
                        {news.images.length > 1 && (
                            <View style={styles.imageCounter}>
                                <Icon name="image" size={14} color={theme.colors.background.primary} />
                                <Text style={styles.imageCounterText}>
                                    {news.images.length}
                                </Text>
                            </View>
                        )}
                        
                        {/* Category Badge */}
                        <View style={[styles.categoryBadge, {
                            backgroundColor: `${theme.colors.warning[500]}95`,
                        }]}>
                            <Text style={styles.categoryText}>{news.category?.name}</Text>
                        </View>
                        
                        {/* Views Badge */}
                        <View style={styles.viewsBadge}>
                            <Icon name="eye" size={16} color={theme.colors.text.primary} />
                            <Text style={styles.viewsText}>{news.views_count}</Text>
                        </View>
                    </View>
                )}

                {/* Content Section */}
                <View style={styles.contentSection}>
                    {/* Title and Description */}
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>{news.title}</Text>
                        <Text style={styles.description}>{news.description}</Text>
                    </View>

                    {/* Info Cards */}
                    <View style={styles.infoCardsSection}>
                        <View style={styles.infoCard}>
                            <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.warning[500]}15` }]}>
                                <Icon name="calendar" size={20} color={theme.colors.warning[500]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('publishDate')}</Text>
                                <Text style={styles.infoValue}>
                                    {formatDate(news.publish_date)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.primary[500]}15` }]}>
                                <Icon name="tag" size={20} color={theme.colors.primary[500]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('category')}</Text>
                                <Text style={styles.infoValue}>{news.category?.name || t('general')}</Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.success[500]}15` }]}>
                                <Icon name="eye" size={20} color={theme.colors.success[500]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('views')}</Text>
                                <Text style={styles.infoValue}>{news.views_count}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Media Section */}
                    {news.videos && news.videos.length > 0 && (
                        <View style={styles.mediaSection}>
                            {/* Videos */}
                            <View style={styles.mediaSubSection}>
                                <Text style={styles.sectionTitle}>{t('videos')}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
                                    {news.videos.map((video) => (
                                        <TouchableOpacity key={video.id} style={styles.mediaItem}>
                                            <View style={styles.videoPlaceholder}>
                                                <Icon name="play" size={32} color={theme.colors.background.primary} />
                                            </View>
                                            {video.title && (
                                                <Text style={styles.videoTitle} numberOfLines={2}>
                                                    {video.title}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    )}

                    {/* Documents Section */}
                    {news.documents && news.documents.length > 0 && (
                        <View style={styles.documentsSection}>
                            <Text style={styles.sectionTitle}>{t('attachments')}</Text>
                            {news.documents.map((doc) => (
                                <TouchableOpacity key={doc.id} style={styles.documentCard}>
                                    <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.error[500]}15` }]}>
                                        <Icon name="fileText" size={20} color={theme.colors.error[500]} />
                                    </View>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoValue}>{doc.title}</Text>
                                        <Text style={styles.infoLabel}>{doc.size}</Text>
                                    </View>
                                    <Icon name="download" size={20} color={theme.colors.text.tertiary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
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
        width: Dimensions.get('window').width,
        height: '100%',
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
    categoryBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[2],
        borderRadius: theme.borderRadius.full,
    },
    categoryText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.background.primary,
    },
    viewsBadge: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[2],
        borderRadius: theme.borderRadius.full,
    },
    viewsText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
        marginLeft: theme.spacing[1],
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
        marginBottom: theme.spacing[6],
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.secondary,
        marginBottom: theme.spacing[3],
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
    
    // Media Section
    mediaSection: {
        marginBottom: theme.spacing[6],
    },
    mediaSubSection: {
        marginBottom: theme.spacing[6],
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.xl,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[4],
        paddingHorizontal: theme.spacing[6],
    },
    mediaScroll: {
        paddingLeft: theme.spacing[6],
    },
    mediaItem: {
        marginRight: theme.spacing[4],
        borderRadius: theme.borderRadius.xl,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    mediaImage: {
        width: 200,
        height: 140,
        borderRadius: theme.borderRadius.xl,
    },
    videoPlaceholder: {
        width: 200,
        height: 140,
        backgroundColor: theme.colors.text.secondary,
        borderRadius: theme.borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoTitle: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: theme.spacing[2],
        paddingHorizontal: theme.spacing[2],
    },
    
    // Documents Section
    documentsSection: {
        paddingHorizontal: theme.spacing[6],
        marginBottom: theme.spacing[6],
    },
    documentCard: {
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
});

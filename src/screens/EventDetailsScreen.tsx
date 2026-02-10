    import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Image,
    Dimensions,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { useTranslation } from 'react-i18next';
import { eventsService } from '../api/eventsService';
import { Event } from '../types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Icon } from '../components/icons/Icon';
import { AppHeader } from '../components/navigation/AppHeader';
import { theme } from '../theme';
import { formatDateWithWeekday } from '../utils/dateUtils';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetails'>;

export const EventDetailsScreen: React.FC<Props> = ({ route }) => {
    const { t, i18n } = useTranslation();
    const { eventId } = route.params;
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [playingVideo, setPlayingVideo] = useState<number | null>(null);
    const [fullscreenVideo, setFullscreenVideo] = useState<number | null>(null);
    const [videoStatus, setVideoStatus] = useState<any>({});
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const scrollViewRef = React.useRef<ScrollView>(null);
    const videoRef = React.useRef<Video>(null);

    useEffect(() => {
        loadEvent();
    }, [eventId]);

    useEffect(() => {
        if (playingVideo !== null) {
            setIsVideoPlaying(true);
        } else {
            setIsVideoPlaying(false);
        }
    }, [playingVideo]);

    const loadEvent = async () => {
        try {
            const response = await eventsService.getEventDetails(eventId);
            if (response.success) {
                setEvent(response.data.event);
            }
        } catch (error) {
            console.error('Error loading event:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!event) return;

        setIsRegistering(true);
        try {
            if (event.is_registered) {
                const response = await eventsService.unregisterFromEvent(eventId);
                if (response.success) {
                    // Reload event to get updated registration status
                    await loadEvent();
                    Alert.alert('', t('unregistrationSuccess'));
                } else {
                    Alert.alert(t('error'), response.message);
                }
            } else {
                const response = await eventsService.registerForEvent(eventId);
                if (response.success) {
                    // Reload event to get updated registration status
                    await loadEvent();
                    Alert.alert('', t('registrationSuccess'));
                } else {
                    Alert.alert(t('error'), response.message);
                }
            }
        } catch (error: any) {
            let errorMessage = t('error');
            
            // Handle specific error messages
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            // Show debug information in development
            if (error.response?.data?.debug && __DEV__) {
                console.log('Registration/Unregistration Debug Info:', error.response.data.debug);
                console.log('Full Error Response:', error.response.data);
            }
            
            // Handle specific error cases
            if (errorMessage.includes('already registered') || errorMessage.includes('مسجل في هذه الفعالية')) {
                errorMessage = i18n.language === 'ar' 
                    ? 'أنت مسجل في هذه الفعالية مسبقاً'
                    : 'You are already registered for this event';
                // If user is already registered, reload event to update UI
                await loadEvent();
            } else if (errorMessage.includes('not allowed') || errorMessage.includes('غير مسموح')) {
                errorMessage = i18n.language === 'ar' 
                    ? 'غير مسموح لك بالتسجيل في هذه الفعالية'
                    : 'You are not allowed to register for this event';
            } else if (errorMessage.includes('24 hours') || errorMessage.includes('24 ساعة') || 
                errorMessage.includes('1 hour') || errorMessage.includes('ساعة واحدة')) {
                errorMessage = i18n.language === 'ar' 
                    ? 'لا يمكن إلغاء التسجيل في الوقت الحالي'
                    : 'Cannot unregister at this time';
            }
            
            // In development, show more detailed error information
            if (__DEV__ && error.response?.data?.debug) {
                const debug = error.response.data.debug;
                errorMessage += `\n\nDebug Info:\nReason: ${debug.reason || 'Unknown'}\nEvent Published: ${debug.is_published}\nVisibility: ${debug.visibility}`;
            }
            
            Alert.alert(t('error'), errorMessage);
        } finally {
            setIsRegistering(false);
        }
    };

    const formatDate = (dateString: string) => {
        return formatDateWithWeekday(dateString, i18n.language);
    };

    const handleScrollLeft = () => {
        if (currentImageIndex > 0 && scrollViewRef.current) {
            const newIndex = currentImageIndex - 1;
            scrollViewRef.current.scrollTo({ x: newIndex * width, animated: true });
            setCurrentImageIndex(newIndex);
        }
    };

    const handleScrollRight = () => {
        if (event && currentImageIndex < (event.images.length + event.videos.length) - 1 && scrollViewRef.current) {
            const newIndex = currentImageIndex + 1;
            scrollViewRef.current.scrollTo({ x: newIndex * width, animated: true });
            setCurrentImageIndex(newIndex);
        }
    };

    const handlePlayPause = async () => {
        if (videoRef.current) {
            if (isVideoPlaying) {
                await videoRef.current.pauseAsync();
                setIsVideoPlaying(false);
            } else {
                await videoRef.current.playAsync();
                setIsVideoPlaying(true);
            }
        }
    };

    const handleSeek = async (position: number) => {
        console.log('Seek pressed!', position);
        if (videoRef.current && videoStatus.isLoaded && !isNaN(position) && position >= 0 && position <= 100) {
            const seekPosition = (position / 100) * (videoStatus.durationMillis || 0);
            console.log('Seeking to:', seekPosition);
            await videoRef.current.setPositionAsync(seekPosition);
        }
    };

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    if (!event) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>{t('error')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <AppHeader 
                title={t('eventDetails')}
                showBackButton={true}
                showNotifications={false}
                showMenu={false}
            />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Media Section with Horizontal Scroll (Images + Videos) */}
                {(event.images.length > 0 || event.videos.length > 0) && (
                    <View style={styles.heroImageContainer}>
                        <ScrollView 
                            ref={scrollViewRef}
                            horizontal 
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            style={styles.heroScrollView}
                            onScroll={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                                setCurrentImageIndex(index);
                            }}
                            scrollEventThrottle={16}
                        >
                            {/* Render Images */}
                            {event.images.map((image, index) => (
                                <View key={`image-${image.id}`} style={styles.heroImageWrapper}>
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
                            
                            {/* Render Videos */}
                            {event.videos.map((video) => (
                                <View key={`video-${video.id}`} style={styles.heroImageWrapper}>
                                    {playingVideo === video.id ? (
                                        <>
                                            <Video
                                                ref={videoRef}
                                                source={{ uri: video.url }}
                                                style={styles.videoPlayer}
                                                resizeMode={ResizeMode.CONTAIN}
                                                shouldPlay={true}
                                                isLooping={false}
                                                onPlaybackStatusUpdate={(status) => {
                                                    setVideoStatus(status);
                                                    if (status.isLoaded) {
                                                        setIsVideoPlaying(status.isPlaying || false);
                                                        if (status.didJustFinish) {
                                                            setPlayingVideo(null);
                                                            setIsVideoPlaying(false);
                                                        }
                                                    }
                                                }}
                                            />
                                            
                                            {/* Custom Video Controls - Outside video container */}
                                            <View style={styles.videoControlsOverlay}>
                                                {/* Play/Pause Button */}
                                                <TouchableOpacity 
                                                    style={styles.playPauseButton}
                                                    onPress={handlePlayPause}
                                                    activeOpacity={0.7}
                                                >
                                                    <Icon 
                                                        name={isVideoPlaying ? "pause" : "play"} 
                                                        size={24} 
                                                        color={theme.colors.background.primary} 
                                                    />
                                                </TouchableOpacity>
                                                
                                                {/* Progress Bar */}
                                                {videoStatus.isLoaded && (
                                                    <View style={styles.progressContainer}>
                                                        <Text style={styles.timeText}>
                                                            {formatTime(videoStatus.positionMillis || 0)}
                                                        </Text>
                                                        <TouchableOpacity 
                                                            style={styles.progressBar}
                                                            onPress={(e) => {
                                                                const event = e.nativeEvent;
                                                                console.log('Progress bar pressed:', event);
                                                                
                                                                // Get the progress bar width from layout
                                                                e.currentTarget.measure((x, y, width, height, pageX, pageY) => {
                                                                    const touchX = event.pageX - pageX;
                                                                    const percentage = Math.max(0, Math.min(100, (touchX / width) * 100));
                                                                    console.log('Calculated percentage:', percentage);
                                                                    handleSeek(percentage);
                                                                });
                                                            }}
                                                            activeOpacity={0.7}
                                                        >
                                                            <View 
                                                                style={[
                                                                    styles.progressFill,
                                                                    { 
                                                                        width: `${((videoStatus.positionMillis || 0) / (videoStatus.durationMillis || 1)) * 100}%` 
                                                                    }
                                                                ]} 
                                                            />
                                                        </TouchableOpacity>
                                                        <Text style={styles.timeText}>
                                                            {formatTime(videoStatus.durationMillis || 0)}
                                                        </Text>
                                                    </View>
                                                )}
                                                
                                                {/* Fullscreen Button */}
                                                <TouchableOpacity 
                                                    style={styles.fullscreenButton}
                                                    onPress={() => setFullscreenVideo(video.id)}
                                                    activeOpacity={0.7}
                                                >
                                                    <Icon name="maximize" size={20} color={theme.colors.background.primary} />
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    ) : (
                                        <TouchableOpacity 
                                            style={styles.videoContainer}
                                            onPress={() => {
                                                setPlayingVideo(video.id);
                                                setIsVideoPlaying(true);
                                            }}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.videoPlaceholder}>
                                                <Icon name="play" size={48} color={theme.colors.background.primary} />
                                            </View>
                                            {video.title && (
                                                <View style={styles.videoTitleOverlay}>
                                                    <Text style={styles.videoTitleText} numberOfLines={2}>
                                                        {video.title}
                                                    </Text>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    <LinearGradient
                                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                                        style={styles.heroGradient}
                                    />
                                </View>
                            ))}
                        </ScrollView>
                        
                        {/* Navigation Arrows - Only show if more than 1 media item */}
                        {(event.images.length + event.videos.length) > 1 && (
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
                                {currentImageIndex < (event.images.length + event.videos.length) - 1 && (
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
                        
                        {/* Media Counter - Hide when video is playing */}
                        {(event.images.length + event.videos.length) > 1 && playingVideo === null && (
                            <View style={styles.imageCounter}>
                                <Icon name="image" size={14} color={theme.colors.background.primary} />
                                <Text style={styles.imageCounterText}>
                                    {event.images.length + event.videos.length}
                                </Text>
                            </View>
                        )}
                        
                        {/* Category Badge - Hide when video is playing */}
                        {playingVideo === null && (
                            <View style={[styles.categoryBadge, {
                                backgroundColor: `${theme.colors.primary[500]}95`,
                            }]}>
                                <Text style={styles.categoryText}>{event.category?.name}</Text>
                            </View>
                        )}
                        
                        {/* Registration Status - Hide when video is playing */}
                        {event.is_registered && playingVideo === null && (
                            <View style={styles.statusBadge}>
                                <Icon name="checkCircle" size={16} color={theme.colors.success[500]} />
                                <Text style={styles.statusText}>{t('registered')}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Content Section */}
                <View style={styles.contentSection}>
                    {/* Title and Description */}
                    <View style={styles.headerSection}>
                        <Text style={styles.title}>{event.title}</Text>
                        <Text style={styles.description}>{event.description}</Text>
                    </View>

                    {/* Info Cards */}
                    <View style={styles.infoCardsSection}>
                        <View style={styles.infoCard}>
                            <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.primary[500]}15` }]}>
                                <Icon name="calendar" size={20} color={theme.colors.primary[500]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('startDate')}</Text>
                                <Text style={styles.infoValue}>
                                    {formatDate(event.start_date)} - {event.start_time}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.success[500]}15` }]}>
                                <Icon name="clock" size={20} color={theme.colors.success[500]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('endDate')}</Text>
                                <Text style={styles.infoValue}>
                                    {formatDate(event.end_date)} - {event.end_time}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.warning[500]}15` }]}>
                                <Icon name="mapPin" size={20} color={theme.colors.warning[500]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('location')}</Text>
                                <Text style={styles.infoValue}>{event.location}</Text>
                            </View>
                        </View>

                        <View style={styles.infoCard}>
                            <View style={[styles.infoIconContainer, { backgroundColor: `${theme.colors.error[500]}15` }]}>
                                <Icon name="users" size={20} color={theme.colors.error[500]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('attendees')}</Text>
                                <Text style={styles.infoValue}>{event.current_attendees}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Media Section - Videos removed as they're now in hero section */}
                </View>
            </ScrollView>

            {/* Fullscreen Video Modal */}
            <Modal
                visible={fullscreenVideo !== null}
                animationType="fade"
                supportedOrientations={['portrait', 'landscape']}
                onRequestClose={() => setFullscreenVideo(null)}
            >
                <View style={styles.fullscreenContainer}>
                    {fullscreenVideo && event?.videos.find(v => v.id === fullscreenVideo) && (
                        <Video
                            source={{ uri: event.videos.find(v => v.id === fullscreenVideo)!.url }}
                            style={styles.fullscreenVideo}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            shouldPlay
                            onPlaybackStatusUpdate={(status) => {
                                if (status.isLoaded && status.didJustFinish) {
                                    setFullscreenVideo(null);
                                }
                            }}
                        />
                    )}
                    <TouchableOpacity 
                        style={styles.closeButton}
                        onPress={() => setFullscreenVideo(null)}
                        activeOpacity={0.7}
                    >
                        <Icon name="x" size={24} color={theme.colors.background.primary} />
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Action Button */}
            <View style={styles.actionSection}>
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        event.is_registered ? styles.unregisterButton : styles.registerButton,
                    ]}
                    onPress={handleRegister}
                    disabled={isRegistering}
                >
                    {isRegistering ? (
                        <ActivityIndicator color={theme.colors.background.primary} />
                    ) : (
                        <>
                            <Icon 
                                name={event.is_registered ? "userMinus" : "userPlus"} 
                                size={20} 
                                color={theme.colors.background.primary} 
                            />
                            <Text style={styles.actionButtonText}>
                                {event.is_registered ? t('unregisterFromEvent') : t('registerForEvent')}
                            </Text>
                        </>
                    )}
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
        width: width,
        height: 280,
        position: 'relative',
    },
    heroImage: {
        width: width,
        height: '100%',
    },
    videoContainer: {
        width: width,
        height: '100%',
        backgroundColor: theme.colors.text.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    videoPlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoPlayer: {
        width: width,
        height: 280,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    videoControlsOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
        zIndex: 2000,
    },
    videoPlayerContainer: {
        width: width,
        height: 280,
        position: 'relative',
    },
    videoControls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
        zIndex: 1000,
    },
    playPauseButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing[3],
    },
    progressContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: theme.spacing[3],
    },
    timeText: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.background.primary,
        fontFamily: theme.typography.fonts.medium,
        minWidth: 35,
        textAlign: 'center',
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 2,
        marginHorizontal: theme.spacing[2],
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary[500],
        borderRadius: 2,
    },
    fullscreenButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenVideo: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1001,
    },
    videoTitleOverlay: {
        position: 'absolute',
        bottom: 60,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[2],
        borderRadius: theme.borderRadius.lg,
    },
    videoTitleText: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.background.primary,
        textAlign: 'center',
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
    statusBadge: {
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
    statusText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.success[600],
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
    videoTitle: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginTop: theme.spacing[2],
        paddingHorizontal: theme.spacing[2],
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
    registerButton: {
        backgroundColor: theme.colors.primary[500],
    },
    unregisterButton: {
        backgroundColor: theme.colors.error[500],
    },
    actionButtonText: {
        fontSize: theme.typography.sizes.lg,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.background.primary,
        marginLeft: theme.spacing[2],
    },
});

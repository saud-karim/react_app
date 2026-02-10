import React, { useEffect, useRef } from 'react';
import { 
    View, 
    TouchableOpacity, 
    Text, 
    StyleSheet, 
    Animated, 
    Dimensions,
    Platform 
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../icons/Icon';
import { theme } from '../../theme';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 5;

export const AnimatedTabBar: React.FC<BottomTabBarProps> = ({ 
    state, 
    descriptors, 
    navigation 
}) => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    
    // Animation values
    const translateX = useRef(new Animated.Value(0)).current;
    const scaleValues = useRef(
        state.routes.map(() => new Animated.Value(1))
    ).current;
    const opacityValues = useRef(
        state.routes.map(() => new Animated.Value(0.6))
    ).current;
    const bounceValues = useRef(
        state.routes.map(() => new Animated.Value(0))
    ).current;

    // Update animations when active tab changes
    useEffect(() => {
        // Animate sliding indicator with spring
        Animated.spring(translateX, {
            toValue: state.index * TAB_WIDTH,
            useNativeDriver: true,
            tension: 120,
            friction: 8,
        }).start();

        // Animate tab scales and opacities
        scaleValues.forEach((scale, index) => {
            Animated.spring(scale, {
                toValue: state.index === index ? 1.1 : 1,
                useNativeDriver: true,
                tension: 200,
                friction: 8,
            }).start();
        });

        opacityValues.forEach((opacity, index) => {
            Animated.timing(opacity, {
                toValue: state.index === index ? 1 : 0.7,
                duration: 250,
                useNativeDriver: true,
            }).start();
        });

        // Bounce animation for active tab
        if (bounceValues[state.index]) {
            Animated.sequence([
                Animated.timing(bounceValues[state.index], {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(bounceValues[state.index], {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 200,
                    friction: 6,
                }),
            ]).start();
        }
    }, [state.index]);

    const getTabIcon = (routeName: string, isFocused: boolean) => {
        const color = isFocused ? '#FFFFFF' : theme.colors.text.secondary;
        
        switch (routeName) {
            case 'HomeTab':
                return <Icon name="home" size={22} color={color} />;
            case 'EventsTab':
                return <Icon name="calendar" size={22} color={color} />;
            case 'DealsTab':
                return <Icon name="tag" size={22} color={color} />;
            case 'NewsTab':
                return <Icon name="news" size={22} color={color} />;
            case 'ProfileTab':
                return <Icon name="user" size={22} color={color} />;
            default:
                return <Icon name="home" size={22} color={color} />;
        }
    };

    const getTabLabel = (routeName: string) => {
        switch (routeName) {
            case 'HomeTab':
                return t('home');
            case 'EventsTab':
                return t('events');
            case 'DealsTab':
                return t('deals');
            case 'NewsTab':
                return t('news');
            case 'ProfileTab':
                return t('profile');
            default:
                return routeName;
        }
    };

    const handleTabPress = (route: any, index: number) => {
        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
            // Add press animation with haptic feedback
            Animated.sequence([
                Animated.timing(scaleValues[index], {
                    toValue: 0.85,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleValues[index], {
                    toValue: state.index === index ? 1.1 : 1,
                    useNativeDriver: true,
                    tension: 200,
                    friction: 6,
                }),
            ]).start();

            navigation.navigate(route.name);
        }
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
            {/* Main background with blur effect */}
            <View style={styles.backgroundContainer}>
                <LinearGradient
                    colors={[
                        'rgba(255,255,255,0.95)', 
                        'rgba(248,250,252,0.98)',
                        'rgba(255,255,255,0.95)'
                    ]}
                    style={styles.background}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                
                {/* Subtle inner shadow effect */}
                <View style={styles.innerShadow} />
            </View>
            
            {/* Animated floating indicator */}
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            >
                <LinearGradient
                    colors={[
                        theme.colors.primary[500], 
                        theme.colors.primary[600],
                        theme.colors.primary[700]
                    ]}
                    style={styles.indicatorGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                
                {/* Glow effect */}
                <View style={styles.indicatorGlow} />
            </Animated.View>

            {/* Tab buttons */}
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        onPress={() => handleTabPress(route, index)}
                        style={styles.tab}
                        activeOpacity={0.9}
                    >
                        <Animated.View
                            style={[
                                styles.tabContent,
                                {
                                    transform: [
                                        { scale: scaleValues[index] },
                                        { 
                                            translateY: bounceValues[index].interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, -4],
                                            })
                                        }
                                    ],
                                    opacity: opacityValues[index],
                                },
                            ]}
                        >
                            <View style={[
                                styles.iconContainer,
                                isFocused && styles.iconContainerFocused
                            ]}>
                                {getTabIcon(route.name, isFocused)}
                                
                                {/* Ripple effect for active tab */}
                                {isFocused && (
                                    <Animated.View 
                                        style={[
                                            styles.ripple,
                                            {
                                                transform: [{
                                                    scale: bounceValues[index].interpolate({
                                                        inputRange: [0, 1],
                                                        outputRange: [0, 1.5],
                                                    })
                                                }],
                                                opacity: bounceValues[index].interpolate({
                                                    inputRange: [0, 0.5, 1],
                                                    outputRange: [0, 0.3, 0],
                                                })
                                            }
                                        ]}
                                    />
                                )}
                            </View>
                            
                            <Text style={[
                                styles.tabLabel,
                                { 
                                    color: isFocused 
                                        ? '#FFFFFF' 
                                        : theme.colors.text.secondary,
                                    fontWeight: isFocused ? '600' : '500',
                                }
                            ]}>
                                {getTabLabel(route.name)}
                            </Text>
                        </Animated.View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 85,
        position: 'relative',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 28,
        overflow: 'visible',
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 28,
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 15 },
                shadowOpacity: 0.12,
                shadowRadius: 25,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    background: {
        flex: 1,
        borderRadius: 28,
    },
    innerShadow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    indicator: {
        position: 'absolute',
        top: 10,
        left: 10,
        width: TAB_WIDTH - 20,
        height: 65,
        borderRadius: 22,
        zIndex: 1,
        overflow: 'hidden',
    },
    indicatorGradient: {
        flex: 1,
        borderRadius: 22,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.primary[500],
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    indicatorGlow: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 24,
        backgroundColor: theme.colors.primary[400],
        opacity: 0.2,
        zIndex: -1,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        paddingVertical: 8,
    },
    tabContent: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 4,
    },
    iconContainer: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
        borderRadius: 18,
        position: 'relative',
    },
    iconContainerFocused: {
        // Additional styles for focused state if needed
    },
    ripple: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.3)',
        top: -7,
        left: -7,
    },
    tabLabel: {
        fontSize: 10,
        fontFamily: theme.typography.fonts.medium,
        textAlign: 'center',
        letterSpacing: 0.3,
        lineHeight: 12,
    },
});
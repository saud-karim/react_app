import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../icons/Icon';
import { theme } from '../../theme';

export const SimpleTabBar: React.FC<BottomTabBarProps> = ({ 
    state, 
    descriptors, 
    navigation 
}) => {
    const insets = useSafeAreaInsets();
    const { t } = useTranslation();
    
    // Create animated values for each tab
    const animatedValues = useRef(
        state.routes.map(() => new Animated.Value(0))
    ).current;

    useEffect(() => {
        // Animate tabs when active state changes
        state.routes.forEach((route, index) => {
            const isFocused = state.index === index;
            Animated.spring(animatedValues[index], {
                toValue: isFocused ? 1 : 0,
                useNativeDriver: false,
                friction: 8,
                tension: 40,
            }).start();
        });
    }, [state.index]);

    const getTabIcon = (routeName: string) => {
        switch (routeName) {
            case 'HomeTab':
                return 'home';
            case 'EventsTab':
                return 'calendar';
            case 'DealsTab':
                return 'tag';
            case 'NewsTab':
                return 'news';
            case 'ProfileTab':
                return 'user';
            default:
                return 'home';
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

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.tabBarWrapper}>
                <LinearGradient
                    colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']}
                    style={styles.tabBarGradient}
                >
                    <View style={styles.tabsContainer}>
                        {state.routes.map((route, index) => {
                            const { options } = descriptors[route.key];
                            const isFocused = state.index === index;

                            const onPress = () => {
                                const event = navigation.emit({
                                    type: 'tabPress',
                                    target: route.key,
                                    canPreventDefault: true,
                                });

                                if (!isFocused && !event.defaultPrevented) {
                                    navigation.navigate(route.name);
                                }
                            };

                            // Animated styles
                            const scale = animatedValues[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.9, 1],
                            });

                            const iconScale = animatedValues[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.1],
                            });

                            const opacity = animatedValues[index].interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.6, 1],
                            });

                            return (
                                <TouchableOpacity
                                    key={route.key}
                                    accessibilityRole="button"
                                    accessibilityState={isFocused ? { selected: true } : {}}
                                    accessibilityLabel={options.tabBarAccessibilityLabel}
                                    onPress={onPress}
                                    style={styles.tab}
                                    activeOpacity={0.7}
                                >
                                    <Animated.View style={{ transform: [{ scale }], opacity }}>
                                        {isFocused ? (
                                            <LinearGradient
                                                colors={[theme.colors.primary[500], theme.colors.primary[600]]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                                style={styles.activeTabContent}
                                            >
                                                <Animated.View style={{ transform: [{ scale: iconScale }] }}>
                                                    <Icon 
                                                        name={getTabIcon(route.name)} 
                                                        size={24} 
                                                        color={theme.colors.background.primary} 
                                                    />
                                                </Animated.View>
                                                <Text style={styles.activeTabLabel}>
                                                    {getTabLabel(route.name)}
                                                </Text>
                                            </LinearGradient>
                                        ) : (
                                            <View style={styles.inactiveTabContent}>
                                                <Icon 
                                                    name={getTabIcon(route.name)} 
                                                    size={24} 
                                                    color={theme.colors.text.tertiary} 
                                                />
                                                <Text style={styles.inactiveTabLabel}>
                                                    {getTabLabel(route.name)}
                                                </Text>
                                            </View>
                                        )}
                                    </Animated.View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        paddingHorizontal: theme.spacing[3],
        paddingBottom: theme.spacing[2],
    },
    tabBarWrapper: {
        borderRadius: theme.borderRadius['2xl'],
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 20,
    },
    tabBarGradient: {
        borderRadius: theme.borderRadius['2xl'],
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[2],
    },
    tab: {
        flex: 1,
        alignItems: 'center',
    },
    activeTabContent: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing[3],
        paddingHorizontal: theme.spacing[4],
        borderRadius: theme.borderRadius['2xl'],
        minHeight: 64,
        minWidth: 70,
        shadowColor: theme.colors.primary[500],
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    activeTabLabel: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.background.primary,
        marginTop: theme.spacing[1],
    },
    inactiveTabContent: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing[3],
        paddingHorizontal: theme.spacing[3],
        minHeight: 64,
    },
    inactiveTabLabel: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.text.tertiary,
        marginTop: theme.spacing[1],
    },
});
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../icons/Icon';
import { theme } from '../../theme';

interface AppHeaderProps {
    title?: string;
    showBackButton?: boolean;
    showNotifications?: boolean;
    showMenu?: boolean;
    backgroundColor?: string;
    gradient?: boolean;
    onMenuPress?: () => void;
    navigation?: any; // Add navigation prop
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showBackButton = false,
    showNotifications = true,
    showMenu = true,
    backgroundColor,
    gradient = true,
    onMenuPress,
    navigation: propNavigation,
}) => {
    const { t } = useTranslation();
    const hookNavigation = useNavigation();
    const navigation = propNavigation || hookNavigation;

    const handleNotificationsPress = () => {
        navigation.navigate('Notifications' as never);
    };

    const handleMenuPress = () => {
        if (onMenuPress) {
            onMenuPress();
        }
    };

    const handleBackPress = () => {
        navigation.goBack();
    };

    const renderContent = () => (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <View style={styles.header}>
                {/* Left Section */}
                <View style={styles.leftSection}>
                    {showBackButton ? (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleBackPress}
                            activeOpacity={0.7}
                        >
                            <Icon name="chevronLeft" size={24} color={theme.colors.background.primary} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.logoSection}>
                            <Text style={styles.logoText}>إدارة</Text>
                            <Text style={styles.logoSubtext}>EDARA</Text>
                        </View>
                    )}
                </View>

                {/* Center Section */}
                <View style={styles.centerSection}>
                    {title && (
                        <Text style={styles.titleText} numberOfLines={1}>
                            {title}
                        </Text>
                    )}
                </View>

                {/* Right Section */}
                <View style={styles.rightSection}>
                    {showNotifications && (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleNotificationsPress}
                            activeOpacity={0.7}
                        >
                            <Icon name="bell" size={22} color={theme.colors.background.primary} />
                            {/* Notification Badge */}
                            <View style={styles.notificationBadge}>
                                <Text style={styles.badgeText}>3</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    
                    {showMenu && (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleMenuPress}
                            activeOpacity={0.7}
                        >
                            <Icon name="menu" size={24} color={theme.colors.background.primary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );

    if (gradient) {
        return (
            <LinearGradient
                colors={[
                    backgroundColor || theme.colors.primary[600],
                    backgroundColor || theme.colors.primary[500],
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                {renderContent()}
            </LinearGradient>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: backgroundColor || theme.colors.primary[500] }]}>
            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: StatusBar.currentHeight || 0,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    safeArea: {
        backgroundColor: 'transparent',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
        minHeight: 60,
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    centerSection: {
        flex: 2,
        alignItems: 'center',
    },
    rightSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    logoSection: {
        alignItems: 'center',
    },
    logoText: {
        fontSize: theme.typography.sizes.xl,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.background.primary,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    logoSubtext: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.background.primary,
        opacity: 0.9,
        marginTop: -2,
    },
    titleText: {
        fontSize: theme.typography.sizes.lg,
        fontFamily: theme.typography.fonts.semibold,
        color: theme.colors.background.primary,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: theme.spacing[1],
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: theme.colors.error[500],
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.background.primary,
    },
    badgeText: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.background.primary,
    },
});
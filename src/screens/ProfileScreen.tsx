import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { changeLanguage } from '../localization/i18n';
import i18n from '../localization/i18n';
import { cacheService } from '../services/cacheService';
import { theme } from '../theme';
import { Icon } from '../components/icons/Icon';

export const ProfileScreen: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

    // Update current language when i18n language changes
    useEffect(() => {
        setCurrentLanguage(i18n.language);
        
        // Add listener for language changes
        const handleLanguageChanged = (lng: string) => {
            console.log('Language changed to:', lng);
            setCurrentLanguage(lng);
        };
        
        i18n.on('languageChanged', handleLanguageChanged);
        
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n.language]);

    const handleLanguageChange = async () => {
        console.log('Language button pressed');
        console.log('Current language:', i18n.language);
        
        // Simple toggle between Arabic and English
        const newLang = i18n.language === 'ar' ? 'en' : 'ar';
        console.log('Switching to:', newLang);
        
        try {
            // Change i18n language
            await i18n.changeLanguage(newLang);
            console.log('i18n language changed to:', i18n.language);
            
            // Save to storage for API calls
            await changeLanguage(newLang);
            console.log('Language saved to storage');
            
            // Update local state
            setCurrentLanguage(newLang);
            
            // Clear cache to force reload with new language
            // This will make API calls use the new language
            console.log('Clearing cache to reload content with new language...');
            await cacheService.clear();
            console.log('Cache cleared successfully');
            
            // Force reload of current screen data
            // You can add navigation refresh here if needed
            console.log('Language change completed. Content will reload with new language on next API calls.');
            
        } catch (error) {
            console.error('Error changing language:', error);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            t('logout'),
            t('logoutConfirmation'),
            [
                { text: t('cancel'), style: 'cancel' },
                { 
                    text: t('logout'), 
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoading(true);
                        await logout();
                        setIsLoading(false);
                    }
                }
            ]
        );
    };

    const stats = [
        { label: t('registeredEvents'), value: '12', icon: 'calendar', color: theme.colors.primary[500] },
        { label: t('usedDeals'), value: '8', icon: 'gift', color: theme.colors.success[500] },
        { label: t('newsRead'), value: '24', icon: 'news', color: theme.colors.warning[500] },
    ];

    const menuItems = [
        { 
            id: 'language', 
            label: t('language'), 
            icon: 'globe', 
            value: currentLanguage === 'ar' ? 'العربية' : 'English',
            onPress: handleLanguageChange
        },
        { 
            id: 'notifications', 
            label: t('notifications'), 
            icon: 'bell', 
            value: t('enabled'),
            onPress: () => {
                console.log('Notifications pressed');
                Alert.alert('Test', 'Notifications button works!');
            }
        },
        { 
            id: 'privacy', 
            label: t('privacy'), 
            icon: 'lock', 
            value: undefined,
            onPress: () => {
                console.log('Privacy pressed');
                Alert.alert('Test', 'Privacy button works!');
            }
        },
        { 
            id: 'help', 
            label: t('help'), 
            icon: 'helpCircle', 
            value: undefined,
            onPress: () => {
                console.log('Help pressed');
                Alert.alert('Test', 'Help button works!');
            }
        },
    ];

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary[500]} />
                <Text style={styles.loadingText}>{t('loading')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header with Gradient */}
                <LinearGradient
                    colors={[theme.colors.primary[500], theme.colors.primary[700]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <View style={styles.profileContent}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            activeOpacity={0.8}
                        >
                            {user?.avatar ? (
                                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Icon name="user" size={40} color={theme.colors.primary[400]} />
                                </View>
                            )}
                            <View style={styles.avatarBadge}>
                                <Icon name="camera" size={16} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.userName}>{user?.name}</Text>
                        <Text style={styles.userEmail}>{user?.email}</Text>

                        <View style={styles.statusBadge}>
                            <Icon 
                                name={user?.status === 'active' ? 'check' : 'clock'} 
                                size={12} 
                                color="#FFFFFF" 
                            />
                            <Text style={styles.statusText}>
                                {user?.status === 'active' ? t('active') : t('pending')}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                {/* Stats Cards */}
                <View style={styles.statsContainer}>
                    {stats.map((stat) => (
                        <View key={stat.label} style={styles.statCard}>
                            <LinearGradient
                                colors={[`${stat.color}15`, `${stat.color}05`]}
                                style={styles.statCardGradient}
                            >
                                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                                    <Icon name={stat.icon} size={20} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel} numberOfLines={2}>{stat.label}</Text>
                            </LinearGradient>
                        </View>
                    ))}
                </View>

                {/* User Info Card */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="user" size={20} color={theme.colors.primary[600]} />
                        <Text style={styles.sectionTitle}>{t('personalInfo')}</Text>
                    </View>
                    
                    <View style={styles.infoCard}>
                        <View style={styles.infoItem}>
                            <View style={styles.infoIconContainer}>
                                <Icon name="idCard" size={16} color={theme.colors.primary[600]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('employeeId')}</Text>
                                <Text style={styles.infoValue}>{user?.employee_id || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIconContainer}>
                                <Icon name="phone" size={16} color={theme.colors.success[600]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('phone')}</Text>
                                <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIconContainer}>
                                <Icon name="mail" size={16} color={theme.colors.warning[600]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('email')}</Text>
                                <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <View style={styles.infoIconContainer}>
                                <Icon name="calendar" size={16} color={theme.colors.error[500]} />
                            </View>
                            <View style={styles.infoContent}>
                                <Text style={styles.infoLabel}>{t('joinDate')}</Text>
                                <Text style={styles.infoValue}>
                                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('ar') : 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Settings Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Icon name="settings" size={20} color={theme.colors.primary[600]} />
                        <Text style={styles.sectionTitle}>{t('settings')}</Text>
                    </View>
                    
                    <View style={styles.menuCard}>
                        {menuItems.map((item, index) => (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.menuItem,
                                    index !== menuItems.length - 1 && styles.menuItemBorder
                                ]}
                                onPress={item.onPress}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={styles.menuIconContainer}>
                                        <Icon name={item.icon} size={18} color={theme.colors.text.secondary} />
                                    </View>
                                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                                </View>
                                <View style={styles.menuItemRight}>
                                    {item.value && <Text style={styles.menuItemValue}>{item.value}</Text>}
                                    <Icon name="chevronLeft" size={16} color={theme.colors.text.tertiary} />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Logout Button */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <Icon name="logOut" size={20} color={theme.colors.error[600]} />
                        <Text style={styles.logoutText}>{t('logout')}</Text>
                    </TouchableOpacity>
                </View>

                {/* App Version */}
                <Text style={styles.version}>{t('versionInfo')}</Text>
            </ScrollView>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: theme.spacing[8],
    },
    header: {
        paddingTop: theme.spacing[12],
        paddingBottom: theme.spacing[8],
        paddingHorizontal: theme.spacing[6],
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    profileContent: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        overflow: 'hidden',
        marginBottom: theme.spacing[4],
        position: 'relative',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: theme.colors.primary[600],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: theme.typography.sizes['3xl'],
        fontFamily: theme.typography.fonts.bold,
        color: '#FFFFFF',
        marginBottom: theme.spacing[1],
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    userEmail: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.regular,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: theme.spacing[4],
        textAlign: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[1],
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[2],
        borderRadius: theme.borderRadius.full,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    statusText: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.semibold,
        color: '#FFFFFF',
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing[6],
        marginTop: -theme.spacing[6],
        marginBottom: theme.spacing[6],
        gap: theme.spacing[3],
    },
    statCard: {
        flex: 1,
    },
    statCardGradient: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: theme.spacing[4],
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing[2],
    },
    statValue: {
        fontSize: theme.typography.sizes['2xl'],
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
        marginBottom: theme.spacing[1],
    },
    statLabel: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.text.secondary,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: theme.spacing[6],
        marginBottom: theme.spacing[6],
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[2],
        marginBottom: theme.spacing[4],
    },
    sectionTitle: {
        fontSize: theme.typography.sizes.lg,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.text.primary,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: theme.spacing[4],
        gap: theme.spacing[4],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[3],
    },
    infoIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.text.tertiary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.semibold,
        color: theme.colors.text.primary,
    },
    menuCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[4],
    },
    menuItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.background.tertiary,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: theme.spacing[3],
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: theme.colors.background.tertiary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItemLabel: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.medium,
        color: theme.colors.text.primary,
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[2],
    },
    menuItemValue: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.regular,
        color: theme.colors.text.secondary,
    },
    logoutSection: {
        paddingHorizontal: theme.spacing[6],
        marginBottom: theme.spacing[6],
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing[2],
        backgroundColor: '#FFFFFF',
        paddingVertical: theme.spacing[4],
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: theme.colors.error[500],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    logoutText: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.semibold,
        color: theme.colors.error[600],
    },
    version: {
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.regular,
        color: theme.colors.text.tertiary,
        textAlign: 'center',
        marginBottom: theme.spacing[4],
    },
});
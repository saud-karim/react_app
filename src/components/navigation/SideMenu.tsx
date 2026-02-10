import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
    Image,
    ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Icon } from '../icons/Icon';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75;

interface SideMenuProps {
    visible: boolean;
    onClose: () => void;
    onNavigate: (screen: string) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ visible, onClose, onNavigate }) => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const slideAnim = React.useRef(new Animated.Value(-MENU_WIDTH)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -MENU_WIDTH,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const handleNavigate = (screen: string) => {
        onClose();
        setTimeout(() => {
            onNavigate(screen);
        }, 300);
    };

    const handleLogout = async () => {
        onClose();
        setTimeout(async () => {
            await logout();
        }, 300);
    };

    const menuItems = [
        { id: 'profile', icon: 'user', label: t('profile'), screen: 'ProfileTab' },
        { id: 'chatbot', icon: 'messageCircle', label: t('chatbot'), screen: 'Chatbot' },
        { id: 'notifications', icon: 'bell', label: t('notifications'), screen: 'Notifications' },
        { id: 'settings', icon: 'settings', label: t('settings'), screen: 'Settings' },
        { id: 'language', icon: 'globe', label: t('language'), screen: 'Language' },
        { id: 'about', icon: 'info', label: t('about'), screen: 'About' },
        { id: 'help', icon: 'helpCircle', label: t('help'), screen: 'Help' },
    ];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        styles.menuContainer,
                        {
                            transform: [{ translateX: slideAnim }],
                        },
                    ]}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.userInfo}>
                            {user?.avatar ? (
                                <Image
                                    source={{ uri: user.avatar }}
                                    style={styles.avatar}
                                />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {user?.name?.charAt(0) || 'U'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.userDetails}>
                                <Text style={styles.userName}>{user?.name || t('user')}</Text>
                                <Text style={styles.userEmail}>{user?.email || ''}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                        >
                            <Icon name="x" size={24} color={theme.colors.text.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Menu Items */}
                    <ScrollView 
                        style={styles.menuItems}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.menuItemsContent}
                    >
                        {menuItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => handleNavigate(item.screen)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.menuItemIcon}>
                                    <Icon
                                        name={item.icon}
                                        size={22}
                                        color={theme.colors.primary[500]}
                                    />
                                </View>
                                <Text style={styles.menuItemText}>{item.label}</Text>
                                <Icon
                                    name="chevronRight"
                                    size={20}
                                    color={theme.colors.text.tertiary}
                                />
                            </TouchableOpacity>
                        ))}
                        
                        {/* Logout Button */}
                        <TouchableOpacity
                            style={styles.logoutButton}
                            onPress={handleLogout}
                            activeOpacity={0.7}
                        >
                            <View style={styles.logoutIconContainer}>
                                <Icon name="logOut" size={22} color={theme.colors.error[500]} />
                            </View>
                            <Text style={styles.logoutText}>{t('logout')}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        width: MENU_WIDTH,
        backgroundColor: theme.colors.background.primary,
        shadowColor: '#000',
        shadowOffset: {
            width: 2,
            height: 0,
        },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    header: {
        backgroundColor: theme.colors.primary[500],
        padding: theme.spacing[5],
        paddingTop: theme.spacing[8],
        paddingBottom: theme.spacing[6],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    userInfo: {
        flex: 1,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginBottom: theme.spacing[2],
        borderWidth: 2,
        borderColor: theme.colors.background.primary,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing[2],
        borderWidth: 2,
        borderColor: theme.colors.background.primary,
    },
    avatarText: {
        fontSize: theme.typography.sizes.xl,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.background.primary,
    },
    userDetails: {
        marginTop: theme.spacing[1],
    },
    userName: {
        fontSize: theme.typography.sizes.base,
        fontFamily: theme.typography.fonts.bold,
        color: theme.colors.background.primary,
        marginBottom: theme.spacing[0.5],
    },
    userEmail: {
        fontSize: theme.typography.sizes.xs,
        fontFamily: theme.typography.fonts.regular,
        color: theme.colors.background.primary,
        opacity: 0.85,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuItems: {
        flex: 1,
    },
    menuItemsContent: {
        paddingVertical: theme.spacing[4],
        paddingHorizontal: theme.spacing[4],
        paddingBottom: theme.spacing[6],
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing[3],
        paddingHorizontal: theme.spacing[3],
        marginBottom: theme.spacing[2],
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    menuItemIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: `${theme.colors.primary[500]}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing[3],
    },
    menuItemText: {
        flex: 1,
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.semibold,
        color: theme.colors.text.primary,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing[3],
        paddingHorizontal: theme.spacing[3],
        marginTop: theme.spacing[1],
        backgroundColor: `${theme.colors.error[500]}10`,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1.5,
        borderColor: `${theme.colors.error[500]}30`,
    },
    logoutIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: `${theme.colors.error[500]}15`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing[3],
    },
    logoutText: {
        flex: 1,
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fonts.semibold,
        color: theme.colors.error[500],
    },
});

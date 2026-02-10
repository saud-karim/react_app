import React from 'react';
import { NavigationContainer, useNavigation, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { EventDetailsScreen } from '../screens/EventDetailsScreen';
import { DealsScreen } from '../screens/DealsScreen';
import { DealDetailsScreen } from '../screens/DealDetailsScreen';
import { NewsScreen } from '../screens/NewsScreen';
import { NewsDetailsScreen } from '../screens/NewsDetailsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ChatbotScreen } from '../screens/ChatbotScreen';

import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList, BottomTabParamList } from './types';
import { SimpleTabBar } from '../components/navigation/SimpleTabBar';
import { AppHeader } from '../components/navigation/AppHeader';
import { SideMenu } from '../components/navigation/SideMenu';
import { theme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

// Loading Screen Component (without animations)
const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
            <Text style={styles.logoText}>إدارة</Text>
            <Text style={styles.logoSubtext}>نظام إدارة الموظفين</Text>
        </View>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
    </View>
);

// Bottom Tab Navigator with Custom Tab Bar and Unified Header
const MainTabs = () => {
    const { t } = useTranslation();
    const tabNavigationRef = React.useRef<any>(null);
    const [menuVisible, setMenuVisible] = React.useState(false);

    const handleMenuPress = () => {
        setMenuVisible(true);
    };

    const handleMenuClose = () => {
        setMenuVisible(false);
    };

    const handleMenuNavigate = (screen: string) => {
        if (tabNavigationRef.current) {
            tabNavigationRef.current.navigate(screen);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <AppHeader onMenuPress={handleMenuPress} navigation={tabNavigationRef.current} />
            <Tab.Navigator
                tabBar={(props) => {
                    // Store the navigation object in ref (doesn't cause re-render)
                    if (props.navigation) {
                        tabNavigationRef.current = props.navigation;
                    }
                    return <SimpleTabBar {...props} />;
                }}
                screenOptions={{
                    headerShown: false, // Hide individual headers since we have unified header
                }}
            >
                <Tab.Screen
                    name="HomeTab"
                    component={HomeScreen}
                    options={{
                        title: t('home'),
                    }}
                />
                <Tab.Screen
                    name="EventsTab"
                    component={EventsScreen}
                    options={{
                        title: t('events'),
                    }}
                />
                <Tab.Screen
                    name="DealsTab"
                    component={DealsScreen}
                    options={{
                        title: t('deals'),
                    }}
                />
                <Tab.Screen
                    name="NewsTab"
                    component={NewsScreen}
                    options={{
                        title: t('news'),
                    }}
                />
                <Tab.Screen
                    name="ProfileTab"
                    component={ProfileScreen}
                    options={{
                        title: t('profile'),
                    }}
                />
            </Tab.Navigator>
            <SideMenu
                visible={menuVisible}
                onClose={handleMenuClose}
                onNavigate={handleMenuNavigate}
            />
        </View>
    );
};

// Auth Stack Navigator
const AuthStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                animationDuration: 300,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
};

// Main Stack Navigator
const MainStack = () => {
    const { t } = useTranslation();

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // We'll use AppHeader for all screens
                animation: 'slide_from_right',
                animationDuration: 300,
            }}
        >
            <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Chatbot"
                component={ChatbotScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="EventDetails"
                component={EventDetailsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DealDetails"
                component={DealDetailsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="NewsDetails"
                component={NewsDetailsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

// Root Navigator
export const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
        paddingHorizontal: theme.spacing[6],
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing[12],
    },
    logoText: {
        fontSize: theme.typography.sizes['5xl'],
        fontWeight: '700',
        color: theme.colors.primary[600],
        marginBottom: theme.spacing[2],
        fontFamily: theme.typography.fonts.bold,
    },
    logoSubtext: {
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.text.secondary,
        fontFamily: theme.typography.fonts.medium,
        textAlign: 'center',
    },
    loadingText: {
        fontSize: theme.typography.sizes.base,
        color: theme.colors.text.tertiary,
        fontFamily: theme.typography.fonts.regular,
    },
});

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nManager, LogBox, View, Text, ActivityIndicator } from 'react-native';

// Initialize i18n
import './src/localization/i18n';
import { loadSavedLanguage } from './src/localization/i18n';

import { AuthProvider } from './src/contexts/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { theme } from './src/theme';
import { appServices } from './src/services/appServices';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Worklets',
  'react-native-reanimated',
  'WorkletsError',
  'Mismatch between JavaScript part and native part of Worklets',
]);

// Disable animations for debugging
try {
  const { ANIMATIONS_ENABLED } = require('./src/utils/animationConfig');
  if (!ANIMATIONS_ENABLED) {
    console.log('Animations disabled for debugging');
  }
} catch (error) {
  console.log('Animation config not found, continuing...');
}

export default function App() {
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const [isServicesInitialized, setIsServicesInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load saved language preference
        await loadSavedLanguage();
        setIsLanguageLoaded(true);

        // Initialize app services
        await appServices.initialize();
        setIsServicesInitialized(true);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLanguageLoaded(true);
        setIsServicesInitialized(true);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      appServices.cleanup();
    };
  }, []);

  if (!isLanguageLoaded || !isServicesInitialized) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.primary,
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        <Text style={{
          marginTop: 16,
          fontSize: 16,
          color: theme.colors.text.secondary,
          fontFamily: theme.typography.fonts.medium,
        }}>
          جاري التحميل...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

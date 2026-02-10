import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'centered';
  scrollable?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  gradient?: string[];
  padding?: number;
  safeArea?: boolean;
  statusBarStyle?: 'light-content' | 'dark-content';
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  variant = 'default',
  scrollable = true,
  refreshing = false,
  onRefresh,
  gradient,
  padding = 6,
  safeArea = true,
  statusBarStyle = 'dark-content',
}) => {
  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    if (variant === 'centered') {
      baseStyle.push(styles.centered);
    }
    
    return baseStyle;
  };

  const getContentStyle = () => {
    const baseStyle = [styles.content];
    
    baseStyle.push({
      padding: theme.spacing[padding as keyof typeof theme.spacing] || theme.spacing[6],
    });
    
    return baseStyle;
  };

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={getContentStyle()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary[500]]}
                tintColor={theme.colors.primary[500]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      );
    }

    return (
      <View style={getContentStyle()}>
        {children}
      </View>
    );
  };

  const renderBackground = () => {
    if (variant === 'gradient') {
      const gradientColors = gradient || [
        theme.colors.background.primary,
        theme.colors.background.secondary,
      ];
      
      return (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      );
    }

    return <View style={[StyleSheet.absoluteFillObject, styles.defaultBackground]} />;
  };

  const Container = safeArea ? SafeAreaView : View;

  return (
    <Container style={getContainerStyle()}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor="transparent"
        translucent
      />
      {renderBackground()}
      {renderContent()}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  defaultBackground: {
    backgroundColor: theme.colors.background.primary,
  },
  
  scrollView: {
    flex: 1,
  },
  
  content: {
    flexGrow: 1,
  },
});
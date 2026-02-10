import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { Icon } from '../icons/Icon';

interface HeaderProps {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'gradient' | 'transparent';
  showBackButton?: boolean;
  rightAction?: {
    icon: string;
    onPress: () => void;
  };
  gradient?: string[];
  onBackPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  variant = 'default',
  showBackButton = false,
  rightAction,
  gradient,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  };

  const getHeaderStyle = () => {
    const baseStyle = [
      styles.header,
      { paddingTop: insets.top + theme.spacing[4] },
    ];
    
    if (variant === 'transparent') {
      baseStyle.push(styles.transparent);
    }
    
    return baseStyle;
  };

  const getTextColor = () => {
    return variant === 'gradient' || variant === 'transparent'
      ? theme.colors.text.inverse
      : theme.colors.text.primary;
  };

  const getIconColor = () => {
    return variant === 'gradient' || variant === 'transparent'
      ? theme.colors.text.inverse
      : theme.colors.text.primary;
  };

  const renderContent = () => (
    <View style={styles.content}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Icon
              name="arrowLeft"
              size={24}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Center Section */}
      <View style={styles.centerSection}>
        <Text style={[styles.title, { color: getTextColor() }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: getTextColor() }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {rightAction && (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.actionButton}
            activeOpacity={0.7}
          >
            <Icon
              name={rightAction.icon}
              size={24}
              color={getIconColor()}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (variant === 'gradient') {
    const gradientColors = gradient || theme.colors.gradients.primary;
    
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={getHeaderStyle()}
      >
        <StatusBar barStyle="light-content" />
        {renderContent()}
      </LinearGradient>
    );
  }

  return (
    <View style={[...getHeaderStyle(), styles[`header_${variant}`]]}>
      <StatusBar
        barStyle={variant === 'transparent' ? 'light-content' : 'dark-content'}
      />
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[4],
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  header_default: {
    backgroundColor: theme.colors.background.primary,
  },
  
  header_transparent: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  transparent: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  title: {
    fontSize: theme.typography.sizes.xl,
    fontFamily: theme.typography.fonts.bold,
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    textAlign: 'center',
    marginTop: theme.spacing[1],
    opacity: 0.8,
  },
});
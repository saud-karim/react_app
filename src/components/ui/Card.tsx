import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient';
  padding?: number;
  style?: ViewStyle;
  onPress?: () => void;
  gradient?: string[];
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 4,
  style,
  onPress,
  gradient,
  interactive = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getCardStyle = () => {
    const baseStyle = [
      styles.card,
      styles[`card_${variant}`],
      interactive && styles.cardInteractive,
      isPressed && styles.cardPressed,
    ];
    
    // Apply padding
    baseStyle.push({
      padding: theme.spacing[padding as keyof typeof theme.spacing] || theme.spacing[4],
    });
    
    return baseStyle;
  };

  const renderCard = () => {
    if (variant === 'gradient') {
      const gradientColors = gradient || theme.colors.gradients.primary;
      
      return (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[...getCardStyle(), { backgroundColor: 'transparent' }]}
        >
          {children}
        </LinearGradient>
      );
    }

    return (
      <View style={[...getCardStyle(), style]}>
        {children}
      </View>
    );
  };

  if (onPress || interactive) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={styles.touchableContainer}
      >
        {renderCard()}
      </TouchableOpacity>
    );
  }

  return renderCard();
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius['2xl'],
    backgroundColor: theme.colors.background.primary,
    overflow: 'hidden',
  },
  
  touchableContainer: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
  },
  
  card_default: {
    backgroundColor: theme.colors.background.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  
  card_elevated: {
    backgroundColor: theme.colors.background.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  card_outlined: {
    backgroundColor: theme.colors.background.primary,
    borderWidth: 2,
    borderColor: theme.colors.border.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  
  card_glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    backdropFilter: 'blur(10px)',
  },
  
  card_gradient: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  cardInteractive: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  
  cardPressed: {
    transform: [{ scale: 0.97 }],
    shadowOpacity: 0.15,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowRadius: 20,
    elevation: 10,
  },
});
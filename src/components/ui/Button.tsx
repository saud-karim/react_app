import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { Icon } from '../icons/Icon';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: string[];
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  gradient,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const isDisabled = disabled || loading;

  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      styles[`button_${variant}`],
      styles[`button_${size}`],
      isPressed && styles.buttonPressed,
    ];
    
    if (fullWidth) {
      baseStyle.push(styles.buttonFullWidth);
    }
    
    if (isDisabled) {
      baseStyle.push(styles.buttonDisabled);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [
      styles.text,
      styles[`text_${variant}`],
      styles[`text_${size}`],
    ];
    
    if (isDisabled) {
      baseStyle.push(styles.textDisabled);
    }
    
    return baseStyle;
  };

  const getIconColor = () => {
    if (isDisabled) return theme.colors.text.disabled;
    
    switch (variant) {
      case 'primary':
      case 'gradient':
        return theme.colors.text.inverse;
      case 'secondary':
        return theme.colors.text.inverse;
      case 'outline':
      case 'ghost':
        return theme.colors.primary[500];
      default:
        return theme.colors.text.inverse;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'md':
        return 18;
      case 'lg':
        return 20;
      case 'xl':
        return 22;
      default:
        return 18;
    }
  };

  const renderContent = () => (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getIconColor()} 
          style={styles.loader}
        />
      ) : (
        <>
          {leftIcon && (
            <Icon 
              name={leftIcon} 
              size={getIconSize()} 
              color={getIconColor()} 
              style={styles.leftIcon}
            />
          )}
          
          <Text style={[...getTextStyle(), textStyle]}>
            {title}
          </Text>
          
          {rightIcon && (
            <Icon 
              name={rightIcon} 
              size={getIconSize()} 
              color={getIconColor()} 
              style={styles.rightIcon}
            />
          )}
        </>
      )}
    </View>
  );

  if (variant === 'gradient') {
    const gradientColors = gradient || theme.colors.gradients.primary;
    
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        style={[styles.gradientContainer, fullWidth && styles.buttonFullWidth, style]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradientButton,
            styles[`button_${size}`],
            isPressed && styles.gradientPressed,
            isDisabled && styles.gradientDisabled,
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variants
  button_primary: {
    backgroundColor: theme.colors.primary[500],
    borderColor: theme.colors.primary[500],
  },
  button_secondary: {
    backgroundColor: theme.colors.secondary[500],
    borderColor: theme.colors.secondary[500],
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary[500],
    borderWidth: 2,
  },
  button_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Sizes
  button_sm: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    minHeight: 36,
  },
  button_md: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    minHeight: 44,
  },
  button_lg: {
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[4],
    minHeight: 52,
  },
  button_xl: {
    paddingHorizontal: theme.spacing[8],
    paddingVertical: theme.spacing[5],
    minHeight: 60,
  },
  
  // States
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.05,
    elevation: 1,
  },
  buttonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonFullWidth: {
    width: '100%',
  },
  
  // Gradient styles
  gradientContainer: {
    borderRadius: theme.borderRadius.xl,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientButton: {
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientPressed: {
    opacity: 0.9,
  },
  gradientDisabled: {
    opacity: 0.5,
  },
  
  // Text styles
  text: {
    fontFamily: theme.typography.fonts.semibold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  // Text variants
  text_primary: {
    color: theme.colors.text.inverse,
  },
  text_secondary: {
    color: theme.colors.text.inverse,
  },
  text_outline: {
    color: theme.colors.primary[500],
  },
  text_ghost: {
    color: theme.colors.primary[500],
  },
  
  // Text sizes
  text_sm: {
    fontSize: theme.typography.sizes.sm,
  },
  text_md: {
    fontSize: theme.typography.sizes.base,
  },
  text_lg: {
    fontSize: theme.typography.sizes.lg,
  },
  text_xl: {
    fontSize: theme.typography.sizes.xl,
  },
  
  // Text states
  textDisabled: {
    color: theme.colors.text.disabled,
  },
  
  // Icons and loader
  leftIcon: {
    marginRight: theme.spacing[2],
  },
  rightIcon: {
    marginLeft: theme.spacing[2],
  },
  loader: {
    marginHorizontal: theme.spacing[2],
  },
});
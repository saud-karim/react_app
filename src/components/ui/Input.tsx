import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { theme } from '../../theme';
import { Icon } from '../icons/Icon';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  error?: string;
  containerStyle?: any;
  style?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
    props.onFocus?.({} as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    props.onBlur?.({} as any);
  };

  const hasValue = props.value && props.value.length > 0;
  const shouldFloatLabel = isFocused || hasValue;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[
            styles.label,
            shouldFloatLabel && styles.labelFloated,
            isFocused && styles.labelFocused,
            error && styles.labelError,
          ]}>
            {label}
          </Text>
        </View>
      )}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
      ]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            <Icon 
              name={leftIcon} 
              size={20} 
              color={isFocused ? theme.colors.primary[500] : theme.colors.text.tertiary} 
            />
          </View>
        )}
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            style,
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={theme.colors.text.tertiary}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconContainer}
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            <Icon 
              name={rightIcon} 
              size={20} 
              color={theme.colors.text.tertiary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing[4],
  },
  labelContainer: {
    marginBottom: theme.spacing[2],
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.medium,
    color: theme.colors.text.secondary,
  },
  labelFloated: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.primary[500],
  },
  labelFocused: {
    color: theme.colors.primary[500],
  },
  labelError: {
    color: theme.colors.error[500],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.secondary,
    minHeight: 56,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary[500],
    backgroundColor: theme.colors.background.primary,
  },
  inputContainerError: {
    borderColor: theme.colors.error[500],
  },
  input: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIconContainer: {
    paddingLeft: theme.spacing[4],
    paddingRight: theme.spacing[2],
  },
  rightIconContainer: {
    paddingRight: theme.spacing[4],
    paddingLeft: theme.spacing[2],
  },
  errorText: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fonts.regular,
    color: theme.colors.error[500],
    marginTop: theme.spacing[1],
  },
});
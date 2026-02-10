// Animation configuration - can be disabled for debugging
export const ANIMATIONS_ENABLED = false; // Set to false to disable animations

// Fallback animation values
export const FALLBACK_ANIMATION = {
  duration: 0,
  delay: 0,
};

// Safe animation wrapper
export const safeAnimation = (animation: any) => {
  if (!ANIMATIONS_ENABLED) {
    return FALLBACK_ANIMATION;
  }
  return animation;
};

// Safe animated component wrapper - using regular React Native components
const { View, Text, ScrollView } = require('react-native');

export const SafeAnimated = {
  View: View,
  Text: Text,
  ScrollView: ScrollView,
};
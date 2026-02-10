// Animation system for smooth transitions and micro-interactions

export const animations = {
  // Timing functions
  timing: {
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
  },

  // Easing curves
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Scale animations
  scale: {
    tap: 0.95,
    hover: 1.02,
    focus: 1.05,
    bounce: 1.1,
  },

  // Opacity animations
  opacity: {
    hidden: 0,
    visible: 1,
    semi: 0.7,
    disabled: 0.5,
  },

  // Transform animations
  transform: {
    slideUp: 'translateY(20px)',
    slideDown: 'translateY(-20px)',
    slideLeft: 'translateX(20px)',
    slideRight: 'translateX(-20px)',
    none: 'translateY(0px)',
  },

  // Preset animations
  presets: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 300,
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 300,
    },
    slideInUp: {
      from: { opacity: 0, transform: 'translateY(20px)' },
      to: { opacity: 1, transform: 'translateY(0px)' },
      duration: 400,
    },
    slideInDown: {
      from: { opacity: 0, transform: 'translateY(-20px)' },
      to: { opacity: 1, transform: 'translateY(0px)' },
      duration: 400,
    },
    slideInLeft: {
      from: { opacity: 0, transform: 'translateX(-20px)' },
      to: { opacity: 1, transform: 'translateX(0px)' },
      duration: 400,
    },
    slideInRight: {
      from: { opacity: 0, transform: 'translateX(20px)' },
      to: { opacity: 1, transform: 'translateX(0px)' },
      duration: 400,
    },
    scaleIn: {
      from: { opacity: 0, transform: 'scale(0.9)' },
      to: { opacity: 1, transform: 'scale(1)' },
      duration: 300,
    },
    bounce: {
      from: { transform: 'scale(1)' },
      to: { transform: 'scale(1.05)' },
      duration: 150,
    },
  },
};

// Animation utilities for React Native
export const createAnimationStyle = (
  property: string,
  duration: number = 300,
  easing: string = 'ease-out'
) => ({
  transition: `${property} ${duration}ms ${easing}`,
});

export const createSpringAnimation = (
  tension: number = 300,
  friction: number = 20
) => ({
  tension,
  friction,
  useNativeDriver: true,
});

// Stagger animation delays
export const staggerDelay = (index: number, baseDelay: number = 100) => 
  index * baseDelay;

// Animation sequences
export const sequences = {
  listItems: (itemCount: number) => 
    Array.from({ length: itemCount }, (_, i) => ({
      delay: staggerDelay(i, 80),
      animation: animations.presets.slideInUp,
    })),
  
  cards: (cardCount: number) => 
    Array.from({ length: cardCount }, (_, i) => ({
      delay: staggerDelay(i, 120),
      animation: animations.presets.scaleIn,
    })),
};

export default animations;
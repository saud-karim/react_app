export const spacing = {
  // Base spacing unit (4px)
  unit: 4,

  // Spacing scale
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

export const layout = {
  // Container widths
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },

  // Border radius
  radius: {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Shadows
  shadows: {
    none: {
      boxShadow: 'none',
      elevation: 0,
    },
    sm: {
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
      elevation: 2,
    },
    base: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 3,
    },
    md: {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12)',
      elevation: 4,
    },
    lg: {
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
      elevation: 8,
    },
    xl: {
      boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.18)',
      elevation: 12,
    },
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};
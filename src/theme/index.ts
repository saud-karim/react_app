import { colors, darkColors } from './colors';
import { typography } from './typography';
import { spacing, layout } from './spacing';
import { animations } from './animations';

export const lightTheme = {
  colors,
  typography,
  spacing,
  layout,
  animations,
  borderRadius: layout.radius,
  isDark: false,
};

export const darkTheme = {
  colors: darkColors,
  typography,
  spacing,
  layout,
  animations,
  borderRadius: layout.radius,
  isDark: true,
};

export const theme = lightTheme;

export type Theme = typeof lightTheme;

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './animations';
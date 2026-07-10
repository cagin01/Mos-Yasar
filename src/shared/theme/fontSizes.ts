import { FontSizePreference } from '@/src/store/useFontSizeStore';

export const FONT_SCALE: Record<FontSizePreference, number> = {
  S: 0.875,
  M: 1,
  L: 1.15,
};

export const DEFAULT_FONT_SIZE = 14;

const BASE = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
};

export type AppFontSizes = typeof BASE;

export function scaledFontSizes(preference: FontSizePreference): AppFontSizes {
  const m = FONT_SCALE[preference];
  return {
    xs: Math.round(BASE.xs * m),
    sm: Math.round(BASE.sm * m),
    md: Math.round(BASE.md * m),
    lg: Math.round(BASE.lg * m),
    xl: Math.round(BASE.xl * m),
    xxl: Math.round(BASE.xxl * m),
    xxxl: Math.round(BASE.xxxl * m),
  };
}

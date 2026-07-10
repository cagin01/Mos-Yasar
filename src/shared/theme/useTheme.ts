import { lightColors, darkColors, AppColors } from './colors';
import { scaledFontSizes, AppFontSizes } from './fontSizes';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useFontSizeStore } from '@/src/store/useFontSizeStore';

export function useTheme() {
  const { mode, setMode } = useThemeStore();
  const { preference } = useFontSizeStore();
  const colors: AppColors = mode === 'dark' ? darkColors : lightColors;
  const fontSizes: AppFontSizes = scaledFontSizes(preference);
  return { colors, fontSizes, isDark: mode === 'dark', mode, setMode };
}

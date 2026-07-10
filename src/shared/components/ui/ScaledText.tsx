import { DEFAULT_FONT_SIZE, FONT_SCALE } from '@/src/shared/theme/fontSizes';
import { useFontSizeStore } from '@/src/store/useFontSizeStore';
import React, { forwardRef, useMemo } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  TextInputProps,
  TextProps,
  TextStyle
} from 'react-native';

function scaleTextStyle(style: StyleProp<TextStyle>, multiplier: number) {
  const flattened = StyleSheet.flatten(style);

  if (!flattened) {
    return { fontSize: Math.round(DEFAULT_FONT_SIZE * multiplier) };
  }

  const nextStyle: TextStyle = { ...flattened };

  nextStyle.fontSize = Math.round(
    (typeof nextStyle.fontSize === 'number' ? nextStyle.fontSize : DEFAULT_FONT_SIZE) * multiplier,
  );

  if (typeof nextStyle.lineHeight === 'number') {
    nextStyle.lineHeight = Math.round(nextStyle.lineHeight * multiplier);
  }

  return nextStyle;
}

export const Text = forwardRef<RNText, TextProps>(({ style, ...props }, ref) => {
  const { preference } = useFontSizeStore();
  const scaledStyle = useMemo(
    () => scaleTextStyle(style, FONT_SCALE[preference]),
    [preference, style],
  );

  return <RNText ref={ref} style={scaledStyle} {...props} />;
});

Text.displayName = 'ScaledText';

export const TextInput = forwardRef<RNTextInput, TextInputProps>(({ style, ...props }, ref) => {
  const { preference } = useFontSizeStore();
  const scaledStyle = useMemo(
    () => scaleTextStyle(style, FONT_SCALE[preference]),
    [preference, style],
  );

  return <RNTextInput ref={ref} style={scaledStyle} {...props} />;
});

TextInput.displayName = 'ScaledTextInput';

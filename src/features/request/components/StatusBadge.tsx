import { useTheme } from '@/src/shared/theme/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/src/shared/components/ui/ScaledText';


interface StatusBadgeProps {
  status: string;
  fullWidth?: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export default function StatusBadge({
  status,
  fullWidth,
  backgroundColor,
  textColor,
}: StatusBadgeProps) {
  const { colors, isDark } = useTheme();

  const getBadgeStyle = () => {
    if (backgroundColor || textColor) {
      return {
        bg: isDark ? 'transparent' : (backgroundColor ?? colors.statusDefaultBg),
        border: isDark ? (textColor ?? colors.statusDefaultText) : 'transparent',
        text: textColor ?? colors.statusDefaultText,
      };
    }

    switch (status?.toLowerCase()) {
      case 'onaylandı':
        return { bg: colors.statusApprovedBg, border: 'transparent', text: colors.statusApprovedText };
      case 'onay bekliyor':
        return { bg: colors.statusPendingBg, border: 'transparent', text: colors.statusPendingText };
      case 'reddedildi':
        return { bg: colors.statusRejectedBg, border: 'transparent', text: colors.statusRejectedText };
      default:
        return {
          bg: 'transparent',
          border: isDark ? '#FFFFFF' : 'transparent',
          text: isDark ? '#FFFFFF' : colors.statusDefaultText,
        };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border, borderWidth: badgeStyle.border !== 'transparent' ? 1 : 0 },
        fullWidth && styles.fullWidthBadge,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: badgeStyle.text },
          fullWidth && styles.fullWidthText,
        ]}
      >
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '600' },
  fullWidthBadge: { width: '100%', alignItems: 'center', paddingVertical: 6, borderRadius: 8 },
  fullWidthText: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
});

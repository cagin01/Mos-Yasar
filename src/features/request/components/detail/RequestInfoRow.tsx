import { AppColors } from '@/src/shared/theme/colors';
import { useTheme } from '@/src/shared/theme/useTheme';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/src/shared/components/ui/ScaledText';


interface RequestInfoRowProps {
  label: string;
  value?: string | null;
}

export default function RequestInfoRow({ label, value }: RequestInfoRowProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!value || value === '-') {
    return null;
  }

  const isEmailValue = value.includes('@');

  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        <Text style={styles.infoLabelStrong}>{label}</Text>
        <Text style={styles.infoLabelStrong}>:</Text>
      </Text>
      <Text style={[styles.infoValue, isEmailValue && styles.infoValueEmail]}>{value}</Text>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.infoRowBorder,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textMuted,
    flexShrink: 0,
    marginRight: 4,
  },
  infoLabelStrong: {
    fontWeight: '700',
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
  },
  infoValueEmail: {
    flexShrink: 1,
    lineHeight: 20,
  },
});

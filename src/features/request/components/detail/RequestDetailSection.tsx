import { useTheme } from '@/src/shared/theme/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/src/shared/components/ui/ScaledText';


interface RequestDetailSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function RequestDetailSection({
  title,
  children,
}: RequestDetailSectionProps) {
  const { colors } = useTheme();
  return (
    <>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionCard: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    elevation: 1,
  },
});

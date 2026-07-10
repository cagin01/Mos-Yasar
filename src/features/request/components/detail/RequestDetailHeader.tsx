import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/src/shared/components/ui/ScaledText';


interface RequestDetailHeaderProps {
  title: string;
  onBack: () => void;
  onDelete?: () => void;
  topInset: number;
  disabled?: boolean;
}

export default function RequestDetailHeader({
  title,
  onBack,
  onDelete,
  topInset,
  disabled = false,
}: RequestDetailHeaderProps) {
  const { colors } = useTheme();
  return (
    <View
      pointerEvents={disabled ? 'none' : 'box-none'}
      style={[styles.headerContainer, { paddingTop: topInset + 6, backgroundColor: colors.background, borderBottomColor: colors.borderNavbar }]}
    >
      <Pressable style={styles.headerSideButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={26} color={colors.primary} />
      </Pressable>
      <View style={styles.headerTitleWrapper}>
        <Text style={[styles.headerTitle, { color: colors.primary }]}>{title}</Text>
      </View>
      {onDelete ? (
        <Pressable style={styles.headerSideButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={23} color={colors.primary} />
        </Pressable>
      ) : (
        <View style={styles.headerSideButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerSideButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
});

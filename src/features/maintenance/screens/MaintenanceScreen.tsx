import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/src/shared/components/ui/ScaledText';

interface MaintenanceScreenProps {
  message?: string | null;
}

const DEFAULT_MAINTENANCE_MESSAGE =
  'Uygulama şu an bakım modunda.\nKısa süre içinde hizmete devam edeceğiz.';

export default function MaintenanceScreen({ message }: MaintenanceScreenProps) {
  const { colors } = useTheme();
  const displayMessage = message?.trim() ? message : DEFAULT_MAINTENANCE_MESSAGE;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.surfaceInactive }]}>
          <Ionicons name="construct-outline" size={52} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Bakım Çalışması</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{displayMessage}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 14, textAlign: 'center' },
  subtitle: { fontSize: 15, lineHeight: 24, textAlign: 'center' },
});

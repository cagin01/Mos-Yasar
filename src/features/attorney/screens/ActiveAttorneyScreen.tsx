import AppLoader from '@/src/shared/components/ui/AppLoader';
import ConfirmModal from '@/src/shared/components/ui/ConfirmModal';
import ScreenHeader from '@/src/shared/components/ui/ScreenHeader';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import AttorneyCard from '../components/AttorneyCard';
import { attorneyService } from '../services/attorneyService';
import { Attorney } from '../types';
import { Text } from '@/src/shared/components/ui/ScaledText';


export default function ActiveAttorneyScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { current } = await attorneyService.getAttorneys();
      setAttorneys(current);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.attorney.loadError;
      Alert.alert(t.common.error, message);
    } finally {
      setIsLoading(false);
    }
  }, [t.attorney.loadError, t.common.error]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleRevoke = async () => {
    if (!pendingRevokeId) return;
    setIsLoading(true);
    try {
      await attorneyService.revokeAttorney(pendingRevokeId);
      setPendingRevokeId(null);
      await load();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title={t.attorney.active}
        onBack={() => router.back()}
        rightElement={
          <TouchableOpacity onPress={() => router.push('/settings/create-attorney')} activeOpacity={0.6}>
            <Ionicons name="add" size={32} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={attorneys}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AttorneyCard attorney={item} onRevoke={setPendingRevokeId} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#9E9E9E" />
            <Text style={[styles.emptyText, { color: '#9E9E9E' }]}>
              {t.attorney.noActive}
            </Text>
          </View>
        }
      />

      <ConfirmModal
        visible={Boolean(pendingRevokeId)}
        title={t.attorney.cancelTitle}
        message={t.attorney.cancelMessage}
        confirmText={t.attorney.cancelAction}
        cancelText={t.attorney.cancelBack}
        confirmTextColor="#D32F2F"
        onCancel={() => setPendingRevokeId(null)}
        onConfirm={handleRevoke}
      />

      <AppLoader visible={isLoading} />
    </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 40, flexGrow: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 15, fontSize: 16 },
});

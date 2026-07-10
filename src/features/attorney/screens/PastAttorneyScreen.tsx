import AppLoader from '@/src/shared/components/ui/AppLoader';
import ScreenHeader from '@/src/shared/components/ui/ScreenHeader';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import AttorneyCard from '../components/AttorneyCard';
import { attorneyService } from '../services/attorneyService';
import { Attorney } from '../types';
import { Text } from '@/src/shared/components/ui/ScaledText';


export default function PastAttorneyScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { history } = await attorneyService.getAttorneys();
      setAttorneys(history);
    } catch (error) {
      const message = error instanceof Error ? error.message : t.attorney.loadError;
      Alert.alert(t.common.error, message);
    } finally {
      setIsLoading(false);
    }
  }, [t.attorney.loadError, t.common.error]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title={t.attorney.past} onBack={() => router.back()} />

      <FlatList
        data={attorneys}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <AttorneyCard attorney={item} showRevoke={false} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#9E9E9E" />
            <Text style={[styles.emptyText, { color: '#9E9E9E' }]}>
              {t.attorney.noPast}
            </Text>
          </View>
        }
      />

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 15, paddingBottom: 40, flexGrow: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, textAlign: 'center' },
});

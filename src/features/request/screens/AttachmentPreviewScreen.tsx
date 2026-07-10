import AppLoader from '@/src/shared/components/ui/AppLoader';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import RequestDetailHeader from '../components/detail/RequestDetailHeader';
import { Text } from '@/src/shared/components/ui/ScaledText';


export default function AttachmentPreviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { title, uri } = useLocalSearchParams<{ title?: string; uri?: string }>();
  const [isLoading, setIsLoading] = useState(true);

  if (!uri) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.emptyText}>Önizleme bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <RequestDetailHeader
        title={title || 'Ek Önizleme'}
        topInset={insets.top}
        onBack={() => router.back()}
      />

      <WebView
        source={{ uri }}
        style={styles.webView}
        originWhitelist={['*']}
        allowFileAccess={true}
        allowingReadAccessToURL={uri}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
});

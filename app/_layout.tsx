import { carplayController } from '@/src/carplay/carplayController';
import {
  displayNotification,
  ensureNotificationChannel,
} from '@/src/features/auth/services/notificationDisplayService';
import MaintenanceScreen from '@/src/features/maintenance/screens/MaintenanceScreen';
import { checkMaintenance, MaintenanceStatus } from '@/src/features/maintenance/services/maintenanceService';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import SplashAnimationScreen from '@/src/shared/components/ui/SplashAnimationScreen';
import { darkColors, lightColors } from '@/src/shared/theme/colors';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useThemeStore } from '@/src/store/useThemeStore';
import { useUiStore } from '@/src/store/useUiStore';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';



/*Expo go da da çalışabilecek şekilde kod aşağıda entegre edildi.
import notifee from '@notifee/react-native';
notifee.onBackgroundEvent(async () => {});

*/

let notifee: any = null;
let messaging: any = null;

try {
  // Modül isimlerini string içine gizleyerek Metro derleyicisinin çökmesini engelliyoruz
  const notifeeName = '@notifee/react-native';
  const fcmName = '@react-native-firebase/messaging';
  
  notifee = require(notifeeName);
  messaging = require(fcmName).default;
} catch (e) {
  // Expo Go ortamındaysak buraya düşer ve değişkenler null kalır
}

const safeMessaging = () => {
  if (!messaging) {
    return {
      setBackgroundMessageHandler: () => {},
      onMessage: () => () => {},
      onNotificationOpenedApp: () => () => {},
      getInitialNotification: async () => null,
      onTokenRefresh: () => () => {},
    };
  }
  return messaging();
};

// Notifee yüklendiyse arka plan dinleyicisini güvenli şekilde tetikle
if (notifee && notifee.onBackgroundEvent) {
  notifee.onBackgroundEvent(async () => {});
}

function getRemoteNotificationContent(remoteMessage: {
  notification?: { title?: string; body?: string };
  data?: Record<string, unknown>;
}) {
  const data = remoteMessage.data ?? {};
  const legacyMessage = typeof data.message === 'string' ? data.message : undefined;
  const dataTitle = typeof data.title === 'string' ? data.title : undefined;
  const dataBody = typeof data.body === 'string' ? data.body : undefined;
  const badgeValue = typeof data.badge === 'string' ? Number.parseInt(data.badge, 10) : undefined;

  return {
    title: remoteMessage.notification?.title ?? dataTitle ?? (legacyMessage ? 'Dijital.Onay' : ''),
    body: remoteMessage.notification?.body ?? dataBody ?? legacyMessage ?? '',
    badgeCount: Number.isFinite(badgeValue) ? badgeValue : undefined,
  };
}

/* Aşağıda Expo go da çökmesini engelleyecek şekilde revize edilmiş hali mecvuttur.
// Uygulama arka planda veya kapalıyken gelen FCM mesajları — replace davranışı (sabit ID)
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  const { title, body, badgeCount } = getRemoteNotificationContent(remoteMessage);
  if (title || body) {
    await displayNotification(title, body, badgeCount);
  }
});
*/

// safeMessaging() proxy fonksiyonumuzu araya koyarak Expo Go'da çökmesini engelliyoruz.
// Canlı  modunda ise yine orijinal messaging() gibi davranarak arka plan bildirimlerini eksiksiz yakalar
safeMessaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
  const { title, body, badgeCount } = getRemoteNotificationContent(remoteMessage);
  if (title || body) {
    await displayNotification(title, body, badgeCount);
  }
});

function ThemeSync() {
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.surface).catch(() => {});
  }, [colors.surface]);

  return (
    <StatusBar
      style={mode === 'dark' ? 'light' : 'dark'}
      backgroundColor={colors.surface}
      translucent={false}
    />
  );
}

function NotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    ensureNotificationChannel().catch(() => {});

    // Uygulama açıkken gelen FCM mesajları — Android foreground'da otomatik göstermez
    //Safe olacak şekilde update edilmiştir.
    /*const unsubscribeForeground = messaging().onMessage(async (remoteMessage) => {
      const { title, body, badgeCount } = getRemoteNotificationContent(remoteMessage);
      if (title || body) {
        await displayNotification(title, body, badgeCount);
      }
    });
    */
   const unsubscribeForeground = safeMessaging().onMessage(async (remoteMessage: any) => {
       const { title, body, badgeCount } = getRemoteNotificationContent(remoteMessage);
         if (title || body) {
           await displayNotification(title, body, badgeCount);
          }
        });

    // Uygulama arka plandayken bildirime tıklanınca
    //Safe olacak şekilde update edilmiştir.
    /*
    const unsubscribeOpened = messaging().onNotificationOpenedApp(() => {
      router.push('/');
    });
    */
   const unsubscribeOpened = safeMessaging().onNotificationOpenedApp(() => {
      router.push('/');
      });

    // Uygulama kapalıyken bildirime tıklanınca
    //Safe olacak şekilde update edilmiştir.
    /*
    messaging().getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) router.push('/');
    });
    */
    safeMessaging().getInitialNotification().then((remoteMessage: any) => {
      if (remoteMessage) router.push('/');
    });

    // Token yenilenince eski cache'i temizle
    //Safe olacak şekilde update edilmiştir.
    /*
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(() => {
      import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
        AsyncStorage.removeItem('@mos/fcm_token').catch(() => {});
      });
    });
    */

    const unsubscribeTokenRefresh = safeMessaging().onTokenRefresh(() => {
      import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
        AsyncStorage.removeItem('@mos/fcm_token').catch(() => {});
      });
    });

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
      unsubscribeTokenRefresh();
    };
  }, [router]);

  return null;
}

function RootTopOverlay() {
  const { isTopOverlayVisible } = useUiStore();
  const { mode } = useThemeStore();
  const insets = useSafeAreaInsets();
  const colors = mode === 'dark' ? darkColors : lightColors;

  if (!isTopOverlayVisible || insets.top <= 0) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: insets.top,
        backgroundColor: colors.overlayLight,
        zIndex: 10000,
        elevation: 10000,
      }}
    />
  );
}

function RootContentFrame({ children }: { children: ReactNode }) {
  const { mode } = useThemeStore();
  const colors = mode === 'dark' ? darkColors : lightColors;

  return (
    <SafeAreaView edges={[]} style={{ flex: 1, backgroundColor: colors.background }}>
      {children}
    </SafeAreaView>
  );
}

export default function RootLayout() {
  const { isLoading } = useAuthStore();
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null);
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    carplayController.init();
    checkMaintenance()
      .then(setMaintenanceStatus)
      .catch(() => setMaintenanceStatus({ isUnderMaintenance: false }))
      .finally(() => setIsCheckingMaintenance(false));
  }, []);

  if (!splashDone) {
    return (
      <SafeAreaProvider>
        <ThemeSync />
        <SplashAnimationScreen onFinish={() => setSplashDone(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeSync />
      {!isCheckingMaintenance && maintenanceStatus?.isUnderMaintenance ? (
        <MaintenanceScreen message={maintenanceStatus.message} />
      ) : (
        <RootContentFrame>
          <NotificationHandler />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <RootTopOverlay />
          <AppLoader visible={isLoading || isCheckingMaintenance} />
        </RootContentFrame>
      )}
    </SafeAreaProvider>
  );
}

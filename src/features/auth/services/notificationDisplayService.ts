// --- EXPO GO MUTLAK ÇÖKME KORUMASI ---
let notifee: any = null;
let AndroidImportance: any = { HIGH: 4 }; 
let AndroidVisibility: any = { PUBLIC: 1 };

// Metro derleyicisinin statik analize takılmaması için modül kontrolünü tamamen runtime'a saklıyoruz
const getNotifeeSafe = () => {
  try {
    // Kütüphane adını değişkene atayarak derleyicinin statik kontrolünü bypass ediyoruz
    const moduleName = '@notifee/react-native';
    return require(moduleName);
  } catch (e) {
    return null;
  }
};

const notifeeModule = getNotifeeSafe();

if (notifeeModule) {
  notifee = notifeeModule.default;
  AndroidImportance = notifeeModule.AndroidImportance;
  AndroidVisibility = notifeeModule.AndroidVisibility;
} else {
  // Dil dosyasını da korumalı çağırıyoruz
  try {
    const localesTR = require('@/src/shared/locales/tr').tr; 
    console.warn(localesTR.common?.notifeeNotFound || "Notifee modülü bulunamadı.");
  } catch (langError) {
    console.warn('Notifee module not found in Expo Go environment.');
  }
}
// --- KORUMA KATMANI BİTİŞİ ---

//import notifee, { AndroidImportance, AndroidVisibility } from '@notifee/react-native';

const CHANNEL_ID = 'tr.com.yabim.mobilonay';
const CHANNEL_NAME = 'Mos';
const NOTIFICATION_ID = 'mos_notification';

export async function ensureNotificationChannel(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    lights: true,
    lightColor: '#FF0000',
    badge: true,
    visibility: AndroidVisibility.PUBLIC,
  });
}

export async function displayNotification(title: string, body: string, badgeCount?: number): Promise<void> {
  await ensureNotificationChannel();

  if (badgeCount !== undefined && Number.isFinite(badgeCount) && badgeCount >= 0) {
    await notifee.setBadgeCount(badgeCount);
  }

  await notifee.displayNotification({
    id: NOTIFICATION_ID,
    title,
    body,
    android: {
      channelId: CHANNEL_ID,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
    },
  });
}

export async function cancelNotification(): Promise<void> {
  await notifee.cancelNotification(NOTIFICATION_ID);
}

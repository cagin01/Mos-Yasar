import { appConfig } from '@/src/config/appConfig';
import { FetchApiClient } from '@/src/shared/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';

const FCM_TOKEN_KEY = '@mos/fcm_token';
const SNS_ARN_KEY = '@mos/sns_arn';
const mosApiClient = new FetchApiClient(appConfig.api.baseUrl);

async function requestAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  const androidVersion =
    typeof Platform.Version === 'string' ? Number.parseInt(Platform.Version, 10) : Platform.Version;

  if (androidVersion < 33) {
    return true;
  }

  const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
  const hasPermission = await PermissionsAndroid.check(permission);

  if (hasPermission) {
    return true;
  }

  const result = await PermissionsAndroid.request(permission);
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return requestAndroidNotificationPermission();
  }
  //Expo go üzerinden uygulamayı açabilmek için bu kısım comment line lanmıştır.
  /*
  const status = await messaging().requestPermission();
  return (
    status === messaging.AuthorizationStatus.AUTHORIZED ||
    status === messaging.AuthorizationStatus.PROVISIONAL
  );
  */
 return true;
}

async function getOrFetchDeviceToken(): Promise<string> {
  const granted = await requestNotificationPermission();

  if (!granted) throw new Error('Bildirim izni verilmedi.');
  // Expo go çökmesini önlemek için native token çekme alanı kapatılmıştır.
  /*
  const token = await messaging().getToken();
  */
  const token = "mock_expo_go_test_token_12345";
  const stored = await AsyncStorage.getItem(FCM_TOKEN_KEY);

  if (stored === token) return token;

  // Token değişmiş veya ilk kez alınıyor
  await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
  return token;
}

export async function registerForPushNotifications(accessToken: string): Promise<void> {
  const token = await getOrFetchDeviceToken();
  const encodedToken = btoa(token);
  const deviceType = Platform.OS === 'ios' ? '1' : '0';

  const response = await mosApiClient.request<{ code: number; data?: { arn?: string; email?: string } }>('/mos/api/v3/RegisterSNS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: { token: encodedToken, deviceType },
  });

  if (response.data?.arn) {
    await AsyncStorage.setItem(SNS_ARN_KEY, response.data.arn);
  }
}

export async function deregisterFromPushNotifications(accessToken: string): Promise<void> {
  const arn = await AsyncStorage.getItem(SNS_ARN_KEY);
  if (!arn) return;

  const encodedEndpoint = btoa(arn);

  await mosApiClient.request(`/mos/api/v3/DeleteSNS?endpoint=${encodedEndpoint}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function clearNotificationStorage(): Promise<void> {
  await AsyncStorage.multiRemove([FCM_TOKEN_KEY, SNS_ARN_KEY]);
}

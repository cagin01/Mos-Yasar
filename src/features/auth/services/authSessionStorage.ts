import { AuthSession } from '@/src/features/auth/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'mos_auth_session';

class SecureStoreUnavailableError extends Error {
  constructor() {
    super('SecureStore is unavailable on this platform; refusing to persist auth session in plaintext.');
    this.name = 'SecureStoreUnavailableError';
  }
}

async function isSecureStoreAvailable() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}
/*
export async function readAuthSession(): Promise<AuthSession | null> {
  if (!(await isSecureStoreAvailable())) {
    if (__DEV__) {
      console.warn('[auth] SecureStore unavailable; session will not be restored.');
    }
    return null;
  }

  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (raw) {
    return JSON.parse(raw) as AuthSession;
  }

  const legacyRaw = await AsyncStorage.getItem(SESSION_KEY);
  if (!legacyRaw) {
    return null;
  }

  await SecureStore.setItemAsync(SESSION_KEY, legacyRaw);
  await AsyncStorage.removeItem(SESSION_KEY);
  return JSON.parse(legacyRaw) as AuthSession;
}
export async function writeAuthSession(session: AuthSession): Promise<void> {
  if (!(await isSecureStoreAvailable())) {
    throw new SecureStoreUnavailableError();
  }

  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function removeAuthSession(): Promise<void> {
  if (await isSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
  await AsyncStorage.removeItem(SESSION_KEY);
}
*/
export async function readAuthSession(): Promise<AuthSession | null> {
  if (!(await isSecureStoreAvailable())) {
    return null;
  }

  // 1. Token'ı güvenli alandan çekiyoruz (Boyut limitine takılmaz)
  const secureToken = await SecureStore.getItemAsync('mos_auth_secure_token');
  
  // 2. Kullanıcı datasını normal alandan çekiyoruz
  const rawUserPayload = await AsyncStorage.getItem('mos_auth_user_payload');
  const securePassword = await SecureStore.getItemAsync('mos_auth_secure_password');

  if (secureToken && rawUserPayload) {
    const userPayload = JSON.parse(rawUserPayload);
    
    // 3. Birleştirip orijinal AuthSession tipinde geri döndürüyoruz
   return {
      ...userPayload,
      accessToken: secureToken, 
      savedPassword: securePassword,
    } as AuthSession;
  }
  return null;
}
//🎯 YENİ YAZMA AKIŞI: Büyük nesneyi parçalayıp yazar
export async function writeAuthSession(session: AuthSession): Promise<void> {
  if (!(await isSecureStoreAvailable())) {
    throw new SecureStoreUnavailableError();
  }

  // 1. Sadece hafif olan token string'ini SecureStore'a yazıyoruz (Sınır aşılmaz)
  if (session.accessToken) {
    await SecureStore.setItemAsync('mos_auth_secure_token', session.accessToken);
  }
  // 1.5. Eğer payload içinde taşınan bir şifre varsa onu da şifreli alana yazıyoruz
  const dynamicSession = session as any;
  if (dynamicSession.savedPassword) {
    await SecureStore.setItemAsync('mos_auth_secure_password', dynamicSession.savedPassword);
  }

  // 2. Kalan büyük nesneyi (user, roller vs.) limiti olmayan AsyncStorage'a atıyoruz
  const { accessToken, ...restOfSession } = session;
  if ('savedPassword' in restOfSession) {
    delete (restOfSession as any).savedPassword;
    }
  await AsyncStorage.setItem('mos_auth_user_payload', JSON.stringify(restOfSession));
}

// 🎯 YENİ SİLME AKIŞI: Yeni açtığımız anahtarları temizler
export async function removeAuthSession(): Promise<void> {
  if (await isSecureStoreAvailable()) {
    await SecureStore.deleteItemAsync('mos_auth_secure_token');
    await SecureStore.deleteItemAsync('mos_auth_secure_password');
  }
  await AsyncStorage.removeItem('mos_auth_user_payload');
}


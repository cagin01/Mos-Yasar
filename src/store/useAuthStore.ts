import {
  readAuthSession,
  removeAuthSession,
  writeAuthSession,
} from '@/src/features/auth/services/authSessionStorage';
import { AuthSession } from '@/src/features/auth/types';
import { logger } from '@/src/shared/utils/logger'; //Nc to create logs.
import { useLanguageStore } from '@/src/store/useLanguageStore'; //NC
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
const getTranslations = () => {
  try {
    // 1. useLanguageStore fonksiyonunun altındaki gizli veya açık olan orijinal 'getState' metodunu avlıyoruz:
    const storeTarget = useLanguageStore as any;
    
    // 2. Eğer custom store yapısı getState metodunu dışarıya açtıysa onu çağırıyoruz, yoksa hook'u çaresiz düz tetikliyoruz:
    const state = typeof storeTarget.getState === 'function' 
      ? storeTarget.getState() 
      : storeTarget();
      
    const lang = state?.language || 'tr';
    return lang === 'en' ? require('@/src/shared/i18n/en').en : require('@/src/shared/i18n/tr').tr;
  } catch (e) {
    // Çalışma zamanında (runtime) ne olursa olsun buranın çöküp ana uygulamayı kilitlemesini engelliyoruz (Fallback to TR)
    return require('@/src/shared/i18n/tr').tr;
  }
};

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  isPersisted: boolean;
  rememberedUserEmail: string | null; //Nc 
}

const listeners = new Set<() => void>();

let authState: AuthState = {
  session: null,
  isLoading: true,
  isPersisted: false,
  rememberedUserEmail: null,
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

readAuthSession()
/*
  .then((session) => {
    authState = { session, isLoading: false, isPersisted: Boolean(session) };*/
    .then((session) => {
      const savedEmail = session?.user?.username || session?.user?.email;
    if (session && savedEmail) {
      // 🚨 SİHİRLİ DOKUNUŞ: Bypass engellendi, e-posta hafızaya alındı!
      authState = { 
        session:null,
        isLoading: false, 
        isPersisted: true,
        rememberedUserEmail: savedEmail,
        rememberedUserPayload: session as any
      } as any  ; 
    } else {
      authState = { session: null, isLoading: false, isPersisted: false, rememberedUserEmail: null };
    }
  })
  .catch((error:any) => { // Error handling kısmı değiştirildi Nc
    authState = { session: null, isLoading: false, isPersisted: false,rememberedUserEmail: null};
    const errorMessage = error?.message || '';
    if (errorMessage.includes('No entry found') || errorMessage.includes('not found')) {
      logger.info(getTranslations().auth.noSessionFound, { error: errorMessage });
    } else {
      logger.error(getTranslations().auth.criticalSessionReadFail, error);
    }
  })
  .finally(emitChange);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return authState;
}

export const authStore = {
  getState: getSnapshot,
  setSession(session: AuthSession, rememberMe: boolean) {
    const currentEmail = session?.user?.username || session?.user?.email || null;
    authState = { session, isLoading: false, isPersisted: rememberMe,rememberedUserEmail: rememberMe ? currentEmail : null };
    emitChange();
    // Alt block error log için update edilmiştir.
    if (rememberMe) {
      writeAuthSession(session).catch((error) => {
        logger.error(getTranslations().auth.failedToUpdateSession, error);
      });
    } else {
      removeAuthSession().catch((error) => {
        logger.warn(getTranslations().auth.failedToRemoveSession, error);
      });
    }
  },
  updateSession(session: AuthSession) {
    const wasPersisted = authState.isPersisted;
    const currentEmail = session?.user?.username || session?.user?.email || null;
    authState = 
    { session,
      isLoading: false,
      isPersisted: wasPersisted,
      rememberedUserEmail: wasPersisted ? currentEmail : authState.rememberedUserEmail  
      };
    emitChange();
    // Alt taraf da revize edildi Nc
    if (wasPersisted) {
      writeAuthSession(session).catch((error) => {
        logger.error(getTranslations().auth.failedToUpdateSession, error);
      });
    }
  },
  /*
  clear() {
    authState = { session: null, isLoading: false, isPersisted: false };
    emitChange();
    removeAuthSession().catch(() => {});
    AsyncStorage.multiRemove(['@mos/fcm_token', '@mos/sns_arn']);
  },
  */

  async clear() {
    // 1. Önce AWS bulut sunucusuna gidip "o hayalet kutuyu (endpoint)" imha ediyoruz
    try {
      // Dairesel bağımlılık (circular dependency) riskini önlemek için require kullanıyoruz
      const { notificationService } = require('@/src/features/auth/services/notificationService');
      if (notificationService && typeof notificationService.deregisterFromPushNotifications === 'function') {
        await notificationService.deregisterFromPushNotifications();
      }
    } catch (error) {
      // Geliştirme ortamında (Expo Go) veya internet yokken logout akışının kilitlenmesini engelliyoruz
     logger.warn(getTranslations().common.deregisterFailedWarn, error);
    }

    // 2. Ardından cihazın kendi içindeki yerel hafızayı sıfırlıyoruz (Orijinal Kodlar)
    authState = { session: null, isLoading: false, isPersisted: false, rememberedUserEmail: null};
    emitChange();
    
    removeAuthSession().catch((error) => {
      logger.warn(getTranslations().auth.failedToRemoveSession, error);
    });
    
    AsyncStorage.multiRemove(['@mos/fcm_token', '@mos/sns_arn']).catch((error) => {
      logger.warn(getTranslations().auth.failedToClearStorageTokens, error);
    });
  }, // <-- clear fonksiyonu tam olarak burada, doğru parantezle kapanıyor!
};

export function useAuthStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    ...state,
    isPersisted: state.isPersisted,
    isAuthenticated: Boolean(state.session?.accessToken),
    rememberedUserPayload: (state as any).rememberedUserPayload,
    setSession: authStore.setSession,
    clearSession: authStore.clear,
  };
}
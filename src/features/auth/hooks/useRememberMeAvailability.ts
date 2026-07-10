import { useEffect, useState } from 'react';
import { Alert, AppState } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from '@/src/shared/i18n/useTranslation';

export function useRememberMeAvailability() {
  const [rememberMe, setRememberMe] = useState(false);
  const [isRememberMeAvailable, setIsRememberMeAvailable] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function checkDeviceSecurity() {
      try {
        const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();
        const isDeviceSecured = enrolledLevel >= LocalAuthentication.SecurityLevel.SECRET;

        if (!isMounted) {
          return;
        }

        setIsRememberMeAvailable(isDeviceSecured);

        if (!isDeviceSecured) {
          setRememberMe(false);
        }
      } catch {
        if (!isMounted) {
          return;
        }

        setIsRememberMeAvailable(false);
        setRememberMe(false);
      }
    }

    checkDeviceSecurity();

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkDeviceSecurity();
      }
    });

    return () => {
      isMounted = false;
      appStateSubscription.remove();
    };
  }, []);

  const { t } = useTranslation();

  const handleRememberMePress = () => {
    if (!isRememberMeAvailable) {
      Alert.alert(t.auth.rememberMeUnavailable, t.auth.rememberMeMessage);
      return;
    }

    setRememberMe((prev) => !prev);
  };

  return {
    handleRememberMePress,
    isRememberMeAvailable,
    rememberMe,
  };
}

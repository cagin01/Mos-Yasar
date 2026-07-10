import { authService } from '@/src/features/auth/services/authService';
import { authStore } from '@/src/store/useAuthStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

interface UseLoginActionsParams {
  password: string;
  rememberMe: boolean;
  username: string;
}

export function useLoginActions({
  password,
  rememberMe,
  username,
}: UseLoginActionsParams) {
  const router = useRouter();
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performLogin = async (
    nextUsername: string,
    nextPassword: string,
    nextRememberMe: boolean,
  ) => {
    setIsSubmitting(true);
    try {
      const session = await authService.login({
        username: nextUsername,
        password: nextPassword,
        rememberMe: nextRememberMe,
      });// 🎯 SİHİRLİ DOKUNUŞ: Kullanıcının girdiği şifreyi, diske yazılabilmesi için nesneye iliştiriyoruz:
      const sessionWithPassword = {
        ...session,
        savedPassword: nextPassword
      };
      
      authStore.setSession(sessionWithPassword as any, nextRememberMe);     
      router.replace('/(tabs)');  

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Giriş yapılamadı.';

      if (message.toLowerCase().includes('not fully set up')) {
        router.push({
          pathname: '/set-password',
          params: { email: nextUsername.trim() },
        });
        return;
      }

      Alert.alert('Giriş Başarısız', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    await performLogin(username, password, rememberMe);
  };

  const handleSetPasswordPreview = () => {
    router.push({
      pathname: '/set-password',
      params: { email: username.trim() || 'preview@example.com' },
    });
  };

  const handleResetPassword = async () => {
    setIsSubmitting(true);
    try {
      await authService.requestPasswordReset({ email: forgotEmail });
      setIsForgotModalVisible(false);
      setForgotEmail('');
      Alert.alert('Bilgi', 'Şifre sıfırlama isteği gönderildi.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'İşlem tamamlanamadı.';
      Alert.alert('Şifre Sıfırlama Başarısız', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordCancel = () => {
    setIsForgotModalVisible(false);
    setForgotEmail('');
  };

  return {
    forgotEmail,
    handleForgotPasswordCancel,
    handleLogin,
    handleResetPassword,
    handleSetPasswordPreview,
    isForgotModalVisible,
    isSubmitting,
    setForgotEmail,
    setIsForgotModalVisible,
  };
}

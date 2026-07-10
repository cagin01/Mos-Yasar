import { authService } from '@/src/features/auth/services/authService';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import CustomFabIcon from '@/src/shared/components/ui/CustomFabIcon';
import YasarBilgiLogo from '@/src/shared/components/ui/YasarBilgiLogo';
import { AppColors } from '@/src/shared/theme/colors';
import { useTheme } from '@/src/shared/theme/useTheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Text, TextInput } from '@/src/shared/components/ui/ScaledText';


export default function SetPasswordScreen() {
  const { colors, isDark } = useTheme();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, bottomInset), [colors, bottomInset]);
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSubmit = async () => {
    if (!password || !passwordRepeat) {
      Alert.alert('Uyarı', 'Lütfen iki şifre alanını da doldurun.');
      return;
    }

    if (password !== passwordRepeat) {
      Alert.alert('Uyarı', 'Yeni şifre alanları birbiriyle aynı olmalıdır.');
      return;
    }

    if (!email) {
      Alert.alert('Hata', 'Şifre güncelleme için kullanıcı bilgisi bulunamadı.');
      return;
    }

    setIsSubmitting(true);
    try {
      const message = await authService.setPassword({
        email,
        newPassword: password,
      });

      Alert.alert('Bilgi', message || 'Şifre güncellendi.', [
        {
          text: 'Tamam',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Şifre güncellenemedi.';
      Alert.alert('Şifre Güncelleme Başarısız', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <Text style={styles.titleText}>Şifrenizi yenilemeniz gerekmektedir</Text>

            <View style={[styles.logoContainer, isKeyboardVisible && styles.logoContainerKeyboardVisible]}>
              {!isKeyboardVisible && (
                <View style={styles.iconWrapper}>
                  <CustomFabIcon size={55} color={colors.primary} />
                </View>
              )}
              <Text style={styles.appName}>Dijital.Onay</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Yeni Şifre"
                  placeholderTextColor={colors.textDisabled}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Yeni Şifre Tekrar"
                  placeholderTextColor={colors.textDisabled}
                  value={passwordRepeat}
                  onChangeText={setPasswordRepeat}
                  secureTextEntry={true}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isDark && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary, elevation: 0, shadowOpacity: 0 },
                ]}
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text style={[styles.submitButtonText, isDark && { color: colors.primary }]}>Şifreyi Güncelle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {!isKeyboardVisible && (
          <View style={styles.footer}>
            <YasarBilgiLogo width={120} height={19} />
          </View>
        )}

        <AppLoader visible={isSubmitting} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const createStyles = (colors: AppColors, bottomInset: number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardContainer: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 25 },
  titleText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 28,
  },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoContainerKeyboardVisible: { marginBottom: 26 },
  iconWrapper: {
    width: 100,
    height: 100,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  formContainer: { width: '100%' },
  inputWrapper: { marginBottom: 20 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.textPrimary,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  submitButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : Math.max(20, bottomInset + 8),
    width: '100%',
    alignItems: 'center',
  },
});

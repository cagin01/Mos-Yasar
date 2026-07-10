import { APP_VERSION_BY_PLATFORM } from '@/src/config/appConfig';
import { DevFooterActions, DevTopActions } from '@/src/features/auth/components/DevLoginControls';
import ForgotPasswordModal from '@/src/features/auth/components/ForgotPasswordModal';
import { useLoginActions } from '@/src/features/auth/hooks/useLoginActions';
import { useLoginForm } from '@/src/features/auth/hooks/useLoginForm';
import { useRememberMeAvailability } from '@/src/features/auth/hooks/useRememberMeAvailability';
import { sanitizeUsernameInput } from '@/src/features/auth/services/authService';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import CustomFabIcon from '@/src/shared/components/ui/CustomFabIcon';
import { Text, TextInput } from '@/src/shared/components/ui/ScaledText';
import YasarBilgiLogo from '@/src/shared/components/ui/YasarBilgiLogo';
import { useKeyboardVisibility } from '@/src/shared/hooks/useKeyboardVisibility';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { AppColors } from '@/src/shared/theme/colors';
import { useTheme } from '@/src/shared/theme/useTheme';
import { useAuthStore } from '@/src/store/useAuthStore'; // useAuthStore eklendi Nc
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react'; //Nc
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { bottom: bottomInset } = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, bottomInset), [colors, bottomInset]);
  const router = useRouter();
  const {
    activeButton,
    handlePasswordVisibilityToggle,
    isPasswordVisible,
    password,
    setActiveButton,
    setPassword,
    setUsername,
    username,
  } = useLoginForm();
  // 🎯 1. Store'un içindeki o dolduracağımız güvenli mail adresini çekiyoruz: Nc
  // 🎯 1. Gerekli tüm verileri ve yeni yedek ambarı store'dan çekiyoruz:
  const { rememberedUserEmail, rememberedUserPayload, isPersisted } = useAuthStore();
  const { handleRememberMePress, isRememberMeAvailable, rememberMe } = useRememberMeAvailability();

  // 🎯 2. Ekran yüklendiğinde form doldurma senkronizasyonunu 3 BAĞIMSIZ bloğa bölüyoruz:

  // 1. Sadece Maili Doldur
  useEffect(() => {
    if (rememberedUserEmail && !username) {
      setUsername(rememberedUserEmail);
    }
  }, [rememberedUserEmail, username]);

  // 2. Sadece Şifreyi Doldur (RN secureTextEntry bug'ını aşmak için mikro gecikmeli)
  useEffect(() => {
    const savedPassword = rememberedUserPayload?.savedPassword;
    if (savedPassword && !password) {
      const timer = setTimeout(() => {
        setPassword(savedPassword);
      }, 100); // 100ms gecikme ile input'un native render kilidini kırıyoruz
      return () => clearTimeout(timer);
    }
  }, [rememberedUserPayload, password]);

  // 3. Sadece 'Beni Hatırla' Kutusunu Tikle
  useEffect(() => {
    if (isPersisted && !rememberMe && isRememberMeAvailable) {
      handleRememberMePress();
    }
  }, [isPersisted, isRememberMeAvailable, rememberMe]);
  const isKeyboardVisible = useKeyboardVisibility();
  const {
    forgotEmail,
    handleForgotPasswordCancel,
    handleLogin,
    handleResetPassword,
    handleSetPasswordPreview,
    isForgotModalVisible,
    isSubmitting,
    setForgotEmail,
    setIsForgotModalVisible,
  } = useLoginActions({ password, rememberMe, username });
  useEffect(() => {
    if (isPersisted && rememberMe && username && password && !isSubmitting) {
      handleLogin();
    }
  }, [isPersisted, rememberMe, username, password, isSubmitting]); // Inputlar dolduğu milisaniyede uyanır
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <View
              style={[styles.logoContainer, isKeyboardVisible && styles.logoContainerKeyboardVisible]}
            >
              {!isKeyboardVisible && (
                <View style={styles.iconWrapper}>
                  <CustomFabIcon size={55} color={colors.primary} />
                </View>
              )}
              <Text style={[styles.appName, isKeyboardVisible && styles.appNameKeyboardVisible]}>
                {t.auth.appName}
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={t.auth.username}
                  placeholderTextColor={colors.textDisabled}
                  value={username}
                  onChangeText={(value) => setUsername(sanitizeUsernameInput(value))}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputWrapper}>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder={t.auth.password}
                    placeholderTextColor={colors.textDisabled}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!isPasswordVisible}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    style={styles.passwordToggleButton}
                    onPress={handlePasswordVisibilityToggle}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.textSystemGray}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={[
                    styles.checkboxContainer,
                    !isRememberMeAvailable && styles.checkboxContainerDisabled,
                  ]}
                  onPress={handleRememberMePress}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      !isRememberMeAvailable ? 'square' : rememberMe ? 'checkbox' : 'square-outline'
                    }
                    size={30}
                    color={!isRememberMeAvailable ? colors.textDisabled : rememberMe ? colors.primary : colors.textDisabled}
                  />
                  <Text
                    style={[
                      styles.rememberText,
                      !isRememberMeAvailable && styles.rememberTextDisabled,
                    ]}
                  >
                    {t.auth.rememberMe}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setIsForgotModalVisible(true)} activeOpacity={0.7}>
                  <Text style={styles.forgotText}>{t.auth.forgotPassword}</Text>
                </TouchableOpacity>
              </View>

              <Pressable
                style={[
                  styles.loginButton,
                  isDark && { backgroundColor: 'transparent', elevation: 0, shadowOpacity: 0 },
                  { borderColor: isDark && activeButton === 'login' ? colors.primary : 'transparent' },
                ]}
                onPressIn={() => setActiveButton('login')}
                onPress={handleLogin}
              >
                <Text style={[styles.loginButtonText, isDark && { color: colors.primary }]}>{t.auth.login}</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.signupContainer,
                  { borderColor: isDark && activeButton === 'signup' ? colors.primary : 'transparent' },
                ]}
                onPressIn={() => setActiveButton('signup')}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.signupText}>{t.auth.register}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>

        <DevTopActions
          styles={styles}
          onMaintenancePreview={() => router.push('/maintenance-preview')}
        />

        {!isKeyboardVisible && (
          <View style={styles.footer}>
            <View style={styles.footerBrandRow}>
              <YasarBilgiLogo width={120} height={19} />
              <DevFooterActions
                styles={styles}
                onSetPasswordPreview={handleSetPasswordPreview}
              />
            </View>
             <Text style={[styles.footerText, { marginTop: 5 }]}>
              v{Platform.OS === 'ios' ? APP_VERSION_BY_PLATFORM.ios : APP_VERSION_BY_PLATFORM.android}
               </Text>
            </View>
        )}

        <ForgotPasswordModal
          colors={colors}
          email={forgotEmail}
          onCancel={handleForgotPasswordCancel}
          onEmailChange={setForgotEmail}
          onSubmit={handleResetPassword}
          styles={styles}
          visible={isForgotModalVisible}
        />

        <AppLoader visible={isSubmitting} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const createStyles = (colors: AppColors, bottomInset: number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardContainer: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 25 },
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  logoContainerKeyboardVisible: { marginBottom: 28 },
  iconWrapper: {
    width: 100,
    height: 100,
    backgroundColor: colors.surface,
    borderWidth: 5,
    borderColor: colors.primary,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: { fontSize: 28, fontWeight: 'bold', color: colors.primary, letterSpacing: 0.5 },
  appNameKeyboardVisible: { fontSize: 32 },
  formContainer: { width: '100%' },
  inputWrapper: { marginBottom: 15, justifyContent: 'center' },
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  passwordInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
  },
  passwordToggleButton: {
    width: 44,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkboxContainerDisabled: { opacity: 0.7 },
  rememberText: { marginLeft: 8, fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  rememberTextDisabled: { color: colors.textDisabled },
  forgotText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  signupContainer: { alignItems: 'center', paddingVertical: 14, borderRadius: 25, backgroundColor: 'transparent', borderWidth: 1.5, borderColor: 'transparent' },
  signupText: { color: colors.primary, fontSize: 16, fontWeight: 'bold' },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : Math.max(20, bottomInset + 8),
    width: '100%',
    alignItems: 'center',
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: { fontSize: 12, color: colors.textDisabled },
  devTopButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  devTopButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.primaryLighter,
    borderWidth: 1,
    borderColor: colors.primaryLighterBorder,
  },
  devLoginButton: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: colors.primaryLighter,
    borderWidth: 1,
    borderColor: colors.primaryLighterBorder,
  },
  devLoginButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: { width: '92%', backgroundColor: colors.surface, borderRadius: 25, padding: 25, elevation: 5 },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textHeading,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: colors.surfaceInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 25,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
    paddingTop: 15,
  },
  modalButton: { paddingHorizontal: 15, paddingVertical: 5 },
  buttonTextDefault: { color: colors.textPlaceholder, fontSize: 16, fontWeight: '500' },
  buttonTextBold: { color: colors.primary, fontSize: 16, fontWeight: 'bold' },
});

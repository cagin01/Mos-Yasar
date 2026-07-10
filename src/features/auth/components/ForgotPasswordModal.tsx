import { KeyboardAvoidingView, Modal, Platform, StyleProp, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { Text, TextInput } from '@/src/shared/components/ui/ScaledText';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { AppColors } from '@/src/shared/theme/colors';

interface ForgotPasswordModalStyles {
  buttonTextBold: StyleProp<TextStyle>;
  buttonTextDefault: StyleProp<TextStyle>;
  modalButton: StyleProp<ViewStyle>;
  modalButtonContainer: StyleProp<ViewStyle>;
  modalInput: StyleProp<TextStyle>;
  modalOverlay: StyleProp<ViewStyle>;
  modalTitle: StyleProp<TextStyle>;
  modalView: StyleProp<ViewStyle>;
}

interface ForgotPasswordModalProps {
  colors: AppColors;
  email: string;
  onCancel: () => void;
  onEmailChange: (email: string) => void;
  onSubmit: () => void;
  styles: ForgotPasswordModalStyles;
  visible: boolean;
}

export default function ForgotPasswordModal({
  colors,
  email,
  onCancel,
  onEmailChange,
  onSubmit,
  styles,
  visible,
}: ForgotPasswordModalProps) {
  const { t } = useTranslation();
  return (
    <Modal animationType="fade" transparent visible={visible}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{t.auth.resetPasswordPrompt}</Text>
          <TextInput
            style={styles.modalInput}
            placeholder={t.auth.resetPasswordEmailPlaceholder}
            placeholderTextColor={colors.textDisabled}
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={onCancel}>
              <Text style={styles.buttonTextDefault}>{t.common.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={onSubmit}>
              <Text style={styles.buttonTextBold}>{t.auth.resetPassword}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

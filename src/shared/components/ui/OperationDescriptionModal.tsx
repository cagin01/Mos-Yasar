import { RequestOperation } from '@/src/features/request/types';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from './ScaledText';

interface OperationDescriptionModalProps {
  visible: boolean;
  operation: RequestOperation | null;
  required: boolean;
  onConfirm: (description: string | null) => void;
  onCancel: () => void;
}

export default function OperationDescriptionModal({
  visible,
  operation,
  required,
  onConfirm,
  onCancel,
}: OperationDescriptionModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [text, setText] = useState('');

  useEffect(() => {
    if (visible) setText('');
  }, [visible]);

  const canConfirm = !required || text.trim().length > 0;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={[styles.overlay, { backgroundColor: colors.overlay }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.textHeading }]}>
            {operation?.operationName ?? t.requests.actionDescriptionTitle}
          </Text>

          <Text style={[styles.hint, { color: required ? colors.dangerText : colors.textSecondary }]}>
            {required ? t.requests.actionDescriptionRequiredHint : t.requests.actionDescriptionOptionalHint}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surfaceInactive,
                color: colors.textPrimary,
                borderColor: colors.border,
              },
            ]}
            placeholder={t.requests.actionDescriptionPlaceholder}
            placeholderTextColor={colors.textPlaceholder}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />

          <View style={[styles.buttons, { borderTopColor: colors.borderLight }]}>
            <TouchableOpacity style={styles.btn} onPress={onCancel}>
              <Text style={[styles.btnText, { color: colors.textHeading }]}>
                {t.common.cancel}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPress={() => onConfirm(text.trim() || null)}
              disabled={!canConfirm}
            >
              <Text style={[
                styles.btnText,
                styles.btnTextConfirm,
                { color: canConfirm ? (operation?.textColor || colors.primary) : colors.textDisabled },
              ]}>
                {t.common.confirm}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '88%',
    borderRadius: 25,
    padding: 25,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  hint: { fontSize: 13, marginBottom: 14, lineHeight: 18 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 110,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 0.5,
    paddingTop: 15,
  },
  btn: { paddingHorizontal: 20, paddingVertical: 5 },
  btnText: { fontSize: 16 },
  btnTextConfirm: { fontWeight: 'bold' },
});

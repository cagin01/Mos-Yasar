import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { AppColors } from '@/src/shared/theme/colors';
import { useTheme } from '@/src/shared/theme/useTheme';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/src/shared/components/ui/ScaledText';


interface RadioDateModalProps {
  visible: boolean;
  currentSelection: string;
  availableDates?: string[]; 
  onClose: () => void;
  onApply: (selected: string) => void;
}

export default function RadioDateModal({
  visible, currentSelection, availableDates = [], onClose, onApply
}: RadioDateModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [tempSelected, setTempSelected] = useState(currentSelection);

  // Modal her açıldığında mevcut aramayı içeri al
  useEffect(() => {
    if (visible) {
      setTempSelected(currentSelection);
    }
  }, [visible, currentSelection]);

  // "Tümü" seçeneği SİLİNDİ. Sadece API'den gelen tarihler gösteriliyor.
  const options = [...availableDates];

  return (
    <Modal transparent={true} visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          <Text style={styles.modalTitle}>{t.requests.operationDates}</Text>

          <ScrollView style={styles.radioGroup} showsVerticalScrollIndicator={false}>
            {options.length === 0 ? (
              <Text style={styles.emptyText}>Liste boş</Text>
            ) : (
              options.map((date, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.radioRow}
                  onPress={() => setTempSelected(date)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.radioText, tempSelected === date && styles.radioTextSelected]}>
                    {date}
                  </Text>
                  <View style={[styles.radioCircle, tempSelected === date && styles.radioCircleSelected]}>
                    {tempSelected === date && <View style={styles.innerCircle} />}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* İPTAL VE TAMAM BUTONLARI */}
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.btnAction}>
              <Text style={styles.btnCancelText}>{t.common.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onApply(tempSelected)} style={styles.btnAction}>
              <Text style={styles.btnApplyText}>{t.common.ok}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: colors.overlayMedium, justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxHeight: '70%', backgroundColor: colors.surface, borderRadius: 25, padding: 25, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.primary, marginBottom: 15, textAlign: 'left' },
  radioGroup: { marginBottom: 10 },
  radioRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: colors.textPrimary },
  radioText: { fontSize: 16, color: colors.textBody },
  radioTextSelected: { color: colors.primary },
  radioCircle: { height: 22, width: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.borderRadio, alignItems: 'center', justifyContent: 'center' },
  radioCircleSelected: { borderColor: colors.primary },
  innerCircle: { height: 12, width: 12, borderRadius: 6, backgroundColor: colors.primary },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 },
  btnAction: { padding: 10, minWidth: 70, alignItems: 'center' },
  btnCancelText: { color: colors.textPlaceholder, fontSize: 16, fontWeight: '500' },
  btnApplyText: { color: colors.primary, fontSize: 16, fontWeight: 'bold' },
  emptyText: { fontSize: 15, color: colors.textPlaceholder, textAlign: 'center', paddingVertical: 20 },
});
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Attorney } from '../types';
import { Text } from '@/src/shared/components/ui/ScaledText';


interface AttorneyCardProps {
  attorney: Attorney;
  onRevoke?: (id: string) => void;
  showRevoke?: boolean;
}

export default function AttorneyCard({
  attorney,
  onRevoke,
  showRevoke = true,
}: AttorneyCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const subjectsText = attorney.allSubjects
    ? t.attorney.all
    : attorney.subjects.map((s) => s.name).join(', ') || '-';

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
      <Text style={[styles.inlineText, { color: colors.textPrimary }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}: </Text>
        <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
      </Text>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderCard }]}>
      <View style={styles.content}>
        <View style={styles.emailRow}>
          <View style={styles.emailLabelColumn}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t.attorney.recipient}</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>{t.attorney.email}</Text>
          </View>
          <Text style={[styles.separator, { color: colors.textSecondary }]}>:</Text>
          <Text style={[styles.emailValue, { color: colors.textPrimary }]}>
            {attorney.receiverEmail}
          </Text>
        </View>
        <InfoRow label={t.attorney.start} value={attorney.startDate} />
        <InfoRow label={t.attorney.end} value={attorney.endDate} />
        <InfoRow label={t.attorney.subjects} value={subjectsText} />
      </View>

      {showRevoke && onRevoke && (
        <View style={styles.actionsRow}>
          <Pressable style={styles.revokeButton} onPress={() => onRevoke(attorney.id)}>
            <Ionicons name="trash-outline" size={22} color={colors.dangerText} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  content: { gap: 8 },
  emailRow: { flexDirection: 'row', alignItems: 'center' },
  emailLabelColumn: { width: 56, justifyContent: 'center' },
  separator: { width: 12, textAlign: 'center', fontSize: 14, fontWeight: '700' },
  emailValue: { flex: 1, fontSize: 13.5, lineHeight: 19, fontWeight: '500' },
  infoRow: { minHeight: 18 },
  inlineText: { fontSize: 13.5, lineHeight: 20 },
  label: { fontWeight: '700', fontSize: 13.5, lineHeight: 18 },
  value: { fontWeight: '500' },
  actionsRow: { marginTop: 8, alignItems: 'flex-end' },
  revokeButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});

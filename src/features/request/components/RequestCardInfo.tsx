import { useTheme } from '@/src/shared/theme/useTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/src/shared/components/ui/ScaledText';


interface InfoProps {
  senderName: string;
  requestDate: string;
  compact?: boolean;
}

const RequestCardInfo: React.FC<InfoProps> = ({ senderName, requestDate, compact = false }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.infoContainer, compact && styles.infoContainerCompact]}>
      <Text style={[styles.senderText, compact && styles.senderTextCompact, { color: colors.textDark }]}>{senderName}</Text>
      <Text style={[styles.dateText, compact && styles.dateTextCompact, { color: colors.textSecondary }]}>{requestDate}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 2,
  },
  infoContainerCompact: {
    paddingHorizontal: 12,
  },
  senderText: { fontSize: 14, fontWeight: 'bold' },
  senderTextCompact: { fontSize: 13 },
  dateText: { fontSize: 11 },
  dateTextCompact: { fontSize: 10 },
});

export default RequestCardInfo;

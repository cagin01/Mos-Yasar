import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { RequestSummary } from '../types';
import RequestCardDetails from './RequestCardDetails';
import RequestCardHeader from './RequestCardHeader';
import RequestCardInfo from './RequestCardInfo';

interface RequestListItemProps {
  requestData: RequestSummary;
  onItemPress: (item: RequestSummary) => void;
  isSelected: boolean;
  onSelect: (id: string, isSelected: boolean) => void;
  showCheckbox?: boolean;
  compact?: boolean;
}

const RequestListItem: React.FC<RequestListItemProps> = ({
  requestData,
  onItemPress,
  isSelected,
  onSelect,
  showCheckbox = true,
  compact = false,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!requestData) {
    return null;
  }

  return (
    <Pressable
      style={[styles.cardContainer, compact && styles.cardContainerCompact, { backgroundColor: colors.background, borderColor: colors.borderCard }]}
      onPress={() => onItemPress(requestData)}
    >
      <RequestCardHeader
        statusLabel={requestData.statusLabel || requestData.statu || '-'}
        statusBackgroundColor={requestData.statusBackgroundColor}
        statusTextColor={requestData.statusTextColor}
        isSelected={isSelected}
        onSelect={(value) => onSelect(requestData.id, value)}
        showCheckbox={showCheckbox}
      />

      <RequestCardInfo
        senderName={requestData.gonderen || t.requests.noName}
        requestDate={requestData.baslangic || '-'}
        compact={compact}
      />

      <RequestCardDetails lines={requestData.descriptionList ?? []} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 12,
    marginBottom: 8,
    marginHorizontal: 3,
    paddingVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#DCE6F2',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardContainerCompact: {
    marginHorizontal: 0,
    marginBottom: 6,
    paddingVertical: 6,
    borderRadius: 10,
  },
});

export default RequestListItem;

import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@/src/shared/theme/useTheme';
import { CategoryGroup, RequestSummary } from '../types';
import AccordionCategory from './AccordionCategory';

interface FilteredListProps {
  data: CategoryGroup[];
  openCategory: string | null;
  onToggle: (title: string) => void;
  onDetailsPress: (item: RequestSummary) => void;
  selectedIds: string[];
  onSelect: (id: string, isSelected: boolean) => void;
  variant?: 'request' | 'history';
  showSelection?: boolean;
  canSelectRequest?: (item: RequestSummary) => boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const FilteredList: React.FC<FilteredListProps> = ({
  data,
  openCategory,
  onToggle,
  onDetailsPress,
  selectedIds,
  onSelect,
  variant = 'request',
  showSelection = true,
  canSelectRequest,
  onRefresh,
  refreshing = false,
}) => {
  const { colors } = useTheme();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.list}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      overScrollMode="always"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.surface}
          />
        ) : undefined
      }
    >
      {data.map((group, idx) => (
        <AccordionCategory
          key={group.category || idx}
          index={idx}
          title={group.category}
          requests={group.data || []}
          expanded={openCategory === group.category}
          onToggle={() => onToggle(group.category)}
          onDetailsPress={onDetailsPress}
          selectedIds={selectedIds}
          onSelect={onSelect}
          variant={variant}
          showSelection={showSelection}
          canSelectRequest={canSelectRequest}
        />
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingTop: 10 },
});

export default FilteredList;

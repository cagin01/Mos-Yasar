import { useTheme } from '@/src/shared/theme/useTheme';
import ExpoCheckbox from 'expo-checkbox';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import StatusBadge from './StatusBadge';

interface HeaderProps {
  statusLabel: string;
  statusBackgroundColor?: string;
  statusTextColor?: string;
  isSelected: boolean;
  onSelect: (value: boolean) => void;
  showCheckbox?: boolean;
}

const RequestCardHeader: React.FC<HeaderProps> = ({
  statusLabel,
  statusBackgroundColor,
  statusTextColor,
  isSelected,
  onSelect,
  showCheckbox = true,
}) => {
  const { colors } = useTheme();
  return (
    <View style={styles.headerContainer}>
      <View style={styles.badgeWrapper}>
        <StatusBadge
          status={statusLabel}
          fullWidth={true}
          backgroundColor={statusBackgroundColor}
          textColor={statusTextColor}
        />
      </View>

      {showCheckbox && (
        <Pressable
          style={styles.checkboxWrapper}
          onPress={(event) => {
            event.stopPropagation();
            onSelect(!isSelected);
          }}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <View pointerEvents="none">
            <ExpoCheckbox
              value={isSelected}
              color={isSelected ? colors.primary : undefined}
              style={styles.checkbox}
            />
          </View>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
    paddingRight: 15,
    height: 30,
    zIndex: 10,
  },
  badgeWrapper: { position: 'absolute', left: '10%', width: '80%', pointerEvents: 'none' },
  checkboxWrapper: { padding: 10, marginRight: -10, zIndex: 20 },
  checkbox: { width: 20, height: 20, borderRadius: 4 },
});

export default RequestCardHeader;

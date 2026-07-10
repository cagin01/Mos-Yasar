import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomCalendarIcon from '../../../shared/components/icons/CustomCalendarIcon';
import { Text, TextInput } from '@/src/shared/components/ui/ScaledText';


interface RequestFilterBarProps {
  onSearch: (text: string) => void;
  onSubmitSearch?: () => void;
  onDatePress: () => void;
  placeholder?: string;
  value?: string;
}

export default function RequestFilterBar({
  onSearch,
  onSubmitSearch,
  onDatePress,
  placeholder = 'Arama kriteri giriniz.',
  value,
}: RequestFilterBarProps) {
  const { colors } = useTheme();
  const todayDay = new Date().getDate();

  return (
    <View style={styles.container}>
      <View style={[styles.searchSection, { backgroundColor: colors.surfaceFilter }]}>
        <Ionicons name="search" size={20} color={colors.primary} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: colors.primary }]}
          placeholder={placeholder}
          placeholderTextColor={colors.primary}
          onChangeText={onSearch}
          onSubmitEditing={onSubmitSearch}
          value={value}
          selectionColor={colors.primary}
          returnKeyType="search"
        />
      </View>

      <TouchableOpacity style={styles.dateButton} onPress={onDatePress}>
        <View style={styles.iconWrapper}>
          <CustomCalendarIcon size={30} color={colors.primary} />
          <Text style={[styles.dayText, { color: colors.primary }]}>{todayDay}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 15, gap: 12 },
  searchSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, fontWeight: '500' },
  dateButton: { justifyContent: 'center', alignItems: 'center' },
  iconWrapper: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
  dayText: { position: 'absolute', top: 12, fontSize: 13, fontWeight: 'bold', textAlign: 'center', includeFontPadding: false },
});

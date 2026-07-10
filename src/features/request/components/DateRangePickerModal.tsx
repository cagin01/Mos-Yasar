import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { AppColors } from '@/src/shared/theme/colors';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, TextInput } from '@/src/shared/components/ui/ScaledText';

import { useDateRangePicker } from './useDateRangePicker';

LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
};
LocaleConfig.locales['en'] = {
  monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

interface DateRangePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (rangeText: string) => void;
}

export default function DateRangePickerModal({
  visible,
  onClose,
  onSave,
}: DateRangePickerModalProps) {
  const { colors } = useTheme();
  const { t, language } = useTranslation();
  LocaleConfig.defaultLocale = language;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const MONTH_NAMES = t.months;
  const QUICK_RANGES = [
    { key: 'last3days', label: t.requests.last3Days, days: 3 },
    { key: 'lastWeek', label: t.requests.last1Week, days: 7 },
    { key: 'last3weeks', label: t.requests.last3Weeks, days: 21 },
  ];
  const {
    applyQuickRange,
    canSave,
    currentDate,
    currentMonth,
    displayedYear,
    endInput,
    handleInputChange,
    handleMonthSelect,
    handleNext,
    handlePrevious,
    handleSave,
    handleYearSelect,
    markedDates,
    mode,
    onDayPress,
    setMode,
    startInput,
    yearOptions,
  } = useDateRangePicker({
    visible,
    onSave,
    primaryColor: colors.primary,
    rangeColor: colors.primaryLighter,
  });
  const displayedMonthName = MONTH_NAMES[currentDate.getMonth()];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.headerBar}>
          <Pressable onPress={onClose} style={styles.iconButton}>
            <Ionicons name="close" size={26} color={colors.textPrimary} />
          </Pressable>

          <Text style={styles.headerTitle}>{t.requests.dateRange}</Text>

          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            style={styles.iconButton}
          >
            <Ionicons
              name="checkmark-circle"
              size={28}
              color={canSave ? colors.primary : colors.borderLight}
            />
          </Pressable>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            value={startInput}
            onChangeText={(value) => handleInputChange('start', value)}
            keyboardType="number-pad"
            placeholder={t.requests.start}
            placeholderTextColor={colors.textCalendarPlaceholder}
            style={styles.dateInput}
            maxLength={10}
          />

          <View style={styles.arrowWrapper}>
            <Ionicons name="arrow-forward" size={18} color={colors.textCalendarArrow} />
          </View>

          <TextInput
            value={endInput}
            onChangeText={(value) => handleInputChange('end', value)}
            keyboardType="number-pad"
            placeholder={t.requests.end}
            placeholderTextColor={colors.textCalendarPlaceholder}
            style={styles.dateInput}
            maxLength={10}
          />
        </View>

        <View style={styles.quickRangeRow}>
          {QUICK_RANGES.map((quickRange) => (
            <Pressable
              key={quickRange.key}
              onPress={() => applyQuickRange(quickRange.days)}
              style={styles.quickRangeChip}
            >
              <Text style={styles.quickRangeChipText}>{quickRange.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.calendarWrapper}>
          <View style={styles.calendarHeader}>
            <Pressable onPress={handlePrevious} style={styles.headerControl}>
              <Ionicons name="chevron-back" size={22} color={colors.primary} />
            </Pressable>

            <View style={styles.titleGroup}>
              <Pressable onPress={() => setMode('month')} style={styles.titleButton}>
                <Text style={styles.titleButtonText}>{displayedMonthName}</Text>
              </Pressable>

              <Pressable onPress={() => setMode('year')} style={styles.titleButton}>
                <Text style={styles.titleButtonText}>{displayedYear}</Text>
              </Pressable>
            </View>

            <Pressable onPress={handleNext} style={styles.headerControl}>
              <Ionicons name="chevron-forward" size={22} color={colors.primary} />
            </Pressable>
          </View>

          {mode === 'calendar' && (
            <Calendar
              key={currentMonth}
              current={currentMonth}
              hideArrows={true}
              markingType="period"
              onDayPress={onDayPress}
              markedDates={markedDates}
              theme={{
                todayTextColor: colors.primary,
                textDayFontSize: 15,
                textMonthFontWeight: 'bold',
                monthTextColor: colors.textPrimary,
                textDayHeaderFontWeight: '600',
                calendarBackground: 'transparent',
                dayTextColor: colors.textPrimary,
                textDisabledColor: colors.textDisabled,
              }}
            />
          )}

          {mode === 'month' && (
            <View style={styles.selectionGrid}>
              {MONTH_NAMES.map((monthName, index) => (
                <Pressable
                  key={monthName}
                  onPress={() => handleMonthSelect(index)}
                  style={[
                    styles.selectionChip,
                    index === currentDate.getMonth() && styles.selectionChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectionChipText,
                      index === currentDate.getMonth() && styles.selectionChipTextActive,
                    ]}
                  >
                    {monthName}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {mode === 'year' && (
            <View style={styles.selectionGrid}>
              {yearOptions.map((year) => (
                <Pressable
                  key={year}
                  onPress={() => handleYearSelect(year)}
                  style={[
                    styles.selectionChip,
                    year === displayedYear && styles.selectionChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectionChipText,
                      year === displayedYear && styles.selectionChipTextActive,
                    ]}
                  >
                    {year}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: colors.surfaceCalendar,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderCalendar,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  iconButton: {
    padding: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 14,
  },
  dateInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderDate,
    paddingHorizontal: 14,
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  arrowWrapper: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickRangeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  quickRangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.primaryLighter,
    borderWidth: 1,
    borderColor: colors.primaryLighterBorder,
  },
  quickRangeChipText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  calendarWrapper: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderCalendar,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerControl: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLighter,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  titleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryLighter,
  },
  titleButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingTop: 8,
  },
  selectionChip: {
    width: '31%',
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.surfaceChip,
    borderWidth: 1,
    borderColor: colors.borderChip,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  selectionChipActive: {
    backgroundColor: colors.primaryLighter,
    borderColor: colors.primary,
  },
  selectionChipText: {
    color: colors.textBody,
    fontWeight: '600',
  },
  selectionChipTextActive: {
    color: colors.primary,
  },
});

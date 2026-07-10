import DateRangePickerModal from '@/src/features/request/components/DateRangePickerModal';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import EntranceTransition from '@/src/shared/components/ui/EntranceTransition';
import { Text } from '@/src/shared/components/ui/ScaledText';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import FilteredList from '../components/FilteredList';
import RequestFilterBar from '../components/RequestFilterBar';
import { useRequestHistory } from '../hooks/useRequestHistory';

export default function RequestHistoryScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const {
    activeCategoryTitle,
    allHistory,
    dateRangeText,
    handleDateRangeSave,
    handleRefresh,
    handleSubmitSearch,
    isContentReady,
    isLoading,
    isRefreshing,
    modalVisible,
    refreshKey,
    searchInputValue,
    setActiveCategoryTitle,
    setModalVisible,
    setSearchInputValue,
  } = useRequestHistory({
    connectionErrorTitle: t.common.connectionError,
    connectionErrorMessage: t.common.connectionErrorMessage,
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {/*{isContentReady && (
        <React.Fragment key={refreshKey}> */}
        <React.Fragment key={refreshKey}>
          <View style={styles.topSection} key={refreshKey}>
            <EntranceTransition delay={100}>
              <RequestFilterBar
                onSearch={setSearchInputValue}
                onSubmitSearch={handleSubmitSearch}
                onDatePress={() => setModalVisible(true)}
                placeholder={t.requests.searchPlaceholder}
                value={searchInputValue}
              />
            </EntranceTransition>

            <EntranceTransition delay={220}>
              <View style={styles.headerContainer}>
                <Text style={[styles.title, { color: colors.primary }]}>{t.requests.historyTitle}</Text>
                <Text style={[styles.subTitle, { color: colors.textPlaceholder }]}>{dateRangeText}</Text>
              </View>
            </EntranceTransition>

            <LinearGradient
              colors={[colors.surface, colors.surface + '00']}
              style={styles.headerFade}
              pointerEvents="none"
            />
          </View>

          <EntranceTransition delay={320} style={styles.listWrapper}>
            {allHistory.length === 0 ? (
              <ScrollView
                contentContainerStyle={styles.emptyContainer}
                overScrollMode="always"
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    colors={[colors.primary]}
                    tintColor={colors.primary}
                    progressBackgroundColor={colors.surface}
                  />
                }
              >
                <Ionicons name="document-text-outline" size={64} color="#9E9E9E" />
                <Text style={styles.emptyText}>{t.requests.noHistory}</Text>
              </ScrollView>
            ) : (
              <FilteredList
                data={allHistory}
                openCategory={activeCategoryTitle}
                onToggle={(categoryTitle) =>
                  setActiveCategoryTitle((prev) => (prev === categoryTitle ? null : categoryTitle))
                }
                onDetailsPress={(item) =>
                  router.push({
                    pathname: '/request/[id]',
                    params: { id: item.id, source: 'history' },
                  })
                }
                selectedIds={[]}
                onSelect={() => {}}
                variant="history"
                onRefresh={handleRefresh}
                refreshing={isRefreshing}
              />
            )}
          </EntranceTransition>
        </React.Fragment>
      

      <DateRangePickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(rangeText: string) => {
          // 1. Önce modal penceresini kapatıp native animasyonun başlamasını sağlıyoruz
          setModalVisible(false);
          
          // Böylece AppLoader ve Modal native katmanda asla çarpışmıyor!
          setTimeout(() => {
            handleDateRangeSave(rangeText);
          }, 400);
        }}
      />

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  topSection: { zIndex: 1, overflow: 'visible' },
  headerFade: { position: 'absolute', bottom: -14, left: 0, right: 0, height: 14 },
  headerContainer: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 1,
  },
  subTitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listWrapper: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 15, color: '#9E9E9E', textAlign: 'center' },
});

import FilteredList from '@/src/features/request/components/FilteredList';
import RadioDateModal from '@/src/features/request/components/RadioDateModal';
import { isNetworkError } from '@/src/shared/api/apiClient';
import ActionDrawer from '@/src/shared/components/ui/ActionDrawer';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import ConfirmModal from '@/src/shared/components/ui/ConfirmModal';
import EntranceTransition from '@/src/shared/components/ui/EntranceTransition';
import OperationDescriptionModal from '@/src/shared/components/ui/OperationDescriptionModal';
import { Text } from '@/src/shared/components/ui/ScaledText';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text as RNText, StyleSheet, View } from 'react-native';
import RequestFilterBar from '../components/RequestFilterBar';
import { useRequestList } from '../hooks/useRequestList';
import { requestService } from '../services/requestService';
import { RequestOperation } from '../types';


export default function RequestListScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [pendingOperation, setPendingOperation] = useState<RequestOperation | null>(null);
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [bulkConfirmVisible, setBulkConfirmVisible] = useState(false);
  const [pendingBulk, setPendingBulk] = useState<{ operation: RequestOperation; description: string | null } | null>(null);
  const {
    activeCategoryTitle,
    availableDates,
    canBulkApprove,
    canSelectRequest,
    fetchData,
    handleRefresh,
    handleSelectRequest,
    handleToggleCategory,
    isContentReady,
    isLoading,
    isRefreshing,
    modalVisible,
    processedData,
    refreshKey,
    searchKeyword,
    selectedCategory,
    selectedIds,
    selectedOperations,
    setIsLoading,
    setModalVisible,
    setSearchKeyword,
    setSelectedIds,
  } = useRequestList({
    actionFailedMessage: t.common.actionFailed,
    connectionErrorMessage: t.common.connectionErrorMessage,
    connectionErrorTitle: t.common.connectionError,
    genericErrorTitle: t.common.error,
  });

  const executeOperation = async (operation: RequestOperation, description: string | null) => {
    if (selectedIds.length === 0) return;
    setIsLoading(true);
    try {
      await requestService.processMultipleAction(selectedIds, operation, description);
      setSelectedIds([]);
      await fetchData();
    } catch (error) {
      if (isNetworkError(error)) {
        Alert.alert(t.common.connectionError, t.common.connectionErrorMessage);
      } else {
        Alert.alert(t.common.error, error instanceof Error ? error.message : t.common.actionFailed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionComplete = (operation: RequestOperation) => {
    if (selectedIds.length === 0) return;
    if ((operation.requiresDescription ?? 0) === 0) {
      setPendingBulk({ operation, description: null });
      setBulkConfirmVisible(true);
    } else {
      setPendingOperation(operation);
      setDescriptionModalVisible(true);
    }
  };

  const handleDescriptionConfirm = (description: string | null) => {
    setDescriptionModalVisible(false);
    if (pendingOperation) {
      setPendingBulk({ operation: pendingOperation, description });
      setBulkConfirmVisible(true);
    }
    setPendingOperation(null);
  };

  const handleDescriptionCancel = () => {
    setDescriptionModalVisible(false);
    setPendingOperation(null);
  };

  const handleBulkConfirm = () => {
    setBulkConfirmVisible(false);
    if (pendingBulk) executeOperation(pendingBulk.operation, pendingBulk.description);
    setPendingBulk(null);
  };

  const handleBulkCancel = () => {
    setBulkConfirmVisible(false);
    setPendingBulk(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      {isContentReady && (
        <React.Fragment key={refreshKey}>
          <View style={styles.topSection}>
            <EntranceTransition delay={100}>
              <RequestFilterBar
                onSearch={setSearchKeyword}
                onDatePress={() => setModalVisible(true)}
                placeholder={t.requests.searchPlaceholder}
                value={searchKeyword}
              />
            </EntranceTransition>

            <EntranceTransition delay={220}>
              <View style={styles.headerContainer}>
                <Text style={[styles.title, { color: colors.primary }]}>{t.requests.listTitle}</Text>
                <View style={styles.spacingPlaceholder} />
              </View>
            </EntranceTransition>

            <LinearGradient
              colors={[colors.surface, colors.surface + '00']}
              style={styles.headerFade}
              pointerEvents="none"
            />
          </View>
          {/*
          <EntranceTransition delay={320} style={styles.listWrapper}>
            {processedData.length === 0 ? (
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
                <Ionicons name="checkmark-circle-outline" size={64} color="#9E9E9E" />
                <Text style={styles.emptyText}>{t.requests.noRequests}</Text>
              </ScrollView>
              ) : (
              */}
              <EntranceTransition delay={320} style={styles.listWrapper}>
            <FilteredList
              data={processedData} // To optimize list performance Nc
              selectedIds={selectedIds}
              variant="request"
              showSelection={canBulkApprove}
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
              onSelect={handleSelectRequest}
              openCategory={activeCategoryTitle}
              canSelectRequest={canSelectRequest}
              onToggle={handleToggleCategory}
              onDetailsPress={(item) =>
                router.push({
                  pathname: '/request/[id]',
                  params: { id: item.id, source: 'request' },
                })
              }
            /> 

          </EntranceTransition>
          {/*
              <FilteredList
                data={processedData}
                selectedIds={selectedIds}
                variant="request"
                showSelection={canBulkApprove}
                onRefresh={handleRefresh}
                refreshing={isRefreshing}
                onSelect={handleSelectRequest}
                openCategory={activeCategoryTitle}
                canSelectRequest={canSelectRequest}
                onToggle={handleToggleCategory}
                onDetailsPress={(item) =>
                  router.push({
                    pathname: '/request/[id]',
                    params: { id: item.id, source: 'request' },
                  })
                }
              />
            )}
          </EntranceTransition>
          */}
        </React.Fragment>
      )}

      <ActionDrawer
        selectedIds={selectedIds}
        operations={selectedOperations}
        onActionComplete={handleActionComplete}
        hasBottomNavbar
        coverTopSafeArea
      />

      <OperationDescriptionModal
        visible={descriptionModalVisible}
        operation={pendingOperation}
        required={(pendingOperation?.requiresDescription ?? 0) === 1}
        onConfirm={handleDescriptionConfirm}
        onCancel={handleDescriptionCancel}
      />

      <ConfirmModal
        visible={bulkConfirmVisible}
        onConfirm={handleBulkConfirm}
        onCancel={handleBulkCancel}
        message={
          <RNText style={{ fontSize: 16, textAlign: 'center', lineHeight: 22, color: colors.textHeading }}>
            <RNText style={{ fontWeight: 'bold' }}>{selectedIds.length} adet </RNText>
            <RNText style={{ fontWeight: 'bold' }}>{selectedCategory} </RNText>
            {'talebi toplu olarak işlenecektir. Devam etmek istiyor musunuz?'}
          </RNText>
        }
      />

      <RadioDateModal
        visible={modalVisible}
        currentSelection={searchKeyword}
        availableDates={availableDates}
        onClose={() => setModalVisible(false)}
        onApply={(date) => {
          setSearchKeyword(date);
          setModalVisible(false);
        }}
      />

      <AppLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 8, paddingTop: 10 },
  topSection: { zIndex: 1, overflow: 'visible' },
  headerContainer: { alignItems: 'center', marginTop: 15, marginBottom: 15 },
  title: { fontSize: 18, fontWeight: '500', letterSpacing: 1 },
  spacingPlaceholder: { height: 23 },
  headerFade: { position: 'absolute', bottom: -14, left: 0, right: 0, height: 14 },
  listWrapper: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 16, fontSize: 15, color: '#9E9E9E', textAlign: 'center' },
});

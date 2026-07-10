import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import { isNetworkError } from '@/src/shared/api/apiClient';
import { useAuthStore } from '@/src/store/useAuthStore';

import { requestService } from '../services/requestService';
import { CategoryGroup, RequestOperation, RequestSummary } from '../types';
import { useRequestFilter } from './useRequestFilter';

type UseRequestListParams = {
  actionFailedMessage: string;
  connectionErrorMessage: string;
  connectionErrorTitle: string;
  genericErrorTitle: string;
};

export function useRequestList({
  actionFailedMessage,
  connectionErrorMessage,
  connectionErrorTitle,
  genericErrorTitle,
}: UseRequestListParams) {
  const { session } = useAuthStore();
  const [allRequests, setAllRequests] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isContentReady, setIsContentReady] = useState(false);
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { searchKeyword, setSearchKeyword, processedData } = useRequestFilter(allRequests);

  const canBulkApprove = session?.user?.roles?.includes('bulk_approve') ?? false;
  const canSelectRequest = useCallback(
    (item: Pick<RequestSummary, 'multipleApprove'>) => canBulkApprove || Boolean(item.multipleApprove),
    [canBulkApprove],
  );

  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    allRequests.forEach((group) => {
      group.data.forEach((item) => {
        if (item.baslangic && item.baslangic !== '-') {
          dates.add(item.baslangic);
        }
      });
    });
    return Array.from(dates).sort();
  }, [allRequests]);

  const categoryRequestIds = useMemo(() => {
    return allRequests.reduce<Record<string, string[]>>((accumulator, group) => {
      accumulator[group.category] = group.data.map((item) => item.id);
      return accumulator;
    }, {});
  }, [allRequests]);

  const selectedOperations = useMemo<RequestOperation[]>(() => {
    for (const group of allRequests) {
      for (const item of group.data) {
        if (selectedIds.includes(item.id)) {
          return item.operations ?? [];
        }
      }
    }
    return [];
  }, [allRequests, selectedIds]);

  const selectedCategory = useMemo(() => {
    for (const group of allRequests) {
      if (group.data.some((item) => selectedIds.includes(item.id))) {
        return group.category;
      }
    }
    return '';
  }, [allRequests, selectedIds]);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) {
        setIsContentReady(false);
        setIsLoading(true);
      }
      try {
        const data = await requestService.getRequests();
        setAllRequests(data);
        setIsContentReady(true);
      } catch (error) {
        setIsContentReady(true);
        if (isNetworkError(error)) {
          Alert.alert(connectionErrorTitle, connectionErrorMessage);
        } else {
          Alert.alert(genericErrorTitle, error instanceof Error ? error.message : actionFailedMessage);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        if (silent) setRefreshKey((key) => key + 1);
      }
    },
    [actionFailedMessage, connectionErrorMessage, connectionErrorTitle, genericErrorTitle],
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  const handleSelectRequest = useCallback((id: string, value: boolean) => {
    setSelectedIds((prev) =>
      value ? Array.from(new Set([...prev, id])) : prev.filter((itemId) => itemId !== id),
    );
  }, []);

  const handleToggleCategory = useCallback(
    (categoryTitle: string) => {
      setActiveCategoryTitle((prev) => {
        const closingCategory = prev === categoryTitle ? categoryTitle : prev;
        const closingCategoryIds = closingCategory ? (categoryRequestIds[closingCategory] ?? []) : [];

        if (closingCategoryIds.length > 0) {
          setSelectedIds((currentSelectedIds) =>
            currentSelectedIds.filter((selectedId) => !closingCategoryIds.includes(selectedId)),
          );
        }

        return prev === categoryTitle ? null : categoryTitle;
      });
    },
    [categoryRequestIds],
  );

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  return {
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
    activeCategoryTitle,
  };
}

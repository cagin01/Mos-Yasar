import { useCallback, useEffect, useState } from 'react';
import { Alert, InteractionManager } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { isNetworkError } from '@/src/shared/api/apiClient';

import { parseDateRangeText, requestService } from '../services/requestService';
import { CategoryGroup } from '../types';

function getDefaultDateRange() {
  const today = new Date();
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(today.getDate() - 3);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return `${formatDate(threeDaysAgo)} - ${formatDate(today)}`;
}

type UseRequestHistoryParams = {
  connectionErrorTitle: string;
  connectionErrorMessage: string;
};

export function useRequestHistory({
  connectionErrorTitle,
  connectionErrorMessage,
}: UseRequestHistoryParams) {
  const [allHistory, setAllHistory] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isContentReady, setIsContentReady] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string | null>(null);
  const [dateRangeText, setDateRangeText] = useState(getDefaultDateRange());
  const [searchInputValue, setSearchInputValue] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    if (!isContentReady) {
      return;
    }

    let firstFrameId: number | undefined;
    let secondFrameId: number | undefined;
    const interaction = InteractionManager.runAfterInteractions(() => {
      firstFrameId = requestAnimationFrame(() => {
        secondFrameId = requestAnimationFrame(() => setIsLoading(false));
      });
    });

    return () => {
      interaction.cancel();
      if (firstFrameId !== undefined) {
        cancelAnimationFrame(firstFrameId);
      }
      if (secondFrameId !== undefined) {
        cancelAnimationFrame(secondFrameId);
      }
    };
  }, [isContentReady]);

  const fetchHistory = useCallback(
    async (rangeText: string, nextSearchValue = '', silent = false) => {
      if (!silent) {
        setIsContentReady(false);
        setIsLoading(true);
      }
      try {
        const data = await requestService.getRequestHistory({
          range: parseDateRangeText(rangeText),
          searchValue: nextSearchValue,
        });
        setAllHistory(data);
        setIsContentReady(true);
      } catch (error) {
        setIsContentReady(true);
        if (isNetworkError(error)) {
          Alert.alert(connectionErrorTitle, connectionErrorMessage);
        }
      } finally {
        setIsRefreshing(false);
        if (silent) setRefreshKey((key) => key + 1);
      }
    },
    [connectionErrorMessage, connectionErrorTitle],
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHistory(dateRangeText, searchKeyword, true);
  }, [dateRangeText, fetchHistory, searchKeyword]);

  const handleSubmitSearch = useCallback(() => {
    setActiveCategoryTitle(null);
    setSearchKeyword(searchInputValue);
    fetchHistory(dateRangeText, searchInputValue);
  }, [dateRangeText, fetchHistory, searchInputValue]);

  const handleDateRangeSave = useCallback(
    (rangeText: string) => {
      setDateRangeText(rangeText);
      setModalVisible(false);
      fetchHistory(rangeText, searchKeyword);
    },
    [fetchHistory, searchKeyword],
  );

  useFocusEffect(
    useCallback(() => {
      setActiveCategoryTitle(null);
      fetchHistory(dateRangeText, searchKeyword);
    }, [dateRangeText, fetchHistory, searchKeyword]),
  );

  return {
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
  };
}

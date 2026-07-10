import { useCallback, useState } from 'react';

import { isNetworkError } from '@/src/shared/api/apiClient';

import { requestService } from '../services/requestService';
import { RequestDetail } from '../types';

type UseRequestDetailParams = {
  id?: string;
  source?: string;
  onNetworkError: () => void;
};

export function useRequestDetail({ id, source, onNetworkError }: UseRequestDetailParams) {
  const [isLoading, setIsLoading] = useState(false);
  const [request, setRequest] = useState<RequestDetail | null>(null);

  const loadRequest = useCallback(async () => {
    if (!id) {
      return;
    }

    setIsLoading(true);
    try {
      const nextRequest = await requestService.getRequestById(
        id,
        source === 'history' ? 'history' : 'request',
      );
      setRequest(nextRequest);
    } catch (error) {
      if (isNetworkError(error)) {
        onNetworkError();
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, onNetworkError, source]);

  return {
    isLoading,
    loadRequest,
    request,
    setIsLoading,
  };
}

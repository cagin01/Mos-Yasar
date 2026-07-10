import { useState } from 'react';

import { isNetworkError } from '@/src/shared/api/apiClient';

import { requestService } from '../services/requestService';
import { RequestDetail, RequestOperation } from '../types';

type UseRequestActionParams = {
  request: RequestDetail | null;
  loadRequest: () => Promise<void>;
  onActionError: (message: string) => void;
  onNetworkError: () => void;
};

export function useRequestAction({
  request,
  loadRequest,
  onActionError,
  onNetworkError,
}: UseRequestActionParams) {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [pendingOperation, setPendingOperation] = useState<RequestOperation | null>(null);
  const [descriptionModalVisible, setDescriptionModalVisible] = useState(false);
  const [actionDone, setActionDone] = useState(false);

  const executeOperation = async (operation: RequestOperation, description: string | null) => {
    if (!request) return;
    setIsActionLoading(true);
    try {
      await requestService.processAction([request.id], operation, description);
      setActionDone(true);
      await loadRequest();
    } catch (error) {
      if (isNetworkError(error)) {
        onNetworkError();
      } else {
        onActionError(error instanceof Error ? error.message : '');
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleActionComplete = (operation: RequestOperation) => {
    if (!request) return;
    if ((operation.requiresDescription ?? 0) === 0) {
      executeOperation(operation, null);
    } else {
      setPendingOperation(operation);
      setDescriptionModalVisible(true);
    }
  };

  const handleDescriptionConfirm = (description: string | null) => {
    setDescriptionModalVisible(false);
    if (pendingOperation) executeOperation(pendingOperation, description);
    setPendingOperation(null);
  };

  const handleDescriptionCancel = () => {
    setDescriptionModalVisible(false);
    setPendingOperation(null);
  };

  return {
    actionDone,
    descriptionModalVisible,
    handleActionComplete,
    handleDescriptionCancel,
    handleDescriptionConfirm,
    isActionLoading,
    pendingOperation,
  };
}

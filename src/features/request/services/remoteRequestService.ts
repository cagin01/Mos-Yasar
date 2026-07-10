import { APP_VERSION_BY_PLATFORM, appConfig } from '@/src/config/appConfig';
import {
  ApproveRequestDto,
  ApproveResponseDto,
  MultipleApproveRequestDto,
  MultipleApproveResponseDto,
  RemoteAttachmentContentResponseDto,
  RemoteRequestDetailResponseDto,
  RemoteRequestHistoryQueryDto,
  RemoteRequestHistoryResponseDto,
  RemoteRequestListResponseDto,
} from '@/src/features/request/api/contracts';
import { RequestOperation, RequestQuery, RequestSummary } from '@/src/features/request/types';
import { AuthenticatedApiClient } from '@/src/shared/api/authenticatedApiClient';
import { assertApiSuccess } from '@/src/shared/api/apiEnvelope';
import { authStore } from '@/src/store/useAuthStore';
import { Platform } from 'react-native';
import { mockRequestService } from './mockRequestService';
import {
  buildDeviceInfo,
  createRequestDetails,
  encodeAsciiToBase64,
  formatDateForHistoryApi,
  mapRemoteHistoryRequestToDomain,
  mapRemoteRequestDetailToDomain,
  mapRemoteResponseToGroups,
} from './requestMapper';
import {
  getCachedRemoteRequestById,
  setRemoteGroupsCache,
  setRemoteHistoryGroupsCache,
} from './remoteRequestCache';
import { RequestService } from './types';

const GET_REQUESTS_SINGLE_PATH = '/mos/api/v3/GetRequestsSingle';
const GET_REQUESTS_BY_DATE_RANGE_PATH = '/mos/api/v3/GetRequestsByDateRange';
const GET_DESCRIPTION_PATH = '/mos/api/v3/GetDescription';
const GET_ATTACHMENT_CONTENT_PATH = '/mos/api/v3/GetAttachmentContent';

const apiClient = new AuthenticatedApiClient(appConfig.api.baseUrl);

export function isRemoteRequestListEnabled() {
  const session = authStore.getState().session;
  return session?.mode === 'remote' && Boolean(session.accessToken);
}

export const remoteRequestService: RequestService = {
  async getRequests() {
    if (!isRemoteRequestListEnabled()) return mockRequestService.getRequests();

    const response = await apiClient.request<RemoteRequestListResponseDto>(GET_REQUESTS_SINGLE_PATH);
    assertApiSuccess(response);
    const groups = mapRemoteResponseToGroups(response.data ?? []);
    setRemoteGroupsCache(groups);
    return groups;
  },

  async getRequestHistory(query?: RequestQuery) {
    if (!isRemoteRequestListEnabled() || !query?.range) {
      return mockRequestService.getRequestHistory(query);
    }

    const body: RemoteRequestHistoryQueryDto = {
      startDate: formatDateForHistoryApi(query.range.start),
      endDate: formatDateForHistoryApi(query.range.end, true),
      searchValue: query.searchValue ?? '',
    };

    const response = await apiClient.request<RemoteRequestHistoryResponseDto>(
      GET_REQUESTS_BY_DATE_RANGE_PATH,
      { method: 'POST', body },
    );
    assertApiSuccess(response);

    const grouped = new Map<string, RequestSummary[]>();
    (response.data ?? []).forEach((item) => {
      const category = item.subject?.trim() || 'Diger';
      const existing = grouped.get(category) ?? [];
      existing.push(mapRemoteHistoryRequestToDomain(item));
      grouped.set(category, existing);
    });

    const groups = Array.from(grouped.entries()).map(([category, data]) => ({ category, data }));
    setRemoteHistoryGroupsCache(groups);
    return groups;
  },

  async getRequestById(id: string, source?: 'request' | 'history') {
    if (!isRemoteRequestListEnabled()) return mockRequestService.getRequestById(id);

    const response = await apiClient.request<RemoteRequestDetailResponseDto>(
      `${GET_DESCRIPTION_PATH}/${id}`,
    );
    assertApiSuccess(response);

    if (!response.data) {
      return getCachedRemoteRequestById(id, source) ?? mockRequestService.getRequestById(id);
    }

    return createRequestDetails(mapRemoteRequestDetailToDomain(response.data));
  },

  async getAttachmentContent(attachmentId: string) {
    if (!isRemoteRequestListEnabled()) return null;

    const encoded = encodeAsciiToBase64(attachmentId);
    const response = await apiClient.request<RemoteAttachmentContentResponseDto>(
      `${GET_ATTACHMENT_CONTENT_PATH}?attachmentId=${encodeURIComponent(encoded)}`,
    );
    assertApiSuccess(response);

    if (!response.data?.content) return null;
    return {
      id: response.data.attachmentId || attachmentId,
      name: response.data.name || 'ek',
      content: response.data.content,
    };
  },

  async processAction(ids: string[], operation: RequestOperation, description: string | null) {
    if (!isRemoteRequestListEnabled()) {
      return mockRequestService.processAction(ids, operation, description);
    }

    const appVersion = APP_VERSION_BY_PLATFORM[Platform.OS === 'ios' ? 'ios' : 'android'];
    const deviceInfo = buildDeviceInfo();

    await Promise.all(
      ids.map(async (requestId) => {
        const body: ApproveRequestDto = {
          appVersion,
          deviceInfo,
          operationDescription: description,
          requestId,
          status: operation.statusCode,
        };
        const response = await apiClient.request<ApproveResponseDto>(
          '/mos/api/v3/Approve3',
          { method: 'POST', body },
        );
        assertApiSuccess(response);
      }),
    );
  },

  async processMultipleAction(ids: string[], operation: RequestOperation, description: string | null) {
    if (!isRemoteRequestListEnabled()) {
      return mockRequestService.processMultipleAction(ids, operation, description);
    }

    const { session } = authStore.getState();
    const body: MultipleApproveRequestDto = {
      approver: session?.user.email ?? '',
      idList: ids,
      operationDescription: description ?? '',
      status: operation.statusCode,
    };
    const response = await apiClient.request<MultipleApproveResponseDto>(
      '/mos/api/v3/multipleApprove',
      { method: 'POST', body },
    );
    assertApiSuccess(response);
  },
};

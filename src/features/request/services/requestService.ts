import { mockRequestService } from './mockRequestService';
import { isRemoteRequestListEnabled, remoteRequestService } from './remoteRequestService';
import { RequestService } from './types';

export { parseDateRangeText } from './requestMapper';
export type { RequestService } from './types';

export const requestService: RequestService = {
  getRequests: () =>
    isRemoteRequestListEnabled()
      ? remoteRequestService.getRequests()
      : mockRequestService.getRequests(),

  getRequestHistory: (query) =>
    isRemoteRequestListEnabled()
      ? remoteRequestService.getRequestHistory(query)
      : mockRequestService.getRequestHistory(query),

  getRequestById: (id, source) =>
    isRemoteRequestListEnabled()
      ? remoteRequestService.getRequestById(id, source)
      : mockRequestService.getRequestById(id),

  getAttachmentContent: (attachmentId) =>
    isRemoteRequestListEnabled()
      ? remoteRequestService.getAttachmentContent(attachmentId)
      : mockRequestService.getAttachmentContent(attachmentId),

  processAction: (ids, operation, description) =>
    isRemoteRequestListEnabled()
      ? remoteRequestService.processAction(ids, operation, description)
      : mockRequestService.processAction(ids, operation, description),

  processMultipleAction: (ids, operation, description) =>
    isRemoteRequestListEnabled()
      ? remoteRequestService.processMultipleAction(ids, operation, description)
      : mockRequestService.processMultipleAction(ids, operation, description),
};

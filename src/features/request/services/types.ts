import {
  CategoryGroup,
  RequestAttachmentContent,
  RequestDetail,
  RequestOperation,
  RequestQuery,
} from '@/src/features/request/types';

export interface RequestService {
  getRequests(): Promise<CategoryGroup[]>;
  getRequestHistory(query?: RequestQuery): Promise<CategoryGroup[]>;
  getRequestById(id: string, source?: 'request' | 'history'): Promise<RequestDetail | null>;
  getAttachmentContent(attachmentId: string): Promise<RequestAttachmentContent | null>;
  processAction(ids: string[], operation: RequestOperation, description: string | null): Promise<void>;
  processMultipleAction(ids: string[], operation: RequestOperation, description: string | null): Promise<void>;
}

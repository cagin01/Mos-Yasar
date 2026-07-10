import { CategoryGroup, RequestAttachmentContent, RequestOperation, RequestQuery } from '@/src/features/request/types';
import { DUMMY_DATA } from '@/src/shared/api/mockData';
import { createRequestDetails, isInRange, parseTurkishDate } from './requestMapper';
import { RequestService } from './types';

function cloneGroups(groups: CategoryGroup[]): CategoryGroup[] {
  return groups.map((group) => ({
    ...group,
    data: group.data.map((item) => ({ ...item })),
  }));
}

const mockGroups = cloneGroups(DUMMY_DATA as CategoryGroup[]);

export const mockRequestService: RequestService = {
  async getRequests() {
    return cloneGroups(mockGroups);
  },

  async getRequestHistory(query?: RequestQuery) {
    return cloneGroups(mockGroups)
      .map((group) => ({
        ...group,
        data: group.data.filter((item) => isInRange(parseTurkishDate(item.baslangic), query?.range)),
      }))
      .filter((group) => group.data.length > 0);
  },

  async getRequestById(id: string) {
    for (const group of mockGroups) {
      const match = group.data.find((item) => item.id === id);
      if (match) return createRequestDetails({ ...match, kategori: group.category });
    }
    return null;
  },

  async getAttachmentContent(): Promise<RequestAttachmentContent | null> {
    return null;
  },

  async processAction(ids: string[], operation: RequestOperation, _description: string | null) {
    mockGroups.forEach((group) => {
      group.data = group.data.map((item) =>
        ids.includes(item.id) ? { ...item, onayDurumu: operation.operationName } : item,
      );
    });
  },

  async processMultipleAction(ids: string[], operation: RequestOperation, description: string | null) {
    return mockRequestService.processAction(ids, operation, description);
  },
};

import { CategoryGroup } from '@/src/features/request/types';
import { createRequestDetails } from './requestMapper';

let remoteGroupsCache: CategoryGroup[] = [];
let remoteHistoryGroupsCache: CategoryGroup[] = [];

function cloneGroups(groups: CategoryGroup[]): CategoryGroup[] {
  return groups.map((group) => ({
    ...group,
    data: group.data.map((item) => ({ ...item })),
  }));
}

export function setRemoteGroupsCache(groups: CategoryGroup[]) {
  remoteGroupsCache = cloneGroups(groups);
}

export function setRemoteHistoryGroupsCache(groups: CategoryGroup[]) {
  remoteHistoryGroupsCache = cloneGroups(groups);
}

export function getCachedRemoteRequestById(id: string, source?: 'request' | 'history') {
  const cache = source === 'history' ? remoteHistoryGroupsCache : remoteGroupsCache;
  for (const group of cache) {
    const match = group.data.find((item) => item.id === id);
    if (match) return createRequestDetails({ ...match, kategori: match.kategori ?? group.category });
  }
  return null;
}

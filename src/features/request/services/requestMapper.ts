import { en } from '@/src/shared/i18n/en';
import { tr } from '@/src/shared/i18n/tr';
import { languageStore } from '@/src/store/useLanguageStore';
import {
  RemoteRequestDetailDataDto,
  RemoteRequestHistoryItemDto,
  RemoteRequestItemDto,
} from '@/src/features/request/api/contracts';

const allTranslations = { tr, en } as const;
const getT = () => allTranslations[languageStore.getState().language];
import {
  CategoryGroup,
  RequestDetail,
  RequestSummary,
} from '@/src/features/request/types';
import { mapAttachmentsToDomain } from './attachmentMapper';
import { parseRequestDate } from './dateUtils';
import { getDescriptionLines, parseDescriptionValue } from './descriptionParser';
import { buildDetailSections } from './detailSectionMapper';
import { mapOperationsToDomain } from './operationMapper';
import {
  deriveApprovalStatus,
  mapResolvedStatusCodeToColors,
  mapResolvedStatusCodeToLabel,
  resolveStatusColorsFromOperations,
} from './statusMapper';

export {
  formatDateForHistoryApi,
  isInRange,
  parseDateRangeText,
  parseTurkishDate,
} from './dateUtils';
export { buildDeviceInfo } from './deviceInfo';
export { encodeAsciiToBase64 } from './encoding';

export function createRequestDetails(item: RequestSummary): RequestDetail {
  return {
    ...item,
    isim: item.gonderen,
    tarih: item.tarih ?? item.baslangic,
    belgeNo: item.belgeNo ?? `BEL-${item.istekNo}`,
    acilis: item.acilis ?? item.baslangic,
    modul: item.modul ?? 'SAP Workflow',
    kategori: item.kategori ?? item.sirket,
    aciklama:
      item.aciklama ??
      getT().requests.pendingApprovalMessage
        .replace('{{sender}}', item.gonderen)
        .replace('{{category}}', item.kategori ?? item.sirket),
  };
}

export function mapRemoteRequestToDomain(item: RemoteRequestItemDto): RequestSummary {
  const company =
    parseDescriptionValue(item.descriptionList, ['Sirket', 'Satis Org']) ??
    item.subSubject ?? item.subject;
  const startDate =
    parseDescriptionValue(item.descriptionList, ['Aktivite Baslangic Tarihi', 'Baslangic Tarihi', 'Acilis Tarihi']) ??
    parseRequestDate(item.requestDate);
  const endDate =
    parseDescriptionValue(item.descriptionList, ['Aktivite Bitis Tarihi', 'Bitis Tarihi']) ?? '-';
  const statusColors = mapResolvedStatusCodeToColors(item.status);

  return {
    id: item.requestId,
    istekNo: item.referenceDocument,
    gonderen: item.requesterFullName,
    sirket: company,
    statu: mapResolvedStatusCodeToLabel(item.status),
    baslangic: startDate,
    bitis: endDate,
    onayDurumu: deriveApprovalStatus(item),
    isim: item.requesterFullName,
    tarih: parseRequestDate(item.requestDate),
    belgeNo: item.referenceDocument,
    acilis: startDate,
    modul: parseDescriptionValue(item.descriptionList, ['Modul']) ?? item.subject,
    kategori: parseDescriptionValue(item.descriptionList, ['Kategori']) ?? item.subject,
    aciklama: item.description,
    operations: mapOperationsToDomain(item),
    statusCode: item.status,
    statusLabel: mapResolvedStatusCodeToLabel(item.status),
    descriptionList: item.descriptionList,
    statusBackgroundColor: statusColors.backgroundColor,
    statusTextColor: statusColors.textColor,
    subCategory: item.subSubject ?? undefined,
    multipleApprove: item.multipleApprove,
    descriptionRequirement: item.descriptionRequirement,
  };
}

export function mapRemoteHistoryRequestToDomain(item: RemoteRequestHistoryItemDto): RequestSummary {
  const lines = getDescriptionLines(item.description);
  const company =
    parseDescriptionValue(lines, ['Sirket', 'Satis Org']) ?? item.subSubject ?? item.subject;
  const startDate =
    parseDescriptionValue(lines, ['Aktivite Baslangic Tarihi', 'Baslangic Tarihi', 'Acilis Tarihi']) ??
    parseRequestDate(item.requestDate);
  const endDate =
    parseDescriptionValue(lines, ['Aktivite Bitis Tarihi', 'Bitis Tarihi']) ?? '-';
  const statusColors = resolveStatusColorsFromOperations(item.operations, item.status);

  return {
    id: item.requestId,
    istekNo: item.referenceDocument,
    gonderen: item.requesterFullName,
    sirket: company,
    statu: mapResolvedStatusCodeToLabel(item.status),
    baslangic: startDate,
    bitis: endDate,
    onayDurumu: (() => { const t = getT(); return item.status === 1 ? t.requests.approved : item.status === 2 ? t.requests.rejected : t.requests.completed; })(),
    isim: item.requesterFullName,
    tarih: parseRequestDate(item.requestDate),
    belgeNo: item.referenceDocument,
    acilis: startDate,
    modul: parseDescriptionValue(lines, ['Modul']) ?? item.subject,
    kategori: parseDescriptionValue(lines, ['Kategori']) ?? item.subject,
    aciklama: item.description,
    operations: mapOperationsToDomain({ operations: item.operations }),
    statusCode: item.status,
    statusLabel: mapResolvedStatusCodeToLabel(item.status),
    descriptionList: lines,
    statusBackgroundColor: statusColors.backgroundColor,
    statusTextColor: statusColors.textColor,
    subCategory: item.subSubject ?? undefined,
    multipleApprove: item.multipleApprove ?? false,
    approver: item.approver,
  };
}

export function mapRemoteRequestDetailToDomain(detail: RemoteRequestDetailDataDto): RequestDetail {
  const descriptionLines = (detail.descriptions ?? [])
    .filter((item) => item.type === 1)
    .sort((a, b) => a.line_number - b.line_number)
    .map((item) => item.data);
  const company =
    parseDescriptionValue(descriptionLines, ['Sirket', 'Satis Org']) ??
    detail.subSubject ?? detail.subject;
  const startDate =
    parseDescriptionValue(descriptionLines, ['Aktivite Baslangic Tarihi', 'Baslangic Tarihi', 'Acilis Tarihi']) ??
    parseRequestDate(detail.requestDate);
  const endDate =
    parseDescriptionValue(descriptionLines, ['Aktivite Bitis Tarihi', 'Bitis Tarihi']) ?? '-';
  const pseudoListItem: RemoteRequestItemDto = {
    requestId: detail.requestId,
    status: detail.status,
    subject: detail.subject,
    descriptionList: descriptionLines,
    approver: detail.approver,
    referenceDocument: detail.referenceDocument,
    subSubject: detail.subSubject,
    requestDate: detail.requestDate,
    requesterFullName: detail.requesterFullName,
    multipleApprove: detail.multipleApprove,
    description: descriptionLines.join('\n'),
    operations: detail.operations,
    descriptionRequirement: detail.descriptionRequirement,
    approvalRequiresDescription: detail.approvalRequiresDescription,
  };
  const statusColors = resolveStatusColorsFromOperations(detail.operations, detail.status);

  return {
    id: detail.requestId,
    istekNo: detail.referenceDocument,
    gonderen: detail.requesterFullName,
    sirket: company,
    statu: mapResolvedStatusCodeToLabel(detail.status),
    baslangic: startDate,
    bitis: endDate,
    onayDurumu: deriveApprovalStatus(detail),
    isim: detail.requesterFullName,
    tarih: parseRequestDate(detail.requestDate),
    belgeNo: detail.referenceDocument,
    acilis: startDate,
    modul: parseDescriptionValue(descriptionLines, ['Modul']) ?? detail.subject,
    kategori: parseDescriptionValue(descriptionLines, ['Kategori']) ?? detail.subject,
    aciklama: descriptionLines.join('\n'),
    approver: detail.approver,
    requesterUsername: detail.requesterUsername,
    responseDate: parseRequestDate(detail.responseDate),
    operationDescription: detail.operationDescription,
    detailSections: buildDetailSections(detail),
    operations: mapOperationsToDomain(pseudoListItem),
    attachments: mapAttachmentsToDomain(detail.attachments ?? []),
    statusCode: detail.status,
    statusLabel: mapResolvedStatusCodeToLabel(detail.status),
    descriptionList: descriptionLines,
    statusBackgroundColor: statusColors.backgroundColor,
    statusTextColor: statusColors.textColor,
    subCategory: detail.subSubject ?? undefined,
    multipleApprove: detail.multipleApprove,
    descriptionRequirement: detail.descriptionRequirement,
  };
}

export function mapRemoteResponseToGroups(items: RemoteRequestItemDto[]): CategoryGroup[] {
  const grouped = new Map<string, RequestSummary[]>();
  items.forEach((item) => {
    const category = item.subject?.trim() || 'Diger';
    const existing = grouped.get(category) ?? [];
    existing.push(mapRemoteRequestToDomain(item));
    grouped.set(category, existing);
  });
  return Array.from(grouped.entries()).map(([category, data]) => ({ category, data }));
}

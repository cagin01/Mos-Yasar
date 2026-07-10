import { en } from '@/src/shared/i18n/en';
import { tr } from '@/src/shared/i18n/tr';
import { languageStore } from '@/src/store/useLanguageStore';

const allTranslations = { tr, en } as const;
const getT = () => allTranslations[languageStore.getState().language];

export function mapResolvedStatusCodeToLabel(status?: number) {
  const t = getT();
  switch (status) {
    case 0: return t.requests.statusAwaitingApproval;
    case 1: return t.requests.statusApproved;
    case 2: return t.requests.statusRejected;
    case 3: return t.requests.statusApprove;
    case 4: return t.requests.statusRequestCorrection;
    case 5: return t.requests.statusReject;
    default: return status === undefined ? '-' : `${status}`;
  }
}

export function mapResolvedStatusCodeToColors(status?: number) {
  switch (status) {
    case 0:
    case 4:
      return { backgroundColor: '#FFF2BE', textColor: '#FFB800' };
    case 1:
    case 3:
      return { backgroundColor: '#D6F2D1', textColor: '#51D23C' };
    case 2:
    case 5:
      return { backgroundColor: '#FDEBEB', textColor: '#FF4848' };
    default:
      return { backgroundColor: undefined, textColor: undefined };
  }
}

export function resolveStatusColorsFromOperations(
  operations: { statusCode: number; backgroundColor: string; textColor: string }[],
  status: number | undefined,
) {
  const matched = operations?.find((op) => op.statusCode === status);
  if (matched?.backgroundColor && matched?.textColor) {
    return { backgroundColor: matched.backgroundColor, textColor: matched.textColor };
  }
  return mapResolvedStatusCodeToColors(status);
}

export function deriveApprovalStatus(item: { multipleApprove: boolean; approvalRequiresDescription: boolean }) {
  const t = getT();
  if (item.multipleApprove) return t.requests.multipleApproval;
  if (item.approvalRequiresDescription) return t.requests.descriptionRequired;
  return t.requests.pending;
}
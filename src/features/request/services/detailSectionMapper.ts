import { en } from '@/src/shared/i18n/en';
import { tr } from '@/src/shared/i18n/tr';
import { languageStore } from '@/src/store/useLanguageStore';
import type { RemoteRequestDetailDataDto } from '@/src/features/request/api/contracts';
import type { RequestDetailContentSection } from '@/src/features/request/types';

const allTranslations = { tr, en } as const;
const getT = () => allTranslations[languageStore.getState().language];

export function buildDetailSections(detail: RemoteRequestDetailDataDto): RequestDetailContentSection[] {
  const t = getT();
  const sorted = [...(detail.descriptions ?? [])].sort((a, b) => a.line_number - b.line_number);
  const sections: RequestDetailContentSection[] = [];
  let current: RequestDetailContentSection = { title: detail.subject || t.requests.details, lines: [] };

  sorted.forEach((desc) => {
    const raw = desc.data?.trim();
    if (!raw) return;
    if (desc.type === 0) {
      if (current.lines.length > 0) sections.push(current);
      current = { title: raw, lines: [] };
      return;
    }
    const sep = raw.indexOf(':');
    if (sep > 0) {
      current.lines.push({ kind: 'pair', label: raw.slice(0, sep).trim(), value: raw.slice(sep + 1).trim() });
    } else {
      current.lines.push({ kind: 'text', value: raw });
    }
  });

  if (current.lines.length > 0) sections.push(current);

  if (detail.operationDescription?.trim()) {
    sections.push({
      title: t.requests.operationDescription,
      lines: [{ kind: 'text', value: detail.operationDescription.trim() }],
    });
  }

  return sections;
}

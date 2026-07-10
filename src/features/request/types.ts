export interface RequestOperation {
  operationName: string;
  statusCode: number;
  requiresDescription: number;
  backgroundColor: string;
  textColor: string;
  displayOrder?: number;
}

export interface RequestAttachment {
  id: string;
  name: string;
  url?: string;
  requestId?: string;
}

export interface RequestAttachmentContent {
  id: string;
  name: string;
  content: string;
}

export interface RequestDetailLine {
  kind: 'pair' | 'text';
  label?: string;
  value: string;
}

export interface RequestDetailContentSection {
  title: string;
  lines: RequestDetailLine[];
}

interface RequestBase {
  id: string;
  istekNo: string;
  gonderen: string;
  sirket: string;
  statu: string;
  baslangic: string;
  bitis: string;
  onayDurumu: string;
  statusBackgroundColor?: string;
  statusTextColor?: string;
  statusCode?: number;
  statusLabel?: string;
  subCategory?: string;
  multipleApprove?: boolean;
  descriptionRequirement?: number;
}

export interface RequestSummary extends RequestBase {
  isim?: string;
  tarih?: string;
  belgeNo?: string;
  acilis?: string;
  modul?: string;
  kategori?: string;
  aciklama?: string;
  approver?: string;
  operations?: RequestOperation[];
  descriptionList?: string[];
}

export interface RequestDetail extends RequestSummary {
  requesterUsername?: string;
  responseDate?: string;
  operationDescription?: string;
  detailSections?: RequestDetailContentSection[];
  attachments?: RequestAttachment[];
}

export interface CategoryGroup {
  category: string;
  data: RequestSummary[];
}

export interface RequestDateRange {
  start: Date;
  end: Date;
}

export interface RequestQuery {
  range?: RequestDateRange | null;
  searchValue?: string;
}

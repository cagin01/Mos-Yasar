export interface RemoteRequestOperationDto {
  operationName: string;
  statusCode: number;
  requiresDescription: number;
  color: string;
  descriptionRequirement: number;
  backgroundColor: string;
  textColor: string;
  requestOperationId?: number;
  displayOrder?: number;
}

export interface RemoteRequestItemDto {
  requestId: string;
  status: number;
  subject: string;
  descriptionList: string[];
  approver: string;
  referenceDocument: string;
  subSubject: string | null;
  requestDate: string;
  requesterFullName: string;
  multipleApprove: boolean;
  description: string;
  operations: RemoteRequestOperationDto[];
  descriptionRequirement: number;
  approvalRequiresDescription: boolean;
}

export interface RemoteRequestListResponseDto {
  code: number;
  message: string | null;
  data: RemoteRequestItemDto[];
  dataList: unknown;
  title: string | null;
}

export interface RemoteRequestHistoryItemDto {
  requestId: string;
  status: number;
  subject: string;
  approver: string;
  referenceDocument: string;
  subSubject: string | null;
  requestDate: string;
  requesterFullName: string;
  multipleApprove: boolean | null;
  description: string;
  operations: RemoteRequestOperationDto[];
}

export interface RemoteRequestHistoryQueryDto {
  startDate: string;
  endDate: string;
  searchValue: string;
}

export interface RemoteRequestHistoryResponseDto {
  code: number;
  message: string | null;
  data: RemoteRequestHistoryItemDto[];
  dataList: unknown;
  title: string | null;
}

export interface RemoteRequestDetailDescriptionDto {
  type: number;
  data: string;
  color: string;
  typography: string;
  descriptionId: string;
  line_number: number;
}

export interface RemoteRequestAttachmentDto {
  attachmentId?: string;
  id?: string;
  requestid?: string;
  fileName?: string;
  filename?: string;
  name?: string;
  attachmentName?: string;
  url?: string;
  fileUrl?: string;
  downloadUrl?: string;
  path?: string;
}

export interface RemoteRequestDetailDataDto {
  requestId: string;
  approver: string;
  referenceDocument: string;
  approved: boolean;
  operator: string;
  status: number;
  requestDate: string;
  responseDate: string;
  requesterFullName: string;
  requesterUsername: string;
  subject: string;
  approvalRequiresDescription: boolean;
  descriptions: RemoteRequestDetailDescriptionDto[];
  operations: RemoteRequestOperationDto[];
  attachments: RemoteRequestAttachmentDto[];
  descriptionRequirement: number;
  subSubject: string | null;
  operationDescription: string;
  multipleApprove: boolean;
}

export interface RemoteRequestDetailResponseDto {
  code: number;
  message: string | null;
  data: RemoteRequestDetailDataDto | null;
  dataList: unknown;
  title: string | null;
}

export interface RemoteAttachmentContentDataDto {
  content: string;
  name: string;
  attachmentId: string;
}

export interface RemoteAttachmentContentResponseDto {
  code: number;
  message: string | null;
  data: RemoteAttachmentContentDataDto | null;
  dataList: unknown;
  title: string | null;
}

export interface RequestListQueryDto {
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ApproveRequestDto {
  appVersion: string;
  deviceInfo: string;
  operationDescription: string | null;
  requestId: string;
  status: number;
}

export interface ApproveResponseDto {
  code: number;
  message: string | null;
  data: unknown;
  dataList: unknown;
  title: string | null;
}

export interface MultipleApproveRequestDto {
  approver: string;
  idList: string[];
  operationDescription: string;
  status: number;
}

export interface MultipleApproveResponseDto {
  code: number;
  message: string | null;
  data: unknown;
  dataList: unknown;
  title: string | null;
}

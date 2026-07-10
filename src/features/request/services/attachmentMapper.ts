import type { RemoteRequestAttachmentDto } from '@/src/features/request/api/contracts';
import type { RequestAttachment } from '@/src/features/request/types';

export function mapAttachmentsToDomain(attachments: RemoteRequestAttachmentDto[]): RequestAttachment[] {
  return attachments
    .map((attachment, index): RequestAttachment | null => {
      const name =
        attachment.fileName ??
        attachment.filename ??
        attachment.name ??
        attachment.attachmentName ??
        `Ek ${index + 1}`;
      const id = attachment.attachmentId ?? attachment.id ?? `${name}-${index}`;
      if (!id && !name) return null;
      const url = attachment.url ?? attachment.fileUrl ?? attachment.downloadUrl ?? attachment.path;
      return {
        id,
        name,
        ...(url !== undefined && { url }),
        ...(attachment.requestid !== undefined && { requestId: attachment.requestid }),
      };
    })
    .filter((a): a is RequestAttachment => a !== null);
}

import * as FileSystem from 'expo-file-system/legacy';

import {
  createPreviewHtml,
  getAttachmentMimeType,
  supportsInlinePreview,
} from './attachmentPreviewService';
import { requestService } from './requestService';
import { RequestAttachment } from '../types';

export function sanitizeAttachmentFileName(fileName: string) {
  return fileName.replace(/[<>:"/\\|?*]+/g, '_');
}

export function getAttachmentFileUri(cacheDirectory: string, fileName: string) {
  return `${cacheDirectory}${sanitizeAttachmentFileName(fileName)}`;
}

export function getAttachmentPreviewFileUri(cacheDirectory: string, fileName: string) {
  return `${getAttachmentFileUri(cacheDirectory, fileName)}.html`;
}

export async function cacheAttachmentFile(attachment: RequestAttachment, cacheDirectory: string) {
  const fileUri = getAttachmentFileUri(cacheDirectory, attachment.name);
  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    const attachmentContent = await requestService.getAttachmentContent(attachment.id);
    if (!attachmentContent?.content) {
      return null;
    }
    await FileSystem.writeAsStringAsync(fileUri, attachmentContent.content, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  return fileUri;
}

export async function cacheAttachmentPreview(fileName: string, fileUri: string, cacheDirectory: string) {
  if (!supportsInlinePreview(fileName)) {
    return null;
  }

  const previewFileUri = getAttachmentPreviewFileUri(cacheDirectory, fileName);
  const previewFileInfo = await FileSystem.getInfoAsync(previewFileUri);

  if (!previewFileInfo.exists) {
    const base64Content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const previewHtml = createPreviewHtml(fileName, base64Content);
    await FileSystem.writeAsStringAsync(previewFileUri, previewHtml);
  }

  return previewFileUri;
}

export { getAttachmentMimeType, supportsInlinePreview };

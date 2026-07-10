import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Sharing from 'expo-sharing';
import { Router } from 'expo-router';

import {
  cacheAttachmentFile,
  cacheAttachmentPreview,
  getAttachmentMimeType,
  supportsInlinePreview,
} from '../services/attachmentFileUtils';
import { RequestAttachment } from '../types';

type AttachmentMessages = {
  contentError: string;
  deviceError: string;
  errorTitle: string;
  fallbackError: string;
  previewUnsupported: string;
};

type UseAttachmentHandlerParams = {
  messages: AttachmentMessages;
  router: Router;
};

export function useAttachmentHandler({ messages, router }: UseAttachmentHandlerParams) {
  const [activeAttachmentId, setActiveAttachmentId] = useState<string | null>(null);

  const handleAttachmentPress = useCallback(
    async (attachment: RequestAttachment) => {
      try {
        const cacheDirectory = FileSystem.cacheDirectory;
        if (!cacheDirectory) {
          Alert.alert(messages.errorTitle, messages.deviceError);
          return;
        }

        setActiveAttachmentId(attachment.id);
        const fileUri = await cacheAttachmentFile(attachment, cacheDirectory);
        if (!fileUri) {
          Alert.alert(messages.errorTitle, messages.contentError);
          return;
        }

        if (Platform.OS === 'android') {
          const contentUri = await FileSystem.getContentUriAsync(fileUri);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
            type: getAttachmentMimeType(attachment.name),
          });
          return;
        }

        if (supportsInlinePreview(attachment.name)) {
          const previewFileUri = await cacheAttachmentPreview(
            attachment.name,
            fileUri,
            cacheDirectory,
          );

          if (previewFileUri) {
            router.push({
              pathname: '/request/attachment-preview',
              params: { title: attachment.name, uri: previewFileUri },
            });
          }
          return;
        }

        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) {
          Alert.alert(messages.errorTitle, messages.previewUnsupported);
          return;
        }
        await Sharing.shareAsync(fileUri, {
          mimeType: getAttachmentMimeType(attachment.name),
          dialogTitle: attachment.name,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : messages.fallbackError;
        Alert.alert(messages.errorTitle, message);
      } finally {
        setActiveAttachmentId(null);
      }
    },
    [messages, router],
  );

  return {
    activeAttachmentId,
    handleAttachmentPress,
  };
}

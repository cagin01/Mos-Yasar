import ActionDrawer from '@/src/shared/components/ui/ActionDrawer';
import AppLoader from '@/src/shared/components/ui/AppLoader';
import ConfirmModal from '@/src/shared/components/ui/ConfirmModal';
import OperationDescriptionModal from '@/src/shared/components/ui/OperationDescriptionModal';
import { AppColors } from '@/src/shared/theme/colors';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/src/shared/components/ui/ScaledText';
import { useAttachmentHandler } from '../hooks/useAttachmentHandler';
import { useRequestAction } from '../hooks/useRequestAction';
import { useRequestDetail } from '../hooks/useRequestDetail';
import AttachmentFileIcon from '../components/AttachmentFileIcon';
import RequestDetailHeader from '../components/detail/RequestDetailHeader';
import RequestDetailSection from '../components/detail/RequestDetailSection';
import RequestInfoRow from '../components/detail/RequestInfoRow';

export default function RequestDetailScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const handleNetworkError = useCallback(() => {
    Alert.alert(t.common.connectionError, t.common.connectionErrorMessage);
  }, [t.common.connectionError, t.common.connectionErrorMessage]);

  const { isLoading: isRequestLoading, loadRequest, request } = useRequestDetail({
    id,
    source,
    onNetworkError: handleNetworkError,
  });

  useFocusEffect(
    useCallback(() => {
      loadRequest();
    }, [loadRequest]),
  );

  const {
    actionDone,
    descriptionModalVisible,
    handleActionComplete,
    handleDescriptionCancel,
    handleDescriptionConfirm,
    isActionLoading,
    pendingOperation,
  } = useRequestAction({
    request,
    loadRequest,
    onNetworkError: handleNetworkError,
    onActionError: (message) => {
      Alert.alert(t.common.error, message || t.common.actionFailed);
    },
  });
  const isHistoryView = source === 'history' || actionDone;
  const isLoading = isRequestLoading || isActionLoading;

  const { activeAttachmentId, handleAttachmentPress } = useAttachmentHandler({
    router,
    messages: {
      contentError: t.requests.attachmentContentError,
      deviceError: t.requests.attachmentDeviceError,
      errorTitle: t.requests.attachmentError,
      fallbackError: 'Ek acilirken hata olustu.',
      previewUnsupported: t.requests.attachmentPreviewUnsupported,
    },
  });
  if (!request && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t.requests.detailNotFound}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RequestDetailHeader
        title={t.requests.detailTitle}
        topInset={insets.top}
        onBack={() => router.back()}
        onDelete={!isHistoryView ? () => setIsDeleteModalVisible(true) : undefined}
        disabled={isLoading}
      />

      {request && (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + (isHistoryView ? 24 : 130) },
            ]}
          >
            <View
              style={[
                styles.statusBar,
                {
                  backgroundColor: isDark || !request.statusBackgroundColor
                    ? 'transparent'
                    : request.statusBackgroundColor,
                  borderColor: request.statusTextColor
                    ? (isDark ? request.statusTextColor : 'transparent')
                    : (isDark ? '#FFFFFF' : colors.border),
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: request.statusTextColor ?? (isDark ? '#FFFFFF' : colors.textPrimary) },
                ]}
              >
                {request.statusLabel || request.statu}
              </Text>
            </View>

            <View style={styles.headerRow}>
              <Text style={styles.nameText}>{request.isim ?? request.gonderen}</Text>
              <Text style={styles.dateText}>{request.tarih ?? request.baslangic}</Text>
            </View>

            <Text style={styles.belgeNoText}>
              Belge No: {request.belgeNo ?? `BEL-${request.istekNo}`}
            </Text>

            <RequestDetailSection title={request.kategori ?? t.requests.requestInfo}>
              <RequestInfoRow label={t.requests.requestNo} value={request.istekNo} />
              <RequestInfoRow label={t.requests.company} value={request.sirket} />
              <RequestInfoRow label={t.requests.status} value={request.statu} />
              <RequestInfoRow label={t.requests.startDate} value={request.acilis ?? request.baslangic} />
              <RequestInfoRow label={t.requests.endDate} value={request.bitis} />
              <RequestInfoRow label={t.requests.module} value={request.modul ?? 'SAP Workflow'} />
              <RequestInfoRow label={t.requests.category} value={request.kategori ?? '-'} />
              {request.approver ? <RequestInfoRow label={t.requests.approver} value={request.approver} /> : null}
              {request.responseDate ? (
                <RequestInfoRow label={t.requests.responseDate} value={request.responseDate} />
              ) : null}
            </RequestDetailSection>

            {request.detailSections?.length ? (
              request.detailSections.map((section, sectionIndex) => (
                <RequestDetailSection key={`${section.title}-${sectionIndex}`} title={section.title}>
                  {section.lines.map((line, lineIndex) =>
                    line.kind === 'pair' && line.label ? (
                      <RequestInfoRow
                        key={`${section.title}-${line.label}-${lineIndex}`}
                        label={line.label}
                        value={line.value}
                      />
                    ) : (
                      <Text key={`${section.title}-text-${lineIndex}`} style={styles.descriptionText}>
                        {line.value}
                      </Text>
                    ),
                  )}
                </RequestDetailSection>
              ))
            ) : (
              <RequestDetailSection title={t.requests.requestDescription}>
                <Text style={styles.descriptionText}>
                  {request.aciklama ?? t.requests.noDescription}
                </Text>
              </RequestDetailSection>
            )}

            <RequestDetailSection title={t.requests.people}>
              <RequestInfoRow label={t.requests.requester} value={request.gonderen} />
              {request.requesterUsername ? (
                <RequestInfoRow label={t.requests.username} value={request.requesterUsername} />
              ) : null}
              <RequestInfoRow label={t.requests.company} value={request.sirket} />
              <RequestInfoRow label={t.requests.approvalStatus} value={request.onayDurumu} />
            </RequestDetailSection>

            {request.attachments?.length ? (
              <RequestDetailSection title={t.requests.attachments}>
                {request.attachments.map((attachment) => (
                  <Pressable
                    key={attachment.id}
                    style={styles.attachmentButton}
                    onPress={() => handleAttachmentPress(attachment)}
                  >
                    <View style={styles.attachmentContent}>
                      <AttachmentFileIcon fileName={attachment.name} size={30} style={styles.attachmentIcon} />
                      <Text style={styles.attachmentButtonText}>{attachment.name}</Text>
                    </View>
                    {activeAttachmentId === attachment.id ? (
                      <Text style={styles.attachmentLoadingText}>{t.common.loading}</Text>
                    ) : null}
                  </Pressable>
                ))}
              </RequestDetailSection>
            ) : null}
          </ScrollView>

          {!isHistoryView && (
            <>
              <ConfirmModal
                visible={isDeleteModalVisible}
                message={t.requests.removeWarning}
                onCancel={() => setIsDeleteModalVisible(false)}
                onConfirm={() => {
                  setIsDeleteModalVisible(false);
                  router.back();
                }}
              />

              <ActionDrawer
                selectedIds={[request.id]}
                operations={request.operations}
                onActionComplete={handleActionComplete}
              />

              <OperationDescriptionModal
                visible={descriptionModalVisible}
                operation={pendingOperation}
                required={(pendingOperation?.requiresDescription ?? 0) === 1}
                onConfirm={handleDescriptionConfirm}
                onCancel={handleDescriptionCancel}
              />
            </>
          )}
        </>
      )}

      <AppLoader visible={isLoading} />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  emptyText: { fontSize: 16, color: colors.textMuted },
  scrollContent: { padding: 20, paddingTop: 12 },
  statusBar: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusText: { color: colors.textPrimary, fontWeight: 'bold', fontSize: 14 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nameText: { fontSize: 22, fontWeight: 'bold', color: colors.textPrimary },
  dateText: { fontSize: 14, color: colors.textMuted },
  belgeNoText: { fontSize: 14, color: colors.textPlaceholder, marginBottom: 20 },
  descriptionText: { fontSize: 14, color: colors.textBody, lineHeight: 20, marginBottom: 8 },
  attachmentButton: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primaryLightBorder,
  },
  attachmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attachmentIcon: {
    marginRight: 10,
  },
  attachmentButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textDecorationLine: 'underline',
  },
  attachmentLoadingText: {
    marginTop: 8,
    color: colors.attachmentLoadingText,
    fontSize: 12,
    fontWeight: '500',
  },
});

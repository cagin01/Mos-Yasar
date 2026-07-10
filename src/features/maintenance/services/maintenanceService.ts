import { appConfig } from '@/src/config/appConfig';
import { FetchApiClient } from '@/src/shared/api/apiClient';

interface MaintenanceResponseDto {
  maintenance: boolean;
  message?: string | null;
}

const apiClient = new FetchApiClient(appConfig.api.baseUrl);
const MAINTENANCE_STATUS_PATH = '';

export interface MaintenanceStatus {
  isUnderMaintenance: boolean;
  message?: string | null;
}

export async function checkMaintenance(): Promise<MaintenanceStatus> {
  if (!MAINTENANCE_STATUS_PATH) {
    return { isUnderMaintenance: false, message: null };
  }

  const response = await apiClient.request<MaintenanceResponseDto>(
    MAINTENANCE_STATUS_PATH,
  );
  return {
    isUnderMaintenance: response.maintenance,
    message: response.message,
  };
}

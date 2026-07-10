import { APP_VERSION_BY_PLATFORM, appConfig } from '@/src/config/appConfig';
import { VersionCheckResponseDto } from '@/src/features/auth/api/contracts';
import { FetchApiClient } from '@/src/shared/api/apiClient';
import { Platform } from 'react-native';

const mosApiClient = new FetchApiClient(appConfig.api.baseUrl);

export async function runVersionCheck() {
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  const query = new URLSearchParams({
    platform,
    version: APP_VERSION_BY_PLATFORM[platform],
  }).toString();

  const versionResponse = await mosApiClient.request<VersionCheckResponseDto>(
    `/mos/api/v3/check?${query}`,
    {
      method: 'POST',
    },
  );

  if (versionResponse.code !== 200) {
    throw new Error(
      versionResponse.title || versionResponse.message || 'Versiyon kontrolu basarisiz oldu.',
    );
  }
}

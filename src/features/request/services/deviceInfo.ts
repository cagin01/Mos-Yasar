import { Platform } from 'react-native';

export function buildDeviceInfo() {
  if (Platform.OS === 'android') {
    const constants = Platform.constants as { Brand?: string; Model?: string };
    const brand = constants.Brand ?? 'Android';
    const model = constants.Model ?? '';
    return `${brand} ${model}, Android ${Platform.Version}`.trim();
  }
  return `iPhone, iOS ${Platform.Version}`;
}
import { AttorneyProvider } from '@/src/features/attorney/context/AttorneyContext';
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <AttorneyProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AttorneyProvider>
  );
}
import { useAuthStore } from '@/src/store/useAuthStore';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isAuthenticated } = useAuthStore();

  return <Redirect href={isAuthenticated ? '/(tabs)' : '/login'} />;
}

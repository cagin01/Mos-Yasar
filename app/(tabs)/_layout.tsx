import MainBottomNavbar from '@/src/shared/components/ui/MainBottomNavbar';
import { useTheme } from '@/src/shared/theme/useTheme';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Redirect, Tabs } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  const { colors } = useTheme();

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surface }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
        }}
        tabBar={() => <MainBottomNavbar />}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="past-requests" />
        <Tabs.Screen name="settings" />
      </Tabs>
    </SafeAreaView>
  );
}


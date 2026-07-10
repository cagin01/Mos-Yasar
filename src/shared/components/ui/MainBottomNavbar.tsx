import { Text } from '@/src/shared/components/ui/ScaledText';
import { useTranslation } from '@/src/shared/i18n/useTranslation';
import { useTheme } from '@/src/shared/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { ComponentProps } from 'react';
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type IconName = ComponentProps<typeof Ionicons>['name'];

interface NavItem {
  id: string;
  label: string;
  iconName: IconName;
  path: '/' | '/past-requests' | '/settings';
}

const MainBottomNavbar = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { id: 'list', label: t.nav.requestList, iconName: 'list-outline', path: '/' },
    { id: 'past', label: t.nav.requestHistory, iconName: 'time-outline', path: '/past-requests' },
    { id: 'settings', label: t.nav.settings, iconName: 'settings-outline', path: '/settings' },
  ];
  const router = useRouter();
  const pathname = usePathname();
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // iOS'ta beyaz alanın gereksiz uzamaması için yükseklik ekran oranına göre hesaplanır.
  const iosBaseHeight = Math.min(Math.max(screenHeight * 0.085, 74), 88);
  const androidContentHeight = 64;
  const CONTENT_PADDING = 18; // paddingTop ile aynı, altta da eşit boşluk
  const iosPaddingBottom = CONTENT_PADDING + insets.bottom;
  const androidBottomPadding = CONTENT_PADDING + insets.bottom;
  const navbarHeight =
    Platform.OS === 'ios'
      ? iosBaseHeight + iosPaddingBottom
      : androidContentHeight + androidBottomPadding;

  return (
    <View
      style={[
        styles.navbarContainer,
        {
          height: navbarHeight,
          paddingBottom: Platform.OS === 'ios' ? iosPaddingBottom : androidBottomPadding,
          backgroundColor: colors.background,
          borderTopColor: colors.borderNavbar,
        },
      ]}
    >
      {navItems.map((item) => {
        const isSelected = pathname === item.path;
        const currentColor = isSelected ? colors.primary : colors.textDisabled;
        const activeIconName = item.iconName.replace('-outline', '') as IconName;

        return (
          <Pressable
            key={item.id}
            onPress={() => {
              if (isSelected) {
                return;
              }
              router.replace(item.path);
            }}
            android_ripple={{ color: 'transparent' }}
            style={({ pressed }) => [styles.navItemButton, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Ionicons
              name={isSelected ? activeIconName : item.iconName}
              size={24}
              color={currentColor}
            />
            <Text style={[styles.navLabel, { color: currentColor }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 18,
    elevation: 20,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  navItemButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 5,
    letterSpacing: 0.2,
  },
});

export default MainBottomNavbar;

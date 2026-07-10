import { StyleProp, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { Text } from '@/src/shared/components/ui/ScaledText';

interface DevLoginControlStyles {
  devLoginButton: StyleProp<ViewStyle>;
  devLoginButtonText: StyleProp<TextStyle>;
  devTopButton: StyleProp<ViewStyle>;
  devTopButtons: StyleProp<ViewStyle>;
}

interface DevTopActionsProps {
  onMaintenancePreview: () => void;
  styles: DevLoginControlStyles;
}

interface DevFooterActionsProps {
  onSetPasswordPreview: () => void;
  styles: DevLoginControlStyles;
}

export function DevTopActions({
  onMaintenancePreview,
  styles,
}: DevTopActionsProps) {
  if (!__DEV__) {
    return null;
  }

  return (
    <View style={styles.devTopButtons}>
      <TouchableOpacity
        style={styles.devTopButton}
        onPress={onMaintenancePreview}
        activeOpacity={0.8}
      >
        <Text style={styles.devLoginButtonText}>Bakım Ekranı</Text>
      </TouchableOpacity>
    </View>
  );
}

export function DevFooterActions({
  onSetPasswordPreview,
  styles,
}: DevFooterActionsProps) {
  if (!__DEV__) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.devLoginButton}
      onPress={onSetPasswordPreview}
      activeOpacity={0.8}
    >
      <Text style={styles.devLoginButtonText}>Set Password</Text>
    </TouchableOpacity>
  );
}

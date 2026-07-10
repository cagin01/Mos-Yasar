import { useTheme } from '@/src/shared/theme/useTheme';
import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import LoadingArrow from './LoadingArrow';

interface AppLoaderProps {
  visible: boolean;
}

export default function AppLoader({ visible }: AppLoaderProps) {
  const { colors } = useTheme();


  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={() => {}}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      hardwareAccelerated={true}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlayLoader }]}>
        <View style={[styles.loaderCircle, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <LoadingArrow size={36} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
  loaderCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10000,
    elevation: 10000,
  },
});

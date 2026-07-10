import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';

interface SplashAnimationScreenProps {
  onFinish: () => void;
}

export default function SplashAnimationScreen({ onFinish }: SplashAnimationScreenProps) {
  const lottieRef = useRef<LottieView>(null);

  return (
    <View style={styles.container}>
      <LottieView
        ref={lottieRef}
        source={require('@/assets/animations/mobil-onay-splash-screen-v4.json')}
        autoPlay
        loop={false}
        onAnimationFinish={onFinish}
        style={styles.animation}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    zIndex: 9999,
  },
  animation: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

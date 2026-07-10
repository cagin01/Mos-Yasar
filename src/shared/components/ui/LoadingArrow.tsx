import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import CustomFabIcon from './CustomFabIcon';

interface LoadingArrowProps {
  size?: number;
}

export default function LoadingArrow({ size = 70 }: LoadingArrowProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <CustomFabIcon size={size} />
    </Animated.View>
  );
}

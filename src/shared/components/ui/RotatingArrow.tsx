import React from 'react';
import { Animated } from 'react-native';
import CustomFabIcon from './CustomFabIcon';

interface RotatingArrowProps {
  animValue: Animated.AnimatedInterpolation<string | number>;
  size?: number;
}

export default function RotatingArrow({
  animValue,
  size = 70,
}: RotatingArrowProps) {
  return (
    <Animated.View style={{ transform: [{ rotate: animValue as any }] }}>
      <CustomFabIcon size={size} />
    </Animated.View>
  );
}

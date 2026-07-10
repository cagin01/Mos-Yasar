import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

interface EntranceTransitionProps {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export default function EntranceTransition({
  children,
  delay = 0,
  style,
}: EntranceTransitionProps) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, fade, slide]);

  return (
    <Animated.View
      renderToHardwareTextureAndroid
      style={[
        style,
        {
          opacity: fade,
          transform: [{ translateY: slide }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

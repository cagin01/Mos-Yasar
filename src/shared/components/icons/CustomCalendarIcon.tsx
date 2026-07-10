// Path: src/shared/components/icons/CustomCalendarIcon.tsx
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

export default function CustomCalendarIcon({ size = 40, color = "#1976D2" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <Path
        d="m453.332,512h-394.664c-32.363,0 -58.668,-26.305 -58.668,-58.668v-352c0,-32.363 26.305,-58.664 58.668,-58.664h394.664c32.363,0 58.668,26.301 58.668,58.664v352c0,32.363 -26.305,58.668 -58.668,58.668zM58.668,74.668c-14.699,0 -26.668,11.965 -26.668,26.664v352c0,14.699 11.969,26.668 26.668,26.668h394.664c14.699,0 26.668,-11.969 26.668,-26.668v-352c0,-14.699 -11.969,-26.664 -26.668,-26.664zM58.668,74.668"
        fill={color}
      />
      <Path
        d="m496,202.668h-480c-8.832,0 -16,-7.168 -16,-16s7.168,-16 16,-16h480c8.832,0 16,7.168 16,16s-7.168,16 -16,16zM496,202.668"
        fill={color}
      />
      <Path
        d="m122.668,128c-8.832,0 -16,-7.168 -16,-16v-96c0,-8.832 7.168,-16 16,-16s16,7.168 16,16v96c0,8.832 -7.168,16 -16,16zM122.668,128"
        fill={color}
      />
      <Path
        d="m389.332,128c-8.832,0 -16,-7.168 -16,-16v-96c0,-8.832 7.168,-16 16,-16s16,7.168 16,16v96c0,8.832 -7.168,16 -16,16zM389.332,128"
        fill={color}
      />
    </Svg>
  );
}
import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CustomFabIconProps {
  size?: number;
  color?: string;
}

export default function CustomFabIcon({
  size = 36,
  color = '#1976D2',
}: CustomFabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="22 25 85 85" fill="none">
      <Path
        d="M69.02,38.41L97.96,67.34L69.02,96.28"
        stroke={color}
        strokeWidth="9.34884"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path
        d="M71.21,72.72C74.22,72.72 76.66,70.28 76.66,67.27C76.66,64.25 74.22,61.81 71.21,61.81C68.2,61.81 65.75,64.25 65.75,67.27C65.75,70.28 68.2,72.72 71.21,72.72Z"
        fill={color}
      />
      <Path
        d="M54.26,73.23C57.27,73.23 59.71,70.79 59.71,67.78C59.71,64.77 57.27,62.33 54.26,62.33C51.24,62.33 48.8,64.77 48.8,67.78C48.8,70.79 51.24,73.23 54.26,73.23Z"
        fill={color}
      />
      <Path
        d="M36.79,72.72C39.8,72.72 42.25,70.28 42.25,67.27C42.25,64.25 39.8,61.81 36.79,61.81C33.78,61.81 31.34,64.25 31.34,67.27C31.34,70.28 33.78,72.72 36.79,72.72Z"
        fill={color}
      />
      <Path d="M71.49,67.3H95.81" stroke={color} strokeWidth="10.907" />
    </Svg>
  );
}

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import Svg, { Circle, G, Path } from "react-native-svg";

interface FitVibezLogoProps {
  width?: number;
  height?: number;
}

export default function FitVibezLogo({
  width = 200,
  height = 200,
}: FitVibezLogoProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Svg width={width} height={height} viewBox="0 0 200 200">
      {/* Background circle */}
      <Circle cx="100" cy="100" r="90" fill={colors.accent} opacity={0.2} />

      {/* Stylized "F" for FitVibez */}
      <G>
        <Path
          d="M50,40 L50,160 L70,160 L70,110 L120,110 L120,90 L70,90 L70,60 L130,60 L130,40 L50,40 Z"
          fill={colors.primary}
        />
      </G>

      {/* Dumbbell icon */}
      <G transform="translate(110, 100) scale(0.5)">
        <Circle cx="20" cy="20" r="15" fill={colors.secondary} />
        <Circle cx="80" cy="20" r="15" fill={colors.secondary} />
        <Path d="M35,20 L65,20" stroke={colors.secondary} strokeWidth="10" />
      </G>
    </Svg>
  );
}

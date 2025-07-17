import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import Svg, { Circle, G, Path } from "react-native-svg";

interface FitGirlyLogoProps {
  width?: number;
  height?: number;
}

export default function FitGirlyLogo({
  width = 200,
  height = 200,
}: FitGirlyLogoProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Svg width={width} height={height} viewBox="0 0 200 200">
      {/* Background circle */}
      <Circle cx="100" cy="100" r="90" fill={colors.accent} opacity={0.2} />

      {/* Stylized "F" for FitGirly */}
      <G>
        <Path
          d="M70,40 L130,40 L130,60 L90,60 L90,90 L120,90 L120,110 L90,110 L90,160 L70,160 Z"
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

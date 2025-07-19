import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "./ThemedText";

interface WorkoutRatingProps {
  currentRating?: number;
  onRatingChange: (rating: number) => void;
  readonly?: boolean;
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

export function WorkoutRating({
  currentRating = 0,
  onRatingChange,
  readonly = false,
  size = "medium",
  showText = true,
}: WorkoutRatingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const starSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const starSize = starSizes[size];

  const handleStarPress = (rating: number) => {
    if (!readonly) {
      onRatingChange(rating);
    }
  };

  const getStarColor = (index: number) => {
    return index <= currentRating ? "#FFD700" : colors.text + "30";
  };

  const getStarIcon = (index: number) => {
    return index <= currentRating ? "star" : "star-outline";
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            disabled={readonly}
            style={styles.starTouchable}
            activeOpacity={0.7}
          >
            <Ionicons
              name={getStarIcon(star)}
              size={starSize}
              color={getStarColor(star)}
            />
          </TouchableOpacity>
        ))}
      </View>

      {!readonly && showText && (
        <ThemedText style={styles.ratingText}>
          {currentRating > 0
            ? `${currentRating} out of 5 stars`
            : "Tap to rate"}
        </ThemedText>
      )}

      {readonly && currentRating > 0 && showText && (
        <ThemedText style={styles.readonlyText}>{currentRating}/5</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  starTouchable: {
    padding: 4,
  },
  ratingText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  readonlyText: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
});

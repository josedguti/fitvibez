import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// Muscle focus options
const MUSCLE_OPTIONS = [
  { label: "Full Body", value: "full-body", icon: "body-outline" as const },
  {
    label: "Upper Body",
    value: "upper-body",
    icon: "barbell-outline" as const,
  },
  { label: "Lower Body", value: "lower-body", icon: "walk-outline" as const },
  { label: "Core", value: "core", icon: "fitness-outline" as const },
  { label: "Back", value: "back", icon: "body-outline" as const },
  { label: "Chest", value: "chest", icon: "body-outline" as const },
  { label: "Arms", value: "arms", icon: "body-outline" as const },
  { label: "Legs", value: "legs", icon: "footsteps-outline" as const },
];

export default function MuscleFocusScreen() {
  const params = useLocalSearchParams();
  const workoutType = params.workoutType as string;
  const timeAvailable = params.timeAvailable as string;
  const mood = params.mood as string;

  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleMuscleSelect = (muscleValue: string) => {
    setSelectedMuscles((prev) => {
      if (prev.includes(muscleValue)) {
        // Deselect if already selected
        return prev.filter((muscle) => muscle !== muscleValue);
      } else {
        // Select if not already selected
        return [...prev, muscleValue];
      }
    });
  };

  const handleNext = () => {
    if (selectedMuscles.length === 0) {
      alert("Please select at least one muscle group");
      return;
    }

    // Navigate to the next question (equipment)
    router.navigate({
      pathname: "/workout-builder/equipment",
      params: {
        workoutType,
        timeAvailable,
        mood,
        muscleFocus: selectedMuscles.join(","), // Join array as comma-separated string
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#1C1C1E", "#2C2C2E"]
            : ["#F8F8F8", "#FAFAFA"]
        }
        style={styles.background}
      />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Workout Builder</ThemedText>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/(tabs)")}
        >
          <Ionicons name="home" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.questionText}>
          Which muscle groups would you like to focus on? (Select one or more)
        </ThemedText>

        <View style={styles.optionsGrid}>
          {MUSCLE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                  borderColor: selectedMuscles.includes(option.value)
                    ? colors.primary
                    : colorScheme === "dark"
                    ? "#4D4D5D"
                    : "#E5E5E5",
                  borderWidth: selectedMuscles.includes(option.value) ? 2 : 1,
                },
              ]}
              onPress={() => handleMuscleSelect(option.value)}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: selectedMuscles.includes(option.value)
                      ? colors.primary
                      : colorScheme === "dark"
                      ? "#4D4D5D"
                      : "#F0F0F0",
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={
                    selectedMuscles.includes(option.value)
                      ? "#FFFFFF"
                      : colors.primary
                  }
                />
              </View>
              <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
              {selectedMuscles.includes(option.value) && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Next" onPress={handleNext} style={styles.nextButton} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  homeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  optionCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
    position: "relative",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "transparent",
  },
  nextButton: {
    width: "100%",
  },
});

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

  const [selectedMuscle, setSelectedMuscle] = useState<string>("");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleNext = () => {
    if (!selectedMuscle) {
      alert("Please select muscle focus");
      return;
    }

    // Navigate to the next question (equipment)
    router.navigate({
      pathname: "/workout-builder/equipment",
      params: {
        workoutType,
        timeAvailable,
        mood,
        muscleFocus: selectedMuscle,
      },
    });
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={
          colorScheme === "dark" ? ["#2D2D3A", "#3D3D4D"] : ["#FFF5F7", "#FFF"]
        }
        style={styles.background}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Workout Builder
          </ThemedText>
        </View>

        <ThemedText style={styles.questionText}>
          Which muscle groups would you like to focus on?
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
                  borderColor:
                    selectedMuscle === option.value
                      ? colors.primary
                      : colorScheme === "dark"
                      ? "#4D4D5D"
                      : "#E5E5E5",
                  borderWidth: selectedMuscle === option.value ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedMuscle(option.value)}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      selectedMuscle === option.value
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
                    selectedMuscle === option.value ? "#FFFFFF" : colors.primary
                  }
                />
              </View>
              <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
              {selectedMuscle === option.value && (
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 40, // To center the title accounting for back button
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

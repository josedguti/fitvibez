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

// Mood options
const MOOD_OPTIONS = [
  { label: "Happy", value: "happy", icon: "happy-outline" as const },
  { label: "Energetic", value: "energetic", icon: "flash-outline" as const },
  { label: "Normal", value: "normal", icon: "sunny-outline" as const },
  { label: "Tired", value: "tired", icon: "bed-outline" as const },
  {
    label: "Stressed",
    value: "stressed",
    icon: "thunderstorm-outline" as const,
  },
  { label: "Sad", value: "sad", icon: "sad-outline" as const },
];

export default function MoodScreen() {
  const params = useLocalSearchParams();
  const workoutType = params.workoutType as string;
  const timeAvailable = params.timeAvailable as string;

  const [selectedMood, setSelectedMood] = useState<string>("");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleNext = () => {
    if (!selectedMood) {
      alert("Please select your mood");
      return;
    }

    // Navigate to the next question (muscle focus)
    router.navigate({
      pathname: "/workout-builder/muscle-focus",
      params: {
        workoutType,
        timeAvailable,
        mood: selectedMood,
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
          How are you feeling today?
        </ThemedText>

        <View style={styles.optionsContainer}>
          {MOOD_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                  borderColor:
                    selectedMood === option.value
                      ? colors.primary
                      : colorScheme === "dark"
                      ? "#4D4D5D"
                      : "#E5E5E5",
                  borderWidth: selectedMood === option.value ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedMood(option.value)}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        selectedMood === option.value
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
                      selectedMood === option.value ? "#FFFFFF" : colors.primary
                    }
                  />
                </View>
                <ThemedText style={styles.optionLabel}>
                  {option.label}
                </ThemedText>
              </View>
              {selectedMood === option.value && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
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
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  checkIcon: {
    marginLeft: 8,
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

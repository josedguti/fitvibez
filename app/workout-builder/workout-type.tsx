import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

// Workout type options with properly typed icons
const WORKOUT_TYPES = [
  {
    label: "Strength Training",
    value: "strength",
    icon: "barbell-outline" as const,
  },
  { label: "Cardio", value: "cardio", icon: "heart-outline" as const },
  { label: "Both", value: "both", icon: "fitness-outline" as const },
  { label: "Flexibility", value: "flexibility", icon: "body-outline" as const },
  { label: "HIIT", value: "hiit", icon: "flash-outline" as const },
];

export default function WorkoutTypeScreen() {
  const [selectedType, setSelectedType] = useState<string>("");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleNext = () => {
    if (!selectedType) {
      alert("Please select a workout type");
      return;
    }

    // Store the selected type in global state or pass as parameter
    // Navigate to the next question (time available)
    router.navigate({
      pathname: "/workout-builder/time-available",
      params: { workoutType: selectedType },
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
          What type of workout would you like to do today?
        </ThemedText>

        <View style={styles.optionsContainer}>
          {WORKOUT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.optionCard,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                  borderColor:
                    selectedType === type.value
                      ? colors.primary
                      : colorScheme === "dark"
                      ? "#4D4D5D"
                      : "#E5E5E5",
                  borderWidth: selectedType === type.value ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedType(type.value)}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        selectedType === type.value
                          ? colors.primary
                          : colorScheme === "dark"
                          ? "#4D4D5D"
                          : "#F0F0F0",
                    },
                  ]}
                >
                  <Ionicons
                    name={type.icon}
                    size={24}
                    color={
                      selectedType === type.value ? "#FFFFFF" : colors.primary
                    }
                  />
                </View>
                <ThemedText style={styles.optionLabel}>{type.label}</ThemedText>
              </View>
              {selectedType === type.value && (
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

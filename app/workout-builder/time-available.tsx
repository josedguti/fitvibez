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

// Time available options
const TIME_OPTIONS = [
  { label: "10-15 minutes", value: "10-15" },
  { label: "15-25 minutes", value: "15-25" },
  { label: "25-40 minutes", value: "25-40" },
  { label: "40-60 minutes", value: "40-60" },
  { label: "60-90 minutes", value: "60-90" },
  { label: "2 hours", value: "120" },
];

export default function TimeAvailableScreen() {
  const params = useLocalSearchParams();
  const workoutType = params.workoutType as string;

  const [selectedTime, setSelectedTime] = useState<string>("");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleNext = () => {
    if (!selectedTime) {
      alert("Please select available time");
      return;
    }

    // Navigate to the next question (mood)
    router.navigate({
      pathname: "/workout-builder/mood",
      params: {
        workoutType,
        timeAvailable: selectedTime,
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
          How much time do you have available today?
        </ThemedText>

        <View style={styles.optionsContainer}>
          {TIME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                  borderColor:
                    selectedTime === option.value
                      ? colors.primary
                      : colorScheme === "dark"
                      ? "#4D4D5D"
                      : "#E5E5E5",
                  borderWidth: selectedTime === option.value ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedTime(option.value)}
            >
              <View style={styles.optionContent}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        selectedTime === option.value
                          ? colors.primary
                          : colorScheme === "dark"
                          ? "#4D4D5D"
                          : "#F0F0F0",
                    },
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={24}
                    color={
                      selectedTime === option.value ? "#FFFFFF" : colors.primary
                    }
                  />
                </View>
                <ThemedText style={styles.optionLabel}>
                  {option.label}
                </ThemedText>
              </View>
              {selectedTime === option.value && (
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

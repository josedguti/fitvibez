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

// Equipment options
const EQUIPMENT_OPTIONS = [
  { label: "No Equipment", value: "none", icon: "body-outline" as const },
  { label: "Dumbbells", value: "dumbbells", icon: "barbell-outline" as const },
  {
    label: "Kettlebells",
    value: "kettlebells",
    icon: "barbell-outline" as const,
  },
  {
    label: "Resistance Bands",
    value: "bands",
    icon: "bandage-outline" as const,
  },
  { label: "Full Gym", value: "full-gym", icon: "fitness-outline" as const },
  { label: "Treadmill", value: "treadmill", icon: "walk-outline" as const },
  { label: "Yoga Mat", value: "yoga-mat", icon: "body-outline" as const },
  {
    label: "Exercise Ball",
    value: "exercise-ball",
    icon: "ellipse-outline" as const,
  },
];

export default function EquipmentScreen() {
  const params = useLocalSearchParams();
  const workoutType = params.workoutType as string;
  const timeAvailable = params.timeAvailable as string;
  const mood = params.mood as string;
  const muscleFocus = params.muscleFocus as string;

  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleEquipmentToggle = (value: string) => {
    // If "No Equipment" is selected, clear all other selections
    if (value === "none") {
      if (selectedEquipment.includes("none")) {
        setSelectedEquipment([]);
      } else {
        setSelectedEquipment(["none"]);
      }
      return;
    }

    // If selecting an equipment item when "No Equipment" is already selected, clear "No Equipment"
    if (selectedEquipment.includes("none")) {
      setSelectedEquipment([value]);
      return;
    }

    // Toggle the selected equipment
    setSelectedEquipment((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleNext = () => {
    if (selectedEquipment.length === 0) {
      alert("Please select at least one equipment option");
      return;
    }

    // Join the selected equipment with commas for the URL parameter
    const equipmentParam = selectedEquipment.join(",");

    // Navigate to the final screen
    router.navigate({
      pathname: "/workout-builder/generate",
      params: {
        workoutType,
        timeAvailable,
        mood,
        muscleFocus,
        equipment: equipmentParam,
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
          What equipment do you have available?
        </ThemedText>

        <ThemedText style={styles.helperText}>
          Select multiple options (tap to toggle)
        </ThemedText>

        <View style={styles.optionsGrid}>
          {EQUIPMENT_OPTIONS.map((option) => {
            const isSelected = selectedEquipment.includes(option.value);
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                    borderColor: isSelected
                      ? colors.primary
                      : colorScheme === "dark"
                      ? "#4D4D5D"
                      : "#E5E5E5",
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => handleEquipmentToggle(option.value)}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isSelected
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
                    color={isSelected ? "#FFFFFF" : colors.primary}
                  />
                </View>
                <ThemedText style={styles.optionLabel}>
                  {option.label}
                </ThemedText>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Next (${selectedEquipment.length} selected)`}
          onPress={handleNext}
          style={styles.nextButton}
        />
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
    marginBottom: 10,
  },
  helperText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.7,
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

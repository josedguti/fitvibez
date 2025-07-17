import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { MotivationalCarousel } from "@/components/MotivationalCarousel";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { requireAuth } from "@/utils/auth";
import { generateWorkout } from "@/utils/openai";

export default function GenerateWorkoutScreen() {
  const params = useLocalSearchParams();
  const workoutType = params.workoutType as string;
  const timeAvailable = params.timeAvailable as string;
  const mood = params.mood as string;
  const muscleFocus = params.muscleFocus as string;
  const equipment = params.equipment as string;
  const equipmentArray = equipment.split(",");

  const [isGenerating, setIsGenerating] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleGenerateWorkout = async () => {
    // First check if the user is authenticated
    const isAuthenticated = await requireAuth(true);
    if (!isAuthenticated) {
      return;
    }

    setIsGenerating(true);

    try {
      // Call the OpenAI API through our utility function
      const workoutPlan = await generateWorkout({
        workoutType,
        timeAvailable,
        mood,
        muscleFocus,
        equipment,
      });

      // Navigate to the preview screen with the generated workout
      const queryParams = new URLSearchParams({
        workoutType,
        timeAvailable,
        mood,
        muscleFocus,
        equipment,
        workoutData: JSON.stringify(workoutPlan),
      }).toString();

      router.push(`/workout-builder/preview?${queryParams}`);
    } catch (error) {
      console.error("Error generating workout:", error);
      Alert.alert(
        "Error",
        "Failed to generate workout. Please try again later.",
        [{ text: "OK" }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to get readable label from value
  const getReadableLabel = (type: string, value: string) => {
    switch (type) {
      case "workoutType":
        return value === "strength"
          ? "Strength Training"
          : value === "cardio"
          ? "Cardio"
          : value === "both"
          ? "Strength & Cardio"
          : value === "flexibility"
          ? "Flexibility"
          : value === "hiit"
          ? "HIIT"
          : value;
      case "timeAvailable":
        return value === "10-15"
          ? "10-15 minutes"
          : value === "15-25"
          ? "15-25 minutes"
          : value === "25-40"
          ? "25-40 minutes"
          : value === "40-60"
          ? "40-60 minutes"
          : value === "60-90"
          ? "60-90 minutes"
          : value === "120"
          ? "2 hours"
          : value;
      case "mood":
        return value.charAt(0).toUpperCase() + value.slice(1);
      case "muscleFocus":
        return value === "full-body"
          ? "Full Body"
          : value === "upper-body"
          ? "Upper Body"
          : value === "lower-body"
          ? "Lower Body"
          : value === "core"
          ? "Core"
          : value.charAt(0).toUpperCase() + value.slice(1);
      case "equipment":
        return value === "none"
          ? "No Equipment"
          : value === "dumbbells"
          ? "Dumbbells"
          : value === "kettlebells"
          ? "Kettlebells"
          : value === "bands"
          ? "Resistance Bands"
          : value === "full-gym"
          ? "Full Gym"
          : value === "treadmill"
          ? "Treadmill"
          : value === "yoga-mat"
          ? "Yoga Mat"
          : value === "exercise-ball"
          ? "Exercise Ball"
          : value;
      default:
        return value;
    }
  };

  // Format multiple equipment items for display
  const formatEquipmentList = (equipmentString: string) => {
    const items = equipmentString.split(",");
    return items.map((item) => getReadableLabel("equipment", item)).join(", ");
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={
          colorScheme === "dark" ? ["#2D2D3A", "#3D3D4D"] : ["#FFF5F7", "#FFF"]
        }
        style={styles.background}
      />

      {isGenerating ? (
        // Show motivational carousel during generation
        <View style={styles.generatingContainer}>
          <View style={styles.headerLoading}>
            <ThemedText type="title" style={styles.titleLoading}>
              Creating Your Perfect Workout ✨
            </ThemedText>
          </View>
          <MotivationalCarousel isVisible={isGenerating} />
        </View>
      ) : (
        // Show normal content when not generating
        <>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <ThemedText type="title" style={styles.title}>
                Workout Summary
              </ThemedText>
            </View>

            <ThemedText style={styles.subtitle}>
              Review your selections and generate your personalized workout
            </ThemedText>

            <View style={styles.summaryContainer}>
              <SummaryItem
                label="Workout Type"
                value={getReadableLabel("workoutType", workoutType)}
                icon="barbell-outline"
                colorScheme={colorScheme}
                colors={colors}
              />

              <SummaryItem
                label="Time Available"
                value={getReadableLabel("timeAvailable", timeAvailable)}
                icon="time-outline"
                colorScheme={colorScheme}
                colors={colors}
              />

              <SummaryItem
                label="Mood"
                value={getReadableLabel("mood", mood)}
                icon="happy-outline"
                colorScheme={colorScheme}
                colors={colors}
              />

              <SummaryItem
                label="Muscle Focus"
                value={getReadableLabel("muscleFocus", muscleFocus)}
                icon="body-outline"
                colorScheme={colorScheme}
                colors={colors}
              />

              <SummaryItem
                label="Equipment"
                value={formatEquipmentList(equipment)}
                icon="fitness-outline"
                colorScheme={colorScheme}
                colors={colors}
              />
            </View>

            <View style={styles.noteContainer}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={colors.primary}
              />
              <ThemedText style={styles.noteText}>
                Your personalized workout will be created based on these
                preferences and your profile information (if available).
              </ThemedText>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Let's Build Our Workout"
              onPress={handleGenerateWorkout}
              style={styles.generateButton}
            />
          </View>
        </>
      )}
    </ThemedView>
  );
}

// Helper component for summary items
function SummaryItem({
  label,
  value,
  icon,
  colorScheme,
  colors,
}: {
  label: string;
  value: string;
  icon: any;
  colorScheme: string | null | undefined;
  colors: any;
}) {
  return (
    <View
      style={[
        styles.summaryItem,
        {
          backgroundColor: colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
        },
      ]}
    >
      <View style={styles.summaryIconContainer}>
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: colorScheme === "dark" ? "#4D4D5D" : "#F0F0F0",
            },
          ]}
        >
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
      </View>
      <View style={styles.summaryContent}>
        <ThemedText style={styles.summaryLabel}>{label}</ThemedText>
        <ThemedText style={styles.summaryValue}>{value}</ThemedText>
      </View>
    </View>
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
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.8,
  },
  summaryContainer: {
    gap: 16,
    marginBottom: 24,
  },
  summaryItem: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryIconContainer: {
    marginRight: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  noteText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "transparent",
  },
  generateButton: {
    width: "100%",
  },
  generatingContainer: {
    flex: 1,
    paddingTop: 60,
  },
  headerLoading: {
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  titleLoading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { ExerciseVisual } from "@/components/ExerciseVisual";
import { MotivationalCarousel } from "@/components/MotivationalCarousel";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { saveWorkout } from "@/utils/auth";
import { generateWorkout, WorkoutResponse } from "@/utils/openai";

export default function WorkoutPreviewScreen() {
  const params = useLocalSearchParams();
  const workoutType = params.workoutType as string;
  const timeAvailable = params.timeAvailable as string;
  const mood = params.mood as string;
  const muscleFocus = params.muscleFocus as string;
  const equipment = params.equipment as string;
  const workoutDataString = params.workoutData as string;

  const [workout, setWorkout] = useState<WorkoutResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    if (workoutDataString) {
      try {
        const parsedWorkout = JSON.parse(workoutDataString) as WorkoutResponse;
        setWorkout(parsedWorkout);
      } catch (error) {
        console.error("Error parsing workout data:", error);
        Alert.alert("Error", "Failed to load workout data");
      }
    }
  }, [workoutDataString]);

  const handleSaveWorkout = async () => {
    if (!workout) return;

    setIsSaving(true);
    try {
      // Save the workout to the user's history
      const { error } = await saveWorkout(
        {
          workoutType,
          timeAvailable,
          mood,
          muscleFocus,
          equipment,
        },
        workout
      );

      if (error) {
        console.error("Error saving workout:", error);
        Alert.alert("Error", "Failed to save workout. Please try again.");
        return;
      }

      // Navigate to the workout detail screen after saving
      router.replace({
        pathname: "/workout-detail",
        params: {
          workoutData: JSON.stringify(workout),
        },
      });
    } catch (error) {
      console.error("Error in handleSaveWorkout:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateWorkout = async () => {
    setIsRegenerating(true);

    try {
      // Generate a new workout with the same parameters
      const newWorkout = await generateWorkout({
        workoutType,
        timeAvailable,
        mood,
        muscleFocus,
        equipment,
      });

      // Update the workout state with the new workout
      setWorkout(newWorkout);

      // Scroll to the top of the screen
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
      }
    } catch (error) {
      console.error("Error regenerating workout:", error);
      Alert.alert(
        "Error",
        "Failed to generate a new workout. Please try again."
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const scrollViewRef = React.useRef<ScrollView>(null);

  if (!workout) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={
            colorScheme === "dark"
              ? ["#1a1a2e", "#16213e", "#0f3460"]
              : ["#FF6B9D", "#C44EC4", "#8A2BE2", "#4A90E2"]
          }
          style={styles.background}
        />
        <ThemedText>Loading workout...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#1a1a2e", "#16213e", "#0f3460"]
            : ["#FF6B9D", "#C44EC4", "#8A2BE2", "#4A90E2"]
        }
        style={styles.background}
      />

      {isRegenerating ? (
        // Show motivational carousel during regeneration
        <View style={styles.regeneratingContainer}>
          <View style={styles.headerLoading}>
            <ThemedText type="title" style={styles.titleLoading}>
              Creating Your New Workout ✨
            </ThemedText>
          </View>
          <MotivationalCarousel isVisible={isRegenerating} />
        </View>
      ) : (
        // Show normal workout content when not regenerating
        <>
          {/* Custom Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Your Workout</ThemedText>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.push("/(tabs)")}
            >
              <Ionicons name="home" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Workout Title */}
            <View style={styles.workoutTitleContainer}>
              <ThemedText style={styles.workoutTitle}>
                {workout.title}
              </ThemedText>
              <View style={styles.difficultyBadge}>
                <ThemedText style={styles.difficultyText}>
                  {workout.difficulty}
                </ThemedText>
              </View>
            </View>

            {/* Workout Description */}
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.description}>
                {workout.description}
              </ThemedText>
              <ThemedText style={styles.totalTime}>
                Total Time: {workout.totalTime}
              </ThemedText>
            </View>

            {/* Warmup Section */}
            {workout.warmup && (
              <View style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>Warm Up</ThemedText>
                <ThemedText style={styles.sectionContent}>
                  {workout.warmup}
                </ThemedText>
              </View>
            )}

            {/* Exercises Section */}
            <View style={styles.sectionContainer}>
              <ThemedText style={styles.sectionTitle}>Exercises</ThemedText>
              {workout.exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseContainer}>
                  <ThemedText style={styles.exerciseName}>
                    {index + 1}. {exercise.name}
                  </ThemedText>
                  <View style={styles.exerciseDetails}>
                    {exercise.sets && (
                      <View style={styles.detailItem}>
                        <ThemedText style={styles.detailLabel}>Sets</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {exercise.sets}
                        </ThemedText>
                      </View>
                    )}
                    {exercise.reps && (
                      <View style={styles.detailItem}>
                        <ThemedText style={styles.detailLabel}>Reps</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {exercise.reps}
                        </ThemedText>
                      </View>
                    )}
                    {exercise.duration && (
                      <View style={styles.detailItem}>
                        <ThemedText style={styles.detailLabel}>
                          Duration
                        </ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {exercise.duration}
                        </ThemedText>
                      </View>
                    )}
                    {exercise.restBetweenSets && (
                      <View style={styles.detailItem}>
                        <ThemedText style={styles.detailLabel}>Rest</ThemedText>
                        <ThemedText style={styles.detailValue}>
                          {exercise.restBetweenSets}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <ThemedText style={styles.instructions}>
                    {exercise.instructions}
                  </ThemedText>

                  {/* Exercise Visual Component */}
                  <ExerciseVisual
                    videoUrl={exercise.videoUrl}
                    exerciseName={exercise.name}
                  />
                </View>
              ))}
            </View>

            {/* Cooldown Section */}
            {workout.cooldown && (
              <View style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>Cool Down</ThemedText>
                <ThemedText style={styles.sectionContent}>
                  {workout.cooldown}
                </ThemedText>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <Button
                title="I Like It, Let's Do It"
                onPress={handleSaveWorkout}
                style={styles.saveButton}
                loading={isSaving}
              />
              <Button
                title={
                  isRegenerating
                    ? "Generating..."
                    : "Not Feeling It, Regenerate Workout"
                }
                onPress={handleRegenerateWorkout}
                variant="outline"
                style={styles.regenerateButton}
                loading={isRegenerating}
              />
            </View>
          </ScrollView>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
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
    padding: 20,
    paddingBottom: 40,
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
  workoutTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  workoutTitle: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
  },
  difficultyBadge: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  difficultyText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  sectionContainer: {
    marginBottom: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 22,
  },
  totalTime: {
    fontSize: 14,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 22,
  },
  exerciseContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  detailItem: {
    marginRight: 16,
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  instructions: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtonsContainer: {
    marginTop: 16,
    gap: 12,
  },
  saveButton: {
    width: "100%",
  },
  regenerateButton: {
    width: "100%",
  },
  regeneratingContainer: {
    flex: 1,
    paddingTop: 120,
  },
  headerLoading: {
    alignItems: "center",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  titleLoading: {
    fontSize: 24,
    fontWeight: "bold",
  },
});

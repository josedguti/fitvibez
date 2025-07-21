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
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { WorkoutRating } from "@/components/WorkoutRating";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { updateWorkoutRating } from "@/utils/auth";
import { WorkoutResponse } from "@/utils/openai";

export default function WorkoutDetailScreen() {
  const params = useLocalSearchParams();
  const workoutId = params.workoutId as string;
  const workoutDataString = params.workoutData as string;
  const initialRating = params.rating ? parseInt(params.rating as string) : 0;
  const fromFriendProfile = params.fromFriendProfile === "true";
  const friendId = params.friendId as string;
  const friendUsername = params.friendUsername as string;

  const [workout, setWorkout] = useState<WorkoutResponse | null>(null);
  const [currentRating, setCurrentRating] = useState<number>(initialRating);
  const [isUpdatingRating, setIsUpdatingRating] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    if (workoutDataString) {
      try {
        const parsedWorkout = JSON.parse(workoutDataString) as WorkoutResponse;
        setWorkout(parsedWorkout);
        // Use initial rating from params if available
        if (initialRating > 0) {
          setCurrentRating(initialRating);
        }
      } catch (error) {
        console.error("Error parsing workout data:", error);
        Alert.alert("Error", "Failed to load workout data");
      }
    }
  }, [workoutDataString, initialRating]);

  const handleRatingChange = async (rating: number) => {
    if (!workoutId) {
      Alert.alert("Error", "Cannot rate workout: missing workout ID");
      return;
    }

    setIsUpdatingRating(true);
    try {
      const { error } = await updateWorkoutRating(workoutId, rating);

      if (error) {
        console.error("Error updating rating:", error);
        Alert.alert("Error", "Failed to save rating. Please try again.");
      } else {
        setCurrentRating(rating);
        Alert.alert("Success", "Workout rated successfully!");
      }
    } catch (error) {
      console.error("Error in handleRatingChange:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setIsUpdatingRating(false);
    }
  };

  const handleGoToWorkouts = () => {
    router.replace("/(tabs)/workouts");
  };

  const handleGoHome = () => {
    router.replace("/(tabs)");
  };

  const handleGoBackToFriendProfile = () => {
    router.back();
  };

  if (!workout) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={
            colorScheme === "dark"
              ? ["#1C1C1E", "#2C2C2E", "#3C3C3E"]
              : ["#F8F8F8", "#F2F2F2", "#EEEEEE"]
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
            ? ["#1C1C1E", "#2C2C2E", "#3C3C3E"]
            : ["#F8F8F8", "#F2F2F2", "#EEEEEE"]
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
        <ThemedText style={styles.headerTitle}>Workout Details</ThemedText>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/(tabs)")}
        >
          <Ionicons name="home" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Workout Title Header */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={
              colorScheme === "dark"
                ? ["rgba(232, 165, 165, 0.2)", "rgba(212, 197, 244, 0.1)"]
                : ["rgba(232, 165, 165, 0.3)", "rgba(212, 197, 244, 0.2)"]
            }
            style={styles.heroGradient}
          >
            <View style={styles.workoutTitleContainer}>
              <ThemedText style={styles.workoutTitle}>
                {workout.title}
              </ThemedText>
              <View
                style={[
                  styles.difficultyBadge,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Ionicons name="trending-up" size={16} color={colors.primary} />
                <ThemedText
                  style={[styles.difficultyText, { color: colors.primary }]}
                >
                  {workout.difficulty}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={styles.workoutDescription}>
              {workout.description}
            </ThemedText>

            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Ionicons name="time" size={20} color={colors.primary} />
                <ThemedText style={styles.statText}>
                  {workout.totalTime}
                </ThemedText>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="fitness" size={20} color={colors.secondary} />
                <ThemedText style={styles.statText}>
                  {workout.exercises.length} exercises
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Workout Rating Section */}
        {workoutId && !fromFriendProfile && (
          <View style={styles.ratingCard}>
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]
                  : ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.4)"]
              }
              style={styles.cardGradient}
            >
              <View style={styles.ratingHeader}>
                <Ionicons name="star" size={24} color={colors.primary} />
                <ThemedText style={styles.ratingSectionTitle}>
                  Rate This Workout
                </ThemedText>
              </View>
              <View style={styles.ratingCenter}>
                <WorkoutRating
                  currentRating={currentRating}
                  onRatingChange={handleRatingChange}
                  readonly={isUpdatingRating}
                  size="large"
                  showText={false}
                />
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Warmup Section */}
        {workout.warmup && (
          <View style={styles.sectionCard}>
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? ["rgba(245, 230, 211, 0.1)", "rgba(245, 230, 211, 0.05)"]
                  : ["rgba(245, 230, 211, 0.4)", "rgba(245, 230, 211, 0.2)"]
              }
              style={styles.cardGradient}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="flame" size={24} color={colors.accent} />
                <ThemedText style={styles.sectionTitle}>Warm Up</ThemedText>
              </View>
              <ThemedText style={styles.sectionContent}>
                {workout.warmup}
              </ThemedText>
            </LinearGradient>
          </View>
        )}

        {/* Exercises Section */}
        <View style={styles.sectionCard}>
          <LinearGradient
            colors={
              colorScheme === "dark"
                ? ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.02)"]
                : ["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.5)"]
            }
            style={styles.cardGradient}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="barbell" size={24} color={colors.primary} />
              <ThemedText style={styles.sectionTitle}>Exercises</ThemedText>
            </View>

            {workout.exercises.map((exercise, index) => (
              <View key={index} style={styles.exerciseCard}>
                <LinearGradient
                  colors={
                    colorScheme === "dark"
                      ? [
                          "rgba(255, 255, 255, 0.06)",
                          "rgba(255, 255, 255, 0.02)",
                        ]
                      : ["rgba(255, 255, 255, 0.7)", "rgba(255, 255, 255, 0.3)"]
                  }
                  style={styles.exerciseGradient}
                >
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseNumber}>
                      <ThemedText style={styles.exerciseNumberText}>
                        {index + 1}
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.exerciseName}>
                      {exercise.name}
                    </ThemedText>
                  </View>

                  <View style={styles.exerciseMetrics}>
                    {exercise.sets && (
                      <View style={styles.metricChip}>
                        <Ionicons
                          name="repeat"
                          size={14}
                          color={colors.primary}
                        />
                        <ThemedText style={styles.metricLabel}>Sets</ThemedText>
                        <ThemedText style={styles.metricValue}>
                          {exercise.sets}
                        </ThemedText>
                      </View>
                    )}
                    {exercise.reps && (
                      <View style={styles.metricChip}>
                        <Ionicons
                          name="fitness"
                          size={14}
                          color={colors.secondary}
                        />
                        <ThemedText style={styles.metricLabel}>Reps</ThemedText>
                        <ThemedText style={styles.metricValue}>
                          {exercise.reps}
                        </ThemedText>
                      </View>
                    )}
                    {exercise.duration && (
                      <View style={styles.metricChip}>
                        <Ionicons
                          name="timer"
                          size={14}
                          color={colors.accent}
                        />
                        <ThemedText style={styles.metricLabel}>
                          Duration
                        </ThemedText>
                        <ThemedText style={styles.metricValue}>
                          {exercise.duration}
                        </ThemedText>
                      </View>
                    )}
                    {exercise.restBetweenSets && (
                      <View style={styles.metricChip}>
                        <Ionicons name="pause" size={14} color="#888" />
                        <ThemedText style={styles.metricLabel}>Rest</ThemedText>
                        <ThemedText style={styles.metricValue}>
                          {exercise.restBetweenSets}
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  <View style={styles.instructionsSection}>
                    <View style={styles.instructionsHeader}>
                      <Ionicons
                        name="information-circle"
                        size={16}
                        color={colors.text}
                      />
                      <ThemedText style={styles.instructionsLabel}>
                        How to perform:
                      </ThemedText>
                    </View>
                    <ThemedText style={styles.instructions}>
                      {exercise.instructions}
                    </ThemedText>
                  </View>

                  {/* Exercise Visual Component */}
                  <ExerciseVisual
                    videoUrl={exercise.videoUrl}
                    exerciseName={exercise.name}
                  />
                </LinearGradient>
              </View>
            ))}
          </LinearGradient>
        </View>

        {/* Cooldown Section */}
        {workout.cooldown && (
          <View style={styles.sectionCard}>
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? ["rgba(212, 197, 244, 0.1)", "rgba(212, 197, 244, 0.05)"]
                  : ["rgba(212, 197, 244, 0.4)", "rgba(212, 197, 244, 0.2)"]
              }
              style={styles.cardGradient}
            >
              <View style={styles.sectionHeader}>
                <Ionicons name="leaf" size={24} color={colors.secondary} />
                <ThemedText style={styles.sectionTitle}>Cool Down</ThemedText>
              </View>
              <ThemedText style={styles.sectionContent}>
                {workout.cooldown}
              </ThemedText>
            </LinearGradient>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {fromFriendProfile ? (
            <>
              <Button
                title={`Back to ${friendUsername}'s Profile`}
                onPress={handleGoBackToFriendProfile}
                style={styles.saveButton}
              />
              <Button
                title="Go Home"
                onPress={handleGoHome}
                variant="outline"
                style={styles.homeActionButton}
              />
            </>
          ) : (
            <>
              <Button
                title="View All Workouts"
                onPress={handleGoToWorkouts}
                style={styles.saveButton}
              />
              <Button
                title="Go Home"
                onPress={handleGoHome}
                variant="outline"
                style={styles.homeActionButton}
              />
            </>
          )}
        </View>
      </ScrollView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  heroSection: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    marginTop: 20,
  },
  heroGradient: {
    borderRadius: 20,
    padding: 30,
    paddingTop: 44,
  },
  workoutTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: "600",
  },
  workoutDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.8,
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  ratingCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  cardGradient: {
    padding: 20,
  },
  ratingHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    gap: 8,
  },
  ratingSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  ratingCenter: {
    alignItems: "center",
  },
  updatingText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.8,
  },
  exerciseCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  exerciseGradient: {
    padding: 16,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseNumber: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  exerciseMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  metricChip: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  instructionsSection: {
    marginBottom: 12,
  },
  instructionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  instructionsLabel: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.7,
  },
  instructions: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8,
  },
  actionButtonsContainer: {
    gap: 16,
    marginTop: 20,
  },
  saveButton: {
    width: "100%",
  },
  homeActionButton: {
    width: "100%",
  },
});

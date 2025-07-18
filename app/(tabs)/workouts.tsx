import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  deleteWorkout,
  getWorkoutHistory,
  requireAuth,
  WorkoutHistory,
} from "@/utils/auth";

export default function WorkoutsScreen() {
  const [workouts, setWorkouts] = useState<WorkoutHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Use useFocusEffect to reload workouts when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkAuthAndLoadWorkouts();
    }, [])
  );

  const checkAuthAndLoadWorkouts = async () => {
    setIsLoading(true);
    try {
      const isAuth = await requireAuth(false); // Pass false to not show alert
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const { workouts, error } = await getWorkoutHistory();
        if (error) {
          console.error("Error loading workouts:", error);
        } else {
          setWorkouts(workouts || []);
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleCreateWorkout = () => {
    router.push("/workout-builder/workout-type");
  };

  const handleWorkoutPress = (workout: WorkoutHistory) => {
    // Navigate to the workout detail screen with the workout data
    router.push({
      pathname: "/workout-detail",
      params: {
        workoutId: workout.id,
        workoutData: JSON.stringify(workout.workout_data),
      },
    });
  };

  const handleDeleteWorkout = (workoutId: string) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Optimistically update UI
              const updatedWorkouts = workouts.filter(
                (workout) => workout.id !== workoutId
              );
              setWorkouts(updatedWorkouts);

              // Then perform the actual deletion
              const { error } = await deleteWorkout(workoutId);

              if (error) {
                console.error("Error deleting workout:", error);

                // Revert the optimistic update if there was an error
                checkAuthAndLoadWorkouts();

                Alert.alert(
                  "Error",
                  error.message || "Failed to delete workout. Please try again."
                );
              } else {
                // No need to refresh since we already updated optimistically
                console.log("Workout deleted successfully");
              }
            } catch (error) {
              console.error("Error in delete handler:", error);

              // Revert the optimistic update
              checkAuthAndLoadWorkouts();

              Alert.alert("Error", "An unexpected error occurred.");
            }
          },
        },
      ]
    );
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

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
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
        <ThemedText>Loading workouts...</ThemedText>
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
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
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Workouts
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Login to view your personalized workouts
          </ThemedText>
          <Button
            title="Login"
            onPress={handleLogin}
            style={styles.loginButton}
          />
        </View>
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

      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Your Workouts
        </ThemedText>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateWorkout}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="fitness-outline"
            size={64}
            color={colors.text}
            style={{ opacity: 0.5 }}
          />
          <ThemedText style={styles.emptyText}>
            You haven't created any workouts yet
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Start by creating your first personalized workout
          </ThemedText>
          <Button
            title="Create Workout"
            onPress={handleCreateWorkout}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.workoutCard,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                },
              ]}
              onPress={() => handleWorkoutPress(item)}
            >
              <View style={styles.workoutHeader}>
                <ThemedText style={styles.workoutTitle}>
                  {item.workout_data.title}
                </ThemedText>
                <View style={styles.workoutHeaderRight}>
                  <ThemedText style={styles.workoutDate}>
                    {formatDate(item.created_at)}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteWorkout(item.id);
                    }}
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <ThemedText style={styles.workoutDescription} numberOfLines={2}>
                {item.workout_data.description}
              </ThemedText>

              <View style={styles.workoutTags}>
                <View style={styles.tag}>
                  <Ionicons
                    name="barbell-outline"
                    size={14}
                    color={colors.primary}
                  />
                  <ThemedText style={styles.tagText}>
                    {getReadableLabel("workoutType", item.workout_type)}
                  </ThemedText>
                </View>

                <View style={styles.tag}>
                  <Ionicons
                    name="body-outline"
                    size={14}
                    color={colors.primary}
                  />
                  <ThemedText style={styles.tagText}>
                    {getReadableLabel("muscleFocus", item.muscle_focus)}
                  </ThemedText>
                </View>

                <View style={styles.tag}>
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={colors.primary}
                  />
                  <ThemedText style={styles.tagText}>
                    {item.workout_data.totalTime}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.workoutFooter}>
                <ThemedText style={styles.workoutDifficulty}>
                  {item.workout_data.difficulty}
                </ThemedText>
                <View style={styles.workoutStats}>
                  <ThemedText style={styles.workoutExercises}>
                    {item.workout_data.exercises.length} exercises
                  </ThemedText>
                  {item.completed ? (
                    <View style={styles.completedBadge}>
                      <ThemedText style={styles.completedText}>
                        Completed
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 32,
  },
  loginButton: {
    width: "80%",
    marginTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    flex: 1,
    textAlign: "center",
    marginTop: 8,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    marginTop: 8,
    marginBottom: 32,
  },
  emptyButton: {
    width: "80%",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  workoutCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  workoutHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  workoutDate: {
    fontSize: 14,
    opacity: 0.6,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  workoutDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  workoutTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    marginLeft: 4,
  },
  workoutFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  workoutDifficulty: {
    fontSize: 14,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  workoutStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutExercises: {
    fontSize: 14,
    opacity: 0.7,
  },
  completedBadge: {
    backgroundColor: "rgba(75, 181, 67, 0.2)",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  completedText: {
    fontSize: 12,
    color: "#4BB543",
  },
});

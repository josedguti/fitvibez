import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { requireAuth } from "@/utils/auth";
import {
  FriendProfile,
  getFriendWorkoutHistory,
  removeFriend,
} from "@/utils/friends";
import { supabase } from "@/utils/supabase";

export default function FriendProfileScreen() {
  const { friendId } = useLocalSearchParams();
  const [friendProfile, setFriendProfile] = useState<FriendProfile | null>(
    null
  );
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "workouts">("profile");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useFocusEffect(
    useCallback(() => {
      if (friendId) {
        checkAuthAndLoadData();
      }
    }, [friendId])
  );

  const checkAuthAndLoadData = async () => {
    setIsLoading(true);
    try {
      const isAuth = await requireAuth(false);
      setIsAuthenticated(isAuth);

      if (isAuth && friendId) {
        await loadFriendProfile();
        await loadWorkoutHistory();
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, username, sex, date_of_birth, weight, weight_unit, height, height_unit, fitness_goals, profile_picture_url"
        )
        .eq("id", friendId)
        .single();

      if (error) {
        console.error("Error loading friend profile:", error);
        Alert.alert("Error", "Failed to load friend profile");
      } else {
        setFriendProfile(data);
      }
    } catch (error) {
      console.error("Error loading friend profile:", error);
    }
  };

  const loadWorkoutHistory = async () => {
    const { workouts, error } = await getFriendWorkoutHistory(
      friendId as string
    );
    if (error) {
      console.error("Error loading workout history:", error);
    } else {
      setWorkoutHistory(workouts);
    }
  };

  const calculateAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return "Not set";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return `${age} years`;
  };

  const handleRemoveFriend = async () => {
    Alert.alert(
      "Remove Friend",
      `Are you sure you want to remove ${friendProfile?.username} as a friend?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            const { success, error } = await removeFriend(friendId as string);
            if (success) {
              Alert.alert("Success", "Friend removed successfully");
              router.back();
            } else {
              Alert.alert("Error", error || "Failed to remove friend");
            }
          },
        },
      ]
    );
  };

  // Helper function to format dates nicely
  const formatWorkoutDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Helper function to get readable workout type
  const getReadableWorkoutType = (type: string) => {
    const types: { [key: string]: string } = {
      strength: "Strength Training",
      cardio: "Cardio",
      hiit: "HIIT",
      flexibility: "Flexibility",
      both: "Strength & Cardio",
      "full-body": "Full Body",
    };
    return types[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Helper function to get readable muscle focus
  const getReadableMuscleFocus = (focus: string) => {
    const focuses: { [key: string]: string } = {
      "full-body": "Full Body",
      "upper-body": "Upper Body",
      "lower-body": "Lower Body",
      core: "Core",
    };
    return focuses[focus] || focus.charAt(0).toUpperCase() + focus.slice(1);
  };

  // Helper function to get equipment display
  const getEquipmentDisplay = (equipment: string) => {
    const equipmentMap: { [key: string]: string } = {
      none: "No Equipment",
      dumbbells: "Dumbbells",
      kettlebells: "Kettlebells",
      bands: "Resistance Bands",
      "full-gym": "Full Gym",
      "yoga-mat": "Yoga Mat",
    };
    return (
      equipmentMap[equipment] ||
      equipment.charAt(0).toUpperCase() + equipment.slice(1)
    );
  };

  const renderWorkoutItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.workoutItem,
        {
          backgroundColor: colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
          borderLeftWidth: 4,
          borderLeftColor: item.completed ? "#4BB543" : colors.primary,
        },
      ]}
      onPress={() => {
        // You can add navigation to workout detail if desired
        // router.push({ pathname: "/workout-detail", params: { workoutData: JSON.stringify(item.workout_data) }});
      }}
    >
      <View style={styles.workoutHeader}>
        <View style={styles.workoutTitleSection}>
          <ThemedText style={styles.workoutTitle}>
            {item.workout_data?.title ||
              getReadableWorkoutType(item.workout_type)}
          </ThemedText>
          {item.completed && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4BB543" />
              <ThemedText style={styles.completedText}>Completed</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={styles.workoutDate}>
          {formatWorkoutDate(item.created_at)}
        </ThemedText>
      </View>

      {item.workout_data?.description && (
        <ThemedText style={styles.workoutDescription} numberOfLines={2}>
          {item.workout_data.description}
        </ThemedText>
      )}

      <View style={styles.workoutMetrics}>
        <View style={styles.metricItem}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <ThemedText style={styles.metricText}>
            {item.workout_data?.totalTime || `${item.time_available} min`}
          </ThemedText>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="body-outline" size={16} color={colors.primary} />
          <ThemedText style={styles.metricText}>
            {getReadableMuscleFocus(item.muscle_focus)}
          </ThemedText>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="barbell-outline" size={16} color={colors.primary} />
          <ThemedText style={styles.metricText}>
            {getEquipmentDisplay(item.equipment)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.workoutTags}>
        <View
          style={[
            styles.workoutTag,
            { backgroundColor: colors.primary + "15" },
          ]}
        >
          <Ionicons name="happy-outline" size={14} color={colors.primary} />
          <ThemedText
            style={[styles.workoutTagText, { color: colors.primary }]}
          >
            {item.mood.charAt(0).toUpperCase() + item.mood.slice(1)}
          </ThemedText>
        </View>

        {item.workout_data?.difficulty && (
          <View
            style={[
              styles.workoutTag,
              { backgroundColor: colors.accent + "15" },
            ]}
          >
            <Ionicons
              name="trending-up-outline"
              size={14}
              color={colors.accent}
            />
            <ThemedText
              style={[styles.workoutTagText, { color: colors.accent }]}
            >
              {item.workout_data.difficulty}
            </ThemedText>
          </View>
        )}

        {item.workout_data?.exercises && (
          <View
            style={[styles.workoutTag, { backgroundColor: colors.text + "10" }]}
          >
            <Ionicons name="list-outline" size={14} color={colors.text} />
            <ThemedText style={[styles.workoutTagText, { color: colors.text }]}>
              {item.workout_data.exercises.length} exercises
            </ThemedText>
          </View>
        )}
      </View>

      {item.rating && (
        <View style={styles.rating}>
          <ThemedText style={styles.ratingLabel}>Rating:</ThemedText>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? "star" : "star-outline"}
              size={16}
              color="#FFD700"
            />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );

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
        <ThemedText>Loading profile...</ThemedText>
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
            Access Denied
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Login to view friend profiles
          </ThemedText>
          <Button
            title="Login"
            onPress={() => router.push("/login")}
            style={styles.loginButton}
          />
        </View>
      </ThemedView>
    );
  }

  if (!friendProfile) {
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
            Profile Not Found
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            This friend profile could not be loaded
          </ThemedText>
          <Button
            title="Go Back"
            onPress={() => router.back()}
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

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {friendProfile?.username || "Friend Profile"}
        </ThemedText>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/(tabs)")}
        >
          <Ionicons name="home" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {friendProfile.profile_picture_url ? (
              <Image
                source={{
                  uri: `${friendProfile.profile_picture_url}?t=${Date.now()}`,
                }}
                style={styles.avatar}
                contentFit="cover"
                cachePolicy="none"
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#4D4D5D" : "#FFE5E5",
                  },
                ]}
              >
                <ThemedText style={styles.avatarText}>
                  {friendProfile.username?.charAt(0).toUpperCase() || "U"}
                </ThemedText>
              </View>
            )}
            <ThemedText style={styles.username}>
              {friendProfile.username}
            </ThemedText>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "profile" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab("profile")}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "profile" && { color: "white" },
                ]}
              >
                Profile
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "workouts" && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab("workouts")}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === "workouts" && { color: "white" },
                ]}
              >
                Workouts ({workoutHistory.length})
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Profile Info Tab */}
          {activeTab === "profile" && (
            <>
              <View style={styles.infoSection}>
                <ThemedText style={styles.sectionTitle}>
                  Personal Information
                </ThemedText>

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <ThemedText style={styles.infoLabel}>Sex</ThemedText>
                    <ThemedText style={styles.infoValue}>
                      {friendProfile.sex
                        ? friendProfile.sex.charAt(0).toUpperCase() +
                          friendProfile.sex.slice(1)
                        : "Not set"}
                    </ThemedText>
                  </View>

                  <View style={styles.infoItem}>
                    <ThemedText style={styles.infoLabel}>Age</ThemedText>
                    <ThemedText style={styles.infoValue}>
                      {calculateAge(friendProfile.date_of_birth)}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <ThemedText style={styles.infoLabel}>Height</ThemedText>
                    <ThemedText style={styles.infoValue}>
                      {friendProfile.height
                        ? `${friendProfile.height} ${friendProfile.height_unit}`
                        : "Not set"}
                    </ThemedText>
                  </View>

                  <View style={styles.infoItem}>
                    <ThemedText style={styles.infoLabel}>Weight</ThemedText>
                    <ThemedText style={styles.infoValue}>
                      {friendProfile.weight
                        ? `${friendProfile.weight} ${friendProfile.weight_unit}`
                        : "Not set"}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {friendProfile.fitness_goals && (
                <View style={styles.infoSection}>
                  <ThemedText style={styles.sectionTitle}>
                    Fitness Goals
                  </ThemedText>
                  <ThemedText style={styles.goalText}>
                    {friendProfile.fitness_goals}
                  </ThemedText>
                </View>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  title="Remove Friend"
                  onPress={handleRemoveFriend}
                  style={styles.removeButton}
                  variant="outline"
                />
              </View>
            </>
          )}

          {/* Workouts Tab */}
          {activeTab === "workouts" && (
            <View style={styles.section}>
              {workoutHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="fitness-outline"
                    size={64}
                    color={colors.text + "40"}
                  />
                  <ThemedText style={styles.emptyText}>
                    No completed workouts
                  </ThemedText>
                  <ThemedText style={styles.emptySubtext}>
                    {friendProfile.username} hasn't completed any workouts yet
                  </ThemedText>
                </View>
              ) : (
                <FlatList
                  data={workoutHistory}
                  renderItem={renderWorkoutItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
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
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
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
  profileContainer: {
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 42,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
  },
  goalText: {
    fontSize: 15,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 20,
  },
  removeButton: {
    width: "100%",
  },
  section: {
    marginTop: 8,
  },
  workoutItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  workoutTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    color: "#4BB543",
    fontWeight: "500",
  },
  workoutDate: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: "500",
  },
  workoutDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 20,
  },
  workoutMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 107, 107, 0.05)",
    borderRadius: 12,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricText: {
    fontSize: 13,
    fontWeight: "500",
  },
  workoutTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  workoutTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  workoutTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

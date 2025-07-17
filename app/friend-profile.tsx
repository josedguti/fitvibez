import { Ionicons } from "@expo/vector-icons";
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
          "id, username, sex, date_of_birth, weight, weight_unit, height, height_unit, fitness_goals"
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

  const renderWorkoutItem = ({ item }: { item: any }) => (
    <View
      style={[styles.workoutItem, { backgroundColor: colors.cardBackground }]}
    >
      <View style={styles.workoutHeader}>
        <ThemedText style={styles.workoutType}>
          {item.workout_type?.charAt(0).toUpperCase() +
            item.workout_type?.slice(1) || "Workout"}
        </ThemedText>
        <ThemedText style={styles.workoutDate}>
          {new Date(item.created_at).toLocaleDateString()}
        </ThemedText>
      </View>

      <View style={styles.workoutDetails}>
        <View style={styles.workoutTag}>
          <Ionicons name="time-outline" size={14} color={colors.primary} />
          <ThemedText style={styles.workoutTagText}>
            {item.time_available}
          </ThemedText>
        </View>
        <View style={styles.workoutTag}>
          <Ionicons name="fitness-outline" size={14} color={colors.primary} />
          <ThemedText style={styles.workoutTagText}>
            {item.muscle_focus}
          </ThemedText>
        </View>
        <View style={styles.workoutTag}>
          <Ionicons name="happy-outline" size={14} color={colors.primary} />
          <ThemedText style={styles.workoutTagText}>{item.mood}</ThemedText>
        </View>
      </View>

      {item.rating && (
        <View style={styles.rating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? "star" : "star-outline"}
              size={16}
              color={colors.accent}
            />
          ))}
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={
            colorScheme === "dark"
              ? ["#2D2D3A", "#3D3D4D"]
              : ["#FFF5F7", "#FFF"]
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
              ? ["#2D2D3A", "#3D3D4D"]
              : ["#FFF5F7", "#FFF"]
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
              ? ["#2D2D3A", "#3D3D4D"]
              : ["#FFF5F7", "#FFF"]
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
          colorScheme === "dark" ? ["#2D2D3A", "#3D3D4D"] : ["#FFF5F7", "#FFF"]
        }
        style={styles.background}
      />

      {/* Header with navigation */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          {friendProfile.username}
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  workoutType: {
    fontSize: 16,
    fontWeight: "600",
  },
  workoutDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  workoutDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  workoutTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  workoutTagText: {
    fontSize: 12,
    color: undefined,
  },
  rating: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
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

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
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
import {
  deleteProfilePicture,
  getUserProfile,
  requireAuth,
  signOut,
  uploadProfilePicture,
  UserProfile,
} from "@/utils/auth";
import {
  showDeleteConfirmation,
  showImagePickerOptions,
} from "@/utils/imagePicker";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Use useFocusEffect to reload profile data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkAuthAndLoadProfile();
    }, [])
  );

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return "Not set";

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    // If birthday hasn't occurred yet this year, subtract a year
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return `${age} years`;
  };

  const checkAuthAndLoadProfile = async () => {
    setIsLoading(true);
    try {
      const isAuth = await requireAuth(false); // Pass false to not show alert
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const { profile, error } = await getUserProfile();
        if (error) {
          console.error("Error loading profile:", error);
        } else {
          setProfile(profile);
        }
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push({
      pathname: "/profile-setup",
      params: { isEditing: "true" },
    });
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await signOut();
            setProfile(null);
            setIsAuthenticated(false);
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleChangePhoto = async () => {
    if (profile?.profile_picture_url) {
      // User has a profile picture, show options to change or delete
      Alert.alert("Profile Picture", "What would you like to do?", [
        {
          text: "Change Photo",
          onPress: handleSelectNewPhoto,
        },
        {
          text: "Delete Photo",
          style: "destructive",
          onPress: handleDeletePhoto,
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]);
    } else {
      // No profile picture, directly show picker
      handleSelectNewPhoto();
    }
  };

  const handleSelectNewPhoto = async () => {
    try {
      setIsUploadingImage(true);

      const result = await showImagePickerOptions();

      if (result.cancelled || !result.uri) {
        if (result.error) {
          Alert.alert("Error", result.error);
        }
        return;
      }

      // Upload the image
      const { profilePictureUrl, error } = await uploadProfilePicture(
        result.uri
      );

      if (error) {
        Alert.alert(
          "Upload Error",
          "Failed to upload profile picture. Please try again."
        );
        return;
      }

      // Refresh profile data from database to get the updated picture URL
      await checkAuthAndLoadProfile();

      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error changing photo:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeletePhoto = async () => {
    try {
      const confirmed = await showDeleteConfirmation();

      if (!confirmed) {
        return;
      }

      setIsUploadingImage(true);

      const { error } = await deleteProfilePicture();

      if (error) {
        Alert.alert(
          "Delete Error",
          "Failed to delete profile picture. Please try again."
        );
        return;
      }

      // Refresh profile data from database to remove the picture URL
      await checkAuthAndLoadProfile();

      Alert.alert("Success", "Profile picture deleted successfully!");
    } catch (error) {
      console.error("Error deleting photo:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
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
              ? ["#1C1C1E", "#2C2C2E", "#3C3C3E"]
              : ["#F8F8F8", "#F2F2F2", "#EEEEEE"]
          }
          style={styles.background}
        />
        <View style={styles.content}>
          <ThemedText type="title" style={styles.title}>
            Profile
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Login to view and edit your profile
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

  if (!profile) {
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
        <ThemedText>Profile data not available</ThemedText>
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Your Profile
          </ThemedText>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            {profile.profile_picture_url ? (
              <Image
                source={{
                  uri: `${profile.profile_picture_url}?t=${Date.now()}`,
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
                  {profile.username
                    ? profile.username.charAt(0).toUpperCase()
                    : "U"}
                </ThemedText>
              </View>
            )}
            <TouchableOpacity
              style={styles.editAvatarButton}
              onPress={handleChangePhoto}
              disabled={isUploadingImage}
            >
              <Ionicons name="camera" size={16} color={colors.primary} />
              <ThemedText style={styles.editAvatarText}>
                {isUploadingImage ? "Uploading..." : "Change Photo"}
              </ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.username}>{profile.username}</ThemedText>
          </View>

          <View style={styles.infoSection}>
            <ThemedText style={styles.sectionTitle}>
              Personal Information
            </ThemedText>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Sex</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {profile.sex
                    ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1)
                    : "Not set"}
                </ThemedText>
              </View>

              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Age</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {calculateAge(profile.date_of_birth)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Height</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {profile.height
                    ? `${profile.height} ${profile.height_unit}`
                    : "Not set"}
                </ThemedText>
              </View>

              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Weight</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {profile.weight
                    ? `${profile.weight} ${profile.weight_unit}`
                    : "Not set"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Fitness Level</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {profile.fitness_level
                    ? profile.fitness_level.charAt(0).toUpperCase() +
                      profile.fitness_level.slice(1)
                    : "Not set"}
                </ThemedText>
              </View>

              <View style={styles.infoItem}>
                <ThemedText style={styles.infoLabel}>Injuries</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {profile.injuries ? "Yes" : "No"}
                </ThemedText>
              </View>
            </View>
          </View>

          {profile.fitness_goals && (
            <View style={styles.infoSection}>
              <ThemedText style={styles.sectionTitle}>Fitness Goals</ThemedText>
              <ThemedText style={styles.goalText}>
                {profile.fitness_goals}
              </ThemedText>
            </View>
          )}

          {profile.injuries && (
            <View style={styles.infoSection}>
              <ThemedText style={styles.sectionTitle}>
                Injuries/Limitations
              </ThemedText>
              <ThemedText style={styles.injuryText}>
                {profile.injuries}
              </ThemedText>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title="Edit Profile"
              onPress={handleEditProfile}
              style={styles.editButton}
            />

            <Button
              title="Logout"
              onPress={handleLogout}
              style={styles.logoutButton}
              variant="outline"
            />
          </View>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16, // Reduced from 20
  },
  header: {
    paddingTop: 70, // Reduced from 80
    paddingHorizontal: 20,
    paddingBottom: 8, // Reduced from 10
    alignItems: "center",
  },
  profileContainer: {
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 12, // Reduced from 16
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6, // Reduced from 8
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    lineHeight: 42,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  infoSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 10, // Reduced from 12
    marginBottom: 8, // Reduced from 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6, // Reduced from 8
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6, // Reduced from 8
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
    lineHeight: 20, // Reduced from 22
  },
  injuryText: {
    fontSize: 15,
    lineHeight: 20, // Reduced from 22
  },
  buttonContainer: {
    marginTop: 16, // Reduced from 16
    gap: 12, // Reduced from 12
  },
  editButton: {
    width: "100%",
  },
  logoutButton: {
    width: "100%",
  },
  editAvatarButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 16,
  },
  editAvatarText: {
    marginLeft: 6,
    fontSize: 13,
  },
});

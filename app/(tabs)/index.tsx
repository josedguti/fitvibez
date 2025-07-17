import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

import VibeFitLogo from "@/assets/images/vibefit-logo";
import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/utils/supabase";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Refresh auth status whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("Home screen focused, checking auth status");
      checkAuthStatus();
      return () => {
        // Cleanup function if needed
      };
    }, [])
  );

  const checkAuthStatus = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      console.log("Auth status:", !!data.session ? "Logged in" : "Logged out");
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignup = () => {
    router.push("/signup");
  };

  const handleCreateWorkout = () => {
    router.push("/workout-builder/workout-type");
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={
          colorScheme === "dark" ? ["#2D2D3A", "#3D3D4D"] : ["#FFF5F7", "#FFF"]
        }
        style={styles.background}
      />

      <View style={styles.content}>
        {/* Logo Circle with Background */}
        <View style={styles.logoCircleContainer}>
          <View style={styles.logoCircle}>
            <VibeFitLogo width={width * 0.25} height={width * 0.25} />
          </View>
        </View>

        {/* App Name and Tagline */}
        <View style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>
            VibeFit
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your personal AI workout assistant
          </ThemedText>
        </View>

        {/* Features Box with Dark Background */}
        <View
          style={[
            styles.featureContainer,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(45, 45, 58, 0.7)"
                  : "rgba(0, 0, 0, 0.05)",
            },
          ]}
        >
          <FeatureItem text="Personalized workouts based on your mood" />
          <FeatureItem text="Tailored to your available time" />
          <FeatureItem text="Focus on your fitness goals" />
          <FeatureItem text="AI-powered workout generation" />
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <Button
                  title="Build Today's Workout"
                  onPress={handleCreateWorkout}
                  style={styles.button}
                />
              ) : (
                <Button
                  title="Get Started"
                  onPress={handleLogin}
                  style={styles.button}
                />
              )}
            </>
          )}
        </View>
      </View>
    </ThemedView>
  );
}

function FeatureItem({ text }: { text: string }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={styles.featureItem}>
      <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
      <ThemedText style={styles.featureText}>{text}</ThemedText>
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
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircleContainer: {
    alignItems: "center",
    marginBottom: 30, // Increased from 20
    marginTop: -20, // Changed from -40 to reduce top spacing
  },
  logoCircle: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    backgroundColor: "rgba(80, 80, 90, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 10, // Added padding to ensure text isn't cut off
  },
  title: {
    fontSize: 38, // Reduced from 42 to ensure it fits better
    fontWeight: "bold",
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: "center",
    includeFontPadding: true, // Ensure proper text rendering with padding
    paddingTop: 5, // Add explicit padding to the top of the text
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.8,
  },
  featureContainer: {
    width: "100%",
    marginBottom: 40,
    padding: 24,
    borderRadius: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    width: "100%",
  },
});

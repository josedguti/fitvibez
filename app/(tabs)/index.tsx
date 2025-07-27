import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";

import FitVibezLogo from "@/assets/images/fitvibez-logo";
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
          colorScheme === "dark"
            ? ["#1C1C1E", "#2C2C2E", "#3C3C3E"]
            : ["#F8F8F8", "#F2F2F2", "#EEEEEE"]
        }
        style={styles.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          {/* Logo with enhanced styling */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={["rgba(255, 255, 255, 0.2)", "rgba(255, 255, 255, 0.05)"]}
              style={styles.logoCircle}
            >
              <FitVibezLogo width={width * 0.22} height={width * 0.22} />
            </LinearGradient>
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <ThemedText style={styles.welcomeEmoji}>💪✨</ThemedText>
            <ThemedText style={styles.welcomeText}>
              {isAuthenticated ? "Ready to Crush It?" : "Welcome to FitVibez!"}
            </ThemedText>
            <ThemedText style={styles.tagline}>
              🚀 Your AI-powered fitness companion that adapts to your mood,
              time, and goals
            </ThemedText>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <StatCard
            emoji="🔥"
            title="Powered by AI"
            subtitle="Smart workouts"
            colorScheme={colorScheme}
          />
          <StatCard
            emoji="⏱️"
            title="Any Duration"
            subtitle="10-120 minutes"
            colorScheme={colorScheme}
          />
          <StatCard
            emoji="🎯"
            title="Your Goals"
            subtitle="Personalized"
            colorScheme={colorScheme}
          />
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <ThemedText style={styles.sectionTitle}>
            ✨ What Makes FitVibez Special
          </ThemedText>

          <FeatureCard
            emoji="🧠"
            title="AI-Powered Intelligence"
            description="Workouts that understand your mood and energy levels"
            colorScheme={colorScheme}
          />
          <FeatureCard
            emoji="⚡"
            title="Lightning Fast"
            description="Generate perfect workouts in seconds, not hours"
            colorScheme={colorScheme}
          />
          <FeatureCard
            emoji="🎨"
            title="Perfectly Tailored"
            description="Every exercise fits your time, space, and equipment"
            colorScheme={colorScheme}
          />
          <FeatureCard
            emoji="📱"
            title="Always With You"
            description="Home, gym, or anywhere - your coach travels with you"
            colorScheme={colorScheme}
          />
        </View>

        {/* Motivational Quote */}
        <View style={styles.quoteSection}>
          <LinearGradient
            colors={
              colorScheme === "dark"
                ? ["rgba(255, 107, 156, 0.15)", "rgba(196, 78, 196, 0.15)"]
                : ["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.7)"]
            }
            style={styles.quoteCard}
          >
            <ThemedText style={styles.quoteEmoji}>💎</ThemedText>
            <ThemedText style={styles.quoteText}>
              "Every workout is a step closer to the best version of yourself"
            </ThemedText>
            <ThemedText style={styles.quoteAuthor}>
              - Your FitVibez Coach
            </ThemedText>
          </LinearGradient>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Button
                    title="🚀 Build Today's Workout"
                    onPress={handleCreateWorkout}
                    style={styles.primaryButton}
                  />
                </>
              ) : (
                <>
                  <Button
                    title="🎯 Start Your Journey"
                    onPress={handleSignup}
                    style={styles.primaryButton}
                  />
                  <Button
                    title="👋 Already have an account? Sign in"
                    onPress={handleLogin}
                    variant="outline"
                    style={styles.secondaryButton}
                  />
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function StatCard({
  emoji,
  title,
  subtitle,
  colorScheme,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  colorScheme: string | null | undefined;
}) {
  return (
    <LinearGradient
      colors={
        colorScheme === "dark"
          ? ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]
          : ["rgba(255, 255, 255, 0.9)", "rgba(255, 255, 255, 0.6)"]
      }
      style={styles.statCard}
    >
      <ThemedText style={styles.statEmoji}>{emoji}</ThemedText>
      <ThemedText style={styles.statTitle}>{title}</ThemedText>
      <ThemedText style={styles.statSubtitle}>{subtitle}</ThemedText>
    </LinearGradient>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
  colorScheme,
}: {
  emoji: string;
  title: string;
  description: string;
  colorScheme: string | null | undefined;
}) {
  return (
    <LinearGradient
      colors={
        colorScheme === "dark"
          ? ["rgba(255, 255, 255, 0.08)", "rgba(255, 255, 255, 0.02)"]
          : ["rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.4)"]
      }
      style={styles.featureCard}
    >
      <View style={styles.featureHeader}>
        <ThemedText style={styles.featureEmoji}>{emoji}</ThemedText>
        <ThemedText style={styles.featureTitle}>{title}</ThemedText>
      </View>
      <ThemedText style={styles.featureDescription}>{description}</ThemedText>
    </LinearGradient>
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
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: (width * 0.35) / 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  welcomeContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeEmoji: {
    fontSize: 32,
    marginBottom: 8,
    marginTop: 16,
    paddingVertical: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    paddingVertical: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 24,
    fontWeight: "500",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: "center",
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  featureCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  featureDescription: {
    fontSize: 15,
    opacity: 0.8,
    lineHeight: 22,
  },
  quoteSection: {
    marginBottom: 30,
  },
  quoteCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  quoteEmoji: {
    fontSize: 28,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 26,
    fontWeight: "500",
  },
  quoteAuthor: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
  actionSection: {
    gap: 16,
  },
  primaryButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  quickActions: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  quickActionsText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.9,
  },
});

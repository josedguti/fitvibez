import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { supabase } from "@/utils/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call the signIn function from auth.ts
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
        setIsLoading(false);
        return;
      }

      // Check if the user has a complete profile
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("sex, date_of_birth, height, weight")
          .eq("id", user.id)
          .single();

        // If profile is incomplete, redirect to profile setup
        if (
          !profile ||
          !profile.sex ||
          !profile.date_of_birth ||
          !profile.height ||
          !profile.weight
        ) {
          router.replace("/profile-setup");
        } else {
          // Profile is complete, go to main app
          router.replace("/(tabs)");
        }
      } else {
        // No user found, go to profile setup
        router.replace("/profile-setup");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleSignupPress = () => {
    router.push("/signup");
  };

  // Helper function to auto-fill test credentials
  const fillTestCredentials = () => {
    setEmail("test@example.com");
    setPassword("password123");
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#1C1C1E", "#2C2C2E"]
            : ["#F8F8F8", "#FAFAFA"]
        }
        style={styles.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Login
          </ThemedText>
          <TouchableOpacity
            onPress={fillTestCredentials}
            style={styles.devButton}
          >
            <ThemedText style={styles.devButtonText}>Dev</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email or Username</ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                  color: colors.text,
                  borderColor: colorScheme === "dark" ? "#4D4D5D" : "#E5E5E5",
                },
              ]}
              placeholder="Enter your email or username"
              placeholderTextColor={
                colorScheme === "dark" ? "#9BA1A6" : "#AAAAAA"
              }
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                    color: colors.text,
                    borderColor: colorScheme === "dark" ? "#4D4D5D" : "#E5E5E5",
                  },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={
                  colorScheme === "dark" ? "#9BA1A6" : "#AAAAAA"
                }
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError("");
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color={colorScheme === "dark" ? "#9BA1A6" : "#AAAAAA"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <ThemedText style={styles.forgotPasswordText}>
              Forgot Password?
            </ThemedText>
          </TouchableOpacity>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.signupContainer}>
            <ThemedText>Don't have an account? </ThemedText>
            <TouchableOpacity onPress={handleSignupPress}>
              <ThemedText style={{ color: colors.primary }}>Sign Up</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  devButton: {
    padding: 8,
  },
  devButtonText: {
    fontSize: 14,
    opacity: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  loginButton: {
    marginBottom: 16,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
});

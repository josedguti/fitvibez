import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
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
import { getUserProfile, updateUserProfile } from "@/utils/auth";
import { supabase } from "@/utils/supabase";

// Sex options
const SEX_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Woman", value: "woman" },
  { label: "Other", value: "other" },
];

// Fitness level options
const FITNESS_LEVELS = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
  { label: "Athletic", value: "athletic" },
  { label: "Professional", value: "professional" },
];

// Injuries options
const INJURIES_OPTIONS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

export default function ProfileSetupScreen() {
  const params = useLocalSearchParams();
  const isEditing = params.isEditing === "true";

  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sex, setSex] = useState<string>("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [fitnessLevel, setFitnessLevel] = useState<string>("");
  const [hasInjuries, setHasInjuries] = useState<string>("");
  const [injuries, setInjuries] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isNewUser, setIsNewUser] = useState(true);

  // Unit states
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");

  // Modal states
  const [showSexModal, setShowSexModal] = useState(false);
  const [showFitnessLevelModal, setShowFitnessLevelModal] = useState(false);
  const [showInjuriesModal, setShowInjuriesModal] = useState(false);
  const [showSkipWarningModal, setShowSkipWarningModal] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Check if user is authenticated and load existing profile data
  useEffect(() => {
    async function checkAuthAndLoadProfile() {
      try {
        const { data } = await supabase.auth.getSession();

        if (!data.session) {
          // Not authenticated, redirect to login
          router.replace("/login");
          return;
        }

        // Load existing profile data if available
        const { profile, error } = await getUserProfile();

        if (profile) {
          // Check if this is a new user or existing user
          setIsNewUser(!profile.sex && !profile.date_of_birth);

          // Pre-fill form with existing data
          if (profile.date_of_birth) {
            setDateOfBirth(new Date(profile.date_of_birth));
          }
          if (profile.sex) setSex(profile.sex);

          if (profile.weight) {
            setWeight(profile.weight.toString());
            if (profile.weight_unit)
              setWeightUnit(profile.weight_unit as "kg" | "lb");
          }

          if (profile.height) {
            setHeight(profile.height.toString());
            if (profile.height_unit)
              setHeightUnit(profile.height_unit as "cm" | "in");
          }

          if (profile.fitness_level) setFitnessLevel(profile.fitness_level);

          if (profile.injuries) {
            setHasInjuries("yes");
            setInjuries(profile.injuries);
          } else {
            setHasInjuries("no");
          }
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkAuthAndLoadProfile();
  }, []);

  const handleSave = async () => {
    if (
      !dateOfBirth ||
      !sex ||
      !weight ||
      !height ||
      !fitnessLevel ||
      !hasInjuries
    ) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Save profile data to Supabase
      const { error } = await updateUserProfile({
        date_of_birth: dateOfBirth.toISOString().split("T")[0], // Format as YYYY-MM-DD
        sex,
        weight: parseFloat(weight),
        weight_unit: weightUnit,
        height: parseFloat(height),
        height_unit: heightUnit,
        fitness_level: fitnessLevel,
        injuries: hasInjuries === "yes" ? injuries : "",
        updated_at: new Date().toISOString(),
      });

      if (error) {
        Alert.alert("Error", "Failed to save profile: " + error.message);
        setIsLoading(false);
        return;
      }

      // Navigate based on context
      if (isEditing) {
        // If editing profile, go back to profile tab
        router.back();
      } else {
        // If new user setup, go to workout builder
        router.navigate("/workout-builder/workout-type");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleSkipRequest = () => {
    // Only show warning if it's a new user
    if (isNewUser) {
      setShowSkipWarningModal(true);
    } else {
      router.back();
    }
  };

  const handleSkipConfirm = () => {
    // Close the modal first
    setShowSkipWarningModal(false);

    // Then navigate to the workout builder flow
    router.navigate("/workout-builder/workout-type");
  };

  // Handle date change from date picker
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDateOfBirth(selectedDate);
    }
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "Select Date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to select sex
  const selectSex = (value: string) => {
    setSex(value);
    setShowSexModal(false);
  };

  // Helper function to select fitness level
  const selectFitnessLevel = (value: string) => {
    setFitnessLevel(value);
    setShowFitnessLevelModal(false);
  };

  // Helper function to select injuries option
  const selectInjuriesOption = (value: string) => {
    setHasInjuries(value);
    setShowInjuriesModal(false);
  };

  // Helper function to toggle weight unit
  const toggleWeightUnit = () => {
    if (weightUnit === "kg") {
      // Convert kg to lb
      if (weight) {
        const weightInLb = (parseFloat(weight) * 2.20462).toFixed(1);
        setWeight(weightInLb);
      }
      setWeightUnit("lb");
    } else {
      // Convert lb to kg
      if (weight) {
        const weightInKg = (parseFloat(weight) / 2.20462).toFixed(1);
        setWeight(weightInKg);
      }
      setWeightUnit("kg");
    }
  };

  // Helper function to toggle height unit
  const toggleHeightUnit = () => {
    if (heightUnit === "cm") {
      // Convert cm to in
      if (height) {
        const heightInInches = (parseFloat(height) / 2.54).toFixed(1);
        setHeight(heightInInches);
      }
      setHeightUnit("in");
    } else {
      // Convert in to cm
      if (height) {
        const heightInCm = (parseFloat(height) * 2.54).toFixed(1);
        setHeight(heightInCm);
      }
      setHeightUnit("cm");
    }
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
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

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={
          colorScheme === "dark" ? ["#2D2D3A", "#3D3D4D"] : ["#FFF5F7", "#FFF"]
        }
        style={styles.background}
      />

      {/* Sex Modal */}
      <Modal
        visible={showSexModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSexModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSexModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
              },
            ]}
          >
            <ThemedText style={styles.modalTitle}>Select Sex</ThemedText>
            {SEX_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  sex === option.value && {
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(167, 139, 250, 0.2)"
                        : "rgba(255, 107, 107, 0.1)",
                  },
                ]}
                onPress={() => selectSex(option.value)}
              >
                <ThemedText style={styles.modalOptionText}>
                  {option.label}
                </ThemedText>
                {sex === option.value && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fitness Level Modal */}
      <Modal
        visible={showFitnessLevelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFitnessLevelModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFitnessLevelModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
              },
            ]}
          >
            <ThemedText style={styles.modalTitle}>
              Select Fitness Level
            </ThemedText>
            {FITNESS_LEVELS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  fitnessLevel === option.value && {
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(167, 139, 250, 0.2)"
                        : "rgba(255, 107, 107, 0.1)",
                  },
                ]}
                onPress={() => selectFitnessLevel(option.value)}
              >
                <ThemedText style={styles.modalOptionText}>
                  {option.label}
                </ThemedText>
                {fitnessLevel === option.value && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Injuries Modal */}
      <Modal
        visible={showInjuriesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowInjuriesModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowInjuriesModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
              },
            ]}
          >
            <ThemedText style={styles.modalTitle}>
              Do you have any injuries or limitations?
            </ThemedText>
            {INJURIES_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.modalOption,
                  hasInjuries === option.value && {
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(167, 139, 250, 0.2)"
                        : "rgba(255, 107, 107, 0.1)",
                  },
                ]}
                onPress={() => selectInjuriesOption(option.value)}
              >
                <ThemedText style={styles.modalOptionText}>
                  {option.label}
                </ThemedText>
                {hasInjuries === option.value && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Skip Warning Modal */}
      <Modal
        visible={showSkipWarningModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSkipWarningModal(false)}
      >
        <View style={styles.warningModalOverlay}>
          <View
            style={[
              styles.warningModalContent,
              {
                backgroundColor: colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
              },
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={40}
              color={colors.primary}
              style={styles.warningIcon}
            />
            <ThemedText style={styles.warningTitle}>
              Incomplete Profile
            </ThemedText>
            <ThemedText style={styles.warningText}>
              It is recommended to complete your profile to get the best workout
              routines personally tailored for you. Moving on without saving
              your profile will give you less accurate workout routines.
            </ThemedText>
            <View style={styles.warningButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.warningButton,
                  styles.warningCancelButton,
                  { borderColor: colors.primary },
                ]}
                onPress={() => setShowSkipWarningModal(false)}
              >
                <ThemedText
                  style={[styles.warningButtonText, { color: colors.primary }]}
                >
                  Complete Profile
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.warningButton,
                  styles.confirmButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleSkipConfirm}
              >
                <ThemedText
                  style={[styles.warningButtonText, { color: "#FFFFFF" }]}
                >
                  Keep Going Anyway
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>
              {isEditing ? "Edit Profile" : "Complete Your Profile"}
            </ThemedText>
            <View style={styles.placeholder} />
          </View>

          <ThemedText style={styles.subtitle}>
            {isEditing
              ? "Update your profile information below"
              : "Please provide some basic information to help us personalize your workout experience"}
          </ThemedText>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Date of Birth</ThemedText>
              <TouchableOpacity
                style={[
                  styles.selectField,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                    borderColor: colorScheme === "dark" ? "#4D4D5D" : "#E5E5E5",
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText
                  style={!dateOfBirth ? styles.placeholderText : undefined}
                >
                  {formatDate(dateOfBirth)}
                </ThemedText>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colorScheme === "dark" ? "#9BA1A6" : "#AAAAAA"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Sex</ThemedText>
              <TouchableOpacity
                style={[
                  styles.selectField,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                    borderColor: colorScheme === "dark" ? "#4D4D5D" : "#E5E5E5",
                  },
                ]}
                onPress={() => setShowSexModal(true)}
              >
                <ThemedText style={!sex ? styles.placeholderText : undefined}>
                  {sex
                    ? SEX_OPTIONS.find((s) => s.value === sex)?.label
                    : "Select Sex"}
                </ThemedText>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colorScheme === "dark" ? "#9BA1A6" : "#AAAAAA"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.label}>Weight</ThemedText>
                <TouchableOpacity
                  style={styles.unitToggle}
                  onPress={toggleWeightUnit}
                >
                  <ThemedText style={styles.unitToggleText}>
                    {weightUnit === "kg" ? "Switch to lb" : "Switch to kg"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                      color: colors.text,
                      borderColor:
                        colorScheme === "dark" ? "#4D4D5D" : "#E5E5E5",
                      flex: 1,
                    },
                  ]}
                  placeholder={`Enter your weight in ${weightUnit}`}
                  placeholderTextColor={
                    colorScheme === "dark" ? "#9BA1A6" : "#AAAAAA"
                  }
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
                <View
                  style={[
                    styles.unitBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <ThemedText style={styles.unitBadgeText}>
                    {weightUnit}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                <ThemedText style={styles.label}>Height</ThemedText>
                <TouchableOpacity
                  style={styles.unitToggle}
                  onPress={toggleHeightUnit}
                >
                  <ThemedText style={styles.unitToggleText}>
                    {heightUnit === "cm" ? "Switch to in" : "Switch to cm"}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                      color: colors.text,
                      borderColor:
                        colorScheme === "dark" ? "#4D4D5D" : "#E5E5E5",
                      flex: 1,
                    },
                  ]}
                  placeholder={`Enter your height in ${heightUnit}`}
                  placeholderTextColor={
                    colorScheme === "dark" ? "#9BA1A6" : "#AAAAAA"
                  }
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                />
                <View
                  style={[
                    styles.unitBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <ThemedText style={styles.unitBadgeText}>
                    {heightUnit}
                  </ThemedText>
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>Fitness Level</ThemedText>
              <TouchableOpacity
                style={[
                  styles.selectField,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                    borderColor: colorScheme === "dark" ? "#4D4D5D" : "#E5E5E5",
                  },
                ]}
                onPress={() => setShowFitnessLevelModal(true)}
              >
                <ThemedText
                  style={!fitnessLevel ? styles.placeholderText : undefined}
                >
                  {fitnessLevel
                    ? FITNESS_LEVELS.find((f) => f.value === fitnessLevel)
                        ?.label
                    : "Select Fitness Level"}
                </ThemedText>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colorScheme === "dark" ? "#9BA1A6" : "#AAAAAA"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>
                Do you have any injuries or limitations?
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.selectField,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                    borderColor: colorScheme === "dark" ? "#4D4D5D" : "#E5E5E5",
                  },
                ]}
                onPress={() => setShowInjuriesModal(true)}
              >
                <ThemedText
                  style={!hasInjuries ? styles.placeholderText : undefined}
                >
                  {hasInjuries
                    ? INJURIES_OPTIONS.find((i) => i.value === hasInjuries)
                        ?.label
                    : "Select Yes or No"}
                </ThemedText>
                <Ionicons
                  name="chevron-down"
                  size={20}
                  color={colorScheme === "dark" ? "#9BA1A6" : "#AAAAAA"}
                />
              </TouchableOpacity>
            </View>

            {hasInjuries === "yes" && (
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>
                  Describe your injuries or limitations
                </ThemedText>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      backgroundColor:
                        colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                      color: colors.text,
                      borderColor:
                        colorScheme === "dark" ? "#4D4D5D" : "#E5E5E5",
                    },
                  ]}
                  placeholder="E.g., knee pain, lower back issues, etc."
                  placeholderTextColor={
                    colorScheme === "dark" ? "#9BA1A6" : "#AAAAAA"
                  }
                  value={injuries}
                  onChangeText={setInjuries}
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Save Profile"
                onPress={handleSave}
                loading={isLoading}
                style={styles.saveButton}
              />

              {isEditing ? (
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  style={styles.cancelButton}
                />
              ) : (
                <TouchableOpacity onPress={handleSkipRequest}>
                  <ThemedText style={styles.skipText}>Skip for now</ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker &&
        (Platform.OS === "ios" ? (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            >
              <View
                style={[
                  styles.modalContent,
                  styles.datePickerModalContent,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#3D3D4D" : "#FFFFFF",
                  },
                ]}
              >
                <View style={styles.datePickerHeader}>
                  <ThemedText style={styles.modalTitle}>
                    Select Date of Birth
                  </ThemedText>
                  <TouchableOpacity
                    style={styles.datePickerConfirmButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <ThemedText
                      style={[
                        styles.datePickerConfirmText,
                        { color: colors.primary },
                      ]}
                    >
                      Confirm
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={dateOfBirth || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  style={styles.datePicker}
                  maximumDate={new Date()} // Prevent future dates
                />
              </View>
            </TouchableOpacity>
          </Modal>
        ) : (
          <DateTimePicker
            value={dateOfBirth || new Date()}
            mode="date"
            display="spinner"
            onChange={onDateChange}
            maximumDate={new Date()} // Prevent future dates
          />
        ))}
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
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
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 30,
    opacity: 0.8,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  unitToggle: {
    padding: 4,
  },
  unitToggleText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "500",
  },
  selectField: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  placeholderText: {
    color: "#AAAAAA",
  },
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  unitBadge: {
    position: "absolute",
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  unitBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 16,
  },
  saveButton: {
    marginBottom: 16,
  },
  cancelButton: {
    marginBottom: 16,
  },
  skipText: {
    textAlign: "center",
    fontSize: 16,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 16,
  },
  warningModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 24,
  },
  warningModalContent: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  warningIcon: {
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  warningText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  warningButtonsContainer: {
    flexDirection: "column",
    width: "100%",
    gap: 12,
  },
  warningButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  warningCancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    borderWidth: 0,
  },
  warningButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  textArea: {
    height: 100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
    borderWidth: 1,
    textAlignVertical: "top",
  },
  datePickerModalContent: {
    paddingBottom: 0, // Remove padding for the date picker
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  datePickerConfirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  datePickerConfirmText: {
    fontSize: 16,
    fontWeight: "600",
  },
  datePicker: {
    width: "100%",
    height: 200, // Adjust height as needed
  },
});

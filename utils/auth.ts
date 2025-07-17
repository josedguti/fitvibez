import { router } from "expo-router";
import { Alert } from "react-native";
import { supabase } from "./supabase";

// Interface for user profile data
export interface UserProfile {
  id: string;
  username: string;
  sex: string;
  date_of_birth?: string;
  weight: number;
  weight_unit: string;
  height: number;
  height_unit: string;
  fitness_level?: string;
  fitness_goals?: string;
  injuries?: string;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

// Interface for workout history
export interface WorkoutHistory {
  id: string;
  user_id: string;
  workout_type: string;
  time_available: string;
  mood: string;
  muscle_focus: string;
  equipment: string;
  workout_data: any; // The full workout response from OpenAI
  completed: boolean;
  rating?: number;
  created_at: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  username: string
) {
  try {
    // Check if username already exists
    const { data: existingUsers } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", username)
      .single();

    if (existingUsers) {
      return { error: { message: "Username already taken" } };
    }

    // Create the new user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      return { error };
    }

    // Profile is automatically created by database trigger
    // No need to manually create profile here
    return { data, error: null };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: { message: "An unexpected error occurred" } };
  }
}

/**
 * Sign in a user with email and password
 */
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { data, error };
  } catch (error) {
    console.error("Login error:", error);
    return { error: { message: "An unexpected error occurred" } };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error("Signout error:", error);
    return { error: { message: "An unexpected error occurred" } };
  }
}

/**
 * Get the current user's profile
 */
export async function getUserProfile() {
  try {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { profile: null, error: { message: "User not authenticated" } };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    return { profile, error };
  } catch (error) {
    console.error("Get profile error:", error);
    return {
      profile: null,
      error: { message: "An unexpected error occurred" },
    };
  }
}

/**
 * Update the user's profile
 */
export async function updateUserProfile(profileData: Partial<UserProfile>) {
  try {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { error: { message: "User not authenticated" } };
    }

    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authData.user.id);

    return { data, error };
  } catch (error) {
    console.error("Update profile error:", error);
    return { error: { message: "An unexpected error occurred" } };
  }
}

/**
 * Save a workout to the user's history
 */
export async function saveWorkout(
  workoutParams: {
    workoutType: string;
    timeAvailable: string;
    mood: string;
    muscleFocus: string;
    equipment: string;
  },
  workoutData: any
) {
  try {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { error: { message: "User not authenticated" } };
    }

    const { data, error } = await supabase.from("workout_history").insert([
      {
        user_id: authData.user.id,
        workout_type: workoutParams.workoutType,
        time_available: workoutParams.timeAvailable,
        mood: workoutParams.mood,
        muscle_focus: workoutParams.muscleFocus,
        equipment: workoutParams.equipment,
        workout_data: workoutData,
        completed: false,
        created_at: new Date().toISOString(),
      },
    ]);

    return { data, error };
  } catch (error) {
    console.error("Save workout error:", error);
    return { error: { message: "An unexpected error occurred" } };
  }
}

/**
 * Get the user's workout history
 */
export async function getWorkoutHistory() {
  try {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { workouts: [], error: { message: "User not authenticated" } };
    }

    const { data: workouts, error } = await supabase
      .from("workout_history")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false });

    return { workouts, error };
  } catch (error) {
    console.error("Get workout history error:", error);
    return { workouts: [], error: { message: "An unexpected error occurred" } };
  }
}

/**
 * Mark a workout as completed
 */
export async function markWorkoutCompleted(workoutId: string, rating?: number) {
  try {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { error: { message: "User not authenticated" } };
    }

    const { data, error } = await supabase
      .from("workout_history")
      .update({
        completed: true,
        rating: rating || null,
      })
      .eq("id", workoutId)
      .eq("user_id", authData.user.id);

    return { data, error };
  } catch (error) {
    console.error("Mark workout completed error:", error);
    return { error: { message: "An unexpected error occurred" } };
  }
}

/**
 * Delete a workout from the user's history
 */
export async function deleteWorkout(workoutId: string) {
  try {
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user) {
      return { error: { message: "User not authenticated" } };
    }

    // First check if the workout exists and belongs to the user
    const { data: workout, error: fetchError } = await supabase
      .from("workout_history")
      .select("id")
      .eq("id", workoutId)
      .eq("user_id", authData.user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching workout:", fetchError);
      return { error: { message: "Could not find workout" } };
    }

    if (!workout) {
      return { error: { message: "Workout not found or access denied" } };
    }

    // Then delete the workout
    const { data, error } = await supabase
      .from("workout_history")
      .delete()
      .eq("id", workoutId)
      .eq("user_id", authData.user.id);

    if (error) {
      console.error("Error deleting workout:", error);
      return { error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Delete workout error:", error);
    return { error: { message: "An unexpected error occurred" } };
  }
}

/**
 * Check if the user is authenticated and redirect if not
 */
export async function requireAuth(showAlert: boolean = true): Promise<boolean> {
  const { data } = await supabase.auth.getSession();

  if (!data.session) {
    if (showAlert) {
      Alert.alert(
        "Authentication Required",
        "Please login or create an account to access this feature.",
        [
          {
            text: "Login",
            onPress: () => router.push("/login"),
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    }
    return false;
  }

  return true;
}

/**
 * Upload profile picture to Supabase storage
 */
export async function uploadProfilePicture(imageUri: string) {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Not authenticated");
    }

    const userId = session.session.user.id;

    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create file name with timestamp to avoid conflicts
    const timestamp = new Date().getTime();
    const fileName = `${userId}/profile-picture-${timestamp}.jpg`;

    // Delete existing profile picture if it exists
    await deleteExistingProfilePicture(userId);

    // Upload new image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("profile-pictures")
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Update profile with new picture URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        profile_picture_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    return { profilePictureUrl: publicUrl, error: null };
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return { profilePictureUrl: null, error: error as Error };
  }
}

/**
 * Delete existing profile picture from storage
 */
async function deleteExistingProfilePicture(userId: string) {
  try {
    // List files in user's folder
    const { data: files, error: listError } = await supabase.storage
      .from("profile-pictures")
      .list(userId);

    if (listError || !files || files.length === 0) {
      return; // No existing files to delete
    }

    // Delete all files in the user's folder
    const filePaths = files.map((file) => `${userId}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from("profile-pictures")
      .remove(filePaths);

    if (deleteError) {
      console.error("Error deleting existing profile pictures:", deleteError);
    }
  } catch (error) {
    console.error("Error in deleteExistingProfilePicture:", error);
  }
}

/**
 * Delete profile picture and update profile
 */
export async function deleteProfilePicture() {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      throw new Error("Not authenticated");
    }

    const userId = session.session.user.id;

    // Delete from storage
    await deleteExistingProfilePicture(userId);

    // Update profile to remove picture URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        profile_picture_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    return { error: null };
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return { error: error as Error };
  }
}

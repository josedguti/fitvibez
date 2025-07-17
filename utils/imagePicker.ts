import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export interface ImagePickerResult {
  uri: string | null;
  cancelled: boolean;
  error?: string;
}

/**
 * Show image picker options (Camera or Gallery)
 */
export async function showImagePickerOptions(): Promise<ImagePickerResult> {
  return new Promise((resolve) => {
    Alert.alert(
      "Select Photo",
      "Choose how you'd like to add your profile picture",
      [
        {
          text: "Camera",
          onPress: () => openCamera().then(resolve),
        },
        {
          text: "Photo Library",
          onPress: () => openImageLibrary().then(resolve),
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve({ uri: null, cancelled: true }),
        },
      ]
    );
  });
}

/**
 * Open camera to take a photo
 */
export async function openCamera(): Promise<ImagePickerResult> {
  try {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (cameraPermission.status !== "granted") {
      return {
        uri: null,
        cancelled: true,
        error: "Camera permission is required to take photos",
      };
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.8,
      base64: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { uri: null, cancelled: true };
    }

    return { uri: result.assets[0].uri, cancelled: false };
  } catch (error) {
    console.error("Error opening camera:", error);
    return {
      uri: null,
      cancelled: true,
      error: "Failed to open camera",
    };
  }
}

/**
 * Open image library to select a photo
 */
export async function openImageLibrary(): Promise<ImagePickerResult> {
  try {
    // Request media library permissions
    const libraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (libraryPermission.status !== "granted") {
      return {
        uri: null,
        cancelled: true,
        error: "Photo library permission is required to select photos",
      };
    }

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile pictures
      quality: 0.8,
      base64: false,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return { uri: null, cancelled: true };
    }

    return { uri: result.assets[0].uri, cancelled: false };
  } catch (error) {
    console.error("Error opening image library:", error);
    return {
      uri: null,
      cancelled: true,
      error: "Failed to open photo library",
    };
  }
}

/**
 * Show delete profile picture confirmation
 */
export async function showDeleteConfirmation(): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      "Delete Profile Picture",
      "Are you sure you want to delete your profile picture?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => resolve(true),
        },
      ]
    );
  });
}

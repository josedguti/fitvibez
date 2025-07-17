import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "./ThemedText";

interface ExerciseVisualProps {
  videoUrl?: string;
  imageUrl?: string;
  exerciseName: string;
}

export function ExerciseVisual({
  videoUrl,
  imageUrl,
  exerciseName,
}: ExerciseVisualProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { width } = Dimensions.get("window");

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Convert YouTube URL to embed URL
  const getEmbedUrl = (url: string): string | null => {
    const videoId = getYouTubeVideoId(url);
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&controls=1`
      : null;
  };

  const handleVideoError = () => {
    setVideoError(true);
    Alert.alert(
      "Video Error",
      "Unable to load the exercise video. Please check your internet connection."
    );
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // If no visual content is available, return null
  if ((!videoUrl || videoError) && (!imageUrl || imageError)) {
    return null;
  }

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerText}>
          Exercise Demonstration
        </ThemedText>
        <View style={styles.toggleContainer}>
          {imageUrl && !imageError && (
            <TouchableOpacity
              style={[
                styles.toggleButton,
                !showVideo && styles.toggleButtonActive,
                { borderColor: colors.primary },
              ]}
              onPress={() => setShowVideo(false)}
            >
              <Ionicons
                name="image-outline"
                size={16}
                color={!showVideo ? "white" : colors.primary}
              />
              <ThemedText
                style={[
                  styles.toggleText,
                  { color: !showVideo ? "white" : colors.primary },
                ]}
              >
                Image
              </ThemedText>
            </TouchableOpacity>
          )}
          {embedUrl && !videoError && (
            <TouchableOpacity
              style={[
                styles.toggleButton,
                showVideo && styles.toggleButtonActive,
                { borderColor: colors.primary },
              ]}
              onPress={() => setShowVideo(true)}
            >
              <Ionicons
                name="play-outline"
                size={16}
                color={showVideo ? "white" : colors.primary}
              />
              <ThemedText
                style={[
                  styles.toggleText,
                  { color: showVideo ? "white" : colors.primary },
                ]}
              >
                Video
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View
        style={[
          styles.visualContainer,
          {
            backgroundColor:
              colorScheme === "dark" ? "#3D3D4D" : "rgba(255, 255, 255, 0.9)",
          },
        ]}
      >
        {showVideo && embedUrl && !videoError ? (
          <WebView
            source={{ uri: embedUrl }}
            style={[styles.video, { width: width - 80 }]}
            onError={handleVideoError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
          />
        ) : imageUrl && !imageError ? (
          <Image
            source={{ uri: imageUrl }}
            style={[styles.image, { width: width - 80 }]}
            contentFit="contain"
            onError={handleImageError}
            placeholder="Loading exercise image..."
          />
        ) : (
          <View style={styles.fallbackContainer}>
            <Ionicons
              name="fitness-outline"
              size={48}
              color={colors.primary}
              style={{ opacity: 0.5 }}
            />
            <ThemedText style={styles.fallbackText}>
              Visual guide not available
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  toggleButtonActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "500",
  },
  visualContainer: {
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    padding: 8,
  },
  video: {
    height: 200,
    borderRadius: 8,
  },
  image: {
    height: 200,
    borderRadius: 8,
  },
  fallbackContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  fallbackText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
});

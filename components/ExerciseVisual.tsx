import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Dimensions, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "./ThemedText";

interface ExerciseVisualProps {
  videoUrl?: string;
  exerciseName: string;
}

export function ExerciseVisual({
  videoUrl,
  exerciseName,
}: ExerciseVisualProps) {
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

  // If no video is available or there's an error, return null
  if (!videoUrl || videoError) {
    return null;
  }

  const embedUrl = getEmbedUrl(videoUrl);

  if (!embedUrl) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <ThemedText style={styles.headerText}>
          Exercise Demonstration
        </ThemedText>
        <View style={styles.videoIconContainer}>
          <Ionicons
            name="play-circle-outline"
            size={20}
            color={colors.primary}
          />
          <ThemedText style={[styles.videoLabel, { color: colors.primary }]}>
            Video
          </ThemedText>
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
  videoIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  videoLabel: {
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
});

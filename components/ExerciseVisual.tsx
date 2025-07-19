import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
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
  const [showFallback, setShowFallback] = useState(!videoUrl);
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
    setShowFallback(true);
  };

  const renderFallbackContent = () => (
    <View
      style={[
        styles.fallbackContainer,
        {
          backgroundColor:
            colorScheme === "dark" ? "#3D3D4D" : "rgba(255, 255, 255, 0.9)",
        },
      ]}
    >
      <View style={styles.fallbackIconContainer}>
        <Ionicons
          name="videocam-outline"
          size={48}
          color={colors.text}
          style={styles.fallbackIcon}
        />
      </View>

      <ThemedText style={styles.fallbackTitle}>
        Video Demo Unavailable
      </ThemedText>
      <ThemedText style={styles.fallbackSubtitle}>
        Follow the written instructions above for proper form
      </ThemedText>
    </View>
  );

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;

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
        {showFallback || videoError || !embedUrl ? (
          renderFallbackContent()
        ) : (
          <WebView
            source={{ uri: embedUrl }}
            style={[styles.video, { width: width - 80 }]}
            onError={handleVideoError}
            onHttpError={handleVideoError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
          />
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
  fallbackContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
  },
  fallbackIconContainer: {
    marginBottom: 15,
  },
  fallbackIcon: {
    opacity: 0.6,
  },
  fallbackTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  fallbackSubtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});

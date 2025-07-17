import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedText } from "./ThemedText";

const MOTIVATIONAL_QUOTES = [
  "💪 Just 10 minutes of exercise can boost your mood for hours!",
  "🌟 Every workout, no matter how short, is a victory!",
  "⚡ 10 minutes today is better than 60 minutes tomorrow.",
  "❤️ Your heart loves you for every minute you move!",
  "🔥 Small steps lead to big transformations.",
  "🎯 10 minutes of movement = 100% commitment to yourself.",
  "✨ You're not just building muscle, you're building confidence!",
  "🌱 Every workout plants a seed of strength.",
  "🏆 The best time to workout was yesterday. The second best time is now!",
  "💎 You're crafting the strongest version of yourself.",
  "🚀 10 minutes can change your entire day's energy!",
  "🌈 Exercise is the best stress reliever money can't buy.",
  "⭐ Your future self will thank you for these 10 minutes.",
  "🎪 Making fitness fun, one workout at a time!",
  "🌸 Bloom where you are planted - even if it's your living room!",
  "💫 Strong women lift each other up... and weights too!",
  "🎨 You're painting your masterpiece, one rep at a time.",
  "🦋 Transform like a butterfly - beautifully and at your own pace.",
];

interface MotivationalCarouselProps {
  isVisible: boolean;
}

export function MotivationalCarousel({ isVisible }: MotivationalCarouselProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change quote
        setCurrentQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);

        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000); // Change quote every 3 seconds

    return () => clearInterval(interval);
  }, [isVisible, fadeAnim]);

  useEffect(() => {
    if (isVisible) {
      // Reset animation when component becomes visible
      fadeAnim.setValue(1);
      setCurrentQuoteIndex(0);
    }
  }, [isVisible, fadeAnim]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.carouselContainer,
          {
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(255, 107, 107, 0.1)"
                : "rgba(255, 107, 107, 0.05)",
            borderColor: colors.primary,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name="heart"
            size={24}
            color={colors.primary}
            style={styles.heartIcon}
          />
        </View>

        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <ThemedText style={[styles.motivationalText, { color: colors.text }]}>
            {MOTIVATIONAL_QUOTES[currentQuoteIndex]}
          </ThemedText>
        </Animated.View>

        <View style={styles.indicatorContainer}>
          {MOTIVATIONAL_QUOTES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    index === currentQuoteIndex
                      ? colors.primary
                      : `${colors.primary}40`,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.loadingContainer}>
        <View style={styles.loadingDots}>
          <LoadingDot delay={0} colors={colors} />
          <LoadingDot delay={200} colors={colors} />
          <LoadingDot delay={400} colors={colors} />
        </View>
        <ThemedText style={[styles.loadingText, { color: colors.text }]}>
          Crafting your perfect workout...
        </ThemedText>
      </View>
    </View>
  );
}

// Animated loading dot component
function LoadingDot({ delay, colors }: { delay: number; colors: any }) {
  const [scaleAnim] = useState(new Animated.Value(0.3));

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    const timeout = setTimeout(animate, delay);
    return () => clearTimeout(timeout);
  }, [scaleAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: colors.primary,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  carouselContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    marginBottom: 40,
    minHeight: 140,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    marginBottom: 16,
  },
  heartIcon: {
    textAlign: "center",
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
    marginBottom: 16,
  },
  motivationalText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  indicatorContainer: {
    flexDirection: "row",
    gap: 4,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  loadingContainer: {
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
});

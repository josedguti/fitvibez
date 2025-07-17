import { Stack } from "expo-router";
import React from "react";

export default function WorkoutBuilderLayout() {
  return (
    <Stack>
      <Stack.Screen name="workout-type" options={{ headerShown: false }} />
      <Stack.Screen name="time-available" options={{ headerShown: false }} />
      <Stack.Screen name="mood" options={{ headerShown: false }} />
      <Stack.Screen name="muscle-focus" options={{ headerShown: false }} />
      <Stack.Screen name="equipment" options={{ headerShown: false }} />
      <Stack.Screen name="generate" options={{ headerShown: false }} />
      <Stack.Screen name="preview" options={{ headerShown: false }} />
    </Stack>
  );
}

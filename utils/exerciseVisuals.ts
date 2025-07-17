/**
 * Utility functions for finding exercise videos
 * This provides fallback video content when OpenAI doesn't include them
 */

// Common exercise video mappings
const EXERCISE_VIDEO_DATABASE: Record<string, string> = {
  // Strength exercises
  "push-up": "https://www.youtube.com/watch?v=IODxDxX7oi4",
  pushup: "https://www.youtube.com/watch?v=IODxDxX7oi4",
  "push up": "https://www.youtube.com/watch?v=IODxDxX7oi4",
  squat: "https://www.youtube.com/watch?v=aclHkVaku9U",
  squats: "https://www.youtube.com/watch?v=aclHkVaku9U",
  plank: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
  lunge: "https://www.youtube.com/watch?v=3XDriUn0udo",
  lunges: "https://www.youtube.com/watch?v=3XDriUn0udo",
  burpee: "https://www.youtube.com/watch?v=818SkLY1KoA",
  burpees: "https://www.youtube.com/watch?v=818SkLY1KoA",
  deadlift: "https://www.youtube.com/watch?v=VytU5OSPUJM",
  deadlifts: "https://www.youtube.com/watch?v=VytU5OSPUJM",
  "bicep curl": "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
  "bicep curls": "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
  "tricep dip": "https://www.youtube.com/watch?v=0326dy_-CzM",
  "tricep dips": "https://www.youtube.com/watch?v=0326dy_-CzM",
  "mountain climber": "https://www.youtube.com/watch?v=nmwgirgXLYM",
  "mountain climbers": "https://www.youtube.com/watch?v=nmwgirgXLYM",
  "jumping jack": "https://www.youtube.com/watch?v=iSSAk4XCsRA",
  "jumping jacks": "https://www.youtube.com/watch?v=iSSAk4XCsRA",

  // Core exercises
  "sit-up": "https://www.youtube.com/watch?v=1fbU_MkV7NE",
  "sit up": "https://www.youtube.com/watch?v=1fbU_MkV7NE",
  situp: "https://www.youtube.com/watch?v=1fbU_MkV7NE",
  crunch: "https://www.youtube.com/watch?v=Xyd_fa5zoEU",
  crunches: "https://www.youtube.com/watch?v=Xyd_fa5zoEU",
  "russian twist": "https://www.youtube.com/watch?v=wkD8rjkodUI",
  "russian twists": "https://www.youtube.com/watch?v=wkD8rjkodUI",

  // Cardio exercises
  "high knees": "https://www.youtube.com/watch?v=8ophJzCdKmw",
  "butt kicks": "https://www.youtube.com/watch?v=5MgAjJwFnuk",
  "jumping lunge": "https://www.youtube.com/watch?v=rvqV3Vgqiyc",
  "jumping lunges": "https://www.youtube.com/watch?v=rvqV3Vgqiyc",

  // Yoga/Flexibility
  "downward dog": "https://www.youtube.com/watch?v=M_8HBQRzA2k",
  "child pose": "https://www.youtube.com/watch?v=2CWw0qHjPJY",
  "child's pose": "https://www.youtube.com/watch?v=2CWw0qHjPJY",
  "warrior pose": "https://www.youtube.com/watch?v=_VoX6QfTgHM",
  "tree pose": "https://www.youtube.com/watch?v=YgJbLQQ3yII",
};

/**
 * Find a suitable video URL for an exercise based on the exercise name
 */
export function findExerciseVideo(exerciseName: string): string | null {
  const normalizedName = exerciseName.toLowerCase().trim();

  // Try exact match first
  if (EXERCISE_VIDEO_DATABASE[normalizedName]) {
    return EXERCISE_VIDEO_DATABASE[normalizedName];
  }

  // Try partial matches
  for (const [key, video] of Object.entries(EXERCISE_VIDEO_DATABASE)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return video;
    }
  }

  return null;
}

/**
 * Enhance exercise data with video elements if they're missing
 */
export function enhanceExerciseWithVisuals(exercise: {
  name: string;
  videoUrl?: string;
  [key: string]: any;
}) {
  return {
    ...exercise,
    videoUrl: exercise.videoUrl || findExerciseVideo(exercise.name),
  };
}

/**
 * Enhance a full workout with video elements for all exercises
 */
export function enhanceWorkoutWithVisuals(workout: {
  exercises: Array<{
    name: string;
    videoUrl?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}) {
  return {
    ...workout,
    exercises: workout.exercises.map(enhanceExerciseWithVisuals),
  };
}

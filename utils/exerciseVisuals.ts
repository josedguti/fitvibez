/**
 * Utility functions for finding exercise videos and images
 * This provides fallback visual content when OpenAI doesn't include them
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

// Common exercise image mappings
const EXERCISE_IMAGE_DATABASE: Record<string, string> = {
  "push-up":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
  pushup: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
  "push up":
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
  squat: "https://images.unsplash.com/photo-1580086319619-3ed498161c77?w=500",
  squats: "https://images.unsplash.com/photo-1580086319619-3ed498161c77?w=500",
  plank: "https://images.unsplash.com/photo-1549476464-37392f717541?w=500",
  lunge: "https://images.unsplash.com/photo-1544033527-78c7e8b4b4b7?w=500",
  lunges: "https://images.unsplash.com/photo-1544033527-78c7e8b4b4b7?w=500",
  burpee: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
  burpees: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
  deadlift:
    "https://images.unsplash.com/photo-1583454155480-14fa2323bb0a?w=500",
  deadlifts:
    "https://images.unsplash.com/photo-1583454155480-14fa2323bb0a?w=500",
  "mountain climber":
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
  "mountain climbers":
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500",
  "jumping jack":
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500",
  "jumping jacks":
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500",
  yoga: "https://images.unsplash.com/photo-1506629905270-11674df5d102?w=500",
  stretching:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500",
  dumbbell:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
  workout: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500",
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
 * Find a suitable image URL for an exercise based on the exercise name
 */
export function findExerciseImage(exerciseName: string): string | null {
  const normalizedName = exerciseName.toLowerCase().trim();

  // Try exact match first
  if (EXERCISE_IMAGE_DATABASE[normalizedName]) {
    return EXERCISE_IMAGE_DATABASE[normalizedName];
  }

  // Try partial matches
  for (const [key, image] of Object.entries(EXERCISE_IMAGE_DATABASE)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return image;
    }
  }

  // Fallback to a generic workout image
  return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500";
}

/**
 * Enhance exercise data with visual elements if they're missing
 */
export function enhanceExerciseWithVisuals(exercise: {
  name: string;
  videoUrl?: string;
  imageUrl?: string;
  [key: string]: any;
}) {
  return {
    ...exercise,
    videoUrl: exercise.videoUrl || findExerciseVideo(exercise.name),
    imageUrl: exercise.imageUrl || findExerciseImage(exercise.name),
  };
}

/**
 * Enhance a full workout with visual elements for all exercises
 */
export function enhanceWorkoutWithVisuals(workout: {
  exercises: Array<{
    name: string;
    videoUrl?: string;
    imageUrl?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}) {
  return {
    ...workout,
    exercises: workout.exercises.map(enhanceExerciseWithVisuals),
  };
}

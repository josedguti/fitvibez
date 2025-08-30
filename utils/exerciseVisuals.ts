/**
 * Utility functions for finding exercise videos
 * This provides fallback video content when OpenAI doesn't include them
 */

// Common exercise video mappings
const EXERCISE_VIDEO_DATABASE: Record<string, string> = {
  // Strength exercises - Upper Body
  "push-up": "https://www.youtube.com/watch?v=IODxDxX7oi4",
  pushup: "https://www.youtube.com/watch?v=IODxDxX7oi4",
  "push up": "https://www.youtube.com/watch?v=IODxDxX7oi4",
  "incline push-up": "https://www.youtube.com/watch?v=cfaBkjnZRwU",
  "decline push-up": "https://www.youtube.com/watch?v=SKPab2YC8BE",
  "wide push-up": "https://www.youtube.com/watch?v=rr6U6XPYKyQ",
  "diamond push-up": "https://www.youtube.com/watch?v=J0DnG1_S92I",
  
  "pull-up": "https://www.youtube.com/watch?v=eGo4IYlbE5g",
  "pull up": "https://www.youtube.com/watch?v=eGo4IYlbE5g",
  pullup: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
  "chin-up": "https://www.youtube.com/watch?v=brhRXlOhkAM",
  "chin up": "https://www.youtube.com/watch?v=brhRXlOhkAM",
  
  "bicep curl": "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
  "bicep curls": "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
  "dumbbell curl": "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
  "hammer curl": "https://www.youtube.com/watch?v=zC3nLlEvin4",
  "hammer curls": "https://www.youtube.com/watch?v=zC3nLlEvin4",
  
  "tricep dip": "https://www.youtube.com/watch?v=0326dy_-CzM",
  "tricep dips": "https://www.youtube.com/watch?v=0326dy_-CzM",
  "tricep extension": "https://www.youtube.com/watch?v=nRiJVZDpdL0",
  "tricep press": "https://www.youtube.com/watch?v=nRiJVZDpdL0",
  
  "shoulder press": "https://www.youtube.com/watch?v=qEwKCR5JCog",
  "overhead press": "https://www.youtube.com/watch?v=qEwKCR5JCog",
  "military press": "https://www.youtube.com/watch?v=qEwKCR5JCog",
  "lateral raise": "https://www.youtube.com/watch?v=3VcKaas9EeI",
  "side raise": "https://www.youtube.com/watch?v=3VcKaas9EeI",
  
  // Strength exercises - Lower Body
  squat: "https://www.youtube.com/watch?v=aclHkVaku9U",
  squats: "https://www.youtube.com/watch?v=aclHkVaku9U",
  "bodyweight squat": "https://www.youtube.com/watch?v=aclHkVaku9U",
  "goblet squat": "https://www.youtube.com/watch?v=MeIiIdhvXT4",
  "jump squat": "https://www.youtube.com/watch?v=A-cFYWvaHr0",
  "jump squats": "https://www.youtube.com/watch?v=A-cFYWvaHr0",
  
  lunge: "https://www.youtube.com/watch?v=3XDriUn0udo",
  lunges: "https://www.youtube.com/watch?v=3XDriUn0udo",
  "forward lunge": "https://www.youtube.com/watch?v=3XDriUn0udo",
  "reverse lunge": "https://www.youtube.com/watch?v=xBTkHqXz0UE",
  "side lunge": "https://www.youtube.com/watch?v=8BtKPxBnpZ8",
  "lateral lunge": "https://www.youtube.com/watch?v=8BtKPxBnpZ8",
  "jumping lunge": "https://www.youtube.com/watch?v=rvqV3Vgqiyc",
  "jumping lunges": "https://www.youtube.com/watch?v=rvqV3Vgqiyc",
  
  deadlift: "https://www.youtube.com/watch?v=VytU5OSPUJM",
  deadlifts: "https://www.youtube.com/watch?v=VytU5OSPUJM",
  "romanian deadlift": "https://www.youtube.com/watch?v=jEy_czb3RKA",
  "single leg deadlift": "https://www.youtube.com/watch?v=2FbBWyE8BmY",
  
  "calf raise": "https://www.youtube.com/watch?v=gwWv7aPcGBU",
  "calf raises": "https://www.youtube.com/watch?v=gwWv7aPcGBU",
  "wall sit": "https://www.youtube.com/watch?v=y-wV4Venusw",
  "glute bridge": "https://www.youtube.com/watch?v=OUgsJ8-Vi0E",
  "hip bridge": "https://www.youtube.com/watch?v=OUgsJ8-Vi0E",
  
  // Core exercises
  plank: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
  "side plank": "https://www.youtube.com/watch?v=K2VljzCC16g",
  "plank up": "https://www.youtube.com/watch?v=L4oFJRDAU4Q",
  "plank to push-up": "https://www.youtube.com/watch?v=L4oFJRDAU4Q",
  
  "sit-up": "https://www.youtube.com/watch?v=1fbU_MkV7NE",
  "sit up": "https://www.youtube.com/watch?v=1fbU_MkV7NE",
  situp: "https://www.youtube.com/watch?v=1fbU_MkV7NE",
  crunch: "https://www.youtube.com/watch?v=Xyd_fa5zoEU",
  crunches: "https://www.youtube.com/watch?v=Xyd_fa5zoEU",
  "bicycle crunch": "https://www.youtube.com/watch?v=9FGilxCbdz8",
  "bicycle crunches": "https://www.youtube.com/watch?v=9FGilxCbdz8",
  
  "russian twist": "https://www.youtube.com/watch?v=wkD8rjkodUI",
  "russian twists": "https://www.youtube.com/watch?v=wkD8rjkodUI",
  "dead bug": "https://www.youtube.com/watch?v=g_BYB0R-4Ws",
  "leg raise": "https://www.youtube.com/watch?v=l4kQd9eWclE",
  "leg raises": "https://www.youtube.com/watch?v=l4kQd9eWclE",
  
  "mountain climber": "https://www.youtube.com/watch?v=nmwgirgXLYM",
  "mountain climbers": "https://www.youtube.com/watch?v=nmwgirgXLYM",

  // Full Body/Compound exercises
  burpee: "https://www.youtube.com/watch?v=818SkLY1KoA",
  burpees: "https://www.youtube.com/watch?v=818SkLY1KoA",
  "thruster": "https://www.youtube.com/watch?v=L219ltL15zk",
  "turkish get-up": "https://www.youtube.com/watch?v=0bWRPC49-KI",
  "clean and press": "https://www.youtube.com/watch?v=KwYJTpQ_x5A",

  // Cardio exercises
  "jumping jack": "https://www.youtube.com/watch?v=iSSAk4XCsRA",
  "jumping jacks": "https://www.youtube.com/watch?v=iSSAk4XCsRA",
  "high knees": "https://www.youtube.com/watch?v=8ophJzCdKmw",
  "butt kicks": "https://www.youtube.com/watch?v=5MgAjJwFnuk",
  "butt kickers": "https://www.youtube.com/watch?v=5MgAjJwFnuk",
  "star jump": "https://www.youtube.com/watch?v=UpH7rm0cYbM",
  "star jumps": "https://www.youtube.com/watch?v=UpH7rm0cYbM",
  
  // HIIT exercises
  "squat thrust": "https://www.youtube.com/watch?v=wzWsVZ7C5J0",
  "squat thrusts": "https://www.youtube.com/watch?v=wzWsVZ7C5J0",
  "tuck jump": "https://www.youtube.com/watch?v=Uw3KvKl4BvQ",
  "tuck jumps": "https://www.youtube.com/watch?v=Uw3KvKl4BvQ",
  "broad jump": "https://www.youtube.com/watch?v=Y-wdXIMcQ5U",
  "box jump": "https://www.youtube.com/watch?v=NBY9-kTuHEk",

  // Yoga/Flexibility/Mobility
  "downward dog": "https://www.youtube.com/watch?v=M_8HBQRzA2k",
  "downward facing dog": "https://www.youtube.com/watch?v=M_8HBQRzA2k",
  "child pose": "https://www.youtube.com/watch?v=2CWw0qHjPJY",
  "child's pose": "https://www.youtube.com/watch?v=2CWw0qHjPJY",
  "warrior pose": "https://www.youtube.com/watch?v=_VoX6QfTgHM",
  "warrior I": "https://www.youtube.com/watch?v=_VoX6QfTgHM",
  "warrior 1": "https://www.youtube.com/watch?v=_VoX6QfTgHM",
  "tree pose": "https://www.youtube.com/watch?v=YgJbLQQ3yII",
  "cat cow": "https://www.youtube.com/watch?v=kqnua4rHVVA",
  "cat-cow": "https://www.youtube.com/watch?v=kqnua4rHVVA",
  "cobra pose": "https://www.youtube.com/watch?v=JDcdhTuycOI",
  "pigeon pose": "https://www.youtube.com/watch?v=0_zPqA65Nok",
  
  // Stretching
  "hip flexor stretch": "https://www.youtube.com/watch?v=UGEpQ1BRx-4",
  "hamstring stretch": "https://www.youtube.com/watch?v=oyWZRJJWjsM",
  "quad stretch": "https://www.youtube.com/watch?v=5GSrdOnyx7M",
  "shoulder stretch": "https://www.youtube.com/watch?v=bQd0JaPGM6w",
  "calf stretch": "https://www.youtube.com/watch?v=A-cFYWvaHr0",
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

  // Remove common modifiers and try again
  const cleanedName = normalizedName
    .replace(/\b(dumbbell|barbell|kettlebell|bodyweight)\b/g, '') // Remove equipment modifiers
    .replace(/\b(single|double|alternating|seated|standing)\b/g, '') // Remove position modifiers
    .replace(/\b(slow|fast|explosive|controlled)\b/g, '') // Remove tempo modifiers
    .replace(/\b(beginner|intermediate|advanced)\b/g, '') // Remove difficulty modifiers
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  if (EXERCISE_VIDEO_DATABASE[cleanedName]) {
    return EXERCISE_VIDEO_DATABASE[cleanedName];
  }

  // Try partial matches with the original name
  for (const [key, video] of Object.entries(EXERCISE_VIDEO_DATABASE)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return video;
    }
  }

  // Try partial matches with the cleaned name
  for (const [key, video] of Object.entries(EXERCISE_VIDEO_DATABASE)) {
    if (cleanedName.includes(key) || key.includes(cleanedName)) {
      return video;
    }
  }

  // Try word-by-word matching for compound exercises
  const nameWords = normalizedName.split(/\s+/);
  for (const [key, video] of Object.entries(EXERCISE_VIDEO_DATABASE)) {
    const keyWords = key.split(/\s+/);
    const matchingWords = nameWords.filter(word => 
      keyWords.some(keyWord => word.includes(keyWord) || keyWord.includes(word))
    );
    
    // If more than half the words match, consider it a match
    if (matchingWords.length > Math.max(1, Math.floor(keyWords.length / 2))) {
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

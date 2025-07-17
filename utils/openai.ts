import OpenAI from "openai";
import { enhanceWorkoutWithVisuals } from "./exerciseVisuals";
import { supabase } from "./supabase";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPEN_AI_API_KEY,
});

// Define workout generation parameters interface
export interface WorkoutParams {
  workoutType: string;
  timeAvailable: string;
  mood: string;
  muscleFocus: string;
  equipment: string;
}

// Define workout response interface
export interface WorkoutResponse {
  title: string;
  description: string;
  exercises: {
    name: string;
    sets?: number;
    reps?: string;
    duration?: string;
    restBetweenSets?: string;
    instructions: string;
    // Video element for exercise demonstration
    videoUrl?: string; // YouTube video URL for exercise demonstration
  }[];
  warmup?: string;
  cooldown?: string;
  totalTime: string;
  difficulty: string;
}

/**
 * Generates a workout plan using OpenAI based on user preferences and profile
 */
export async function generateWorkout(
  params: WorkoutParams
): Promise<WorkoutResponse> {
  try {
    // Get user profile data from Supabase if user is authenticated
    let userProfileData = null;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      userProfileData = profile;
    }

    // Build the prompt based on workout parameters and user profile
    const prompt = buildWorkoutPrompt(params, userProfileData);

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "o4-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional fitness coach specialized in creating personalized workout routines. Provide detailed, safe, and effective workout plans based on the user's preferences and profile information. Format your response as structured JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the workout plan
    const workoutPlan = JSON.parse(
      response.choices[0].message.content || "{}"
    ) as WorkoutResponse;

    // Enhance with visual elements if they're missing
    const enhancedWorkout = enhanceWorkoutWithVisuals(
      workoutPlan
    ) as WorkoutResponse;

    return enhancedWorkout;
  } catch (error) {
    console.error("Error generating workout:", error);
    throw new Error("Failed to generate workout plan");
  }
}

/**
 * Builds a detailed prompt for OpenAI based on workout parameters and user profile
 */
function buildWorkoutPrompt(params: WorkoutParams, userProfile: any): string {
  const { workoutType, timeAvailable, mood, muscleFocus, equipment } = params;

  // Convert time available to minutes for clearer instructions
  const timeRangeMap: Record<string, string> = {
    "10-15": "10-15 minutes",
    "15-25": "15-25 minutes",
    "25-40": "25-40 minutes",
    "40-60": "40-60 minutes",
    "60-90": "60-90 minutes",
    "120": "120 minutes (2 hours)",
  };

  const timeRange = timeRangeMap[timeAvailable] || timeAvailable;

  // Parse equipment list
  const equipmentList = equipment.split(",");
  const equipmentString =
    equipmentList.length === 1
      ? equipmentList[0]
      : equipmentList
          .map((item, index) => {
            if (index === equipmentList.length - 1) {
              return `and ${item}`;
            }
            return item;
          })
          .join(", ");

  // Base prompt with workout parameters
  let prompt = `Create a detailed ${workoutType} workout plan that:
- Takes approximately ${timeRange} to complete
- Focuses on the ${muscleFocus} muscle group(s)
- Uses the following equipment: ${equipmentString}
- Is suitable for someone who is feeling ${mood}
`;

  // Add user profile information if available
  if (userProfile) {
    prompt += `\nAdditional information about the user:`;

    if (userProfile.fitness_level) {
      prompt += `\n- Fitness level: ${userProfile.fitness_level}`;
    }

    if (userProfile.age) {
      prompt += `\n- Age: ${userProfile.age}`;
    }

    if (userProfile.weight) {
      prompt += `\n- Weight: ${userProfile.weight} ${
        userProfile.weight_unit || "kg"
      }`;
    }

    if (userProfile.height) {
      prompt += `\n- Height: ${userProfile.height} ${
        userProfile.height_unit || "cm"
      }`;
    }

    if (userProfile.fitness_goals) {
      prompt += `\n- Fitness goals: ${userProfile.fitness_goals}`;
    }

    if (userProfile.injuries) {
      prompt += `\n- Injuries or limitations to consider: ${userProfile.injuries}`;
    }
  }

  // Instructions for response format
  prompt += `\n\nPlease provide a complete workout plan in JSON format with the following structure:
{
  "title": "Catchy title for the workout",
  "description": "Brief description of the workout and its benefits",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": number of sets (if applicable),
      "reps": "number or range of repetitions" (if applicable),
      "duration": "time duration" (if applicable for timed exercises),
      "restBetweenSets": "rest time between sets",
      "instructions": "detailed instructions on how to perform the exercise correctly",
      "videoUrl": "a relevant YouTube video URL demonstrating proper form for this exercise (must be a valid YouTube URL)"
    }
  ],
  "warmup": "brief warmup routine description",
  "cooldown": "brief cooldown routine description",
  "totalTime": "estimated total time",
  "difficulty": "beginner/intermediate/advanced"
}

IMPORTANT: For each exercise, please include both a videoUrl (YouTube video) and imageUrl that demonstrate proper form and technique. Use well-known fitness YouTube channels and reputable fitness image sources. The visual elements are crucial for user safety and proper exercise execution.`;

  return prompt;
}

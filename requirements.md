# FitGirly

FitGirly is a cross-platform mobile application designed to empower women to stay fit by delivering personalized, AI-powered workout routines tailored to their mood, available time, fitness goals, and preferred workout type (e.g., cardio, strength, or full-body).

🎯 Vision
Today’s women lead busy lives but still want to look good, feel strong, and stay healthy. FitGirly provides efficient, custom-tailored workouts that fit into their lifestyle — whether they have 10 minutes or an hour, whether they’re feeling energetic or tired, and whether they want to focus on cardio, weights, or both.

🚀 MVP Goals
The MVP of FitGirly includes the following core functionality:

✅ Key Features
User Authentication (via Supabase)

Profile Setup with fitness preferences (this will be asked on the first run of the app, of course after the is logged in and theres a nice presentation of the app):

Mood (e.g., energetic, tired, motivated)

Available Time

Workout Type (cardio, strength, both)

Muscle Focus (specific muscle group or full-body)

Available Equipment (e.g., dumbbells, kettlebells, full gym, etc.)

AI-Powered Workout Generator

Uses OpenAI API to generate a personalized routine based on profile variables

Workout Routine Display

Clear, styled presentation of exercises with reps, duration, and rest periods

After the workout is generated, the user can review it and decision if they want to do it or not. If they want to do it, they can click a button to start the workout and save the workout to their history.

Workout History (Ability to delete workouts from history)

Basic storage of past routines for progress tracking

Responsive UI

Trendy and feminine visual design using Tailwind CSS for React Native

🛠️ Tech Stack
Tech Description
Expo (React Native) Cross-platform app development (iOS + Android; web later)
Tailwind CSS Consistent, trendy styling via NativeWind
Supabase Backend (auth + real-time Postgres database)
OpenAI API AI-generated workout recommendations
Cursor AI AI-assisted development and debugging

🧠 AI Integration Logic
AI receives the following parameters:

mood: tired / energetic / etc.

time_available: e.g., 10 min, 30 min

goal: cardio, strength, both

focus_area: e.g., abs, legs, full-body

Prompt sent to OpenAI with structured formatting

Response returned as a JSON object with:

Exercise name

Reps/Duration

Equipment needed (if any)

Rest time

Optional: embedded motivation quotes

✨ UI/UX Design Goals
Trendy and inclusive visual theme for all ages

Feminine yet modern colors (e.g., coral, lavender, rose gold, soft pastels)

Animated transitions and clean layout for engaging experience

Accessibility for all screen sizes

📈 Future Features (Post-MVP)
Web version of the app (via Expo Web)

Community feed / challenges

Video tutorials and form demos

Push notifications (reminders + motivational)

Streaks and rewards

Integration with wearable devices (Apple Watch, Fitbit)

Voice-guided workouts

📂 Folder Structure

/fitgirly
├── /app
├── /assets
├── /components
├── /constants
├── /hooks
├── /lib
│ └── supabase.ts (this is the file that contains the supabase client)
│ └── utils.ts (this is the file that contains the utils for the app)
├── /scripts
├── /services
│ └── openai.ts (this is the file that contains the openai client)
├── tailwind.config.js
├── app.config.ts
├── README.md
└── ...

🔐 Supabase Schema Overview
Tables:

users: user_id, email, preferences (mood, time, goal, etc.)

workouts: workout_id, user_id, ai_prompt, ai_response, timestamp

exercises: optional static data for reference

🧪 Testing & Dev Notes
Use Expo Go for mobile testing

Test AI prompt/response formatting before integrating UI

Secure API keys using .env and Supabase secrets

Monitor API usage (OpenAI cost control)

🧠 AI Prompt Sample (for Reference)

{
"mood": "tired",
"time_available": "20 minutes",
"goal": "strength",
"focus_area": "legs"
}

Prompt sent to OpenAI:

“Generate a 20-minute strength training routine for a tired woman focusing on legs. Keep it simple but effective. Use no equipment. Include 5-6 exercises with brief rest periods and motivational tone.”

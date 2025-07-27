# FitVibez - Personalized Workout App

A mobile application that generates personalized workout routines based on user preferences using OpenAI's API. Built with Expo and React Native.

## Features

- User authentication with Supabase
- User profile management (sex, age, weight, height)
- Personalized workout generation based on:
  - Workout type (strength, cardio, HIIT, etc.)
  - Available time
  - Current mood
  - Muscle focus
  - Available equipment
- Workout history tracking
- Dark/light mode support

## Setup

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd fitvibez
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   Copy the `.env.template` file to `.env` and fill in the required values:

   ```bash
   cp .env.template .env
   ```

   You'll need:

   - An OpenAI API key
   - Supabase URL and anon key

4. Set up Supabase

   - Create a new Supabase project
   - Run the SQL in `supabase-schema.sql` in the SQL editor
   - Configure authentication providers in Supabase dashboard
   - Enable email authentication

5. Start the app

   ```bash
   npx expo start
   ```

## Database Schema

### Profiles Table

Stores user profile information:

- id (UUID, primary key)
- username (text)
- sex (text)
- age_group (text)
- weight (numeric)
- weight_unit (text)
- height (numeric)
- height_unit (text)
- fitness_level (text)
- fitness_goals (text)
- injuries (text)
- created_at (timestamp)
- updated_at (timestamp)

### Workout History Table

Stores user workout history:

- id (UUID, primary key)
- user_id (UUID, foreign key)
- workout_type (text)
- time_available (text)
- mood (text)
- muscle_focus (text)
- equipment (text)
- workout_data (jsonb)
- completed (boolean)
- rating (integer)
- created_at (timestamp)

## Technologies Used

- [Expo](https://expo.dev/) - React Native framework
- [Expo Router](https://docs.expo.dev/router/introduction/) - File-based routing
- [Supabase](https://supabase.com/) - Backend as a Service (Auth, Database)
- [OpenAI API](https://platform.openai.com/) - AI workout generation
- [React Native](https://reactnative.dev/) - Mobile app framework

## Development

To run the app in development mode:

```bash
npx expo start
```

## License

This project is licensed under the MIT License.

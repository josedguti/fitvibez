-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  sex TEXT,
  date_of_birth DATE,
  weight NUMERIC,
  weight_unit TEXT DEFAULT 'kg',
  height NUMERIC,
  height_unit TEXT DEFAULT 'cm',
  fitness_level TEXT,
  fitness_goals TEXT,
  injuries TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own profile
CREATE POLICY "Users can read their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create workout history table
CREATE TABLE IF NOT EXISTS public.workout_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  workout_type TEXT NOT NULL,
  time_available TEXT NOT NULL,
  mood TEXT NOT NULL,
  muscle_focus TEXT NOT NULL,
  equipment TEXT NOT NULL,
  workout_data JSONB NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies for workout_history
ALTER TABLE public.workout_history ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own workout history
CREATE POLICY "Users can read their own workout history" ON public.workout_history
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow users to insert their own workout history
CREATE POLICY "Users can insert their own workout history" ON public.workout_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to update their own workout history
CREATE POLICY "Users can update their own workout history" ON public.workout_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy to allow users to delete their own workout history
CREATE POLICY "Users can delete their own workout history" ON public.workout_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create public schema to store functions that can be accessed by authenticated users
CREATE SCHEMA IF NOT EXISTS public;

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workout_history TO authenticated;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 
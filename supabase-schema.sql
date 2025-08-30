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
  profile_picture_url TEXT,
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

-- Policy to allow users to search other profiles by username
CREATE POLICY "Users can search profiles" ON public.profiles
  FOR SELECT USING (true);

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile pictures
CREATE POLICY "Users can upload their own profile picture" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile picture" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile picture" ON storage.objects
  FOR DELETE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Profile pictures are publicly viewable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Create RLS policies for friend_requests
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see friend requests they sent or received
CREATE POLICY "Users can see their friend requests" ON public.friend_requests
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Policy to allow users to create friend requests
CREATE POLICY "Users can create friend requests" ON public.friend_requests
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Policy to allow users to update friend requests they received
CREATE POLICY "Users can update received friend requests" ON public.friend_requests
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Create friendships table
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Create RLS policies for friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see their friendships
CREATE POLICY "Users can see their friendships" ON public.friendships
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Policy to allow users to create friendships (handled by function)
CREATE POLICY "Users can create friendships" ON public.friendships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy to allow users to delete their friendships
CREATE POLICY "Users can delete friendships" ON public.friendships
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_id);

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

-- Policy to allow friends to see each other's workout history
CREATE POLICY "Friends can see workout history" ON public.workout_history
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.friendships 
      WHERE (user_id = auth.uid() AND friend_id = workout_history.user_id)
         OR (friend_id = auth.uid() AND user_id = workout_history.user_id)
    )
  );

-- Function to accept friend request
CREATE OR REPLACE FUNCTION public.accept_friend_request(request_id UUID)
RETURNS void AS $$
DECLARE
  req_record RECORD;
BEGIN
  -- Get the friend request
  SELECT sender_id, receiver_id INTO req_record
  FROM public.friend_requests
  WHERE id = request_id AND receiver_id = auth.uid() AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or not authorized';
  END IF;
  
  -- Update request status
  UPDATE public.friend_requests
  SET status = 'accepted', updated_at = now()
  WHERE id = request_id;
  
  -- Create bidirectional friendship
  INSERT INTO public.friendships (user_id, friend_id)
  VALUES (req_record.receiver_id, req_record.sender_id);
  
  INSERT INTO public.friendships (user_id, friend_id)
  VALUES (req_record.sender_id, req_record.receiver_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decline friend request
CREATE OR REPLACE FUNCTION public.decline_friend_request(request_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.friend_requests
  SET status = 'declined', updated_at = now()
  WHERE id = request_id AND receiver_id = auth.uid() AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Friend request not found or not authorized';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to remove friendship
CREATE OR REPLACE FUNCTION public.remove_friendship(friend_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Remove both directions of the friendship
  DELETE FROM public.friendships
  WHERE (user_id = auth.uid() AND friend_id = friend_user_id)
     OR (user_id = friend_user_id AND friend_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
GRANT SELECT, INSERT, UPDATE ON public.friend_requests TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.friendships TO authenticated;

-- Grant execution permissions for RPC functions
GRANT EXECUTE ON FUNCTION public.accept_friend_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decline_friend_request(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_friendship(UUID) TO authenticated;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('bug', 'feature', 'improvement', 'general')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RLS policies for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to insert their own feedback
CREATE POLICY "Users can submit feedback" ON public.feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy to allow users to read their own feedback
CREATE POLICY "Users can read their own feedback" ON public.feedback
  FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions for feedback table
GRANT SELECT, INSERT ON public.feedback TO authenticated; 
import { supabase } from "./supabase";

export interface FriendProfile {
  id: string;
  username: string;
  sex?: string;
  date_of_birth?: string;
  weight?: number;
  weight_unit?: string;
  height?: number;
  height_unit?: string;
  fitness_goals?: string;
  created_at?: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
  sender_profile?: FriendProfile;
  receiver_profile?: FriendProfile;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend_profile?: FriendProfile;
}

// Search for users by username
export async function searchUsers(
  query: string
): Promise<{ users: FriendProfile[]; error: string | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { users: [], error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, sex, date_of_birth, weight, weight_unit, height, height_unit, fitness_goals"
      )
      .ilike("username", `%${query}%`)
      .neq("id", user.id) // Exclude current user
      .limit(20);

    if (error) {
      return { users: [], error: error.message };
    }

    return { users: data || [], error: null };
  } catch (error) {
    return { users: [], error: "An error occurred while searching users" };
  }
}

// Send friend request
export async function sendFriendRequest(
  receiverId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if already friends
    const { data: existingFriendship } = await supabase
      .from("friendships")
      .select("id")
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${receiverId}),and(user_id.eq.${receiverId},friend_id.eq.${user.id})`
      )
      .single();

    if (existingFriendship) {
      return { success: false, error: "Already friends with this user" };
    }

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from("friend_requests")
      .select("id")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`
      )
      .single();

    if (existingRequest) {
      return { success: false, error: "Friend request already exists" };
    }

    const { error } = await supabase.from("friend_requests").insert({
      sender_id: user.id,
      receiver_id: receiverId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while sending friend request",
    };
  }
}

// Get pending friend requests (received)
export async function getPendingFriendRequests(): Promise<{
  requests: FriendRequest[];
  error: string | null;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { requests: [], error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("friend_requests")
      .select(
        `
        *,
        sender_profile:profiles!sender_id(id, username, sex, date_of_birth, weight, weight_unit, height, height_unit, fitness_goals)
      `
      )
      .eq("receiver_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      return { requests: [], error: error.message };
    }

    return { requests: data || [], error: null };
  } catch (error) {
    return {
      requests: [],
      error: "An error occurred while fetching friend requests",
    };
  }
}

// Accept friend request
export async function acceptFriendRequest(
  requestId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.rpc("accept_friend_request", {
      request_id: requestId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while accepting friend request",
    };
  }
}

// Decline friend request
export async function declineFriendRequest(
  requestId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.rpc("decline_friend_request", {
      request_id: requestId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: "An error occurred while declining friend request",
    };
  }
}

// Get friends list
export async function getFriends(): Promise<{
  friends: Friendship[];
  error: string | null;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { friends: [], error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("friendships")
      .select(
        `
        *,
        friend_profile:profiles!friend_id(id, username, sex, date_of_birth, weight, weight_unit, height, height_unit, fitness_goals)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return { friends: [], error: error.message };
    }

    return { friends: data || [], error: null };
  } catch (error) {
    return { friends: [], error: "An error occurred while fetching friends" };
  }
}

// Remove friendship
export async function removeFriend(
  friendId: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.rpc("remove_friendship", {
      friend_user_id: friendId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "An error occurred while removing friend" };
  }
}

// Get friend's workout history
export async function getFriendWorkoutHistory(
  friendId: string
): Promise<{ workouts: any[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("workout_history")
      .select("*")
      .eq("user_id", friendId)
      .eq("completed", true)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return { workouts: [], error: error.message };
    }

    return { workouts: data || [], error: null };
  } catch (error) {
    return {
      workouts: [],
      error: "An error occurred while fetching workout history",
    };
  }
}

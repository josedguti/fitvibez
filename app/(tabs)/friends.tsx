import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { requireAuth } from "@/utils/auth";
import {
  acceptFriendRequest,
  declineFriendRequest,
  FriendProfile,
  FriendRequest,
  Friendship,
  getFriends,
  getPendingFriendRequests,
  searchUsers,
  sendFriendRequest,
} from "@/utils/friends";

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useFocusEffect(
    useCallback(() => {
      checkAuthAndLoadData();
    }, [])
  );

  const checkAuthAndLoadData = async () => {
    setIsLoading(true);
    try {
      const isAuth = await requireAuth(false);
      setIsAuthenticated(isAuth);

      if (isAuth) {
        await loadFriendsData();
        await loadFriendRequests();
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFriendsData = async () => {
    const { friends: friendsData, error } = await getFriends();
    if (error) {
      console.error("Error loading friends:", error);
    } else {
      setFriends(friendsData);
    }
  };

  const loadFriendRequests = async () => {
    const { requests, error } = await getPendingFriendRequests();
    if (error) {
      console.error("Error loading friend requests:", error);
    } else {
      setFriendRequests(requests);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const { users, error } = await searchUsers(query);
    if (error) {
      console.error("Error searching users:", error);
      Alert.alert("Error", "Failed to search users");
    } else {
      setSearchResults(users);
    }
    setIsSearching(false);
  };

  const handleSendFriendRequest = async (userId: string, username: string) => {
    const { success, error } = await sendFriendRequest(userId);
    if (success) {
      Alert.alert("Success", `Friend request sent to ${username}!`);
      setSearchResults([]);
      setSearchQuery("");
    } else {
      Alert.alert("Error", error || "Failed to send friend request");
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    const { success, error } = await acceptFriendRequest(requestId);
    if (success) {
      Alert.alert("Success", "Friend request accepted!");
      await loadFriendsData();
      await loadFriendRequests();
    } else {
      Alert.alert("Error", error || "Failed to accept friend request");
    }
  };

  const handleDeclineFriendRequest = async (requestId: string) => {
    const { success, error } = await declineFriendRequest(requestId);
    if (success) {
      await loadFriendRequests();
    } else {
      Alert.alert("Error", error || "Failed to decline friend request");
    }
  };

  const calculateAge = (dateOfBirth: string | undefined) => {
    if (!dateOfBirth) return "Unknown";
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return `${age}`;
  };

  const renderFriendItem = ({ item }: { item: Friendship }) => (
    <TouchableOpacity
      style={[styles.friendItem, { borderBottomColor: colors.border }]}
      onPress={() =>
        router.push({
          pathname: "/friend-profile",
          params: { friendId: item.friend_id },
        })
      }
    >
      {item.friend_profile?.profile_picture_url ? (
        <Image
          source={{
            uri: `${item.friend_profile.profile_picture_url}?t=${Date.now()}`,
          }}
          style={styles.friendAvatar}
          contentFit="cover"
          cachePolicy="none"
        />
      ) : (
        <View
          style={[
            styles.friendAvatar,
            { backgroundColor: colorScheme === "dark" ? "#4D4D5D" : "#FFE5E5" },
          ]}
        >
          <ThemedText style={styles.friendAvatarText}>
            {item.friend_profile?.username?.charAt(0).toUpperCase() || "U"}
          </ThemedText>
        </View>
      )}
      <View style={styles.friendInfo}>
        <ThemedText style={styles.friendName}>
          {item.friend_profile?.username}
        </ThemedText>
        <ThemedText style={styles.friendDetails}>
          {item.friend_profile?.sex
            ? `${
                item.friend_profile.sex.charAt(0).toUpperCase() +
                item.friend_profile.sex.slice(1)
              }`
            : ""}
          {item.friend_profile?.date_of_birth
            ? ` • ${calculateAge(item.friend_profile.date_of_birth)} years`
            : ""}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text} />
    </TouchableOpacity>
  );

  const renderFriendRequestItem = ({ item }: { item: FriendRequest }) => (
    <View style={[styles.requestItem, { borderBottomColor: colors.border }]}>
      {item.sender_profile?.profile_picture_url ? (
        <Image
          source={{
            uri: `${item.sender_profile.profile_picture_url}?t=${Date.now()}`,
          }}
          style={styles.friendAvatar}
          contentFit="cover"
          cachePolicy="none"
        />
      ) : (
        <View
          style={[
            styles.friendAvatar,
            { backgroundColor: colorScheme === "dark" ? "#4D4D5D" : "#FFE5E5" },
          ]}
        >
          <ThemedText style={styles.friendAvatarText}>
            {item.sender_profile?.username?.charAt(0).toUpperCase() || "U"}
          </ThemedText>
        </View>
      )}
      <View style={styles.requestInfo}>
        <ThemedText style={styles.friendName}>
          {item.sender_profile?.username}
        </ThemedText>
        <ThemedText style={styles.requestText}>
          wants to be your friend
        </ThemedText>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.acceptButton, { backgroundColor: colors.primary }]}
          onPress={() => handleAcceptFriendRequest(item.id)}
        >
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.declineButton,
            { backgroundColor: colors.text + "20" },
          ]}
          onPress={() => handleDeclineFriendRequest(item.id)}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchResultItem = ({ item }: { item: FriendProfile }) => (
    <View
      style={[styles.searchResultItem, { borderBottomColor: colors.border }]}
    >
      {item.profile_picture_url ? (
        <Image
          source={{
            uri: `${item.profile_picture_url}?t=${Date.now()}`,
          }}
          style={styles.friendAvatar}
          contentFit="cover"
          cachePolicy="none"
        />
      ) : (
        <View
          style={[
            styles.friendAvatar,
            { backgroundColor: colorScheme === "dark" ? "#4D4D5D" : "#FFE5E5" },
          ]}
        >
          <ThemedText style={styles.friendAvatarText}>
            {item.username?.charAt(0).toUpperCase() || "U"}
          </ThemedText>
        </View>
      )}
      <View style={styles.friendInfo}>
        <ThemedText style={styles.friendName}>{item.username}</ThemedText>
        <ThemedText style={styles.friendDetails}>
          {item.sex
            ? `${item.sex.charAt(0).toUpperCase() + item.sex.slice(1)}`
            : ""}
          {item.date_of_birth
            ? ` • ${calculateAge(item.date_of_birth)} years`
            : ""}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: colors.primary }]}
        onPress={() => handleSendFriendRequest(item.id, item.username)}
      >
        <Ionicons name="person-add" size={16} color="white" />
        <ThemedText style={styles.addButtonText}>Add</ThemedText>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <LinearGradient
          colors={
            colorScheme === "dark"
              ? ["#1a1a2e", "#16213e", "#0f3460"]
              : ["#FF6B9D", "#C44EC4", "#8A2BE2", "#4A90E2"]
          }
          style={styles.background}
        />
        <ThemedText>Loading friends...</ThemedText>
      </ThemedView>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={
            colorScheme === "dark"
              ? ["#1a1a2e", "#16213e", "#0f3460"]
              : ["#FF6B9D", "#C44EC4", "#8A2BE2", "#4A90E2"]
          }
          style={styles.background}
        />
        <View style={styles.unauthenticatedContent}>
          <ThemedText type="title" style={styles.title}>
            Friends
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Login to connect with friends
          </ThemedText>
          <Button
            title="Login"
            onPress={() => router.push("/login")}
            style={styles.loginButton}
          />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#1a1a2e", "#16213e", "#0f3460"]
            : ["#FF6B9D", "#C44EC4", "#8A2BE2", "#4A90E2"]
        }
        style={styles.background}
      />

      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Friends
        </ThemedText>

        {/* Search Bar */}
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.background + "40" },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.text + "80"}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search friends by username..."
            placeholderTextColor={colors.text + "60"}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "friends" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab("friends")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "friends" && { color: "white" },
              ]}
            >
              Friends ({friends.length})
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "requests" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab("requests")}
          >
            <ThemedText
              style={[
                styles.tabText,
                activeTab === "requests" && { color: "white" },
              ]}
            >
              Requests ({friendRequests.length})
            </ThemedText>
            {friendRequests.length > 0 && (
              <View style={styles.notificationBadge}>
                <ThemedText style={styles.badgeText}>
                  {friendRequests.length}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Search Results */}
        {searchQuery.length >= 2 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Search Results</ThemedText>
            {isSearching ? (
              <ThemedText style={styles.emptyText}>Searching...</ThemedText>
            ) : searchResults.length === 0 ? (
              <ThemedText style={styles.emptyText}>No users found</ThemedText>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderSearchResultItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {/* Friends Tab */}
        {activeTab === "friends" && (
          <View style={styles.section}>
            {friends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="people-outline"
                  size={64}
                  color={colors.text + "40"}
                />
                <ThemedText style={styles.emptyText}>No friends yet</ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  Search for friends using the search bar above
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}

        {/* Friend Requests Tab */}
        {activeTab === "requests" && (
          <View style={styles.section}>
            {friendRequests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="notifications-outline"
                  size={64}
                  color={colors.text + "40"}
                />
                <ThemedText style={styles.emptyText}>
                  No friend requests
                </ThemedText>
                <ThemedText style={styles.emptySubtext}>
                  When someone sends you a friend request, it will appear here
                </ThemedText>
              </View>
            ) : (
              <FlatList
                data={friendRequests}
                renderItem={renderFriendRequestItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 32,
  },
  loginButton: {
    width: "80%",
    marginTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  notificationBadge: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  friendAvatarText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  friendDetails: {
    fontSize: 14,
    opacity: 0.7,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  requestInfo: {
    flex: 1,
  },
  requestText: {
    fontSize: 14,
    opacity: 0.7,
  },
  requestActions: {
    flexDirection: "row",
    gap: 8,
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  declineButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  unauthenticatedContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});

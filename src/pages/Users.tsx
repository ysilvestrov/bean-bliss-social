
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MainNav from "@/components/MainNav";
import FriendCard from "@/components/FriendCard";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Users = () => {
  const [activeTab, setActiveTab] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }

      setCurrentUserId(session.user.id);
      loadFollowData(session.user.id);
    };

    initialize();
  }, []);

  const loadFollowData = async (userId: string) => {
    setLoading(true);

    try {
      // Load followers (users who follow the current user)
      const { data: followersData, error: followersError } = await supabase
        .from('user_followers')
        .select(`
          follower_id,
          followers:follower_id!follower_id(
            id,
            profiles!followers_id(username, avatar_url)
          )
        `)
        .eq('following_id', userId);

      if (followersError) {
        console.error("Error loading followers:", followersError);
        toast({
          title: "Error",
          description: "Failed to load followers",
          variant: "destructive"
        });
      } else if (followersData) {
        // Get profiles directly
        const followerIds = followersData.map(item => item.follower_id);
        
        const { data: followerProfiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', followerIds);
          
        if (followerProfiles) {
          const processedFollowers = followerProfiles.map(profile => ({
            id: profile.id,
            name: profile.username || "User",
            username: profile.username || "user",
            avatar: profile.avatar_url || undefined,
            initials: getUserInitials(profile.username || "User"),
            status: "friend" as const
          }));
          setFollowers(processedFollowers);
        }
      }

      // Load following (users the current user follows)
      const { data: followingData, error: followingError } = await supabase
        .from('user_followers')
        .select(`
          following_id,
          following:following_id!following_id(
            id,
            profiles!following_id(username, avatar_url)
          )
        `)
        .eq('follower_id', userId);

      if (followingError) {
        console.error("Error loading following:", followingError);
        toast({
          title: "Error",
          description: "Failed to load following",
          variant: "destructive"
        });
      } else if (followingData) {
        // Get profiles directly
        const followingIds = followingData.map(item => item.following_id);
        
        const { data: followingProfiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', followingIds);
          
        if (followingProfiles) {
          const processedFollowing = followingProfiles.map(profile => ({
            id: profile.id,
            name: profile.username || "User",
            username: profile.username || "user",
            avatar: profile.avatar_url || undefined,
            initials: getUserInitials(profile.username || "User"),
            status: "friend" as const
          }));
          setFollowing(processedFollowing);
        }
      }
    } catch (error) {
      console.error("Error loading follow data:", error);
      toast({
        title: "Error",
        description: "Error loading follow data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchTerm}%`)
        .limit(10);

      if (error) {
        console.error("Search error:", error);
        toast({
          title: "Error",
          description: "Search failed"
        });
        return;
      }

      // Check if users are being followed
      const userStatuses = await Promise.all(
        data.map(async (user) => {
          // Skip current user
          if (user.id === currentUserId) {
            return { ...user, status: "self" };
          }

          // Check if the current user is following this user
          const { data: followData } = await supabase
            .from('user_followers')
            .select()
            .eq('follower_id', currentUserId)
            .eq('following_id', user.id)
            .single();

          // Check if this user is following the current user
          const { data: isFollowerData } = await supabase
            .from('user_followers')
            .select()
            .eq('follower_id', user.id)
            .eq('following_id', currentUserId)
            .single();

          let status = "none";
          if (followData && isFollowerData) {
            status = "mutual";
          } else if (followData) {
            status = "friend";
          } else if (isFollowerData) {
            status = "follower";
          }

          return {
            ...user,
            status
          };
        })
      );

      // Format for FriendCard
      const formattedResults = userStatuses
        .filter(user => user.status !== "self") // Filter out current user
        .map(user => ({
          id: user.id,
          name: user.username,
          username: user.username,
          avatar: user.avatar_url || undefined,
          initials: getUserInitials(user.username),
          status: user.status === "friend" || user.status === "mutual" ? "friend" : "none"
        }));

      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Search failed"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substr(0, 2);
  };

  const handleFollowAction = async (userId: string, action: 'add' | 'accept' | 'remove') => {
    if (!currentUserId) return;

    try {
      if (action === 'add' || action === 'accept') {
        // Follow user
        const { error } = await supabase
          .from('user_followers')
          .insert({
            follower_id: currentUserId,
            following_id: userId
          });

        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            toast({
              title: "Error",
              description: "You're already following this user"
            });
          } else {
            console.error("Error following user:", error);
            toast({
              title: "Error",
              description: "Failed to follow user"
            });
          }
          return;
        }

        toast({
          title: "Success",
          description: "User followed successfully"
        });

        // Update UI
        if (activeTab === "search") {
          setSearchResults(prev =>
            prev.map(user =>
              user.id === userId ? { ...user, status: "friend" } : user
            )
          );
        }
        
        // Refresh follow data
        loadFollowData(currentUserId);
      } else if (action === 'remove') {
        // Unfollow user
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);

        if (error) {
          console.error("Error unfollowing user:", error);
          toast({
            title: "Error",
            description: "Failed to unfollow user"
          });
          return;
        }

        toast({
          title: "Success",
          description: "User unfollowed successfully"
        });

        // Update UI
        if (activeTab === "search") {
          setSearchResults(prev =>
            prev.map(user =>
              user.id === userId ? { ...user, status: "none" } : user
            )
          );
        } else if (activeTab === "following") {
          setFollowing(prev => prev.filter(user => user.id !== userId));
        }
        
        // Refresh follow data
        loadFollowData(currentUserId);
      }
    } catch (error) {
      console.error("Follow/unfollow error:", error);
      toast({
        title: "Error",
        description: "Action failed"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <MainNav />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Users</h1>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
            <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4">
            <div className="flex gap-2 mb-6">
              <Input
                type="search"
                placeholder="Search for users..."
                className="max-w-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((user) => (
                  <FriendCard
                    key={user.id}
                    {...user}
                    onAction={handleFollowAction}
                  />
                ))}
              </div>
            ) : searchTerm && !isSearching ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found matching "{searchTerm}"</p>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="followers" className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-dark" />
              </div>
            ) : followers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.map((follower) => (
                  <FriendCard
                    key={follower.id}
                    {...follower}
                    onAction={handleFollowAction}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No followers yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-dark" />
              </div>
            ) : following.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {following.map((follow) => (
                  <FriendCard
                    key={follow.id}
                    {...follow}
                    onAction={handleFollowAction}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Not following anyone yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Users;

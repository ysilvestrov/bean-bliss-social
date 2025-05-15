import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UserProfile, FollowStatus } from '@/types/user';

const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substr(0, 2);
};

export const useFollowData = (currentUserId: string | null) => {
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadFollowData = useCallback(async (userId: string) => {
    setLoading(true);

    try {
      // Load followers
      const { data: followersData, error: followersError } = await supabase
        .from('user_followers')
        .select('follower_id')
        .eq('following_id', userId);

      if (followersError) {
        console.error("Error loading followers:", followersError);
        toast({
          title: "Error",
          description: "Failed to load followers",
          variant: "destructive"
        });
      } else if (followersData) {
        const followerIds = followersData.map(item => item.follower_id);
        
        const { data: followerProfiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', followerIds);
          
        if (followerProfiles) {
          // Count check-ins for followers
          const followerCheckInPromises = followerProfiles.map(async (profile) => {
            const { count: checkInCount } = await supabase
              .from('coffee_check_ins')
              .select('*', { count: 'exact' })
              .eq('user_id', profile.id);
            return {
              id: profile.id,
              name: profile.username || "User",
              username: profile.username || "user",
              avatar: profile.avatar_url || undefined,
              initials: getUserInitials(profile.username || "User"),
              status: "friend" as const,
              checkInCount: checkInCount || 0
            };
          });

          const processedFollowers = await Promise.all(followerCheckInPromises);
          setFollowers(processedFollowers);
          setFollowersCount(processedFollowers.length);
        }
      }

      // Load following
      const { data: followingData, error: followingError } = await supabase
        .from('user_followers')
        .select('following_id')
        .eq('follower_id', userId);

      if (followingError) {
        console.error("Error loading following:", followingError);
        toast({
          title: "Error",
          description: "Failed to load following",
          variant: "destructive"
        });
      } else if (followingData) {
        const followingIds = followingData.map(item => item.following_id);
        
        const { data: followingProfiles } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', followingIds);
          
        if (followingProfiles) {
          // Count check-ins for following
          const followingCheckInPromises = followingProfiles.map(async (profile) => {
            const { count: checkInCount } = await supabase
              .from('coffee_check_ins')
              .select('*', { count: 'exact' })
              .eq('user_id', profile.id);
            return {
              id: profile.id,
              name: profile.username || "User",
              username: profile.username || "user",
              avatar: profile.avatar_url || undefined,
              initials: getUserInitials(profile.username || "User"),
              status: "friend" as const,
              checkInCount: checkInCount || 0
            };
          });

          const processedFollowing = await Promise.all(followingCheckInPromises);
          setFollowing(processedFollowing);
          setFollowingCount(processedFollowing.length);
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
  }, []);

  const handleFollowAction = useCallback(async (userId: string, action: 'add' | 'accept' | 'remove') => {
    if (!currentUserId) return;

    try {
      if (action === 'add' || action === 'accept') {
        const { error } = await supabase
          .from('user_followers')
          .insert({
            follower_id: currentUserId,
            following_id: userId
          });

        if (error) {
          if (error.code === '23505') {
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

        // Refresh follow data
        loadFollowData(currentUserId);
      } else if (action === 'remove') {
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
  }, [currentUserId, loadFollowData]);

  return {
    followers,
    following,
    loading,
    loadFollowData,
    handleFollowAction
  };
};

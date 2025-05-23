import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UserProfile, FollowStatus, FriendAction } from '@/types/user';

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
  const [loading, setLoading] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);

  const loadFollowData = useCallback(async (userId: string) => {
    setLoading(true);

    try {
      try {
        // Fetch both followers and following data in parallel
        const [followersResult, followingResult] = await Promise.all([
          supabase
            .from('user_followers')
            .select('follower_id')
            .eq('following_id', userId),
          supabase
            .from('user_followers')
            .select('following_id')
            .eq('follower_id', userId)
        ]);

        const { data: followersData, error: followersError } = followersResult;
        const { data: followingData, error: followingError } = followingResult;

        if (followersError || followingError) {
          console.error("Error loading follow data:", followersError || followingError);
          toast({
            title: "Error",
            description: "Failed to load follow data",
            variant: "destructive"
          });
          return;
        }

        if (followersData && followingData) {
          const followerIds = followersData.map(item => item.follower_id);
          const followingIds = followingData.map(item => item.following_id);
          
          // Get profiles in parallel
          const [followerProfilesResult, followingProfilesResult] = await Promise.all([
            supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .in('id', followerIds),
            supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .in('id', followingIds)
          ]);

          const { data: followerProfiles } = followerProfilesResult;
          const { data: followingProfiles } = followingProfilesResult;

          if (followerProfiles && followingProfiles) {
            // Create a set of following IDs for efficient lookup
            const followingIdsSet = new Set(followingIds);
            
            // Process followers with friend status
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
                status: followingIdsSet.has(profile.id) ? "friend" as const : "follower" as const,
                checkInCount: checkInCount || 0
              };
            });

            const processedFollowers = await Promise.all(followerCheckInPromises);
            setFollowers(processedFollowers);
            setFollowersCount(processedFollowers.length);
          }
        }
      } catch (error) {
        console.error("Error loading follow data:", error);
        toast({
          title: "Error",
          description: "Failed to load follow data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
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
          // Check if this user is also following us
          const { data: isFollowedBy } = await supabase
            .from('user_followers')
            .select('id')
            .eq('follower_id', userId)
            .eq('following_id', profile.id);

          return {
              id: profile.id,
              name: profile.username || "User",
              username: profile.username || "user",
              avatar: profile.avatar_url || undefined,
              initials: getUserInitials(profile.username || "User"),
              status: isFollowedBy?.length > 0 ? "friend" as const : "following" as const,
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

  const handleFollowAction = useCallback(async (userId: string, action: FriendAction) => {
    if (!currentUserId) return;

    try {
      switch (action) {
        case 'add':
        case 'accept': {
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
            description: action === 'accept' ? "Friend request accepted" : "Now following user"
          });
          loadFollowData(currentUserId);
          break;
        }
        case 'remove': {
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
            description: "Unfollowed user"
          });
          loadFollowData(currentUserId);
          break;
        }
        case 'follow': {
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
            description: "Now following user"
          });
          loadFollowData(currentUserId);
          break;
        }
        default:
          throw new Error(`Unsupported action: ${action}`);
      }
      setNeedsReload(true);
    } catch (error) {
      console.error("Error handling follow action:", error);
      toast({
        title: "Error",
        description: "Failed to handle follow action"
      });
    }
  }, [currentUserId, loadFollowData]);

  return {
    followers,
    following,
    loading,
    loadFollowData,
    handleFollowAction,
    needsReload,
    setNeedsReload
  };
};

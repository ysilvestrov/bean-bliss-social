
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export type FollowStatus = 'none' | 'following' | 'follower' | 'mutual';

export type ProfileData = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileStats = {
  followersCount: number;
  followingCount: number;
  checkInsCount: number;
};

export const useUserProfile = (userId: string | undefined) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<FollowStatus>('none');
  const [stats, setStats] = useState<ProfileStats>({
    followersCount: 0,
    followingCount: 0,
    checkInsCount: 0
  });
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      setCurrentUserId(session.user.id);

      if (userId === session.user.id) {
        // If viewing own profile, redirect to the profile page
        navigate('/profile');
        return;
      }

      await Promise.all([
        loadUserProfile(),
        loadFollowStatus(session.user.id),
        loadFollowCounts()
      ]);
    };

    if (userId) {
      initialize();
    }
  }, [userId, navigate]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load user profile");
        navigate('/users');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error loading user profile");
    } finally {
      setLoading(false);
    }
  };

  const loadFollowStatus = async (currentUserId: string) => {
    try {
      // Check if current user follows the profile user
      const { data: followingData } = await supabase
        .from('user_followers')
        .select()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .single();

      // Check if profile user follows the current user
      const { data: followerData } = await supabase
        .from('user_followers')
        .select()
        .eq('follower_id', userId)
        .eq('following_id', currentUserId)
        .single();

      if (followingData && followerData) {
        setFollowStatus('mutual');
      } else if (followingData) {
        setFollowStatus('following');
      } else if (followerData) {
        setFollowStatus('follower');
      } else {
        setFollowStatus('none');
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const loadFollowCounts = async () => {
    try {
      // Count followers
      const { count: followersCount, error: followersError } = await supabase
        .from('user_followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (!followersError && followersCount !== null) {
        setStats(prev => ({ ...prev, followersCount }));
      }

      // Count following
      const { count: followingCount, error: followingError } = await supabase
        .from('user_followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (!followingError && followingCount !== null) {
        setStats(prev => ({ ...prev, followingCount }));
      }
    } catch (error) {
      console.error("Error loading follow counts:", error);
    }
  };

  const handleFollowAction = async () => {
    if (!currentUserId) return;
    
    setIsActionLoading(true);
    try {
      if (followStatus === 'following' || followStatus === 'mutual') {
        // Unfollow
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);

        if (error) {
          console.error("Error unfollowing:", error);
          toast.error("Failed to unfollow user");
          return;
        }

        setFollowStatus(followStatus === 'mutual' ? 'follower' : 'none');
        setStats(prev => ({ ...prev, followersCount: prev.followersCount - 1 }));
        toast.success("Unfollowed successfully");
      } else {
        // Follow
        const { error } = await supabase
          .from('user_followers')
          .insert({
            follower_id: currentUserId,
            following_id: userId
          });

        if (error) {
          console.error("Error following:", error);
          toast.error("Failed to follow user");
          return;
        }

        setFollowStatus(followStatus === 'follower' ? 'mutual' : 'following');
        setStats(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
        toast.success("Followed successfully");
      }
    } catch (error) {
      console.error("Follow action error:", error);
      toast.error("Action failed");
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
    profile,
    loading,
    currentUserId,
    followStatus,
    stats,
    isActionLoading,
    handleFollowAction
  };
};

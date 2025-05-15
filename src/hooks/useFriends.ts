
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Define the correct type for status
export type FriendStatus = "friend" | "pending" | "none";

// Define the friend type
export interface Friend {
  id: string;
  name: string;
  username: string;
  initials: string;
  status: FriendStatus;
  checkIns: number;
  avatar?: string;
}

export const useFriends = () => {
  const { profile } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!profile?.id) return;

      try {
        // Fetch users that the current user follows
        const { data: followings, error: followingsError } = await supabase
          .from('user_followers')
          .select('following_id')
          .eq('follower_id', profile.id);

        if (followingsError) throw followingsError;

        if (!followings?.length) {
          setFriends([]);
          setLoading(false);
          return;
        }

        // Fetch profiles of followed users
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', followings.map(f => f.following_id));

        if (profilesError) throw profilesError;

        // Transform profiles to Friend type
        const friendsList = profiles.map(p => ({
          id: p.id,
          name: p.username,
          username: p.username,
          initials: p.username.split(' ').map(n => n[0]).join('').toUpperCase(),
          status: 'friend' as FriendStatus,
          checkIns: 0,
          avatar: p.avatar_url
        }));

        setFriends(friendsList);
      } catch (error) {
        console.error('Error fetching friends:', error);
        toast.error('Failed to load friends');
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [profile?.id]);

  const handleFriendAction = async (friendId: string, action: 'add' | 'accept' | 'remove') => {
    if (!profile?.id) {
      toast.error('You must be logged in to perform this action');
      return;
    }

    try {
      if (action === 'remove') {
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', profile.id)
          .eq('following_id', friendId);

        if (error) throw error;

        setFriends(prev => prev.filter(f => f.id !== friendId));
        toast.success('Friend removed successfully');
      } else if (action === 'add') {
        const { error } = await supabase
          .from('user_followers')
          .insert([{ follower_id: profile.id, following_id: friendId }]);

        if (error) throw error;

        // Fetch the user's profile to add to friends list
        const { data: newFriend, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', friendId)
          .single();

        if (profileError) throw profileError;

        // Get checkins count for the new friend
        const { count: checkInsCount, error: checkInsError } = await supabase
          .from('coffee_check_ins')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', newFriend.id);

        if (checkInsError) throw checkInsError;

        const friendData: Friend = {
          id: newFriend.id,
          name: newFriend.username,
          username: newFriend.username,
          initials: newFriend.username.split(' ').map(n => n[0]).join('').toUpperCase(),
          status: 'friend',
          checkIns: checkInsCount || 0,
          avatar: newFriend.avatar_url
        };

        setFriends(prev => [...prev, friendData]);
        toast.success('Friend added successfully');
      }
    } catch (error) {
      console.error('Error handling friend action:', error);
      toast.error(`Failed to ${action} friend`);
    }
  };

  return {
    friends,
    handleFriendAction,
    loading
  };
};

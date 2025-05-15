import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UserProfile } from '@/types/user';

const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substr(0, 2);
};

export const useUserSearch = (currentUserId: string | null) => {
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!currentUserId) return;

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
          status: user.status === "friend" || user.status === "mutual" ? "friend" as const: "none" as const 
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
  }, [currentUserId]);

  return {
    searchResults,
    isSearching,
    performSearch
  };
};

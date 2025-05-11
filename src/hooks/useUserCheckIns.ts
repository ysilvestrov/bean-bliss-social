
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FeedItem } from "@/hooks/useFeed";

export const useUserCheckIns = (userId: string | undefined) => {
  const [checkIns, setCheckIns] = useState<FeedItem[]>([]);
  const [checkInsCount, setCheckInsCount] = useState(0);

  useEffect(() => {
    if (userId) {
      loadCheckIns();
    }
  }, [userId]);

  const loadCheckIns = async () => {
    try {
      const { data, error } = await supabase
        .from('coffee_check_ins')
        .select(`
          *,
          profiles(
            username,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error loading check-ins:", error);
        return;
      }

      // Get count of check-ins
      setCheckInsCount(data.length);

      // Format data for CoffeeCard
      const formattedCheckIns = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        userName: item.profiles?.username || "Coffee Lover",
        userInitials: getUserInitials(item.profiles?.username || "Coffee Lover"),
        userImage: item.profiles?.avatar_url || null,
        coffeeImage: item.image_url || null,
        coffeeName: item.coffee_name,
        roastery: item.roaster,
        brewMethod: item.brew_method,
        location: item.location || null,
        rating: item.rating,
        comment: item.notes || null,
        timestamp: formatDate(item.created_at)
      }));

      setCheckIns(formattedCheckIns);
    } catch (error) {
      console.error("Error loading check-ins:", error);
    }
  };

  // Helper function to get user initials from username
  const getUserInitials = (username: string) => {
    return username
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substr(0, 2);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMillis = now.getTime() - date.getTime();
    const diffInHours = diffInMillis / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return {
    checkIns,
    checkInsCount
  };
};

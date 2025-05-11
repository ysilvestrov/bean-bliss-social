
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FeedItem } from "@/hooks/useFeed";
import { getUserInitials, formatDate } from "@/utils/formatting";

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
          profiles:user_id(
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

  return {
    checkIns,
    checkInsCount,
    setCheckIns
  };
};

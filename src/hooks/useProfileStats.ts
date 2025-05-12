
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export type ProfileStats = {
  checkInsCount: number;
  followersCount: number;
  followingCount: number;
};

export const useProfileStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<ProfileStats>({
    checkInsCount: 0,
    followersCount: 0,
    followingCount: 0
  });

  useEffect(() => {
    if (!userId) return;

    const fetchStats = async () => {
      try {
        // Fetch followers count
        const { count: followersCount, error: followersError } = await supabase
          .from('user_followers')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId);

        if (!followersError && followersCount !== null) {
          setStats(prev => ({ ...prev, followersCount }));
        }

        // Fetch following count
        const { count: followingCount, error: followingError } = await supabase
          .from('user_followers')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId);

        if (!followingError && followingCount !== null) {
          setStats(prev => ({ ...prev, followingCount }));
        }

        // Fetch check-ins count
        const { count: checkInsCount, error: checkInsError } = await supabase
          .from('coffee_check_ins')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        if (!checkInsError && checkInsCount !== null) {
          setStats(prev => ({ ...prev, checkInsCount }));
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
        toast("Error fetching user statistics");
      }
    };

    fetchStats();
  }, [userId]);

  return stats;
};

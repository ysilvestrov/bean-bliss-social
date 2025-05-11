
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

export type AuthProfileData = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export const useAuthProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AuthProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    checkInsCount: 0,
    followersCount: 0,
    followingCount: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return;
        }

        const userId = session.user.id;

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast("Error fetching profile data");
          return;
        }

        setProfile(profileData);

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
        console.error("Error fetching user data:", error);
        toast("Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast("Error signing out");
        console.error("Error signing out:", error);
        return;
      }
      navigate('/login');
      toast("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast("Error signing out");
    }
  };

  return {
    profile,
    loading,
    stats,
    handleSignOut
  };
};

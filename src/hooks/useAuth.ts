
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

export const useAuth = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<AuthProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/login');
          return null;
        }

        return session.user.id;
      } catch (error) {
        console.error("Error fetching session:", error);
        toast("Error checking authentication status");
        return null;
      }
    };

    const initializeAuth = async () => {
      const userId = await fetchSession();
      
      if (userId) {
        try {
          // Fetch user profile - FIXED: using .eq() method instead of query parameter
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
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast("Error fetching user data");
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
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
    handleSignOut
  };
};

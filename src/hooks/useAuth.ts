
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
          console.log("Fetching profile for user ID:", userId);
          
          // Fixed query - properly using the .eq() method
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (profileError) {
            // If the error is that no rows were found, we need to create a profile
            if (profileError.code === 'PGRST116') {
              await createUserProfile(userId);
              return;
            } else {
              console.error("Error fetching profile:", profileError);
              toast("Error fetching profile data");
              return;
            }
          }

          console.log("Profile data retrieved:", profileData);
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

  // Function to create a user profile if it doesn't exist
  const createUserProfile = async (userId: string) => {
    try {
      console.log("Creating new profile for user ID:", userId);

      // Get user details from auth to use for the profile
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) {
        console.error("Could not get user data for profile creation");
        return;
      }

      // Extract username from email or use user ID if not available
      const username = user.email ? user.email.split('@')[0] : `user_${userId.substring(0, 8)}`;
      
      // Create new profile
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: username,
          avatar_url: user.user_metadata.avatar_url || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        toast("Error creating user profile");
        return;
      }

      console.log("Profile created successfully:", newProfile);
      setProfile(newProfile);
    } catch (error) {
      console.error("Error in profile creation:", error);
      toast("Error creating user profile");
    } finally {
      setLoading(false);
    }
  };

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

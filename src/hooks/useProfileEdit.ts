
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export type ProfileUpdateData = {
  username: string;
  avatar_url?: string | null;
};

export const useProfileEdit = (userId: string | undefined) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!userId) {
      toast("User ID not found. Please log in again");
      return false;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          ...(data.avatar_url && { avatar_url: data.avatar_url }),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error("Error updating profile:", error);
        toast("Failed to update profile");
        return false;
      }

      setIsSuccess(true);
      toast("Profile updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast("An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    isLoading,
    isSuccess
  };
};

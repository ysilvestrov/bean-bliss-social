
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export const useLikes = (checkInId: string) => {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (checkInId) {
      loadLikeStatus();
      countLikes();
    }
  }, [checkInId]);

  const loadLikeStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('coffee_likes')
        .select()
        .eq('check_in_id', checkInId)
        .eq('user_id', session.user.id)
        .single();
      
      setIsLiked(!!data);
    } catch (error) {
      // No like found is expected and not an error
      console.log("No existing like found");
    } finally {
      setIsLoading(false);
    }
  };

  const countLikes = async () => {
    try {
      const { count, error } = await supabase
        .from('coffee_likes')
        .select('*', { count: 'exact', head: true })
        .eq('check_in_id', checkInId);
      
      if (error) throw error;
      setLikesCount(count || 0);
    } catch (error) {
      console.error("Error counting likes:", error);
    }
  };

  const toggleLike = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to like check-ins");
        return;
      }

      setIsLoading(true);

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('coffee_likes')
          .delete()
          .eq('check_in_id', checkInId)
          .eq('user_id', session.user.id);
        
        if (error) throw error;
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      } else {
        // Like
        const { error } = await supabase
          .from('coffee_likes')
          .insert({
            check_in_id: checkInId,
            user_id: session.user.id
          });
        
        if (error) throw error;
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    likesCount,
    isLiked,
    isLoading,
    toggleLike
  };
};

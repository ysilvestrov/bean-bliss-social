
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getUserInitials, formatDate } from "@/utils/formatting";

export type FeedItem = {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  userImage: string | null;
  coffeeImage: string | null;
  coffeeName: string;
  roastery: string;
  brewMethod: string;
  location: string | null;
  rating: number;
  comment: string | null;
  timestamp: string;
};

export type FeedType = "following" | "discover";

export const useFeed = () => {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState<FeedType>("following");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      
      // Continue to load feed if authenticated
      loadFeed();
    };
    
    checkAuth();
  }, [navigate, feedType]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('coffee_check_ins')
        .select(`
          *,
          profiles:user_id(
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);
        
      // Filter by following if on following feed
      if (feedType === "following") {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Get users that the current user follows
        const { data: followingData } = await supabase
          .from('user_followers')
          .select('following_id')
          .eq('follower_id', user?.id);
          
        if (followingData && followingData.length > 0) {
          const followingIds = followingData.map(f => f.following_id);
          query = query.in('user_id', followingIds);
        } else {
          // If not following anyone, show empty state
          setFeed([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching feed:", error);
        toast({
          title: "Error",
          description: "Failed to load feed",
          variant: "destructive"
        });
        return;
      }

      if (data) {
        // Transform data to match the format expected by FeedItem
        const formattedFeed = data.map(item => ({
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

        setFeed(formattedFeed);
      }
    } catch (error) {
      console.error("Error loading feed:", error);
      toast({
        title: "Error",
        description: "Error loading feed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    feed,
    loading,
    feedType,
    setFeedType
  };
};

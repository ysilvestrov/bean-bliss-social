
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainNav from "@/components/MainNav";
import CoffeeCard from "@/components/CoffeeCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

const Home = () => {
  const [feed, setFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState("following"); // "following" or "discover"
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
          profiles(
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
        // Transform data to match the format expected by CoffeeCard
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

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <MainNav />
      
      <div className="container max-w-xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-coffee-dark">Feed</h1>
          
          <Tabs 
            value={feedType} 
            onValueChange={setFeedType}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="following">Following</TabsTrigger>
              <TabsTrigger value="discover">Discover</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-coffee-dark" />
          </div>
        ) : feed.length > 0 ? (
          feed.map((item) => (
            <CoffeeCard 
              key={item.id} 
              {...item} 
              onUserClick={() => navigate(`/users/${item.userId}`)} 
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            {feedType === "following" ? (
              <>
                <p className="text-gray-500">You're not following anyone yet.</p>
                <button 
                  onClick={() => navigate('/users')} 
                  className="mt-4 text-coffee-dark hover:underline"
                >
                  Find users to follow
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-500">No coffee check-ins found.</p>
                <button 
                  onClick={() => navigate('/check-in')} 
                  className="mt-4 text-coffee-dark hover:underline"
                >
                  Create your first check-in!
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

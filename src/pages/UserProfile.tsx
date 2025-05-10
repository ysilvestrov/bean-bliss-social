
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Coffee, User, UserPlus, UserMinus, Users } from "lucide-react";
import MainNav from "@/components/MainNav";
import CoffeeCard from "@/components/CoffeeCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followStatus, setFollowStatus] = useState<'none' | 'following' | 'follower' | 'mutual'>('none');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [checkInsCount, setCheckInsCount] = useState(0);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      setCurrentUserId(session.user.id);

      if (userId === session.user.id) {
        // If viewing own profile, redirect to the profile page
        navigate('/profile');
        return;
      }

      await Promise.all([
        loadUserProfile(),
        loadCheckIns(),
        loadFollowStatus(session.user.id),
        loadFollowCounts()
      ]);
    };

    initialize();
  }, [userId, navigate]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load user profile");
        navigate('/users');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error loading user profile");
    } finally {
      setLoading(false);
    }
  };

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

  const loadFollowStatus = async (currentUserId: string) => {
    try {
      // Check if current user follows the profile user
      const { data: followingData } = await supabase
        .from('user_followers')
        .select()
        .eq('follower_id', currentUserId)
        .eq('following_id', userId)
        .single();

      // Check if profile user follows the current user
      const { data: followerData } = await supabase
        .from('user_followers')
        .select()
        .eq('follower_id', userId)
        .eq('following_id', currentUserId)
        .single();

      if (followingData && followerData) {
        setFollowStatus('mutual');
      } else if (followingData) {
        setFollowStatus('following');
      } else if (followerData) {
        setFollowStatus('follower');
      } else {
        setFollowStatus('none');
      }
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const loadFollowCounts = async () => {
    try {
      // Count followers
      const { count: followersCount, error: followersError } = await supabase
        .from('user_followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      if (!followersError && followersCount !== null) {
        setFollowersCount(followersCount);
      }

      // Count following
      const { count: followingCount, error: followingError } = await supabase
        .from('user_followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      if (!followingError && followingCount !== null) {
        setFollowingCount(followingCount);
      }
    } catch (error) {
      console.error("Error loading follow counts:", error);
    }
  };

  const handleFollowAction = async () => {
    if (!currentUserId) return;
    
    setIsActionLoading(true);
    try {
      if (followStatus === 'following' || followStatus === 'mutual') {
        // Unfollow
        const { error } = await supabase
          .from('user_followers')
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', userId);

        if (error) {
          console.error("Error unfollowing:", error);
          toast.error("Failed to unfollow user");
          return;
        }

        setFollowStatus(followStatus === 'mutual' ? 'follower' : 'none');
        setFollowersCount(prev => prev - 1);
        toast.success("Unfollowed successfully");
      } else {
        // Follow
        const { error } = await supabase
          .from('user_followers')
          .insert({
            follower_id: currentUserId,
            following_id: userId
          });

        if (error) {
          console.error("Error following:", error);
          toast.error("Failed to follow user");
          return;
        }

        setFollowStatus(followStatus === 'follower' ? 'mutual' : 'following');
        setFollowersCount(prev => prev + 1);
        toast.success("Followed successfully");
      }
    } catch (error) {
      console.error("Follow action error:", error);
      toast.error("Action failed");
    } finally {
      setIsActionLoading(false);
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

  const getFollowButtonText = () => {
    switch(followStatus) {
      case 'mutual':
        return 'Unfollow (Mutual)';
      case 'following':
        return 'Unfollow';
      case 'follower':
        return 'Follow Back';
      default:
        return 'Follow';
    }
  };

  const getFollowButtonIcon = () => {
    if (followStatus === 'following' || followStatus === 'mutual') {
      return <UserMinus className="h-4 w-4 mr-2" />;
    }
    return <UserPlus className="h-4 w-4 mr-2" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="container mx-auto px-4 py-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-coffee-dark" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">User not found</p>
            <button 
              onClick={() => navigate('/users')} 
              className="mt-4 text-coffee-dark hover:underline"
            >
              Browse users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      
      <div className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-coffee-light flex items-center justify-center text-coffee-dark text-3xl font-bold overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.username} 
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.username.substring(0, 2).toUpperCase()
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              
              {followStatus !== 'none' && (
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  {followStatus === 'mutual' && (
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      You follow each other
                    </span>
                  )}
                  {followStatus === 'following' && (
                    <span className="flex items-center">
                      <UserPlus className="h-4 w-4 mr-1" />
                      You're following
                    </span>
                  )}
                  {followStatus === 'follower' && (
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      Follows you
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex flex-wrap gap-6 mt-4">
                <div>
                  <div className="font-bold text-xl">{checkInsCount}</div>
                  <div className="text-sm text-gray-600">Check-ins</div>
                </div>
                <div>
                  <div className="font-bold text-xl">{followersCount}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div>
                  <div className="font-bold text-xl">{followingCount}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleFollowAction}
              disabled={isActionLoading}
              variant={followStatus === 'following' || followStatus === 'mutual' ? "outline" : "default"}
              className={followStatus === 'following' || followStatus === 'mutual' ? "border-coffee-dark text-coffee-dark hover:bg-coffee-light/20" : "bg-coffee-dark hover:bg-coffee-dark/90"}
            >
              {isActionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                getFollowButtonIcon()
              )}
              {getFollowButtonText()}
            </Button>
          </div>
        </div>
        
        {/* Check-ins */}
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Coffee className="h-5 w-5 mr-2" />
          Coffee Check-ins
        </h2>
        
        {checkIns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checkIns.map((checkIn) => (
              <CoffeeCard
                key={checkIn.id}
                {...checkIn}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No coffee check-ins yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

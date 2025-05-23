
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import MainNav from "@/components/MainNav";
import { toast } from "@/components/ui/sonner";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useUserCheckIns } from "@/hooks/useUserCheckIns";
import { supabase } from "@/integrations/supabase/client";
import LoadingState from "@/components/profile/LoadingState";
import AuthProfileHeader from "@/components/profile/AuthProfileHeader";
import FriendsList from "@/components/profile/FriendsList";
import CoffeeCard from "@/components/CoffeeCard";
import { useFollowData } from "@/hooks/useFollowData";
import { UserProfile } from "@/types/user";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("check-ins");
  
  const {
    profile,
    loading: authLoading,
    stats,
    handleSignOut
  } = useAuthProfile();

    const { 
      followers, 
      following, 
      loading: followLoading, 
      loadFollowData,
      handleFollowAction,
      setNeedsReload 
    } = useFollowData(profile?.id);
    
    const [mutualFriends, setMutualFriends] = useState<UserProfile[]>([]);  
    
    const { checkIns, checkInsCount, setCheckIns } = useUserCheckIns(profile?.id);

  useEffect(() => {
    const initialize = async () => {
      if (profile?.id) {
        await loadFollowData(profile?.id);
        if (followers && following) {
          const mutual = followers
            .filter(follower => 
              following.some(follow => follow.id === follower.id)
            )
            .map(follower => ({
              ...follower,
              status: 'friend' as const
            }));
          setMutualFriends(mutual);

        }
      }
    };

    initialize();
  }, [profile]);

  const handleDeleteCheckIn = async (checkInId: string) => {
    try {
      const { error } = await supabase
        .from('coffee_check_ins')
        .delete()
        .eq('id', checkInId);
        
      if (error) {
        console.error("Error deleting check-in:", error);
        toast.error("Failed to delete check-in");
        return;
      }
      
      // Optimistic UI update - remove the deleted check-in from state
      const updatedCheckIns = checkIns.filter(checkIn => checkIn.id !== checkInId);
      setCheckIns(updatedCheckIns);
      
      toast.success("Your coffee check-in has been successfully removed.");
    } catch (error) {
      console.error("Error deleting check-in:", error);
      toast.error("Failed to delete check-in");
    }
  };

  if (authLoading || followLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <span className="container mx-auto px-4 py-6">authLoading {authLoading  ? 'true' : 'false'} 
          | followLoading {followLoading ?  'true' : 'false'}</span>
        <LoadingState />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">User profile not found</p>
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
        <AuthProfileHeader 
          profile={profile}
          stats={stats}
          onSignOut={handleSignOut}
        />
        
        {/* Tabs for Check-ins and Friends */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="check-ins">
              <Coffee className="w-4 h-4 mr-2" />
              Check-ins
            </TabsTrigger>
            <TabsTrigger value="mutual">
              Mutual
            </TabsTrigger>
            <TabsTrigger value="followers">
              Followers
            </TabsTrigger>
            <TabsTrigger value="following">
              Following
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="check-ins">
            {checkIns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checkIns.map((checkIn) => (
                  <CoffeeCard
                    key={checkIn.id}
                    {...checkIn}
                    onDelete={handleDeleteCheckIn}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No coffee check-ins yet</p>
                <Button 
                  onClick={() => window.location.href = "/check-in"} 
                  className="mt-4"
                >
                  Create your first check-in
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="mutual">
            <FriendsList 
              friends={mutualFriends}
              variant="full"
              onAction={handleFollowAction}
            />
          </TabsContent>
          
          <TabsContent value="followers">
            <FriendsList 
              friends={followers}
              variant="full"
              onAction={handleFollowAction}
            />
          </TabsContent> 
          
          <TabsContent value="following">
            <FriendsList 
              friends={following}
              variant="full"
              onAction={handleFollowAction}
            />
          </TabsContent>  
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;

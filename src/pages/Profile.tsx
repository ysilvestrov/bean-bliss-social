
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Coffee, Settings, LogOut } from "lucide-react";
import MainNav from "@/components/MainNav";
import CoffeeCard from "@/components/CoffeeCard";
import FriendCard from "@/components/FriendCard";
import { toast } from "@/components/ui/sonner";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useUserCheckIns } from "@/hooks/useUserCheckIns";
import { formatDate } from "@/utils/formatting";
import LoadingState from "@/components/profile/LoadingState";

// Define the correct type for status
type FriendStatus = "friend" | "pending" | "none";

// Mock friends with correct status types
const mockFriends = [
  {
    id: "f1",
    name: "Alex Johnson",
    username: "alexj",
    initials: "AJ",
    status: "friend" as FriendStatus,
    checkIns: 89,
    avatar: "https://i.pravatar.cc/150?u=alexj"
  },
  {
    id: "f2",
    name: "Sam Taylor",
    username: "samt",
    initials: "ST",
    status: "friend" as FriendStatus,
    checkIns: 56
  },
  {
    id: "f3",
    name: "Jordan Lee",
    username: "jlee",
    initials: "JL",
    status: "friend" as FriendStatus,
    checkIns: 124,
    avatar: "https://i.pravatar.cc/150?u=jlee"
  }
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("check-ins");
  const [friends, setFriends] = useState(mockFriends);
  
  const {
    profile,
    loading,
    stats,
    handleSignOut
  } = useAuthProfile();
  
  const { checkIns, checkInsCount } = useUserCheckIns(profile?.id);

  const handleDeleteCheckIn = async (checkInId: string) => {
    try {
      const { error } = await supabase
        .from('coffee_check_ins')
        .delete()
        .eq('id', checkInId);
        
      if (error) {
        console.error("Error deleting check-in:", error);
        toast({
          title: "Error",
          description: "Failed to delete check-in",
          variant: "destructive"
        });
        return;
      }
      
      // Optimistic UI update - remove the deleted check-in from state
      const updatedCheckIns = checkIns.filter(checkIn => checkIn.id !== checkInId);
      setCheckIns(updatedCheckIns);
      
      toast({
        title: "Check-in deleted.",
        description: "Your coffee check-in has been successfully removed."
      });
    } catch (error) {
      console.error("Error deleting check-in:", error);
      toast({
        title: "Error",
        description: "Failed to delete check-in",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <LoadingState />;
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

  const joinDate = formatDate(profile.created_at);

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
              <p className="text-gray-600">@{profile.username}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span>Joined {joinDate}</span>
              </div>
              <div className="flex flex-wrap gap-6 mt-4">
                <div>
                  <div className="font-bold text-xl">{stats.checkInsCount}</div>
                  <div className="text-sm text-gray-600">Check-ins</div>
                </div>
                <div>
                  <div className="font-bold text-xl">{stats.followersCount}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div>
                  <div className="font-bold text-xl">{stats.followingCount}</div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 hover:text-red-600"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tabs for Check-ins and Friends */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="check-ins">
              <Coffee className="w-4 h-4 mr-2" />
              Check-ins
            </TabsTrigger>
            <TabsTrigger value="friends">
              Friends
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
          
          <TabsContent value="friends">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  variant="compact"
                  {...friend}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;

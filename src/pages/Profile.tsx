import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Coffee, Settings, LogOut } from "lucide-react";
import MainNav from "@/components/MainNav";
import CoffeeCard from "@/components/CoffeeCard";
import FriendCard from "@/components/FriendCard";
import { useToast } from "@/components/ui/use-toast";

// Define the correct type for status
type FriendStatus = "friend" | "pending" | "none";

// Mock data for the profile
const profileData = {
  id: "user1",
  name: "Jamie Coffee",
  username: "coffeelover",
  avatar: "https://i.pravatar.cc/150?u=jamie",
  bio: "Coffee enthusiast and home barista. Always searching for the perfect cup!",
  location: "Seattle, WA",
  joinDate: "January 2023",
  checkInCount: 127,
  friendsCount: 43
};

// Mock coffee check-ins with correct status types
const mockCheckIns = [
  {
    id: "c1",
    coffeeType: "Ethiopian Yirgacheffe",
    roaster: "Heart Coffee Roasters",
    location: "Home Brew",
    method: "Pour Over",
    rating: 4.5,
    date: "2025-05-06T08:30:00",
    image: "https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c",
    notes: "Floral notes with a hint of blueberry. Perfect morning cup."
  },
  {
    id: "c2",
    coffeeType: "Colombian Supremo",
    roaster: "Stumptown Coffee",
    location: "Coffee Bar Downtown",
    method: "Espresso",
    rating: 5,
    date: "2025-05-04T14:15:00",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd",
    notes: "Best espresso I've had in months! Caramel sweetness with a smooth finish."
  },
  {
    id: "c3",
    coffeeType: "Sumatra Mandheling",
    roaster: "Blue Bottle",
    location: "Work",
    method: "French Press",
    rating: 3.5,
    date: "2025-05-01T10:45:00",
    notes: "Earthy and full-bodied. A bit too intense for my taste but good quality."
  }
];

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
  const [checkIns, setCheckIns] = useState(mockCheckIns);
  const [friends, setFriends] = useState(mockFriends);
  const { toast } = useToast();

  const handleDeleteCheckIn = (checkInId: string) => {
    setCheckIns(checkIns.filter((checkIn) => checkIn.id !== checkInId));
    toast({
      title: "Check-in deleted.",
      description: "Your coffee check-in has been successfully removed.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      
      <div className="container mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-coffee-light flex items-center justify-center text-coffee-dark text-3xl font-bold overflow-hidden">
              {profileData.avatar ? (
                <img 
                  src={profileData.avatar} 
                  alt={profileData.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                profileData.name.substring(0, 2).toUpperCase()
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{profileData.name}</h1>
              <p className="text-gray-600">@{profileData.username}</p>
              <p className="mt-2">{profileData.bio}</p>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                {profileData.location && (
                  <span>{profileData.location}</span>
                )}
                <span>Joined {profileData.joinDate}</span>
              </div>
              <div className="flex flex-wrap gap-6 mt-4">
                <div>
                  <div className="font-bold text-xl">{profileData.checkInCount}</div>
                  <div className="text-sm text-gray-600">Check-ins</div>
                </div>
                <div>
                  <div className="font-bold text-xl">{profileData.friendsCount}</div>
                  <div className="text-sm text-gray-600">Friends</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checkIns.map((checkIn) => (
                <CoffeeCard
                  key={checkIn.id}
                  checkIn={checkIn}
                  onDelete={handleDeleteCheckIn}
                />
              ))}
            </div>
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

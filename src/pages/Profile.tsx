
import React, { useState } from "react";
import MainNav from "@/components/MainNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CoffeeCard from "@/components/CoffeeCard";
import { Coffee, Settings, User, UserPlus } from "lucide-react";
import FriendCard from "@/components/FriendCard";

// Mock user data
const user = {
  id: "current-user",
  name: "Alex Morgan",
  username: "alexMorgan",
  avatar: null,
  initials: "AM",
  bio: "Coffee enthusiast. Pour-over specialist. Always searching for the perfect cup.",
  checkIns: 24,
  friends: 8,
};

// Mock check-ins
const userCheckIns = [
  {
    id: "u1",
    userName: user.username,
    userInitials: user.initials,
    coffeeImage: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
    coffeeName: "Kenya AA",
    roastery: "Intelligentsia",
    brewMethod: "Chemex",
    location: "Home Brewing",
    rating: 5,
    comment: "Bright acidity, berry notes. Perfect morning cup!",
    timestamp: "3 days ago"
  },
  {
    id: "u2",
    userName: user.username,
    userInitials: user.initials,
    coffeeImage: "https://images.unsplash.com/photo-1521302080334-4bebac2763a6",
    coffeeName: "Sumatra Mandheling",
    roastery: "Stumptown",
    brewMethod: "French Press",
    location: "Weekend Retreat",
    rating: 4,
    comment: "Earthy, full-bodied. Great with breakfast.",
    timestamp: "1 week ago"
  }
];

// Mock friends for user profile
const userFriends = [
  { 
    id: "f1", 
    name: "Sarah Johnson", 
    username: "coffeeNerd42", 
    initials: "SJ", 
    status: "friend", 
    checkIns: 42,
  },
  { 
    id: "f2", 
    name: "Michael Chen", 
    username: "espressoLover", 
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde", 
    initials: "MC", 
    status: "friend", 
    checkIns: 18,
  },
  { 
    id: "f3", 
    name: "Jessica Wong", 
    username: "brewMaster", 
    initials: "JW", 
    status: "friend", 
    checkIns: 86,
  }
];

const Profile = () => {
  const [checkIns, setCheckIns] = useState(userCheckIns);
  const [friends, setFriends] = useState(userFriends);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <MainNav />
      
      <div className="container max-w-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          {/* Profile header/banner */}
          <div className="h-24 bg-gradient-to-r from-coffee-dark to-coffee-medium" />
          
          {/* Profile info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col items-center -mt-12">
              <Avatar className="h-24 w-24 border-4 border-white">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} />
                ) : (
                  <AvatarFallback className="bg-coffee-accent text-white text-xl">
                    {user.initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <h1 className="mt-4 text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-500">@{user.username}</p>
              
              <div className="flex space-x-4 mt-4">
                <div className="text-center">
                  <p className="font-semibold">{user.checkIns}</p>
                  <p className="text-sm text-gray-500">Check-ins</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{user.friends}</p>
                  <p className="text-sm text-gray-500">Friends</p>
                </div>
              </div>
              
              {user.bio && (
                <p className="text-center mt-4 text-gray-600 max-w-md">
                  {user.bio}
                </p>
              )}
              
              <div className="mt-6 flex space-x-3">
                <Button variant="outline" className="flex items-center" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="checkIns">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="checkIns" className="flex-1">
              <Coffee className="h-4 w-4 mr-2" />
              Check-ins
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex-1">
              <User className="h-4 w-4 mr-2" />
              Friends
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="checkIns" className="space-y-6">
            {checkIns.length === 0 ? (
              <div className="text-center py-8">
                <Coffee className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No check-ins yet.</p>
                <Button className="mt-4 bg-coffee-dark hover:bg-coffee-dark/90">
                  Add Your First Check-in
                </Button>
              </div>
            ) : (
              checkIns.map((checkIn) => (
                <CoffeeCard key={checkIn.id} {...checkIn} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="friends" className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No friends yet.</p>
                <Button className="mt-4">Find Friends</Button>
              </div>
            ) : (
              friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  {...friend}
                  variant="compact"
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;

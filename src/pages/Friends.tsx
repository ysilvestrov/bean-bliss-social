
import React, { useState } from "react";
import MainNav from "@/components/MainNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import FriendCard from "@/components/FriendCard";

// Mock data
const friendsList = [
  { 
    id: "1", 
    name: "Sarah Johnson", 
    username: "coffeeNerd42", 
    initials: "SJ", 
    status: "friend", 
    checkIns: 42 
  },
  { 
    id: "2", 
    name: "Michael Chen", 
    username: "espressoLover", 
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde", 
    initials: "MC", 
    status: "friend", 
    checkIns: 18 
  },
  { 
    id: "3", 
    name: "Jessica Wong", 
    username: "brewMaster", 
    initials: "JW", 
    status: "friend", 
    checkIns: 86 
  }
];

const pendingRequests = [
  { 
    id: "4", 
    name: "David Miller", 
    username: "millerTime", 
    initials: "DM", 
    status: "pending", 
    checkIns: 0 
  },
  { 
    id: "5", 
    name: "Sophia Garcia", 
    username: "sophiaG", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330", 
    initials: "SG", 
    status: "pending", 
    checkIns: 23 
  }
];

const suggestedFriends = [
  { 
    id: "6", 
    name: "Alex Turner", 
    username: "alexT", 
    initials: "AT", 
    status: "none", 
    checkIns: 14 
  },
  { 
    id: "7", 
    name: "Emma Wilson", 
    username: "emmaW", 
    avatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56", 
    initials: "EW", 
    status: "none", 
    checkIns: 31 
  },
  { 
    id: "8", 
    name: "Ryan Johnson", 
    username: "ryanJ", 
    initials: "RJ", 
    status: "none", 
    checkIns: 5 
  }
];

const Friends = () => {
  const [friends, setFriends] = useState(friendsList);
  const [pending, setPending] = useState(pendingRequests);
  const [suggested, setSuggested] = useState(suggestedFriends);
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleFriendAction = (id: string, action: 'add' | 'accept' | 'remove') => {
    if (action === 'add') {
      const friendToAdd = suggested.find(f => f.id === id);
      if (friendToAdd) {
        setSuggested(suggested.filter(f => f.id !== id));
        setPending([...pending, {...friendToAdd, status: 'pending' as const}]);
      }
    } 
    else if (action === 'accept') {
      const friendToAccept = pending.find(f => f.id === id);
      if (friendToAccept) {
        setPending(pending.filter(f => f.id !== id));
        setFriends([...friends, {...friendToAccept, status: 'friend' as const}]);
      }
    }
    else if (action === 'remove') {
      setPending(pending.filter(f => f.id !== id));
      setFriends(friends.filter(f => f.id !== id));
      // If we want to put them back in suggested:
      // const removedFromPending = pending.find(f => f.id === id);
      // if (removedFromPending) {
      //   setSuggested([...suggested, {...removedFromPending, status: 'none' as const}]);
      // }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <MainNav />
      
      <div className="container max-w-xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-coffee-dark mb-6">Friends</h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search friends..."
            className="pl-10 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="myFriends">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="myFriends" className="flex-1">
              My Friends
              <span className="ml-1 text-xs bg-coffee-light/20 text-coffee-dark px-2 py-0.5 rounded-full">
                {friends.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">
              Requests
              {pending.length > 0 && (
                <span className="ml-1 text-xs bg-coffee-accent/20 text-coffee-accent px-2 py-0.5 rounded-full">
                  {pending.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggested" className="flex-1">
              Suggested
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="myFriends" className="space-y-4">
            {friends.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You haven't added any friends yet.</p>
              </div>
            ) : (
              friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  {...friend}
                  onAction={handleFriendAction}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            {pending.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No pending friend requests.</p>
              </div>
            ) : (
              pending.map((friend) => (
                <FriendCard
                  key={friend.id}
                  {...friend}
                  onAction={handleFriendAction}
                />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="suggested" className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">People you might know:</p>
            {suggested.map((friend) => (
              <FriendCard
                key={friend.id}
                {...friend}
                onAction={handleFriendAction}
              />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Friends;

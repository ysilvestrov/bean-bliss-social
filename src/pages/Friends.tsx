import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import MainNav from "@/components/MainNav";
import FriendCard from "@/components/FriendCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

// Let's define the correct type for status
type FriendStatus = "friend" | "follower" | "following" | "none" | "self";

// Define the mock data with correct status types
const mockFriends = [
  {
    id: "1",
    name: "Alex Johnson",
    username: "alexj",
    initials: "AJ",
    status: "friend" as FriendStatus,
    checkIns: 124,
    avatar: "https://i.pravatar.cc/150?u=alexj"
  },
  {
    id: "2",
    name: "Sam Taylor",
    username: "samt",
    initials: "ST",
    status: "friend" as FriendStatus,
    checkIns: 78
  },
  {
    id: "3",
    name: "Jordan Lee",
    username: "jlee",
    initials: "JL",
    status: "friend" as FriendStatus,
    checkIns: 203,
    avatar: "https://i.pravatar.cc/150?u=jlee"
  },
  {
    id: "4",
    name: "Casey Morgan",
    username: "cmorg",
    initials: "CM",
    status: "friend" as FriendStatus,
    checkIns: 56
  },
  {
    id: "5",
    name: "Riley Quinn",
    username: "rileyq",
    initials: "RQ",
    status: "friend" as FriendStatus,
    checkIns: 189,
    avatar: "https://i.pravatar.cc/150?u=rileyq"
  }
];

const mockPending = [
  {
    id: "6",
    name: "Jamie Smith",
    username: "jamies",
    initials: "JS",
    status: "pending" as FriendStatus,
    checkIns: 45
  },
  {
    id: "7",
    name: "Blake Wilson",
    username: "bwilson",
    initials: "BW",
    status: "pending" as FriendStatus,
    checkIns: 112,
    avatar: "https://i.pravatar.cc/150?u=bwilson"
  }
];

const mockSuggestions = [
  {
    id: "8",
    name: "Taylor Reed",
    username: "treed",
    initials: "TR",
    status: "none" as FriendStatus,
    checkIns: 64
  },
  {
    id: "9",
    name: "Cameron White",
    username: "cwhite",
    initials: "CW",
    status: "none" as FriendStatus,
    checkIns: 93,
    avatar: "https://i.pravatar.cc/150?u=cwhite"
  },
  {
    id: "10",
    name: "Jordan Ellis",
    username: "jellis",
    initials: "JE",
    status: "none" as FriendStatus,
    checkIns: 127
  }
];

const Friends = () => {
  const [friends, setFriends] = useState(mockFriends);
  const [pendingFriends, setPendingFriends] = useState(mockPending);
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleFriendAction = (id: string, action: string) => {
    if (action === "accept") {
      // Move from pending to friends
      const friendToAccept = pendingFriends.find((friend) => friend.id === id);
      if (friendToAccept) {
        setFriends([...friends, { ...friendToAccept, status: "friend" }]);
        setPendingFriends(pendingFriends.filter((friend) => friend.id !== id));
        toast({
          title: "Friend Request Accepted!",
          description: `You are now friends with ${friendToAccept.name}.`,
        });
      }
    } else if (action === "reject") {
      // Remove from pending
      const friendToRemove = pendingFriends.find((friend) => friend.id === id);
      if (friendToRemove) {
        setPendingFriends(pendingFriends.filter((friend) => friend.id !== id));
        toast({
          title: "Friend Request Rejected",
          description: `You have rejected the friend request from ${friendToRemove.name}.`,
        });
      }
    } else if (action === "add") {
      // Move from suggestions to pending
      const friendToAdd = suggestions.find((friend) => friend.id === id);
      if (friendToAdd) {
        setPendingFriends([...pendingFriends, { ...friendToAdd, status: "none" }]);
        setSuggestions(suggestions.filter((friend) => friend.id !== id));
        toast({
          title: "Friend Request Sent!",
          description: `You have sent a friend request to ${friendToAdd.name}.`,
        });
      }
    } else if (action === "remove") {
      // Remove from friends
      const friendToRemove = friends.find((friend) => friend.id === id);
      if (friendToRemove) {
        setFriends(friends.filter((friend) => friend.id !== id));
        toast({
          title: "Friend Removed",
          description: `You have removed ${friendToRemove.name} from your friends.`,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Friends</h1>
        
        <div className="mb-6">
          <Input
            type="search"
            placeholder="Search for friends..."
            className="max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="friends" className="mb-6">
          <TabsList>
            <TabsTrigger value="friends">
              My Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingFriends.length})
            </TabsTrigger>
            <TabsTrigger value="suggestions">
              Suggestions ({suggestions.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  onAction={handleFriendAction}
                  {...friend}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  onAction={handleFriendAction}
                  {...friend}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="suggestions" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((friend) => (
                <FriendCard
                  key={friend.id}
                  onAction={handleFriendAction}
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

export default Friends;

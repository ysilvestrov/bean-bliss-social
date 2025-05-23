import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import MainNav from "@/components/MainNav";
import FriendCard from "@/components/FriendCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { FriendAction, FollowStatus as FriendStatus } from "@/types/user";

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  initials: string;
  status: FriendStatus;
}

const Friends = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingFriends, setPendingFriends] = useState<Friend[]>([]);
  const [suggestions, setSuggestions] = useState<Friend[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const handleFriendAction = (id: string, action: FriendAction) => {
    switch (action) {
      case "accept":
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
        break;
      case "remove":
        // Remove from friends
        const friendToRemove = friends.find((friend) => friend.id === id);
        if (friendToRemove) {
          setFriends(friends.filter((friend) => friend.id !== id));
          toast({
            title: "Friend Removed",
            description: `You have removed ${friendToRemove.name} from your friends.`,
          });
        }
        break;
      case "follow":
        // Move from suggestions to pending
        const friendToAdd = suggestions.find((friend) => friend.id === id);
        if (friendToAdd) {
          setPendingFriends([...pendingFriends, { ...friendToAdd, status: "following" }]);
          setSuggestions(suggestions.filter((friend) => friend.id !== id));
          toast({
            title: "Following User",
            description: `You are now following ${friendToAdd.name}.`,
          });
        }
        break;
      default:
        console.error(`Unsupported action: ${action}`);
        break;
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

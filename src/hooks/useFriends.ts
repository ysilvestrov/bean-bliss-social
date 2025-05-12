
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

// Define the correct type for status
export type FriendStatus = "friend" | "pending" | "none";

// Define the friend type
export interface Friend {
  id: string;
  name: string;
  username: string;
  initials: string;
  status: FriendStatus;
  checkIns: number;
  avatar?: string;
}

export const useFriends = () => {
  // Mock friends with correct status types - will be replaced with API call in future
  const initialFriends = [
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

  const [friends, setFriends] = useState<Friend[]>(initialFriends);

  const handleFriendAction = (friendId: string, action: 'add' | 'accept' | 'remove') => {
    // To be implemented with real API in future
    toast({
      description: `Action "${action}" on friend ID: ${friendId}`
    });
  };

  return {
    friends,
    handleFriendAction
  };
};

import React from "react";
import FriendCard from "@/components/FriendCard";
import { FriendAction, UserProfile } from "@/types/user";

interface FriendsListProps {
  friends: UserProfile[];
  variant?: "compact" | "full";
  onAction?: (id: string, action: FriendAction) => void;
}

const FriendsList: React.FC<FriendsListProps> = ({ friends, variant = "compact", onAction }) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">Friends</h2>
      
      {friends.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {friends.map((friend) => (
            <FriendCard
              key={friend.id}
              variant={variant}
              {...friend}
              onAction={onAction}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No friends yet</p>
        </div>
      )}
    </>
  );
};

export default FriendsList;

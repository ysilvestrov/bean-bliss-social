
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Coffee, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { FollowStatus, FriendAction } from "@/types/user";

interface FriendCardProps {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  initials: string;
  status?: FollowStatus;
  checkIns?: number;
  variant?: "compact" | "full";
  className?: string;
  onAction?: (id: string, action: FriendAction) => void;
}

const FriendCard = ({
  id,
  name,
  username,
  avatar,
  initials,
  status = "none",
  checkIns = 0,
  variant = "full",
  className,
  onAction
}: FriendCardProps) => {
  return (
    <div className={cn(
      "bg-white rounded-lg border p-4 flex",
      variant === "compact" ? "items-center" : "flex-col",
      className
    )}>
      <div className={cn(
        "flex",
        variant === "compact" ? "items-center flex-1" : "items-center mb-4"
      )}>
        <Avatar className={cn(variant === "compact" ? "h-10 w-10" : "h-16 w-16")}>
          {avatar ? (
            <AvatarImage src={avatar} alt={name} />
          ) : (
            <AvatarFallback className="bg-coffee-medium text-white">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className={variant === "compact" ? "ml-3" : "ml-4"}>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-gray-500">@{username}</p>
          {variant === "full" && checkIns > 0 && (
            <p className="text-sm mt-1 flex items-center">
              <Coffee className="h-3.5 w-3.5 mr-1" />
              {checkIns} check-in{checkIns !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {variant === "full" && (
        <div className="mt-auto w-full">
          {status === "none" && (
            <Button 
              variant="outline" 
              className="w-full hover:bg-coffee-light/20 border-coffee-light hover:text-coffee-dark"
              onClick={() => onAction?.(id, 'follow')}
            >
              <User className="h-4 w-4 mr-2" />
              Follow
            </Button>
          )}
          
          {status === "follower" && (
            <div className="flex gap-2">
              <Button 
                variant="default" 
                className="flex-1 bg-coffee-dark hover:bg-coffee-dark/90"
                onClick={() => onAction?.(id, 'follow')}
              >
                Follow Back
              </Button>
            </div>
          )}
          
          {(status === "friend" || status === "following") && (
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onAction?.(id, 'remove')}
            >
              Unfollow
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendCard;

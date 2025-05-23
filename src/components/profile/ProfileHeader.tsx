
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Users, UserPlus, UserMinus, User } from "lucide-react";
import { FollowStatus } from "@/hooks/useUserProfile";

interface ProfileHeaderProps {
  username: string;
  avatarUrl: string | null;
  followStatus: FollowStatus;
  followersCount: number;
  followingCount: number;
  checkInsCount: number;
  isActionLoading: boolean;
  onFollowAction: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  avatarUrl,
  followStatus,
  followersCount,
  followingCount,
  checkInsCount,
  isActionLoading,
  onFollowAction
}) => {
  const getFollowButtonText = () => {
    switch(followStatus) {
      case 'mutual':
        return 'Unfollow';
      case 'following':
        return 'Unfollow';
      case 'follower':
        return 'Follow Back';
      default:
        return 'Follow';
    }
  };

  const getFollowButtonIcon = () => {
    if (followStatus === 'following' || followStatus === 'mutual') {
      return <UserMinus className="h-4 w-4 mr-2" />;
    }
    return <UserPlus className="h-4 w-4 mr-2" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-24 h-24 rounded-full bg-coffee-light flex items-center justify-center text-coffee-dark text-3xl font-bold overflow-hidden">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={username} 
              className="w-full h-full object-cover"
            />
          ) : (
            username.substring(0, 2).toUpperCase()
          )}
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{username}</h1>
          
          {followStatus !== 'none' && (
            <div className="mt-1 flex items-center text-sm text-gray-500">
              {followStatus === 'mutual' && (
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  You follow each other
                </span>
              )}
              {followStatus === 'following' && (
                <span className="flex items-center">
                  <UserPlus className="h-4 w-4 mr-1" />
                  You're following
                </span>
              )}
              {followStatus === 'follower' && (
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Follows you
                </span>
              )}
            </div>
          )}
          
          <div className="flex flex-wrap gap-6 mt-4">
            <div>
              <div className="font-bold text-xl">{checkInsCount}</div>
              <div className="text-sm text-gray-600">Check-ins</div>
            </div>
            <div>
              <div className="font-bold text-xl">{followersCount}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div>
              <div className="font-bold text-xl">{followingCount}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onFollowAction}
          disabled={isActionLoading}
          variant={followStatus === 'following' || followStatus === 'mutual' ? "outline" : "default"}
          className={followStatus === 'following' || followStatus === 'mutual' ? "border-coffee-dark text-coffee-dark hover:bg-coffee-light/20 hover:text-coffee-dark" : "bg-coffee-dark hover:bg-coffee-dark/90"}
        >
          {isActionLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            getFollowButtonIcon()
          )}
          {getFollowButtonText()}
        </Button>
      </div>
    </div>
  );
};

export default ProfileHeader;

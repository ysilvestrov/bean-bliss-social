
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { AuthProfileData } from "@/hooks/useAuthProfile";
import { formatDate } from "@/utils/formatting";
import { Link } from "react-router-dom";

interface AuthProfileHeaderProps {
  profile: AuthProfileData;
  stats: {
    checkInsCount: number;
    followersCount: number;
    followingCount: number;
  };
  onSignOut: () => Promise<void>;
}

const AuthProfileHeader: React.FC<AuthProfileHeaderProps> = ({
  profile,
  stats,
  onSignOut
}) => {
  const joinDate = formatDate(profile.created_at);
  
  return (
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
          <Button variant="outline" size="sm" asChild>
            <Link to="/profile/edit">
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500 hover:text-red-600"
            onClick={onSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthProfileHeader;

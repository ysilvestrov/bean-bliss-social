
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainNav from "@/components/MainNav";
import ProfileHeader from "@/components/profile/ProfileHeader";
import CheckInsList from "@/components/profile/CheckInsList";
import LoadingState from "@/components/profile/LoadingState";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserCheckIns } from "@/hooks/useUserCheckIns";

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  const {
    profile,
    loading,
    followStatus,
    stats,
    isActionLoading,
    handleFollowAction
  } = useUserProfile(userId);
  
  const { checkIns } = useUserCheckIns(userId);

  if (loading) {
    return <LoadingState />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">User not found</p>
            <button 
              onClick={() => navigate('/users')} 
              className="mt-4 text-coffee-dark hover:underline"
            >
              Browse users
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      
      <div className="container mx-auto px-4 py-6">
        <ProfileHeader
          username={profile.username}
          avatarUrl={profile.avatar_url}
          followStatus={followStatus}
          followersCount={stats.followersCount}
          followingCount={stats.followingCount}
          checkInsCount={stats.checkInsCount}
          isActionLoading={isActionLoading}
          onFollowAction={handleFollowAction}
        />
        
        <CheckInsList 
          checkIns={checkIns}
        />
      </div>
    </div>
  );
};

export default UserProfile;


import { useAuth, AuthProfileData } from "./useAuth";
import { useProfileStats } from "./useProfileStats";

export type { AuthProfileData };

export const useAuthProfile = () => {
  const { profile, loading, handleSignOut } = useAuth();
  const stats = useProfileStats(profile?.id);
  
  return {
    profile,
    loading,
    stats,
    handleSignOut
  };
};

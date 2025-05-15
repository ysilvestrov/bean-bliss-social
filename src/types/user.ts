export type FollowStatus = 'none' | 'friend' | 'follower' | 'mutual' | 'self';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  initials: string;
  status: FollowStatus;
}

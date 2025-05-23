export type FollowStatus = 'none' | 'friend' | 'follower' | 'following' | 'self';

export type FriendAction = 'add' | 'accept' | 'remove' | 'follow';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  initials: string;
  status: FollowStatus;
}

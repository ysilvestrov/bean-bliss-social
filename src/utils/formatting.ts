
/**
 * Common formatting utilities for user data and timestamps
 */

/**
 * Get user initials from username
 */
export const getUserInitials = (username: string) => {
  return username
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substr(0, 2);
};

/**
 * Format date relative to current time
 */
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMillis = now.getTime() - date.getTime();
  const diffInHours = diffInMillis / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInHours < 48) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString();
  }
};

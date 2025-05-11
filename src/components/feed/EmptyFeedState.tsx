
import React from "react";
import { useNavigate } from "react-router-dom";
import { FeedType } from "@/hooks/useFeed";

interface EmptyFeedStateProps {
  feedType: FeedType;
}

const EmptyFeedState = ({ feedType }: EmptyFeedStateProps) => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      {feedType === "following" ? (
        <>
          <p className="text-gray-500">You're not following anyone yet.</p>
          <button 
            onClick={() => navigate('/users')} 
            className="mt-4 text-coffee-dark hover:underline"
          >
            Find users to follow
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-500">No coffee check-ins found.</p>
          <button 
            onClick={() => navigate('/check-in')} 
            className="mt-4 text-coffee-dark hover:underline"
          >
            Create your first check-in!
          </button>
        </>
      )}
    </div>
  );
};

export default EmptyFeedState;

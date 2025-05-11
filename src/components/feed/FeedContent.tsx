
import React from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import CoffeeCard from "@/components/CoffeeCard";
import EmptyFeedState from "./EmptyFeedState";
import { FeedItem, FeedType } from "@/hooks/useFeed";

interface FeedContentProps {
  loading: boolean;
  feed: FeedItem[];
  feedType: FeedType;
}

const FeedContent = ({ loading, feed, feedType }: FeedContentProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-coffee-dark" />
      </div>
    );
  }

  if (feed.length === 0) {
    return <EmptyFeedState feedType={feedType} />;
  }

  return (
    <>
      {feed.map((item) => (
        <CoffeeCard 
          key={item.id} 
          {...item} 
          onUserClick={() => navigate(`/users/${item.userId}`)} 
        />
      ))}
    </>
  );
};

export default FeedContent;

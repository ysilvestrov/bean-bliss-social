
import React, { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CoffeeCard from "@/components/CoffeeCard";
import { FeedItem, FeedType } from "@/hooks/useFeed";
import EmptyFeedState from "./EmptyFeedState";

interface FeedContentProps {
  loading: boolean;
  feed: FeedItem[];
  feedType: FeedType;
}

const FeedContent = ({ loading, feed, feedType }: FeedContentProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set up real-time subscription for likes
    const channel = supabase
      .channel('public:coffee_likes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'coffee_likes' 
        }, 
        (payload) => {
          console.log('Real-time update received:', payload);
          // The actual like state is managed in the useLikes hook per component
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUserClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-coffee-dark" />
      </div>
    );
  }

  if (feed.length === 0) {
    return <EmptyFeedState feedType={feedType} />;
  }

  return (
    <div className="space-y-6">
      {feed.map(item => (
        <CoffeeCard 
          key={item.id}
          {...item}
          onUserClick={() => handleUserClick(item.userId)}
        />
      ))}
    </div>
  );
};

export default FeedContent;

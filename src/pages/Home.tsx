
import React from "react";
import MainNav from "@/components/MainNav";
import FeedContent from "@/components/feed/FeedContent";
import FeedTabs from "@/components/feed/FeedTabs";
import { useFeed } from "@/hooks/useFeed";

const Home = () => {
  const { feed, loading, feedType, setFeedType } = useFeed();

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <MainNav />
      
      <div className="container max-w-xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-coffee-dark">Feed</h1>
          <FeedTabs feedType={feedType} onChange={setFeedType} />
        </div>
        
        <FeedContent 
          loading={loading} 
          feed={feed} 
          feedType={feedType} 
        />
      </div>
    </div>
  );
};

export default Home;


import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedType } from "@/hooks/useFeed";

interface FeedTabsProps {
  feedType: FeedType;
  onChange: (value: FeedType) => void;
}

const FeedTabs = ({ feedType, onChange }: FeedTabsProps) => {
  return (
    <Tabs 
      value={feedType} 
      onValueChange={(value) => onChange(value as FeedType)}
      className="w-auto"
    >
      <TabsList>
        <TabsTrigger value="following">Following</TabsTrigger>
        <TabsTrigger value="discover">Discover</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default FeedTabs;

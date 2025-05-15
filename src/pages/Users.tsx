
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MainNav from "@/components/MainNav";
import FriendCard from "@/components/FriendCard";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useFollowData } from "@/hooks/useFollowData";
import { useUserSearch } from "@/hooks/useUserSearch";
import { UserProfile, FollowStatus } from "@/types/user";

const Users: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("search");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { 
    followers, 
    following, 
    loading, 
    loadFollowData,
    handleFollowAction 
  } = useFollowData(currentUserId);

  const { 
    searchResults, 
    isSearching, 
    performSearch 
  } = useUserSearch(currentUserId);

  useEffect(() => {
    const initialize = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
        loadFollowData(session.user.id);
      }
    };

    initialize();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <MainNav />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Users</h1>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
            <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="mt-4">
            <div className="flex gap-2 mb-6">
              <Input
                type="search"
                placeholder="Search for users..."
                className="max-w-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Search
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((user) => (
                  <FriendCard
                    key={user.id}
                    {...user}
                    onAction={(userId, action) => handleFollowAction(userId, action)}
                  />
                ))}
              </div>
            ) : searchTerm && !isSearching ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found matching "{searchTerm}"</p>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="followers" className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-dark" />
              </div>
            ) : followers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.map((follower) => (
                  <FriendCard
                    key={follower.id}
                    {...follower}
                    onAction={(userId, action) => handleFollowAction(userId, action)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No followers yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-coffee-dark" />
              </div>
            ) : following.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {following.map((follow) => (
                  <FriendCard
                    key={follow.id}
                    {...follow}
                    onAction={(userId, action) => handleFollowAction(userId, action)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Not following anyone yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Users;

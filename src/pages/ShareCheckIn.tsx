
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MainNav from "@/components/MainNav";
import CoffeeCard from "@/components/CoffeeCard";
import { FeedItem } from "@/hooks/useFeed";
import { getUserInitials, formatDate } from "@/utils/formatting";
import { Button } from "@/components/ui/button";

const ShareCheckIn = () => {
  const [searchParams] = useSearchParams();
  const checkInId = searchParams.get("id");
  const [checkIn, setCheckIn] = useState<FeedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCheckIn = async () => {
      if (!checkInId) {
        setError("No check-in ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('coffee_check_ins')
          .select(`
            *,
            profiles:user_id(
              username,
              avatar_url
            )
          `)
          .eq('id', checkInId)
          .single();

        if (error) {
          console.error("Error fetching check-in:", error);
          setError("Could not find the check-in you're looking for");
          setLoading(false);
          return;
        }

        if (!data) {
          setError("Check-in not found");
          setLoading(false);
          return;
        }

        // Format data for CoffeeCard
        const formattedCheckIn: FeedItem = {
          id: data.id,
          userId: data.user_id,
          userName: data.profiles?.username || "Coffee Lover",
          userInitials: getUserInitials(data.profiles?.username || "Coffee Lover"),
          userImage: data.profiles?.avatar_url || null,
          coffeeImage: data.image_url || null,
          coffeeName: data.coffee_name,
          roastery: data.roaster,
          brewMethod: data.brew_method,
          location: data.location || null,
          rating: data.rating,
          comment: data.notes || null,
          timestamp: formatDate(data.created_at)
        };

        setCheckIn(formattedCheckIn);
      } catch (error) {
        console.error("Error loading check-in:", error);
        setError("An error occurred while fetching the check-in");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckIn();
  }, [checkInId]);

  const handleUserProfileClick = () => {
    if (checkIn?.userId) {
      navigate(`/users/${checkIn.userId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      
      <div className="container max-w-xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-coffee-dark">Shared Coffee Check-in</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-coffee-dark" />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/home")}>
              Go to Home
            </Button>
          </div>
        ) : checkIn ? (
          <CoffeeCard 
            {...checkIn} 
            onUserClick={handleUserProfileClick}
          />
        ) : null}

        {!loading && !error && (
          <div className="mt-6 flex justify-center">
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate("/home")}
                variant="outline"
              >
                Explore More
              </Button>
              <Button 
                onClick={() => navigate("/check-in")}
              >
                Create Your Own
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareCheckIn;


import React from "react";
import { Link } from "react-router-dom";
import { Coffee, MapPin, Calendar, Share2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import StarRating from "./StarRating";

interface CheckInData {
  id: string;
  coffeeType: string;
  roaster: string;
  location: string;
  method: string;
  rating: number;
  date: string;
  image?: string;
  notes?: string;
}

interface CoffeeCardProps {
  id?: string;
  userId?: string;
  userName?: string;
  userImage?: string;
  coffeeImage?: string;
  coffeeName?: string;
  roastery?: string;
  brewMethod?: string;
  location?: string;
  rating?: number;
  comment?: string;
  timestamp?: string;
  userInitials?: string;
  // New prop to accept check-in data directly
  checkIn?: CheckInData;
  // Add onDelete for Profile page functionality
  onDelete?: (checkInId: string) => void;
  // Add onUserClick for navigating to user profile
  onUserClick?: () => void;
}

const CoffeeCard = ({
  id,
  userId,
  userName,
  userImage,
  coffeeImage,
  coffeeName,
  roastery,
  brewMethod,
  location,
  rating,
  comment,
  timestamp,
  userInitials,
  checkIn,
  onDelete,
  onUserClick,
}: CoffeeCardProps) => {
  // If checkIn prop is provided, use its values
  const checkInId = checkIn?.id || id;
  const displayCoffeeName = checkIn?.coffeeType || coffeeName;
  const displayRoastery = checkIn?.roaster || roastery;
  const displayBrewMethod = checkIn?.method || brewMethod;
  const displayLocation = checkIn?.location || location;
  const displayRating = checkIn?.rating || rating;
  const displayComment = checkIn?.notes || comment;
  const displayImage = checkIn?.image || coffeeImage;
  const displayTimestamp = checkIn?.date ? new Date(checkIn.date).toLocaleDateString() : timestamp;

  const handleShare = async () => {
    const shareData = {
      title: `${displayCoffeeName} by ${displayRoastery}`,
      text: `Check out this coffee: ${displayCoffeeName} by ${displayRoastery}, brewed with ${displayBrewMethod}. Rated ${displayRating}/5!`,
      url: window.location.origin + `/share?id=${checkInId}`
    };
    
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        // Use native sharing on mobile devices
        await navigator.share(shareData);
        toast({
          title: "Shared!",
          description: "Thanks for sharing this coffee check-in!"
        });
      } else {
        // Fallback - copy link to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast({
          title: "Link copied!",
          description: "Coffee check-in link has been copied to clipboard."
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Sharing failed",
        description: "Unable to share this coffee check-in.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="coffee-card mb-6">
      {(userName || timestamp) && (
        <div className="p-4 flex items-center space-x-3 border-b">
          <Avatar 
            className="h-10 w-10 cursor-pointer" 
            onClick={onUserClick}
          >
            {userImage ? (
              <AvatarImage src={userImage} alt={userName || ""} />
            ) : (
              <AvatarFallback className="bg-coffee-medium text-white">{userInitials}</AvatarFallback>
            )}
          </Avatar>
          <div>
            {userName && (
              <button 
                onClick={onUserClick} 
                className="font-medium hover:underline cursor-pointer"
              >
                {userName}
              </button>
            )}
            {displayTimestamp && (
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {displayTimestamp}
              </div>
            )}
          </div>
        </div>
      )}

      {displayImage && (
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={displayImage} 
            alt="Coffee" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="mb-2">
          <StarRating rating={displayRating || 0} interactive={false} />
        </div>
        
        <h3 className="text-lg font-medium">{displayCoffeeName}</h3>
        <p className="text-sm text-gray-600">by {displayRoastery}</p>
        
        <div className="my-3 flex items-center text-sm text-gray-500">
          <Coffee className="h-4 w-4 mr-1" />
          <span>{displayBrewMethod}</span>
          {displayLocation && (
            <>
              <span className="mx-1">•</span>
              <MapPin className="h-4 w-4 mr-1" />
              <span>{displayLocation}</span>
            </>
          )}
        </div>

        {displayComment && <p className="text-sm mt-2">{displayComment}</p>}

        <div className="mt-4 flex justify-between">
          <Button variant="ghost" size="sm" className="text-gray-600">
            Like
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            Comment
          </Button>
          {onDelete ? (
            <Button variant="ghost" size="sm" onClick={() => onDelete(checkInId || "")} className="text-gray-600">
              Delete
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoffeeCard;


import React from "react";
import { Link } from "react-router-dom";
import { Coffee, MapPin, Calendar } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";

interface CoffeeCardProps {
  id: string;
  userName: string;
  userImage?: string;
  coffeeImage?: string;
  coffeeName: string;
  roastery: string;
  brewMethod: string;
  location: string;
  rating: number;
  comment?: string;
  timestamp: string;
  userInitials: string;
}

const CoffeeCard = ({
  id,
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
}: CoffeeCardProps) => {
  return (
    <div className="coffee-card mb-6">
      <div className="p-4 flex items-center space-x-3 border-b">
        <Avatar className="h-10 w-10">
          {userImage ? (
            <AvatarImage src={userImage} alt={userName} />
          ) : (
            <AvatarFallback className="bg-coffee-medium text-white">{userInitials}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <Link to={`/user/${userName}`} className="font-medium hover:underline">
            {userName}
          </Link>
          <div className="text-sm text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {timestamp}
          </div>
        </div>
      </div>

      {coffeeImage && (
        <div className="aspect-square relative overflow-hidden">
          <img 
            src={coffeeImage} 
            alt="Coffee" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <div className="mb-2">
          <StarRating rating={rating} interactive={false} />
        </div>
        
        <h3 className="text-lg font-medium">{coffeeName}</h3>
        <p className="text-sm text-gray-600">by {roastery}</p>
        
        <div className="my-3 flex items-center text-sm text-gray-500">
          <Coffee className="h-4 w-4 mr-1" />
          <span>{brewMethod}</span>
          {location && (
            <>
              <span className="mx-1">•</span>
              <MapPin className="h-4 w-4 mr-1" />
              <span>{location}</span>
            </>
          )}
        </div>

        {comment && <p className="text-sm mt-2">{comment}</p>}

        <div className="mt-4 flex justify-between">
          <Button variant="ghost" size="sm" className="text-gray-600">
            Like
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600">
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeCard;


import React from "react";
import { Coffee } from "lucide-react";
import CoffeeCard from "@/components/CoffeeCard";
import { FeedItem } from "@/hooks/useFeed";

interface CheckInsListProps {
  checkIns: FeedItem[];
  onUserClick?: () => void;
}

const CheckInsList: React.FC<CheckInsListProps> = ({ checkIns, onUserClick }) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Coffee className="h-5 w-5 mr-2" />
        Coffee Check-ins
      </h2>
      
      {checkIns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {checkIns.map((checkIn) => (
            <CoffeeCard
              key={checkIn.id}
              {...checkIn}
              onUserClick={onUserClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No coffee check-ins yet</p>
        </div>
      )}
    </>
  );
};

export default CheckInsList;

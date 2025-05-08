
import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  className?: string;
}

const StarRating = ({
  rating,
  onRatingChange,
  size = "md",
  interactive = true,
  className,
}: StarRatingProps) => {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <div className={cn("flex", className)}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClass[size],
            "cursor-pointer transition-colors",
            i < rating ? "text-amber-400 fill-amber-400" : "text-gray-300",
            interactive && "hover:text-amber-400"
          )}
          onClick={() => handleClick(i)}
          strokeWidth={2}
        />
      ))}
    </div>
  );
};

export default StarRating;

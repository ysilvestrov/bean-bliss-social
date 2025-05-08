
import React, { useState } from "react";
import MainNav from "@/components/MainNav";
import CoffeeCard from "@/components/CoffeeCard";

// Mock data for feed
const mockFeed = [
  {
    id: "1",
    userName: "coffeeNerd42",
    userInitials: "CN",
    coffeeImage: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    coffeeName: "Ethiopian Yirgacheffe",
    roastery: "Blue Bottle",
    brewMethod: "Pour Over",
    location: "Home",
    rating: 5,
    comment: "Bright, floral notes with a hint of citrus. One of my favorites!",
    timestamp: "2 hours ago"
  },
  {
    id: "2",
    userName: "espressoLover",
    userInitials: "EL",
    userImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    coffeeImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd",
    coffeeName: "Colombia El Paraiso",
    roastery: "Stumptown",
    brewMethod: "Espresso",
    location: "Local Coffee Shop",
    rating: 4,
    comment: "Rich crema, chocolate notes. Slightly acidic finish.",
    timestamp: "Yesterday"
  },
  {
    id: "3",
    userName: "brewMaster",
    userInitials: "BM",
    coffeeImage: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb",
    coffeeName: "Guatemala Antigua",
    roastery: "Counter Culture",
    brewMethod: "French Press",
    location: "",
    rating: 3,
    comment: "Good body but slightly over-extracted this time.",
    timestamp: "2 days ago"
  }
];

const Home = () => {
  const [feed, setFeed] = useState(mockFeed);

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <MainNav />
      
      <div className="container max-w-xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-coffee-dark">Feed</h1>
          <div className="text-sm font-medium">
            <button className="text-coffee-dark border-b-2 border-coffee-dark mr-4">
              Friends
            </button>
            <button className="text-gray-500 hover:text-coffee-dark">
              Discover
            </button>
          </div>
        </div>
        
        {feed.map((item) => (
          <CoffeeCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Home;

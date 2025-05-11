
import React from "react";
import { Loader2 } from "lucide-react";
import MainNav from "@/components/MainNav";

const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="container mx-auto px-4 py-6 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-coffee-dark" />
      </div>
    </div>
  );
};

export default LoadingState;

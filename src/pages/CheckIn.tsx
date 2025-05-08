
import React from "react";
import MainNav from "@/components/MainNav";
import CheckInForm from "@/components/CheckInForm";

const CheckIn = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <MainNav />
      
      <div className="container max-w-xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-coffee-dark mb-6">Check In Your Coffee</h1>
        
        <div className="bg-white rounded-lg shadow p-5">
          <CheckInForm />
        </div>
      </div>
    </div>
  );
};

export default CheckIn;

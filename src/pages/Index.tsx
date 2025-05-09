
import React from "react";
import { Coffee, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-coffee-cream to-white py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl md:text-5xl font-bold text-coffee-dark">
                  Track Every Cup.<br />
                  <span className="text-coffee-accent">Share Your Journey.</span>
                </h1>
                <p className="text-lg text-gray-600 md:text-xl max-w-[600px]">
                  Bean Bliss is the ultimate coffee companion. Check-in, rate your brew, connect with friends, and discover your next favorite coffee.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/check-in">
                    <Button className="bg-coffee-dark hover:bg-coffee-dark/90 text-white">
                      <Coffee className="w-4 h-4 mr-2" />
                      Check-in Now
                    </Button>
                  </Link>
                  <Button variant="outline" className="border-coffee-medium text-coffee-dark hover:bg-coffee-light/20">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="lg:flex justify-end">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80" 
                    alt="Coffee" 
                    className="rounded-lg shadow-lg w-full"
                  />
                  <div className="absolute -bottom-5 -left-5 bg-white p-3 rounded-lg shadow-md">
                    <div className="flex items-center space-x-1">
                      <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                      <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                      <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                      <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                      <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    </div>
                    <p className="font-medium text-sm mt-1">Ethiopian Pour Over</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-coffee-dark">How It Works</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-coffee-light/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="h-8 w-8 text-coffee-dark" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Check In Your Coffee</h3>
                <p className="text-gray-600">
                  Log your coffee experience with photos, ratings, and tasting notes.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-coffee-light/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-coffee-dark" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Rate Your Brew</h3>
                <p className="text-gray-600">
                  Use our five-star system to rate every cup and track your favorites.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-coffee-light/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-coffee-dark" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Connect With Friends</h3>
                <p className="text-gray-600">
                  Follow friends and see their coffee adventures in your feed.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-12 md:py-16 bg-coffee-dark text-white">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Join the Coffee Community?</h2>
            <p className="text-lg text-coffee-cream/90 mb-6 max-w-2xl mx-auto">
              Sign up today and start sharing your coffee journey with friends and enthusiasts around the world.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link to="/login">
                <Button className="bg-coffee-accent hover:bg-coffee-accent/90">
                  Sign Up Now
                </Button>
              </Link>
              <Button variant="outline" className="border-white text-coffee-dark hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Coffee className="h-5 w-5 text-coffee-dark mr-2" />
              <span className="font-semibold text-coffee-dark">Bean Bliss</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 Bean Bliss. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

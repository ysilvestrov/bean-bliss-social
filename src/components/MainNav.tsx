
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Coffee, Home, Users, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MainNav = () => {
  const location = useLocation();
  
  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: Home,
    },
    {
      path: "/check-in",
      label: "Check-in",
      icon: Coffee,
    },
    {
      path: "/friends",
      label: "Friends",
      icon: Users,
    },
    {
      path: "/profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-6 px-4 py-2 border-b">
        <Link to="/" className="flex items-center space-x-2">
          <Coffee className="h-6 w-6 text-coffee-dark" />
          <span className="font-semibold text-xl text-coffee-dark">Bean Bliss</span>
        </Link>
        
        <div className="flex-1 flex justify-center">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 flex items-center space-x-1 rounded-md transition-colors",
                location.pathname === item.path
                  ? "bg-coffee-light/20 text-coffee-dark"
                  : "hover:bg-coffee-light/10 text-gray-700"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <Link to="/login">
          <Button variant="outline" className="border-coffee-dark text-coffee-dark hover:bg-coffee-light/20">
            Log in
          </Button>
        </Link>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-2 px-4 flex-1",
                location.pathname === item.path
                  ? "text-coffee-dark"
                  : "text-gray-500"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default MainNav;

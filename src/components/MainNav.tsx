
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Coffee, Home, Users, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const MainNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is logged in
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    getSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAuthenticated(!!session);
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account",
      });
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "An error occurred while signing out",
        variant: "destructive",
      });
    }
  };

  const navItems = [
    {
      path: "/home",
      label: "Home",
      icon: Home,
    },
    {
      path: "/check-in",
      label: "Check-in",
      icon: Coffee,
    },
    {
      path: "/users",
      label: "Users",
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

        {isAuthenticated ? (
          <Button 
            variant="outline" 
            className="border-coffee-dark text-coffee-dark hover:bg-coffee-light/20"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        ) : (
          <Link to="/login">
            <Button variant="outline" className="border-coffee-dark text-coffee-dark hover:bg-coffee-light/20">
              Log in
            </Button>
          </Link>
        )}
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

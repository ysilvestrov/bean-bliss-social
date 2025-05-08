
import React from "react";
import { Link } from "react-router-dom";
import { Coffee } from "lucide-react";
import LoginForm from "@/components/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-coffee-cream to-white p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        <div className="flex flex-col items-center space-y-2">
          <Link to="/" className="flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-coffee-dark" />
            <span className="font-semibold text-2xl text-coffee-dark">Bean Bliss</span>
          </Link>
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="text-gray-500 text-center">
            Welcome back! Sign in to continue your coffee journey.
          </p>
        </div>
        
        <LoginForm />
        
        <div className="text-center text-sm text-gray-500">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="text-coffee-dark hover:underline font-medium">
              Sign up
            </Link>
          </p>
          <p className="mt-2">
            <Link to="/" className="text-coffee-dark hover:underline font-medium">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

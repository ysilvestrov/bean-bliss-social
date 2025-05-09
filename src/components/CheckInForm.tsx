
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StarRating from "./StarRating";
import { Coffee, MapPin, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

const brewMethods = [
  "Pour Over",
  "French Press",
  "Espresso",
  "AeroPress",
  "Cold Brew",
  "Drip",
  "Moka Pot",
  "Chemex",
  "Siphon",
  "Turkish",
];

const CheckInForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [brewMethod, setBrewMethod] = useState("");
  const [coffeeName, setCoffeeName] = useState("");
  const [roastery, setRoastery] = useState("");
  const [location, setLocation] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('coffee-images')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({
          title: "Image upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
        return null;
      }
      
      // Get the public URL of the uploaded image
      const { data } = supabase.storage
        .from('coffee-images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };
  
  const saveCheckIn = async (imageUrl: string | null) => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to check-in",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      // Save check-in to database
      const { error } = await supabase
        .from('coffee_check_ins')
        .insert({
          user_id: session.user.id,
          coffee_name: coffeeName,
          roaster: roastery,
          brew_method: brewMethod,
          location: location || null,
          rating,
          notes: comment || null,
          image_url: imageUrl,
        });
        
      if (error) {
        console.error('Error saving check-in:', error);
        toast({
          title: "Check-in failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving check-in:', error);
      return false;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!coffeeName || !roastery || !brewMethod || rating === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First upload the image if there is one
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      
      // Then save the check-in data
      const success = await saveCheckIn(imageUrl);
      
      if (success) {
        toast({
          title: "Check-in created!",
          description: "Your coffee check-in has been shared successfully.",
        });
        
        // Reset form or navigate
        navigate('/home');
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
      toast({
        title: "Check-in failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <p className="font-medium">How was your coffee?</p>
        <StarRating 
          rating={rating} 
          onRatingChange={setRating} 
          size="lg"
          className="justify-center"
        />
      </div>

      <div>
        <label 
          htmlFor="image-upload" 
          className={`block w-full aspect-video rounded-md border-2 border-dashed cursor-pointer transition-colors hover:border-coffee-medium flex flex-col items-center justify-center ${image ? 'border-none p-0' : 'border-gray-300 p-6'}`}
        >
          {image ? (
            <img src={image} alt="Uploaded coffee" className="w-full h-full object-cover rounded-md" />
          ) : (
            <div className="text-center">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p>Upload a photo of your coffee</p>
              <p className="text-sm text-gray-500">Click or drag & drop</p>
            </div>
          )}
        </label>
        <input 
          id="image-upload" 
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleImageUpload}
        />
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="coffee-name" className="text-sm font-medium">
              Coffee Name
            </label>
            <Input 
              id="coffee-name" 
              type="text" 
              placeholder="e.g., Ethiopian Yirgacheffe" 
              className="bg-white"
              value={coffeeName}
              onChange={(e) => setCoffeeName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="roastery" className="text-sm font-medium">
              Roastery
            </label>
            <Input 
              id="roastery" 
              type="text" 
              placeholder="e.g., Blue Bottle Coffee" 
              className="bg-white"
              value={roastery}
              onChange={(e) => setRoastery(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="brew-method" className="text-sm font-medium">
              Brew Method
            </label>
            <Select value={brewMethod} onValueChange={setBrewMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Select brew method" />
              </SelectTrigger>
              <SelectContent>
                {brewMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">
              Location
            </label>
            <Input 
              id="location" 
              type="text" 
              placeholder="e.g., Home or Cafe name" 
              className="bg-white"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="comment" className="text-sm font-medium">
            Tasting Notes / Comments
          </label>
          <Textarea 
            id="comment" 
            placeholder="Share your thoughts about this coffee..." 
            className="h-24 bg-white"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-coffee-dark hover:bg-coffee-dark/90"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Checking In...
          </>
        ) : (
          <>
            <Coffee className="w-4 h-4 mr-2" />
            Check In
          </>
        )}
      </Button>
    </form>
  );
};

export default CheckInForm;

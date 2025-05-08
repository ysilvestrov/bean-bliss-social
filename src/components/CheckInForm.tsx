
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StarRating from "./StarRating";
import { Coffee, MapPin, Upload } from "lucide-react";

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
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [brewMethod, setBrewMethod] = useState("");
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Check-in created!",
      description: "Your coffee check-in has been shared successfully.",
    });
    // In a real app, we would save the check-in data here
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
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-coffee-dark hover:bg-coffee-dark/90"
      >
        <Coffee className="w-4 h-4 mr-2" />
        Check In
      </Button>
    </form>
  );
};

export default CheckInForm;

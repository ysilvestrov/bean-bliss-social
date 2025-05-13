
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { v4 as uuidv4 } from "uuid";

interface AvatarUploadProps {
  userId: string;
  url: string | null;
  username: string;
  onUploadComplete: (url: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ userId, url, username, onUploadComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(url);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${userId}/${uuidv4()}.${fileExt}`;

      // Upload the image to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const newAvatarUrl = data.publicUrl;
      setAvatarUrl(newAvatarUrl);
      onUploadComplete(newAvatarUrl);
      toast("Avatar updated");
    } catch (error) {
      toast("Error uploading avatar");
      console.error("Error uploading avatar:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="w-32 h-32 border-2 border-coffee-light">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={username} />
        ) : (
          <AvatarFallback className="bg-coffee-light text-coffee-dark text-2xl">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      <input
        type="file"
        ref={fileInputRef}
        onChange={uploadAvatar}
        accept="image/*"
        className="hidden"
      />
      <Button 
        onClick={handleUploadClick}
        variant="outline"
        disabled={uploading}
        className="flex items-center gap-2"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
        Change Avatar
      </Button>
    </div>
  );
};

export default AvatarUpload;

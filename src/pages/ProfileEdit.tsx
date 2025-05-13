
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainNav from "@/components/MainNav";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import AvatarUpload from "@/components/profile/AvatarUpload";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { useProfileEdit } from "@/hooks/useProfileEdit";
import { toast } from "@/components/ui/sonner";

const profileSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username cannot exceed 30 characters" }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { profile, loading } = useAuthProfile();
  const { updateProfile, isLoading } = useProfileEdit(profile?.id);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username,
      });
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile) return;

    const result = await updateProfile({
      username: data.username,
      avatar_url: avatarUrl
    });

    if (result) {
      navigate('/profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-coffee-dark" />
            <p className="text-coffee-dark">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center">Please sign in to edit your profile.</p>
              <Button 
                className="mt-4 mx-auto block" 
                onClick={() => navigate('/login')}
              >
                Sign in
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="container mx-auto px-4 py-6">
        <Button 
          variant="ghost" 
          className="mb-4 pl-0 text-coffee-dark" 
          onClick={() => navigate('/profile')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-md mx-auto space-y-6">
              <AvatarUpload 
                userId={profile.id} 
                url={profile.avatar_url} 
                username={profile.username} 
                onUploadComplete={(url) => setAvatarUrl(url)}
              />
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-coffee-dark hover:bg-coffee-dark/90"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileEdit;


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface Comment {
  id: string;
  userId: string;
  checkInId: string;
  content: string;
  createdAt: string;
  userName?: string;
  userAvatar?: string | null;
  userInitials?: string;
}

export function useComments(checkInId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();

  const commentsCount = comments.length;

  const fetchComments = async () => {
    setIsLoading(true);
    
    try {
      // First fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('coffee_comments')
        .select('*')
        .eq('check_in_id', checkInId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error('Error fetching comments:', commentsError);
        throw commentsError;
      }

      if (!commentsData) {
        return;
      }

      // Then fetch profiles for all user_ids in comments
      const userIds = commentsData.map(comment => comment.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Create a map of profiles for easy lookup
      const profilesMap = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      // Format the comments with profile data
      const formattedComments = commentsData.map(comment => ({
        id: comment.id,
        userId: comment.user_id,
        checkInId: comment.check_in_id,
        content: comment.content,
        createdAt: new Date(comment.created_at).toLocaleString(),
        userName: profilesMap[comment.user_id]?.username || 'Unknown User',
        userAvatar: profilesMap[comment.user_id]?.avatar_url,
        userInitials: profilesMap[comment.user_id]?.username ? 
          profilesMap[comment.user_id].username.charAt(0).toUpperCase() : 'U'
      }));

      setComments(formattedComments);
    } catch (error) {
      console.error('Error in fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!checkInId) return;

    fetchComments();

    // Set up real-time listener for comments
    const channel = supabase
      .channel('public:coffee_comments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'coffee_comments',
          filter: `check_in_id=eq.${checkInId}`
        }, 
        (payload) => {
          console.log('Comment update received:', payload);
          fetchComments(); // Refresh comments when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [checkInId]);

  const addComment = async (content: string) => {
    if (!profile || !checkInId || !content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('coffee_comments').insert({
        user_id: profile?.id,
        check_in_id: checkInId,
        content: content.trim()
      });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add comment',
          variant: 'destructive'
        });
        console.error('Error adding comment:', error);
      }
    } catch (error) {
      console.error('Error in adding comment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!profile || !commentId) return;
    
    try {
      const { error } = await supabase
        .from('coffee_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', profile.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete comment',
          variant: 'destructive'
        });
        console.error('Error deleting comment:', error);
      }
    } catch (error) {
      console.error('Error in deleting comment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    }
  };

  return {
    comments,
    commentsCount,
    isLoading,
    isSubmitting,
    addComment,
    deleteComment,
    fetchComments,
  };
}

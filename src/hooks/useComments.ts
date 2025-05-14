
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
  const { user } = useAuth();

  useEffect(() => {
    if (!checkInId) return;
    
    const fetchComments = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('coffee_comments')
          .select(`
            *,
            profiles:user_id(username, avatar_url)
          `)
          .eq('check_in_id', checkInId)
          .order('created_at', { ascending: true });
          
        if (error) {
          console.error('Error fetching comments:', error);
          return;
        }

        if (data) {
          const formattedComments = data.map(comment => ({
            id: comment.id,
            userId: comment.user_id,
            checkInId: comment.check_in_id,
            content: comment.content,
            createdAt: new Date(comment.created_at).toLocaleString(),
            userName: comment.profiles?.username || 'Unknown User',
            userAvatar: comment.profiles?.avatar_url,
            userInitials: comment.profiles?.username ? 
              comment.profiles.username.charAt(0).toUpperCase() : 'U'
          }));

          setComments(formattedComments);
        }
      } catch (error) {
        console.error('Error in fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

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
    if (!user || !checkInId || !content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('coffee_comments').insert({
        user_id: user.id,
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
    if (!user || !commentId) return;
    
    try {
      const { error } = await supabase
        .from('coffee_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

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
    isLoading,
    isSubmitting,
    addComment,
    deleteComment
  };
}

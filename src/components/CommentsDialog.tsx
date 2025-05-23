
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, X, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useComments, Comment } from "@/hooks/useComments";

interface CommentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  checkInId: string;
}

const CommentsDialog = ({ open, onOpenChange, checkInId }: CommentsDialogProps) => {
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading, isSubmitting, addComment, deleteComment, fetchComments } = useComments(checkInId);
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    await addComment(newComment);
    await fetchComments();
    setNewComment("");
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
    await fetchComments();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            Comments ({comments.length})
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto space-y-4 py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-coffee-medium" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment: Comment) => (
              <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-gray-50">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {comment.userAvatar ? (
                    <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                  ) : (
                    <AvatarFallback>{comment.userInitials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-sm">{comment.userName}</div>
                    <div className="text-xs text-gray-500">{comment.createdAt}</div>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
                {profile?.id === comment.userId && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(comment.id)}
                    className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete comment</span>
                  </Button>
                )}
              </div>
            ))
          )}
        </div>

        {profile && (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!newComment.trim() || isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting && (<span><Loader2 className="h-4 w-4 animate-spin" /></span>)}
                Post Comment
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommentsDialog;

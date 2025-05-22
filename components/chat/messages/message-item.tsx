"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Message } from "@/lib/types";
import { UserAvatar } from "../user/user-avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash, Reply } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface MessageItemProps {
  message: Message;
  showUserInfo: boolean;
}

export function MessageItem({ message, showUserInfo }: MessageItemProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const { toast } = useToast();
  
  // Check if the current user is the message author
  // This would typically be implemented with a proper auth check
  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id === message.user_id;
  };
  
  const handleEdit = async () => {
    if (!(await checkCurrentUser())) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "You can only edit your own messages",
      });
      return;
    }
    
    setIsEditing(true);
  };
  
  const saveEdit = async () => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          content: editedContent,
          is_edited: true,
        })
        .eq('id', message.id);
      
      if (error) throw error;
      
      // Update the message locally
      message.content = editedContent;
      message.is_edited = true;
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating message",
        description: error.message || "Something went wrong",
      });
    }
  };
  
  const cancelEdit = () => {
    setEditedContent(message.content);
    setIsEditing(false);
  };
  
  const handleDelete = async () => {
    if (!(await checkCurrentUser())) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "You can only delete your own messages",
      });
      return;
    }
    
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', message.id);
      
      if (error) throw error;
      
      toast({
        title: "Message deleted",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting message",
        description: error.message || "Something went wrong",
      });
    } finally {
      setShowDeleteDialog(false);
    }
  };

  return (
    <div 
      className={`group flex gap-2 ${showUserInfo ? 'mt-4' : 'pl-12'}`}
      onMouseEnter={() => setShowDropdown(true)}
      onMouseLeave={() => setShowDropdown(false)}
    >
      {showUserInfo && (
        <UserAvatar user={message.user} className="h-10 w-10 mt-0.5" showStatus />
      )}
      
      <div className="flex-1 space-y-1">
        {showUserInfo && (
          <div className="flex items-center gap-2">
            <span className="font-medium">{message.user.full_name}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(message.created_at), "h:mm a")}
            </span>
          </div>
        )}
        
        <div>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-2 text-sm"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit}>Save</Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <p className="text-sm leading-relaxed">{message.content}</p>
              {message.is_edited && (
                <span className="ml-1 text-xs text-muted-foreground">(edited)</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {showDropdown && !isEditing && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>
                <Reply className="mr-2 h-4 w-4" />
                <span>Reply</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageList } from "@/components/chat/messages/message-list";
import { MessageInput } from "@/components/chat/messages/message-input";
import { supabase } from "@/lib/supabase";
import { User } from "@/lib/types";

export default function DirectMessagePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [recipient, setRecipient] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        setRecipient(data as User);
      }
      
      setIsLoading(false);
    };
    
    fetchUser();
  }, [userId]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!recipient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <p className="text-muted-foreground">
          The user you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <MessageList userId={userId} />
      </div>
      <MessageInput userId={userId} />
    </div>
  );
}
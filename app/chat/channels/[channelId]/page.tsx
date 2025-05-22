"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageList } from "@/components/chat/messages/message-list";
import { MessageInput } from "@/components/chat/messages/message-input";
import { supabase } from "@/lib/supabase";
import { Channel } from "@/lib/types";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchChannel = async () => {
      const { data } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single();
      
      if (data) {
        setChannel(data as Channel);
      }
      
      setIsLoading(false);
    };
    
    fetchChannel();
  }, [channelId]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!channel) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-xl font-semibold mb-2">Channel not found</h2>
        <p className="text-muted-foreground">
          {`The channel you're looking for doesn't exist or you don't have access to it.`}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <MessageList channelId={channelId} />
      </div>
      <MessageInput channelId={channelId} />
    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { MessageItem } from "./message-item";
import { Message, User } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from "date-fns";
import { RealtimeChannel } from "@supabase/supabase-js";

interface MessageListProps {
  channelId?: string;
  userId?: string;
}

export function MessageList({ channelId, userId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [, setUsers] = useState<{ [key: string]: User }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!channelId && !userId) return;
    
    const fetchMessages = async () => {
      setLoading(true);
      
      let query;
      
      if (channelId) {
        // Channel messages
        query = supabase
          .from('messages')
          .select(`
            *,
            user:user_id (*)
          `)
          .eq('channel_id', channelId)
          .order('created_at', { ascending: true })
          .limit(50);
      } else if (userId) {
        // Direct messages - simplified query for demo
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        query = supabase
          .from('direct_messages')
          .select(`
            *,
            sender:sender_id (*)
          `)
          .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
          .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
          .order('created_at', { ascending: true })
          .limit(50);
      }
      
      if (!query) return;
      
      const { data } = await query;
      
      if (data) {
        // Process messages
        const processedMessages = data.map(message => ({
          ...message,
          user: message.user || message.sender
        }));
        
        setMessages(processedMessages as Message[]);
        
        // Extract user data from messages
        const userMap: { [key: string]: User } = {};
        processedMessages.forEach(message => {
          if (message.user) {
            userMap[message.user.id] = message.user;
          }
        });
        
        setUsers(userMap);
      }
      
      setLoading(false);
      scrollToBottom();
    };
    
    fetchMessages();
    
    // Set up real-time subscription
    let subscription: unknown;
    
    if (channelId) {
      subscription = supabase
        .channel(`messages:${channelId}`)
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` }, 
          payload => {
            // Fetch the user for this message
            const fetchUser = async () => {
              const { data: userData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', payload.new.user_id)
                .single();
              
              if (userData) {
                setUsers(prev => ({
                  ...prev,
                  [userData.id]: userData as User
                }));
                
                const newMessage = {
                  ...payload.new,
                  user: userData as User
                };
                
                setMessages(prevMessages => [...prevMessages, newMessage as Message]);
                
                // Check if scroll is at bottom, if not, show new message indicator
                const scrollArea = scrollAreaRef.current;
                if (scrollArea) {
                  const { scrollHeight, scrollTop, clientHeight } = scrollArea;
                  const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
                  
                  if (isAtBottom) {
                    scrollToBottom();
                  } else {
                    setHasNewMessages(true);
                  }
                }
              }
            };
            
            fetchUser();
          }
        )
        .subscribe();
    } else if (userId) {
      // Similar setup for direct messages would go here
    }
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription as unknown as RealtimeChannel);
      }
    };
  }, [channelId, userId]);
  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setHasNewMessages(false);
    }
  };
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as { [key: string]: Message[] });

  return (
    <div className="relative flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <div className="text-4xl mb-2">👋</div>
            <h3 className="text-lg font-medium">No messages yet</h3>
            <p className="text-sm">
              {channelId ? "Be the first to send a message in this channel!" : "Start a conversation!"}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, messagesForDate]) => (
              <div key={date} className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-2 text-xs text-muted-foreground">
                      {new Date(date).toDateString() === new Date().toDateString()
                        ? "Today"
                        : formatDistanceToNow(new Date(date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                {messagesForDate.map((message, i) => {
                  // Check if this message should show the user's info
                  const showUserInfo = i === 0 || 
                    messagesForDate[i - 1].user_id !== message.user_id ||
                    new Date(message.created_at).getTime() - 
                    new Date(messagesForDate[i - 1].created_at).getTime() > 5 * 60 * 1000;
                  
                  return (
                    <MessageItem 
                      key={message.id} 
                      message={message} 
                      showUserInfo={showUserInfo}
                    />
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      {hasNewMessages && (
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 shadow-md"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-4 w-4 mr-1" />
          New messages
        </Button>
      )}
    </div>
  );
}
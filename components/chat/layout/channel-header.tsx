"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Hash, Users, Info, Search, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Channel, User } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChannelDetailsDialog } from "../channels/channel-details-dialog";

export function ChannelHeader() {
  const params = useParams();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [directUser, setDirectUser] = useState<User | null>(null);
  const [membersCount, setMembersCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const channelId = params?.channelId as string;
  const userId = params?.userId as string;
  
  useEffect(() => {
    if (channelId) {
      const fetchChannel = async () => {
        const { data } = await supabase
          .from('channels')
          .select('*')
          .eq('id', channelId)
          .single();
        
        if (data) {
          setChannel(data as Channel);
          
          // Get members count
          const { count } = await supabase
            .from('channel_members')
            .select('*', { count: 'exact', head: true })
            .eq('channel_id', channelId);
          
          setMembersCount(count || 0);
        }
      };
      
      fetchChannel();
    } else if (userId) {
      const fetchUser = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (data) {
          setDirectUser(data as User);
        }
      };
      
      fetchUser();
    }
  }, [channelId, userId]);

  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-1.5">
        {channel && (
          <>
            <Hash className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{channel.name}</span>
            {channel.is_private && (
              <span className="text-muted-foreground">🔒</span>
            )}
          </>
        )}
        
        {directUser && (
          <>
            <div className={`h-2.5 w-2.5 rounded-full ${directUser.is_online ? 'bg-green-500' : 'bg-muted'}`} />
            <span className="font-medium">{directUser.full_name}</span>
          </>
        )}
        
        {channel && (
          <div className="ml-2 flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{membersCount}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-1.5">
        {showSearch ? (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages..."
              className="w-64 rounded-md border pl-8"
              autoFocus
              onBlur={() => setShowSearch(false)}
            />
          </div>
        ) : (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setShowSearch(true)}
                >
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Search</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Search messages</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
              >
                <BellOff className="h-4 w-4" />
                <span className="sr-only">Mute notifications</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mute notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {channel && (
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground"
              >
                <Info className="h-4 w-4" />
                <span className="sr-only">Channel details</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Channel Details</DialogTitle>
              </DialogHeader>
              <ChannelDetailsDialog channel={channel} membersCount={membersCount} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
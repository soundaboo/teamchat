"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquareIcon, PlusCircleIcon, Hash, Users, Settings, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Channel, User } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { CreateChannelForm } from "../channels/create-channel-form";
import { UserAvatar } from "../user/user-avatar";

interface SidebarProps {
  isCollapsed: boolean;
  user: User | null;
}

export function Sidebar({ isCollapsed, user }: SidebarProps) {
  const pathname = usePathname();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [directUsers, setDirectUsers] = useState<User[]>([]);
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  
  useEffect(() => {
    if (!user) return;
    
    // Fetch channels
    const fetchChannels = async () => {
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .or(`is_private=false, id=in(${getChannelMembershipsQuery()})`)
        .order('name');
      
      if (data) {
        setChannels(data as Channel[]);
      }
    };
    
    // Fetch direct message users
    const fetchDirectUsers = async () => {
      // This is a simplified query - in a real app, you'd fetch users you've had DMs with
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(10);
      
      if (data) {
        setDirectUsers(data as User[]);
      }
    };
    
    fetchChannels();
    fetchDirectUsers();
    
    // Set up real-time subscriptions
    const channelSubscription = supabase
      .channel('public:channels')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'channels' }, 
        () => fetchChannels()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, [user]);
  
  // Helper function to create a subquery for channel memberships
  function getChannelMembershipsQuery() {
    return `select channel_id from channel_members where user_id = '${user?.id}'`;
  }
  
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-muted/50">
      <div className="flex h-14 items-center border-b px-4">
        <Link 
          href="/chat" 
          className={cn(
            "flex items-center gap-2 font-semibold",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <MessageSquareIcon className="h-6 w-6" />
          {!isCollapsed && <span>TeamChat</span>}
        </Link>
      </div>
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className={cn(
                "flex items-center text-xs font-medium text-muted-foreground",
                isCollapsed && "justify-center"
              )}>
                {!isCollapsed && <span>CHANNELS</span>}
              </div>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Dialog open={isCreatingChannel} onOpenChange={setIsCreatingChannel}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        >
                          <PlusCircleIcon className="h-4 w-4" />
                          <span className="sr-only">Create channel</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create a new channel</DialogTitle>
                        </DialogHeader>
                        <CreateChannelForm onSuccess={() => setIsCreatingChannel(false)} />
                      </DialogContent>
                    </Dialog>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Create Channel
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-1">
              {channels.map((channel) => (
                <TooltipProvider key={channel.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/chat/channels/${channel.id}`}
                        className={cn(
                          "group flex items-center rounded-md px-2 py-1.5 hover:bg-accent",
                          pathname === `/chat/channels/${channel.id}` && "bg-accent",
                          isCollapsed ? "justify-center" : "justify-start"
                        )}
                      >
                        <Hash className="mr-2 h-4 w-4" />
                        {!isCollapsed && (
                          <span className="truncate">
                            {channel.name}
                            {channel.is_private && (
                              <span className="ml-1 text-muted-foreground">🔒</span>
                            )}
                          </span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        # {channel.name}
                        {channel.is_private && " 🔒"}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
          
          <div>
            <div className={cn(
              "flex items-center px-2 py-1.5 text-xs font-medium text-muted-foreground",
              isCollapsed && "justify-center"
            )}>
              {!isCollapsed && <span>DIRECT MESSAGES</span>}
            </div>
            <div className="space-y-1">
              {directUsers.map((directUser) => (
                <TooltipProvider key={directUser.id} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/chat/dm/${directUser.id}`}
                        className={cn(
                          "group flex items-center rounded-md px-2 py-1.5 hover:bg-accent",
                          pathname === `/chat/dm/${directUser.id}` && "bg-accent",
                          isCollapsed ? "justify-center" : "justify-start"
                        )}
                      >
                        <UserAvatar
                          user={directUser}
                          className="mr-2 h-4 w-4"
                          showStatus
                        />
                        {!isCollapsed && (
                          <span className="truncate">{directUser.full_name}</span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right">
                        {directUser.full_name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
      <div className={cn(
        "flex items-center border-t p-2",
        isCollapsed ? "flex-col gap-2" : "gap-2"
      )}>
        {user && (
          <div className={cn(
            "flex items-center",
            isCollapsed ? "flex-col" : "gap-2 flex-1"
          )}>
            <UserAvatar user={user} showStatus />
            {!isCollapsed && (
              <div className="flex-1 truncate text-sm font-medium">
                {user.full_name}
              </div>
            )}
          </div>
        )}
        <div className={cn(
          "flex items-center",
          isCollapsed ? "flex-col" : "gap-0.5"
        )}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/chat/settings">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">Settings</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? "right" : "top"}>
                Settings
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Log out</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side={isCollapsed ? "right" : "top"}>
                Log out
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
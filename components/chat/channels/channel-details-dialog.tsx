"use client";

import { useState, useEffect } from "react";
import { Channel, User } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CalendarDays, UsersRound, Info, Lock, Globe } from "lucide-react";
import { format } from "date-fns";
import { UserAvatar } from "../user/user-avatar";

interface ChannelDetailsDialogProps {
  channel: Channel;
  membersCount: number;
}

export function ChannelDetailsDialog({ channel, membersCount }: ChannelDetailsDialogProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [createdBy, setCreatedBy] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMembers = async () => {
      // Get channel members with user profiles
      const { data } = await supabase
        .from('channel_members')
        .select(`
          role,
          profiles:user_id (*)
        `)
        .eq('channel_id', channel.id)
        .order('role', { ascending: false });
      
      if (data) {
        const processedMembers = data.map(item => ({
          ...item.profiles,
          role: item.role
        }));
        setMembers(processedMembers as User[] & typeof processedMembers);
      }
      
      // Get creator
      const { data: creatorData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', channel.created_by)
        .single();
      
      if (creatorData) {
        setCreatedBy(creatorData as User);
      }
      
      setLoading(false);
    };
    
    fetchMembers();
  }, [channel]);

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <h4 className="font-medium">About</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {channel.description || "No description provided."}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          {channel.is_private ? (
            <Lock className="mt-0.5 h-4 w-4 text-muted-foreground" />
          ) : (
            <Globe className="mt-0.5 h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <h4 className="font-medium">Visibility</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {channel.is_private
                ? "This is a private channel. Only invited members can view and join."
                : "This is a public channel. Anyone in the workspace can view and join."}
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <CalendarDays className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <h4 className="font-medium">Created</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(channel.created_at), "MMMM d, yyyy")}
              {createdBy && ` by ${createdBy.full_name}`}
            </p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">Members ({membersCount})</h3>
          </div>
          <Button variant="outline" size="sm">Invite</Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center my-4">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <ScrollArea className="h-60 mt-2">
            <div className="space-y-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-md p-2 hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={member} showStatus />
                    <div>
                      <div className="font-medium">{member.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {(member as User & { role: string }).role === 'owner' ? 'Owner' : 
                         (member as User & { role: string }).role === 'admin' ? 'Admin' : 'Member'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
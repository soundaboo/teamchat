"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";

interface UserAvatarProps {
  user: User;
  className?: string;
  showStatus?: boolean;
}

export function UserAvatar({ user, className, showStatus = false }: UserAvatarProps) {
  // Get initials from full name
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <Avatar className={className}>
        {user.avatar_url ? (
          <AvatarImage src={user.avatar_url} alt={user.full_name} />
        ) : (
          <AvatarFallback>{initials}</AvatarFallback>
        )}
      </Avatar>
      {showStatus && (
        <div className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${user.is_online ? 'bg-green-500' : 'bg-muted'}`} />
      )}
    </div>
  );
}
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at: string;
  last_seen: string;
  is_online: boolean;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  created_at: string;
  created_by: string;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  channel_id: string;
  user_id: string;
  user: User;
  attachments?: MessageAttachment[];
  is_edited: boolean;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  file_size: number;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

export interface DirectMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  sender: User;
  recipient: User;
  is_read: boolean;
}
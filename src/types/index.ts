export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  attachments?: {
    type: 'image' | 'video' | 'pdf';
    url: string;
    name: string;
  }[];
  tags?: string[];
  mentions?: string[];
}

export interface Message {
  id: string;
  content: string;
  mediaUrl?: string;
  groupId: string;
  senderId: string;
  sentAt: string;
  group?: Group;
  sender?: User;
}

export interface Group {
  id: string;
  name: string;
  creatorId: string;
  isPrivate?: boolean;
  messages?: Message[];
}

export type ChatType = "store" | "shift" | "private"; 
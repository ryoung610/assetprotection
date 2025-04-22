// src/components/MessageInput.tsx
import { useState } from 'react';
import { generateClient } from 'aws-amplify/api';
import { Schema, Message } from '../../../amplify/data/resource';

const client = generateClient<Schema>();

interface MessageInputProps {
  user: { id: string; username?: string };
  groupId: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const MessageInput: React.FC<MessageInputProps> = ({ user, groupId, setMessages }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const result = await client.models.Message.create({
        content: newMessage,
        groupId,
        senderId: user.id,
        senderName: user.username || 'Anonymous',
        sentAt: new Date().toISOString(),
      });

      if (result.data) {
        const cleanMessage: Message = {
          id: result.data.id,
          content: result.data.content ?? '',
          mediaUrl: result.data.mediaUrl ?? undefined,
          groupId: result.data.groupId,
          senderId: result.data.senderId,
          senderName: result.data.senderName,
          sentAt: result.data.sentAt,
          tags: (result.data.tags ?? []).filter((tag): tag is string => tag !== null),
          mentions: (result.data.mentions ?? []).filter((mention): mention is string => mention !== null),
          attachments: result.data.attachments ?? null,
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt,
        };

        setMessages((prev) => [...prev, cleanMessage]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </form>
  );
};

import { useState, useEffect } from 'react';
import { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/api';

const client = generateClient<Schema>();

export const useAmplifyChat = (groupId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [group, setGroup] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: groupData } = await client.models.Group.get({ id: groupId });
        setGroup(groupData);
        
        const { data: messagesData } = await client.models.Message.list({
          filter: { groupId: { eq: groupId } }
        });
        setMessages(messagesData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const sendMessage = async (content: string, senderId: string) => {
    try {
      const { data: newMessage } = await client.models.Message.create({
        content,
        senderId,
        groupId,
        sentAt: new Date().toISOString(),
        senderName: "User" // TODO: Get from current user
      });
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    messages,
    group,
    loading,
    error,
    sendMessage
  };
}; 
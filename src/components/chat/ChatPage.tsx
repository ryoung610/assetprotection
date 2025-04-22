import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from '@aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import outputs from '../../../amplify_outputs.json';
import { Schema, Message } from '../../../amplify/data/resource';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';


Amplify.configure(outputs);
const client = generateClient<Schema>();
const GROUP_ID = 'your-group-id-here'; // TODO: Replace

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username?: string } | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser({
          id: user.userId,
          username: user.username || 'Anonymous',
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data. Please sign in again.');
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const result = await client.models.Message.list({
          filter: { groupId: { eq: GROUP_ID } },
        });
  
        // Map raw model instances to clean `Message` type
        const cleanMessages = (result.data ?? []).map((msg) => ({
          id: msg.id,
          content: msg.content ?? undefined,
          mediaUrl: msg.mediaUrl ?? undefined,
          groupId: msg.groupId,
          senderId: msg.senderId,
          senderName: msg.senderName,
          sentAt: msg.sentAt,
          tags: msg.tags ?? undefined,
          mentions: msg.mentions ?? undefined,
          attachments: msg.attachments ?? undefined,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
        })) as Message[];
  
        setMessages(cleanMessages);
  
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please ensure you are signed in.');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);
  

  if (!currentUser) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Loading user data...</div>;
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col bg-gray-100">
      <div className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold tracking-tight">Asset Protection Chat</h1>
        <p className="text-sm text-gray-500">Group Chat</p>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="hidden md:block w-64 bg-white border-r">
          <div className="p-4">
            <h3 className="text-sm font-semibold mb-2">Channels</h3>
            <button className="w-full text-left px-3 py-2 rounded-md bg-blue-100 text-blue-600">
              # Group Chat
            </button>
          </div>
        </div>
        <div className="md:hidden p-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
          >
            {showMobileSidebar ? 'Close Channels' : 'Open Channels'}
          </button>
          {showMobileSidebar && (
            <div className="fixed inset-0 z-50 bg-gray-800/50">
              <div className="fixed left-0 top-0 h-full w-64 bg-white border-r">
                <div className="p-4">
                  <h3 className="text-sm font-semibold mb-2">Channels</h3>
                  <button
                    className="w-full text-left px-3 py-2 rounded-md bg-blue-100 text-blue-600"
                    onClick={() => setShowMobileSidebar(false)}
                  >
                    # Group Chat
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col bg-white">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Group Chat</h2>
            <p className="text-xs text-gray-500">
              {loading ? 'Loading...' : error ? 'Error loading messages' : `${messages.length} messages`}
            </p>
          </div>
          <div className="flex-1 flex flex-col">
            <MessageList messages={messages} currentUser={currentUser} error={error} loading={loading} />
            <MessageInput user={currentUser} groupId={GROUP_ID} setMessages={setMessages} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
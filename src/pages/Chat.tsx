import { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser } from '@aws-amplify/auth';
import { generateClient } from 'aws-amplify/api';
import outputs from '../../amplify_outputs.json';
import { Schema, Message } from '../../amplify/data/resource';

// Configure Amplify
Amplify.configure(outputs);

// Initialize API client
const client = generateClient<Schema>();

// Hardcoded group ID (replace with your actual group ID)
const GROUP_ID = 'your-group-id-here'; // TODO: Replace with a real group ID

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages for the group
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const result = await client.models.Message.list({
          filter: { groupId: { eq: GROUP_ID } },
        });
        // Safe cast through unknown to Message[]
        setMessages(result.data as unknown as Message[]);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages. Please ensure you are signed in.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Send a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const currentUser = await getCurrentUser();
      const result = await client.models.Message.create({
        content: newMessage,
        groupId: GROUP_ID,
        senderId: currentUser.userId,
        senderName: currentUser.username || 'Anonymous',
        sentAt: new Date().toISOString(),
      });

      if (result.data) {
        // Safe cast through unknown to Message
        setMessages((prev) => [...prev, result.data as unknown as Message]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please ensure you are signed in.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-40 mt-10 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Loading messages...</p>
      ) : (
        <div className="max-h-96 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500">No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="mb-3 p-3 bg-white rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-blue-600">{msg.senderName}: </strong>
                    <span>{msg.content || ''}</span> {/* Handle null content */}
                  </div>
                  <small className="text-gray-400 text-xs">
                    {new Date(msg.sentAt).toLocaleTimeString()}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex gap-2">
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
      </form>
    </div>
  );
};
export default Chat;
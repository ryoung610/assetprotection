// src/components/MessageList.tsx
import { Message } from '../../../amplify/data/resource';

interface MessageListProps {
  messages: Message[];
  currentUser: { id: string; username?: string };
  error: string | null;
  loading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUser, error, loading }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      {loading ? (
        <p className="text-gray-500 text-center">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-gray-500 text-center">No messages yet.</p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 p-3 rounded-lg shadow-sm ${
              msg.senderId === currentUser.id ? 'bg-blue-100 ml-8' : 'bg-white mr-8'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <strong className="text-blue-600">{msg.senderName || 'Anonymous'}: </strong>
                <span>{msg.content || ''}</span>
              </div>
              <small className="text-gray-400 text-xs">
                {new Date(msg.sentAt).toLocaleTimeString()}
              </small>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
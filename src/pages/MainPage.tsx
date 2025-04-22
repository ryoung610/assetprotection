import { useEffect, useState, useRef } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { fetchAuthSession } from "aws-amplify/auth";
import { uploadData, getUrl } from "aws-amplify/storage";
import { useNavigate, useParams } from "react-router-dom";

const client = generateClient<Schema>();

interface MessageInput {
  content?: string;
  mediaUrl?: string;
  groupId: string;
  senderId: string;
  sentAt: string;
  senderName:string;
}

const MainPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<
    Array<
      Schema["Message"]["type"] & {
        senderUsername?: string;
        senderProfilePicUrl?: string;
      }
    >
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [user, setUser] = useState<{ sub: string } | null>(null);
  const [groupName, setGroupName] = useState<string>("");
  const [error, setError] = useState<string | null>(null); // Error feedback
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const chatAreaRef = useRef<HTMLDivElement>(null); // Auto-scrolling

  // Load user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const session = await fetchAuthSession();
        const payload = session.tokens?.idToken?.payload;
        if (payload?.sub) {
          setUser({ sub: payload.sub });
          console.log("User loaded", payload.sub);
        } else {
          throw new Error("No sub in session");
        }
      } catch (err) {
        console.error("Guest user:", err);
        setUser(null);
        setError("Please sign in to continue.");
      }
    };
    loadUser();
  }, []);

  // Load group name
  useEffect(() => {
    if (groupId) {
      client.models.Group.get({ id: groupId })
        .then((result) => {
          if (result.data) {
            setGroupName(result.data.name);
            console.log("Group loaded", result.data.name);
          } else {
            console.error("Group not found", groupId);
            setError("Group not found.");
          }
        })
        .catch((err) => {
          console.error("Error loading group", err);
          setError("Failed to load group.");
        });
    } else {
      console.error("No groupId provided");
      setError("Invalid group ID.");
    }
  }, [groupId]);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await fetchAuthSession();
      if (session && session.credentials) {
        console.log('is ok User is authenticated');
      } else {
        console.log('not ok User is not authenticated');
        // Handle the redirect to login or show a login message
      }
    };
    checkAuth();
  }, []);

  // Fetch messages
  async function fetchMessagesWithSenderInfo() {
    if (!groupId) {
      console.error("No groupId for fetching messages");
      return;
    }
    try {
      const messageResult = await client.models.Message.list({
        filter: { groupId: { eq: groupId } },
      });
      console.log("Messages fetched", messageResult.data);

      const itemsWithSenderInfo = await Promise.all(
        messageResult.data.map(async (msg) => {
          let senderUsername: string | undefined;
          let senderProfilePicUrl: string | undefined;

          if (msg.senderId) {
            try {
              const userResult = await client.models.User.get({ id: msg.senderId });
              if (userResult.data) {
                senderUsername = userResult.data.username;
                if (userResult.data.profilePicture) {
                  const { url } = await getUrl({ key: userResult.data.profilePicture });
                  senderProfilePicUrl = url.toString();
                }
              }
            } catch (err) {
              console.error("Error fetching user", msg.senderId, err);
            }
          }

          return { ...msg, senderUsername, senderProfilePicUrl };
        })
      );

      setMessages(itemsWithSenderInfo);
      console.log("Updated messages", itemsWithSenderInfo);
    } catch (err) {
      console.error("Error fetching messages", err);
      setError("Failed to load messages.");
    }
  }

  // Observe messages and auto-scroll
  useEffect(() => {
    if (!groupId) return;
    fetchMessagesWithSenderInfo();

    const subscription = client.models.Message.observeQuery({
      filter: { groupId: { eq: groupId } },
    }).subscribe({
      next: () => {
        console.log("observeQuery triggered");
        fetchMessagesWithSenderInfo();
      },
      error: (err) => console.error("observeQuery error", err),
    });

    return () => subscription.unsubscribe();
  }, [groupId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    console.log("sendMessage called", { groupId, user, newMessage, file });

    if (!groupId || !user || (!newMessage && !file)) {
      console.log("sendMessage blocked", { groupId, user, newMessage, file });
      setError("Please enter a message or select a file.");
      return;
    }

    setError(null);
    setIsLoading(true);

    let mediaUrl: string | undefined;
    if (file) {
      try {
        const fileName = `images/${user.sub}_${Date.now()}_${file.name}`;
        await uploadData({
          key: fileName,
          data: file,
          options: { contentType: file.type },
        }).result;
        const { url } = await getUrl({ key: fileName });
        mediaUrl = url.toString();
        console.log("File uploaded", mediaUrl);
      } catch (err) {
        console.error("File upload failed", err);
        setError("Failed to upload file.");
        setIsLoading(false);
        return;
      }
    }

    const messageData: MessageInput = {
      content: newMessage || undefined,
      mediaUrl,
      groupId,
      senderId: user.sub,
      sentAt: new Date().toISOString(),
      senderName: user.sub, // TODO: Replace with actual username
    };

    try {
      console.log("Creating message", messageData);
      const result = await client.models.Message.create(messageData);
      console.log("Message creation result", result);
      if (result.errors) {
        console.error("Message creation errors", result.errors);
        setError(
          result.errors.map((e) => e.message).join(", ") ||
            "Failed to send message."
        );
      } else {
        setNewMessage("");
        setFile(null);
      }
    } catch (err) {
      console.error("Message creation failed", err);
      setError("Failed to send message.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-gray-50">
      <header className="p-4 bg-gray-100 flex justify-between items-center">
        <h2 className="text-xl font-bold">{groupName || "Group Chat"}</h2>
        <button
          onClick={() => navigate(`/group/${groupId}/members`)}
          className="text-blue-600 hover:underline"
        >
          View Members
        </button>
      </header>
      {error && (
        <div className="p-4 bg-red-100 text-red-700 text-center">{error}</div>
      )}
      <div
        ref={chatAreaRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {messages.length === 0 && !error && (
          <p className="text-center text-gray-500">No messages yet.</p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start mb-4 ${
              msg.senderId === user?.sub ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <img
              src={msg.senderProfilePicUrl || "https://via.placeholder.com/40"}
              alt="Profile"
              className="w-10 h-10 rounded-full mx-2"
            />
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.senderId === user?.sub ? "bg-green-100" : "bg-gray-200"
              }`}
            >
              <div className="font-bold">{msg.senderUsername || "Unknown"}</div>
              {msg.content && <p>{msg.content}</p>}
              {msg.mediaUrl && (
                <img src={msg.mediaUrl} alt="Media" className="max-w-full" />
              )}
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={sendMessage}
        className="p-4 bg-gray-100 flex items-center"
      >
        <input
          type="text"
          name="message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border-none rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          disabled={isLoading}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mr-2"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>
      <div className="p-4 text-center text-gray-600">
        🥳 Asset Protection App!!!!!
      </div>
    </div>
  );
};

export default MainPage;
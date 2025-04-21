import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { Schema } from '../../../amplify/data/resource';
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Search, FileText, AlertTriangle, ClipboardList } from "lucide-react";
import { useAmplifyChat } from "../../hooks/useAmplifyChat";

const client = generateClient<Schema>();

const ChatPage = () => {
  const [activeChat, setActiveChat] = useState<"store" | "shift" | "private">("store");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "resources" | "tasks" | "incidents">("chat");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Map chat types to group IDs
  const groupIdMap: Record<"store" | "shift" | "private", string> = {
    store: "store-group-id", // Replace with actual group ID
    shift: "shift-group-id", // Replace with actual group ID
    private: "private-group-id", // Replace with actual group ID
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { username } = await getCurrentUser();
        const { data: user } = await client.models.User.get({ id: username });
        setCurrentUser(user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  const { 
    messages, 
    group, 
    loading, 
    error, 
    sendMessage 
  } = useAmplifyChat(groupIdMap[activeChat]);

  const handleSendMessage = async (message: Schema["Message"]) => {
    if (!currentUser) return;
    await sendMessage(message.content, currentUser.senderId);
  };

  if (!currentUser) {
    return <div>Loading user data...</div>;
  }

  const ChatSidebar = () => (
    <div className="w-full md:w-64 h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            placeholder="Search conversations..." 
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="px-2 py-1 text-sm font-semibold ">Channels</h3>
        <button 
          className={`w-full justify-start text-left font-normal mb-1 px-3 py-2 rounded-md ${
            activeChat === "store" 
              ? "bg-secondary text-secondary-foreground" 
              : "hover:bg-muted"
          }`}
          onClick={() => setActiveChat("store")}
        >
          # Store #123
        </button>
        <button 
          className={`w-full justify-start text-left font-normal mb-1 px-3 py-2 rounded-md ${
            activeChat === "shift" 
              ? "bg-secondary text-secondary-foreground" 
              : "hover:bg-muted"
          }`}
          onClick={() => setActiveChat("shift")}
        >
          # Day Shift
        </button>
        
        <h3 className="px-2 py-1 text-sm font-semibold mt-4">Direct Messages</h3>
        <button 
          className={`w-full justify-start text-left font-normal px-3 py-2 rounded-md ${
            activeChat === "private" 
              ? "bg-secondary text-secondary-foreground" 
              : "hover:bg-muted"
          }`}
          onClick={() => setActiveChat("private")}
        >
          Sarah Johnson
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-7rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">Asset Protection Hub</h1>
        <p className="text-muted-foreground">Communicate and manage security operations</p>
      </div>
      
      <div className="flex-1 flex overflow-hidden border rounded-lg bg-white">
        <div className="hidden md:block w-64">
          <ChatSidebar />
        </div>
        
        <div className="md:hidden">
          <button 
            className="mb-2 px-4 py-2 border rounded-md hover:bg-muted"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            Open Channels
          </button>
          {showMobileMenu && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
              <div className="fixed left-0 top-0 h-full w-[280px] border-r bg-background">
                <ChatSidebar />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <div className="mb-2">
              <h2 className="font-semibold">
                {group?.name || "Loading..."}
              </h2>
              <p className="text-xs text-muted-foreground">
                {loading ? "Loading..." : error ? "Error loading messages" : `${messages.length} messages`}
              </p>
            </div>
            
            <div className="overflow-x-auto pb-2">
              <div className="flex border-b">
                <button 
                  className={`px-4 py-2 ${activeTab === "chat" ? "border-b-2 border-primary" : ""}`}
                  onClick={() => setActiveTab("chat")}
                >
                  Chat
                </button>
                <button 
                  className={`px-4 py-2 flex items-center ${activeTab === "resources" ? "border-b-2 border-primary" : ""}`}
                  onClick={() => setActiveTab("resources")}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Resources
                </button>
                <button 
                  className={`px-4 py-2 flex items-center ${activeTab === "tasks" ? "border-b-2 border-primary" : ""}`}
                  onClick={() => setActiveTab("tasks")}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Tasks
                </button>
                <button 
                  className={`px-4 py-2 flex items-center ${activeTab === "incidents" ? "border-b-2 border-primary" : ""}`}
                  onClick={() => setActiveTab("incidents")}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Incidents
                </button>
              </div>
            </div>
          </div>
          
          <div className={`${activeTab === "chat" ? "flex-1 flex flex-col" : "hidden"}`}>
            <MessageList messages={messages} currentUser={currentUser} />
            <MessageInput user={currentUser} onSendMessage={handleSendMessage} />
          </div>
          
          <div className={`${activeTab === "resources" ? "flex-1 p-4" : "hidden"}`}>
            <div className="text-center text-muted-foreground">
              Resources management coming soon
            </div>
          </div>
          
          <div className={`${activeTab === "tasks" ? "flex-1 p-4" : "hidden"}`}>
            <div className="text-center text-muted-foreground">
              Task management coming soon
            </div>
          </div>
          
          <div className={`${activeTab === "incidents" ? "flex-1 p-4" : "hidden"}`}>
            <div className="text-center text-muted-foreground">
              Incident management coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
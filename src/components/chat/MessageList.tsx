
import { AlertTriangle, School } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage, User } from "@/types";

interface MessageListProps {
  messages: ChatMessage[];
  currentUser: User;
}

export const MessageList = ({ messages, currentUser }: MessageListProps) => {
  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages?.map((message) => {
          let messageStyle = "bg-muted";
          let specialContent = null;
          
          if (message.senderId === currentUser.id) {
            messageStyle = "bg-primary text-primary-foreground";
          }
          
          if (message.tags?.includes('Urgent')) {
            messageStyle = "bg-red-100 border-2 border-red-500 text-red-900";
            specialContent = (
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-bold text-red-700">URGENT</span>
              </div>
            );
          } else if (message.tags?.includes('Incidents')) {
            messageStyle = "bg-yellow-100 border-2 border-yellow-500 text-yellow-900";
            specialContent = (
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="font-bold text-yellow-700">INCIDENT</span>
              </div>
            );
          } else if (message.tags?.includes('Training')) {
            messageStyle = "bg-green-100 border-2 border-green-500 text-green-900";
            specialContent = (
              <div className="flex items-center mb-2">
                <School className="h-5 w-5 text-green-500 mr-2" />
                <span className="font-bold text-green-700">TRAINING</span>
              </div>
            );
          }
          
          return (
            <div 
              key={message.id} 
              className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] rounded-lg p-3 ${messageStyle}`}>
                {specialContent}
                
                {message.senderId !== currentUser.id && (
                  <div className="font-semibold text-sm mb-1">{message.senderName}</div>
                )}
                <p>{message.content}</p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="rounded overflow-hidden border border-white/20 bg-white/10">
                        {attachment.type === "image" && (
                          <img 
                            src={attachment.url} 
                            alt={attachment.name} 
                            className="max-h-48 w-full object-contain"
                          />
                        )}
                        {attachment.type === "video" && (
                          <video 
                            src={attachment.url} 
                            controls 
                            className="max-h-48 w-full"
                          />
                        )}
                        {attachment.type === "pdf" && (
                          <div className="p-2 flex items-center">
                            <span className="text-xs truncate">{attachment.name}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
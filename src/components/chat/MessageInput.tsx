import { useState, useRef } from "react";
import { Send, Paperclip, X } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { Schema } from "../../../amplify/data/resource";
import { client } from "../../../amplify/client";

interface MessageInputProps {
  user: Schema["User"];
  onSendMessage: (message: Schema["Message"]) => void;
}

export const MessageInput = ({ user, onSendMessage }: MessageInputProps) => {
  const [messageText, setMessageText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const newFiles = Array.from(files);
    const oversizedFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      showToast({
        title: "File too large",
        description: "Files must be under 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setAttachments(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() && attachments.length === 0) return;

    const mentions = messageText.match(/@(\w+\s*\w*)/g)?.map(mention => 
      mention.slice(1).trim()
    );

    if (mentions?.length) {
      showToast({
        title: "User Mentioned",
        description: "A user has been mentioned in the message",
      });
    }

    const { data: newMessage } = await client.models.Message.create({
      content: messageText,
      groupId: "", // This should come from props
      senderId: user.id,
      sentAt: new Date().toISOString(),
      senderName: user.name
    });

    onSendMessage(newMessage);
    setMessageText("");
    setAttachments([]);
  };

  return (
    <div className="p-4 border-t">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileUpload} 
        multiple
        accept="image/*,video/*,application/pdf"
      />
      
      {attachments.length > 0 && (
        <div className="p-2 border-t">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="bg-muted rounded-md p-1 flex items-center gap-2">
                <span className="text-xs truncate max-w-24">{file.name}</span>
                <button 
                  className="h-5 w-5 p-0 hover:bg-muted rounded-md"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-2 relative">
        <input 
          type="text"
          placeholder="Type your message..." 
          value={messageText}
          onChange={handleInput}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          ref={inputRef}
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <button 
          className="p-2 border rounded-md hover:bg-muted"
          onClick={() => fileInputRef.current?.click()} 
          title="Attach file"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <button 
          className="p-2 border rounded-md hover:bg-muted disabled:opacity-50"
          onClick={handleSendMessage} 
          disabled={!messageText.trim() && attachments.length === 0}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
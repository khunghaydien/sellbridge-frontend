"use client";

import { memo, useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { IconSend } from "@/icons";
import { useMessages } from "../hooks";
import { useConversations } from "../hooks";
import { CircularProgress, Alert } from "@mui/material";

interface MessageAttachment {
  type: string;
  payload: {
    url: string;
    title?: string;
  };
}

interface MessageFrom {
  id: string;
  name: string;
  picture?: string | null;
}

interface InboxDetailProps {
  conversationId: string | null;
  pageIds: string[]; // Array of page IDs for message context
}

export const InboxDetail = memo(function InboxDetail({ conversationId, pageIds }: InboxDetailProps) {
  const [inputValue, setInputValue] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Redux hooks
  const {
    messages,
    isLoading,
    error,
    isSending,
    sendError,
    loadMessages,
    sendNewMessage,
    clearMessagesError
  } = useMessages();

  const { conversations, getConversationAccessToken } = useConversations();
  
  // Get current conversation to extract recipient PSID
  const currentConversation = conversations.find(c => c.id === conversationId);
  const recipientId = currentConversation?.participants?.data?.[0]?.id;
  
  // Get the correct access token for this conversation
  const conversationAccessToken = conversationId ? getConversationAccessToken(conversationId) : null;


  // Fetch messages when conversationId changes
  useEffect(() => {
    if (conversationId && conversationAccessToken) {
      loadMessages({
        conversationId,
        pageAccessToken: conversationAccessToken,
        limit: 50,
      });
    }
  }, [conversationId, conversationAccessToken]);

  // Scroll to bottom when messages load or conversation changes
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, conversationId]);

  const handleSend = async () => {
    if (!inputValue.trim() || !conversationId || !conversationAccessToken || pageIds.length === 0 || !recipientId) {
      return;
    }
    
    const messageText = inputValue.trim();
    setInputValue(""); // Clear input immediately
    
    // Use the first page ID for sending (in future, could let user choose)
    const pageId = pageIds[0];
    
    try {
      await sendNewMessage({
        pageId: pageId,
        recipientId: recipientId!,
        message: messageText,
        pageAccessToken: conversationAccessToken,
      });
      
      // Reload messages after sending
      setTimeout(() => {
        loadMessages({
          conversationId,
          pageAccessToken: conversationAccessToken,
          limit: 50,
        });
      }, 500);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message if failed
      setInputValue(messageText);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // No conversation selected
  if (!conversationId) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted rounded-xl">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Select a conversation to view messages</p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading && messages.length === 0) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted rounded-xl">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <CircularProgress />
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted rounded-xl p-4">
        <Alert severity="error" onClose={clearMessagesError}>
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted rounded-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground">
              {messages[0]?.from?.name || 'Conversation'}
            </h2>
            <p className="text-xs text-muted-foreground">{messages.length} messages</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-messenger"
      >
        {/* Reverse messages array so newest messages appear at the bottom */}
        {[...messages].reverse().map((msg: any) => {
          // Check if message is from any of the selected pages
          const isOwnMessage = pageIds.includes(msg.from?.id);
          const from: MessageFrom = msg.from || { id: '', name: 'Unknown', picture: null };
          
          return (
            <div
              key={msg.id}
              className={clsx(
                "flex",
                isOwnMessage ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={clsx(
                  "max-w-[70%] rounded-2xl px-4 py-2",
                  isOwnMessage
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                {/* Show sender name and picture if not own message */}
                {!isOwnMessage && (
                  <div className="flex items-center gap-2 mb-1">
                    {from.picture && (
                      <img 
                        src={from.picture} 
                        alt={from.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    <p className="text-xs font-semibold text-foreground/80">
                      {from.name}
                    </p>
                  </div>
                )}
                
                {/* Message text */}
                {msg.message && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.message}
                  </p>
                )}
                
                {/* Attachments */}
                {msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.attachments.map((attachment: any, index: number) => (
                      <div key={index}>
                        {attachment.type === 'image' && (
                          <img 
                            src={attachment.payload.url} 
                            alt="Attachment"
                            className="max-w-full h-auto rounded-lg"
                            style={{ maxHeight: '300px' }}
                          />
                        )}
                        {attachment.type === 'video' && (
                          <video 
                            src={attachment.payload.url} 
                            controls
                            className="max-w-full h-auto rounded-lg"
                            style={{ maxHeight: '300px' }}
                          />
                        )}
                        {attachment.type === 'audio' && (
                          <audio 
                            src={attachment.payload.url} 
                            controls
                            className="w-full"
                          />
                        )}
                        {attachment.type === 'file' && (
                          <a 
                            href={attachment.payload.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            📎 {attachment.payload.title || 'Download file'}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Show [No text] only if no message and no attachments */}
                {!msg.message && (!msg.attachments || !Array.isArray(msg.attachments) || msg.attachments.length === 0) && (
                  <p className="text-sm text-muted-foreground italic">
                    [No text]
                  </p>
                )}
                <p className={clsx(
                  "text-xs mt-1",
                  isOwnMessage ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {new Date(msg.created_time).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Send Error */}
      {sendError && (
        <div className="px-4 py-2">
          <Alert severity="error" onClose={clearMessagesError}>
            {sendError}
          </Alert>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1 px-4 py-2 text-sm border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSending ? (
              <CircularProgress size={20} sx={{ color: 'inherit' }} />
            ) : (
              <IconSend className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default InboxDetail;


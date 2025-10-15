"use client";

import { memo, useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { IconSend } from "@/icons";
import { useMessages } from "../hooks";
import { useConversations } from "../hooks";
import { CircularProgress, Alert } from "@mui/material";

interface InboxDetailProps {
  conversationId: string | null;
  pageAccessToken?: string;
  pageIds: string[]; // Array of page IDs for message context
}

export const InboxDetail = memo(function InboxDetail({ conversationId, pageAccessToken, pageIds }: InboxDetailProps) {
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

  const { conversations } = useConversations();
  
  // Get current conversation to extract recipient PSID
  const currentConversation = conversations.find(c => c.id === conversationId);
  const recipientId = currentConversation?.participants?.data?.[0]?.id;

  // Debug log
  useEffect(() => {
    if (conversationId) {
      console.log('=== Message Detail Debug ===');
      console.log('Page IDs:', pageIds);
      console.log('Current conversation:', currentConversation);
      console.log('Recipient PSID:', recipientId);
      console.log('Messages count:', messages.length);
      if (messages.length > 0) {
        console.log('Sample message from:', messages[0]?.from);
        console.log('Is own message?', pageIds.includes(messages[0]?.from.id));
      }
    }
  }, [conversationId, recipientId, messages, pageIds]);

  // Fetch messages when conversationId changes
  useEffect(() => {
    if (conversationId && pageAccessToken) {
      console.log('Fetching messages for conversation:', conversationId);
      loadMessages({
        conversationId,
        pageAccessToken,
        limit: 50,
      });
    }
  }, [conversationId, pageAccessToken]);

  // Scroll to bottom when messages load
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !conversationId || !pageAccessToken || pageIds.length === 0 || !recipientId) {
      console.warn('Missing required params:', { 
        hasInput: !!inputValue.trim(), 
        hasConversationId: !!conversationId, 
        hasPageAccessToken: !!pageAccessToken,
        hasPageIds: pageIds.length > 0,
        hasRecipientId: !!recipientId
      });
      return;
    }
    
    const messageText = inputValue.trim();
    setInputValue(""); // Clear input immediately
    
    // Use the first page ID for sending (in future, could let user choose)
    const pageId = pageIds[0];
    console.log('Sending message with params:', { pageId, recipientId, message: messageText });
    
    try {
      await sendNewMessage({
        pageId: pageId,
        recipientId: recipientId!,
        message: messageText,
        pageAccessToken: pageAccessToken,
      });
      
      // Reload messages after sending
      setTimeout(() => {
        loadMessages({
          conversationId,
          pageAccessToken,
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
        {[...messages].reverse().map((msg) => {
          // Check if message is from any of the selected pages
          const isOwnMessage = pageIds.includes(msg.from.id);
          
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
                {/* Show sender name if not own message */}
                {!isOwnMessage && (
                  <p className="text-xs font-semibold mb-1 text-foreground/80">
                    {msg.from.name}
                  </p>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.message || '[No text]'}
                </p>
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


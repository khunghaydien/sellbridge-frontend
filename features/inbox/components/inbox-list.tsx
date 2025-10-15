"use client";

import { memo, useState, useMemo, useCallback, useRef, useEffect } from "react";
import clsx from "clsx";
import { IconSearch } from "@/icons";
import { useConversations } from "../hooks";
import { usePages } from "@/features/page/hooks";
import { CircularProgress, Alert } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender: string;
  senderPicture?: string | null;
  preview: string;
  time: string;
  isUnread: boolean;
  hasPhone: boolean;
  isImportant: boolean;
}

interface InboxListProps {
  pageIds: string[];
  filter: string;
  selectedMessageId: string | null;
  onMessageSelect: (messageId: string) => void;
  websocketConversations?: any[]; // Conversations from websocket
}

export const InboxList = memo(function InboxList({
  pageIds,
  filter,
  selectedMessageId,
  onMessageSelect,
  websocketConversations = [],
}: InboxListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { 
    conversations, 
    paging,
    isLoading: conversationsLoading, 
    error: conversationsError,
    loadMultiplePageConversations,
    addWebsocketConversationToStore
  } = useConversations();
  
  const { pages } = usePages();


  // Fetch conversations when pageIds are available
  useEffect(() => {
    if (pageIds.length > 0 && pages.length > 0) {
      // Use multiple page conversations API
      const pageAccessTokens: Record<string, string> = {};
      const validPageIds: string[] = [];
      
      pageIds.forEach(pageId => {
        const page = pages.find(p => p.id === pageId);
        if (page && page.access_token) {
          pageAccessTokens[pageId] = page.access_token;
          validPageIds.push(pageId);
        }
      });
      
      if (validPageIds.length > 0) {
        loadMultiplePageConversations({
          pageIds: validPageIds,
          pageAccessTokens,
          limit: 25,
        });
      }
    }
  }, [pageIds, pages, loadMultiplePageConversations]);

  useEffect(() => {
    websocketConversations.forEach(wsConv => {
      const pageId = wsConv.pageId || wsConv.id.split('_')[0];
      
      // Check if conversation already exists in Redux store
      const existingConversation = conversations.find(conv => conv.id === wsConv.id);
      
      if (existingConversation) {
        // Update existing conversation with new data and move to top
        const updatedConversation = {
          ...existingConversation,
          ...wsConv,
          pageId: pageId,
        };
        addWebsocketConversationToStore(updatedConversation, pageId);
      } else {
        // New conversation - add to store
        addWebsocketConversationToStore(wsConv, pageId);
      }
    });
  }, [websocketConversations, addWebsocketConversationToStore, conversations]);

  // Handle message updates from websocket
  useEffect(() => {
    console.log('🔍 WEBSOCKET CONVERSATIONS RECEIVED:', websocketConversations);
    
    websocketConversations.forEach(wsData => {
      console.log('📨 PROCESSING WEBSOCKET DATA:', wsData);
      
      if (wsData.type === 'message' && wsData.text && !wsData.isEcho) {
        console.log('✅ MESSAGE DATA DETECTED:', {
          pageId: wsData.pageId,
          senderId: wsData.senderId,
          text: wsData.text,
          conversationId: `${wsData.pageId}_${wsData.senderId}`
        });
        // Find conversation by pageId and senderId
        const existingConversation = conversations.find(conv => 
          conv.pageId === wsData.pageId && 
          conv.participants?.data?.[0]?.id === wsData.senderId
        );
        
        console.log('🔍 SEARCHING FOR CONVERSATION:', {
          searchPageId: wsData.pageId,
          searchSenderId: wsData.senderId,
          totalConversations: conversations.length,
          found: !!existingConversation
        });
        
        if (existingConversation) {
          console.log('✅ CONVERSATION FOUND, UPDATING SNIPPET:', {
            conversationId: existingConversation.id,
            oldSnippet: existingConversation.snippet,
            newSnippet: wsData.text
          });
          
          // Update existing conversation snippet
          const updatedConversation = {
            ...existingConversation,
            snippet: wsData.text,
            updated_time: wsData.created_time,
            unread_count: existingConversation.unread_count + 1,
          };
          
          // Move to top and update
          addWebsocketConversationToStore(updatedConversation, wsData.pageId);
        } else {
          // Conversation not found in store, fetch entire list
          console.log('❌ CONVERSATION NOT FOUND, FETCHING ENTIRE LIST...');
          if (pageIds.length > 0 && pages.length > 0) {
            const pageAccessTokens: Record<string, string> = {};
            const validPageIds: string[] = [];
            
            pageIds.forEach(pageId => {
              const page = pages.find(p => p.id === pageId);
              if (page && page.access_token) {
                pageAccessTokens[pageId] = page.access_token;
                validPageIds.push(pageId);
              }
            });
            
            if (validPageIds.length > 0) {
              loadMultiplePageConversations({
                pageIds: validPageIds,
                pageAccessTokens,
                limit: 25,
              });
            }
          }
        }
      }
    });
  }, [websocketConversations, conversations, addWebsocketConversationToStore, loadMultiplePageConversations, pageIds, pages]);

  useEffect(() => {
    if (conversations.length > 0) {
      const mappedMessages: Message[] = conversations.map((conv) => {
        const firstParticipant = conv.participants?.data?.[0];
        const senderName = firstParticipant?.name || 'Unknown User';
        const senderPicture = firstParticipant?.picture || null;
        
        const timeString = conv.updated_time 
          ? new Date(conv.updated_time).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          : '';
        
        return {
          id: conv.id,
          sender: senderName,
          senderPicture: senderPicture,
          preview: conv.snippet || 'No message preview',
          time: timeString,
          isUnread: conv.unread_count > 0,
          hasPhone: false,
          isImportant: conv.unread_count > 5,
        };
      });
      
      setMessages(mappedMessages);
    } else if (!conversationsLoading && conversations.length === 0) {
      setMessages([]);
    }
  }, [conversations, conversationsLoading]);

  const filteredMessages = useMemo(() => {
    let filtered = messages;

    if (searchQuery.trim()) {
      filtered = filtered.filter(message =>
        message.sender.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (filter) {
      case "unread":
        filtered = filtered.filter(message => message.isUnread);
        break;
      case "read":
        filtered = filtered.filter(message => !message.isUnread);
        break;
      case "phone":
        filtered = filtered.filter(message => message.hasPhone);
        break;
      case "important":
        filtered = filtered.filter(message => message.isImportant);
        break;
      case "unanswered":
        filtered = filtered.filter(message => message.isUnread);
        break;
      default:
        break;
    }

    return filtered;
  }, [filter, searchQuery, messages]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || isLoadingMore || !paging?.cursors?.after) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearTop = scrollTop < 100; // Near top of scroll

    if (isNearTop) {
      setIsLoadingMore(true);
      // TODO: Implement load more conversations
      // loadMoreConversations();
      setTimeout(() => setIsLoadingMore(false), 1000); // Placeholder
    }
  }, [isLoadingMore, paging]);

  // Add scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="h-full flex flex-col px-2 bg-gradient-to-b from-background to-muted rounded-xl">
      {/* Search Header */}
      <div className="pb-4">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
          />
        </div>
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-2">
            {filteredMessages.length} kết quả tìm kiếm
          </p>
        )}
      </div>

      {/* Loading State */}
      {conversationsLoading && !messages.length && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-8 gap-2"
        >
          <CircularProgress size={32} />
          <p className="text-sm text-muted-foreground">Loading conversations...</p>
        </motion.div>
      )}

      {/* Error State */}
      {conversationsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {conversationsError}
        </Alert>
      )}

      {/* Empty State */}
      {!conversationsLoading && !conversationsError && pageIds.length > 0 && messages.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-8 text-center"
        >
          <p className="text-sm text-muted-foreground">No conversations found</p>
          <p className="text-xs text-muted-foreground mt-1">for selected pages</p>
        </motion.div>
      )}

      {/* No Page Selected State */}
      {pageIds.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-8 text-center"
        >
          <p className="text-sm text-muted-foreground">Select pages to view conversations</p>
        </motion.div>
      )}

      {/* Message List with Infinite Scroll */}
      {messages.length > 0 && (
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth scrollbar-messenger"
        >
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Không tìm thấy tin nhắn</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <AnimatePresence mode="popLayout">
              {filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.02,
                    layout: { duration: 0.2, ease: "easeInOut" }
                  }}
                  onClick={() => onMessageSelect(message.id)}
                  className={clsx(
                    "p-4 cursor-pointer transition-colors bg-muted/20 hover:bg-muted/50 rounded-lg",
                    selectedMessageId === message.id && "bg-primary/5 border-primary/20"
                  )}
                >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {message.senderPicture && (
                      <img 
                        src={message.senderPicture} 
                        alt={message.sender}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <h3 className={clsx(
                      "font-medium text-sm truncate",
                      message.isUnread ? "text-foreground font-semibold" : "text-foreground"
                    )}>
                      {message.sender}
                    </h3>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                    {message.time}
                  </span>
                </div>

                <p className={clsx(
                  "text-sm line-clamp-2",
                  message.isUnread ? "text-foreground" : "text-muted-foreground"
                )}>
                  {message.preview}
                </p>

                <div className="flex items-center gap-1 mt-2">
                  {message.isUnread && (
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                  )}
                  {message.hasPhone && (
                    <span className="text-xs text-blue-500">📞</span>
                  )}
                  {message.isImportant && (
                    <span className="text-xs text-yellow-500">⭐</span>
                  )}
                </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading more indicator */}
            <AnimatePresence>
              {isLoadingMore && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 flex items-center justify-center"
                >
                  <CircularProgress size={20} />
                  <span className="ml-2 text-xs text-muted-foreground">Loading more...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination info */}
            {paging && (paging.cursors?.after || paging.cursors?.before) && (
              <div className="p-4 flex items-center justify-center">
                <div className="text-xs text-muted-foreground">
                  {filteredMessages.length} conversations loaded
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      )}
    </div>
  );
});

export default InboxList; 
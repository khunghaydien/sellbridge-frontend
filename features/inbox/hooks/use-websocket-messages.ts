import { useCallback, useEffect, useRef } from 'react';
import { useConversations } from './use-conversations';
import { usePages } from '@/features/page/hooks';

interface WebhookMessage {
  type: 'message' | 'postback' | 'delivery' | 'read';
  pageId: string;
  senderId: string;
  recipientId?: string;
  timestamp: number;
  messageId?: string;
  text?: string;
  attachments?: any[];
  quickReply?: any;
  isEcho?: boolean;
  payload?: string;
  title?: string;
  mids?: string[];
  watermark?: number;
  created_time?: string;
}

interface UseWebsocketMessagesProps {
  websocketMessages: WebhookMessage[];
}

export function useWebsocketMessages({ websocketMessages }: UseWebsocketMessagesProps) {
  const { conversations, addWebsocketConversationToStore, loadMultiplePageConversations } = useConversations();
  const { pages } = usePages();
  const processedMessagesRef = useRef<Set<string>>(new Set());

  const processWebsocketMessage = useCallback((wsData: WebhookMessage) => {
    if (wsData.type !== 'message' || !wsData.text || wsData.isEcho) {
      return;
    }

    // Check if message already processed
    const messageKey = `${wsData.messageId}_${wsData.timestamp}`;
    if (processedMessagesRef.current.has(messageKey)) {
      return;
    }
    processedMessagesRef.current.add(messageKey);

    console.log('✅ MESSAGE DATA DETECTED:', {
      pageId: wsData.pageId,
      senderId: wsData.senderId,
      recipientId: wsData.recipientId,
      text: wsData.text
    });

    // Find conversation by comparing pageId and senderId with senders.data
    const existingConversation = conversations.find(conv => {
      const pageIdMatch = conv.pageId === wsData.pageId;
      const senderIdMatch = conv.senders?.data?.[0]?.id === wsData.senderId;
      const recipientIdMatch = conv.senders?.data?.[1]?.id === wsData.recipientId;
      
      return pageIdMatch && senderIdMatch && recipientIdMatch;
    });

    console.log('🔍 SEARCHING FOR CONVERSATION:', {
      searchPageId: wsData.pageId,
      searchSenderId: wsData.senderId,
      searchRecipientId: wsData.recipientId,
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
        updated_time: wsData.created_time || new Date(wsData.timestamp).toISOString(),
        unread_count: existingConversation.unread_count + 1,
      };

      // Move to top and update
      addWebsocketConversationToStore(updatedConversation, wsData.pageId);
    } else {
      // Conversation not found in store, fetch entire list
      console.log('❌ CONVERSATION NOT FOUND, FETCHING ENTIRE LIST...');
      
      // Get page IDs from conversations or use all pages
      const pageIds = conversations.length > 0 
        ? Array.from(new Set(conversations.map(conv => conv.pageId).filter(Boolean)))
        : pages.map(p => p.id);

      if (pageIds.length > 0 && pages.length > 0) {
        const pageAccessTokens: Record<string, string> = {};
        const validPageIds: string[] = [];
        
        pageIds.forEach(pageId => {
          if (pageId) {
            const page = pages.find(p => p.id === pageId);
            if (page && page.access_token) {
              pageAccessTokens[pageId] = page.access_token;
              validPageIds.push(pageId);
            }
          }
        });

        console.log('🔄 FETCHING CONVERSATIONS WITH:', {
          validPageIds,
          pageAccessTokens: Object.keys(pageAccessTokens)
        });

        if (validPageIds.length > 0) {
          // Use requestAnimationFrame to avoid React #185 error
          requestAnimationFrame(() => {
            loadMultiplePageConversations({
              pageIds: validPageIds,
              pageAccessTokens,
              limit: 25,
            });
          });
        } else {
          console.log('⚠️ NO VALID PAGE IDS OR ACCESS TOKENS FOUND');
        }
      } else {
        console.log('⚠️ NO PAGE IDS OR PAGES AVAILABLE');
      }
    }
  }, [conversations, addWebsocketConversationToStore, loadMultiplePageConversations, pages]);

  useEffect(() => {
    if (websocketMessages.length === 0) return;

    console.log('🔍 WEBSOCKET MESSAGES RECEIVED:', websocketMessages);

    // Process each message
    websocketMessages.forEach(wsData => {
      console.log('📨 PROCESSING WEBSOCKET MESSAGE:', wsData);
      processWebsocketMessage(wsData);
    });
  }, [websocketMessages, processWebsocketMessage]);

  // Clean up processed messages periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (processedMessagesRef.current.size > 100) {
        processedMessagesRef.current.clear();
      }
    }, 60000); // Clean up every minute

    return () => clearInterval(interval);
  }, []);
}

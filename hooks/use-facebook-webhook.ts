"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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
}

interface UseFacebookWebhookOptions {
  pageIds?: string[]; // pages to subscribe to
  accessToken?: string; // page or user token if needed by backend
  autoConnect?: boolean;
}

interface UseFacebookWebhookReturn {
  messages: WebhookMessage[];
  conversations: any[]; // Conversations from backend
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  clearMessages: () => void;
}

export function useFacebookWebhook(
  options: UseFacebookWebhookOptions = {}
): UseFacebookWebhookReturn {
  const { pageIds = [], accessToken, autoConnect = true } = options;
  
  const [messages, setMessages] = useState<WebhookMessage[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      // Railway backend WebSocket server
      const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://sellbridge-backend-production.up.railway.app';
      
      console.log('Connecting to WebSocket:', SOCKET_URL);
      
      // Use cookie-based authentication (no manual token needed)
      
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        withCredentials: true, // Send cookies for authentication
      });

      socket.on('connect', () => {
        console.log('WebSocket connected:', socket.id);
        setIsConnected(true);
        setError(null);
        // After connected, send subscription payload
        const payload = {
          accessToken,
          pageIds,
        };
        socket.emit('connectPages', payload);
        console.log('Sent connectPages payload:', payload);
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
        setIsConnected(false);
      });

      socket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err);
        setError(`Connection error: ${err.message}`);
        setIsConnected(false);
      });

      // Listen for Facebook messages
      socket.on('new_message', (data: WebhookMessage) => {
        console.log('📨 RECEIVED NEW FACEBOOK MESSAGE:', data);
        setMessages((prev) => [data, ...prev]);
      });

      // Listen for new conversations (emitted by backend)
      socket.on('new_conversation', (data: any) => {
        console.log('💬 RECEIVED NEW CONVERSATION:', data);
        setConversations((prev) => {
          // Check if conversation already exists (update if exists, add if new)
          const existingIndex = prev.findIndex(conv => conv.id === data.id);
          if (existingIndex >= 0) {
            // Update existing conversation
            const updated = [...prev];
            updated[existingIndex] = {
              ...data,
              message_count: updated[existingIndex].message_count + 1,
              unread_count: updated[existingIndex].unread_count + 1,
            };
            return updated;
          } else {
            // Add new conversation at the beginning (newest first)
            return [data, ...prev];
          }
        });
      });



      socketRef.current = socket;
    } catch (err) {
      console.error('Error creating socket:', err);
      setError(`Failed to create socket: ${err}`);
    }
  }, [JSON.stringify(pageIds), accessToken]);

  // Re-subscribe when pageIds change on an active socket
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected) {
      const payload = { accessToken, pageIds };
      socketRef.current.emit('connectPages', payload);
      console.log('Updated connectPages payload:', payload);
    }
  }, [JSON.stringify(pageIds), accessToken]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('Disconnecting WebSocket');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversations([]);
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    messages,
    conversations,
    isConnected,
    error,
    connect,
    disconnect,
    clearMessages,
  };
}


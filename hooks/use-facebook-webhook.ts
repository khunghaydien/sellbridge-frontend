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
  pageId?: string;
  autoConnect?: boolean;
}

interface UseFacebookWebhookReturn {
  messages: WebhookMessage[];
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  clearMessages: () => void;
}

export function useFacebookWebhook(
  options: UseFacebookWebhookOptions = {}
): UseFacebookWebhookReturn {
  const { pageId, autoConnect = true } = options;
  
  const [messages, setMessages] = useState<WebhookMessage[]>([]);
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
        console.log('Received new Facebook message:', data);
        setMessages((prev) => [data, ...prev]);
      });



      socketRef.current = socket;
    } catch (err) {
      console.error('Error creating socket:', err);
      setError(`Failed to create socket: ${err}`);
    }
  }, [pageId]);

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
    isConnected,
    error,
    connect,
    disconnect,
    clearMessages,
  };
}


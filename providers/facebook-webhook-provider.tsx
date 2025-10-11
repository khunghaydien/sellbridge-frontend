"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useFacebookWebhook } from '@/hooks/use-facebook-webhook';

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

interface FacebookWebhookContextType {
  messages: WebhookMessage[];
  isConnected: boolean;
  error: string | null;
  clearMessages: () => void;
}

const FacebookWebhookContext = createContext<FacebookWebhookContextType | undefined>(undefined);

export function FacebookWebhookProvider({ children }: { children: ReactNode }) {
  const webhook = useFacebookWebhook({ 
    autoConnect: true // Always auto-connect
  });

  return (
    <FacebookWebhookContext.Provider value={webhook}>
      {children}
    </FacebookWebhookContext.Provider>
  );
}

export function useFacebookWebhookContext() {
  const context = useContext(FacebookWebhookContext);
  if (context === undefined) {
    throw new Error('useFacebookWebhookContext must be used within a FacebookWebhookProvider');
  }
  return context;
}


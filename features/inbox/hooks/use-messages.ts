import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMessages,
  sendMessage,
  clearMessages,
  clearMessageError,
  selectMessages,
  selectMessagePaging,
  selectMessagesLoading,
  selectMessagesError,
  selectIsSendingMessage,
  selectSendMessageError,
  selectMessageCurrentConversationId,
  selectMessagePageAccessToken,
  selectHasMessages,
} from '@/store/slices';
import type { GetMessagesParams, SendMessageParams } from '../services';

export function useMessages() {
  const dispatch = useAppDispatch();

  // Selectors
  const messages = useAppSelector(selectMessages);
  const paging = useAppSelector(selectMessagePaging);
  const isLoading = useAppSelector(selectMessagesLoading);
  const error = useAppSelector(selectMessagesError);
  const isSending = useAppSelector(selectIsSendingMessage);
  const sendError = useAppSelector(selectSendMessageError);
  const currentConversationId = useAppSelector(selectMessageCurrentConversationId);
  const currentPageAccessToken = useAppSelector(selectMessagePageAccessToken);
  const hasMessages = useAppSelector(selectHasMessages);

  // Actions
  const loadMessages = useCallback(
    (params: GetMessagesParams) => {
      console.log('loadMessages called with params:', params);
      return dispatch(fetchMessages(params));
    },
    [dispatch]
  );

  const sendNewMessage = useCallback(
    (params: SendMessageParams) => {
      console.log('sendNewMessage called with params:', params);
      return dispatch(sendMessage(params));
    },
    [dispatch]
  );

  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  const clearMessagesError = useCallback(() => {
    dispatch(clearMessageError());
  }, [dispatch]);

  return {
    // State
    messages,
    paging,
    isLoading,
    error,
    isSending,
    sendError,
    currentConversationId,
    currentPageAccessToken,
    hasMessages,

    // Actions
    loadMessages,
    sendNewMessage,
    clearAllMessages,
    clearMessagesError,
  };
}


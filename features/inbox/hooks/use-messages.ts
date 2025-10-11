import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMessages,
  sendMessage,
  clearMessages,
  clearError,
  selectMessages,
  selectMessagePaging,
  selectMessagesLoading,
  selectMessagesError,
  selectIsSendingMessage,
  selectSendMessageError,
  selectCurrentConversationId,
  selectCurrentPageAccessToken,
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
  const currentConversationId = useAppSelector(selectCurrentConversationId);
  const currentPageAccessToken = useAppSelector(selectCurrentPageAccessToken);
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

  const clearMessageError = useCallback(() => {
    dispatch(clearError());
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
    clearMessageError,
  };
}


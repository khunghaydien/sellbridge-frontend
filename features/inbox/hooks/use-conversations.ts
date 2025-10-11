import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchConversations,
  setSelectedConversation,
  clearConversations,
  clearConversationError,
  selectConversations,
  selectConversationPaging,
  selectConversationsLoading,
  selectConversationsError,
  selectSelectedConversationId,
  selectSelectedConversation,
  selectHasConversations,
  selectConversationCurrentPageId,
  selectConversationPageAccessToken,
} from '@/store/slices';
import type { GetConversationsParams } from '../services';

export function useConversations() {
  const dispatch = useAppDispatch();

  // Selectors
  const conversations = useAppSelector(selectConversations);
  const paging = useAppSelector(selectConversationPaging);
  const isLoading = useAppSelector(selectConversationsLoading);
  const error = useAppSelector(selectConversationsError);
  const selectedConversationId = useAppSelector(selectSelectedConversationId);
  const selectedConversation = useAppSelector(selectSelectedConversation);
  const hasConversations = useAppSelector(selectHasConversations);
  const currentPageId = useAppSelector(selectConversationCurrentPageId);
  const currentPageAccessToken = useAppSelector(selectConversationPageAccessToken);

  // Actions
  const loadConversations = useCallback(
    (params: GetConversationsParams) => {
      console.log('loadConversations called with params:', params);
      return dispatch(fetchConversations(params));
    },
    [dispatch]
  );

  const selectConversation = useCallback(
    (conversationId: string | null) => {
      dispatch(setSelectedConversation(conversationId));
    },
    [dispatch]
  );

  const clearAllConversations = useCallback(() => {
    dispatch(clearConversations());
  }, [dispatch]);

  const clearConversationsError = useCallback(() => {
    dispatch(clearConversationError());
  }, [dispatch]);

  return {
    // State
    conversations,
    paging,
    isLoading,
    error,
    selectedConversationId,
    selectedConversation,
    hasConversations,
    currentPageId,
    currentPageAccessToken,

    // Actions
    loadConversations,
    selectConversation,
    clearAllConversations,
    clearConversationsError,
  };
}


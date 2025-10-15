import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchConversations,
  fetchMultiplePageConversations,
  setSelectedConversation,
  clearConversations,
  clearConversationError,
  addWebsocketConversation,
  selectConversations,
  selectConversationPaging,
  selectConversationsLoading,
  selectConversationsError,
  selectSelectedConversationId,
  selectSelectedConversation,
  selectHasConversations,
  selectConversationPageMapping,
  selectCurrentPageAccessTokens,
} from '@/store/slices';
import type { GetConversationsParams, GetMultiplePageConversationsParams } from '../services';

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
  const conversationPageMapping = useAppSelector(selectConversationPageMapping);
  const currentPageAccessTokens = useAppSelector(selectCurrentPageAccessTokens);

  // Actions
  const loadConversations = useCallback(
    (params: GetConversationsParams) => {
      return dispatch(fetchConversations(params));
    },
    [dispatch]
  );

  const loadMultiplePageConversations = useCallback(
    (params: GetMultiplePageConversationsParams) => {
      return dispatch(fetchMultiplePageConversations(params));
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

  const addWebsocketConversationToStore = useCallback((conversation: any, pageId: string) => {
    dispatch(addWebsocketConversation({ conversation, pageId }));
  }, [dispatch]);

  // Helper function to get access token for a conversation
  const getConversationAccessToken = useCallback((conversationId: string) => {
    const pageId = conversationPageMapping[conversationId];
    return pageId ? currentPageAccessTokens[pageId] : null;
  }, [conversationPageMapping, currentPageAccessTokens]);

  return {
    // State
    conversations,
    paging,
    isLoading,
    error,
    selectedConversationId,
    selectedConversation,
    hasConversations,
    conversationPageMapping,
    currentPageAccessTokens,

    // Actions
    loadConversations,
    loadMultiplePageConversations,
    selectConversation,
    clearAllConversations,
    clearConversationsError,
    addWebsocketConversationToStore,
    getConversationAccessToken,
  };
}


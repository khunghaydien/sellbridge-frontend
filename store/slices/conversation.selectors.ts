import { RootState } from '../index';

// Selectors
export const selectConversations = (state: RootState) => state.conversation.conversations;
export const selectConversationPaging = (state: RootState) => state.conversation.paging;
export const selectConversationsLoading = (state: RootState) => state.conversation.isLoading;
export const selectConversationsError = (state: RootState) => state.conversation.error;
export const selectSelectedConversationId = (state: RootState) => state.conversation.selectedConversationId;

// Select the selected conversation object
export const selectSelectedConversation = (state: RootState) => {
  if (!state.conversation.selectedConversationId) return null;
  return state.conversation.conversations.find(
    conv => conv.id === state.conversation.selectedConversationId
  ) || null;
};

// Check if conversations are empty
export const selectHasConversations = (state: RootState) => state.conversation.conversations.length > 0;

// New selectors for multi-page support
export const selectConversationPageMapping = (state: RootState) => state.conversation.conversationPageMapping;
export const selectCurrentPageAccessTokens = (state: RootState) => state.conversation.currentPageAccessTokens;

// Helper selector to get access token for a conversation
export const selectConversationAccessToken = (conversationId: string) => (state: RootState) => {
  const pageId = state.conversation.conversationPageMapping[conversationId];
  return pageId ? state.conversation.currentPageAccessTokens[pageId] : null;
};


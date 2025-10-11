import { RootState } from '../index';

// Selectors
export const selectConversations = (state: RootState) => state.conversation.conversations;
export const selectConversationPaging = (state: RootState) => state.conversation.paging;
export const selectConversationsLoading = (state: RootState) => state.conversation.isLoading;
export const selectConversationsError = (state: RootState) => state.conversation.error;
export const selectSelectedConversationId = (state: RootState) => state.conversation.selectedConversationId;
export const selectConversationCurrentPageId = (state: RootState) => state.conversation.currentPageId;
export const selectConversationPageAccessToken = (state: RootState) => state.conversation.currentPageAccessToken;

// Select the selected conversation object
export const selectSelectedConversation = (state: RootState) => {
  if (!state.conversation.selectedConversationId) return null;
  return state.conversation.conversations.find(
    conv => conv.id === state.conversation.selectedConversationId
  ) || null;
};

// Check if conversations are empty
export const selectHasConversations = (state: RootState) => state.conversation.conversations.length > 0;


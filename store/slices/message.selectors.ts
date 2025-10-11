import { RootState } from '../index';

// Selectors
export const selectMessages = (state: RootState) => state.message.messages;
export const selectMessagePaging = (state: RootState) => state.message.paging;
export const selectMessagesLoading = (state: RootState) => state.message.isLoading;
export const selectMessagesError = (state: RootState) => state.message.error;
export const selectIsSendingMessage = (state: RootState) => state.message.isSending;
export const selectSendMessageError = (state: RootState) => state.message.sendError;
export const selectCurrentConversationId = (state: RootState) => state.message.currentConversationId;
export const selectCurrentPageAccessToken = (state: RootState) => state.message.currentPageAccessToken;

// Check if messages are empty
export const selectHasMessages = (state: RootState) => state.message.messages.length > 0;


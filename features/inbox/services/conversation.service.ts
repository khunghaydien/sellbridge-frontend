import { authApi } from "@/services";

export interface GetConversationsParams {
  pageId: string;
  pageAccessToken: string;
  limit?: number;
  after?: string;
  before?: string;
}

export interface GetMultiplePageConversationsParams {
  pageIds: string[];
  pageAccessTokens: Record<string, string>;
  limit?: number;
}

export interface GetMessagesParams {
  conversationId: string;
  pageAccessToken: string;
  limit?: number;
  after?: string;
  before?: string;
}

export interface SendMessageParams {
  pageId: string;
  recipientId: string;
  message: string;
  pageAccessToken: string;
}

export class ConversationService {
  /**
   * Get conversations for a specific Facebook page
   */
  static async getPageConversations(params: GetConversationsParams) {
    try {
      const { pageId, pageAccessToken, limit, after, before } = params;
      
      // Build query params
      const queryParams = new URLSearchParams({
        pageAccessToken,
        ...(limit && { limit: limit.toString() }),
        ...(after && { after }),
        ...(before && { before }),
      });

      const response = await authApi.get(
        `/facebook/pages/${pageId}/conversations?${queryParams.toString()}`
      );
      
      console.log('ConversationService.getPageConversations response:', response);
      return response.data;
    } catch (error: any) {
      console.error('ConversationService.getPageConversations error:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Get conversations from multiple Facebook pages (aggregated)
   */
  static async getMultiplePageConversations(params: GetMultiplePageConversationsParams) {
    try {
      const { pageIds, pageAccessTokens, limit } = params;
      
      console.log('ConversationService.getMultiplePageConversations called with:', params);
      
      const response = await authApi.post(
        `/facebook/conversations/multiple`,
        {
          pageIds,
          pageAccessTokens,
          limit,
        }
      );
      
      console.log('ConversationService.getMultiplePageConversations response:', response);
      return response.data;
    } catch (error: any) {
      console.error('ConversationService.getMultiplePageConversations error:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Get messages for a specific conversation
   */
  static async getConversationMessages(params: GetMessagesParams) {
    try {
      const { conversationId, pageAccessToken, limit, after, before } = params;
      
      // Build query params
      const queryParams = new URLSearchParams({
        pageAccessToken,
        ...(limit && { limit: limit.toString() }),
        ...(after && { after }),
        ...(before && { before }),
      });

      console.log('ConversationService.getConversationMessages called with:', params);
      
      const response = await authApi.get(
        `/facebook/conversations/${conversationId}/messages?${queryParams.toString()}`
      );
      
      console.log('ConversationService.getConversationMessages response:', response);
      return response.data;
    } catch (error: any) {
      console.error('ConversationService.getConversationMessages error:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Send a message via Page
   */
  static async sendMessage(params: SendMessageParams) {
    try {
      const { pageId, recipientId, message, pageAccessToken } = params;
      
      console.log('ConversationService.sendMessage called with:', { pageId, recipientId, message });
      
      const response = await authApi.post(
        `/facebook/pages/${pageId}/messages`,
        {
          recipientId,
          message,
          pageAccessToken,
        }
      );
      
      console.log('ConversationService.sendMessage response:', response);
      return response.data;
    } catch (error: any) {
      console.error('ConversationService.sendMessage error:', error);
      throw new Error(error.message);
    }
  }
}


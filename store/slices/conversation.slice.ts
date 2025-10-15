import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ConversationService, GetConversationsParams, GetMultiplePageConversationsParams } from '@/features/inbox/services';
import { RootState } from '../index';

// Define types
export interface Participant {
  name: string;
  id: string;
  picture?: string | null;
}

export interface Conversation {
  id: string;
  link: string;
  message_count: number;
  participants: {
    data: Participant[];
  };
  senders: {
    data: Participant[];
  };
  snippet: string;
  unread_count: number;
  updated_time: string;
  pageId?: string; // Added for multi-page support
}

export interface ConversationPaging {
  cursors?: {
    before: string;
    after: string;
  };
  next?: string;
  previous?: string;
}

interface ConversationState {
  conversations: Conversation[];
  paging: ConversationPaging | null;
  currentPageIds: string[]; // Added for multi-page support
  currentPageAccessTokens: Record<string, string>; // Added for multi-page support
  conversationPageMapping: Record<string, string>; // Maps conversationId to pageId
  isLoading: boolean;
  error: string | null;
  selectedConversationId: string | null;
}

// Initial state
const initialState: ConversationState = {
  conversations: [],
  paging: null,
  currentPageIds: [],
  currentPageAccessTokens: {},
  conversationPageMapping: {}, // Maps conversationId to pageId
  isLoading: false,
  error: null,
  selectedConversationId: null,
};

// Async thunk to fetch conversations
export const fetchConversations = createAsyncThunk(
  'conversation/fetchConversations',
  async (params: GetConversationsParams, { rejectWithValue }) => {
    try {
      const response = await ConversationService.getPageConversations(params);
      return { response, params };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch conversations');
    }
  }
);

// Async thunk to fetch conversations from multiple pages
export const fetchMultiplePageConversations = createAsyncThunk(
  'conversation/fetchMultiplePageConversations',
  async (params: GetMultiplePageConversationsParams, { rejectWithValue }) => {
    try {
      const response = await ConversationService.getMultiplePageConversations(params);
      return { response, params };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch multiple page conversations');
    }
  }
);

// Create slice
const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    // Sync actions
    setSelectedConversation: (state, action: PayloadAction<string | null>) => {
      state.selectedConversationId = action.payload;
    },
    clearConversations: (state) => {
      state.conversations = [];
      state.paging = null;
      state.error = null;
      state.selectedConversationId = null;
      state.conversationPageMapping = {};
    },
    // Add websocket conversation with page mapping
    addWebsocketConversation: (state, action: PayloadAction<{ conversation: Conversation; pageId: string }>) => {
      const { conversation, pageId } = action.payload;
      
      // Update conversation page mapping
      state.conversationPageMapping[conversation.id] = pageId;
      
      // Check if conversation already exists
      const existingIndex = state.conversations.findIndex(conv => conv.id === conversation.id);
      
      if (existingIndex >= 0) {
        // Update existing conversation and move to top
        const updatedConversation = {
          ...state.conversations[existingIndex],
          ...conversation,
          pageId: pageId,
        };
        
        // Remove from current position
        state.conversations.splice(existingIndex, 1);
        // Add to beginning (top of list)
        state.conversations.unshift(updatedConversation);
      } else {
        // Add new conversation to top
        state.conversations.unshift({
          ...conversation,
          pageId: pageId,
        });
      }
    },
    clearConversationError: (state) => {
      state.error = null;
    },
    // Update conversation snippet from message data
    updateConversationSnippet: (state, action: PayloadAction<{ conversationId: string; snippet: string; updated_time: string }>) => {
      const { conversationId, snippet, updated_time } = action.payload;
      const conversationIndex = state.conversations.findIndex(conv => conv.id === conversationId);
      
      if (conversationIndex >= 0) {
        // Update snippet and time
        state.conversations[conversationIndex].snippet = snippet;
        state.conversations[conversationIndex].updated_time = updated_time;
        state.conversations[conversationIndex].unread_count += 1;
        
        // Move to top
        const updatedConversation = state.conversations[conversationIndex];
        state.conversations.splice(conversationIndex, 1);
        state.conversations.unshift(updatedConversation);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations - pending
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fetch conversations - fulfilled
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        const { response } = action.payload;
        
        // Handle nested data structure: response.data.data
        if (response.data && Array.isArray(response.data.data)) {
          state.conversations = response.data.data;
          state.paging = response.data.paging || null;
        } else if (Array.isArray(response.data)) {
          state.conversations = response.data;
        } else if (Array.isArray(response)) {
          state.conversations = response;
        }
        state.error = null;
      })
      // Fetch conversations - rejected
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch multiple page conversations - pending
      .addCase(fetchMultiplePageConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fetch multiple page conversations - fulfilled
      .addCase(fetchMultiplePageConversations.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        const { response, params } = action.payload;
        
        // Store current page info
        state.currentPageIds = params.pageIds;
        state.currentPageAccessTokens = params.pageAccessTokens;
        
        // Handle nested data structure: response.data.data
        let conversations = [];
        if (response.data && Array.isArray(response.data.data)) {
          conversations = response.data.data;
          state.paging = response.data.paging || null;
        } else if (Array.isArray(response.data)) {
          conversations = response.data;
        } else if (Array.isArray(response)) {
          conversations = response;
        }
        
        // Create conversation to page mapping
        const conversationPageMapping: Record<string, string> = {};
        conversations.forEach((conv: Conversation) => {
          if (conv.pageId) {
            conversationPageMapping[conv.id] = conv.pageId;
          }
        });
        
        state.conversations = conversations;
        state.conversationPageMapping = conversationPageMapping;
        state.error = null;
      })
      // Fetch multiple page conversations - rejected
      .addCase(fetchMultiplePageConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { setSelectedConversation, clearConversations, clearConversationError, addWebsocketConversation, updateConversationSnippet } = conversationSlice.actions;


// Export reducer
export default conversationSlice.reducer;


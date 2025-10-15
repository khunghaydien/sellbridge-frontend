import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ConversationService, GetConversationsParams, GetMultiplePageConversationsParams } from '@/features/inbox/services';

// Define types
export interface Participant {
  name: string;
  email: string;
  id: string;
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
  currentPageId: string | null;
  currentPageAccessToken: string | null;
  currentPageIds: string[]; // Added for multi-page support
  currentPageAccessTokens: Record<string, string>; // Added for multi-page support
  isLoading: boolean;
  error: string | null;
  selectedConversationId: string | null;
}

// Initial state
const initialState: ConversationState = {
  conversations: [],
  paging: null,
  currentPageId: null,
  currentPageAccessToken: null,
  currentPageIds: [],
  currentPageAccessTokens: {},
  isLoading: false,
  error: null,
  selectedConversationId: null,
};

// Async thunk to fetch conversations
export const fetchConversations = createAsyncThunk(
  'conversation/fetchConversations',
  async (params: GetConversationsParams, { rejectWithValue }) => {
    try {
      console.log('fetchConversations thunk started with params:', params);
      const response = await ConversationService.getPageConversations(params);
      console.log('fetchConversations response:', response);
      return { response, params };
    } catch (error: any) {
      console.error('fetchConversations error:', error);
      return rejectWithValue(error.message || 'Failed to fetch conversations');
    }
  }
);

// Async thunk to fetch conversations from multiple pages
export const fetchMultiplePageConversations = createAsyncThunk(
  'conversation/fetchMultiplePageConversations',
  async (params: GetMultiplePageConversationsParams, { rejectWithValue }) => {
    try {
      console.log('fetchMultiplePageConversations thunk started with params:', params);
      const response = await ConversationService.getMultiplePageConversations(params);
      console.log('fetchMultiplePageConversations response:', response);
      return { response, params };
    } catch (error: any) {
      console.error('fetchMultiplePageConversations error:', error);
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
    },
    clearConversationError: (state) => {
      state.error = null;
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
        const { response, params } = action.payload;
        
        // Store current page info
        state.currentPageId = params.pageId;
        state.currentPageAccessToken = params.pageAccessToken;
        
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
      // Fetch multiple page conversations - rejected
      .addCase(fetchMultiplePageConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { setSelectedConversation, clearConversations, clearConversationError } = conversationSlice.actions;

// Export reducer
export default conversationSlice.reducer;


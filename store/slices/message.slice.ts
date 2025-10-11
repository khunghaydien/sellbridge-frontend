import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ConversationService, GetMessagesParams, SendMessageParams } from '@/features/inbox/services';

// Define types
export interface MessageAttachment {
  id?: string;
  image_data?: {
    url: string;
    preview_url?: string;
  };
  mime_type?: string;
  name?: string;
  size?: number;
}

export interface Message {
  id: string;
  created_time: string;
  from: {
    name: string;
    email: string;
    id: string;
  };
  message?: string;
  attachments?: {
    data: MessageAttachment[];
  };
}

export interface MessagePaging {
  cursors?: {
    before: string;
    after: string;
  };
  next?: string;
  previous?: string;
}

interface MessageState {
  messages: Message[];
  paging: MessagePaging | null;
  currentConversationId: string | null;
  currentPageAccessToken: string | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendError: string | null;
}

// Initial state
const initialState: MessageState = {
  messages: [],
  paging: null,
  currentConversationId: null,
  currentPageAccessToken: null,
  isLoading: false,
  isSending: false,
  error: null,
  sendError: null,
};

// Async thunk to fetch messages
export const fetchMessages = createAsyncThunk(
  'message/fetchMessages',
  async (params: GetMessagesParams, { rejectWithValue }) => {
    try {
      console.log('fetchMessages thunk started with params:', params);
      const response = await ConversationService.getConversationMessages(params);
      console.log('fetchMessages response:', response);
      return { response, params };
    } catch (error: any) {
      console.error('fetchMessages error:', error);
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

// Async thunk to send message
export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async (params: SendMessageParams, { rejectWithValue }) => {
    try {
      console.log('sendMessage thunk started with params:', params);
      const response = await ConversationService.sendMessage(params);
      console.log('sendMessage response:', response);
      return { response, params };
    } catch (error: any) {
      console.error('sendMessage error:', error);
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

// Create slice
const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.paging = null;
      state.error = null;
    },
    clearMessageError: (state) => {
      state.error = null;
      state.sendError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages - pending
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fetch messages - fulfilled
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        const { response, params } = action.payload;
        
        // Store current conversation info
        state.currentConversationId = params.conversationId;
        state.currentPageAccessToken = params.pageAccessToken;
        
        // Handle nested data structure
        if (response.data && Array.isArray(response.data.data)) {
          state.messages = response.data.data;
          state.paging = response.data.paging || null;
        } else if (Array.isArray(response.data)) {
          state.messages = response.data;
        } else if (Array.isArray(response)) {
          state.messages = response;
        }
        state.error = null;
      })
      // Fetch messages - rejected
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send message - pending
      .addCase(sendMessage.pending, (state) => {
        state.isSending = true;
        state.sendError = null;
      })
      // Send message - fulfilled
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<any>) => {
        state.isSending = false;
        // Optionally add the sent message to the messages array
        // const { response } = action.payload;
        // if (response.data) {
        //   state.messages.push(response.data);
        // }
        state.sendError = null;
      })
      // Send message - rejected
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSending = false;
        state.sendError = action.payload as string;
      });
  },
});

// Export actions
export const { clearMessages, clearMessageError } = messageSlice.actions;

// Export reducer
export default messageSlice.reducer;


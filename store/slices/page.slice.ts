import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PageService } from '@/features/page/services';

// Define types
export interface Page {
  id: string;
  name: string;
  category: string;
  access_token: string;
  tasks: string[];
}

export interface PagingInfo {
  cursors?: {
    before: string;
    after: string;
  };
}

interface PageState {
  pages: Page[];
  paging: PagingInfo | null;
  isLoading: boolean;
  error: string | null;
  selectedPageId: string | null;
}

// Initial state
const initialState: PageState = {
  pages: [],
  paging: null,
  isLoading: false,
  error: null,
  selectedPageId: null,
};

// Async thunk to fetch pages
export const fetchPages = createAsyncThunk(
  'page/fetchPages',
  async (_, { rejectWithValue }) => {
    try {
      console.log('fetchPages thunk started...');
      const response = await PageService.listPages();
      console.log('fetchPages response:', response);
      return response;
    } catch (error: any) {
      console.error('fetchPages error:', error);
      return rejectWithValue(error.message || 'Failed to fetch pages');
    }
  }
);

// Create slice
const pageSlice = createSlice({
  name: 'page',
  initialState,
  reducers: {
    // Sync actions
    setSelectedPage: (state, action: PayloadAction<string | null>) => {
      state.selectedPageId = action.payload;
    },
    clearPages: (state) => {
      state.pages = [];
      state.error = null;
      state.selectedPageId = null;
    },
    clearPageError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch pages - pending
      .addCase(fetchPages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      // Fetch pages - fulfilled
      .addCase(fetchPages.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Handle nested data structure: response.data.data
        if (action.payload.data && Array.isArray(action.payload.data.data)) {
          state.pages = action.payload.data.data;
          state.paging = action.payload.data.paging || null;
        } else if (Array.isArray(action.payload.data)) {
          state.pages = action.payload.data;
        } else if (Array.isArray(action.payload)) {
          state.pages = action.payload;
        }
        state.error = null;
      })
      // Fetch pages - rejected
      .addCase(fetchPages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { setSelectedPage, clearPages, clearPageError } = pageSlice.actions;

// Export reducer
export default pageSlice.reducer;


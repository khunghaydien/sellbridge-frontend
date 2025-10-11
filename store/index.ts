import { configureStore } from '@reduxjs/toolkit';
import { pageReducer, conversationReducer, messageReducer } from './slices';

// Configure store
export const store = configureStore({
  reducer: {
    page: pageReducer,
    conversation: conversationReducer,
    message: messageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['your/action/type'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


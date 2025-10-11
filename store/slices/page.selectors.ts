import { RootState } from '../index';

// Selectors
export const selectPages = (state: RootState) => state.page.pages;
export const selectPaging = (state: RootState) => state.page.paging;
export const selectPagesLoading = (state: RootState) => state.page.isLoading;
export const selectPagesError = (state: RootState) => state.page.error;
export const selectSelectedPageId = (state: RootState) => state.page.selectedPageId;

// Select the selected page object
export const selectSelectedPage = (state: RootState) => {
  if (!state.page.selectedPageId) return null;
  return state.page.pages.find(page => page.id === state.page.selectedPageId) || null;
};

// Check if pages are empty
export const selectHasPages = (state: RootState) => state.page.pages.length > 0;


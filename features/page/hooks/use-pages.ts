import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPages,
  setSelectedPage,
  clearPages,
  clearPageError,
  selectPages,
  selectPaging,
  selectPagesLoading,
  selectPagesError,
  selectSelectedPageId,
  selectSelectedPage,
  selectHasPages,
} from '@/store/slices';

export function usePages() {
  const dispatch = useAppDispatch();

  // Selectors
  const pages = useAppSelector(selectPages);
  const paging = useAppSelector(selectPaging);
  const isLoading = useAppSelector(selectPagesLoading);
  const error = useAppSelector(selectPagesError);
  const selectedPageId = useAppSelector(selectSelectedPageId);
  const selectedPage = useAppSelector(selectSelectedPage);
  const hasPages = useAppSelector(selectHasPages);
  const selectedPageIds = useAppSelector((state) => state.page.selectedPageIds);

  // Actions
  const loadPages = useCallback(() => {
    console.log('loadPages called, dispatching fetchPages...');
    return dispatch(fetchPages());
  }, [dispatch]);

  const selectPage = useCallback(
    (pageId: string | null) => {
      dispatch(setSelectedPage(pageId));
    },
    [dispatch]
  );

  const toggleSelectPage = useCallback((pageId: string) => {
    dispatch({ type: 'page/toggleSelectPage', payload: pageId });
  }, [dispatch]);

  const setSelectedPages = useCallback((pageIds: string[]) => {
    dispatch({ type: 'page/setSelectedPages', payload: pageIds });
  }, [dispatch]);

  const clearSelectedPages = useCallback(() => {
    dispatch({ type: 'page/clearSelectedPages' });
  }, [dispatch]);

  const clearAllPages = useCallback(() => {
    dispatch(clearPages());
  }, [dispatch]);

  const clearPagesError = useCallback(() => {
    dispatch(clearPageError());
  }, [dispatch]);

  return {
    // State
    pages,
    paging,
    isLoading,
    error,
    selectedPageId,
    selectedPage,
    hasPages,
    selectedPageIds,
    
    // Actions
    loadPages,
    selectPage,
    toggleSelectPage,
    setSelectedPages,
    clearSelectedPages,
    clearAllPages,
    clearPagesError,
  };
}


"use client";

import { Provider } from 'react-redux';
import { store } from '@/store';
import { ReactNode, useEffect } from 'react';

export function ReduxProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    console.log('Redux store initialized:', store.getState());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}


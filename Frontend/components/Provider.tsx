'use client';

import theme from '@/theme';
import { ThemeProvider } from '@emotion/react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import React from 'react'
import { QueriesObserver, QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();

const Provider = ({children}: {children: React.ReactNode}) => {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}

export default Provider

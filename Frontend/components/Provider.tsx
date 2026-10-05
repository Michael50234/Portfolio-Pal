'use client';

import theme from '@/theme';
import { ThemeProvider } from '@emotion/react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import React from 'react'

const Provider = ({children}: {children: React.ReactNode}) => {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}

export default Provider

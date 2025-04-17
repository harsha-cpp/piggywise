"use client";

import { SessionProvider } from "next-auth/react";
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Create a global React Query client that can be accessed by components
// This ensures the same cache is used across all page components
const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Use the shared queryClient instance instead of creating a new one
  return (
    <QueryClientProvider client={globalQueryClient}>
      <AuthProvider>
        <ReduxProvider>{children}</ReduxProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
"use client";

import { SessionProvider } from "next-auth/react";
import { Provider } from 'react-redux';
import { store } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </AuthProvider>
  );
}
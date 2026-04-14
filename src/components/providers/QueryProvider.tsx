'use client';

/**
 * TanStack Query Provider
 *
 * Configures and provides the QueryClient to the application.
 * Includes React Query Devtools in development mode.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch on window focus by default — opt-in per query
            refetchOnWindowFocus: false,
            // Retry once on failure, then surface the error
            retry: 1,
            // Data is considered fresh for 60 seconds
            staleTime: 60 * 1000,
          },
          mutations: {
            // Retry once on failure
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

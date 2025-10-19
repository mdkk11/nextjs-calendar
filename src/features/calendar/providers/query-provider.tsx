'use client';

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { isServer, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import * as React from 'react';

const QUERY_CACHE_PREFIX = 'queryClient';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 60, // 1 hour
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

const localStoragePersister = createSyncStoragePersister({
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  key: QUERY_CACHE_PREFIX,
});

const QueryProvider = (props: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: localStoragePersister }}
    >
      <ReactQueryStreamedHydration>{props.children}</ReactQueryStreamedHydration>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
};

export { QueryProvider };

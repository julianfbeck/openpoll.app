import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import type { Poll } from '@/models/types';
import { ModeratorForm } from './ModeratorForm';
import { Toaster } from './ui/toaster';
import type { AppRouter } from '@/lib/trpc/routers/_app';
import { trpc } from '@/lib/trpc/client';
// Import the trpc object that uses createTRPCReact()

const ModeratorFormWrapper = ({ poll }: { poll: Poll }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <ModeratorForm poll={poll}></ModeratorForm>
        <Toaster />
      </trpc.Provider>
    </QueryClientProvider>
  );
};

export default ModeratorFormWrapper;
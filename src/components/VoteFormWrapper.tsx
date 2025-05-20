import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc/client';
import type { Poll } from '@/models/types';
import { VoteForm } from './VoteForm';
import { Toaster } from './ui/toaster';

const VoteFormWrapper = ({ poll }: { poll: Poll }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc'
        })
      ]
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <VoteForm poll={poll}></VoteForm>
        <Toaster />
      </QueryClientProvider>
    </trpc.Provider>
  );
};
export default VoteFormWrapper;

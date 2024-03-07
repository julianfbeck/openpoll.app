import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { CreatePollForm } from './CreatePollForm';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll } from '@/models/types';
import { VoteForm } from './VoteForm';

const VoteFormWrapper = ({ poll }: { poll: Poll }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc'
        })
      ]
    })
  );

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <VoteForm poll={poll}></VoteForm>
      </QueryClientProvider>
    </trpcReact.Provider>
  );
};
export default VoteFormWrapper;

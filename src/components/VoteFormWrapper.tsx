import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { CreatePollForm } from './CreatePollForm';
import { trpcReact } from '@/lib/trpc/client';
import { VoteForm } from './VoteForm';

const VoteFormWrapper = ({ pollId: shortId }: { pollId: string }) => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpcReact.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:4321/api/trpc'
        })
      ]
    })
  );

  return (
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <VoteForm pollId={shortId}></VoteForm>
      </QueryClientProvider>
    </trpcReact.Provider>
  );
};
export default VoteFormWrapper;

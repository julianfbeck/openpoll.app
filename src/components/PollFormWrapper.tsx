import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { CreatePollForm } from './CreatePollForm';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll } from '@/models/types';
import { PollForm } from './PollForm';

const PollFormWrapper = ({ poll: poll }: { poll: Poll }) => {
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
        <PollForm poll={poll}/>
      </QueryClientProvider>
    </trpcReact.Provider>
  );
};
export default PollFormWrapper;

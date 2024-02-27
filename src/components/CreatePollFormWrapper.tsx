import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { CreatePollForm } from './CreatePollForm';
import { trpcReact } from '@/lib/trpc/client';

const CommentsOverviewWrapper = () => {
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
    // @ts-ignore Error see 
    <trpcReact.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <CreatePollForm></CreatePollForm>
      </QueryClientProvider>
    </trpcReact.Provider>
  );
};
export default CommentsOverviewWrapper;

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { CreatePollForm } from './CreatePollForm';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll } from '@/models/types';
import { VoteForm } from './VoteForm';
import { ModeratorForm } from './ModeratorForm';
import { Toaster } from './ui/toaster';

const ModeratorFormWrapper = ({ poll }: { poll: Poll }) => {
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
        <ModeratorForm poll={poll}></ModeratorForm>
        <Toaster />
      </QueryClientProvider>
    </trpcReact.Provider>
  );
};
export default ModeratorFormWrapper;

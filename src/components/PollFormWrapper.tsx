import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import type { Poll } from '@/models/types';
import { PollForm } from './PollForm';
import type { User } from '@auth/core/types';
import { trpc } from '@/lib/trpc/client';

const PollFormWrapper = ({
  poll: poll,
  user: user
}: {
  poll: Poll;
  user: User | undefined;
}) => {
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
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <PollForm poll={poll} user={user} />
      </trpc.Provider>
    </QueryClientProvider>
  );
};

export default PollFormWrapper;
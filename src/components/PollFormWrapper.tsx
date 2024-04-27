import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpcReact } from '@/lib/trpc/client';
import type { Poll } from '@/models/types';
import { PollForm } from './PollForm';
import type { User } from '@auth/core/types';

const PollFormWrapper = ({
  poll: poll,
  user: user
}: {
  poll: Poll;
  user: User | undefined;
}) => {
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
        <PollForm poll={poll} user={user} />
      </QueryClientProvider>
    </trpcReact.Provider>
  );
};
export default PollFormWrapper;

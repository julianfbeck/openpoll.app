import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { CreatePollForm } from './CreatePollForm';
import { trpc } from '@/lib/trpc/client';
import { Toaster } from './ui/toaster';

const CreatePollFormWrapper = () => {
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
        <CreatePollForm></CreatePollForm>
        <Toaster />
      </QueryClientProvider>
    </trpc.Provider>
  );
};
export default CreatePollFormWrapper;

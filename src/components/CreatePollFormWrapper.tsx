import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { CreatePollForm } from './CreatePollForm';
import { Toaster } from './ui/toaster';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import type { AppRouter } from '@/lib/trpc/routers/_app';

// Create tRPC context
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

const CreatePollFormWrapper = () => {
  // Create Query Client
  const [queryClient] = useState(() => new QueryClient());
  
  // Create tRPC Client
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: '/api/trpc'
        })
      ]
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <CreatePollForm />
        <Toaster />
      </TRPCProvider>
    </QueryClientProvider>
  );
};

export default CreatePollFormWrapper;
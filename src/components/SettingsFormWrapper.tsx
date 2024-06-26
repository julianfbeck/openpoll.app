import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpcReact } from '@/lib/trpc/client';
import { SettingsForm } from './settingsForm';
import { Toaster } from './ui/toaster';

const VoteFormWrapper = () => {
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
        <SettingsForm></SettingsForm>
        <Toaster />
      </QueryClientProvider>
    </trpcReact.Provider>
  );
};
export default VoteFormWrapper;

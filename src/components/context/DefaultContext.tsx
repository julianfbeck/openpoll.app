import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpcReact } from '@/lib/trpc/client';
import { Toaster } from '../ui/toaster';
interface Props {
  children: JSX.Element[] | JSX.Element;
}

const DefaultContext = ({ children }: Props) => {
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      <Toaster />
    </trpcReact.Provider>
  );
};
export default DefaultContext;

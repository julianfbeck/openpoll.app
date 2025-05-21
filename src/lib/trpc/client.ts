import { createTRPCClient, createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './routers/_app';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { QueryClient } from '@tanstack/react-query';


const trpcAstro = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4747/api/trpc'
    })
  ]
});
// export const trpc = createTRPCReact<AppRouter>();

export const queryClient = new QueryClient();
const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: 'http://localhost:2022' })],
});
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

export { trpcAstro };

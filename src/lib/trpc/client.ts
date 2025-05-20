import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './routers/_app';
import { createTRPCReact } from '@trpc/react-query';


const trpcAstro = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4747/api/trpc'
    })
  ]
});
export const trpc = createTRPCReact<AppRouter>();

export { trpcAstro };

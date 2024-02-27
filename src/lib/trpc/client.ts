import { createTRPCReact } from '@trpc/react-query';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './root';

const trpcReact = createTRPCReact<AppRouter>();

const trpcAstro = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4747/api/trpc'
    })
  ]
});

export { trpcReact, trpcAstro };

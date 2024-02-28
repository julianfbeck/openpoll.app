import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './routers/_app';

const trpcReact = createTRPCReact<AppRouter>();

const trpcAstro = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:4747/api/trpc'
    })
  ]
});

export { trpcReact, trpcAstro };

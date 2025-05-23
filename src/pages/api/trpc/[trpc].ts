import { createContext } from '@/lib/trpc/context';
import { appRouter } from '@/lib/trpc/routers/_app';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { APIRoute } from 'astro';

export const ALL: APIRoute = ({ request, locals }) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext: (opts) => createContext({ ...opts, env: locals.runtime?.env })
  });
};

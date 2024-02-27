import { createContext } from '@/lib/trpc/context';
import { appRouter } from '@/lib/trpc/root';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { APIRoute } from 'astro';

export const ALL: APIRoute = ({ request }) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: request,
    router: appRouter,
    createContext
  });
};

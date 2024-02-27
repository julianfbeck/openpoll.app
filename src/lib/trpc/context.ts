import type { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getSession } from 'auth-astro/server';

export function createContext({
  req,
  resHeaders
}: FetchCreateContextFnOptions) {
  const user = getSession(req);
  return { req, resHeaders, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;

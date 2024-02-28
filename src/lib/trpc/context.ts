import type { inferAsyncReturnType } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getSession } from 'auth-astro/server';

export async function createContext({
  req,
  resHeaders
}: FetchCreateContextFnOptions) {
  const user = await getSession(req);
  return { req, resHeaders, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;

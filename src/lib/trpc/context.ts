import { auth } from '../auth';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createContext({
  req,
  resHeaders
}: FetchCreateContextFnOptions) {
  const session = await auth.api.getSession({
    headers: req.headers
  });
  return { req, resHeaders, user: session?.user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

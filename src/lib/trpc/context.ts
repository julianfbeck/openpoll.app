import { auth } from '../auth';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export async function createContext({
  req,
  resHeaders,
  env
}: FetchCreateContextFnOptions & { env?: Env }) {
  const session = await auth.api.getSession({
    headers: req.headers
  });

  return { req, resHeaders, user: session?.user, env };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

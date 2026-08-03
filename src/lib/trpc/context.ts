import { auth } from '../auth';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';

export type Context = {
  req: Request;
  resHeaders: Headers;
  user: unknown;
  env?: ENV;
};

export async function createContext({
  req,
  resHeaders,
  env
}: FetchCreateContextFnOptions & { env?: ENV }): Promise<Context> {
  const session = await auth.api.getSession({
    headers: req.headers
  });

  return { req, resHeaders, user: session?.user, env };
}

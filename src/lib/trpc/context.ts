import { redisClient } from './../redis';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import { getSession } from 'auth-astro/server';

export async function createContext({
  req,
  resHeaders
}: FetchCreateContextFnOptions) {
  const user = await getSession(req);
  const redis = redisClient;
  return { req, resHeaders, user, redis };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

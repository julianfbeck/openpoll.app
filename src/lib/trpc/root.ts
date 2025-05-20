import { initTRPC, TRPCError } from '@trpc/server';

import type { Context } from './context';

export const t = initTRPC.context<Context>().create();

export const middleware = t.middleware;

const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

const rateLimitedAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  // const key = `rate-limit:${ctx.user.user?.id}`;
  // const limit = 100;
  // const current = await ctx.redis.incr(key);
  // if (current > limit) {
  //   await ctx.redis.expire(key, 3600); // Set expiry for an hour
  //   throw new TRPCError({ code: 'TOO_MANY_REQUESTS' });
  // }

  // if (current === 1) {
  //   await ctx.redis.expire(key, 3600); // Set expiry for an hour if this is the first request
  // }

  return next();
});

export const publicProcedure = t.procedure;
export const authenticatedProcedure = publicProcedure.use(isAuthenticated);
export const rateLimitedAuthenticatedProcedure = authenticatedProcedure.use(
  rateLimitedAuthenticated
);

export const router = t.router;

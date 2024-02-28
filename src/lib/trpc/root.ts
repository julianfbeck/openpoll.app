import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

import type { Context } from './context';
import { db } from '@/utils/db';

export const t = initTRPC.context<Context>().create();

export const middleware = t.middleware;

const isAuthenticated = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user
    }
  });
});

export const publicProcedure = t.procedure;
export const authenticatedProcedure = publicProcedure.use(isAuthenticated);

export const router = t.router;

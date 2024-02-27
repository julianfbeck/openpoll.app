import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

import type { Context } from './context';
import { db } from '@/utils/db';

export const t = initTRPC.context<Context>().create();

export const middleware = t.middleware;
export const publicProcedure = t.procedure;
const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.user
    }
  });
});
export const adminProcedure = publicProcedure.use(isAdmin);

export const appRouter = t.router({
  // Example of a public procedure
  getCommentProcedure: publicProcedure
    .query(async ({ input }) => {
      return await db.query.polls.findMany();
    })
});

export type AppRouter = typeof appRouter;

import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

import type { Context } from './context';
import { db } from '@/utils/db';

export const t = initTRPC.context<Context>().create();

export const middleware = t.middleware;
export const publicProcedure = t.procedure;

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
export const authenticatedUser = publicProcedure.use(isAuthenticated);

export const optionsRouter = t.router({
  greeting: publicProcedure.query(() => 'hello tRPC v10!')
});

export const appRouter = t.router({
  // Example of a public procedure
  getCommentProcedure: authenticatedUser.query(async ({ input, ctx }) => {
    console.log(ctx.user);
    return await db.query.polls.findMany();
  }),
  poll: t.router({
    greeting: publicProcedure.query(() => 'hello tRPC v10!')
  }),
  options: optionsRouter
});
export type AppRouter = typeof appRouter;

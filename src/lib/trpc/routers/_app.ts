import { z } from 'zod';

import { publicProcedure, router, t } from '../root';
import { pollRouter } from './poll';
import { viewRouter } from './view';

export const appRouter = router({
  poll: pollRouter,
  view: viewRouter
});

// You can then access the merged route with
// http://localhost:3000/trpc/<NAMESPACE>.<PROCEDURE>

export type AppRouter = typeof appRouter;
export const createCaller = t.createCallerFactory(appRouter);
import { router, t } from '../root';
import { pollRouter } from './poll';
import { viewRouter } from './view';
import { apiKeyRouter } from './api-key';

export const appRouter = router({
  poll: pollRouter,
  view: viewRouter,
  api: apiKeyRouter
});

export type AppRouter = typeof appRouter;
export const createCaller = t.createCallerFactory(appRouter);

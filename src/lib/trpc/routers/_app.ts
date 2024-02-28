import { z } from 'zod';

import { publicProcedure, router } from '../root';
import { userRouter } from './user';

export const appRouter = router({
  user: userRouter,
  greeting: publicProcedure.query(() => 'hello tRPC v10!')
});

// You can then access the merged route with
// http://localhost:3000/trpc/<NAMESPACE>.<PROCEDURE>

export type AppRouter = typeof appRouter;

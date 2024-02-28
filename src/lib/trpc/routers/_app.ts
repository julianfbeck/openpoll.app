import { z } from 'zod';

import { publicProcedure, router } from '../root';
import { pollRouter } from './poll';

export const appRouter = router({
  poll: pollRouter
});

// You can then access the merged route with
// http://localhost:3000/trpc/<NAMESPACE>.<PROCEDURE>

export type AppRouter = typeof appRouter;

import { z } from 'zod';
import { publicProcedure, router } from '../root';

export const userRouter = router({
  greeting: publicProcedure.query(() => 'hello tRPC v10!')
});

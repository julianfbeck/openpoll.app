import { authenticatedProcedure, router } from '../root';
import { polls, users } from '@/models/schema';
import { db } from '@/utils/db';
import { eq, sql } from 'drizzle-orm';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';

export const apiKeyRouter = router({
  get: authenticatedProcedure.query(async ({ input, ctx }) => {
    const apiKey = await db.transaction(async (tx) => {
      if (!ctx.user) {
        return null;
      }
      const userID = ctx.user.user!.id;
      const user = await tx.query.users.findFirst({
        where: eq(users.id, userID)
      });
      return user?.api_key ?? '';
    });
    return { apiKey };
  }),
  rotate: authenticatedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      return;
    }
    const userID = ctx.user.user!.id;
    await db
      .update(users)
      .set({ api_key: `op_${nanoid(15)}` })
      .where(eq(users.id, userID));
  })
});

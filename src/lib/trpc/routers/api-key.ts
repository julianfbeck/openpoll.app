import { authenticatedProcedure, router } from '../root';
import { db, user } from '@/utils/db';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export const apiKeyRouter = router({
  get: authenticatedProcedure.query(async ({ input, ctx }) => {
    const apiKey = await db.transaction(async (tx) => {
      if (!ctx.user) {
        return null;
      }
      const userID = ctx.user.id;
      const foundUser = await tx.query.user.findFirst({
        where: eq(user.id, userID)
      });
      return foundUser?.api_key ?? '';
    });
    return { apiKey };
  }),
  rotate: authenticatedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      return;
    }
    const userID = ctx.user.id;
    await db
      .update(user)
      .set({ api_key: `op_${nanoid(15)}` })
      .where(eq(user.id, userID));
  })
});

import { z } from 'zod';
import { publicProcedure, router } from '../root';
import { polls } from '@/models/schema';
import { db } from '@/utils/db';
import { eq, sql } from 'drizzle-orm';

export const viewRouter = router({
  view: publicProcedure.input(z.string()).mutation(async ({ input }) => {
    await db.transaction(async (tx) => {
      const poll = await tx.query.polls.findFirst({
        where: eq(polls.shortId, input)
      });
      await tx
        .update(polls)
        .set({
          views: sql`${poll!.views} + 1`
        })
        .where(eq(polls.id, poll!.id));
    });
    return { shortId: input };
  })
});

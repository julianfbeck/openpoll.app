import { z } from 'zod';
import { authenticatedProcedure, publicProcedure, router } from '../root';
import { pollOptions, polls } from '@/models/schema';
import { db } from '@/utils/db';
import type { PollOptionCreate } from '@/models/types';
import { eq, sql } from 'drizzle-orm';
import PollEmitter from '@/lib/PollEmitter';

export const viewRouter = router({
  view: publicProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const shortId = await db.transaction(async (tx) => {
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
    return shortId;
  })
});

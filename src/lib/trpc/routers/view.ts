import { z } from 'zod';
import { publicProcedure, router } from '../root';
import { polls } from '@/models/schema';
import { db } from '@/utils/db';
import { eq, sql } from 'drizzle-orm';
import Redis from 'ioredis';

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
    // trigger event emitter
    const redis = new Redis();
    await redis.publish(`update:${input}`, JSON.stringify({ update: true }));
  })
});

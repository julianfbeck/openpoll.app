import { z } from 'zod';
import { publicProcedure, router } from '../root';
import { polls } from '@/models/schema';
import { db } from '@/utils/db';
import { eq, sql } from 'drizzle-orm';

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
    // trigger event emitter via Durable Object
    if (ctx.env?.POLL_HUB) {
      const id = ctx.env.POLL_HUB.idFromName(input);
      const pollHub = ctx.env.POLL_HUB.get(id);
      await pollHub.fetch(new Request('https://dummy.com/broadcast'));
    }
    return { shortId };
  })
});

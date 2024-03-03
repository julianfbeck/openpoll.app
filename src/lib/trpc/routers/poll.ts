import { z } from 'zod';
import { authenticatedProcedure, publicProcedure, router } from '../root';
import { pollOptions, polls } from '@/models/schema';
import { db } from '@/utils/db';
import type { PollOptionCreate } from '@/models/types';
import { eq, sql } from 'drizzle-orm';
import PollEmitter from '@/lib/PollEmitter';

export const pollRouter = router({
  create: authenticatedProcedure
    .input(
      z.object({
        question: z.string().min(1).max(200),
        options: z.array(z.string().min(1).max(200))
      })
    )
    .mutation(async ({ input, ctx }) => {
      const shortId = await db.transaction(async (tx) => {
        const poll = await tx.insert(polls).values({
          question: input.question,
          creatorId: ctx.user.user!.id
        });

        const options = input.options.map((option) => ({
          pollId: poll.lastInsertRowid,
          option,
          votes: 0
        })) as PollOptionCreate[];

        await tx.insert(pollOptions).values(options);
        const fullPoll = await db.query.polls.findFirst({
          where: eq(polls.id, Number(poll.lastInsertRowid)),
          with: { options: true }
        });
        return fullPoll?.shortId;
      });
      return shortId;
    }),

  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    const poll = await db.query.polls.findFirst({
      where: eq(polls.shortId, input),
      with: { options: true }
    });
    return poll;
  }),

  vote: publicProcedure
    .input(
      z.object({
        shortId: z.string(),
        optionIds: z.array(z.number().min(1).max(200))
      })
    )
    .mutation(async ({ input }) => {
      await db.transaction(async (tx) => {
        const poll = await tx.query.polls.findFirst({
          where: eq(polls.shortId, input.shortId)
        });
        if (!poll) {
          throw new Error('Poll not found');
        }

        for (const optionId of input.optionIds) {
          const response = await tx
            .update(pollOptions)
            .set({
              votes: sql`${pollOptions.votes} + 1`
            })
            .where(eq(pollOptions.id, Number(optionId)));
        }

        // trigger event emitter
        PollEmitter.getInstance().notifyRoom(poll.shortId);
      });
    })
});

import { z } from 'zod';
import {
  authenticatedProcedure,
  publicProcedure,
  rateLimitedAuthenticatedProcedure,
  router
} from '../root';
import { pollOptions, polls } from '@/models/schema';
import { db } from '@/utils/db';
import type { PollOptionCreate } from '@/models/types';
import { eq, sql } from 'drizzle-orm';

export const pollRouter = router({
  create: rateLimitedAuthenticatedProcedure
    .input(
      z.object({
        eventName: z.string().min(1).max(200),
        question: z.string().min(1).max(200),
        options: z.array(z.string().min(1).max(500)).min(2).max(200)
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lastInsertRowid = await db.transaction(async (tx) => {
        const poll = await tx.insert(polls).values({
          event: input.eventName,
          question: input.question,
          creatorId: ctx.user.user!.id
        });

        const lastInsertRowid = Number(poll.lastInsertRowid);
        const options = input.options.map((option) => ({
          pollId: Number(poll.lastInsertRowid),
          option,
          votes: 0
        })) as PollOptionCreate[];

        await tx.insert(pollOptions).values(options);
        return lastInsertRowid;
      });

      const fullPoll = await db.query.polls.findFirst({
        where: eq(polls.id, lastInsertRowid),
        with: { options: true }
      });
      return fullPoll!.shortId;
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
        optionIds: z.array(z.number())
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
        const poll = await tx.query.polls.findFirst({
          where: eq(polls.shortId, input.shortId)
        });
        if (!poll) {
          throw new Error('Poll not found');
        }

        for (const optionId of input.optionIds) {
          await tx
            .update(pollOptions)
            .set({
              votes: sql`${pollOptions.votes} + 1`
            })
            .where(eq(pollOptions.id, Number(optionId)));
        }

        await tx.update(polls).set({
          votes: sql`${polls.votes} + 1`
        });

        // trigger event emitter
        ctx.redis.publish(
          `update:${input.shortId}`,
          JSON.stringify({ update: true })
        );
      });
    }),
  selectCurrentPollOption: authenticatedProcedure
    .input(
      z.object({
        shortId: z.string(),
        optionId: z.number()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const poll = await db.query.polls.findFirst({
        where: eq(polls.shortId, input.shortId)
      });

      if (!poll) {
        throw new Error('Poll not found');
      }

      if (poll.creatorId !== ctx.user.user!.id) {
        throw new Error('You are not the creator of this poll');
      }

      await db
        .update(polls)
        .set({
          selectedPollOptionId: input.optionId
        })
        .where(eq(polls.id, poll.id));

      ctx.redis.publish(
        `update:${input.shortId}`,
        JSON.stringify({ update: true })
      );
    }),

  deletePollOption: authenticatedProcedure
    .input(
      z.object({
        shortId: z.string(),
        optionId: z.number()
      })
    )
    .mutation(async ({ input, ctx }) => {
      const poll = await db.query.polls.findFirst({
        where: eq(polls.shortId, input.shortId)
      });

      if (!poll) {
        throw new Error('Poll not found');
      }

      if (poll.creatorId !== ctx.user.user!.id) {
        throw new Error('You are not the creator of this poll');
      }

      await db.delete(pollOptions).where(eq(pollOptions.id, input.optionId));
      ctx.redis.publish(
        `update:${input.shortId}`,
        JSON.stringify({ update: true })
      );
    }),

  editPollOption: authenticatedProcedure
    .input(
      z.object({
        shortId: z.string(),
        optionId: z.number(),
        optionText: z.string().min(1).max(200)
      })
    )
    .mutation(async ({ input, ctx }) => {
      const poll = await db.query.polls.findFirst({
        where: eq(polls.shortId, input.shortId)
      });

      if (!poll) {
        throw new Error('Poll not found');
      }

      if (poll.creatorId !== ctx.user.user!.id) {
        throw new Error('You are not the creator of this poll');
      }

      await db
        .update(pollOptions)
        .set({
          option: input.optionText
        })
        .where(eq(pollOptions.id, input.optionId));
      ctx.redis.publish(
        `update:${input.shortId}`,
        JSON.stringify({ update: true })
      );
    })
});

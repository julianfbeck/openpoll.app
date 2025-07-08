import { z } from 'zod';
import {
  authenticatedProcedure,
  publicProcedure,
  router
} from '../root';
import { pollOptions, polls } from '@/models/schema';
import { db } from '@/utils/db';
import type { PollOptionCreate } from '@/models/types';
import { eq, sql } from 'drizzle-orm';

export const pollRouter = router({
  create: authenticatedProcedure
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
          creatorId: ctx.user.id
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
      });

      // Broadcast update to Durable Object
      if (ctx.env?.POLL_HUB) {
        const id = ctx.env.POLL_HUB.idFromName(input.shortId);
        const pollHub = ctx.env.POLL_HUB.get(id);
        await pollHub.fetch(new Request('https://dummy.com/broadcast'));
      }
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

      if (poll.creatorId !== ctx.user.id) {
        throw new Error('You are not the creator of this poll');
      }

      await db
        .update(polls)
        .set({
          selectedPollOptionId: input.optionId
        })
        .where(eq(polls.id, poll.id));

      // Broadcast update to Durable Object
      if (ctx.env?.POLL_HUB) {
        const id = ctx.env.POLL_HUB.idFromName(input.shortId);
        const pollHub = ctx.env.POLL_HUB.get(id);
        await pollHub.fetch(new Request('https://dummy.com/broadcast'));
      }
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

      if (poll.creatorId !== ctx.user.id) {
        throw new Error('You are not the creator of this poll');
      }

      await db.delete(pollOptions).where(eq(pollOptions.id, input.optionId));

      // Broadcast update to Durable Object
      if (ctx.env?.POLL_HUB) {
        const id = ctx.env.POLL_HUB.idFromName(input.shortId);
        const pollHub = ctx.env.POLL_HUB.get(id);
        await pollHub.fetch(new Request('https://dummy.com/broadcast'));
      }
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

      if (poll.creatorId !== ctx.user.id) {
        throw new Error('You are not the creator of this poll');
      }

      await db
        .update(pollOptions)
        .set({
          option: input.optionText
        })
        .where(eq(pollOptions.id, input.optionId));

      // Broadcast update to Durable Object
      if (ctx.env?.POLL_HUB) {
        const id = ctx.env.POLL_HUB.idFromName(input.shortId);
        const pollHub = ctx.env.POLL_HUB.get(id);
        await pollHub.fetch(new Request('https://dummy.com/broadcast'));
      }
    })
});

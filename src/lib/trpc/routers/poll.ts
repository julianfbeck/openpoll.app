import { z } from 'zod';
import {
  authenticatedProcedure,
  publicProcedure,
  router
} from '../root';
import { pollOptions, polls } from '@/models/schema';
import { db } from '@/utils/db';
import type { PollOptionCreate } from '@/models/types';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

const pollReferenceInput = z.object({
  shortId: z.string().min(1),
  optionId: z.number().int().positive()
});

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
        shortId: z.string().min(1),
        optionIds: z.array(z.number().int().positive()).min(1)
      })
    )
    .mutation(async ({ input, ctx }) => {
      const uniqueOptionIds = [...new Set(input.optionIds)];

      await db.transaction(async (tx) => {
        const poll = await tx.query.polls.findFirst({
          where: eq(polls.shortId, input.shortId)
        });

        if (!poll) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Abstimmung nicht gefunden.'
          });
        }

        if (poll.isLocked) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Diese Abstimmung ist geschlossen.'
          });
        }

        const validOptions = await tx
          .select({ id: pollOptions.id })
          .from(pollOptions)
          .where(
            and(
              eq(pollOptions.pollId, poll.id),
              inArray(pollOptions.id, uniqueOptionIds)
            )
          );

        if (validOptions.length !== uniqueOptionIds.length) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Eine oder mehrere Antwortoptionen sind ungültig.'
          });
        }

        await tx
          .update(pollOptions)
          .set({
            votes: sql`${pollOptions.votes} + 1`
          })
          .where(
            and(
              eq(pollOptions.pollId, poll.id),
              inArray(pollOptions.id, uniqueOptionIds)
            )
          );

        // polls.votes counts submitted ballots, not selected options. A request
        // with multiple valid options therefore increments this value once.
        await tx
          .update(polls)
          .set({
            votes: sql`${polls.votes} + 1`
          })
          .where(eq(polls.id, poll.id));
      });

      // Broadcast update to Durable Object
      if (ctx.env?.POLL_HUB) {
        const id = ctx.env.POLL_HUB.idFromName(input.shortId);
        const pollHub = ctx.env.POLL_HUB.get(id);
        await pollHub.fetch(new Request('https://dummy.com/broadcast'));
      }

      return { success: true };
    }),
  selectCurrentPollOption: authenticatedProcedure
    .input(pollReferenceInput)
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
        const poll = await tx.query.polls.findFirst({
          where: eq(polls.shortId, input.shortId)
        });

        if (!poll) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Abstimmung nicht gefunden.'
          });
        }

        if (poll.creatorId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Du bist nicht Eigentümer dieser Abstimmung.'
          });
        }

        const option = await tx.query.pollOptions.findFirst({
          where: and(
            eq(pollOptions.id, input.optionId),
            eq(pollOptions.pollId, poll.id)
          )
        });

        if (!option) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Die Antwortoption gehört nicht zu dieser Abstimmung.'
          });
        }

        await tx
          .update(polls)
          .set({
            selectedPollOptionId: input.optionId
          })
          .where(eq(polls.id, poll.id));
      });

      // Broadcast update to Durable Object
      if (ctx.env?.POLL_HUB) {
        const id = ctx.env.POLL_HUB.idFromName(input.shortId);
        const pollHub = ctx.env.POLL_HUB.get(id);
        await pollHub.fetch(new Request('https://dummy.com/broadcast'));
      }
    }),

  deletePollOption: authenticatedProcedure
    .input(pollReferenceInput)
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
        const poll = await tx.query.polls.findFirst({
          where: eq(polls.shortId, input.shortId)
        });

        if (!poll) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Abstimmung nicht gefunden.'
          });
        }

        if (poll.creatorId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Du bist nicht Eigentümer dieser Abstimmung.'
          });
        }

        const deleted = await tx
          .delete(pollOptions)
          .where(
            and(
              eq(pollOptions.id, input.optionId),
              eq(pollOptions.pollId, poll.id)
            )
          )
          .returning({ id: pollOptions.id });

        if (deleted.length !== 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Die Antwortoption gehört nicht zu dieser Abstimmung.'
          });
        }
      });

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
        shortId: z.string().min(1),
        optionId: z.number().int().positive(),
        optionText: z.string().min(1).max(200)
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
        const poll = await tx.query.polls.findFirst({
          where: eq(polls.shortId, input.shortId)
        });

        if (!poll) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Abstimmung nicht gefunden.'
          });
        }

        if (poll.creatorId !== ctx.user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Du bist nicht Eigentümer dieser Abstimmung.'
          });
        }

        const updated = await tx
          .update(pollOptions)
          .set({
            option: input.optionText
          })
          .where(
            and(
              eq(pollOptions.id, input.optionId),
              eq(pollOptions.pollId, poll.id)
            )
          )
          .returning({ id: pollOptions.id });

        if (updated.length !== 1) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Die Antwortoption gehört nicht zu dieser Abstimmung.'
          });
        }
      });

      // Broadcast update to Durable Object
      if (ctx.env?.POLL_HUB) {
        const id = ctx.env.POLL_HUB.idFromName(input.shortId);
        const pollHub = ctx.env.POLL_HUB.get(id);
        await pollHub.fetch(new Request('https://dummy.com/broadcast'));
      }
    })
});

import { z } from 'zod';
import { authenticatedProcedure, publicProcedure, router } from '../root';
import { pollOptions, polls } from '@/models/schema';
import { db } from '@/utils/db';
import type { PollOptionCreate } from '@/models/types';
import { eq } from 'drizzle-orm';

export const pollRouter = router({
  create: authenticatedProcedure
    .input(
      z.object({
        question: z.string().min(1).max(200),
        options: z.array(z.string().min(1).max(200))
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.transaction(async (tx) => {
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
        return fullPoll;
      });
    })
});
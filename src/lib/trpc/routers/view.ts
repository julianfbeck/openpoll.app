import { z } from 'zod';
import { publicProcedure, router } from '../root';
import { polls, votingTraffic } from '@/models/schema';
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
    ctx.redis.publish(`update:${input}`, JSON.stringify({ update: true }));
    return { shortId };
  }),
  vote: publicProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const shortId = await db.transaction(async (tx) => {
      const poll = await tx.query.polls.findFirst({
        where: eq(polls.shortId, input)
      });
      await tx.insert(votingTraffic).values({
        pollId: poll!.id
      });
    });
    // trigger event emitter
    ctx.redis.publish(`update:${input}`, JSON.stringify({ update: true }));
    return { shortId };
  }),
  getVoteTraffic: publicProcedure.input(z.string()).query(async ({ input }) => {
    const poll = await db.query.polls.findFirst({
      where: eq(polls.shortId, input)
    });

    const votes = await db.query.votingTraffic.findMany({
      where: eq(votingTraffic.pollId, poll!.id)
    });
    const sortedVotes = votes.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    type ChartData = {
      date: string;
      votes: number;
    };
    const chartData: ChartData[] = [];
    let cumulativeVotes = 0;

    sortedVotes.forEach((vote) => {
      cumulativeVotes++;
      chartData.push({
        date: formatDate(new Date(vote.timestamp)),
        votes: cumulativeVotes
      });
    });
    

    console.log(chartData);
    return chartData;
  })
});

function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

import { redisClient } from '@/lib/redis';
import { pollOptions, polls, user } from '@/models/schema';
import type { PollOptionCreate } from '@/models/types';
import { db } from '@/utils/db';
import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const createInput = z.object({
  name: z.string().min(1).max(200),
  question: z.string().min(1).max(200),
  options: z.array(z.string().min(1).max(500)).min(2).max(200)
});

export type CreateInput = z.infer<typeof createInput>;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get auth header from request
    const authHeader = request.headers.get('Authorization');
    const auth =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;

    if (!auth) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Rate limit using redis
    const limit = 10;
    const key = `rate-limit-api:${auth}`;
    const current = await redisClient.incr(key);

    if (current > limit) {
      await redisClient.expire(key, 3600);
      return new Response('Too many requests', { status: 429 });
    }

    if (current === 1) {
      await redisClient.expire(key, 3600);
    }

    const body = await request.json();
    const input = createInput.parse(body);

    return await db.transaction(async (tx) => {
      const u = await tx.query.user.findFirst({
        where: eq(user.api_key, auth)
      });

      if (!u) {
        return new Response('Unauthorized', { status: 401 });
      }

      // Insert poll first
      const [newPoll] = await tx
        .insert(polls)
        .values({
          event: input.name,
          question: input.question,
          creatorId: u.id
        })
        .returning({
          id: polls.id,
          shortId: polls.shortId
        });

      if (!newPoll) {
        return new Response('Failed to create poll', { status: 500 });
      }

      // Insert options
      const options = input.options.map((option) => ({
        pollId: newPoll.id,
        option,
        votes: 0
      })) as PollOptionCreate[];

      await tx.insert(pollOptions).values(options);

      // Fetch the complete poll with options
      const fullPoll = await tx.query.polls.findFirst({
        where: eq(polls.id, newPoll.id),
        with: {
          options: true
        }
      });

      if (!fullPoll) {
        return new Response('Failed to fetch created poll', { status: 500 });
      }

      const fullPollWithUrl = {
        ...fullPoll,
        url: `https://openpoll.app/${fullPoll.shortId}`,
        api_url: `https://openpoll.app/api/poll/${fullPoll.shortId}`
      };

      return new Response(JSON.stringify(fullPollWithUrl), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    return new Response(JSON.stringify({ error: 'Failed to create poll' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
